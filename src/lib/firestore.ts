// src/lib/firestore.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  QueryConstraint,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, UserProfile, Setup, ProductCategory, Lead, LeadStatus, FollowUpRecord } from "@/types";

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  data: { nombre: string; correo: string }
): Promise<void> {
  await setDoc(doc(db, "usuarios", uid), {
    nombre:         data.nombre,
    correo:         data.correo,
    rol:            "cliente",
    fechaRegistro:  serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "usuarios", uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function subscribeToProducts(
  filters: { categories: ProductCategory[]; maxPrice?: number },
  callback: (products: Product[]) => void
): Unsubscribe {
  const constraints: QueryConstraint[] = [];

  if (filters.categories.length > 0) {
    constraints.push(where("categoria", "in", filters.categories));
  }

  const q = query(collection(db, "productos"), ...constraints);

  return onSnapshot(q, (snapshot) => {
    let products = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Product[];

    // Client-side price filter (Firestore can't do range + in simultaneously without composite index)
    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => p.precio <= filters.maxPrice!);
    }

    callback(products);
  });
}

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "productos"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
}

export async function getProductsByCategory(
  category: ProductCategory
): Promise<Product[]> {
  const q = query(
    collection(db, "productos"),
    where("categoria", "==", category)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
}

export function subscribeToProductsByCategory(
  category: ProductCategory,
  callback: (products: Product[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "productos"),
    where("categoria", "==", category)
  );
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Product[];
    callback(products);
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  const ref = doc(db, "productos", productId);
  const batch = writeBatch(db);
  batch.delete(ref);
  await batch.commit();
}

export async function clearAllProducts(): Promise<number> {
  const snapshot = await getDocs(collection(db, "productos"));
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });

  await batch.commit();
  return snapshot.size;
}

export async function saveSetup(
  setup: Omit<Setup, "id" | "fechaCreacion">
): Promise<string> {
  const ref = await addDoc(collection(db, "setups_guardados"), {
    ...setup,
    fechaCreacion: serverTimestamp(),
  });
  return ref.id;
}

export async function getSetupsByUser(uid: string): Promise<Setup[]> {
  const q = query(
    collection(db, "setups_guardados"),
    where("usuarioId", "==", uid),
    orderBy("fechaCreacion", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Setup[];
}

// ─── Tickets de Soporte ────────────────────────────────────────────────────────

export async function createSupportTicket(ticket: {
  clienteId: string;
  clienteEmail: string;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
}): Promise<string> {
  const ref = await addDoc(collection(db, "tickets_soporte"), {
    ...ticket,
    estado: "abierto",
    fechaCreacion: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToTicketsByUser(
  uid: string,
  callback: (tickets: any[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "tickets_soporte"),
    where("clienteId", "==", uid),
    orderBy("fechaCreacion", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(tickets);
  });
}

// ─── Garantías y Equipos Ensamblados ──────────────────────────────────────────

export async function getBuildDetails(buildId: string): Promise<any | null> {
  const snap = await getDoc(doc(db, "equipos_ensamblados", buildId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ─── Orders / Pedidos ──────────────────────────────────────────────────────────

export function subscribeToAllOrders(callback: (orders: any[]) => void): Unsubscribe {
  const q = query(collection(db, "pedidos"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as any[];
    // Sort client-side to avoid index requirements on new DBs
    orders.sort((a, b) => {
      const dateA = a.fecha?.seconds || 0;
      const dateB = b.fecha?.seconds || 0;
      return dateB - dateA;
    });
    callback(orders);
  });
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const ref = doc(db, "pedidos", orderId);
  await setDoc(ref, { estado: status }, { merge: true });
}

export async function deleteOrder(orderId: string): Promise<void> {
  const ref = doc(db, "pedidos", orderId);
  const batch = writeBatch(db);
  batch.delete(ref);
  await batch.commit();
}

export async function clearAllOrders(): Promise<number> {
  const snapshot = await getDocs(collection(db, "pedidos"));
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });

  await batch.commit();
  return snapshot.size;
}

export async function clearAllTickets(): Promise<number> {
  const snapshot = await getDocs(collection(db, "tickets_soporte"));
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });

  await batch.commit();
  return snapshot.size;
}

export async function clearAllLeads(): Promise<number> {
  const snapshot = await getDocs(collection(db, "leads"));
  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });

  await batch.commit();
  return snapshot.size;
}

// ─── Support Tickets (All) ───────────────────────────────────────────────────

export function subscribeToAllTickets(callback: (tickets: any[]) => void): Unsubscribe {
  const q = query(collection(db, "tickets_soporte"));
  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as any[];
    // Sort client-side
    tickets.sort((a, b) => {
      const dateA = a.fechaCreacion?.seconds || 0;
      const dateB = b.fechaCreacion?.seconds || 0;
      return dateB - dateA;
    });
    callback(tickets);
  });
}

export async function resolveTicket(
  ticketId: string,
  data: { solucion?: string; observaciones?: string; estado: string }
): Promise<void> {
  const ref = doc(db, "tickets_soporte", ticketId);
  await setDoc(ref, data, { merge: true });
}

// ─── Seed Database ───────────────────────────────────────────────────────────

export async function seedDatabase(products: any[], mockBuild: any): Promise<void> {
  const batch = writeBatch(db);

  // 1. Añadir todos los productos al lote atómico
  for (const product of products) {
    const productRef = doc(collection(db, "productos"));
    batch.set(productRef, {
      ...product,
      fechaCreacion: serverTimestamp(),
    });
  }

  // 2. Añadir equipo de garantía al lote atómico
  const cleanId = mockBuild.id.replace("LUTE-", "");
  const warrantyRef = doc(db, "equipos_ensamblados", cleanId);
  batch.set(warrantyRef, {
    clienteNombre: mockBuild.clienteNombre,
    fechaEnsamblaje: serverTimestamp(),
    garantiaVencimiento: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 años de garantía
    componentes: mockBuild.componentes,
  });

  // Ejecutar todos los registros en una sola llamada atómica
  await batch.commit();
}

// ─── CRM & Leads / Pipeline de Ventas ─────────────────────────────────────────

export async function createLead(
  leadData: Omit<Lead, "id" | "fechaCreacion" | "fechaActualizacion" | "intentosSeguimiento" | "historialSeguimiento">
): Promise<string> {
  const ref = await addDoc(collection(db, "leads"), {
    ...leadData,
    intentosSeguimiento: 0,
    historialSeguimiento: [],
    notasInternas: leadData.notasInternas || [],
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToAllLeads(callback: (leads: Lead[]) => void): Unsubscribe {
  const q = query(collection(db, "leads"));
  return onSnapshot(q, (snapshot) => {
    const leads = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Lead[];

    // Sort descending by creation date or update date
    leads.sort((a, b) => {
      const dateA = a.fechaCreacion?.seconds || (a.fechaCreacion ? new Date(a.fechaCreacion).getTime() / 1000 : 0);
      const dateB = b.fechaCreacion?.seconds || (b.fechaCreacion ? new Date(b.fechaCreacion).getTime() / 1000 : 0);
      return dateB - dateA;
    });

    callback(leads);
  });
}

export async function getLeadById(leadId: string): Promise<Lead | null> {
  const snap = await getDoc(doc(db, "leads", leadId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Lead;
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  proximoSeguimiento?: string
): Promise<void> {
  const ref = doc(db, "leads", leadId);
  const updateData: any = {
    estado: status,
    fechaActualizacion: serverTimestamp(),
  };
  if (proximoSeguimiento !== undefined) {
    updateData.proximoSeguimiento = proximoSeguimiento;
  }
  await setDoc(ref, updateData, { merge: true });
}

export async function registerFollowUpAction(
  leadId: string,
  record: Omit<FollowUpRecord, "id">,
  nuevoEstado?: LeadStatus,
  proximoSeguimiento?: string
): Promise<void> {
  const leadSnap = await getDoc(doc(db, "leads", leadId));
  if (!leadSnap.exists()) return;

  const lead = leadSnap.data() as Lead;
  const newFollowUp: FollowUpRecord = {
    id: `fu_${Date.now()}`,
    ...record,
  };

  const updatedHistorial = [...(lead.historialSeguimiento || []), newFollowUp];
  const updatePayload: any = {
    historialSeguimiento: updatedHistorial,
    intentosSeguimiento: (lead.intentosSeguimiento || 0) + 1,
    ultimoContacto: new Date().toISOString(),
    fechaActualizacion: serverTimestamp(),
  };

  if (nuevoEstado) {
    updatePayload.estado = nuevoEstado;
  }
  if (proximoSeguimiento !== undefined) {
    updatePayload.proximoSeguimiento = proximoSeguimiento;
  }

  await setDoc(doc(db, "leads", leadId), updatePayload, { merge: true });
}

export async function addLeadInternalNote(
  leadId: string,
  noteText: string,
  author: string
): Promise<void> {
  const leadSnap = await getDoc(doc(db, "leads", leadId));
  if (!leadSnap.exists()) return;

  const lead = leadSnap.data() as Lead;
  const currentNotes = lead.notasInternas || [];
  const timestampStr = new Date().toLocaleString("es-PE");
  const formattedNote = `[${timestampStr} - ${author}] ${noteText}`;

  await setDoc(
    doc(db, "leads", leadId),
    {
      notasInternas: [formattedNote, ...currentNotes],
      fechaActualizacion: serverTimestamp(),
    },
    { merge: true }
  );
}
