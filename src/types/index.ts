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
  | "escritorios"
  | "monitores"
  | "teclados"
  | "mouse"
  | "headsets"
  | "microfonos"
  | "webcams"
  | "mousepads"
  | "accesorios"
  | "software"
  | "servicios";

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
  rol: "cliente" | "admin" | "tecnico";
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

export type CartItemType = "producto" | "pc_configurada" | "servicio";

export interface CartItem {
  id: string; // Para productos/servicios es su productId, para setups es un hash/id único
  tipo: CartItemType;
  nombre: string;
  precioUnitario: number;
  precioTotal: number;
  cantidad: number;
  imagenUrl: string;
  categoria?: ProductCategory;
  // Detalle de la PC si el tipo es 'pc_configurada'
  componentesConfigurados?: Record<string, Product>;
}

// Configurator Wizard Types
export type NecesidadUso =
  | "gaming"
  | "oficina"
  | "ingenieria"
  | "arquitectura"
  | "diseno"
  | "edicion"
  | "desarrollo"
  | "general";

export interface PresupuestoRango {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface CompatibilityReport {
  compatible: boolean;
  warnings: string[];
}

export const STEP_LABELS: Record<number, string> = {
  0: "Necesidad & Presupuesto",
  1: "Recomendación & Personalización",
  2: "Resumen de Setup",
};

export const STEP_ICONS: Record<number, string> = {
  0: "ads_click",
  1: "settings_suggest",
  2: "fact_check",
};

