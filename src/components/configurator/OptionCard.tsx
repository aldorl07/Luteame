"use client";
// src/components/configurator/OptionCard.tsx

import type { Product } from "@/types";

interface OptionCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (product: Product) => void;
}

export default function OptionCard({ product, isSelected, onSelect }: OptionCardProps) {
  return (
    <div
      onClick={() => onSelect(product)}
      className={`relative glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden
        ${isSelected
          ? "border-[2px] border-primary-container"
          : "hover:bg-white/5 hover:border-primary-container/40"
        }`}
      style={isSelected ? { boxShadow: "0 0 20px rgba(167,0,254,0.25)" } : {}}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(product)}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary-container/20 text-primary-container font-montserrat text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-primary-container/40 z-10">
          Seleccionado
        </div>
      )}

      {/* Image */}
      <div className={`h-36 rounded-lg mb-3 flex items-center justify-center border transition-colors relative overflow-hidden
        ${isSelected
          ? "bg-surface-container border-primary-container/40"
          : "bg-surface-container border-outline-variant/20 group-hover:border-primary-container/30"
        }`}>
        {product.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            className="object-contain h-full w-full p-2 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className={`material-symbols-outlined text-5xl transition-colors ${
            isSelected ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
          }`}>
            devices
          </span>
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-primary-container/5 pointer-events-none" />
        )}
      </div>

      {/* Info */}
      <h4 className="font-montserrat text-body-lg font-bold text-on-surface leading-snug mb-1 line-clamp-2">
        {product.nombre}
      </h4>

      {/* Specs */}
      {Object.entries(product.especificaciones).length > 0 && (
        <p className="font-montserrat text-body-sm text-on-surface-variant mb-3 line-clamp-1">
          {Object.values(product.especificaciones).slice(0, 2).join(", ")}
        </p>
      )}

      <div className="flex justify-between items-center mt-auto pt-2 border-t border-outline-variant/10">
        <span className={`font-montserrat text-title-lg font-bold ${isSelected ? "text-primary" : "text-primary"}`}>
          S/. {product.precio.toLocaleString("es-PE")}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(product); }}
          className={`font-montserrat text-[11px] font-bold uppercase tracking-widest px-2 py-[3px] rounded transition-colors ${
            isSelected
              ? "bg-primary-container text-white"
              : "bg-white/10 text-on-surface-variant group-hover:bg-primary-container group-hover:text-white"
          }`}
        >
          {isSelected ? "Añadido" : "Añadir"}
        </button>
      </div>
    </div>
  );
}
