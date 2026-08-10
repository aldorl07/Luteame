"use client";
// src/app/configurator/page.tsx

import { useState, useEffect } from "react";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { useCartStore } from "@/store/cartStore";
import { getAllProducts } from "@/lib/firestore";
import { generateRecommendation } from "@/lib/recommendationEngine";
import type { Product, NecesidadUso, PresupuestoRango, ProductCategory } from "@/types";
import OptionGrid from "@/components/configurator/OptionGrid";
import { checkCompatibility } from "@/lib/compatibilityRules";

const PRESUPUESTOS: PresupuestoRango[] = [
  { id: "bajo", label: "S/. 2,000 - S/. 3,000 (Gama Entrada)", min: 2000, max: 3000 },
  { id: "medio", label: "S/. 3,000 - S/. 4,500 (Gama Media)", min: 3000, max: 4500 },
  { id: "alto", label: "S/. 4,500 - S/. 6,000 (Gama Alta)", min: 4500, max: 6000 },
  { id: "ultra", label: "S/. 6,000+ (Rendimiento Extremo)", min: 6000, max: Infinity },
];

const NECESIDADES: { id: NecesidadUso; label: string; desc: string; icon: string }[] = [
  { id: "gaming", label: "Gaming", desc: "Juegos competitivos y AAA a alta tasa de FPS.", icon: "sports_esports" },
  { id: "oficina", label: "Trabajo / Oficina", desc: "Productividad, hojas de cálculo y multi-tarea.", icon: "work" },
  { id: "ingenieria", label: "Ingeniería", desc: "Cálculo, simulaciones y modelado matemático.", icon: "engineering" },
  { id: "arquitectura", label: "Arquitectura / 3D", desc: "Modelado y renderizado 3D exigente.", icon: "architecture" },
  { id: "diseno", label: "Diseño Gráfico", desc: "Suite Adobe, ilustración y edición digital.", icon: "palette" },
  { id: "edicion", label: "Edición de Video", desc: "Edición y renderizado en 4K y producción.", icon: "movie" },
  { id: "desarrollo", label: "Desarrollo de Software", desc: "Compilación, virtualización y bases de datos.", icon: "code" },
  { id: "general", label: "Uso General", desc: "Navegación web, multimedia y tareas diarias.", icon: "devices" },
];

const COMPONENT_CATEGORIES: { id: ProductCategory; label: string; icon: string }[] = [
  { id: "procesadores", label: "Procesador (CPU)", icon: "memory" },
  { id: "placas", label: "Placa Madre", icon: "developer_board" },
  { id: "ram", label: "Memoria RAM", icon: "align_horizontal_left" },
  { id: "graficas", label: "Tarjeta de Video", icon: "broken_image" },
  { id: "almacenamiento", label: "Almacenamiento (SSD)", icon: "database" },
  { id: "fuentes", label: "Fuente de Poder", icon: "power" },
  { id: "gabinetes", label: "Gabinete (Case)", icon: "kitchen" },
  { id: "refrigeracion", label: "Refrigeración", icon: "ac_unit" },
  { id: "escritorios", label: "Escritorio Luteame", icon: "desk" },
];

export default function ConfiguratorPage() {
  const activeStep = useConfiguratorStore((s) => s.activeStep);
  const selections = useConfiguratorStore((s) => s.selections);
  const compatibility = useConfiguratorStore((s) => s.compatibility);
  const totalPrice = useConfiguratorStore((s) => s.totalPrice);
  const usoRecomendado = useConfiguratorStore((s) => s.usoRecomendado);
  const presupuestoRango = useConfiguratorStore((s) => s.presupuestoRango);

  const setStep = useConfiguratorStore((s) => s.setStep);
  const setUsoYPresupuesto = useConfiguratorStore((s) => s.setUsoYPresupuesto);
  const selectProduct = useConfiguratorStore((s) => s.selectProduct);
  const clearSelection = useConfiguratorStore((s) => s.clearSelection);
  const clearAll = useConfiguratorStore((s) => s.clearAll);
  const setRecommendedSetup = useConfiguratorStore((s) => s.setRecommendedSetup);

  const addItemToCart = useCartStore((s) => s.addItem);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("procesadores");

  const [selectedUso, setSelectedUso] = useState<NecesidadUso | null>(null);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<PresupuestoRango | null>(null);

  // Load all products initially for recommendation engine
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllProducts();
        setAllProducts(data);
      } catch (err) {
        console.error("Error loading products for recommendations:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadData();
  }, []);

  // Sync internal state with store on load/step change
  useEffect(() => {
    if (usoRecomendado) setSelectedUso(usoRecomendado);
    if (presupuestoRango) setSelectedPresupuesto(presupuestoRango);
  }, [usoRecomendado, presupuestoRango]);

  const handleGenerateRecommendation = () => {
    if (!selectedUso || !selectedPresupuesto) return;
    setUsoYPresupuesto(selectedUso, selectedPresupuesto);

    // Call recommendation engine
    const recommendedSetup = generateRecommendation(allProducts, selectedUso, selectedPresupuesto);
    setRecommendedSetup(recommendedSetup);
    setStep(1);
  };

  const handleSelectProduct = (product: Product) => {
    selectProduct(activeCategory, product);
  };

  const handleAddSetupToCart = () => {
    // Collect all valid components
    const finalSetup: Record<string, Product> = {};
    Object.entries(selections).forEach(([cat, prod]) => {
      if (prod) finalSetup[cat] = prod;
    });

    if (Object.keys(finalSetup).length === 0) {
      alert("Por favor selecciona al menos un componente.");
      return;
    }

    const uniqueId = `setup_${Date.now()}`;
    addItemToCart({
      id: uniqueId,
      tipo: "pc_configurada",
      nombre: `PC Armada LUTEAME — ${NECESIDADES.find((n) => n.id === usoRecomendado)?.label || "Personalizada"}`,
      precioUnitario: totalPrice,
      precioTotal: totalPrice,
      cantidad: 1,
      imagenUrl: selections["gabinetes"]?.imagenUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
      componentesConfigurados: finalSetup,
    });

    alert("¡Tu PC configurada ha sido agregada al carrito!");
    routerToCart();
  };

  const routerToCart = () => {
    // We will open the cart sidebar or redirect to shop.
    // For now we'll notify the user.
  };

  return (
    <div className="section-container py-brand-md pb-brand-xl">
      {/* Step Stepper Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/10 pb-6 mb-8">
        <div>
          <h1 className="font-poppins text-display-lg-mobile md:text-headline-md font-extrabold text-primary">
            Configurador de Setup Inteligente
          </h1>
          <p className="font-montserrat text-body-sm text-on-surface-variant mt-1">
            "El setup de tus sueños, simplificado."
          </p>
        </div>

        {/* Wizard Stepper */}
        <div className="flex items-center gap-2 md:gap-4">
          {[0, 1, 2].map((step) => {
            const isActive = step === activeStep;
            const isCompleted = step < activeStep;
            const labels = ["Asistente", "Personalización", "Resumen"];
            return (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => {
                    if (step === 0 || (step === 1 && usoRecomendado) || (step === 2 && Object.values(selections).some(Boolean))) {
                      setStep(step);
                    }
                  }}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-lg border font-montserrat text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-primary-container/20 border-primary-container text-primary"
                      : isCompleted
                      ? "border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/50"
                      : "border-transparent text-on-surface-variant/40 cursor-not-allowed"
                  }`}
                  disabled={step > 1 && !Object.values(selections).some(Boolean)}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {step === 0 ? "ads_click" : step === 1 ? "settings_suggest" : "fact_check"}
                  </span>
                  <span className="hidden sm:inline">{labels[step]}</span>
                </button>
                {step < 2 && (
                  <span className="material-symbols-outlined text-outline-variant text-[14px] ml-2">
                    arrow_forward_ios
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 0: Needs & Budget Quiz */}
      {activeStep === 0 && (
        <div className="max-w-4xl mx-auto glass-panel p-6 md:p-8 rounded-xl animate-fade-in">
          <h2 className="font-poppins text-title-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">psychology</span>
            Paso 1: ¿Cuál es el propósito y tu presupuesto para este Setup?
          </h2>

          {/* Need Selection */}
          <div className="mb-8">
            <label className="block font-montserrat text-label-caps text-on-surface-variant uppercase tracking-wider mb-3">
              ¿Para qué usarás principalmente la computadora?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {NECESIDADES.map((item) => {
                const isSelected = selectedUso === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedUso(item.id)}
                    className={`glass-card p-4 rounded-xl flex flex-col items-center text-center gap-2 border transition-all duration-300 ${
                      isSelected
                        ? "border-primary-container bg-primary-container/10 text-primary scale-105 shadow-[0_0_20px_rgba(167,0,254,0.25)]"
                        : "border-outline-variant/20 hover:border-primary/40 hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    </div>
                    <span className="font-montserrat text-body-sm font-bold text-white">{item.label}</span>
                    <span className="font-montserrat text-[10px] text-on-surface-variant leading-tight">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Selection */}
          <div className="mb-8">
            <label className="block font-montserrat text-label-caps text-on-surface-variant uppercase tracking-wider mb-3">
              ¿Cuál es tu rango de presupuesto estimado?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {PRESUPUESTOS.map((item) => {
                const isSelected = selectedPresupuesto?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedPresupuesto(item)}
                    className={`glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center h-20 border transition-all duration-300 ${
                      isSelected
                        ? "border-primary-container bg-primary-container/10 text-primary scale-105 shadow-[0_0_20px_rgba(167,0,254,0.25)]"
                        : "border-outline-variant/20 hover:border-primary/40 hover:bg-white/5"
                    }`}
                  >
                    <span className="font-montserrat text-body-sm font-bold text-white">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-end pt-4 border-t border-outline-variant/10">
            <button
              onClick={handleGenerateRecommendation}
              disabled={!selectedUso || !selectedPresupuesto || loadingProducts}
              className="btn-primary flex items-center gap-2 py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProducts ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  Analizando Catálogo...
                </>
              ) : (
                <>
                  Generar Configuración Recomendada
                  <span className="material-symbols-outlined text-base">magic_button</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Recommendation & Customization */}
      {activeStep === 1 && (
        <div className="flex flex-col lg:flex-row gap-gutter items-start animate-fade-in">
          {/* Left: Component List */}
          <aside className="w-full lg:w-[280px] shrink-0 glass-panel p-5 rounded-xl">
            <h2 className="font-poppins text-title-lg font-bold text-white mb-4 pb-2 border-b border-outline-variant/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">widgets</span>
              Componentes
            </h2>
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
              {COMPONENT_CATEGORIES.map((cat) => {
                const product = selections[cat.id];
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                      isActive
                        ? "border-primary-container bg-primary-container/10 text-primary"
                        : "border-outline-variant/10 hover:border-primary-container/30 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-primary" : "text-on-surface-variant"}`}>
                        {cat.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-montserrat text-[10px] text-on-surface-variant uppercase tracking-wider leading-none mb-1">
                          {cat.label}
                        </p>
                        {product ? (
                          <p className="font-montserrat text-body-sm font-bold text-white truncate max-w-[150px]">
                            {product.nombre}
                          </p>
                        ) : (
                          <p className="font-montserrat text-body-sm italic text-on-surface-variant/50">
                            Sin seleccionar
                          </p>
                        )}
                      </div>
                    </div>
                    {product ? (
                      <span className="font-mono text-[11px] text-primary font-bold shrink-0">
                        S/. {product.precio}
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
                        add_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center: Option Grid */}
          <div className="flex-grow min-w-0 self-stretch">
            <OptionGrid
              activeStep={1}
              category={activeCategory}
              selectedProduct={selections[activeCategory]}
              onSelect={handleSelectProduct}
            />
          </div>

          {/* Right: Summary & Compatibility alerts */}
          <aside className="w-full lg:w-[320px] shrink-0 glass-panel p-5 rounded-xl sticky top-24 flex flex-col gap-5">
            <div>
              <h2 className="font-poppins text-title-lg font-bold text-white pb-2 border-b border-outline-variant/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">price_check</span>
                Resumen Setup
              </h2>
            </div>

            {/* Price list */}
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 border-b border-outline-variant/10 pb-4">
              {COMPONENT_CATEGORIES.map((cat) => {
                const product = selections[cat.id];
                if (!product) return null;
                return (
                  <div key={cat.id} className="flex justify-between items-center gap-2 font-montserrat text-xs">
                    <span className="text-on-surface-variant truncate max-w-[160px]">{product.nombre}</span>
                    <span className="font-bold text-white shrink-0">S/. {product.precio.toLocaleString()}</span>
                  </div>
                );
              })}
              {Object.values(selections).filter(Boolean).length === 0 && (
                <p className="text-center italic text-on-surface-variant/50 text-xs py-4">No hay componentes elegidos</p>
              )}
            </div>

            {/* Compatibility Alerts */}
            <div className="bg-surface-container-low/50 border border-outline-variant/10 rounded-lg p-3">
              <h3 className="font-montserrat text-label-caps text-on-surface-variant font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className={`material-symbols-outlined text-[16px] ${compatibility.compatible ? "text-emerald-400" : "text-error"}`}>
                  {compatibility.compatible ? "verified" : "warning"}
                </span>
                Compatibilidad
              </h3>
              {compatibility.warnings.length === 0 ? (
                <p className="font-montserrat text-[11px] text-emerald-400">
                  ✓ Todos los componentes seleccionados son compatibles entre sí.
                </p>
              ) : (
                <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                  {compatibility.warnings.map((w, idx) => (
                    <p key={idx} className="font-montserrat text-[11px] text-tertiary leading-normal flex items-start gap-1">
                      <span className="material-symbols-outlined text-[12px] text-tertiary mt-0.5 shrink-0">info</span>
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Total price */}
            <div className="flex justify-between items-end">
              <span className="font-montserrat text-body-sm text-on-surface-variant">Precio total:</span>
              <div className="text-right">
                <p className="font-poppins text-2xl font-bold text-primary leading-none">
                  S/. {totalPrice.toLocaleString("es-PE")}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={Object.values(selections).filter(Boolean).length === 0}
                className="btn-primary w-full flex justify-center items-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold tracking-widest uppercase"
              >
                Revisar Setup Final
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
              <button
                onClick={clearAll}
                className="btn-secondary w-full text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Reiniciar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* STEP 2: Summary Page */}
      {activeStep === 2 && (
        <div className="max-w-4xl mx-auto glass-panel p-6 md:p-8 rounded-xl animate-fade-in">
          <h2 className="font-poppins text-headline-md font-bold text-white mb-6 flex items-center gap-2 border-b border-outline-variant/15 pb-4">
            <span className="material-symbols-outlined text-primary">fact_check</span>
            Resumen Final de tu Setup Personalizado
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Component Summary Card */}
            <div className="space-y-4">
              <h3 className="font-montserrat text-title-lg font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">grid_view</span>
                Componentes Seleccionados
              </h3>
              <div className="space-y-2 border border-outline-variant/10 rounded-lg p-4 bg-surface-container-low/20">
                {COMPONENT_CATEGORIES.map((cat) => {
                  const product = selections[cat.id];
                  if (!product) return null;
                  return (
                    <div key={cat.id} className="flex justify-between items-start gap-4 text-xs font-montserrat py-1.5 border-b border-outline-variant/5 last:border-b-0">
                      <span className="text-on-surface-variant shrink-0 w-24 font-bold">{cat.label}:</span>
                      <span className="text-white text-right truncate max-w-[200px]" title={product.nombre}>{product.nombre}</span>
                      <span className="text-primary font-bold shrink-0 font-mono">S/. {product.precio}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overview Visual Card */}
            <div className="flex flex-col gap-4">
              <h3 className="font-montserrat text-title-lg font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">analytics</span>
                Estado de la Configuración
              </h3>

              <div className="border border-outline-variant/10 rounded-lg p-5 bg-surface-container-low/20 flex-grow flex flex-col justify-between">
                <div>
                  <p className="font-montserrat text-[11px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Uso recomendado asignado
                  </p>
                  <p className="font-montserrat text-body-lg font-bold text-white mb-4">
                    {NECESIDADES.find((n) => n.id === usoRecomendado)?.label || "Personalizado"}
                  </p>

                  <p className="font-montserrat text-[11px] text-on-surface-variant uppercase tracking-widest mb-1">
                    Compatibilidad
                  </p>
                  <p className={`font-montserrat text-body-sm font-bold flex items-center gap-1 mb-4 ${compatibility.compatible ? "text-emerald-400" : "text-tertiary"}`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {compatibility.compatible ? "verified" : "warning"}
                    </span>
                    {compatibility.compatible ? "100% Compatible y Listo" : "Requiere Revisión"}
                  </p>
                </div>

                <div className="border-t border-outline-variant/10 pt-4 flex justify-between items-end">
                  <div>
                    <span className="font-montserrat text-xs text-on-surface-variant">Precio Final del Ensamble:</span>
                    <p className="font-poppins text-display-lg-mobile md:text-headline-md font-bold text-primary leading-none">
                      S/. {totalPrice.toLocaleString("es-PE")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center gap-4 border-t border-outline-variant/10 pt-6">
            <button
              onClick={() => setStep(1)}
              className="btn-secondary flex items-center gap-2 py-3 px-6 text-xs font-bold uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Volver a Personalizar
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleAddSetupToCart}
                className="btn-primary flex items-center gap-2 py-3 px-8 text-xs font-bold uppercase tracking-wider"
              >
                Agregar Setup al Carrito
                <span className="material-symbols-outlined text-base">shopping_cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
