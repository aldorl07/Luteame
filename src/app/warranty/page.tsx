"use client";
// src/app/warranty/page.tsx

import { useState } from "react";
import Link from "next/link";
import { getBuildDetails } from "@/lib/firestore";

interface BuildData {
  id: string;
  clienteNombre: string;
  fechaEnsamblaje: string;
  garantiaVencimiento: string;
  componentes: Record<string, { modelo: string; serie?: string; garantiaMeses: number }>;
}

const MOCK_BUILD: BuildData = {
  id: "LUTE-000124",
  clienteNombre: "Aldo Ramos L.",
  fechaEnsamblaje: "15/05/2026",
  garantiaVencimiento: "15/05/2028",
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

export default function WarrantyLookupPage() {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [buildInfo, setBuildInfo] = useState<BuildData | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError("");
    setBuildInfo(null);
    setSearched(true);

    const formattedId = searchId.trim().toUpperCase().replace("LUTE-", "");

    try {
      // 1. Try to fetch from real Firestore database
      const dbBuild = await getBuildDetails(formattedId);
      if (dbBuild) {
        setBuildInfo({
          id: `LUTE-${dbBuild.id}`,
          clienteNombre: dbBuild.clienteNombre || "Cliente Luteame",
          fechaEnsamblaje: dbBuild.fechaEnsamblaje?.toDate ? dbBuild.fechaEnsamblaje.toDate().toLocaleDateString("es-PE") : dbBuild.fechaEnsamblaje || "—",
          garantiaVencimiento: dbBuild.garantiaVencimiento?.toDate ? dbBuild.garantiaVencimiento.toDate().toLocaleDateString("es-PE") : dbBuild.garantiaVencimiento || "—",
          componentes: dbBuild.componentes || {},
        });
      } else if (formattedId === "000124" || formattedId === "124" || formattedId === "MOCK") {
        // 2. Allow fallback to mock build for demo / testing
        setBuildInfo(MOCK_BUILD);
      } else {
        setError("No se encontró ningún equipo con ese ID. Verifica el código e inténtalo de nuevo.");
      }
    } catch (err) {
      console.error("Error looking up build warranty:", err);
      setError("Ocurrió un error al buscar el equipo. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if warranty is active based on current date
  const isWarrantyActive = (dateStr: string): boolean => {
    try {
      const parts = dateStr.split("/");
      if (parts.length !== 3) return true; // Fail safe
      const expDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      return expDate > new Date();
    } catch {
      return true;
    }
  };

  return (
    <div className="section-container py-brand-xl max-w-4xl">
      {/* Page Header */}
      <div className="mb-8 border-b border-outline-variant/20 pb-6 text-center">
        <div className="inline-flex items-center gap-2 chip-purple w-fit mb-3">
          <span className="material-symbols-outlined text-[14px]">shield_heart</span>
          GARANTÍA LOCAL DE CONFIANZA
        </div>
        <h1 className="font-poppins text-display-lg-mobile md:text-headline-md font-extrabold text-white mb-1">
          Consulta de Equipos y Garantías
        </h1>
        <p className="font-montserrat text-body-sm text-on-surface-variant max-w-lg mx-auto">
          Ingresa el ID único de tu PC LUTEAME para revisar el listado de hardware, números de serie y vigencia de cobertura de tu garantía local.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 mb-8 max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Ej. LUTE-000124 o 000124"
              className="input-glass pl-10 text-center font-bold tracking-widest text-white uppercase placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-on-surface-variant/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-2"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            )}
            {loading ? "Buscando..." : "Consultar"}
          </button>
        </form>
        <p className="font-montserrat text-[10px] text-on-surface-variant/50 mt-3 text-center">
          Prueba con el ID demo: <strong className="text-primary font-mono select-all">LUTE-000124</strong>
        </p>
      </div>

      {/* Results screen */}
      {loading ? (
        <div className="glass-panel rounded-xl p-12 flex flex-col justify-center items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          <p className="font-montserrat text-xs text-on-surface-variant">Leyendo base de datos segura...</p>
        </div>
      ) : error ? (
        <div className="glass-panel rounded-xl p-8 border border-error/20 text-center flex flex-col items-center gap-3 max-w-md mx-auto animate-fade-in">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <p className="font-montserrat text-body-sm text-tertiary">{error}</p>
        </div>
      ) : buildInfo ? (
        <div className="glass-panel rounded-xl p-6 md:p-8 border border-outline-variant/15 space-y-8 animate-fade-in">
          {/* Header Card */}
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-outline-variant/10 pb-6">
            <div>
              <h2 className="font-poppins text-headline-md font-bold text-white mb-1">
                Ficha del Equipo {buildInfo.id}
              </h2>
              <p className="font-montserrat text-xs text-on-surface-variant">
                Ensamblado el {buildInfo.fechaEnsamblaje} para: <strong className="text-white">{buildInfo.clienteNombre}</strong>
              </p>
            </div>

            {/* Warranty Status */}
            <div className="text-right">
              <span className="font-montserrat text-[10px] text-on-surface-variant uppercase tracking-widest block mb-1">
                Garantía Luteame
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`chip-purple text-[10px] font-bold px-3 py-1 border rounded uppercase ${
                    isWarrantyActive(buildInfo.garantiaVencimiento)
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      : "border-error/40 text-error bg-error/10"
                  }`}
                >
                  {isWarrantyActive(buildInfo.garantiaVencimiento) ? "Cobertura Activa" : "Cobertura Vencida"}
                </span>
                <span className="font-montserrat text-xs text-on-surface-variant">
                  Hasta {buildInfo.garantiaVencimiento}
                </span>
              </div>
            </div>
          </div>

          {/* Component Serial List */}
          <div className="space-y-4">
            <h3 className="font-poppins text-title-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
              Listado y Números de Serie de Componentes
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-montserrat text-xs border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider pb-2">
                    <th className="pb-2">Componente</th>
                    <th className="pb-2">Modelo / Hardware</th>
                    <th className="pb-2">Número de Serie (S/N)</th>
                    <th className="pb-2 text-right">Garantía Fábrica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-white">
                  {Object.entries(buildInfo.componentes).map(([cat, info]) => {
                    const categoryLabels: Record<string, string> = {
                      procesadores: "Procesador (CPU)",
                      placas: "Placa Madre",
                      ram: "Memoria RAM",
                      graficas: "Tarjeta de Video",
                      almacenamiento: "Almacenamiento (SSD)",
                      fuentes: "Fuente de Poder",
                      gabinetes: "Gabinete (Case)",
                      refrigeracion: "Refrigeración"
                    };

                    return (
                      <tr key={cat} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 font-semibold text-on-surface-variant text-[11px] uppercase tracking-wider">
                          {categoryLabels[cat] || cat}
                        </td>
                        <td className="py-3 pr-3 font-bold">
                          {info.modelo}
                        </td>
                        <td className="py-3 pr-3 font-mono text-[11px] text-primary">
                          {info.serie || "NO REGISTRADO"}
                        </td>
                        <td className="py-3 text-right text-on-surface-variant">
                          {info.garantiaMeses} Meses
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Local Support Callout */}
          <div className="p-4 rounded-xl bg-primary-container/10 border border-primary-container/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">build_circle</span>
              <div className="font-montserrat text-xs">
                <p className="text-white font-bold">¿Necesitas soporte físico con este equipo?</p>
                <p className="text-on-surface-variant">Puedes traerlo a nuestro taller local en Huancayo o abrir un ticket de soporte.</p>
              </div>
            </div>
            <Link href="/support" className="btn-secondary py-2 px-4 text-[11px] font-bold uppercase tracking-wider shrink-0">
              Ir a Soporte Técnico
            </Link>
          </div>
        </div>
      ) : searched && (
        <div className="glass-panel rounded-xl p-8 text-center flex flex-col items-center gap-2 max-w-md mx-auto animate-fade-in">
          <span className="material-symbols-outlined text-3xl text-outline-variant">help_outline</span>
          <p className="font-montserrat text-xs text-on-surface-variant">Búsqueda realizada sin resultados.</p>
        </div>
      )}
    </div>
  );
}
