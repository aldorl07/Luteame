/// <reference types="node" />
/**
 * scripts/seed-firestore.ts
 *
 * Seeds the Firestore database with real products from Deltron Huancayo warehouse.
 * Pricing formula: (USD_PRICE * 1.18 * 3.370) rounded to PEN.
 *
 * Run with:
 *   npx ts-node --project scripts/tsconfig.json scripts/seed-firestore.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
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

export const DELTRON_HUANCAYO_PRODUCTS = [
  // ── Escritorios Luteame ──────────────────────────────────────────────────
  {
    nombre: "Luteame Pro Desk — Nogal",
    categoria: "escritorios",
    precio: 850,
    stock: 10,
    imagenUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { dimensiones: "160x80cm", madera: "Nogal", acabado: "Matte" },
    rating: 4.9,
    ratingCount: 120,
  },
  {
    nombre: "Luteame Cyber Base — Metal/Vidrio",
    categoria: "escritorios",
    precio: 1200,
    stock: 5,
    imagenUrl: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { dimensiones: "140x70cm", material: "Metal/Vidrio", perfil: "L-Shape" },
    rating: 4.8,
    ratingCount: 85,
  },
  {
    nombre: "Compact Studio Desk — Pino",
    categoria: "escritorios",
    precio: 450,
    stock: 15,
    imagenUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { dimensiones: "120x60cm", madera: "Pino", acabado: "Natural" },
    rating: 4.6,
    ratingCount: 45,
  },

  // ── Procesadores (CPUs) ──────────────────────────────────────────────────
  {
    nombre: "AMD Ryzen 5 7600X 4.7GHz AM5",
    categoria: "procesadores",
    precio: 849, // USD 213.56 * 1.18 * 3.370
    stock: 1,
    imagenUrl: "/products/ryzen-7000.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "6", hilos: "12", frecuencia: "4.7GHz", tdp: "105W", arquitectura: "Zen 4" },
    rating: 4.8,
    ratingCount: 140,
  },
  {
    nombre: "AMD Ryzen 5 8500G 3.5GHz AM5",
    categoria: "procesadores",
    precio: 787, // USD 197.99 * 1.18 * 3.370
    stock: 5,
    imagenUrl: "/products/ryzen-8000g.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "6", hilos: "12", frecuencia: "3.5GHz", tdp: "65W", graficos: "Radeon 740M" },
    rating: 4.7,
    ratingCount: 88,
  },
  {
    nombre: "AMD Ryzen 5 8600G 4.3GHz AM5",
    categoria: "procesadores",
    precio: 633, // USD 159.29 * 1.18 * 3.370
    stock: 6,
    imagenUrl: "/products/ryzen-8000g.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "6", hilos: "12", frecuencia: "4.3GHz", tdp: "65W", graficos: "Radeon 760M" },
    rating: 4.9,
    ratingCount: 110,
  },
  {
    nombre: "AMD Ryzen 7 5700G 3.8GHz AM4",
    categoria: "procesadores",
    precio: 713, // USD 179.39 * 1.18 * 3.370
    stock: 13,
    imagenUrl: "/products/ryzen-5700g.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM4", nucleos: "8", hilos: "16", frecuencia: "3.8GHz", tdp: "65W", graficos: "Radeon Vega 8" },
    rating: 4.9,
    ratingCount: 310,
  },
  {
    nombre: "AMD Ryzen 7 8700G 4.2GHz AM5",
    categoria: "procesadores",
    precio: 879, // USD 221.00 * 1.18 * 3.370
    stock: 3,
    imagenUrl: "/products/ryzen-8000g.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "8", hilos: "16", frecuencia: "4.2GHz", tdp: "65W", graficos: "Radeon 780M con NPU IA" },
    rating: 5.0,
    ratingCount: 75,
  },
  {
    nombre: "Intel Core i5-14400F 2.5GHz LGA1700",
    categoria: "procesadores",
    precio: 705, // USD 177.38 * 1.18 * 3.370
    stock: 4,
    imagenUrl: "/products/intel-i5.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "10 (6P + 4E)", hilos: "16", frecuencia: "4.7GHz Turbo", tdp: "65W" },
    rating: 4.8,
    ratingCount: 160,
  },
  {
    nombre: "Intel Core i7-14700 2.1GHz LGA1700",
    categoria: "procesadores",
    precio: 1563, // USD 392.96 * 1.18 * 3.370
    stock: 2,
    imagenUrl: "/products/intel-i7.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "20 (8P + 12E)", hilos: "28", frecuencia: "5.4GHz Turbo", tdp: "65W" },
    rating: 4.9,
    ratingCount: 92,
  },
  {
    nombre: "Intel Core i7-14700F 2.1GHz LGA1700",
    categoria: "procesadores",
    precio: 1403, // USD 352.76 * 1.18 * 3.370
    stock: 10,
    imagenUrl: "/products/intel-i7.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "20 (8P + 12E)", hilos: "28", frecuencia: "5.4GHz Turbo", tdp: "65W" },
    rating: 4.9,
    ratingCount: 130,
  },
  {
    nombre: "Intel Core i9-14900K 3.2GHz LGA1700",
    categoria: "procesadores",
    precio: 2274, // USD 571.85 * 1.18 * 3.370
    stock: 1,
    imagenUrl: "/products/intel-i9.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "24 (8P + 16E)", hilos: "32", frecuencia: "6.0GHz Turbo", tdp: "125W" },
    rating: 5.0,
    ratingCount: 220,
  },
  {
    nombre: "Intel Core Ultra 5 225F 3.3GHz LGA1851",
    categoria: "procesadores",
    precio: 675, // USD 169.74 * 1.18 * 3.370
    stock: 4,
    imagenUrl: "/products/intel-i5.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1851", nucleos: "10", hilos: "10", frecuencia: "4.9GHz Turbo", tdp: "65W", arquitectura: "Arrow Lake" },
    rating: 4.8,
    ratingCount: 40,
  },

  // ── Tarjetas de Video (GPUs) ─────────────────────────────────────────────
  {
    nombre: "ASUS Dual GeForce RTX 3050 OC 6GB GDDR6",
    categoria: "graficas",
    precio: 1151, // USD 289.44 * 1.18 * 3.370
    stock: 13,
    imagenUrl: "/products/asus-rtx-dual.jpg",
    garantiaLocal: true,
    especificaciones: { vram: "6GB GDDR6", bus: "96-bit", boost: "1507MHz", conexion: "PCIe 4.0", ventiladores: "Dual Fan" },
    rating: 4.7,
    ratingCount: 115,
  },
  {
    nombre: "ASUS Dual GeForce RTX 5060 OC 8GB GDDR7",
    categoria: "graficas",
    precio: 1930, // USD 485.42 * 1.18 * 3.370
    stock: 2,
    imagenUrl: "/products/asus-rtx-dual.jpg",
    garantiaLocal: true,
    especificaciones: { vram: "8GB GDDR7", bus: "128-bit", conexion: "PCIe 5.0", tecnologia: "DLSS 4, Ray Tracing", ventiladores: "Dual Axial-tech" },
    rating: 5.0,
    ratingCount: 65,
  },
  {
    nombre: "ASUS Dual GeForce RTX 5060 EVO 8GB",
    categoria: "graficas",
    precio: 1890, // USD 475.37 * 1.18 * 3.370
    stock: 1,
    imagenUrl: "/products/asus-rtx-dual.jpg",
    garantiaLocal: true,
    especificaciones: { vram: "8GB GDDR7", bus: "128-bit", conexion: "PCIe 5.0", perfil: "Compact EVO", ventiladores: "Dual Fan" },
    rating: 4.9,
    ratingCount: 42,
  },
  {
    nombre: "Gigabyte GeForce RTX 5060 Ti Eagle OC 8GB",
    categoria: "graficas",
    precio: 1775, // USD 446.22 * 1.18 * 3.370
    stock: 4,
    imagenUrl: "/products/asus-rtx-dual.jpg",
    garantiaLocal: true,
    especificaciones: { vram: "8GB GDDR7", bus: "128-bit", conexion: "PCIe 5.0", refrigeracion: "Windforce 3X Fans" },
    rating: 4.9,
    ratingCount: 95,
  },

  // ── Placas Madre ─────────────────────────────────────────────────────────
  {
    nombre: "ASUS Prime B760M-A DDR5 (LGA1700)",
    categoria: "placas",
    precio: 388, // USD 97.49 * 1.18 * 3.370
    stock: 5,
    imagenUrl: "https://sercoplus.com/33376-large_default/mainboard-asus-prime-b760m-a-d4-lga-170.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", formato: "Micro-ATX", ram: "4x DDR5 hasta 7200MHz", m2: "2x PCIe 4.0", video: "HDMI/DP" },
    rating: 4.8,
    ratingCount: 110,
  },
  {
    nombre: "ASUS H610M-K DDR5 (LGA1700)",
    categoria: "placas",
    precio: 250, // USD 62.91 * 1.18 * 3.370
    stock: 4,
    imagenUrl: "https://m.media-amazon.com/images/I/71cZkW4L6hL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", formato: "Micro-ATX", ram: "2x DDR5", m2: "1x PCIe 4.0" },
    rating: 4.6,
    ratingCount: 75,
  },
  {
    nombre: "Gigabyte H610M K V2 DDR5 (LGA1700)",
    categoria: "placas",
    precio: 235, // USD 59.19 * 1.18 * 3.370
    stock: 6,
    imagenUrl: "https://m.media-amazon.com/images/I/71wLp+6Z1vL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", formato: "Micro-ATX", ram: "2x DDR5", m2: "1x PCIe 4.0 NVMe" },
    rating: 4.5,
    ratingCount: 60,
  },
  {
    nombre: "MSI PRO B860M-E DDR5 (LGA1851)",
    categoria: "placas",
    precio: 379, // USD 95.37 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/71PjY56t2oL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1851", formato: "Micro-ATX", ram: "2x DDR5 hasta 6400MHz", m2: "2x PCIe 4.0 NVMe" },
    rating: 4.9,
    ratingCount: 40,
  },
  {
    nombre: "MSI PRO H810M-E DDR5 (LGA1851)",
    categoria: "placas",
    precio: 315, // USD 79.29 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/71PjY56t2oL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1851", formato: "Micro-ATX", ram: "2x DDR5", m2: "1x PCIe 4.0" },
    rating: 4.7,
    ratingCount: 35,
  },
  {
    nombre: "ASRock B450M-HDV R4.0 (AM4)",
    categoria: "placas",
    precio: 187, // USD 46.98 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/71Wj+qF+0jL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM4", formato: "Micro-ATX", ram: "2x DDR4 hasta 3200MHz", m2: "1x Ultra M.2" },
    rating: 4.6,
    ratingCount: 290,
  },
  {
    nombre: "ASUS Prime A520M-K (AM4)",
    categoria: "placas",
    precio: 196, // USD 49.25 * 1.18 * 3.370
    stock: 10,
    imagenUrl: "https://m.media-amazon.com/images/I/81xGZ3mR6oL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM4", formato: "Micro-ATX", ram: "2x DDR4 hasta 4600MHz", m2: "1x PCIe 3.0" },
    rating: 4.7,
    ratingCount: 150,
  },
  {
    nombre: "ASUS Prime B550M-A AC WiFi (AM4)",
    categoria: "placas",
    precio: 352, // USD 88.44 * 1.18 * 3.370
    stock: 11,
    imagenUrl: "https://m.media-amazon.com/images/I/81q9iS1f4SL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM4", formato: "Micro-ATX", ram: "4x DDR4", m2: "2x M.2 PCIe 4.0", wifi: "WiFi AC + Bluetooth" },
    rating: 4.9,
    ratingCount: 180,
  },
  {
    nombre: "MSI PRO A620M-E EVO DDR5 (AM5)",
    categoria: "placas",
    precio: 259, // USD 65.22 * 1.18 * 3.370
    stock: 6,
    imagenUrl: "https://m.media-amazon.com/images/I/71fL9Wz5+2L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", formato: "Micro-ATX", ram: "2x DDR5 hasta 6000MHz", m2: "1x PCIe 4.0 NVMe" },
    rating: 4.8,
    ratingCount: 85,
  },

  // ── Memorias RAM ─────────────────────────────────────────────────────────
  {
    nombre: "Hiksemi Armor 16GB DDR4 3200MHz",
    categoria: "ram",
    precio: 458, // USD 115.07 * 1.18 * 3.370
    stock: 10,
    imagenUrl: "https://m.media-amazon.com/images/I/61W8eXj-kVL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "16GB", tipo: "DDR4", velocidad: "3200MHz", disipador: "Aluminio Negro" },
    rating: 4.8,
    ratingCount: 75,
  },
  {
    nombre: "Kingston Fury Beast RGB 16GB DDR4 3200MHz",
    categoria: "ram",
    precio: 739, // USD 185.93 * 1.18 * 3.370
    stock: 1,
    imagenUrl: "https://m.media-amazon.com/images/I/61I2eQ3u1XL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "16GB", tipo: "DDR4", velocidad: "3200MHz", rgb: "RGB Personalizable" },
    rating: 4.9,
    ratingCount: 140,
  },
  {
    nombre: "Hiksemi Armor 8GB DDR4 3200MHz",
    categoria: "ram",
    precio: 257, // USD 64.57 * 1.18 * 3.370
    stock: 10,
    imagenUrl: "https://m.media-amazon.com/images/I/61W8eXj-kVL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "8GB", tipo: "DDR4", velocidad: "3200MHz" },
    rating: 4.7,
    ratingCount: 90,
  },
  {
    nombre: "Kingston Fury Beast 8GB DDR4 3200MHz",
    categoria: "ram",
    precio: 299, // USD 75.27 * 1.18 * 3.370
    stock: 6,
    imagenUrl: "https://m.media-amazon.com/images/I/61G+nZqQf4L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "8GB", tipo: "DDR4", velocidad: "3200MHz" },
    rating: 4.8,
    ratingCount: 165,
  },
  {
    nombre: "TeamGroup T-Force Vulcan Z 8GB DDR4 3200MHz",
    categoria: "ram",
    precio: 269, // USD 67.54 * 1.18 * 3.370
    stock: 12,
    imagenUrl: "https://m.media-amazon.com/images/I/71NnN4eX8OL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "8GB", tipo: "DDR4", velocidad: "3200MHz", disipador: "Gris Titanio" },
    rating: 4.7,
    ratingCount: 80,
  },
  {
    nombre: "Kingston Fury Beast 16GB DDR5 5600MHz",
    categoria: "ram",
    precio: 906, // USD 227.73 * 1.18 * 3.370
    stock: 2,
    imagenUrl: "https://m.media-amazon.com/images/I/61J2m5o8o6L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "16GB", tipo: "DDR5", velocidad: "5600MHz", latencia: "CL40" },
    rating: 4.9,
    ratingCount: 55,
  },
  {
    nombre: "Kingston Fury Beast 16GB DDR5 6000MHz",
    categoria: "ram",
    precio: 919, // USD 231.15 * 1.18 * 3.370
    stock: 7,
    imagenUrl: "https://m.media-amazon.com/images/I/61J2m5o8o6L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "16GB", tipo: "DDR5", velocidad: "6000MHz", latencia: "CL36" },
    rating: 5.0,
    ratingCount: 90,
  },

  // ── Almacenamiento (SSDs & HDDs) ─────────────────────────────────────────
  {
    nombre: "SSD TeamGroup MP33 1TB M.2 NVMe PCIe 3.0",
    categoria: "almacenamiento",
    precio: 665, // USD 167.33 * 1.18 * 3.370
    stock: 10,
    imagenUrl: "https://m.media-amazon.com/images/I/71jQz-aQ8ML._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "1TB", formato: "M.2 2280", interfaz: "PCIe 3.0 x4 NVMe", lectura: "1800MB/s" },
    rating: 4.8,
    ratingCount: 140,
  },
  {
    nombre: "SSD TeamGroup MP33 256GB M.2 NVMe",
    categoria: "almacenamiento",
    precio: 257, // USD 64.67 * 1.18 * 3.370
    stock: 10,
    imagenUrl: "https://m.media-amazon.com/images/I/71jQz-aQ8ML._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "256GB", formato: "M.2 2280", interfaz: "PCIe 3.0 x4" },
    rating: 4.6,
    ratingCount: 65,
  },
  {
    nombre: "SSD Kingston KC3000 2TB M.2 PCIe 4.0 (7000MB/s)",
    categoria: "almacenamiento",
    precio: 1343, // USD 337.68 * 1.18 * 3.370
    stock: 2,
    imagenUrl: "https://m.media-amazon.com/images/I/71wE1W6eF5L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "2TB", interfaz: "PCIe 4.0 NVMe", lectura: "7000MB/s", escritura: "7000MB/s", disipador: "Grafeno" },
    rating: 5.0,
    ratingCount: 180,
  },
  {
    nombre: "SSD WD Green SN350 1TB M.2 NVMe",
    categoria: "almacenamiento",
    precio: 617, // USD 155.27 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/61k1qV7u5OL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "1TB", formato: "M.2 2280", interfaz: "PCIe Gen3 x4", lectura: "2400MB/s" },
    rating: 4.7,
    ratingCount: 120,
  },
  {
    nombre: "SSD WD Green SN3000 1TB M.2 PCIe 4.0",
    categoria: "almacenamiento",
    precio: 635, // USD 159.80 * 1.18 * 3.370
    stock: 10,
    imagenUrl: "https://m.media-amazon.com/images/I/61k1qV7u5OL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { capacidad: "1TB", formato: "M.2 2280", interfaz: "PCIe Gen4 x4", lectura: "3500MB/s" },
    rating: 4.8,
    ratingCount: 75,
  },
  {
    nombre: "SSD Kingston A400 480GB 2.5\" SATA III",
    categoria: "almacenamiento",
    precio: 356, // USD 89.45 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { capacidad: "480GB", formato: "2.5 pulgadas", interfaz: "SATA III 6Gb/s", lectura: "500MB/s" },
    rating: 4.8,
    ratingCount: 380,
  },
  {
    nombre: "HDD Seagate Barracuda 1TB 3.5\" SATA",
    categoria: "almacenamiento",
    precio: 188, // USD 47.24 * 1.18 * 3.370
    stock: 13,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { capacidad: "1TB", formato: "3.5 pulgadas", interfaz: "SATA 6Gb/s", rpm: "5900 RPM" },
    rating: 4.6,
    ratingCount: 190,
  },

  // ── Fuentes de Poder ─────────────────────────────────────────────────────
  {
    nombre: "MSI MAG A750BN 750W 80+ Bronze PCIe 5.0",
    categoria: "fuentes",
    precio: 218, // USD 54.77 * 1.18 * 3.370
    stock: 4,
    imagenUrl: "https://m.media-amazon.com/images/I/71tQp7p77+L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { potencia: "750W", certificacion: "80+ Bronze", pcie5: "Soporte PCIe 5.0 12VHPWR", ventilador: "120mm Silencioso" },
    rating: 4.9,
    ratingCount: 95,
  },
  {
    nombre: "Teros Gamer ATX 850W TE-1320S",
    categoria: "fuentes",
    precio: 260, // USD 65.33 * 1.18 * 3.370
    stock: 16,
    imagenUrl: "https://m.media-amazon.com/images/I/71LqK3D-mAL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { potencia: "850W", formato: "ATX", cables: "Mallados Negros", protecciones: "OVP, UVP, SCP" },
    rating: 4.8,
    ratingCount: 110,
  },
  {
    nombre: "Teros Gamer ATX 1000W TE-1328BK Certificada",
    categoria: "fuentes",
    precio: 300, // USD 75.38 * 1.18 * 3.370
    stock: 12,
    imagenUrl: "https://m.media-amazon.com/images/I/71t6W6R0x5L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { potencia: "1000W", formato: "ATX", eficiencia: "Gamer Certified", ventilador: "140mm Hydraulic Bearing" },
    rating: 4.9,
    ratingCount: 75,
  },
  {
    nombre: "Teros Gamer ATX 650W TE-1325G",
    categoria: "fuentes",
    precio: 136, // USD 34.17 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/71LqK3D-mAL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { potencia: "650W", formato: "ATX", ventilador: "120mm" },
    rating: 4.7,
    ratingCount: 160,
  },

  // ── Gabinetes (Cases) ────────────────────────────────────────────────────
  {
    nombre: "Case Gamer ATX Teros TE-1332 Black (Vidrio Templado)",
    categoria: "gabinetes",
    precio: 116, // USD 29.15 * 1.18 * 3.370
    stock: 16,
    imagenUrl: "https://mercury.vtexassets.com/arquivos/ids/23580937-800-800?v=639187905861830000&width=800&height=800&aspect=true",
    garantiaLocal: true,
    especificaciones: { factor: "ATX Mid Tower", lateral: "Vidrio Templado", soporteRadiador: "Hasta 240mm/360mm", usbFrontal: "USB 3.0 + Audio" },
    rating: 4.8,
    ratingCount: 125,
  },
  {
    nombre: "Case Gamer ATX Teros TE-1333 Black (Vidrio Templado)",
    categoria: "gabinetes",
    precio: 116, // USD 29.15 * 1.18 * 3.370
    stock: 5,
    imagenUrl: "https://mercury.vtexassets.com/arquivos/ids/23580937-800-800?v=639187905861830000&width=800&height=800&aspect=true",
    garantiaLocal: true,
    especificaciones: { factor: "ATX Mid Tower", flujoAire: "Frontal Mesh de alto flujo", lateral: "Vidrio Templado" },
    rating: 4.8,
    ratingCount: 60,
  },
  {
    nombre: "Case Micro ATX Teros TE-1319G con Fuente 450W",
    categoria: "gabinetes",
    precio: 127, // USD 31.86 * 1.18 * 3.370
    stock: 14,
    imagenUrl: "https://m.media-amazon.com/images/I/61m1R2fU5OL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { factor: "Micro-ATX", fuenteIncluida: "450W", bahias: "SSD/HDD", diseno: "Oficina y Gaming Ligero" },
    rating: 4.6,
    ratingCount: 90,
  },

  // ── Refrigeración ────────────────────────────────────────────────────────
  {
    nombre: "Water Cooling Líquido 240mm Teros TE-8164N ARGB",
    categoria: "refrigeracion",
    precio: 171, // USD 43.11 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://compuciber.com/wp-content/uploads/2024/05/REFRIGERACION-LIQUIDA-TEROS-TE-8164N-INTEL-Y-AMD-TDP-265W-MAX-240MM-LIQUIDA-TE-8164N.jpg",
    garantiaLocal: true,
    especificaciones: { tipo: "AIO Líquida 240mm", radiador: "Aluminio 240mm", ventiladores: "2x 120mm ARGB", compatibilidad: "Intel LGA1700/1851 y AMD AM4/AM5" },
    rating: 4.9,
    ratingCount: 130,
  },
  {
    nombre: "Air Cooler CPU Teros TE-8166N 4 Heatpipes RGB",
    categoria: "refrigeracion",
    precio: 100, // USD 25.13 * 1.18 * 3.370
    stock: 12,
    imagenUrl: "https://m.media-amazon.com/images/I/71h3K7eUuDL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { tipo: "Aire Torre", heatpipes: "4 de Cobre de contacto directo", ventilador: "120mm RGB", tdp: "Hasta 150W" },
    rating: 4.8,
    ratingCount: 95,
  },
  {
    nombre: "Air Cooler CPU Teros TE-8168N Compacto",
    categoria: "refrigeracion",
    precio: 56, // USD 14.07 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/61Fj3vB-t6L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { tipo: "Aire Bajo Perfil", ventilador: "90mm Silencioso", compatibilidad: "Intel y AMD" },
    rating: 4.5,
    ratingCount: 60,
  },

  // ── Monitores ────────────────────────────────────────────────────────────
  {
    nombre: "Monitor Gamer Curvo Teros 27\" FHD 200Hz 1ms (TE-2788G)",
    categoria: "monitores",
    precio: 500, // USD 125.63 * 1.18 * 3.370
    stock: 4,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tamano: "27 pulgadas", resolucion: "1920x1080 FHD", curvatura: "1500R", tasaRefresco: "200Hz", tiempoRespuesta: "1ms MPRT", puertos: "HDMI/DP" },
    rating: 4.9,
    ratingCount: 80,
  },
  {
    nombre: "Monitor Gamer Curvo Teros 27\" FHD 180Hz 1ms (TE-2787G)",
    categoria: "monitores",
    precio: 396, // USD 99.50 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tamano: "27 pulgadas", resolucion: "1920x1080 FHD", curvatura: "1500R", tasaRefresco: "180Hz", tiempoRespuesta: "1ms", freesync: "Compatible" },
    rating: 4.8,
    ratingCount: 160,
  },
  {
    nombre: "Monitor ASUS TUF Gaming VG279QM5A 27\" Fast IPS 0.3ms",
    categoria: "monitores",
    precio: 559, // USD 140.60 * 1.18 * 3.370
    stock: 9,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tamano: "27 pulgadas", panel: "Fast IPS", resolucion: "1920x1080 FHD", tiempoRespuesta: "0.3ms", gsync: "Compatible" },
    rating: 5.0,
    ratingCount: 210,
  },
  {
    nombre: "Monitor LG UltraGear 27\" IPS 144Hz 1ms (27G411A)",
    categoria: "monitores",
    precio: 456, // USD 114.57 * 1.18 * 3.370
    stock: 9,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tamano: "27 pulgadas", panel: "IPS UltraGear", tasaRefresco: "144Hz", tiempoRespuesta: "1ms MBR", hdr: "HDR10" },
    rating: 4.9,
    ratingCount: 175,
  },

  // ── Periféricos & Audio ──────────────────────────────────────────────────
  {
    nombre: "Teclado Gamer USB Teros TE-4072 BK RGB",
    categoria: "teclados",
    precio: 24, // USD 5.93 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/71z7W2-q6tL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { conexion: "USB Cable reforzado", iluminacion: "RGB Rainbow", teclas: "Membrana Gamer" },
    rating: 4.6,
    ratingCount: 140,
  },
  {
    nombre: "Combo 4 en 1 Teros Gamer (Teclado + Mouse + Pad + Headset)",
    categoria: "teclados",
    precio: 60, // USD 15.08 * 1.18 * 3.370
    stock: 18,
    imagenUrl: "https://m.media-amazon.com/images/I/71wE5rF8KOL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { incluye: "Teclado RGB + Mouse 3200DPI + Mousepad Speed + Auriculares Gamer" },
    rating: 4.8,
    ratingCount: 220,
  },
  {
    nombre: "Headset Gamer Teros TE-8171N con Micrófono",
    categoria: "headsets",
    precio: 42, // USD 10.55 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://alphatechnology.com.pe/wp-content/uploads/2024/09/a2-371.webp",
    garantiaLocal: true,
    especificaciones: { drivers: "50mm Neodimio", microfono: "Omnidireccional con filtro", conexion: "3.5mm + USB para luz" },
    rating: 4.7,
    ratingCount: 95,
  },
  {
    nombre: "Mousepad Gamer RGB Teros TE-3020 BK",
    categoria: "mousepads",
    precio: 24, // USD 5.93 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/71h3K7eUuDL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { superficie: "Microfibra Speed", iluminacion: "Borde RGB 14 modos", base: "Goma antideslizante" },
    rating: 4.8,
    ratingCount: 110,
  },
  {
    nombre: "Webcam Teros 4K TE-9073N Ultra HD con Micrófono",
    categoria: "webcams",
    precio: 108, // USD 27.14 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://mmstoreperu.com/cdn/shop/files/WEBCAM-TEROS-TE-9073N-2_800x.jpg?v=1764600867",
    garantiaLocal: true,
    especificaciones: { resolucion: "4K UHD 3840x2160", enfoque: "Automático", microfono: "Dual con cancelación de ruido", conexion: "USB Plug & Play" },
    rating: 4.9,
    ratingCount: 130,
  },

  // ── Software & Seguridad ─────────────────────────────────────────────────
  {
    nombre: "Microsoft Windows 11 Pro 64-bit Licencia Digital Original",
    categoria: "software",
    precio: 567, // USD 142.53 * 1.18 * 3.370
    stock: 5,
    imagenUrl: "https://m.media-amazon.com/images/I/61k1jY-V2qL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { version: "Windows 11 Professional", idioma: "Español Latino / Multi-idioma", tipoLicencia: "OEM / Digital Permanente" },
    rating: 5.0,
    ratingCount: 340,
  },
  {
    nombre: "Microsoft Office Home & Business 2024",
    categoria: "software",
    precio: 779, // USD 195.98 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/61p-3qQ6xTL._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { aplicaciones: "Word, Excel, PowerPoint, Outlook", vigencia: "Licencia de Pago Único Permanente" },
    rating: 4.9,
    ratingCount: 150,
  },
  {
    nombre: "Kaspersky Standard Antivirus 3 Dispositivos 1 Año",
    categoria: "software",
    precio: 109, // USD 27.30 * 1.18 * 3.370
    stock: 20,
    imagenUrl: "https://m.media-amazon.com/images/I/61T2bO9x-1L._AC_SL1500_.jpg",
    garantiaLocal: true,
    especificaciones: { proteccion: "Antivirus en tiempo real, Anti-phishing, Limpieza de rendimiento", dispositivos: "3 Dispositivos", vigencia: "1 Año" },
    rating: 4.8,
    ratingCount: 210,
  },
];

async function seed() {
  console.log("🌱 Iniciando proceso de sembrado para Luteame...");

  // Intento de autenticación si se proporcionan credenciales
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
      console.log("ℹ️ Sesión anónima iniciada.");
    } catch {
      // Ignorar si no está habilitado anonymous auth
    }
  }

  console.log("\n📦 Sembrando Firestore con productos reales de Deltron Huancayo...\n");

  const batch = writeBatch(db);
  let count = 0;
  for (const product of DELTRON_HUANCAYO_PRODUCTS) {
    const productRef = doc(collection(db, "productos"));
    batch.set(productRef, {
      ...product,
      fechaCreacion: serverTimestamp(),
    });
    count++;
    console.log(`  ➕ [${count}/${DELTRON_HUANCAYO_PRODUCTS.length}] [${product.categoria.toUpperCase()}] ${product.nombre} -> S/. ${product.precio} (Stock: ${product.stock})`);
  }

  console.log(`\n⏳ Enviando lote atómico de ${count} productos a Firestore...`);
  await batch.commit();

  console.log(`\n✨ ¡Éxito! Se han guardado TODOS los ${DELTRON_HUANCAYO_PRODUCTS.length} productos en la base de datos Firestore.`);
  process.exit(0);
}

seed().catch((err: any) => {
  console.error("\n❌ Error en el sembrado:", err.message || err);
  if (err.code === "permission-denied" || err.message?.includes("PERMISSION_DENIED")) {
    console.error("\n🔒 CAUSA: Las Reglas de Seguridad de Firestore en la consola de Firebase bloquearon la escritura.");
    console.error("👉 SOLUCIÓN: Ve a la Consola de Firebase -> Firestore Database -> pestaña 'Reglas' (Rules) y pega las reglas de 'firestore.rules'.\n");
  }
  process.exit(1);
});
