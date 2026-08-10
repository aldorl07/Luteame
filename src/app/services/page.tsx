"use client";
// src/app/services/page.tsx

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";

const SERVICIOS_DATOS = [
  {
    id: "srv_ensamblaje",
    nombre: "Ensamblaje Premium con Cable Management",
    precio: 100,
    icon: "construction",
    descripcion: "Armado profesional pieza por pieza con gestión de cables impecable para asegurar el mejor flujo de aire y estética.",
    detalles: ["Gestión estética de cables", "Pruebas de estrés térmico (CPU/GPU)", "Optimización de BIOS y perfiles XMP/EXPO"],
    garantia: "Garantía de ensamblaje por 6 meses"
  },
  {
    id: "srv_mantenimiento",
    nombre: "Mantenimiento Preventivo y Limpieza Profunda",
    precio: 80,
    icon: "clean_hands",
    descripcion: "Limpieza integral física de componentes, ventiladores, disipadores y cambio de pasta térmica de alta calidad para mitigar el recalentamiento.",
    detalles: ["Desensamble completo", "Limpieza con aire comprimido y alcohol isopropílico", "Cambio de pasta térmica de alto rendimiento (Artic MX-4 o similar)"],
    garantia: "Recomendado cada 6 a 12 meses"
  },
  {
    id: "srv_upgrade",
    nombre: "Upgrade e Instalación de Componentes",
    precio: 50,
    icon: "upgrade",
    descripcion: "Ampliación de hardware: instalación rápida y segura de nuevos componentes como memoria RAM, discos de estado sólido (SSD) o tarjetas gráficas.",
    detalles: ["Instalación física", "Verificación de compatibilidad de BIOS", "Pruebas de reconocimiento de hardware"],
    garantia: "Incluye pruebas de estabilidad"
  },
  {
    id: "srv_diagnostico",
    nombre: "Diagnóstico Avanzado de Fallas",
    precio: 60,
    icon: "query_stats",
    descripcion: "Análisis especializado de comportamiento inestable, pantallas azules, cuelgues o computadoras que no encienden, aislando la pieza defectuosa.",
    detalles: ["Pruebas de componentes individuales", "Diagnóstico de hardware defectuoso", "Informe técnico y cotización de reparación"],
    garantia: "Costo deducible si se realiza la reparación con nosotros"
  },
  {
    id: "srv_optimizacion",
    nombre: "Optimización de Sistema Operativo",
    precio: 70,
    icon: "speed",
    descripcion: "Instalación limpia de Windows 10/11, configuración de controladores más recientes, eliminación de bloatware y optimización general de rendimiento.",
    detalles: ["Instalación de SO limpia", "Actualización de controladores al día", "Configuración de seguridad y privacidad"],
    garantia: "Servicio de software garantizado"
  }
];

export default function ServicesPage() {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAddService = (srv: typeof SERVICIOS_DATOS[0]) => {
    addItem({
      id: srv.id,
      tipo: "servicio",
      nombre: srv.nombre,
      precioUnitario: srv.precio,
      precioTotal: srv.precio,
      cantidad: 1,
      imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR", // Default tech icon
      categoria: "servicios"
    });

    setAddedIds((prev) => ({ ...prev, [srv.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [srv.id]: false }));
    }, 2000);

    // Auto open cart sidebar
    setCartOpen(true);
  };

  return (
    <div className="section-container py-brand-xl">
      {/* Page Header */}
      <div className="mb-12 border-b border-outline-variant/20 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 chip-purple w-fit mb-3">
            <span className="material-symbols-outlined text-[14px]">home_pin</span>
            SOPORTE LOCAL · HUANCAYO
          </div>
          <h1 className="font-poppins text-display-lg-mobile md:text-display-lg font-extrabold text-primary mb-1">
            Servicios Técnicos Especializados
          </h1>
          <p className="font-montserrat text-body-lg text-on-surface-variant max-w-2xl">
            Soluciones de hardware y software profesionales para que tu estación de trabajo o gaming rinda al 100%. Atención directa en Huancayo, Junín.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-3 shrink-0 border border-primary/20">
          <span className="material-symbols-outlined text-primary text-3xl">chat</span>
          <div className="text-xs font-montserrat">
            <p className="text-white font-bold">¿Tienes dudas con tu equipo?</p>
            <p className="text-on-surface-variant">Escríbenos a soporte y te asesoramos.</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SERVICIOS_DATOS.map((srv) => {
          const isAdded = addedIds[srv.id];
          return (
            <div
              key={srv.id}
              className="glass-panel rounded-xl p-6 flex flex-col justify-between gap-6 border border-outline-variant/10 hover:border-primary-container/40 transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary group-hover:bg-primary-container/20 transition-all shrink-0">
                    <span className="material-symbols-outlined text-2xl">{srv.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-poppins text-title-lg font-bold text-white leading-tight">
                      {srv.nombre}
                    </h3>
                    <p className="font-mono text-primary font-bold text-lg mt-1">
                      S/. {srv.precio.toLocaleString("es-PE")}
                    </p>
                  </div>
                </div>

                <p className="font-montserrat text-body-sm text-on-surface-variant leading-relaxed">
                  {srv.descripcion}
                </p>

                {/* Details list */}
                <div className="space-y-1.5 pt-2 border-t border-outline-variant/5">
                  <h4 className="font-montserrat text-[10px] text-white uppercase font-bold tracking-wider mb-2">
                    ¿Qué incluye?
                  </h4>
                  {srv.detalles.map((det, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-montserrat text-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">check_circle</span>
                      <span>{det}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action and warranty footer */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant/10">
                <span className="font-montserrat text-[10px] text-on-surface-variant/70 italic flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px]">verified_user</span>
                  {srv.garantia}
                </span>

                <button
                  onClick={() => handleAddService(srv)}
                  className={`btn-primary py-2 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                    isAdded ? "bg-green-600/30 border border-green-500 text-green-400" : ""
                  }`}
                >
                  {isAdded ? (
                    <>
                      ¡Añadido al Carrito!
                      <span className="material-symbols-outlined text-base">check_circle</span>
                    </>
                  ) : (
                    <>
                      Contratar Servicio
                      <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
