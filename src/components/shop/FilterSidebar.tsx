"use client";
// src/components/shop/FilterSidebar.tsx

import type { ProductCategory } from "@/types";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "procesadores",  label: "Procesadores" },
  { value: "graficas",      label: "Tarjetas Gráficas" },
  { value: "placas",        label: "Placas Madre" },
  { value: "ram",           label: "Memoria RAM" },
  { value: "almacenamiento",label: "Almacenamiento" },
  { value: "fuentes",       label: "Fuentes de Poder" },
  { value: "refrigeracion", label: "Refrigeración" },
  { value: "gabinetes",     label: "Gabinetes" },
  { value: "escritorios",   label: "Escritorios" },
];

interface FilterSidebarProps {
  selectedCategories: ProductCategory[];
  onCategoryChange: (category: ProductCategory, checked: boolean) => void;
  maxPrice: number;
  currentMaxPrice: number;
  onMaxPriceChange: (value: number) => void;
  onClearFilters: () => void;
}

export default function FilterSidebar({
  selectedCategories,
  onCategoryChange,
  maxPrice,
  currentMaxPrice,
  onMaxPriceChange,
  onClearFilters,
}: FilterSidebarProps) {
  return (
    <aside className="col-span-1 md:col-span-3 space-y-8 h-fit sticky top-24 hidden md:block">
      {/* Category Filter */}
      <div className="space-y-4">
        <h3 className="font-montserrat text-title-lg text-on-surface border-b border-outline-variant/20 pb-2">
          Categoría
        </h3>
        <ul className="space-y-3">
          {CATEGORIES.map(({ value, label }) => {
            const checked = selectedCategories.includes(value);
            return (
              <li key={value}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onCategoryChange(value, e.target.checked)}
                    className="w-4 h-4 rounded border-outline-variant accent-primary-container cursor-pointer"
                  />
                  <span className={`font-montserrat text-body-sm transition-colors duration-200 ${
                    checked
                      ? "text-primary font-semibold"
                      : "text-on-surface-variant group-hover:text-primary"
                  }`}>
                    {label}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <h3 className="font-montserrat text-title-lg text-on-surface border-b border-outline-variant/20 pb-2">
          Precio (S/.)
        </h3>
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={maxPrice || 10000}
            value={currentMaxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer accent-primary-container"
          />
          <div className="flex justify-between mt-2">
            <span className="font-montserrat text-label-caps text-on-surface-variant">S/. 0</span>
            <span className="font-montserrat text-label-caps text-primary font-bold">
              S/. {currentMaxPrice.toLocaleString("es-PE")}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onClearFilters}
          className="w-full border border-primary-container/50 text-primary-container font-montserrat text-label-caps uppercase tracking-widest py-3 rounded-lg hover:bg-primary-container/10 transition-colors"
        >
          Limpiar Filtros
        </button>
      </div>
    </aside>
  );
}
