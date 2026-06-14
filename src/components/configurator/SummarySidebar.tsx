"use client";
// src/components/configurator/SummarySidebar.tsx

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { useAuthContext } from "@/context/AuthContext";
import { saveSetup } from "@/lib/firestore";
import { STEP_LABELS, STEP_ICONS } from "@/types";

export default function SummarySidebar() {
  const router      = useRouter();
  const { user }    = useAuthContext();
  const selections  = useConfiguratorStore((s) => s.selections);
  const clearAll    = useConfiguratorStore((s) => s.clearAll);

  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  const totalPrice = useMemo(
    () => selections.reduce((sum, p) => sum + (p ? p.precio : 0), 0),
    [selections]
  );

  // Assembly time estimate based on number of components selected
  const selectedCount = selections.filter(Boolean).length;
  const assemblyTime =
    selectedCount === 0 ? "—"
    : selectedCount === 1 ? "1 - 2 Días"
    : selectedCount === 2 ? "2 - 4 Días"
    : "3 - 5 Días";

  const handleOrder = async () => {
    if (!user) {
      // Save config to localStorage, redirect to login
      const pendingConfig = {
        componentes: selections.filter(Boolean).map((p) => p!.id),
        precioTotal:  totalPrice,
      };
      localStorage.setItem("luteame-pending-config", JSON.stringify(pendingConfig));
      router.push("/login");
      return;
    }

    if (selectedCount === 0) {
      setError("Selecciona al menos un componente.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await saveSetup({
        usuarioId:   user.uid,
        componentes: selections.filter(Boolean).map((p) => p!.id),
        precioTotal: totalPrice,
        estado:      "pendiente",
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        clearAll();
      }, 3000);
    } catch {
      setError("Error al guardar. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="w-full md:w-[220px] lg:w-[240px] shrink-0 h-fit sticky top-24">
      <div className="glass-panel p-5 rounded-xl flex flex-col gap-4">
        <h2 className="font-montserrat text-title-lg text-on-surface pb-3 border-b border-outline-variant/10">
          Resumen
        </h2>

        {/* Component list */}
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((step) => {
            const product = selections[step];
            return (
              <div key={step} className={`flex justify-between items-start gap-2 ${!product ? "opacity-40" : ""}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="material-symbols-outlined text-[13px] text-on-surface-variant"
                      style={{ fontVariationSettings: "'FILL' 0" }}>
                      {STEP_ICONS[step]}
                    </span>
                    <p className="font-montserrat text-[10px] text-on-surface-variant uppercase tracking-wider">
                      {STEP_LABELS[step]}
                    </p>
                  </div>
                  {product ? (
                    <p className="font-montserrat text-body-sm font-semibold text-on-surface truncate">
                      {product.nombre}
                    </p>
                  ) : (
                    <p className="font-montserrat text-body-sm italic text-on-surface-variant">Sin seleccionar</p>
                  )}
                </div>
                <span className="font-montserrat text-body-sm text-primary shrink-0 font-semibold">
                  {product ? `S/. ${product.precio.toLocaleString("es-PE")}` : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t border-outline-variant/10 pt-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-montserrat text-body-sm text-on-surface-variant">Tiempo estimado</span>
            <span className="font-montserrat text-body-sm text-on-surface font-semibold">{assemblyTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-montserrat text-title-lg text-on-surface">Total</span>
            <span className="font-poppins text-headline-md text-primary font-bold">
              S/. {totalPrice.toLocaleString("es-PE")}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="font-montserrat text-body-sm text-red-500 text-center">{error}</p>
        )}

        {/* Success */}
        {saved && (
          <div className="flex items-center gap-2 justify-center p-3 rounded-lg bg-primary-container/15 border border-primary-container/30 animate-fade-in">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-montserrat text-body-sm text-primary font-semibold">¡Configuración guardada!</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleOrder}
          disabled={saving || saved}
          className="w-full btn-primary flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
          {saved ? "¡Guardado!" : "Ordenar mi Configuración"}
        </button>

        {!user && (
          <p className="font-montserrat text-[11px] text-on-surface-variant/60 text-center -mt-2">
            Inicia sesión para guardar tu configuración
          </p>
        )}
      </div>
    </aside>
  );
}
