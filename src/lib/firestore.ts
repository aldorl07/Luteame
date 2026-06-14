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
