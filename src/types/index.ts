// src/types/index.ts
import { Timestamp } from "firebase/firestore";

export type ProductCategory =
  | "procesadores"
  | "graficas"
  | "placas"
  | "ram"
  | "almacenamiento"
  | "fuentes"
  | "refrigeracion"
  | "gabinetes"
  | "escritorios";

export interface Product {
  id: string;
  nombre: string;
  categoria: ProductCategory;
  precio: number;
  stock: number;
  imagenUrl: string;
  garantiaLocal: boolean;
  especificaciones: Record<string, string>;
  rating?: number;
  ratingCount?: number;
}

export interface UserProfile {
  uid: string;
  nombre: string;
  correo: string;
  rol: "cliente" | "admin";
  fechaRegistro: Timestamp;
}

export type SetupEstado = "pendiente" | "en_ensamblaje" | "completado";

export interface Setup {
  id?: string;
  usuarioId: string;
  componentes: string[];
  precioTotal: number;
  estado: SetupEstado;
  fechaCreacion: Timestamp;
}

export interface CartItem {
  productId: string;
  nombre: string;
  precio: number;
  imagenUrl: string;
  categoria: ProductCategory;
}

export type ConfiguratorStep = 0 | 1 | 2;

export const STEP_CATEGORIES: Record<number, ProductCategory> = {
  0: "escritorios",
  1: "procesadores",
  2: "refrigeracion",
};

export const STEP_LABELS: Record<number, string> = {
  0: "Elegir Escritorio",
  1: "Componentes PC",
  2: "Refrigeración & Estética",
};

export const STEP_ICONS: Record<number, string> = {
  0: "desk",
  1: "memory",
  2: "ac_unit",
};
