/// <reference types="node" />
/**
 * scripts/clear-test-data.ts
 *
 * Clears test orders, tickets, and leads from Firestore.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

async function clearCollection(name: string) {
  const snapshot = await getDocs(collection(db, name));
  if (snapshot.empty) {
    console.log(`ℹ️ La colección "${name}" ya está vacía.`);
    return 0;
  }
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  console.log(`✅ Colección "${name}": eliminados ${snapshot.size} documentos.`);
  return snapshot.size;
}

async function main() {
  console.log("🧹 Limpiando datos de prueba en Firestore...\n");

  const email = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  if (email && password) {
    try {
      console.log(`🔑 Autenticando con usuario administrador (${email})...`);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Autenticado correctamente.");
    } catch (authErr: any) {
      console.warn("⚠️ No se pudo autenticar con credenciales admin:", authErr.message);
    }
  } else {
    try {
      await signInAnonymously(auth);
    } catch {
      // ignore
    }
  }

  try {
    await clearCollection("pedidos");
    await clearCollection("tickets_soporte");
    await clearCollection("cotizaciones");
    console.log("\n✨ ¡Limpieza completada con éxito!");
    process.exit(0);
  } catch (err: any) {
    console.error("\n❌ Error al limpiar datos:", err.message || err);
    if (err.code === "permission-denied" || err.message?.includes("permission")) {
      console.error("🔒 RECUERDA: Debes publicar las reglas de 'firestore.rules' en tu Consola de Firebase para habilitar el borrado.");
    }
    process.exit(1);
  }
}

main();
