"use client";
// src/components/configurator/OptionGrid.tsx

import { useState, useEffect } from "react";
import { subscribeToProductsByCategory } from "@/lib/firestore";
import type { Product, ProductCategory } from "@/types";
import { STEP_LABELS } from "@/types";
import OptionCard from "./OptionCard";

interface OptionGridProps {
  activeStep: number;
  category: ProductCategory;
  selectedProduct: Product | null;
  onSelect: (product: Product) => void;
}

export default function OptionGrid({ activeStep, category, selectedProduct, onSelect }: OptionGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToProductsByCategory(category, (data) => {
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, [category]);

  return (
    <section className="flex-grow glass-panel rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center"
        style={{ background: "rgba(36,29,41,0.5)" }}>
        <div>
          <h3 className="font-montserrat text-title-lg text-on-surface font-semibold">
            {STEP_LABELS[activeStep]}
          </h3>
          <p className="font-montserrat text-[12px] text-on-surface-variant mt-0.5">
            {products.length} opciones disponibles
          </p>
        </div>
      </div>

      {/* Grid area */}
      <div className="flex-grow p-4 overflow-y-auto"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          minHeight: "480px",
        }}>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-xl h-56 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
            <span className="material-symbols-outlined text-5xl text-outline-variant">inventory_2</span>
            <p className="font-montserrat text-body-lg text-on-surface-variant text-center">
              No hay productos disponibles en esta categoría.<br />
              <span className="text-body-sm">Agrega productos desde Firestore.</span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {products.map((product) => (
              <OptionCard
                key={product.id}
                product={product}
                isSelected={selectedProduct?.id === product.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
