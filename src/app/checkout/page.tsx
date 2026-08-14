"use client";
// src/app/checkout/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthContext } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);

  // Form states
  const [nombre, setNombre] = useState(user?.displayName || "");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState<"yape_plin" | "transferencia" | "tarjeta">("yape_plin");
  
  // Payment specifics
  const [refPago, setRefPago] = useState(""); // For Yape/Transfer references
  const [cardNo, setCardNo] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Submission / flow states
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [createdOrderData, setCreatedOrderData] = useState<any | null>(null);

  // Sync user name when loaded
  useEffect(() => {
    if (user?.displayName && !nombre) {
      setNombre(user.displayName);
    }
  }, [user, nombre]);

  // If cart is empty and order is not completed yet, show warning or redirect
  if (items.length === 0 && !orderId) {
    return (
      <div className="section-container py-brand-xl flex flex-col items-center justify-center min-h-[500px] text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">shopping_cart</span>
        </div>
        <div>
          <h1 className="font-poppins text-headline-md font-bold text-white mb-2">Tu Carrito está Vacío</h1>
          <p className="font-montserrat text-body-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            No tienes productos o servicios en el carrito para procesar una compra.
          </p>
        </div>
        <Link href="/shop" className="btn-primary py-2.5 px-8">
          Ir a la Tienda
        </Link>
      </div>
    );
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatCardExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNo(formatCardNumber(e.target.value).substring(0, 19));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardExpiry(formatCardExpiry(e.target.value).substring(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvv(e.target.value.replace(/[^0-9]/g, "").substring(0, 3));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim() || !direccion.trim()) {
      alert("Por favor completa los campos de contacto y despacho.");
      return;
    }

    if (metodoPago === "tarjeta") {
      if (cardNo.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3 || !cardHolder.trim()) {
        alert("Por favor rellena correctamente los datos de tu tarjeta de crédito.");
        return;
      }
    } else {
      if (!refPago.trim()) {
        alert("Por favor ingresa el número de operación / referencia de pago.");
        return;
      }
    }

    setLoading(true);

    try {
      const orderPayload = {
        clienteId: user?.uid || "anonimo",
        clienteNombre: nombre.trim(),
        clienteEmail: user?.email || "anonimo@luteame.com",
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        metodoPago,
        fecha: serverTimestamp(),
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
        total,
        estado: "pendiente",
        detallesPago: metodoPago === "tarjeta" 
          ? { tarjetaUltimosCuatro: cardNo.substring(15), banco: "Tarjeta de Crédito" }
          : { referencia: refPago.trim() }
      };

      const docRef = await addDoc(collection(db, "pedidos"), orderPayload);
      setOrderId(docRef.id);
      setCreatedOrderData(orderPayload);
      clearCart();
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Ocurrió un error al procesar tu pedido. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Pedido Completado Exitosamente
  if (orderId && createdOrderData) {
    const formattedId = `LUTE-${orderId.substring(0, 8).toUpperCase()}`;
    return (
      <div className="section-container py-brand-xl max-w-3xl animate-fade-in">
        <div className="glass-panel p-8 rounded-xl border border-emerald-500/20 text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="material-symbols-outlined text-5xl">task_alt</span>
          </div>

          <div>
            <h1 className="font-poppins text-display-lg-mobile md:text-headline-md font-extrabold text-white mb-2">
              ¡Pedido Registrado con Éxito!
            </h1>
            <p className="font-montserrat text-body-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Muchas gracias por comprar en <strong>LUTEAME</strong>. Tu orden está en cola para ensamblaje y verificación. Nos pondremos en contacto contigo por WhatsApp a la brevedad.
            </p>
          </div>

          <div className="w-full max-w-md p-5 rounded-xl bg-surface-container-low/30 border border-outline-variant/10 text-left font-montserrat text-xs space-y-3">
            <div className="flex justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant font-bold">Código de Pedido:</span>
              <span className="text-primary font-mono font-bold select-all">{formattedId}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant">Cliente:</span>
              <span className="text-white font-semibold">{createdOrderData.clienteNombre}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant">Dirección de Entrega:</span>
              <span className="text-white font-semibold text-right truncate max-w-[240px]" title={createdOrderData.direccion}>
                {createdOrderData.direccion}
              </span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant">Teléfono / WhatsApp:</span>
              <span className="text-white font-semibold">{createdOrderData.telefono}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/10 pb-2">
              <span className="text-on-surface-variant">Método de Pago:</span>
              <span className="text-white font-semibold uppercase">{createdOrderData.metodoPago.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-on-surface-variant font-bold">Monto Total:</span>
              <span className="text-primary text-base font-poppins font-bold">S/. {total.toLocaleString("es-PE")}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button
              onClick={() => window.print()}
              className="btn-primary py-3 text-xs font-bold uppercase tracking-wider flex-1 flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">print</span>
              Imprimir Recibo / PDF
            </button>
            <Link
              href="/"
              className="btn-secondary py-3 text-xs font-bold uppercase tracking-wider flex-1 flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">home</span>
              Volver al Inicio
            </Link>
          </div>
        </div>

        {/* Printable View (hidden on screen, visible only on print) */}
        <div className="hidden print-only text-black bg-white p-8 w-full font-montserrat min-h-screen">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight">LUTEAME</h1>
              <p className="text-xs text-gray-600">Hardware y PCs de Alto Rendimiento</p>
              <p className="text-xs text-gray-600">Huancayo, Junín, Perú</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase">Recibo de Pedido</h2>
              <p className="text-xs text-gray-600 mt-1">ID: {formattedId}</p>
              <p className="text-xs text-gray-600">Fecha: {new Date().toLocaleDateString("es-PE")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
            <div>
              <h3 className="font-bold uppercase mb-1 text-gray-700">Cliente</h3>
              <p className="font-semibold">{createdOrderData.clienteNombre}</p>
              <p>{createdOrderData.clienteEmail}</p>
              <p>Tel: {createdOrderData.telefono}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase mb-1 text-gray-700">Despacho</h3>
              <p className="font-semibold">{createdOrderData.direccion}</p>
              <p className="capitalize">Método Pago: {createdOrderData.metodoPago.replace("_", " ")}</p>
            </div>
          </div>

          <table className="w-full text-left text-xs mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-black font-bold">
                <th className="py-2">Concepto</th>
                <th className="py-2">Cantidad</th>
                <th className="py-2 text-right">Precio Unitario</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {createdOrderData.items.map((item: any, idx: number) => (
                <tr key={idx} className="py-2">
                  <td className="py-2">
                    <p className="font-semibold">{item.nombre}</p>
                    {item.componentes && (
                      <ul className="pl-3 mt-1 list-disc text-[10px] text-gray-500">
                        {item.componentes.map((c: any) => (
                          <li key={c.categoria}>
                            <span className="capitalize">{c.categoria}</span>: {c.nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="py-2">{item.cantidad}</td>
                  <td className="py-2 text-right">S/. {item.precioUnitario.toLocaleString("es-PE")}</td>
                  <td className="py-2 text-right">S/. {item.precioTotal.toLocaleString("es-PE")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t-2 border-black pt-4">
            <div className="w-64 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal (82%):</span>
                <span>S/. {(total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>IGV (18%):</span>
                <span>S/. {(total - total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-gray-300 pt-1">
                <span>Total:</span>
                <span>S/. {total.toLocaleString("es-PE")}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center text-[10px] text-gray-400 border-t border-gray-200 pt-4">
            <p>Gracias por tu compra en LUTEAME. Garantía Local de Hardware en Huancayo.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-brand-md pb-brand-xl max-w-6xl animate-fade-in">
      {/* Title */}
      <div className="border-b border-outline-variant/10 pb-4 mb-8">
        <h1 className="font-poppins text-display-lg-mobile md:text-headline-md font-extrabold text-primary">
          Finalizar Compra
        </h1>
        <p className="font-montserrat text-body-sm text-on-surface-variant mt-1">
          Completa tus datos y finaliza la adquisición de tu setup PC.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 cols) */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
          {/* Contact Details */}
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 space-y-4">
            <h2 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <span className="material-symbols-outlined text-primary">badge</span>
              1. Información de Despacho
            </h2>

            <div>
              <label htmlFor="checkout-nombre" className="block font-montserrat text-label-caps text-on-surface-variant mb-1.5 uppercase tracking-widest text-[10px] font-bold">
                Nombre Completo
              </label>
              <input
                id="checkout-nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingresa tu nombre y apellido"
                className="input-glass pl-4"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-tel" className="block font-montserrat text-label-caps text-on-surface-variant mb-1.5 uppercase tracking-widest text-[10px] font-bold">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="checkout-tel"
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 987654321"
                  className="input-glass pl-4"
                />
              </div>
              <div>
                <label htmlFor="checkout-dir" className="block font-montserrat text-label-caps text-on-surface-variant mb-1.5 uppercase tracking-widest text-[10px] font-bold">
                  Dirección de Entrega (Huancayo)
                </label>
                <input
                  id="checkout-dir"
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Calle, Nro., Urbanización/Distrito"
                  className="input-glass pl-4"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 space-y-6">
            <h2 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <span className="material-symbols-outlined text-primary">payments</span>
              2. Método de Pago
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {(["yape_plin", "transferencia", "tarjeta"] as const).map((method) => {
                const isActive = metodoPago === method;
                const labels = {
                  yape_plin: "Yape / Plin",
                  transferencia: "Transferencia",
                  tarjeta: "Tarjeta"
                };
                const icons = {
                  yape_plin: "qr_code",
                  transferencia: "account_balance",
                  tarjeta: "credit_card"
                };

                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setMetodoPago(method)}
                    className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all duration-300 font-montserrat font-bold text-xs ${
                      isActive
                        ? "border-primary-container bg-primary-container/10 text-primary scale-105 shadow-[0_0_15px_rgba(167,0,254,0.15)]"
                        : "border-outline-variant/10 text-on-surface-variant hover:border-primary-container/30 hover:bg-white/5"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">{icons[method]}</span>
                    <span>{labels[method]}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Payment Details Area */}
            <div className="p-4 rounded-xl bg-surface-container-low/20 border border-outline-variant/10 font-montserrat text-xs leading-relaxed text-on-surface-variant">
              {/* Yape/Plin Mode */}
              {metodoPago === "yape_plin" && (
                <div className="space-y-4 flex flex-col sm:flex-row items-center gap-6">
                  {/* Dummy QR Code */}
                  <div className="w-32 h-32 bg-white p-2 rounded-lg shrink-0 flex items-center justify-center border border-primary/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR"
                      alt="Código QR Luteame Yape/Plin"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-3 flex-grow">
                    <p className="text-white font-bold text-sm">Instrucciones de Yape / Plin:</p>
                    <ol className="list-decimal pl-4 space-y-1.5 text-on-surface-variant/80">
                      <li>Escanea el código QR con tu app bancaria o yapea al número <strong className="text-white font-semibold">964 123 456</strong> (Titular: Aldo Ramos L. - Luteame).</li>
                      <li>Realiza el pago por el monto total.</li>
                      <li>Escribe el <strong className="text-white font-semibold">Código de Referencia / Operación</strong> de 8 dígitos a continuación.</li>
                    </ol>
                    <div className="mt-3">
                      <label htmlFor="ref-yape" className="block text-[10px] text-white uppercase tracking-widest mb-1.5 font-bold">Número de Operación / Ref</label>
                      <input
                        id="ref-yape"
                        type="text"
                        required
                        value={refPago}
                        onChange={(e) => setRefPago(e.target.value)}
                        placeholder="Ej. 12894372"
                        className="input-glass max-w-[240px] pl-4 font-mono text-sm tracking-widest text-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Mode */}
              {metodoPago === "transferencia" && (
                <div className="space-y-4">
                  <p className="text-white font-bold text-sm">Cuentas Bancarias de LUTEAME:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg bg-surface-container/50 border border-outline-variant/10">
                      <p className="text-primary font-bold">Banco de Crédito (BCP)</p>
                      <p className="text-[11px] text-white font-mono mt-1 font-bold">Cta: 355-98765432-0-12</p>
                      <p className="text-[10px] text-on-surface-variant/70">CCI: 002-3559876543201201</p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-surface-container/50 border border-outline-variant/10">
                      <p className="text-cyan-400 font-bold">BBVA Continental</p>
                      <p className="text-[11px] text-white font-mono mt-1 font-bold">Cta: 0011-0320-0200345678</p>
                      <p className="text-[10px] text-on-surface-variant/70">CCI: 011-3200020034567809</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-white font-bold">Instrucciones:</p>
                    <p className="text-on-surface-variant/80">Realiza la transferencia desde la banca por internet por el monto total, luego introduce el número de operación para asociarlo a tu orden.</p>
                    <div className="mt-3">
                      <label htmlFor="ref-trans" className="block text-[10px] text-white uppercase tracking-widest mb-1.5 font-bold">Número de Operación Bancaria</label>
                      <input
                        id="ref-trans"
                        type="text"
                        required
                        value={refPago}
                        onChange={(e) => setRefPago(e.target.value)}
                        placeholder="Ej. 764329"
                        className="input-glass max-w-[240px] pl-4 font-mono text-sm tracking-widest text-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Card Mode */}
              {metodoPago === "tarjeta" && (
                <div className="space-y-6">
                  {/* Glowing Credit Card Preview */}
                  <div className="flex justify-center py-2">
                    <div
                      className={`relative w-full max-w-[340px] h-[190px] rounded-xl text-white font-mono p-5 transition-transform duration-700 ease-in-out transform-gpu cursor-pointer ${
                        isCardFlipped ? "rotate-y-180" : ""
                      }`}
                      style={{
                        background: "linear-gradient(135deg, rgba(88,38,115,0.7) 0%, rgba(24,17,28,0.9) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(227,181,255,0.2)",
                        boxShadow: "0 8px 32px 0 rgba(167,0,254,0.15), inset 0 0 10px rgba(255,255,255,0.05)",
                        transformStyle: "preserve-3d"
                      }}
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                    >
                      {/* Front of card */}
                      <div className={`absolute inset-0 p-5 flex flex-col justify-between backface-hidden ${isCardFlipped ? "opacity-0" : "opacity-100"}`}>
                        <div className="flex justify-between items-start">
                          <span className="material-symbols-outlined text-4xl text-primary-container">contactless</span>
                          <span className="font-poppins text-lg font-bold italic text-white">LUTEAME CARD</span>
                        </div>
                        <div>
                          <div className="text-lg md:text-xl tracking-widest font-mono text-center font-bold min-h-[28px]">
                            {cardNo || "•••• •••• •••• ••••"}
                          </div>
                        </div>
                        <div className="flex justify-between items-end text-xs">
                          <div>
                            <p className="text-[8px] text-on-surface-variant uppercase tracking-wider">Titular</p>
                            <p className="font-semibold tracking-wide uppercase truncate max-w-[170px]">{cardHolder || "NOMBRE APELLIDO"}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-on-surface-variant uppercase tracking-wider">Expira</p>
                            <p className="font-semibold">{cardExpiry || "MM/AA"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Back of card */}
                      <div className={`absolute inset-0 p-5 flex flex-col justify-between backface-hidden rotate-y-180 ${isCardFlipped ? "opacity-100" : "opacity-0"}`}>
                        <div className="w-full h-8 bg-black -mx-5 mt-1" />
                        <div className="flex items-center justify-end gap-3 mt-4">
                          <span className="text-[9px] text-on-surface-variant font-bold uppercase">CVV</span>
                          <div className="w-12 bg-white text-black text-right px-2 py-1 rounded text-xs font-bold font-mono">
                            {cardCvv || "•••"}
                          </div>
                        </div>
                        <div className="text-[8px] text-on-surface-variant/60 leading-tight">
                          Esta es una tarjeta simulada. Operación realizada bajo entorno de pruebas del Luteame Store. Huancayo.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Fields */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="card-number" className="block text-[10px] text-white uppercase tracking-widest mb-1 font-bold">Número de Tarjeta</label>
                      <input
                        id="card-number"
                        type="text"
                        required={metodoPago === "tarjeta"}
                        value={cardNo}
                        onChange={handleCardNoChange}
                        onFocus={() => setIsCardFlipped(false)}
                        placeholder="4111 2222 3333 4444"
                        className="input-glass pl-4 font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor="card-holder" className="block text-[10px] text-white uppercase tracking-widest mb-1 font-bold">Nombre en la Tarjeta</label>
                      <input
                        id="card-holder"
                        type="text"
                        required={metodoPago === "tarjeta"}
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        onFocus={() => setIsCardFlipped(false)}
                        placeholder="Ej. ALDO RAMOS"
                        className="input-glass pl-4 uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="card-expiry" className="block text-[10px] text-white uppercase tracking-widest mb-1 font-bold">Vencimiento (MM/AA)</label>
                        <input
                          id="card-expiry"
                          type="text"
                          required={metodoPago === "tarjeta"}
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          onFocus={() => setIsCardFlipped(false)}
                          placeholder="12/29"
                          className="input-glass pl-4 font-mono text-center"
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvv" className="block text-[10px] text-white uppercase tracking-widest mb-1 font-bold">CVV / Firma</label>
                        <input
                          id="card-cvv"
                          type="password"
                          required={metodoPago === "tarjeta"}
                          value={cardCvv}
                          onChange={handleCvvChange}
                          onFocus={() => setIsCardFlipped(true)}
                          placeholder="123"
                          className="input-glass pl-4 font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Right Cart Summary (5 cols) */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/10 sticky top-24 space-y-6">
            <h2 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Resumen del Pedido
            </h2>

            {/* List of items */}
            <div className="divide-y divide-outline-variant/10 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-3 text-xs font-montserrat">
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate max-w-[200px]" title={item.nombre}>{item.nombre}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 capitalize">{item.tipo.replace("_", " ")} · Cant: {item.cantidad}</p>
                  </div>
                  <span className="font-mono text-white font-bold shrink-0">S/. {item.precioTotal.toLocaleString("es-PE")}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-outline-variant/10 pt-4 space-y-2 font-montserrat text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal (Sin IGV):</span>
                <span className="font-mono">S/. {(total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>IGV (18%):</span>
                <span className="font-mono">S/. {(total - total / 1.18).toLocaleString("es-PE", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Envío (Local Huancayo):</span>
                <span className="text-emerald-400 font-bold">¡GRATIS!</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm border-t border-outline-variant/5 pt-2">
                <span>Total a Pagar:</span>
                <span className="font-poppins text-primary text-base">S/. {total.toLocaleString("es-PE")}</span>
              </div>
            </div>

            {/* Trigger Order */}
            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full btn-primary py-3.5 text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Procesando Pedido...
                </>
              ) : (
                <>
                  Confirmar y Pagar
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                </>
              )}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
