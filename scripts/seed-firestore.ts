/// <reference types="node" />
/**
 * scripts/seed-firestore.ts
 *
 * Seeds the Firestore database with sample products and an admin user.
 * Run with:
 *   npx ts-node --project scripts/tsconfig.json scripts/seed-firestore.ts
 *
 * Requires NEXT_PUBLIC_FIREBASE_* vars in .env.local
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const SAMPLE_PRODUCTS = [
  // ── Escritorios ──────────────────────────────────────────────────────────
  {
    nombre:       "Luteame Pro Desk — Nogal",
    categoria:    "escritorios",
    precio:       850,
    stock:        10,
    imagenUrl:    "https://lh3.googleusercontent.com/aida-public/AB6AXuDULw5k46kW3EQt1QbKlkKdrQehZQsHqAb-sqYBrk-xZ3aOWG_1Y5bnCp6xeJcdCPBEGWi51HntOReKsXYi2bcJyPNmPIGmvLw970_wjDAha_CCerXuYa0Uy7mlCK29h4C43eimfuDCfhPHt-kPSUv5EtGk841Qtk9VFD-nbpG09oUekKFMUn9VAOqIAYN7yMi97PM2vnzdTbpyEa-pEFwtILBqXOenIl06jhiDJ9dPhAg_qWFHO2Gi39Db9P4-zFxsBXy_LYu1n-zv",
    garantiaLocal: true,
    especificaciones: { dimensiones: "160x80cm", madera: "Nogal", acabado: "Matte" },
    rating: 4.8,
    ratingCount: 120,
  },
  {
    nombre:       "Luteame Cyber Base — Metal/Vidrio",
    categoria:    "escritorios",
    precio:       1200,
    stock:        5,
    imagenUrl:    "https://lh3.googleusercontent.com/aida-public/AB6AXuDULw5k46kW3EQt1QbKlkKdrQehZQsHqAb-sqYBrk-xZ3aOWG_1Y5bnCp6xeJcdCPBEGWi51HntOReKsXYi2bcJyPNmPIGmvLw970_wjDAha_CCerXuYa0Uy7mlCK29h4C43eimfuDCfhPHt-kPSUv5EtGk841Qtk9VFD-nbpG09oUekKFMUn9VAOqIAYN7yMi97PM2vnzdTbpyEa-pEFwtILBqXOenIl06jhiDJ9dPhAg_qWFHO2Gi39Db9P4-zFxsBXy_LYu1n-zv",
    garantiaLocal: true,
    especificaciones: { dimensiones: "140x70cm", material: "Metal/Vidrio", perfil: "L-Shape" },
    rating: 4.9,
    ratingCount: 85,
  },
  {
    nombre:       "Compact Studio — Pino",
    categoria:    "escritorios",
    precio:       450,
    stock:        15,
    imagenUrl:    "https://lh3.googleusercontent.com/aida-public/AB6AXuDULw5k46kW3EQt1QbKlkKdrQehZQsHqAb-sqYBrk-xZ3aOWG_1Y5bnCp6xeJcdCPBEGWi51HntOReKsXYi2bcJyPNmPIGmvLw970_wjDAha_CCerXuYa0Uy7mlCK29h4C43eimfuDCfhPHt-kPSUv5EtGk841Qtk9VFD-nbpG09oUekKFMUn9VAOqIAYN7yMi97PM2vnzdTbpyEa-pEFwtILBqXOenIl06jhiDJ9dPhAg_qWFHO2Gi39Db9P4-zFxsBXy_LYu1n-zv",
    garantiaLocal: true,
    especificaciones: { dimensiones: "120x60cm", madera: "Pino", acabado: "Natural" },
    rating: 4.5,
    ratingCount: 50,
  },
  // ── Procesadores ─────────────────────────────────────────────────────────
  {
    nombre:       "AMD Ryzen 9 7950X",
    categoria:    "procesadores",
    precio:       2800,
    stock:        8,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "16", frecuencia: "4.5GHz", tdp: "170W" },
    rating: 5,
    ratingCount: 210,
  },
  {
    nombre:       "Intel Core i9-14900K",
    categoria:    "procesadores",
    precio:       2600,
    stock:        6,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "24", frecuencia: "3.2GHz", tdp: "125W" },
    rating: 4.7,
    ratingCount: 180,
  },
  {
    nombre:       "AMD Ryzen 5 7600X",
    categoria:    "procesadores",
    precio:       1100,
    stock:        20,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "6", frecuencia: "4.7GHz", tdp: "105W" },
    rating: 4.6,
    ratingCount: 95,
  },
  // ── Graficas ─────────────────────────────────────────────────────────────
  {
    nombre:       "NVIDIA RTX 4090 24GB",
    categoria:    "graficas",
    precio:       8500,
    stock:        3,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { vram: "24GB", bus: "384-bit", boost: "2.52GHz", tdp: "450W" },
    rating: 5,
    ratingCount: 320,
  },
  {
    nombre:       "NVIDIA RTX 4070 Ti Super",
    categoria:    "graficas",
    precio:       4200,
    stock:        7,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { vram: "16GB", bus: "256-bit", boost: "2.61GHz", tdp: "285W" },
    rating: 4.8,
    ratingCount: 145,
  },
  {
    nombre:       "AMD RX 7800 XT 16GB",
    categoria:    "graficas",
    precio:       2900,
    stock:        10,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { vram: "16GB", bus: "256-bit", boost: "2.43GHz", tdp: "263W" },
    rating: 4.5,
    ratingCount: 88,
  },
  // ── RAM ──────────────────────────────────────────────────────────────────
  {
    nombre:       "Corsair Dominator DDR5 64GB",
    categoria:    "ram",
    precio:       950,
    stock:        12,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { capacidad: "64GB", tipo: "DDR5", velocidad: "6000MHz", latencia: "CL30" },
    rating: 4.9,
    ratingCount: 67,
  },
  // ── Refrigeración ────────────────────────────────────────────────────────
  {
    nombre:       "NZXT Kraken Elite 360 RGB",
    categoria:    "refrigeracion",
    precio:       1400,
    stock:        9,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { tipo: "AIO Líquida", radiador: "360mm", ventiladores: "3x120mm", rgb: "Sí" },
    rating: 4.7,
    ratingCount: 102,
  },
  {
    nombre:       "Noctua NH-D15 Air Cooler",
    categoria:    "refrigeracion",
    precio:       480,
    stock:        15,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { tipo: "Aire", altura: "165mm", ventiladores: "2x140mm", tdp: "250W" },
    rating: 4.9,
    ratingCount: 430,
  },
  // ── Almacenamiento ───────────────────────────────────────────────────────
  {
    nombre:       "Samsung 990 Pro 2TB NVMe",
    categoria:    "almacenamiento",
    precio:       580,
    stock:        25,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { capacidad: "2TB", interfaz: "PCIe 4.0", lectura: "7450MB/s", escritura: "6900MB/s" },
    rating: 4.8,
    ratingCount: 280,
  },
  // ── Fuentes ──────────────────────────────────────────────────────────────
  {
    nombre:       "Corsair RM1000x 1000W 80+ Gold",
    categoria:    "fuentes",
    precio:       650,
    stock:        18,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { potencia: "1000W", certificacion: "80+ Gold", modular: "Full", garantia: "10 años" },
    rating: 4.9,
    ratingCount: 190,
  },
  // ── Gabinetes ────────────────────────────────────────────────────────────
  {
    nombre:       "Lian Li O11 Dynamic EVO XL",
    categoria:    "gabinetes",
    precio:       750,
    stock:        6,
    imagenUrl:    "",
    garantiaLocal: true,
    especificaciones: { factor: "Full Tower", vidrio: "Templado", bahias: "3x2.5\" + 3x3.5\"", rgb: "No incluido" },
    rating: 4.9,
    ratingCount: 340,
  },
];

async function seed() {
  console.log("🌱 Seeding Firestore with sample data...\n");

  // Seed products
  for (const product of SAMPLE_PRODUCTS) {
    const ref = await addDoc(collection(db, "productos"), {
      ...product,
      fechaCreacion: serverTimestamp(),
    });
    console.log(`  ✅ Added product: ${product.nombre} [${ref.id}]`);
  }

  console.log(`\n✨ Seeded ${SAMPLE_PRODUCTS.length} products successfully.`);
  console.log("\n📋 Note: Create an admin user via Firebase Console Auth, then manually update");
  console.log("   their Firestore document at usuarios/{uid} to set rol: 'admin'.\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
