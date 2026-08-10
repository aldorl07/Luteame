"use client";
// src/components/layout/CartSidebar.tsx

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useAuthContext } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CartSidebar() {
  const isOpen = useUIStore((s) => s.cartOpen);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const { user } = useAuthContext();

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [activeQuote, setActiveQuote] = useState<{ id: string; total: number } | null>(null);

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [clientData, setClientData] = useState({
    nombre: user?.displayName || "",
    telefono: "",
    direccion: "",
    metodoPago: "transferencia", // transferencia, yape_plin, tarjeta
  });
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateQuote = async () => {
    setCreatingQuote(true);
    try {
      // Create quote payload
      const quotePayload = {
        clienteId: user?.uid || "anonimo",
        clienteNombre: clientData.nombre || user?.email || "Cliente General",
        fecha: serverTimestamp(),
        validezDias: 7,
        items: items.map((i) => ({
          nombre: i.nombre,
          tipo: i.tipo,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          precioTotal: i.precioTotal,
          componentes: i.componentesConfigurados 
            ? Object.entries(i.componentesConfigurados).map(([cat, prod]) => ({
                categoria: cat,
                nombre: prod.nombre,
                precio: prod.precio,
              }))
            : null,
        })),
        total: total,
        estado: "enviada",
      };

      const docRef = await addDoc(collection(db, "cotizaciones"), quotePayload);
      setActiveQuote({ id: docRef.id, total });
    } catch (err) {
      console.error("Error creating quote:", err);
      alert("Error al generar cotización. Inténtalo de nuevo.");
    } finally {
      setCreatingQuote(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData.nombre || !clientData.telefono || !clientData.direccion) {
      alert("Por favor completa todos los campos.");
      return;
    }

    setCreatingQuote(true);
    try {
      const orderPayload = {
        clienteId: user?.uid || "anonimo",
        clienteNombre: clientData.nombre,
        telefono: clientData.telefono,
        direccion: clientData.direccion,
        metodoPago: clientData.metodoPago,
        fecha: serverTimestamp(),
        items: items.map((i) => ({
          nombre: i.nombre,
          tipo: i.tipo,
          cantidad: i.cantidad,
          precioTotal: i.precioTotal,
        })),
        total: total,
        estado: "pendiente", // pendiente, en_ensamblaje, enviado, completado
      };

      await addDoc(collection(db, "pedidos"), orderPayload);
      setCheckoutSuccess(true);
      clearCart();
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Error al procesar el pedido.");
    } finally {
      setCreatingQuote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm animate-fade-in">
      {/* Click outside target */}
      <div className="flex-grow" onClick={() => setCartOpen(false)} />

      {/* Sidebar Panel */}
      <div
        className="w-full max-w-[480px] h-full flex flex-col border-l border-outline-variant/20 shadow-2xl relative animate-slide-in-right"
        style={{ background: "rgba(24,17,28,0.95)", backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest/55">
          <h2 className="font-poppins text-headline-md text-white font-extrabold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shopping_basket</span>
            Tu Carrito
          </h2>
          <button
            onClick={() => {
              setCartOpen(false);
              setCheckoutMode(false);
              setActiveQuote(null);
            }}
            className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full hover:bg-white/5"
            aria-label="Cerrar Carrito"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Dynamic Screens */}

        {/* SCREEN 1: Cotización Generada */}
        {activeQuote ? (
          <div className="flex-grow p-6 flex flex-col justify-center items-center text-center gap-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div>
              <h3 className="font-poppins text-title-lg font-bold text-white mb-2">¡Cotización Generada!</h3>
              <p className="font-montserrat text-body-sm text-on-surface-variant max-w-[320px] mx-auto leading-relaxed">
                Se ha generado un registro formal de cotización con validez de 7 días.
              </p>
              <div className="mt-4 p-4 rounded-lg bg-surface-container border border-outline-variant/20 font-mono text-[11px] text-primary select-all">
                ID: LUTE-{activeQuote.id.substring(0, 8).toUpperCase()}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[280px]">
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-primary py-2.5 text-xs font-bold uppercase tracking-wider justify-center"
              >
                Imprimir / Guardar PDF
              </button>
              <button
                onClick={() => {
                  setActiveQuote(null);
                  setCartOpen(false);
                }}
                className="btn-secondary py-2.5 text-xs font-bold uppercase tracking-wider justify-center"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : checkoutSuccess ? (
          /* SCREEN 2: Pedido Exitoso */
          <div className="flex-grow p-6 flex flex-col justify-center items-center text-center gap-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-4xl">task_alt</span>
            </div>
            <div>
              <h3 className="font-poppins text-title-lg font-bold text-white mb-2">¡Pedido Registrado con Éxito!</h3>
              <p className="font-montserrat text-body-sm text-on-surface-variant max-w-[320px] mx-auto leading-relaxed">
                Nos comunicaremos contigo a la brevedad para coordinar el ensamblaje y entrega de tu setup en Huancayo.
              </p>
            </div>
            <button
              onClick={() => {
                setCheckoutSuccess(false);
                setCheckoutMode(false);
                setCartOpen(false);
              }}
              className="btn-primary py-2.5 text-xs font-bold uppercase tracking-wider px-8"
            >
              Listo
            </button>
          </div>
        ) : checkoutMode ? (
          /* SCREEN 3: Checkout Form */
          <form onSubmit={handleCheckoutSubmit} className="flex-grow p-6 overflow-y-auto flex flex-col justify-between animate-fade-in">
            <div className="space-y-4">
              <h3 className="font-poppins text-title-lg font-bold text-white mb-4">Datos del Pedido</h3>

              <div>
                <label className="block font-montserrat text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={clientData.nombre}
                  onChange={(e) => setClientData({ ...clientData, nombre: e.target.value })}
                  placeholder="Tu nombre completo"
                  className="input-glass pl-4"
                />
              </div>

              <div>
                <label className="block font-montserrat text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={clientData.telefono}
                  onChange={(e) => setClientData({ ...clientData, telefono: e.target.value })}
                  placeholder="Ej. 987654321"
                  className="input-glass pl-4"
                />
              </div>

              <div>
                <label className="block font-montserrat text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
                  Dirección de Entrega
                </label>
                <input
                  type="text"
                  required
                  value={clientData.direccion}
                  onChange={(e) => setClientData({ ...clientData, direccion: e.target.value })}
                  placeholder="Calle, Número, Distrito (Huancayo)"
                  className="input-glass pl-4"
                />
              </div>

              <div>
                <label className="block font-montserrat text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
                  Método de Pago
                </label>
                <select
                  value={clientData.metodoPago}
                  onChange={(e) => setClientData({ ...clientData, metodoPago: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/30 text-white rounded px-3 py-2 focus:outline-none"
                >
                  <option value="transferencia">Transferencia Bancaria BCP/BBVA</option>
                  <option value="yape_plin">Yape / Plin</option>
                  <option value="tarjeta">Pago con Tarjeta Crédito/Débito</option>
                </select>
              </div>
            </div>

            <div className="border-t border-outline-variant/10 pt-4 mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-montserrat text-body-sm text-on-surface-variant">Total del Pedido:</span>
                <span className="font-poppins text-headline-md text-primary font-bold">
                  S/. {total.toLocaleString("es-PE")}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckoutMode(false)}
                  className="btn-secondary flex-1 py-2.5 text-xs font-bold uppercase tracking-wider justify-center"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={creatingQuote}
                  className="btn-primary flex-1 py-2.5 text-xs font-bold uppercase tracking-wider justify-center"
                >
                  {creatingQuote ? "Procesando..." : "Confirmar Pedido"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* SCREEN 4: Normal Cart List */
          <div className="flex-grow flex flex-col justify-between min-h-0">
            {/* Scrollable list */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center gap-3">
                  <span className="material-symbols-outlined text-5xl text-outline-variant">remove_shopping_cart</span>
                  <p className="font-montserrat text-body-lg text-on-surface-variant">Tu carrito está vacío.</p>
                </div>
              ) : (
                items.map((item) => {
                  const isSetup = item.tipo === "pc_configurada";
                  const isExpanded = expandedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      className="glass-card rounded-xl p-4 border border-outline-variant/10 flex flex-col gap-3 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imagenUrl}
                          alt={item.nombre}
                          className="w-16 h-16 object-contain rounded-lg bg-surface-container p-1 border border-outline-variant/10 shrink-0"
                        />
                        <div className="min-w-0 flex-grow">
                          <p className="font-montserrat text-body-sm font-bold text-white truncate" title={item.nombre}>
                            {item.nombre}
                          </p>
                          <p className="font-montserrat text-[10px] text-primary uppercase font-semibold tracking-wider mt-0.5">
                            {item.tipo === "pc_configurada" ? "PC Ensamblada" : item.tipo === "servicio" ? "Servicio" : "Producto"}
                          </p>
                          <p className="font-mono text-xs text-primary font-bold mt-1">
                            S/. {item.precioUnitario.toLocaleString("es-PE")}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                          aria-label="Eliminar Item"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>

                      {/* PC details expand dropdown */}
                      {isSetup && item.componentesConfigurados && (
                        <div className="border-t border-outline-variant/5 pt-2">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center gap-1 font-montserrat text-[10px] text-on-surface-variant uppercase font-bold tracking-wider hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isExpanded ? "expand_less" : "expand_more"}
                            </span>
                            {isExpanded ? "Ocultar Componentes" : "Ver Componentes"}
                          </button>
                          {isExpanded && (
                            <div className="mt-2 pl-3 border-l border-primary-container/30 space-y-1 text-[11px] font-montserrat text-on-surface-variant">
                              {Object.entries(item.componentesConfigurados).map(([cat, prod]) => (
                                <div key={cat} className="flex justify-between items-center gap-2">
                                  <span className="capitalize">{cat}:</span>
                                  <span className="text-white truncate max-w-[180px] font-semibold">{prod.nombre}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quantity control */}
                      <div className="flex justify-between items-center border-t border-outline-variant/5 pt-2">
                        <span className="font-montserrat text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                          Cantidad
                        </span>
                        <div className="flex items-center gap-2 bg-surface-container rounded-lg border border-outline-variant/10 px-2 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                            className="text-on-surface-variant hover:text-primary transition-colors flex items-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="font-mono text-xs font-bold text-white w-4 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            className="text-on-surface-variant hover:text-primary transition-colors flex items-center"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            {items.length > 0 && (
              <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest/55 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-montserrat text-body-sm text-on-surface-variant">Monto Total:</span>
                  <p className="font-poppins text-headline-md text-primary font-bold">
                    S/. {total.toLocaleString("es-PE")}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setCheckoutMode(true)}
                    className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2"
                  >
                    Proceder al Checkout
                    <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                  </button>
                  <button
                    onClick={handleGenerateQuote}
                    disabled={creatingQuote}
                    className="btn-secondary w-full py-3 text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2"
                  >
                    {creatingQuote ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Generando...
                      </>
                    ) : (
                      <>
                        Generar Cotización Oficial
                        <span className="material-symbols-outlined text-base">article</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Printable Quote Sheet (Hidden from screen, visible only on print) */}
      {activeQuote && (
        <div className="hidden print-only text-black bg-white p-8 w-full font-montserrat min-h-screen">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight">LUTEAME</h1>
              <p className="text-xs text-gray-600">Hardware de Alto Rendimiento y Ensamblaje Profesional</p>
              <p className="text-xs text-gray-600">Huancayo, Junín, Perú</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase">Cotización Oficial</h2>
              <p className="text-xs text-gray-600 mt-1">ID: LUTE-{activeQuote.id.substring(0, 8).toUpperCase()}</p>
              <p className="text-xs text-gray-600">Fecha: {new Date().toLocaleDateString("es-PE")}</p>
              <p className="text-xs text-gray-600">Validez: 7 días</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase mb-2 border-b border-gray-300 pb-1">Cliente</h3>
            <p className="text-xs font-semibold">{clientData.nombre || user?.email || "Cliente General"}</p>
          </div>

          <table className="w-full text-left text-xs mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-black font-bold">
                <th className="py-2">Item / Concepto</th>
                <th className="py-2">Tipo</th>
                <th className="py-2 text-right">Cant.</th>
                <th className="py-2 text-right">P. Unit.</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2">
                    <p className="font-semibold">{item.nombre}</p>
                    {item.componentesConfigurados && (
                      <ul className="pl-3 mt-1 list-disc text-[10px] text-gray-600 space-y-0.5">
                        {Object.entries(item.componentesConfigurados).map(([cat, prod]) => (
                          <li key={cat}>
                            <span className="capitalize">{cat}</span>: {prod.nombre} (S/. {prod.precio})
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="py-2 capitalize">{item.tipo.replace("_", " ")}</td>
                  <td className="py-2 text-right">{item.cantidad}</td>
                  <td className="py-2 text-right">S/. {item.precioUnitario.toLocaleString("es-PE")}</td>
                  <td className="py-2 text-right">S/. {item.precioTotal.toLocaleString("es-PE")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t-2 border-black pt-4">
            <div className="w-64 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>S/. {(activeQuote.total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>IGV (18%):</span>
                <span>S/. {(activeQuote.total - (activeQuote.total / 1.18)).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1">
                <span>Total General:</span>
                <span>S/. {activeQuote.total.toLocaleString("es-PE")}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-[10px] text-gray-500 border-t border-gray-200 pt-4">
            <p>Gracias por confiar en LUTEAME. Tu setup a medida, simplificado.</p>
            <p>Servicio Técnico y Garantía Local en Huancayo, Junín.</p>
          </div>
        </div>
      )}
    </div>
  );
}
