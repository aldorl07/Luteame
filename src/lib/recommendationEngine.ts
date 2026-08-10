// src/lib/recommendationEngine.ts
import type { Product, NecesidadUso, PresupuestoRango } from "@/types";

/**
 * Dynamically generates a recommended PC setup based on the user's needs and budget.
 */
export function generateRecommendation(
  allProducts: Product[],
  uso: NecesidadUso,
  presupuesto: PresupuestoRango
): Record<string, Product> {
  const recommended: Record<string, Product> = {};

  // Group products by category
  const categories: Record<string, Product[]> = {};
  allProducts.forEach((p) => {
    if (!categories[p.categoria]) {
      categories[p.categoria] = [];
    }
    categories[p.categoria].push(p);
  });

  // Target price calculation based on budget range mid point
  const budgetMid = (presupuesto.min + (presupuesto.max === Infinity ? 8000 : presupuesto.max)) / 2;

  // Budget allocation percentages based on usage profile
  let allocations: Record<string, number> = {
    procesadores: 0.20,
    graficas: 0.35,
    placas: 0.12,
    ram: 0.08,
    almacenamiento: 0.07,
    fuentes: 0.08,
    gabinetes: 0.06,
    refrigeracion: 0.04,
  };

  if (uso === "oficina" || uso === "general") {
    // No dedicated GPU needed or very basic
    allocations = {
      procesadores: 0.35,
      placas: 0.18,
      ram: 0.15,
      almacenamiento: 0.15,
      fuentes: 0.10,
      gabinetes: 0.07,
      refrigeracion: 0.00, // Stock cooler
      graficas: 0.00,      // Integrated
    };
  } else if (uso === "ingenieria" || uso === "desarrollo" || uso === "edicion") {
    // High CPU & RAM focus
    allocations = {
      procesadores: 0.30,
      graficas: 0.22,
      placas: 0.15,
      ram: 0.12,
      almacenamiento: 0.08,
      fuentes: 0.07,
      gabinetes: 0.06,
      refrigeracion: 0.05,
    };
  }

  // Find the best fit for each category
  Object.entries(allocations).forEach(([cat, pct]) => {
    const targetPrice = budgetMid * pct;
    const catProducts = categories[cat] || [];
    if (catProducts.length === 0) return;

    // Sort by absolute difference to target price
    const sorted = [...catProducts].sort((a, b) => {
      return Math.abs(a.precio - targetPrice) - Math.abs(b.precio - targetPrice);
    });

    // Pick the closest matching product
    recommended[cat] = sorted[0];
  });

  // If gaming or engineering, and no graphics card was selected, try to pick the cheapest graphic card
  if ((uso === "gaming" || uso === "ingenieria" || uso === "arquitectura") && !recommended["graficas"] && categories["graficas"]?.length > 0) {
    // Sort by price ascending
    const cheapGpus = [...categories["graficas"]].sort((a, b) => a.precio - b.precio);
    recommended["graficas"] = cheapGpus[0];
  }

  return recommended;
}
