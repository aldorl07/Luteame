"use client";

import { useState, useEffect } from "react";
import { subscribeToProducts } from "@/lib/firestore";
import type { Product, ProductCategory } from "@/types";

interface UseProductsOptions {
  categories?: ProductCategory[];
  maxPrice?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToProducts(
      {
        categories: options.categories ?? [],
        maxPrice: options.maxPrice,
      },
      (data) => {
        setProducts(data);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options.categories), options.maxPrice]);

  const maxProductPrice = products.reduce(
    (max, p) => Math.max(max, p.precio),
    0
  );

  return { products, loading, error, maxProductPrice };
}
