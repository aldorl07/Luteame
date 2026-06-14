"use client";
// src/app/shop/page.tsx

import { useState, useMemo, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import FilterSidebar from "@/components/shop/FilterSidebar";
import ProductCard from "@/components/shop/ProductCard";
import type { ProductCategory } from "@/types";

type SortOption = "recommended" | "price-asc" | "price-desc";

export default function ShopPage() {
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [sortBy, setSortBy]             = useState<SortOption>("recommended");
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(0);

  // Fetch all products with real-time listener
  const { products, loading, maxProductPrice } = useProducts({ categories: [] });

  // Sync slider max once products arrive
  useEffect(() => {
    if (maxProductPrice > 0 && currentMaxPrice === 0) {
      setCurrentMaxPrice(maxProductPrice);
    }
  }, [maxProductPrice, currentMaxPrice]);

  const handleCategoryChange = (cat: ProductCategory, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, cat] : prev.filter((c) => c !== cat)
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setCurrentMaxPrice(maxProductPrice);
  };

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.categoria));
    }

    if (currentMaxPrice > 0) {
      result = result.filter((p) => p.precio <= currentMaxPrice);
    }

    switch (sortBy) {
      case "price-asc":  result.sort((a, b) => a.precio - b.precio); break;
      case "price-desc": result.sort((a, b) => b.precio - a.precio); break;
    }

    return result;
  }, [products, selectedCategories, currentMaxPrice, sortBy]);

  return (
    <div className="section-container py-xl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="font-poppins text-display-lg-mobile md:text-display-lg font-extrabold text-primary mb-1">
            Elite Hardware
          </h1>
          <p className="font-montserrat text-body-lg text-on-surface-variant">
            Equipamiento premium con garantía local en Huancayo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-montserrat text-body-sm text-on-surface-variant">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="font-montserrat text-body-sm text-on-surface rounded-lg px-3 py-2 focus:outline-none"
            style={{ background: "rgba(36,29,41,0.9)", border: "1px solid rgba(79,66,85,0.5)", color: "#ecdeef" }}
          >
            <option value="recommended">Recomendados</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Sidebar */}
        <FilterSidebar
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          maxPrice={maxProductPrice || 10000}
          currentMaxPrice={currentMaxPrice || maxProductPrice || 10000}
          onMaxPriceChange={setCurrentMaxPrice}
          onClearFilters={handleClearFilters}
        />

        {/* Product Grid */}
        <div className="col-span-1 md:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-xl h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="material-symbols-outlined text-6xl text-outline-variant">inventory_2</span>
              <p className="font-montserrat text-body-lg text-on-surface-variant text-center">
                No hay productos con los filtros seleccionados.
              </p>
              <button onClick={handleClearFilters} className="btn-secondary">
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <p className="font-montserrat text-body-sm text-on-surface-variant/60 mt-6 text-center">
                Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
