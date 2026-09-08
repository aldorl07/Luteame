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

// ─── CRM & Lead Types ────────────────────────────────────────────────────────
export type LeadStatus =
  | "nuevo"
  | "en_contacto"
  | "seguimiento_pendiente"
  | "cotizado"
  | "ganado"
  | "perdido";

export type FollowUpType =
  | "recordatorio_1"
  | "ajuste_presupuesto"
  | "promocion_cierre"
  | "llamada"
  | "mensaje_whatsapp"
  | "correo"
  | "nota_interna";

export interface FollowUpRecord {
  id: string;
  fecha: string; // ISO date string
  tipo: FollowUpType;
  comentario: string;
  autor: string;
}

export interface LeadSetupSummary {
  componentes: Record<string, { id: string; nombre: string; categoria: ProductCategory; precio: number }>;
  precioTotal: number;
  usoRecomendado?: NecesidadUso | string;
  compatible: boolean;
}

export interface Lead {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  clienteCiudad?: string;
  origen: "configurador" | "tienda" | "soporte" | "chat" | "manual";
  consultaTexto?: string;
  setupConfigurado?: LeadSetupSummary;
  precioEstimado: number;
  estado: LeadStatus;
  prioridad: "baja" | "media" | "alta";
  intentosSeguimiento: number;
  ultimoContacto?: string;
  proximoSeguimiento?: string;
  historialSeguimiento: FollowUpRecord[];
  notasInternas?: string[];
  fechaCreacion: Timestamp | any;
  fechaActualizacion?: Timestamp | any;
}

// ─── Order & Payment Proof Types ─────────────────────────────────────────────
export type PaymentMethod =
  | "yape_plin"
  | "transferencia"
  | "tarjeta"
  | "efectivo_tienda";

export type OrderStatus =
  | "pendiente"
  | "pago_en_revision"
  | "pagado"
  | "en_ensamblaje"
  | "pruebas_estres"
  | "listo_entrega"
  | "enviado"
  | "completado"
  | "cancelado";

export interface OrderPaymentProof {
  voucherUrl?: string;          // Data URL or Image URL
  numeroOperacion?: string;     // Transaction reference code
  fechaPago?: string;           // Timestamp
  metodoPago: PaymentMethod | string;
  montoReportado: number;
  notasCliente?: string;
  verificadoPorAdmin?: boolean;
  fechaVerificacion?: string;
  verificadoPor?: string;
}

export interface OrderItemComponent {
  categoria: string;
  nombre: string;
  precio: number;
}

export interface OrderItem {
  nombre: string;
  tipo: CartItemType;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  componentes?: OrderItemComponent[] | null;
}

export interface Order {
  id: string;
  clienteId?: string;
  clienteNombre: string;
  clienteEmail: string;
  telefono: string;
  direccion: string;
  metodoPago: PaymentMethod | string;
  comprobantePago?: OrderPaymentProof;
  detallesPago?: {
    referencia?: string;
    voucherUrl?: string;
    tarjetaUltimosCuatro?: string;
    banco?: string;
  };
  items: OrderItem[];
  total: number;
  estado: OrderStatus | string;
  fecha?: Timestamp | any;
  fechaActualizacion?: Timestamp | any;
  notasAdmin?: string;
}



