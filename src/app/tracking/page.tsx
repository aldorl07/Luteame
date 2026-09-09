"use client";
// src/app/tracking/page.tsx

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { getOrderById, subscribeToOrderById, subscribeToOrdersByCustomer } from "@/lib/firestore";
import { Order } from "@/types";

const CATEGORY_LABELS: Record<string, string> = {
  procesadores: "Procesador (CPU)",
  graficas: "Tarjeta Gráfica (GPU)",
  placas: "Placa Madre",
  ram: "Memoria RAM",
  almacenamiento: "Almacenamiento",
  fuentes: "Fuente de Poder",
  gabinetes: "Gabinete / Case",
  refrigeracion: "Refrigeración / Cooler",
  monitores: "Monitor Gaming",
  teclados: "Teclado",
  mousepads: "Mousepad",
  headsets: "Headset / Audífonos",
  webcams: "Cámara Web",
  software: "Software / Licencia",
  escritorios: "Escritorio Luteame",
};

interface StepConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
}

const TRACKING_STEPS: StepConfig[] = [
  {
    id: "registrado",
    title: "Pedido Registrado",
    subtitle: "Orden ingresada al sistema de LUTEAME Huancayo.",
    icon: "receipt_long",
  },
  {
    id: "pago",
    title: "Validación de Pago",
    subtitle: "Verificación de voucher Yape, Plin o Transferencia.",
    icon: "verified_user",
  },
  {
    id: "ensamblaje",
    title: "Banco de Ensamblaje",
    subtitle: "Montaje técnico, optimización de airflow y cable management.",
    icon: "build",
  },
  {
    id: "benchmarks",
    title: "Pruebas de Estrés",
    subtitle: "Benchmarks térmicos (Cinebench/FurMark) y update de BIOS.",
    icon: "speed",
  },
  {
    id: "entrega",
    title: "Listo para Despacho",
    subtitle: "Empaque gamer seguro con accesorios y manuales originales.",
    icon: "local_shipping",
  },
  {
    id: "completado",
    title: "Entregado & Garantía",
    subtitle: "Setup en manos del cliente. Garantía local de 2 años activa.",
    icon: "workspace_premium",
  },
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthContext();

  const urlId = searchParams.get("id") || "";
  const [searchInput, setSearchInput] = useState(urlId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User's orders list
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingUserOrders, setLoadingUserOrders] = useState(false);

  // Lightbox for voucher preview
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  // If user is logged in, subscribe to their orders
  useEffect(() => {
    if (!user) return;
    setLoadingUserOrders(true);
    const unsubscribe = subscribeToOrdersByCustomer(user.uid || user.email || "", (orders) => {
      setUserOrders(orders);
      setLoadingUserOrders(false);
    });

    return () => unsubscribe();
  }, [user]);

  // If URL has ID, search on initial load
  useEffect(() => {
    if (urlId) {
      setSearchInput(urlId);
      performSearch(urlId);
    }
  }, [urlId]);

  // Real-time subscription to current selected order doc
  useEffect(() => {
    if (!order?.id) return;
    const unsubscribe = subscribeToOrderById(order.id, (updatedOrder) => {
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    });

    return () => unsubscribe();
  }, [order?.id]);

  const performSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setLoadingOrder(true);
    setErrorMessage(null);

    try {
      const found = await getOrderById(trimmed);
      if (found) {
        setOrder(found);
        setErrorMessage(null);
      } else {
        setOrder(null);
        setErrorMessage(
          `No se encontró ningún pedido con el código "${trimmed}". Verifica el código de tu recibo o contáctanos por WhatsApp.`
        );
      }
    } catch (err) {
      console.error("Error searching order:", err);
      setErrorMessage("Ocurrió un error al consultar el pedido. Inténtalo nuevamente.");
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    router.push(`/tracking?id=${encodeURIComponent(searchInput.trim())}`);
    performSearch(searchInput);
  };

  // Helper to determine step status
  const getStepStatus = (stepIndex: number, currentOrder: Order) => {
    const estado = currentOrder.estado || "pendiente";
    const isPagoVerificado = Boolean(currentOrder.comprobantePago?.verificadoPorAdmin);
    const isPagoRechazado = estado === "pago_rechazado";
    const isTarjeta = currentOrder.metodoPago === "tarjeta";

    // Step 0: Registrado
    if (stepIndex === 0) {
      return { state: "completed", label: "Completado" };
    }

    // Step 1: Validación de Pago
    if (stepIndex === 1) {
      if (isPagoRechazado) {
        return { state: "error", label: "Comprobante Rechazado" };
      }
      if (isPagoVerificado || isTarjeta || estado === "en_ensamblaje" || estado === "pruebas_estres" || estado === "listo_entrega" || estado === "enviado" || estado === "completado") {
        return { state: "completed", label: "Pago Verificado" };
      }
      if (currentOrder.comprobantePago?.voucherUrl || estado === "pago_en_revision") {
        return { state: "current", label: "En Revisión Técnica" };
      }
      return { state: "pending", label: "Pendiente de Voucher" };
    }

    // Step 2: Ensamblaje
    if (stepIndex === 2) {
      if (estado === "en_ensamblaje") {
        return { state: "current", label: "En Armado y Cableado" };
      }
      if (estado === "pruebas_estres" || estado === "listo_entrega" || estado === "enviado" || estado === "completado") {
        return { state: "completed", label: "Ensamblaje Finalizado" };
      }
      return { state: "pending", label: "En Espera de Pago" };
    }

    // Step 3: Pruebas de Estrés & Benchmarks
    if (stepIndex === 3) {
      if (estado === "pruebas_estres") {
        return { state: "current", label: "Ejecutando Benchmarks" };
      }
      if (estado === "listo_entrega" || estado === "enviado" || estado === "completado") {
        return { state: "completed", label: "Estabilidad 100% OK" };
      }
      return { state: "pending", label: "Pendiente" };
    }

    // Step 4: Listo para Entrega
    if (stepIndex === 4) {
      if (estado === "listo_entrega" || estado === "enviado") {
        return { state: "current", label: "Listo para Despacho" };
      }
      if (estado === "completado") {
        return { state: "completed", label: "Despachado" };
      }
      return { state: "pending", label: "Pendiente" };
    }

    // Step 5: Completado / Garantía Activa
    if (stepIndex === 5) {
      if (estado === "completado") {
        return { state: "completed", label: "Garantía de 2 Años Activa" };
      }
      return { state: "pending", label: "Pendiente de Entrega" };
    }

    return { state: "pending", label: "Pendiente" };
  };

  const formattedId = order ? `LUTE-${order.id.substring(0, 8).toUpperCase()}` : "";
  const orderDate = order?.fecha ? new Date(order.fecha.seconds * 1000).toLocaleString("es-PE") : "—";
  const voucherUrl = order?.comprobantePago?.voucherUrl || order?.detallesPago?.voucherUrl;

  const waQueryMsg = order
    ? encodeURIComponent(
        `¡Hola LUTEAME! 👋 Deseo consultar sobre el estado de mi pedido *${formattedId}* por un total de *S/. ${order.total.toLocaleString("es-PE")}*. ¿Me podrían dar mayores alcances?`
      )
    : encodeURIComponent("¡Hola LUTEAME! 👋 Deseo consultar sobre el seguimiento de mi pedido.");

  return (
    <div className="section-container py-brand-md pb-brand-xl max-w-5xl animate-fade-in space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary/30 text-primary text-xs font-montserrat font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-base">radar</span>
          Trazabilidad en Vivo
        </div>
        <h1 className="font-poppins text-display-lg-mobile md:text-headline-md font-extrabold text-white">
          Seguimiento de tu Setup PC
        </h1>
        <p className="font-montserrat text-body-sm text-on-surface-variant leading-relaxed">
          Ingresa tu código de compra (ej. <strong className="text-primary font-mono">LUTE-A1B2C3D4</strong>) para monitorear en tiempo real la validación del pago, el ensamblaje en taller y las pruebas térmicas.
        </p>
      </div>

      {/* Search Bar Card */}
      <div className="glass-panel p-6 rounded-2xl border border-outline-variant/15 shadow-2xl max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              required
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="Ingresa tu código: LUTE-XXXXXXXX"
              className="input-glass pl-11 font-mono text-sm tracking-widest text-primary font-bold w-full uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={loadingOrder}
            className="btn-primary py-3 px-6 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 shrink-0"
          >
            {loadingOrder ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Rastreando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">near_me</span>
                Rastrear
              </>
            )}
          </button>
        </form>

        {/* Logged in Quick Select List */}
        {user && userOrders.length > 0 && !order && (
          <div className="mt-6 pt-4 border-t border-outline-variant/10 space-y-2.5">
            <p className="text-[11px] font-montserrat font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-sm">history</span>
              Tus Pedidos Recientes ({userOrders.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {userOrders.map((uo) => {
                const uoFormatted = `LUTE-${uo.id.substring(0, 8).toUpperCase()}`;
                return (
                  <button
                    key={uo.id}
                    onClick={() => {
                      setSearchInput(uoFormatted);
                      performSearch(uo.id);
                      router.push(`/tracking?id=${encodeURIComponent(uoFormatted)}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-primary-container/20 border border-outline-variant/20 hover:border-primary text-xs font-mono font-bold text-white transition-all flex items-center gap-2"
                  >
                    <span>{uoFormatted}</span>
                    <span className="text-[10px] text-primary">S/. {uo.total.toLocaleString("es-PE")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="glass-panel p-5 rounded-xl border border-error/30 bg-error/10 text-center max-w-2xl mx-auto animate-fade-in space-y-2">
          <div className="flex items-center justify-center gap-2 text-error font-bold text-sm">
            <span className="material-symbols-outlined">error</span>
            Pedido no encontrado
          </div>
          <p className="font-montserrat text-xs text-on-surface-variant leading-relaxed">
            {errorMessage}
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/51969445063?text=${waQueryMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#25D366] font-bold hover:underline"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
              Consultar con nuestro asesor en Huancayo por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ORDER RESULTS & TIMELINE */}
      {order && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Order Header Info */}
          <div className="glass-panel p-6 rounded-2xl border border-primary/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-outline-variant/10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-poppins text-xl md:text-2xl font-extrabold text-white">
                    {formattedId}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase font-bold tracking-wider ${
                      order.estado === "completado"
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                        : order.estado === "en_ensamblaje"
                        ? "border-tertiary/40 text-tertiary bg-tertiary/10"
                        : order.estado === "pruebas_estres"
                        ? "border-cyan-400/40 text-cyan-400 bg-cyan-400/10"
                        : order.estado === "pago_rechazado"
                        ? "border-error/40 text-error bg-error/10"
                        : "border-primary-container/40 text-primary bg-primary-container/10"
                    }`}
                  >
                    {order.estado.replace("_", " ")}
                  </span>
                </div>
                <p className="font-montserrat text-xs text-on-surface-variant">
                  Registrado el {orderDate} · Cliente: <strong className="text-white">{order.clienteNombre}</strong>
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 border-outline-variant/20 hover:border-primary transition-colors"
                  title="Imprimir Boleta / Comprobante"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span className="hidden sm:inline">Imprimir Boleta</span>
                </button>

                <a
                  href={`https://wa.me/51969445063?text=${waQueryMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-poppins font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-md shadow-[#25D366]/20 uppercase tracking-wider transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Stepper Progress Bar (Desktop & Mobile) */}
            <div className="pt-8 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
                {TRACKING_STEPS.map((step, idx) => {
                  const statusInfo = getStepStatus(idx, order);
                  const isCompleted = statusInfo.state === "completed";
                  const isCurrent = statusInfo.state === "current";
                  const isError = statusInfo.state === "error";

                  return (
                    <div key={step.id} className="relative flex md:flex-col items-center md:text-center gap-3.5 md:gap-2">
                      {/* Connecting Line (Desktop) */}
                      {idx < TRACKING_STEPS.length - 1 && (
                        <div
                          className={`hidden md:block absolute top-5 left-1/2 w-full h-1 -z-0 transition-colors duration-500 ${
                            isCompleted ? "bg-emerald-500" : "bg-outline-variant/20"
                          }`}
                        />
                      )}

                      {/* Icon Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 font-bold ${
                          isCompleted
                            ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                            : isCurrent
                            ? "bg-primary text-black border-2 border-primary-container animate-pulse shadow-[0_0_20px_rgba(167,0,254,0.5)]"
                            : isError
                            ? "bg-error text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                            : "bg-surface-container-high text-on-surface-variant border border-outline-variant/20"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isCompleted ? "check" : isError ? "close" : step.icon}
                        </span>
                      </div>

                      {/* Text Content */}
                      <div className="space-y-0.5">
                        <p className={`font-poppins text-xs font-bold ${isCurrent ? "text-primary" : isCompleted ? "text-emerald-400" : isError ? "text-error" : "text-white"}`}>
                          {step.title}
                        </p>
                        <p className="font-montserrat text-[10px] text-on-surface-variant/80 hidden md:block leading-tight">
                          {statusInfo.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Purchased Hardware & Specs Breakdown */}
            <div className="md:col-span-7 space-y-4">
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/15 space-y-4">
                <h3 className="font-poppins text-title-md font-bold text-white flex items-center gap-2 border-b border-outline-variant/10 pb-3">
                  <span className="material-symbols-outlined text-primary">dns</span>
                  Hardware y Configuración Adquirida
                </h3>

                <div className="space-y-3 divide-y divide-outline-variant/10">
                  {order.items?.map((item, idx) => {
                    const isPC = item.tipo === "pc_configurada" && item.componentes && item.componentes.length > 0;
                    return (
                      <div key={idx} className="pt-3 first:pt-0 space-y-2">
                        <div className="flex justify-between items-start font-montserrat text-xs">
                          <div>
                            <p className="font-bold text-white text-sm">{item.nombre}</p>
                            <p className="text-[10px] text-on-surface-variant capitalize">
                              {isPC ? "PC Ensamblada Gamer" : item.tipo.replace("_", " ")} · Cantidad: {item.cantidad}
                            </p>
                          </div>
                          <span className="font-mono text-primary font-bold text-sm shrink-0">
                            S/. {item.precioTotal.toLocaleString("es-PE")}
                          </span>
                        </div>

                        {/* Components Breakdown */}
                        {isPC && item.componentes && (
                          <div className="p-3 rounded-xl bg-surface-container-low/40 border border-outline-variant/10 space-y-1.5 text-[11px] font-montserrat">
                            <p className="text-[10px] text-primary uppercase font-bold tracking-wider mb-1">
                              Componentes incluidos en el armado:
                            </p>
                            {item.componentes.map((c, cIdx) => (
                              <div key={cIdx} className="flex justify-between items-center py-0.5 border-b border-outline-variant/5 last:border-b-0">
                                <span className="text-on-surface-variant">
                                  <strong className="text-white font-medium capitalize">{CATEGORY_LABELS[c.categoria] || c.categoria}:</strong> {c.nombre}
                                </span>
                                <span className="text-on-surface-variant font-mono text-[10px]">
                                  S/. {(c.precio || 0).toLocaleString("es-PE")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-outline-variant/10 pt-4 space-y-1.5 font-montserrat text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal (82%):</span>
                    <span className="font-mono">S/. {(order.total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>IGV (18%):</span>
                    <span className="font-mono">S/. {(order.total - order.total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Despacho Local (Huancayo):</span>
                    <span className="text-emerald-400 font-bold">¡GRATIS!</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-base border-t border-outline-variant/10 pt-2 font-poppins">
                    <span>Total Pagado:</span>
                    <span className="text-primary">S/. {order.total.toLocaleString("es-PE")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment Details, Delivery & Guarantee */}
            <div className="md:col-span-5 space-y-4">
              {/* Despacho & Contact Info */}
              <div className="glass-panel p-5 rounded-2xl border border-outline-variant/15 space-y-3 font-montserrat text-xs">
                <h4 className="font-poppins text-xs font-bold text-white uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-outline-variant/10 pb-2">
                  <span className="material-symbols-outlined text-sm">home_pin</span>
                  Datos de Entrega en Huancayo
                </h4>
                <div className="space-y-1.5 text-on-surface-variant">
                  <p><strong className="text-white">Destinatario:</strong> {order.clienteNombre}</p>
                  <p><strong className="text-white">Dirección:</strong> {order.direccion}</p>
                  <p><strong className="text-white">Teléfono / WhatsApp:</strong> {order.telefono}</p>
                  {order.clienteEmail && <p><strong className="text-white">Email:</strong> {order.clienteEmail}</p>}
                </div>
              </div>

              {/* Payment Proof Card */}
              <div className="glass-panel p-5 rounded-2xl border border-outline-variant/15 space-y-3 font-montserrat text-xs">
                <h4 className="font-poppins text-xs font-bold text-white uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-outline-variant/10 pb-2">
                  <span className="material-symbols-outlined text-sm">payments</span>
                  Comprobante de Pago
                </h4>

                <div className="space-y-1.5 text-on-surface-variant">
                  <p>
                    <strong className="text-white">Método:</strong>{" "}
                    <span className="uppercase font-semibold">{order.metodoPago.replace("_", " ")}</span>
                  </p>
                  {(order.comprobantePago?.numeroOperacion || order.detallesPago?.referencia) && (
                    <p>
                      <strong className="text-white">Nº de Operación:</strong>{" "}
                      <span className="font-mono text-primary font-bold">
                        {order.comprobantePago?.numeroOperacion || order.detallesPago?.referencia}
                      </span>
                    </p>
                  )}
                  {order.comprobantePago?.verificadoPorAdmin && (
                    <p className="text-emerald-400 font-bold flex items-center gap-1 pt-1">
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Pago validado por el administrador
                    </p>
                  )}
                </div>

                {/* Voucher Thumbnail */}
                {voucherUrl && (
                  <div className="pt-2 border-t border-outline-variant/10 space-y-2">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      Captura del Voucher Adjunto:
                    </p>
                    <div
                      onClick={() => setShowVoucherModal(true)}
                      className="relative group cursor-pointer overflow-hidden rounded-xl border border-outline-variant/20 max-h-36 bg-black/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={voucherUrl}
                        alt="Voucher de Pago"
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                        <span className="material-symbols-outlined text-base">zoom_in</span>
                        Ver en Grande
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Warranty Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary-container/10 via-surface-container-high/40 to-primary-container/5 border border-primary/20 space-y-2 font-montserrat text-xs">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  Garantía Local LUTEAME (2 Años)
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Todo el hardware adquirido cuenta con soporte presencial y sustitución directa en nuestro taller de Huancayo.
                </p>
                <Link
                  href="/warranty"
                  className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline pt-1"
                >
                  Consultar Cobertura de Garantía
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Modal Lightbox for Customer Voucher */}
          {showVoucherModal && voucherUrl && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="glass-panel p-6 rounded-2xl border border-primary/30 max-w-lg w-full space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-poppins text-sm font-bold text-white">Comprobante de Pago — {formattedId}</h4>
                  <button
                    onClick={() => setShowVoucherModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-white"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={voucherUrl}
                  alt="Comprobante de Pago"
                  className="w-full max-h-[70vh] object-contain rounded-xl border border-outline-variant/20 bg-black/40"
                />
              </div>
            </div>
          )}

          {/* Printable Receipt (hidden on screen, triggers on print) */}
          <div className="hidden print-only text-black bg-white p-8 w-full font-montserrat min-h-screen">
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-tight">LUTEAME</h1>
                <p className="text-xs text-gray-600">Hardware y PCs de Alto Rendimiento</p>
                <p className="text-xs text-gray-600">Huancayo, Junín, Perú</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold uppercase">Estado de Pedido</h2>
                <p className="text-xs text-gray-600 mt-1">ID: {formattedId}</p>
                <p className="text-xs text-gray-600">Fecha: {orderDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
              <div>
                <h3 className="font-bold uppercase mb-1 text-gray-700">Cliente</h3>
                <p className="font-semibold">{order.clienteNombre}</p>
                <p>{order.clienteEmail}</p>
                <p>Tel: {order.telefono}</p>
              </div>
              <div>
                <h3 className="font-bold uppercase mb-1 text-gray-700">Despacho & Estado</h3>
                <p className="font-semibold">{order.direccion}</p>
                <p className="capitalize">Estado: {order.estado.replace("_", " ")}</p>
                <p className="capitalize">Método Pago: {order.metodoPago.replace("_", " ")}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs mb-8 border-collapse">
              <thead>
                <tr className="border-b-2 border-black font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-2">Ítem</th>
                  <th className="py-2.5 px-2 text-center">Cant.</th>
                  <th className="py-2.5 px-2 text-right">P. Unitario</th>
                  <th className="py-2.5 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 font-semibold">{item.nombre}</td>
                    <td className="py-2 px-2 text-center">{item.cantidad}</td>
                    <td className="py-2 px-2 text-right font-mono">S/. {item.precioUnitario.toLocaleString("es-PE")}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">S/. {item.precioTotal.toLocaleString("es-PE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end border-t-2 border-black pt-4">
              <div className="w-64 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>S/. {(order.total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>IGV (18%):</span>
                  <span>S/. {(order.total - order.total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1">
                  <span>Total:</span>
                  <span>S/. {order.total.toLocaleString("es-PE")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="section-container py-brand-xl flex flex-col items-center justify-center min-h-[400px]">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin mb-3">
            progress_activity
          </span>
          <p className="text-on-surface-variant font-montserrat text-xs">Cargando sistema de seguimiento...</p>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
