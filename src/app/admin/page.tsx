"use client";
// src/app/admin/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { subscribeToProducts } from "@/lib/firestore";
import { Product } from "@/types";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Protected route check
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, loading, isAdmin, router]);

  // Subscribe to products list
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToProducts({ categories: [] }, (data) => {
      setProducts(data);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Simulated actions for demonstration and control
  const handleSimulatedAction = (actionName: string, successMessage: string) => {
    setActionLoading(actionName);
    setTimeout(() => {
      setActionLoading(null);
      showToast(successMessage);
    }, 1200);
  };

  // Show loading spinner while checking auth
  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">
          progress_activity
        </span>
        <p className="font-montserrat text-on-surface-variant text-body-lg animate-pulse">
          Comprobando credenciales de seguridad...
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValue = products.reduce((acc, p) => acc + ((p.precio || 0) * (p.stock || 0)), 0);

  return (
    <div className="min-h-screen bg-background text-on-background pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel border-primary/40 text-on-surface p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right max-w-sm">
          <span className="material-symbols-outlined text-primary">
            {toast.type === "success" ? "check_circle" : "info"}
          </span>
          <span className="font-montserrat text-body-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="w-full border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-40">
        <div className="section-container h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-poppins text-2xl font-extrabold text-primary tracking-tight hover:text-glow transition-all">
              Luteame
            </Link>
            <span className="h-5 w-[1px] bg-outline-variant/40" />
            <span className="chip-purple border-tertiary-container text-tertiary bg-tertiary/10 border font-bold text-[10px] tracking-wider px-2 py-0.5 rounded">
              CONSOLA DE CONTROL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline font-montserrat text-body-sm text-on-surface-variant">
              Comandante: <strong className="text-white">{user.email}</strong>
            </span>
            <button
              onClick={handleSignOut}
              className="btn-secondary py-2 px-4 flex items-center gap-2 border-outline-variant/30 hover:border-error/40 hover:bg-error/10 hover:text-error text-xs"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="section-container mt-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins text-display-lg-mobile md:text-headline-md text-white font-extrabold mb-1">
              Dashboard de Control
            </h1>
            <p className="font-montserrat text-body-sm text-on-surface-variant">
              Monitoreo del catálogo de hardware, stock de componentes y estado operativo.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/" className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              Ir a la Tienda
            </Link>
            <button
              onClick={() => handleSimulatedAction("seed", "Base de datos restablecida con datos semilla.")}
              disabled={actionLoading !== null}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 bg-primary-container hover:bg-primary-container/80"
            >
              {actionLoading === "seed" ? (
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">database</span>
              )}
              Sembrar DB
            </button>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Productos Totales</span>
              <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">{products.length}</div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Modelos cargados en DB</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-container" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-tertiary/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Stock Acumulado</span>
              <span className="material-symbols-outlined text-tertiary text-3xl">widgets</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">{totalStock}</div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Unidades disponibles</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary to-tertiary-container" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Valor Inventario</span>
              <span className="material-symbols-outlined text-emerald-400 text-3xl">payments</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">${totalValue.toLocaleString()} USD</div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Valorización del stock actual</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Logs Operativos</span>
              <span className="material-symbols-outlined text-cyan-400 text-3xl">terminal</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">Activo</div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Estado del sistema Firebase</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
          </div>
        </div>

        {/* Dashboard Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product list - 2 cols on lg */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-outline-variant/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Control de Stock y Catálogo
              </h3>
              <span className="text-xs font-montserrat text-on-surface-variant">
                Actualizado en tiempo real
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-montserrat text-body-sm border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-on-surface-variant text-[11px] font-bold tracking-widest uppercase">
                    <th className="pb-3">Producto</th>
                    <th className="pb-3">Categoría</th>
                    <th className="pb-3 text-right">Precio</th>
                    <th className="pb-3 text-right">Stock</th>
                    <th className="pb-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                        Cargando catálogo de productos...
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const isLowStock = p.stock <= 3;
                      const isOutOfStock = p.stock === 0;

                      return (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors duration-150">
                          <td className="py-3.5 pr-3 font-semibold text-white truncate max-w-[200px]" title={p.nombre}>
                            {p.nombre}
                          </td>
                          <td className="py-3.5 pr-3 text-on-surface-variant text-xs capitalize">
                            {p.categoria}
                          </td>
                          <td className="py-3.5 pr-3 text-right text-white font-mono">
                            ${p.precio} USD
                          </td>
                          <td className={`py-3.5 pr-3 text-right font-mono font-bold ${isOutOfStock ? "text-error" : isLowStock ? "text-tertiary" : "text-emerald-400"}`}>
                            {p.stock}
                          </td>
                          <td className="py-3.5 text-center">
                            {isOutOfStock ? (
                              <span className="chip-purple border-error/40 text-error bg-error/10 border text-[9px] px-1.5 py-0.5 rounded">
                                Agotado
                              </span>
                            ) : isLowStock ? (
                              <span className="chip-purple border-tertiary/40 text-tertiary bg-tertiary/10 border text-[9px] px-1.5 py-0.5 rounded">
                                Bajo Stock
                              </span>
                            ) : (
                              <span className="chip-purple border-emerald-500/40 text-emerald-400 bg-emerald-500/10 border text-[9px] px-1.5 py-0.5 rounded">
                                Óptimo
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & System Status - 1 col on lg */}
          <div className="space-y-6">
            {/* Quick action container */}
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/20">
              <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">bolt</span>
                Acciones Administrativas
              </h3>
              <p className="font-montserrat text-body-sm text-on-surface-variant mb-6">
                Herramientas rápidas para mantenimiento y soporte de la plataforma.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleSimulatedAction("cache", "Caché de consultas a la base de datos vaciado.")}
                  disabled={actionLoading !== null}
                  className="w-full btn-secondary text-xs flex justify-between items-center p-3.5 hover:bg-white/5 border-outline-variant/30"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">cached</span>
                    Limpiar Caché del Servidor
                  </span>
                  {actionLoading === "cache" && (
                    <span className="material-symbols-outlined animate-spin text-sm text-primary">progress_activity</span>
                  )}
                </button>

                <button
                  onClick={() => handleSimulatedAction("backup", "Copia de seguridad completada. Guardada en storage.")}
                  disabled={actionLoading !== null}
                  className="w-full btn-secondary text-xs flex justify-between items-center p-3.5 hover:bg-white/5 border-outline-variant/30"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-cyan-400">cloud_upload</span>
                    Respaldar Base de Datos
                  </span>
                  {actionLoading === "backup" && (
                    <span className="material-symbols-outlined animate-spin text-sm text-cyan-400">progress_activity</span>
                  )}
                </button>

                <button
                  onClick={() => handleSimulatedAction("index", "Índices compuestos optimizados con éxito.")}
                  disabled={actionLoading !== null}
                  className="w-full btn-secondary text-xs flex justify-between items-center p-3.5 hover:bg-white/5 border-outline-variant/30"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-tertiary">tune</span>
                    Reindexar Firestore
                  </span>
                  {actionLoading === "index" && (
                    <span className="material-symbols-outlined animate-spin text-sm text-tertiary">progress_activity</span>
                  )}
                </button>
              </div>
            </div>

            {/* Service Status Panel */}
            <div className="glass-panel p-6 rounded-xl border border-outline-variant/20">
              <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">lan</span>
                Estado de Infraestructura
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between font-montserrat text-body-sm">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    Autenticación Firebase
                  </span>
                  <span className="text-emerald-400 font-bold">Operacional</span>
                </div>

                <div className="flex items-center justify-between font-montserrat text-body-sm">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    Base de Datos Firestore
                  </span>
                  <span className="text-emerald-400 font-bold">Operacional</span>
                </div>

                <div className="flex items-center justify-between font-montserrat text-body-sm">
                  <span className="text-on-surface-variant flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    Storage de Assets
                  </span>
                  <span className="text-emerald-400 font-bold">Operacional</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
