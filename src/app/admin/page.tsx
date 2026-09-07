"use client";
// src/app/admin/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeToProducts,
  subscribeToAllOrders,
  updateOrderStatus,
  subscribeToAllTickets,
  resolveTicket,
  seedDatabase,
  clearAllProducts,
  deleteProduct,
  deleteOrder,
  clearAllOrders,
  clearAllTickets,
  clearAllLeads,
  subscribeToAllLeads,
  updateLeadStatus,
  registerFollowUpAction,
  addLeadInternalNote,
} from "@/lib/firestore";
import { Product, Lead, LeadStatus, FollowUpType } from "@/types";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";


const SAMPLE_PRODUCTS = [
  // ── Escritorios Luteame ──
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

  // ── Procesadores (CPUs) ──
  {
    nombre: "AMD Ryzen 5 7600X 4.7GHz AM5",
    categoria: "procesadores",
    precio: 849,
    stock: 1,
    imagenUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "6", hilos: "12", frecuencia: "4.7GHz", tdp: "105W" },
    rating: 4.8,
    ratingCount: 140,
  },
  {
    nombre: "AMD Ryzen 5 8500G 3.5GHz AM5",
    categoria: "procesadores",
    precio: 787,
    stock: 5,
    imagenUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "6", hilos: "12", frecuencia: "3.5GHz", tdp: "65W", graficos: "Radeon 740M" },
    rating: 4.7,
    ratingCount: 88,
  },
  {
    nombre: "AMD Ryzen 5 8600G 4.3GHz AM5",
    categoria: "procesadores",
    precio: 633,
    stock: 6,
    imagenUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "6", hilos: "12", frecuencia: "4.3GHz", tdp: "65W", graficos: "Radeon 760M" },
    rating: 4.9,
    ratingCount: 110,
  },
  {
    nombre: "AMD Ryzen 7 5700G 3.8GHz AM4",
    categoria: "procesadores",
    precio: 713,
    stock: 13,
    imagenUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM4", nucleos: "8", hilos: "16", frecuencia: "3.8GHz", tdp: "65W", graficos: "Radeon Vega 8" },
    rating: 4.9,
    ratingCount: 310,
  },
  {
    nombre: "AMD Ryzen 7 8700G 4.2GHz AM5",
    categoria: "procesadores",
    precio: 879,
    stock: 3,
    imagenUrl: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "8", hilos: "16", frecuencia: "4.2GHz", tdp: "65W", graficos: "Radeon 780M NPU" },
    rating: 5.0,
    ratingCount: 75,
  },
  {
    nombre: "Intel Core i5-14400F 2.5GHz LGA1700",
    categoria: "procesadores",
    precio: 705,
    stock: 4,
    imagenUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "10", hilos: "16", frecuencia: "4.7GHz Turbo", tdp: "65W" },
    rating: 4.8,
    ratingCount: 160,
  },
  {
    nombre: "Intel Core i7-14700 2.1GHz LGA1700",
    categoria: "procesadores",
    precio: 1563,
    stock: 2,
    imagenUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "20", hilos: "28", frecuencia: "5.4GHz Turbo", tdp: "65W" },
    rating: 4.9,
    ratingCount: 92,
  },
  {
    nombre: "Intel Core i7-14700F 2.1GHz LGA1700",
    categoria: "procesadores",
    precio: 1403,
    stock: 10,
    imagenUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "20", hilos: "28", frecuencia: "5.4GHz Turbo", tdp: "65W" },
    rating: 4.9,
    ratingCount: 130,
  },
  {
    nombre: "Intel Core i9-14900K 3.2GHz LGA1700",
    categoria: "procesadores",
    precio: 2274,
    stock: 1,
    imagenUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "24", hilos: "32", frecuencia: "6.0GHz Turbo", tdp: "125W" },
    rating: 5.0,
    ratingCount: 220,
  },
  {
    nombre: "Intel Core Ultra 5 225F 3.3GHz LGA1851",
    categoria: "procesadores",
    precio: 675,
    stock: 4,
    imagenUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1851", nucleos: "10", hilos: "10", frecuencia: "4.9GHz Turbo", tdp: "65W" },
    rating: 4.8,
    ratingCount: 40,
  },

  // ── Tarjetas de Video (GPUs) ──
  {
    nombre: "ASUS Dual GeForce RTX 3050 OC 6GB GDDR6",
    categoria: "graficas",
    precio: 1151,
    stock: 13,
    imagenUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { vram: "6GB GDDR6", bus: "96-bit", boost: "1507MHz", conexion: "PCIe 4.0" },
    rating: 4.7,
    ratingCount: 115,
  },
  {
    nombre: "ASUS Dual GeForce RTX 5060 OC 8GB GDDR7",
    categoria: "graficas",
    precio: 1930,
    stock: 2,
    imagenUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { vram: "8GB GDDR7", bus: "128-bit", conexion: "PCIe 5.0", ventiladores: "Dual Axial-tech" },
    rating: 5.0,
    ratingCount: 65,
  },
  {
    nombre: "ASUS Dual GeForce RTX 5060 EVO 8GB",
    categoria: "graficas",
    precio: 1890,
    stock: 1,
    imagenUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { vram: "8GB GDDR7", bus: "128-bit", conexion: "PCIe 5.0", ventiladores: "Dual Fan" },
    rating: 4.9,
    ratingCount: 42,
  },
  {
    nombre: "Gigabyte GeForce RTX 5060 Ti Eagle OC 8GB",
    categoria: "graficas",
    precio: 1775,
    stock: 4,
    imagenUrl: "https://images.unsplash.com/photo-1587202372728-668516d25244?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { vram: "8GB GDDR7", bus: "128-bit", conexion: "PCIe 5.0", refrigeracion: "Windforce 3X" },
    rating: 4.9,
    ratingCount: 95,
  },

  // ── Placas Madre ──
  {
    nombre: "ASUS Prime B760M-A DDR5 (LGA1700)",
    categoria: "placas",
    precio: 388,
    stock: 5,
    imagenUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", formato: "Micro-ATX", ram: "4x DDR5", m2: "2x PCIe 4.0" },
    rating: 4.8,
    ratingCount: 110,
  },
  {
    nombre: "ASUS H610M-K DDR5 (LGA1700)",
    categoria: "placas",
    precio: 250,
    stock: 4,
    imagenUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", formato: "Micro-ATX", ram: "2x DDR5", m2: "1x PCIe 4.0" },
    rating: 4.6,
    ratingCount: 75,
  },
  {
    nombre: "MSI PRO B860M-E DDR5 (LGA1851)",
    categoria: "placas",
    precio: 379,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1851", formato: "Micro-ATX", ram: "2x DDR5", m2: "2x PCIe 4.0 NVMe" },
    rating: 4.9,
    ratingCount: 40,
  },
  {
    nombre: "ASRock B450M-HDV R4.0 (AM4)",
    categoria: "placas",
    precio: 187,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM4", formato: "Micro-ATX", ram: "2x DDR4", m2: "1x Ultra M.2" },
    rating: 4.6,
    ratingCount: 290,
  },
  {
    nombre: "ASUS Prime A520M-K (AM4)",
    categoria: "placas",
    precio: 196,
    stock: 10,
    imagenUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM4", formato: "Micro-ATX", ram: "2x DDR4", m2: "1x PCIe 3.0" },
    rating: 4.7,
    ratingCount: 150,
  },
  {
    nombre: "ASUS Prime B550M-A AC WiFi (AM4)",
    categoria: "placas",
    precio: 352,
    stock: 11,
    imagenUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM4", formato: "Micro-ATX", ram: "4x DDR4", wifi: "WiFi AC + BT" },
    rating: 4.9,
    ratingCount: 180,
  },
  {
    nombre: "MSI PRO A620M-E EVO DDR5 (AM5)",
    categoria: "placas",
    precio: 259,
    stock: 6,
    imagenUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", formato: "Micro-ATX", ram: "2x DDR5", m2: "1x PCIe 4.0 NVMe" },
    rating: 4.8,
    ratingCount: 85,
  },

  // ── Memorias RAM ──
  {
    nombre: "Hiksemi Armor 16GB DDR4 3200MHz",
    categoria: "ram",
    precio: 458,
    stock: 10,
    imagenUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "16GB", tipo: "DDR4", velocidad: "3200MHz" },
    rating: 4.8,
    ratingCount: 75,
  },
  {
    nombre: "Kingston Fury Beast RGB 16GB DDR4 3200MHz",
    categoria: "ram",
    precio: 739,
    stock: 1,
    imagenUrl: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "16GB", tipo: "DDR4", velocidad: "3200MHz", rgb: "Sí" },
    rating: 4.9,
    ratingCount: 140,
  },
  {
    nombre: "Hiksemi Armor 8GB DDR4 3200MHz",
    categoria: "ram",
    precio: 257,
    stock: 10,
    imagenUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "8GB", tipo: "DDR4", velocidad: "3200MHz" },
    rating: 4.7,
    ratingCount: 90,
  },
  {
    nombre: "Kingston Fury Beast 8GB DDR4 3200MHz",
    categoria: "ram",
    precio: 299,
    stock: 6,
    imagenUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "8GB", tipo: "DDR4", velocidad: "3200MHz" },
    rating: 4.8,
    ratingCount: 165,
  },
  {
    nombre: "Kingston Fury Beast 16GB DDR5 5600MHz",
    categoria: "ram",
    precio: 906,
    stock: 2,
    imagenUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "16GB", tipo: "DDR5", velocidad: "5600MHz" },
    rating: 4.9,
    ratingCount: 55,
  },
  {
    nombre: "Kingston Fury Beast 16GB DDR5 6000MHz",
    categoria: "ram",
    precio: 919,
    stock: 7,
    imagenUrl: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "16GB", tipo: "DDR5", velocidad: "6000MHz" },
    rating: 5.0,
    ratingCount: 90,
  },

  // ── Almacenamiento ──
  {
    nombre: "SSD TeamGroup MP33 1TB M.2 NVMe PCIe 3.0",
    categoria: "almacenamiento",
    precio: 665,
    stock: 10,
    imagenUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "1TB", formato: "M.2 2280", interfaz: "PCIe 3.0 NVMe", lectura: "1800MB/s" },
    rating: 4.8,
    ratingCount: 140,
  },
  {
    nombre: "SSD Kingston KC3000 2TB M.2 PCIe 4.0 (7000MB/s)",
    categoria: "almacenamiento",
    precio: 1343,
    stock: 2,
    imagenUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "2TB", interfaz: "PCIe 4.0 NVMe", lectura: "7000MB/s" },
    rating: 5.0,
    ratingCount: 180,
  },
  {
    nombre: "SSD WD Green SN350 1TB M.2 NVMe",
    categoria: "almacenamiento",
    precio: 617,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { capacidad: "1TB", formato: "M.2 2280", interfaz: "PCIe 3.0" },
    rating: 4.7,
    ratingCount: 120,
  },
  {
    nombre: "SSD Kingston A400 480GB 2.5\" SATA III",
    categoria: "almacenamiento",
    precio: 356,
    stock: 20,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { capacidad: "480GB", formato: "2.5 pulgadas", interfaz: "SATA III" },
    rating: 4.8,
    ratingCount: 380,
  },
  {
    nombre: "HDD Seagate Barracuda 1TB 3.5\" SATA",
    categoria: "almacenamiento",
    precio: 188,
    stock: 13,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { capacidad: "1TB", formato: "3.5 pulgadas", rpm: "5900 RPM" },
    rating: 4.6,
    ratingCount: 190,
  },

  // ── Fuentes de Poder ──
  {
    nombre: "MSI MAG A750BN 750W 80+ Bronze PCIe 5.0",
    categoria: "fuentes",
    precio: 218,
    stock: 4,
    imagenUrl: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { potencia: "750W", certificacion: "80+ Bronze", pcie5: "Soporte PCIe 5.0" },
    rating: 4.9,
    ratingCount: 95,
  },
  {
    nombre: "Teros Gamer ATX 850W TE-1320S",
    categoria: "fuentes",
    precio: 260,
    stock: 16,
    imagenUrl: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { potencia: "850W", formato: "ATX", cables: "Mallados" },
    rating: 4.8,
    ratingCount: 110,
  },
  {
    nombre: "Teros Gamer ATX 1000W TE-1328BK Certificada",
    categoria: "fuentes",
    precio: 300,
    stock: 12,
    imagenUrl: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { potencia: "1000W", formato: "ATX" },
    rating: 4.9,
    ratingCount: 75,
  },
  {
    nombre: "Teros Gamer ATX 650W TE-1325G",
    categoria: "fuentes",
    precio: 136,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { potencia: "650W", formato: "ATX" },
    rating: 4.7,
    ratingCount: 160,
  },

  // ── Gabinetes (Cases) ──
  {
    nombre: "Case Gamer ATX Teros TE-1332 Black (Vidrio Templado)",
    categoria: "gabinetes",
    precio: 116,
    stock: 16,
    imagenUrl: "https://images.unsplash.com/photo-1587202372728-668516d25244?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { factor: "ATX Mid Tower", lateral: "Vidrio Templado" },
    rating: 4.8,
    ratingCount: 125,
  },
  {
    nombre: "Case Gamer ATX Teros TE-1333 Black (Vidrio Templado)",
    categoria: "gabinetes",
    precio: 116,
    stock: 5,
    imagenUrl: "https://images.unsplash.com/photo-1587202372728-668516d25244?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { factor: "ATX Mid Tower", flujoAire: "Mesh Frontal" },
    rating: 4.8,
    ratingCount: 60,
  },
  {
    nombre: "Case Micro ATX Teros TE-1319G con Fuente 450W",
    categoria: "gabinetes",
    precio: 127,
    stock: 14,
    imagenUrl: "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { factor: "Micro-ATX", fuenteIncluida: "450W" },
    rating: 4.6,
    ratingCount: 90,
  },

  // ── Refrigeración ──
  {
    nombre: "Water Cooling Líquido 240mm Teros TE-8164N ARGB",
    categoria: "refrigeracion",
    precio: 171,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { tipo: "AIO Líquida 240mm", radiador: "240mm", rgb: "ARGB" },
    rating: 4.9,
    ratingCount: 130,
  },
  {
    nombre: "Air Cooler CPU Teros TE-8166N 4 Heatpipes RGB",
    categoria: "refrigeracion",
    precio: 100,
    stock: 12,
    imagenUrl: "https://images.unsplash.com/photo-1587202372579-0524cb51d382?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { tipo: "Aire Torre", heatpipes: "4 de Cobre", rgb: "RGB" },
    rating: 4.8,
    ratingCount: 95,
  },
  {
    nombre: "Air Cooler CPU Teros TE-8168N Compacto",
    categoria: "refrigeracion",
    precio: 56,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1587202372579-0524cb51d382?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { tipo: "Aire Bajo Perfil", ventilador: "90mm" },
    rating: 4.5,
    ratingCount: 60,
  },

  // ── Monitores ──
  {
    nombre: "Monitor Gamer Curvo Teros 27\" FHD 200Hz 1ms (TE-2788G)",
    categoria: "monitores",
    precio: 500,
    stock: 4,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tamano: "27 pulgadas", resolucion: "1920x1080 FHD", curvatura: "1500R", tasaRefresco: "200Hz", tiempoRespuesta: "1ms" },
    rating: 4.9,
    ratingCount: 80,
  },
  {
    nombre: "Monitor Gamer Curvo Teros 27\" FHD 180Hz 1ms (TE-2787G)",
    categoria: "monitores",
    precio: 396,
    stock: 20,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tamano: "27 pulgadas", resolucion: "1920x1080 FHD", curvatura: "1500R", tasaRefresco: "180Hz", tiempoRespuesta: "1ms" },
    rating: 4.8,
    ratingCount: 160,
  },
  {
    nombre: "Monitor ASUS TUF Gaming VG279QM5A 27\" Fast IPS 0.3ms",
    categoria: "monitores",
    precio: 559,
    stock: 9,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tamano: "27 pulgadas", panel: "Fast IPS", resolucion: "1920x1080 FHD", tiempoRespuesta: "0.3ms" },
    rating: 5.0,
    ratingCount: 210,
  },
  {
    nombre: "Monitor LG UltraGear 27\" IPS 144Hz 1ms (27G411A)",
    categoria: "monitores",
    precio: 456,
    stock: 9,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tamano: "27 pulgadas", panel: "IPS UltraGear", tasaRefresco: "144Hz", tiempoRespuesta: "1ms MBR" },
    rating: 4.9,
    ratingCount: 175,
  },

  // ── Periféricos & Audio ──
  {
    nombre: "Teclado Gamer USB Teros TE-4072 BK RGB",
    categoria: "teclados",
    precio: 24,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { conexion: "USB", iluminacion: "RGB", teclas: "Membrana Gamer" },
    rating: 4.6,
    ratingCount: 140,
  },
  {
    nombre: "Combo 4 en 1 Teros Gamer (Teclado + Mouse + Pad + Headset)",
    categoria: "teclados",
    precio: 60,
    stock: 18,
    imagenUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { incluye: "Teclado RGB + Mouse 3200DPI + Mousepad Speed + Auriculares Gamer" },
    rating: 4.8,
    ratingCount: 220,
  },
  {
    nombre: "Headset Gamer Teros TE-8171N con Micrófono",
    categoria: "headsets",
    precio: 42,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { drivers: "50mm Neodimio", microfono: "Omnidireccional con filtro" },
    rating: 4.7,
    ratingCount: 95,
  },
  {
    nombre: "Mousepad Gamer RGB Teros TE-3020 BK",
    categoria: "mousepads",
    precio: 24,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { superficie: "Microfibra Speed", iluminacion: "RGB" },
    rating: 4.8,
    ratingCount: 110,
  },
  {
    nombre: "Webcam Teros 4K TE-9073N Ultra HD con Micrófono",
    categoria: "webcams",
    precio: 108,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { resolucion: "4K UHD 3840x2160", microfono: "Dual con cancelacion de ruido" },
    rating: 4.9,
    ratingCount: 130,
  },

  // ── Software & Seguridad ──
  {
    nombre: "Microsoft Windows 11 Pro 64-bit Licencia Digital Original",
    categoria: "software",
    precio: 567,
    stock: 5,
    imagenUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { version: "Windows 11 Pro", tipo: "Digital Permanente" },
    rating: 5.0,
    ratingCount: 340,
  },
  {
    nombre: "Microsoft Office Home & Business 2024",
    categoria: "software",
    precio: 779,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { aplicaciones: "Word, Excel, PowerPoint, Outlook", vigencia: "Permanente" },
    rating: 4.9,
    ratingCount: 150,
  },
  {
    nombre: "Kaspersky Standard Antivirus 3 Dispositivos 1 Año",
    categoria: "software",
    precio: 109,
    stock: 20,
    imagenUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    garantiaLocal: true,
    especificaciones: { proteccion: "Antivirus en tiempo real", dispositivos: "3", vigencia: "1 Año" },
    rating: 4.8,
    ratingCount: 210,
  },
];


const MOCK_BUILD = {
  id: "000124",
  clienteNombre: "Aldo Ramos L.",
  componentes: {
    procesadores: { modelo: "AMD Ryzen 9 7950X", serie: "SN-AMD7950X-8829A", garantiaMeses: 24 },
    placas: { modelo: "ASUS ROG Crosshair X670E Hero", serie: "SN-ASUS670-1102A", garantiaMeses: 36 },
    ram: { modelo: "Corsair Dominator DDR5 64GB (2x32)", serie: "SN-DOM64G-9901X", garantiaMeses: 60 },
    graficas: { modelo: "NVIDIA RTX 4090 24GB", serie: "SN-NV4090-0082X", garantiaMeses: 24 },
    almacenamiento: { modelo: "Samsung 990 Pro 2TB NVMe", serie: "SN-SAMS990-2022B", garantiaMeses: 60 },
    fuentes: { modelo: "Corsair RM1000x 1000W 80+ Gold", serie: "SN-PSU1000W-7729C", garantiaMeses: 120 },
    gabinetes: { modelo: "Lian Li O11 Dynamic EVO XL", serie: "SN-LIANLI-5501A", garantiaMeses: 12 },
    refrigeracion: { modelo: "NZXT Kraken Elite 360 RGB", serie: "SN-NZXT360-3301B", garantiaMeses: 24 }
  }
};

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"productos" | "pedidos" | "soporte" | "crm">("productos");

  // Collections state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // CRM State
  const [crmView, setCrmView] = useState<"kanban" | "table" | "urgent">("kanban");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("todos");
  const [crmTemplateType, setCrmTemplateType] = useState<"bienvenida" | "recordatorio_1" | "ajuste_presupuesto" | "oferta_cierre">("bienvenida");
  const [newInternalNote, setNewInternalNote] = useState("");
  const [isSavingLeadAction, setIsSavingLeadAction] = useState(false);
  
  // UI states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Ticket Response state
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [solucionText, setSolucionText] = useState("");
  const [obsText, setObsText] = useState("");
  const [ticketStatus, setTicketStatus] = useState<string>("resuelto");

  // Expanded states
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Protected route check
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, loading, isAdmin, router]);

  // Subscribe to Products
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToProducts({ categories: [] }, (data) => {
      setProducts(data);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Subscribe to Orders
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToAllOrders((data) => {
      setOrders(data);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Subscribe to Support Tickets
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToAllTickets((data) => {
      setTickets(data);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Subscribe to CRM Leads
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToAllLeads((data) => {
      setLeads(data);
      // Keep selectedLead in sync if modal is open
      setSelectedLead((prev) => {
        if (!prev) return null;
        return data.find((l) => l.id === prev.id) || prev;
      });
    });

    return () => unsubscribe();
  }, [user, isAdmin]);


  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleRealSeedDB = async () => {
    setActionLoading("seed");
    try {
      await seedDatabase(SAMPLE_PRODUCTS, MOCK_BUILD);
      showToast("Base de datos e índice de garantía (000124) creados con éxito.", "success");
    } catch (err: any) {
      console.error("Error seeding DB:", err);
      const isPermErr = err?.code === "permission-denied" || err?.message?.includes("permission");
      showToast(
        isPermErr
          ? "Error de permisos en Firebase. Actualiza las 'Reglas' en Firebase Console con el archivo firestore.rules."
          : `Error al sembrar: ${err?.message || "Error desconocido"}`,
        "info"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearCatalog = async () => {
    if (!window.confirm("¿Estás seguro de que deseas vaciar TODOS los productos del catálogo? Esta acción no se puede deshacer.")) {
      return;
    }
    setActionLoading("clear_catalog");
    try {
      const totalDeleted = await clearAllProducts();
      showToast(`Catálogo vaciado. Se eliminaron ${totalDeleted} productos.`, "success");
    } catch (err: any) {
      console.error("Error clearing catalog:", err);
      showToast(`Error al vaciar catálogo: ${err?.message || "Error desconocido"}`, "info");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`¿Deseas eliminar "${productName}" del catálogo?`)) {
      return;
    }
    try {
      await deleteProduct(productId);
      showToast(`Producto "${productName}" eliminado.`, "success");
    } catch (err: any) {
      console.error("Error deleting product:", err);
      showToast("Error al eliminar el producto.", "info");
    }
  };

  const handleClearOrders = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar TODOS los pedidos de prueba registrados?")) {
      return;
    }
    setActionLoading("clear_orders");
    try {
      const deletedCount = await clearAllOrders();
      showToast(`Se han eliminado ${deletedCount} pedidos de prueba.`, "success");
    } catch (err: any) {
      console.error("Error clearing orders:", err);
      showToast("Error al limpiar pedidos.", "info");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const shortId = `LUTE-${orderId.substring(0, 8).toUpperCase()}`;
    if (!window.confirm(`¿Deseas eliminar el pedido ${shortId}?`)) {
      return;
    }
    try {
      await deleteOrder(orderId);
      showToast(`Pedido ${shortId} eliminado.`, "success");
    } catch (err: any) {
      console.error("Error deleting order:", err);
      showToast("Error al eliminar pedido.", "info");
    }
  };

  const handleClearAllTestData = async () => {
    if (!window.confirm("¿Deseas vaciar TODOS los pedidos, tickets y datos de prueba?")) {
      return;
    }
    setActionLoading("clear_test_data");
    try {
      const oCount = await clearAllOrders();
      const tCount = await clearAllTickets();
      showToast(`Datos de prueba eliminados (${oCount} pedidos, ${tCount} tickets).`, "success");
    } catch (err: any) {
      console.error("Error clearing test data:", err);
      showToast("Error al limpiar datos de prueba.", "info");
    } finally {
      setActionLoading(null);
    }
  };

  // Simulated actions for server stuff
  const handleSimulatedAction = (actionName: string, successMessage: string) => {
    setActionLoading(actionName);
    setTimeout(() => {
      setActionLoading(null);
      showToast(successMessage);
    }, 1200);
  };

  // Real Order Status Modification
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Estado de pedido actualizado a: ${status.replace("_", " ")}`, "success");
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast("Error al actualizar estado del pedido.", "info");
    }
  };

  // Real Ticket resolution
  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicketId) return;

    try {
      await resolveTicket(resolvingTicketId, {
        solucion: solucionText.trim(),
        observaciones: obsText.trim(),
        estado: ticketStatus,
      });

      showToast("Ticket de soporte actualizado con éxito.", "success");
      setResolvingTicketId(null);
      setSolucionText("");
      setObsText("");
    } catch (err) {
      console.error("Error resolving ticket:", err);
      showToast("Error al resolver ticket de soporte.", "info");
    }
  };

  // Show loading spinner while checking auth
  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">
          progress_activity
        </span>
        <p className="font-montserrat text-on-surface-variant text-body-lg animate-pulse">
          Comprobando credenciales de seguridad...
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + ((p.precio || 0) * (p.stock || 0)), 0);

  return (
    <div className="min-h-screen bg-background text-on-background pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel border-primary/40 text-on-surface p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right max-w-sm">
          <span className="material-symbols-outlined text-primary">
            {toast.type === "success" ? "check_circle" : "info"}
          </span>
          <span className="font-montserrat text-body-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="w-full border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-40">
        <div className="section-container h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-poppins text-2xl font-extrabold text-primary tracking-tight hover:text-glow transition-all">
              Luteame
            </Link>
            <span className="h-5 w-[1px] bg-outline-variant/40" />
            <span className="chip-purple border-tertiary-container text-tertiary bg-tertiary/10 border font-bold text-[10px] tracking-wider px-2 py-0.5 rounded">
              CONSOLA DE CONTROL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline font-montserrat text-body-sm text-on-surface-variant">
              Comandante: <strong className="text-white">{user.email}</strong>
            </span>
            <button
              onClick={handleSignOut}
              className="btn-secondary py-2 px-4 flex items-center gap-2 border-outline-variant/30 hover:border-error/40 hover:bg-error/10 hover:text-error text-xs"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="section-container mt-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins text-display-lg-mobile md:text-headline-md text-white font-extrabold mb-1">
              Dashboard de Control
            </h1>
            <p className="font-montserrat text-body-sm text-on-surface-variant">
              Gestión e-commerce: pedidos, soporte al cliente gamer y catálogo en tiempo real.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              Ir a la Tienda
            </Link>
            <button
              onClick={handleClearCatalog}
              disabled={actionLoading !== null || products.length === 0}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 text-error border-error/30 hover:bg-error/10 hover:border-error/60 transition-colors disabled:opacity-50"
              title="Eliminar todos los productos de Firestore"
            >
              {actionLoading === "clear_catalog" ? (
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
              )}
              Vaciar Catálogo
            </button>
            <button
              onClick={handleRealSeedDB}
              disabled={actionLoading !== null}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 bg-primary-container hover:bg-primary-container/80"
            >
              {actionLoading === "seed" ? (
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">database</span>
              )}
              Sembrar DB Real
            </button>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Productos Totales</span>
              <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">{products.length}</div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Modelos en catálogo</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-container" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-tertiary/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Pedidos Recibidos</span>
              <span className="material-symbols-outlined text-tertiary text-3xl">local_shipping</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">{orders.length}</div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Órdenes registradas</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary to-tertiary-container" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Ventas Estimadas</span>
              <span className="material-symbols-outlined text-emerald-400 text-3xl">payments</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">
              S/. {orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString("es-PE")}
            </div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Total bruto facturado</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Casos de Soporte</span>
              <span className="material-symbols-outlined text-cyan-400 text-3xl">support_agent</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">
              {tickets.filter((t) => t.estado === "abierto" || t.estado === "en_proceso").length} / {tickets.length}
            </div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Tickets activos / totales</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-outline-variant/20 mb-8 font-montserrat text-xs font-bold uppercase tracking-widest gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("productos")}
            className={`pb-3 transition-colors shrink-0 ${
              activeTab === "productos"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            Inventario
          </button>
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`pb-3 transition-colors shrink-0 ${
              activeTab === "pedidos"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`pb-3 transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "crm"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            <span>CRM & Leads</span>
            {leads.filter((l) => l.estado === "nuevo" || l.estado === "seguimiento_pendiente").length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary border border-primary/40 font-mono">
                {leads.filter((l) => l.estado === "nuevo" || l.estado === "seguimiento_pendiente").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("soporte")}
            className={`pb-3 transition-colors shrink-0 ${
              activeTab === "soporte"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            Soporte ({tickets.filter((t) => t.estado === "abierto").length})
          </button>
        </div>


        {/* Dynamic tabs render */}

        {/* TAB 1: PRODUCT LIST & STOCK */}
        {activeTab === "productos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-outline-variant/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Catálogo de Productos
                </h3>
                <span className="text-xs font-montserrat text-on-surface-variant">
                  {products.length} Modelos en stock
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-montserrat text-body-sm border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase">
                      <th className="pb-3">Producto</th>
                      <th className="pb-3">Categoría</th>
                      <th className="pb-3 text-right">Precio</th>
                      <th className="pb-3 text-right">Stock</th>
                      <th className="pb-3 text-center">Estado</th>
                      <th className="pb-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                          El catálogo está vacío. Haz clic en "Sembrar DB Real" para cargar datos iniciales de hardware.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => {
                        const isLowStock = p.stock <= 3;
                        const isOutOfStock = p.stock === 0;

                        return (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors duration-150">
                            <td className="py-3.5 pr-3 font-semibold text-white truncate max-w-[200px]" title={p.nombre}>
                              {p.nombre}
                            </td>
                            <td className="py-3.5 pr-3 text-on-surface-variant text-xs capitalize">
                              {p.categoria}
                            </td>
                            <td className="py-3.5 pr-3 text-right text-white font-mono">
                              S/. {p.precio.toLocaleString("es-PE")}
                            </td>
                            <td className={`py-3.5 pr-3 text-right font-mono font-bold ${isOutOfStock ? "text-error" : isLowStock ? "text-tertiary" : "text-emerald-400"}`}>
                              {p.stock}
                            </td>
                            <td className="py-3.5 text-center">
                              {isOutOfStock ? (
                                <span className="chip-purple border-error/40 text-error bg-error/10 border text-[9px] px-1.5 py-0.5 rounded">
                                  Agotado
                                </span>
                              ) : isLowStock ? (
                                <span className="chip-purple border-tertiary/40 text-tertiary bg-tertiary/10 border text-[9px] px-1.5 py-0.5 rounded">
                                  Bajo Stock
                                </span>
                              ) : (
                                <span className="chip-purple border-emerald-500/40 text-emerald-400 bg-emerald-500/10 border text-[9px] px-1.5 py-0.5 rounded">
                                  Óptimo
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.nombre)}
                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                                title="Eliminar producto"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-xl border border-outline-variant/20">
                <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                  Acciones Rápidas
                </h3>
                <p className="font-montserrat text-body-sm text-on-surface-variant mb-6">
                  Mantenimiento operativo del servidor de Luteame.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleSimulatedAction("cache", "Caché de consultas de productos vaciado.")}
                    disabled={actionLoading !== null}
                    className="w-full btn-secondary text-xs flex justify-between items-center p-3.5 hover:bg-white/5 border-outline-variant/30"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">cached</span>
                      Vaciar Caché Local
                    </span>
                    {actionLoading === "cache" && (
                      <span className="material-symbols-outlined animate-spin text-sm text-primary">progress_activity</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSimulatedAction("backup", "Backup de base de datos generado y salvado.")}
                    disabled={actionLoading !== null}
                    className="w-full btn-secondary text-xs flex justify-between items-center p-3.5 hover:bg-white/5 border-outline-variant/30"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-cyan-400">cloud_upload</span>
                      Respaldar Firestore
                    </span>
                    {actionLoading === "backup" && (
                      <span className="material-symbols-outlined animate-spin text-sm text-cyan-400">progress_activity</span>
                    )}
                  </button>

                  <button
                    onClick={handleClearAllTestData}
                    disabled={actionLoading !== null}
                    className="w-full btn-secondary text-xs flex justify-between items-center p-3.5 hover:bg-error/10 border-error/30 text-error hover:border-error/60 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-error">auto_delete</span>
                      Limpiar Pedidos y Tickets de Prueba
                    </span>
                    {actionLoading === "clear_test_data" && (
                      <span className="material-symbols-outlined animate-spin text-sm text-error">progress_activity</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {activeTab === "pedidos" && (
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                Seguimiento de Pedidos y Armado
              </h3>
              {orders.length > 0 && (
                <button
                  onClick={handleClearOrders}
                  disabled={actionLoading !== null}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-error border-error/30 hover:bg-error/10 hover:border-error/60 transition-colors"
                >
                  {actionLoading === "clear_orders" ? (
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  )}
                  Vaciar Pedidos de Prueba
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <p className="text-center font-montserrat text-sm text-on-surface-variant py-8">
                No hay pedidos registrados en la tienda en este momento.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const date = order.fecha ? new Date(order.fecha.seconds * 1000).toLocaleString("es-PE") : "—";
                  const isExpanded = expandedOrders[order.id];

                  return (
                    <div
                      key={order.id}
                      className="border border-outline-variant/15 rounded-xl p-4 bg-surface-container-low/20 space-y-4"
                    >
                      {/* Top Header */}
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-white">
                              LUTE-{order.id.substring(0, 8).toUpperCase()}
                            </span>
                            <span
                              className={`chip-purple text-[9px] px-2 py-0.5 rounded border uppercase ${
                                order.estado === "completado"
                                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                  : order.estado === "enviado"
                                  ? "border-cyan-400/40 text-cyan-400 bg-cyan-400/10"
                                  : order.estado === "en_ensamblaje"
                                  ? "border-tertiary/40 text-tertiary bg-tertiary/10"
                                  : "border-primary-container/40 text-primary bg-primary-container/10"
                              }`}
                            >
                              {order.estado.replace("_", " ")}
                            </span>
                          </div>
                          <p className="font-montserrat text-[10px] text-on-surface-variant">
                            Registrado el: {date} · Total: <strong className="text-primary font-mono text-xs">S/. {order.total.toLocaleString("es-PE")}</strong>
                          </p>
                        </div>

                        {/* Dropdown status update & actions */}
                        <div className="flex items-center gap-2">
                          <label className="font-montserrat text-[10px] text-on-surface-variant font-bold uppercase tracking-wider hidden sm:inline">
                            Estado:
                          </label>
                          <select
                            value={order.estado}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-background border border-outline-variant/20 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_ensamblaje">En Ensamblaje</option>
                            <option value="enviado">Enviado</option>
                            <option value="completado">Completado</option>
                          </select>

                          <button
                            onClick={() => setExpandedOrders((prev) => ({ ...prev, [order.id]: !isExpanded }))}
                            className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 border-outline-variant/20"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                            </span>
                            Detalles
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                            title="Eliminar pedido de prueba"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded customer and item lists */}
                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10 animate-fade-in font-montserrat text-xs">
                          {/* Client details */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-primary">Datos de Envío y Pago</h4>
                            <div className="space-y-1 bg-background/30 p-3 rounded-lg border border-outline-variant/5">
                              <p className="text-white"><strong className="text-on-surface-variant font-normal">Cliente:</strong> {order.clienteNombre}</p>
                              <p className="text-white"><strong className="text-on-surface-variant font-normal">Email:</strong> {order.clienteEmail || "No registrado"}</p>
                              <p className="text-white"><strong className="text-on-surface-variant font-normal">Teléfono / WA:</strong> {order.telefono}</p>
                              <p className="text-white"><strong className="text-on-surface-variant font-normal">Dirección:</strong> {order.direccion}</p>
                              <p className="text-white capitalize">
                                <strong className="text-on-surface-variant font-normal">Pago:</strong> {order.metodoPago.replace("_", " ")}
                                {order.detallesPago?.referencia && ` (Operación: ${order.detallesPago.referencia})`}
                                {order.detallesPago?.tarjetaUltimosCuatro && ` (Tarjeta terminada en: ${order.detallesPago.tarjetaUltimosCuatro})`}
                              </p>
                            </div>
                          </div>

                          {/* Items details */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-primary">Artículos Adquiridos</h4>
                            <div className="space-y-2">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="bg-background/30 p-3 rounded-lg border border-outline-variant/5">
                                  <div className="flex justify-between items-start font-semibold text-white">
                                    <span className="truncate max-w-[200px]" title={item.nombre}>{item.nombre}</span>
                                    <span>Cant: {item.cantidad}</span>
                                  </div>
                                  
                                  {/* Custom PC components if applicable */}
                                  {item.componentes && (
                                    <div className="mt-2 pl-3 border-l border-primary-container/20 text-[10px] text-on-surface-variant/80 space-y-0.5">
                                      {item.componentes.map((c: any) => (
                                        <p key={c.categoria}>
                                          <span className="capitalize">{c.categoria}:</span> {c.nombre}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TICKETS & SUPPORT RESOLUTION */}
        {activeTab === "soporte" && (
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 animate-fade-in">
            <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">contact_support</span>
              Centro de Atención y Soporte Técnico
            </h3>

            {tickets.length === 0 ? (
              <p className="text-center font-montserrat text-sm text-on-surface-variant py-8">
                No hay tickets de soporte abiertos. ¡Buen trabajo técnico!
              </p>
            ) : (
              <div className="space-y-6">
                {tickets.map((t) => {
                  const date = t.fechaCreacion ? new Date(t.fechaCreacion.seconds * 1000).toLocaleString("es-PE") : "—";
                  const isHigh = t.prioridad === "alta";
                  const isMedium = t.prioridad === "media";
                  
                  return (
                    <div
                      key={t.id}
                      className="border border-outline-variant/15 rounded-xl p-5 bg-surface-container-low/20 space-y-4"
                    >
                      {/* Ticket Info */}
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-montserrat text-body-lg font-bold text-white">
                              {t.titulo}
                            </h4>
                            <span
                              className={`chip-purple text-[9px] px-2 py-0.5 border rounded uppercase ${
                                isHigh
                                  ? "border-error/40 text-error bg-error/10"
                                  : isMedium
                                  ? "border-tertiary/40 text-tertiary bg-tertiary/10"
                                  : "border-primary-container/40 text-primary bg-primary-container/10"
                              }`}
                            >
                              Prioridad {t.prioridad}
                            </span>
                            <span
                              className={`chip-purple text-[9px] px-2 py-0.5 border rounded uppercase ${
                                t.estado === "resuelto" || t.estado === "cerrado"
                                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                  : "border-cyan-400/40 text-cyan-400 bg-cyan-400/10"
                              }`}
                            >
                              {t.estado.replace("_", " ")}
                            </span>
                          </div>
                          <p className="font-montserrat text-[10px] text-on-surface-variant font-semibold">
                            ID: {t.id.substring(0, 8).toUpperCase()} · Creado el {date} · Por: <strong className="text-white">{t.clienteEmail}</strong>
                          </p>
                        </div>

                        {/* Act button */}
                        {resolvingTicketId !== t.id && (
                          <button
                            onClick={() => {
                              setResolvingTicketId(t.id);
                              setSolucionText(t.solucion || "");
                              setObsText(t.observaciones || "");
                              setTicketStatus(t.estado);
                            }}
                            className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 font-montserrat font-bold uppercase tracking-wider"
                          >
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            Responder / Editar
                          </button>
                        )}
                      </div>

                      {/* Ticket problem description */}
                      <div className="font-montserrat text-xs text-white/90 bg-background/30 p-4 rounded-lg border border-outline-variant/5 leading-relaxed">
                        <p className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">Descripción del Cliente:</p>
                        {t.descripcion}
                      </div>

                      {/* Current response if any */}
                      {(t.solucion || t.observaciones) && resolvingTicketId !== t.id && (
                        <div className="font-montserrat text-xs text-emerald-300 bg-emerald-950/20 p-4 rounded-lg border border-emerald-500/10 space-y-1 leading-relaxed">
                          <p className="font-bold uppercase tracking-widest text-[10px] text-emerald-400">Respuesta Registrada:</p>
                          {t.solucion && <p><strong>Solución:</strong> {t.solucion}</p>}
                          {t.observaciones && <p className="text-on-surface-variant/80 italic"><strong>Observaciones:</strong> {t.observaciones}</p>}
                        </div>
                      )}

                      {/* Response Form */}
                      {resolvingTicketId === t.id && (
                        <form onSubmit={handleResolveTicket} className="space-y-4 p-4 rounded-lg bg-surface-container border border-outline-variant/15 animate-fade-in font-montserrat text-xs">
                          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                            <h5 className="font-bold text-white uppercase text-[10px] tracking-wider text-primary">
                              Escribir Respuesta del Técnico
                            </h5>
                            <button
                              type="button"
                              onClick={() => setResolvingTicketId(null)}
                              className="text-on-surface-variant hover:text-white"
                            >
                              Cancelar
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 space-y-1">
                              <label htmlFor={`solucion-${t.id}`} className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Diagnóstico / Solución</label>
                              <textarea
                                id={`solucion-${t.id}`}
                                required
                                rows={3}
                                value={solucionText}
                                onChange={(e) => setSolucionText(e.target.value)}
                                placeholder="Describe el procedimiento técnico realizado..."
                                className="w-full bg-background border border-outline-variant/20 rounded p-2 text-white focus:outline-none focus:border-primary-container"
                              />
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label htmlFor={`obs-${t.id}`} className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Observaciones Internas</label>
                                <textarea
                                  id={`obs-${t.id}`}
                                  rows={2}
                                  value={obsText}
                                  onChange={(e) => setObsText(e.target.value)}
                                  placeholder="Detalles adicionales..."
                                  className="w-full bg-background border border-outline-variant/20 rounded p-2 text-white focus:outline-none focus:border-primary-container"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Nuevo Estado del Ticket</label>
                                <select
                                  value={ticketStatus}
                                  onChange={(e) => setTicketStatus(e.target.value)}
                                  className="w-full bg-background border border-outline-variant/20 rounded px-2.5 py-1.5 text-white focus:outline-none"
                                >
                                  <option value="abierto">Abierto</option>
                                  <option value="en_proceso">En Proceso</option>
                                  <option value="resuelto">Resuelto (Cerrar)</option>
                                  <option value="cerrado">Cerrado Administrativamente</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/10">
                            <button
                              type="button"
                              onClick={() => setResolvingTicketId(null)}
                              className="btn-secondary py-2 px-4 text-[10px]"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="btn-primary py-2 px-6 text-[10px]"
                            >
                              Guardar Respuesta
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CRM & LEADS PIPELINE */}
        {activeTab === "crm" && (

          <div className="space-y-8 animate-fade-in">
            {/* Header and Controls */}
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h3 className="font-poppins text-headline-sm font-bold text-white flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                  Pipeline de Ventas & Seguimiento CRM
                </h3>
                <p className="font-montserrat text-xs text-on-surface-variant mt-1">
                  Gestiona cotizaciones del configurador, programa recordatorios de compra y cierra ventas por WhatsApp con garantía local en Huancayo.
                </p>
              </div>

              {/* View Switcher & Search */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar por cliente, cel o ID..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-montserrat focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex rounded-lg border border-outline-variant/20 p-1 bg-surface-container-lowest font-montserrat text-xs">
                  <button
                    onClick={() => setCrmView("kanban")}
                    className={`px-3 py-1.5 rounded flex items-center gap-1 font-bold ${
                      crmView === "kanban" ? "bg-primary text-surface-container-lowest" : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">view_kanban</span>
                    Kanban
                  </button>
                  <button
                    onClick={() => setCrmView("table")}
                    className={`px-3 py-1.5 rounded flex items-center gap-1 font-bold ${
                      crmView === "table" ? "bg-primary text-surface-container-lowest" : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">table_rows</span>
                    Lista
                  </button>
                  <button
                    onClick={() => setCrmView("urgent")}
                    className={`px-3 py-1.5 rounded flex items-center gap-1 font-bold ${
                      crmView === "urgent" ? "bg-tertiary text-surface-container-lowest" : "text-on-surface-variant hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">notification_important</span>
                    Seguimientos Pendientes ({leads.filter((l) => l.estado === "seguimiento_pendiente" || l.estado === "nuevo").length})
                  </button>
                </div>
              </div>
            </div>

            {/* CRM KPI Metrics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="glass-card p-4 rounded-xl border border-primary/20">
                <span className="text-[10px] font-montserrat font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Total Leads / Cotizaciones
                </span>
                <span className="text-2xl font-poppins font-bold text-white">{leads.length}</span>
              </div>
              <div className="glass-card p-4 rounded-xl border border-primary/30 bg-primary/5">
                <span className="text-[10px] font-montserrat font-bold text-primary uppercase tracking-wider block mb-1">
                  Nuevos sin contactar
                </span>
                <span className="text-2xl font-poppins font-bold text-primary">
                  {leads.filter((l) => l.estado === "nuevo").length}
                </span>
              </div>
              <div className="glass-card p-4 rounded-xl border border-tertiary/30 bg-tertiary/5">
                <span className="text-[10px] font-montserrat font-bold text-tertiary uppercase tracking-wider block mb-1">
                  Re-engagement Pendiente
                </span>
                <span className="text-2xl font-poppins font-bold text-tertiary">
                  {leads.filter((l) => l.estado === "seguimiento_pendiente").length}
                </span>
              </div>
              <div className="glass-card p-4 rounded-xl border border-cyan-400/20">
                <span className="text-[10px] font-montserrat font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Monto en Pipeline
                </span>
                <span className="text-2xl font-poppins font-bold text-cyan-400 font-mono">
                  S/. {leads.filter((l) => l.estado !== "perdido" && l.estado !== "ganado").reduce((acc, l) => acc + (l.precioEstimado || 0), 0).toLocaleString("es-PE")}
                </span>
              </div>
              <div className="glass-card p-4 rounded-xl border border-emerald-400/20">
                <span className="text-[10px] font-montserrat font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Ventas Cerradas (Ganados)
                </span>
                <span className="text-2xl font-poppins font-bold text-emerald-400 font-mono">
                  S/. {leads.filter((l) => l.estado === "ganado").reduce((acc, l) => acc + (l.precioEstimado || 0), 0).toLocaleString("es-PE")}
                </span>
              </div>
            </div>

            {/* KANBAN VIEW */}
            {crmView === "kanban" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
                {[
                  { id: "nuevo" as LeadStatus, label: "Nuevas Cotizaciones", color: "border-primary text-primary", bg: "bg-primary/5", icon: "fiber_new" },
                  { id: "en_contacto" as LeadStatus, label: "En Asesoría", color: "border-cyan-400 text-cyan-400", bg: "bg-cyan-500/5", icon: "chat" },
                  { id: "seguimiento_pendiente" as LeadStatus, label: "Re-engagement ⏰", color: "border-tertiary text-tertiary", bg: "bg-tertiary/5", icon: "history_toggle_off" },
                  { id: "cotizado" as LeadStatus, label: "Cotización Formal", color: "border-purple-400 text-purple-400", bg: "bg-purple-500/5", icon: "receipt_long" },
                  { id: "ganado" as LeadStatus, label: "Cerrado / Ganado", color: "border-emerald-400 text-emerald-400", bg: "bg-emerald-500/5", icon: "check_circle" },
                  { id: "perdido" as LeadStatus, label: "Descartado", color: "border-outline-variant text-on-surface-variant", bg: "bg-surface-container-lowest", icon: "cancel" },
                ].map((col) => {
                  const columnLeads = leads.filter((l) => {
                    const matchesStatus = l.estado === col.id;
                    const matchesSearch =
                      leadSearch === "" ||
                      l.clienteNombre?.toLowerCase().includes(leadSearch.toLowerCase()) ||
                      l.clienteTelefono?.includes(leadSearch) ||
                      l.id.toLowerCase().includes(leadSearch.toLowerCase());
                    return matchesStatus && matchesSearch;
                  });

                  return (
                    <div
                      key={col.id}
                      className="glass-panel p-3.5 rounded-xl border border-outline-variant/15 flex flex-col min-h-[450px] bg-surface-container-lowest/60"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`material-symbols-outlined text-base ${col.color}`}>{col.icon}</span>
                          <h4 className="font-poppins text-xs font-bold text-white tracking-wide truncate">{col.label}</h4>
                        </div>
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-full border ${col.color} ${col.bg}`}>
                          {columnLeads.length}
                        </span>
                      </div>

                      {/* Cards Container */}
                      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
                        {columnLeads.map((lead) => {
                          const code = `#LUTE-${lead.id.slice(0, 6).toUpperCase()}`;
                          const cpu = lead.setupConfigurado?.componentes?.procesadores?.nombre;
                          const gpu = lead.setupConfigurado?.componentes?.graficas?.nombre;

                          return (
                            <div
                              key={lead.id}
                              onClick={() => setSelectedLead(lead)}
                              className="glass-card p-3.5 rounded-lg border border-outline-variant/20 hover:border-primary/50 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg space-y-2 bg-surface-container/40"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-mono text-[10px] text-primary font-bold">{code}</span>
                                <span className="text-[10px] font-montserrat text-on-surface-variant flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[11px]">location_on</span>
                                  {lead.clienteCiudad || "Huancayo"}
                                </span>
                              </div>

                              <div>
                                <p className="font-montserrat text-xs font-bold text-white truncate" title={lead.clienteNombre}>
                                  {lead.clienteNombre}
                                </p>
                                <p className="font-montserrat text-[11px] text-on-surface-variant flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px] text-emerald-400">call</span>
                                  {lead.clienteTelefono}
                                </p>
                              </div>

                              {/* Specs quick view */}
                              {(cpu || gpu) && (
                                <div className="p-1.5 rounded bg-surface-container-lowest text-[10px] font-montserrat text-on-surface-variant space-y-0.5">
                                  {cpu && <p className="truncate">⚡ {cpu}</p>}
                                  {gpu && <p className="truncate">🎮 {gpu}</p>}
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-2 border-t border-outline-variant/10">
                                <span className="font-poppins text-xs font-bold text-primary font-mono">
                                  S/. {lead.precioEstimado?.toLocaleString("es-PE") || 0}
                                </span>

                                <div className="flex items-center gap-1">
                                  {lead.intentosSeguimiento > 0 && (
                                    <span
                                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary border border-tertiary/30"
                                      title={`${lead.intentosSeguimiento} recordatorios enviados`}
                                    >
                                      🔔 {lead.intentosSeguimiento}
                                    </span>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedLead(lead);
                                    }}
                                    className="p-1 text-on-surface-variant hover:text-white rounded"
                                    title="Ver Ficha y WhatsApp"
                                  >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {columnLeads.length === 0 && (
                          <div className="text-center py-8 text-on-surface-variant/40 font-montserrat text-[11px] italic">
                            Sin cotizaciones
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TABLE / URGENT VIEW */}
            {(crmView === "table" || crmView === "urgent") && (
              <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 overflow-x-auto">
                <table className="w-full text-left font-montserrat text-body-sm border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/30 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase">
                      <th className="pb-3">Código</th>
                      <th className="pb-3">Cliente</th>
                      <th className="pb-3">WhatsApp / Cel</th>
                      <th className="pb-3">Setup / Hardware</th>
                      <th className="pb-3">Monto Total</th>
                      <th className="pb-3">Estado</th>
                      <th className="pb-3">Recordatorios</th>
                      <th className="pb-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-xs">
                    {leads
                      .filter((lead) => {
                        if (crmView === "urgent") {
                          if (lead.estado !== "nuevo" && lead.estado !== "seguimiento_pendiente") return false;
                        }
                        if (leadSearch) {
                          const matches =
                            lead.clienteNombre?.toLowerCase().includes(leadSearch.toLowerCase()) ||
                            lead.clienteTelefono?.includes(leadSearch) ||
                            lead.id.toLowerCase().includes(leadSearch.toLowerCase());
                          if (!matches) return false;
                        }
                        return true;
                      })
                      .map((lead) => {
                        const code = `#LUTE-${lead.id.slice(0, 6).toUpperCase()}`;
                        return (
                          <tr key={lead.id} className="hover:bg-surface-container/40 transition-colors">
                            <td className="py-3 font-mono text-primary font-bold">{code}</td>
                            <td className="py-3 font-bold text-white">
                              <div>{lead.clienteNombre}</div>
                              <span className="text-[10px] font-normal text-on-surface-variant">{lead.clienteCiudad || "Huancayo"}</span>
                            </td>
                            <td className="py-3 font-mono text-on-surface-variant">{lead.clienteTelefono}</td>
                            <td className="py-3 text-on-surface-variant max-w-[200px] truncate">
                              {lead.setupConfigurado?.componentes?.procesadores?.nombre || "Setup Personalizado"}
                            </td>
                            <td className="py-3 font-mono font-bold text-primary">
                              S/. {lead.precioEstimado?.toLocaleString("es-PE") || 0}
                            </td>
                            <td className="py-3">
                              <select
                                value={lead.estado}
                                onChange={(e) => {
                                  updateLeadStatus(lead.id, e.target.value as LeadStatus);
                                  showToast(`Estado actualizado a ${e.target.value}`, "success");
                                }}
                                className="bg-surface-container-lowest border border-outline-variant/30 rounded px-2 py-1 text-white font-montserrat text-xs focus:border-primary focus:outline-none"
                              >
                                <option value="nuevo">Nuevo</option>
                                <option value="en_contacto">En Asesoría</option>
                                <option value="seguimiento_pendiente">Seguimiento Pendiente</option>
                                <option value="cotizado">Cotizado</option>
                                <option value="ganado">Ganado</option>
                                <option value="perdido">Perdido</option>
                              </select>
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-tertiary/10 text-tertiary border border-tertiary/30">
                                {lead.intentosSeguimiento || 0} contactos
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => setSelectedLead(lead)}
                                className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 ml-auto"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                Gestionar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ─── MODAL: DETALLE Y GESTIÓN DE LEAD / CRM WHATSAPP ─── */}
            {selectedLead && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="glass-panel max-w-3xl w-full p-6 md:p-8 rounded-2xl border border-primary/30 max-h-[90vh] overflow-y-auto relative animate-fade-in shadow-2xl">
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="absolute top-5 right-5 text-on-surface-variant hover:text-white p-1"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline-variant/15 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30">
                          #LUTE-{selectedLead.id.slice(0, 6).toUpperCase()}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          Origen: {selectedLead.origen}
                        </span>
                      </div>
                      <h3 className="font-poppins text-headline-sm font-bold text-white">
                        {selectedLead.clienteNombre}
                      </h3>
                      <p className="font-montserrat text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                        <span>📍 {selectedLead.clienteCiudad || "Huancayo"}</span>
                        <span>•</span>
                        <span>📱 {selectedLead.clienteTelefono}</span>
                        {selectedLead.clienteEmail && (
                          <>
                            <span>•</span>
                            <span>✉️ {selectedLead.clienteEmail}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Quick Status Dropdown */}
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-[10px] font-montserrat text-on-surface-variant uppercase tracking-wider font-bold">
                        Estado Actual
                      </span>
                      <select
                        value={selectedLead.estado}
                        onChange={async (e) => {
                          const newStatus = e.target.value as LeadStatus;
                          await updateLeadStatus(selectedLead.id, newStatus);
                          setSelectedLead({ ...selectedLead, estado: newStatus });
                          showToast(`Estado actualizado a "${newStatus}".`, "success");
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-primary/50 text-primary font-montserrat text-xs font-bold focus:outline-none"
                      >
                        <option value="nuevo">✨ Nuevo</option>
                        <option value="en_contacto">💬 En Asesoría / Contacto</option>
                        <option value="seguimiento_pendiente">⏰ Seguimiento Pendiente</option>
                        <option value="cotizado">📄 Cotizado Formal</option>
                        <option value="ganado">🏆 Venta Ganada</option>
                        <option value="perdido">❌ Descartado</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Hardware Specs & Budget */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/10">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-montserrat text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">desktop_windows</span>
                            Setup Cotizado
                          </h4>
                          <span className="font-poppins text-lg font-bold text-primary font-mono">
                            S/. {selectedLead.precioEstimado?.toLocaleString("es-PE")}
                          </span>
                        </div>

                        {selectedLead.setupConfigurado?.componentes ? (
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs font-montserrat">
                            {Object.entries(selectedLead.setupConfigurado.componentes).map(([cat, prod]: [string, any]) => (
                              <div key={cat} className="flex justify-between items-center py-1 border-b border-outline-variant/5 last:border-b-0">
                                <span className="text-on-surface-variant uppercase text-[10px] w-20 shrink-0">{cat}:</span>
                                <span className="text-white truncate font-medium max-w-[170px]" title={prod.nombre}>{prod.nombre}</span>
                                <span className="text-primary font-mono font-bold shrink-0">S/. {prod.precio}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs italic text-on-surface-variant">Sin desglose de componentes específico.</p>
                        )}

                        {selectedLead.consultaTexto && (
                          <div className="mt-3 pt-3 border-t border-outline-variant/10 text-xs font-montserrat">
                            <span className="text-on-surface-variant font-bold">Mensaje del cliente:</span>
                            <p className="text-white mt-0.5 bg-surface-container-lowest p-2 rounded border border-outline-variant/10">
                              "{selectedLead.consultaTexto}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Add Internal Note */}
                      <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/10 space-y-3">
                        <h4 className="font-montserrat text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-tertiary">edit_note</span>
                          Añadir Nota Interna
                        </h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ej. Pidió descuento de S/ 50 por pago en efectivo..."
                            value={newInternalNote}
                            onChange={(e) => setNewInternalNote(e.target.value)}
                            className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-xs text-white font-montserrat focus:border-primary focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (newInternalNote.trim()) {
                                  addLeadInternalNote(selectedLead.id, newInternalNote.trim(), user.email || "Admin");
                                  setNewInternalNote("");
                                  showToast("Nota agregada.", "success");
                                }
                              }
                            }}
                          />
                          <button
                            onClick={async () => {
                              if (!newInternalNote.trim()) return;
                              await addLeadInternalNote(selectedLead.id, newInternalNote.trim(), user.email || "Admin");
                              setNewInternalNote("");
                              showToast("Nota agregada.", "success");
                            }}
                            className="btn-primary px-4 text-xs shrink-0"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: WhatsApp Smart Re-engagement Generator & Timeline */}
                    <div className="space-y-4">
                      {/* WhatsApp Tool */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-surface-container-low/40 border border-emerald-500/30 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-montserrat text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-emerald-400">send</span>
                            Seguimiento por WhatsApp
                          </h4>
                          <span className="text-[10px] text-on-surface-variant font-mono">
                            {selectedLead.intentosSeguimiento || 0} contactos previos
                          </span>
                        </div>

                        {/* Template selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                            Seleccionar Plantilla del Ciclo
                          </label>
                          <select
                            value={crmTemplateType}
                            onChange={(e) => setCrmTemplateType(e.target.value as any)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-white font-montserrat focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="bienvenida">👋 1. Bienvenida & Asesoría Inicial</option>
                            <option value="recordatorio_1">⏰ 2. Recordatorio 24-48h (Dudas Técnicas)</option>
                            <option value="ajuste_presupuesto">💡 3. Ajuste de Presupuesto (Alternativas)</option>
                            <option value="oferta_cierre">🎁 4. Oferta Especial & Garantía Extendida</option>
                          </select>
                        </div>

                        {/* Message Preview Box */}
                        <div className="p-3 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/15 text-[11px] font-montserrat text-on-surface leading-relaxed max-h-[140px] overflow-y-auto">
                          {(() => {
                            const code = `#LUTE-${selectedLead.id.slice(0, 6).toUpperCase()}`;
                            const name = selectedLead.clienteNombre || "Cliente";
                            const totalStr = `S/. ${(selectedLead.precioEstimado || 0).toLocaleString("es-PE")}`;
                            const cpu = selectedLead.setupConfigurado?.componentes?.procesadores?.nombre || "CPU";
                            const gpu = selectedLead.setupConfigurado?.componentes?.graficas?.nombre || "GPU";

                            if (crmTemplateType === "bienvenida") {
                              return `¡Hola ${name}! 👋 Te saluda el equipo técnico y comercial de Luteame Huancayo. Recibimos tu cotización (${code}) con ${cpu} y ${gpu} por ${totalStr}. ¿Te gustaría coordinar disponibilidad o método de entrega en Huancayo?`;
                            }
                            if (crmTemplateType === "recordatorio_1") {
                              return `Hola ${name}, ¿cómo estás? 👋 Te escribimos de Luteame para saber si pudiste revisar la cotización de tu PC (${code} - ${totalStr}). ¿Tienes alguna duda sobre compatibilidad o financiamiento?`;
                            }
                            if (crmTemplateType === "ajuste_presupuesto") {
                              return `¡Hola ${name}! 🛠️ Notamos que tu cotización (${code}) por ${totalStr} sigue guardada. Si deseas optimizar el presupuesto, podemos sugerirte alternativas con el mismo rendimiento. ¿Te gustaría afinarla?`;
                            }
                            return `¡Hola ${name}! 🎁 Esta semana en Luteame incluimos ensamblaje profesional y 2 años de garantía local sin costo para tu cotización (${code} - ${totalStr}). ¿Deseas que reservemos tus piezas?`;
                          })()}
                        </div>

                        {/* Send Action Button */}
                        <button
                          disabled={isSavingLeadAction}
                          onClick={async () => {
                            setIsSavingLeadAction(true);
                            try {
                              const code = `#LUTE-${selectedLead.id.slice(0, 6).toUpperCase()}`;
                              const name = selectedLead.clienteNombre || "Cliente";
                              const totalStr = `S/. ${(selectedLead.precioEstimado || 0).toLocaleString("es-PE")}`;
                              const cpu = selectedLead.setupConfigurado?.componentes?.procesadores?.nombre || "CPU";
                              const gpu = selectedLead.setupConfigurado?.componentes?.graficas?.nombre || "GPU";

                              let message = "";
                              if (crmTemplateType === "bienvenida") {
                                message = `¡Hola ${name}! 👋 Te saluda el equipo técnico y comercial de *Luteame Huancayo*.\n\nRecibimos la cotización de tu setup personalizado (${code}) con ${cpu} y ${gpu} por un valor de *${totalStr}*.\n\n¿Te gustaría coordinar detalles sobre disponibilidad inmediata, opciones de pago o entrega en Huancayo? Estamos listos para ayudarte. 🚀`;
                              } else if (crmTemplateType === "recordatorio_1") {
                                message = `Hola ${name}, ¿cómo estás? 👋 Te escribimos de *Luteame* para saber si pudiste revisar la cotización de tu PC (${code} - ${totalStr}).\n\n¿Tienes alguna duda sobre compatibilidad de piezas, garantía o tiempos de ensamblaje? Quedamos a tu disposición para asesorarte. 😊`;
                              } else if (crmTemplateType === "ajuste_presupuesto") {
                                message = `¡Hola ${name}! Te saludamos de *Luteame*. 🛠️ Notamos que tu cotización (${code}) por ${totalStr} sigue guardada.\n\nSi deseas ajustar el presupuesto, podemos sugerirte componentes alternativos con el mismo rendimiento para que no te quedes sin tu setup. ¿Te gustaría que te preparemos una opción optimizada?`;
                              } else {
                                message = `¡Hola ${name}! 🎁 En *Luteame* tenemos una promoción especial de cierre esta semana: por la compra de tu setup (${code}), incluimos *ensamblaje profesional, testeo térmico y 2 años de garantía local sin costo adicional*.\n\n¿Deseas que reservemos tus componentes hoy?`;
                              }

                              const cleanPhone = selectedLead.clienteTelefono.replace(/[^0-9]/g, "");
                              const fullPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;
                              const wspUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;

                              // Log follow up action
                              await registerFollowUpAction(
                                selectedLead.id,
                                {
                                  fecha: new Date().toISOString(),
                                  tipo: crmTemplateType as any,
                                  comentario: `WhatsApp enviado: plantilla "${crmTemplateType}"`,
                                  autor: user.email || "Admin",
                                },
                                selectedLead.estado === "nuevo" ? "en_contacto" : selectedLead.estado,
                                new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                              );

                              window.open(wspUrl, "_blank");
                              showToast("WhatsApp abierto y recordatorio registrado en bitácora.", "success");
                            } catch (err) {
                              console.error("Error sending WhatsApp follow up:", err);
                              showToast("Error al registrar seguimiento.", "info");
                            } finally {
                              setIsSavingLeadAction(false);
                            }
                          }}
                          className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-montserrat text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <span className="material-symbols-outlined text-base">chat</span>
                          Abrir WhatsApp y Registrar Recordatorio
                        </button>
                      </div>

                      {/* Interaction History Timeline */}
                      <div className="p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/10 space-y-3">
                        <h4 className="font-montserrat text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-base text-primary">history</span>
                          Bitácora de Interacciones & Notas
                        </h4>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-xs font-montserrat">
                          {/* Internal Notes */}
                          {selectedLead.notasInternas?.map((note, idx) => (
                            <div key={`note_${idx}`} className="p-2 rounded bg-surface-container-lowest border border-outline-variant/10 text-white font-mono text-[11px]">
                              {note}
                            </div>
                          ))}

                          {/* Follow-up history records */}
                          {selectedLead.historialSeguimiento?.map((item) => (
                            <div key={item.id} className="p-2 rounded bg-surface-container-lowest border border-outline-variant/10 flex flex-col gap-0.5">
                              <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-mono">
                                <span className="text-emerald-400 font-bold">{item.tipo}</span>
                                <span>{new Date(item.fecha).toLocaleString("es-PE")}</span>
                              </div>
                              <p className="text-white text-[11px]">{item.comentario}</p>
                              <span className="text-[9px] text-on-surface-variant/60">Por: {item.autor}</span>
                            </div>
                          ))}

                          {(!selectedLead.notasInternas || selectedLead.notasInternas.length === 0) &&
                            (!selectedLead.historialSeguimiento || selectedLead.historialSeguimiento.length === 0) && (
                              <p className="text-xs italic text-on-surface-variant/50 text-center py-2">
                                Sin registros de seguimiento previos.
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

