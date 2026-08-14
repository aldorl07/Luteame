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
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product, UserProfile, Setup, ProductCategory } from "@/types";

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

// ─── Setups ───────────────────────────────────────────────────────────────────

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
  // 1. Seed products
  for (const product of products) {
    await addDoc(collection(db, "productos"), {
      ...product,
      fechaCreacion: serverTimestamp(),
    });
  }

  // 2. Seed mock warranty build (remove LUTE- prefix just in case)
  const cleanId = mockBuild.id.replace("LUTE-", "");
  await setDoc(doc(db, "equipos_ensamblados", cleanId), {
    clienteNombre: mockBuild.clienteNombre,
    fechaEnsamblaje: serverTimestamp(),
    garantiaVencimiento: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years warranty
    componentes: mockBuild.componentes,
  });
}


