"use client";
// src/components/chat/ProductRecommendationCard.tsx

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  productId: string;
}

export default function ProductRecommendationCard({ productId }: ProductCardProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  const addItemToCart = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, "productos", productId));
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() } as Product);
        }
      } catch (err) {
        console.error("Error fetching recommended product details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    addItemToCart({
      id: product.id,
      tipo: "producto",
      nombre: product.nombre,
      precioUnitario: product.precio,
      precioTotal: product.precio,
      cantidad: 1,
      imagenUrl: product.imagenUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
      categoria: product.categoria,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full h-[85px] animate-pulse bg-white/5 border border-outline-variant/10 rounded-lg flex items-center p-3 gap-3">
        <div className="w-12 h-12 bg-white/10 rounded" />
        <div className="flex-grow space-y-2">
          <div className="h-3 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const defaultImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR";

  return (
    <div className="w-full bg-surface-container border border-outline-variant/15 rounded-lg flex items-center p-3 gap-3 hover:border-primary-container/30 transition-all duration-300 shadow-sm animate-fade-in my-1.5">
      {/* Product Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.imagenUrl || defaultImg}
        alt={product.nombre}
        className="w-12 h-12 object-contain bg-background p-1 border border-outline-variant/10 rounded shrink-0"
      />

      {/* Details */}
      <div className="min-w-0 flex-grow text-left">
        <p className="font-montserrat text-xs font-bold text-white truncate" title={product.nombre}>
          {product.nombre}
        </p>
        <p className="font-montserrat text-[9px] text-on-surface-variant capitalize tracking-wide mt-0.5 leading-none">
          {product.categoria}
        </p>
        <p className="font-mono text-[11px] text-primary font-bold mt-1 leading-none">
          S/. {product.precio.toLocaleString("es-PE")}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={handleAddToCart}
        className={`p-2 rounded-full flex items-center justify-center shrink-0 transition-all ${
          added
            ? "bg-green-600/20 border border-green-500 text-green-400"
            : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white"
        }`}
        aria-label="Agregar recomendado al carrito"
      >
        <span className="material-symbols-outlined text-[18px]">
          {added ? "done" : "add_shopping_cart"}
        </span>
      </button>
    </div>
  );
}
