"use client";
// src/components/shop/ProductCard.tsx

import { useState } from "react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
}

function StarRating({ rating = 0, count = 0 }: { rating: number; count: number }) {
  const filled = Math.floor(rating);
  const half   = rating % 1 >= 0.5;
  const empty  = 5 - filled - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: filled }).map((_, i) => (
        <span key={`f${i}`} className="material-symbols-outlined text-primary"
          style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>star</span>
      ))}
      {half && (
        <span className="material-symbols-outlined text-primary" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>star_half</span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e${i}`} className="material-symbols-outlined text-outline-variant" style={{ fontSize: "14px" }}>star</span>
      ))}
      {count > 0 && (
        <span className="font-montserrat text-[12px] text-on-surface-variant ml-1">({count})</span>
      )}
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const items   = useCartStore((s) => s.items);
  const [added, setAdded] = useState(false);

  const isInCart = items.some((i) => i.productId === product.id);
  const outOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (isInCart || outOfStock) return;
    addItem({
      productId:  product.id,
      nombre:     product.nombre,
      precio:     product.precio,
      imagenUrl:  product.imagenUrl,
      categoria:  product.categoria,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={`glass-panel rounded-xl overflow-hidden flex flex-col relative transition-all duration-300 group
      ${outOfStock ? "opacity-70 grayscale-[0.4]" : "hover:-translate-y-1"}`}>

      {/* Badge */}
      {outOfStock && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-outline-variant/60 text-white font-montserrat text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border border-outline-variant">
            Agotado
          </span>
        </div>
      )}
      {!outOfStock && product.stock <= 3 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="chip-purple">Últimas unidades</span>
        </div>
      )}

      {/* Image */}
      <div className="h-48 relative overflow-hidden bg-surface-container-highest/40 flex items-center justify-center p-4">
        {product.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imagenUrl}
            alt={product.nombre}
            className="object-contain h-full w-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">devices</span>
        )}

        {/* Hover actions overlay */}
        {!outOfStock && (
          <div className="absolute inset-0 bg-background/65 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button className="bg-surface-container border border-outline-variant p-2 rounded-full hover:bg-primary-container hover:text-white hover:border-primary-container transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined text-xl">visibility</span>
            </button>
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded-full transition-all ${
                isInCart
                  ? "bg-green-600/20 border border-green-500/40 text-green-400"
                  : "bg-primary-container text-white"
              }`}
              style={!isInCart ? { boxShadow: "0 0 15px rgba(167,0,254,0.5)" } : {}}
              aria-label="Agregar al carrito"
            >
              <span className="material-symbols-outlined text-xl">
                {isInCart ? "check_circle" : "add_shopping_cart"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-grow">
        <span className="font-montserrat text-[10px] text-on-surface-variant uppercase tracking-widest">
          {product.categoria}
        </span>

        <h4 className="font-poppins font-semibold text-body-lg text-on-surface leading-tight line-clamp-2">
          {product.nombre}
        </h4>

        {(product.rating ?? 0) > 0 && (
          <StarRating rating={product.rating ?? 0} count={product.ratingCount ?? 0} />
        )}

        {/* Specs preview */}
        {Object.keys(product.especificaciones).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(product.especificaciones).slice(0, 2).map(([k, v]) => (
              <span key={k} className="font-montserrat text-[10px] bg-surface-container px-2 py-[2px] rounded text-on-surface-variant">
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 border-t border-outline-variant/10 flex justify-between items-center mt-auto">
        <span className="font-poppins text-[20px] font-bold text-primary">
          S/. {product.precio.toLocaleString("es-PE")}
        </span>
        <div className="flex items-center gap-2">
          {product.garantiaLocal && (
            <div title="Garantía Local Huancayo" className="flex items-center gap-1 chip-purple">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Garantía
            </div>
          )}
          {added && (
            <span className="font-montserrat text-[10px] text-green-400 animate-fade-in">¡Añadido!</span>
          )}
        </div>
      </div>
    </div>
  );
}
