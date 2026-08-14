"use client";
// src/app/admin/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeToProducts,
  subscribeToAllOrders,
  updateOrderStatus,
  subscribeToAllTickets,
  resolveTicket,
  seedDatabase
} from "@/lib/firestore";
import { Product } from "@/types";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const SAMPLE_PRODUCTS = [
  {
    nombre: "Luteame Pro Desk — Nogal",
    categoria: "escritorios",
    precio: 850,
    stock: 10,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDULw5k46kW3EQt1QbKlkKdrQehZQsHqAb-sqYBrk-xZ3aOWG_1Y5bnCp6xeJcdCPBEGWi51HntOReKsXYi2bcJyPNmPIGmvLw970_wjDAha_CCerXuYa0Uy7mlCK29h4C43eimfuDCfhPHt-kPSUv5EtGk841Qtk9VFD-nbpG09oUekKFMUn9VAOqIAYN7yMi97PM2vnzdTbpyEa-pEFwtILBqXOenIl06jhiDJ9dPhAg_qWFHO2Gi39Db9P4-zFxsBXy_LYu1n-zv",
    garantiaLocal: true,
    especificaciones: { dimensiones: "160x80cm", madera: "Nogal", acabado: "Matte" },
    rating: 4.8,
    ratingCount: 120,
  },
  {
    nombre: "Luteame Cyber Base — Metal/Vidrio",
    categoria: "escritorios",
    precio: 1200,
    stock: 5,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDULw5k46kW3EQt1QbKlkKdrQehZQsHqAb-sqYBrk-xZ3aOWG_1Y5bnCp6xeJcdCPBEGWi51HntOReKsXYi2bcJyPNmPIGmvLw970_wjDAha_CCerXuYa0Uy7mlCK29h4C43eimfuDCfhPHt-kPSUv5EtGk841Qtk9VFD-nbpG09oUekKFMUn9VAOqIAYN7yMi97PM2vnzdTbpyEa-pEFwtILBqXOenIl06jhiDJ9dPhAg_qWFHO2Gi39Db9P4-zFxsBXy_LYu1n-zv",
    garantiaLocal: true,
    especificaciones: { dimensiones: "140x70cm", material: "Metal/Vidrio", perfil: "L-Shape" },
    rating: 4.9,
    ratingCount: 85,
  },
  {
    nombre: "AMD Ryzen 9 7950X",
    categoria: "procesadores",
    precio: 2800,
    stock: 8,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { socket: "AM5", nucleos: "16", frecuencia: "4.5GHz", tdp: "170W" },
    rating: 5,
    ratingCount: 210,
  },
  {
    nombre: "Intel Core i9-14900K",
    categoria: "procesadores",
    precio: 2600,
    stock: 6,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { socket: "LGA1700", nucleos: "24", frecuencia: "3.2GHz", tdp: "125W" },
    rating: 4.7,
    ratingCount: 180,
  },
  {
    nombre: "NVIDIA RTX 4090 24GB",
    categoria: "graficas",
    precio: 8500,
    stock: 3,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { vram: "24GB", bus: "384-bit", boost: "2.52GHz", tdp: "450W" },
    rating: 5,
    ratingCount: 320,
  },
  {
    nombre: "NVIDIA RTX 4070 Ti Super",
    categoria: "graficas",
    precio: 4200,
    stock: 7,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { vram: "16GB", bus: "256-bit", boost: "2.61GHz", tdp: "285W" },
    rating: 4.8,
    ratingCount: 145,
  },
  {
    nombre: "Corsair Dominator DDR5 64GB",
    categoria: "ram",
    precio: 950,
    stock: 12,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { capacidad: "64GB", tipo: "DDR5", velocidad: "6000MHz", latencia: "CL30" },
    rating: 4.9,
    ratingCount: 67,
  },
  {
    nombre: "NZXT Kraken Elite 360 RGB",
    categoria: "refrigeracion",
    precio: 1400,
    stock: 9,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { tipo: "AIO Líquida", radiador: "360mm", ventiladores: "3x120mm", rgb: "Sí" },
    rating: 4.7,
    ratingCount: 102,
  },
  {
    nombre: "Samsung 990 Pro 2TB NVMe",
    categoria: "almacenamiento",
    precio: 580,
    stock: 25,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { capacidad: "2TB", interfaz: "PCIe 4.0", lectura: "7450MB/s", escritura: "6900MB/s" },
    rating: 4.8,
    ratingCount: 280,
  },
  {
    nombre: "Corsair RM1000x 1000W 80+ Gold",
    categoria: "fuentes",
    precio: 650,
    stock: 18,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { potencia: "1000W", certificacion: "80+ Gold", modular: "Full", garantia: "10 años" },
    rating: 4.9,
    ratingCount: 190,
  },
  {
    nombre: "Lian Li O11 Dynamic EVO XL",
    categoria: "gabinetes",
    precio: 750,
    stock: 6,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR",
    garantiaLocal: true,
    especificaciones: { factor: "Full Tower", vidrio: "Templado", bahias: "3x2.5\" + 3x3.5\"", rgb: "No incluido" },
    rating: 4.9,
    ratingCount: 340,
  },
];

const MOCK_BUILD = {
  id: "000124",
  clienteNombre: "Aldo Ramos L.",
  componentes: {
    procesadores: { modelo: "AMD Ryzen 9 7950X", serie: "SN-AMD7950X-8829A", garantiaMeses: 24 },
    placas: { modelo: "ASUS ROG Crosshair X670E Hero", serie: "SN-ASUS670-1102A", garantiaMeses: 36 },
    ram: { modelo: "Corsair Dominator DDR5 64GB (2x32)", serie: "SN-DOM64G-9901X", garantiaMeses: 60 },
    graficas: { modelo: "NVIDIA RTX 4090 24GB", serie: "SN-NV4090-0082X", garantiaMeses: 24 },
    almacenamiento: { modelo: "Samsung 990 Pro 2TB NVMe", serie: "SN-SAMS990-2022B", garantiaMeses: 60 },
    fuentes: { modelo: "Corsair RM1000x 1000W 80+ Gold", serie: "SN-PSU1000W-7729C", garantiaMeses: 120 },
    gabinetes: { modelo: "Lian Li O11 Dynamic EVO XL", serie: "SN-LIANLI-5501A", garantiaMeses: 12 },
    refrigeracion: { modelo: "NZXT Kraken Elite 360 RGB", serie: "SN-NZXT360-3301B", garantiaMeses: 24 }
  }
};

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"productos" | "pedidos" | "soporte">("productos");

  // Collections state
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  
  // UI states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Ticket Response state
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [solucionText, setSolucionText] = useState("");
  const [obsText, setObsText] = useState("");
  const [ticketStatus, setTicketStatus] = useState<string>("resuelto");

  // Expanded states
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Protected route check
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [user, loading, isAdmin, router]);

  // Subscribe to Products
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToProducts({ categories: [] }, (data) => {
      setProducts(data);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Subscribe to Orders
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToAllOrders((data) => {
      setOrders(data);
    });

    return () => unsubscribe();
  }, [user, isAdmin]);

  // Subscribe to Support Tickets
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubscribe = subscribeToAllTickets((data) => {
      setTickets(data);
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

  // Real database seeding action
  const handleRealSeedDB = async () => {
    setActionLoading("seed");
    try {
      await seedDatabase(SAMPLE_PRODUCTS, MOCK_BUILD);
      showToast("Base de datos e índice de garantía (000124) creados con éxito.", "success");
    } catch (err) {
      console.error("Error seeding DB:", err);
      showToast("Error al sembrar la base de datos.", "info");
    } finally {
      setActionLoading(null);
    }
  };

  // Simulated actions for server stuff
  const handleSimulatedAction = (actionName: string, successMessage: string) => {
    setActionLoading(actionName);
    setTimeout(() => {
      setActionLoading(null);
      showToast(successMessage);
    }, 1200);
  };

  // Real Order Status Modification
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Estado de pedido actualizado a: ${status.replace("_", " ")}`, "success");
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast("Error al actualizar estado del pedido.", "info");
    }
  };

  // Real Ticket resolution
  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicketId) return;

    try {
      await resolveTicket(resolvingTicketId, {
        solucion: solucionText.trim(),
        observaciones: obsText.trim(),
        estado: ticketStatus,
      });

      showToast("Ticket de soporte actualizado con éxito.", "success");
      setResolvingTicketId(null);
      setSolucionText("");
      setObsText("");
    } catch (err) {
      console.error("Error resolving ticket:", err);
      showToast("Error al resolver ticket de soporte.", "info");
    }
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
              Gestión e-commerce: pedidos, soporte al cliente gamer y catálogo en tiempo real.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link href="/" className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              Ir a la Tienda
            </Link>
            <button
              onClick={handleRealSeedDB}
              disabled={actionLoading !== null}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 bg-primary-container hover:bg-primary-container/80"
            >
              {actionLoading === "seed" ? (
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-sm">database</span>
              )}
              Sembrar DB Real
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
            <p className="font-montserrat text-body-sm text-on-surface-variant">Modelos en catálogo</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-container" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-tertiary/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Pedidos Recibidos</span>
              <span className="material-symbols-outlined text-tertiary text-3xl">local_shipping</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">{orders.length}</div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Órdenes registradas</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-tertiary to-tertiary-container" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Ventas Estimadas</span>
              <span className="material-symbols-outlined text-emerald-400 text-3xl">payments</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">
              S/. {orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString("es-PE")}
            </div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Total bruto facturado</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          </div>

          <div className="glass-card p-6 rounded-xl border border-outline-variant/20 relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <span className="font-montserrat text-label-caps text-on-surface-variant font-semibold uppercase tracking-wider">Casos de Soporte</span>
              <span className="material-symbols-outlined text-cyan-400 text-3xl">support_agent</span>
            </div>
            <div className="text-3xl font-poppins font-extrabold text-white mb-1">
              {tickets.filter((t) => t.estado === "abierto" || t.estado === "en_proceso").length} / {tickets.length}
            </div>
            <p className="font-montserrat text-body-sm text-on-surface-variant">Tickets activos / totales</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-outline-variant/20 mb-8 font-montserrat text-xs font-bold uppercase tracking-widest gap-6">
          <button
            onClick={() => setActiveTab("productos")}
            className={`pb-3 transition-colors ${
              activeTab === "productos"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            Inventario
          </button>
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`pb-3 transition-colors ${
              activeTab === "pedidos"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab("soporte")}
            className={`pb-3 transition-colors ${
              activeTab === "soporte"
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-white"
            }`}
          >
            Soporte ({tickets.filter((t) => t.estado === "abierto").length})
          </button>
        </div>

        {/* Dynamic tabs render */}

        {/* TAB 1: PRODUCT LIST & STOCK */}
        {activeTab === "productos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-outline-variant/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  Catálogo de Productos
                </h3>
                <span className="text-xs font-montserrat text-on-surface-variant">
                  {products.length} Modelos en stock
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
                          El catálogo está vacío. Haz clic en "Sembrar DB Real" para cargar datos iniciales de hardware.
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
                              S/. {p.precio.toLocaleString("es-PE")}
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

            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-xl border border-outline-variant/20">
                <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                  Acciones Rápidas
                </h3>
                <p className="font-montserrat text-body-sm text-on-surface-variant mb-6">
                  Mantenimiento operativo del servidor de Luteame.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => handleSimulatedAction("cache", "Caché de consultas de productos vaciado.")}
                    disabled={actionLoading !== null}
                    className="w-full btn-secondary text-xs flex justify-between items-center p-3.5 hover:bg-white/5 border-outline-variant/30"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">cached</span>
                      Vaciar Caché Local
                    </span>
                    {actionLoading === "cache" && (
                      <span className="material-symbols-outlined animate-spin text-sm text-primary">progress_activity</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleSimulatedAction("backup", "Backup de base de datos generado y salvado.")}
                    disabled={actionLoading !== null}
                    className="w-full btn-secondary text-xs flex justify-between items-center p-3.5 hover:bg-white/5 border-outline-variant/30"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-cyan-400">cloud_upload</span>
                      Respaldar Firestore
                    </span>
                    {actionLoading === "backup" && (
                      <span className="material-symbols-outlined animate-spin text-sm text-cyan-400">progress_activity</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER MANAGEMENT */}
        {activeTab === "pedidos" && (
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 animate-fade-in">
            <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              Seguimiento de Pedidos y Armado
            </h3>

            {orders.length === 0 ? (
              <p className="text-center font-montserrat text-sm text-on-surface-variant py-8">
                No hay pedidos registrados en la tienda en este momento.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const date = order.fecha ? new Date(order.fecha.seconds * 1000).toLocaleString("es-PE") : "—";
                  const isExpanded = expandedOrders[order.id];

                  return (
                    <div
                      key={order.id}
                      className="border border-outline-variant/15 rounded-xl p-4 bg-surface-container-low/20 space-y-4"
                    >
                      {/* Top Header */}
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-white">
                              LUTE-{order.id.substring(0, 8).toUpperCase()}
                            </span>
                            <span
                              className={`chip-purple text-[9px] px-2 py-0.5 rounded border uppercase ${
                                order.estado === "completado"
                                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                  : order.estado === "enviado"
                                  ? "border-cyan-400/40 text-cyan-400 bg-cyan-400/10"
                                  : order.estado === "en_ensamblaje"
                                  ? "border-tertiary/40 text-tertiary bg-tertiary/10"
                                  : "border-primary-container/40 text-primary bg-primary-container/10"
                              }`}
                            >
                              {order.estado.replace("_", " ")}
                            </span>
                          </div>
                          <p className="font-montserrat text-[10px] text-on-surface-variant">
                            Registrado el: {date} · Total: <strong className="text-primary font-mono text-xs">S/. {order.total.toLocaleString("es-PE")}</strong>
                          </p>
                        </div>

                        {/* Dropdown status update */}
                        <div className="flex items-center gap-3">
                          <label className="font-montserrat text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                            Actualizar Estado:
                          </label>
                          <select
                            value={order.estado}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-background border border-outline-variant/20 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_ensamblaje">En Ensamblaje</option>
                            <option value="enviado">Enviado</option>
                            <option value="completado">Completado</option>
                          </select>

                          <button
                            onClick={() => setExpandedOrders((prev) => ({ ...prev, [order.id]: !isExpanded }))}
                            className="btn-secondary py-1 px-3 text-xs flex items-center gap-1 border-outline-variant/20"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                            </span>
                            Detalles
                          </button>
                        </div>
                      </div>

                      {/* Expanded customer and item lists */}
                      {isExpanded && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10 animate-fade-in font-montserrat text-xs">
                          {/* Client details */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-primary">Datos de Envío y Pago</h4>
                            <div className="space-y-1 bg-background/30 p-3 rounded-lg border border-outline-variant/5">
                              <p className="text-white"><strong className="text-on-surface-variant font-normal">Cliente:</strong> {order.clienteNombre}</p>
                              <p className="text-white"><strong className="text-on-surface-variant font-normal">Email:</strong> {order.clienteEmail || "No registrado"}</p>
                              <p className="text-white"><strong className="text-on-surface-variant font-normal">Teléfono / WA:</strong> {order.telefono}</p>
                              <p className="text-white"><strong className="text-on-surface-variant font-normal">Dirección:</strong> {order.direccion}</p>
                              <p className="text-white capitalize">
                                <strong className="text-on-surface-variant font-normal">Pago:</strong> {order.metodoPago.replace("_", " ")}
                                {order.detallesPago?.referencia && ` (Operación: ${order.detallesPago.referencia})`}
                                {order.detallesPago?.tarjetaUltimosCuatro && ` (Tarjeta terminada en: ${order.detallesPago.tarjetaUltimosCuatro})`}
                              </p>
                            </div>
                          </div>

                          {/* Items details */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-white uppercase tracking-wider text-[10px] text-primary">Artículos Adquiridos</h4>
                            <div className="space-y-2">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="bg-background/30 p-3 rounded-lg border border-outline-variant/5">
                                  <div className="flex justify-between items-start font-semibold text-white">
                                    <span className="truncate max-w-[200px]" title={item.nombre}>{item.nombre}</span>
                                    <span>Cant: {item.cantidad}</span>
                                  </div>
                                  
                                  {/* Custom PC components if applicable */}
                                  {item.componentes && (
                                    <div className="mt-2 pl-3 border-l border-primary-container/20 text-[10px] text-on-surface-variant/80 space-y-0.5">
                                      {item.componentes.map((c: any) => (
                                        <p key={c.categoria}>
                                          <span className="capitalize">{c.categoria}:</span> {c.nombre}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TICKETS & SUPPORT RESOLUTION */}
        {activeTab === "soporte" && (
          <div className="glass-panel p-6 rounded-xl border border-outline-variant/20 animate-fade-in">
            <h3 className="font-poppins text-title-lg font-bold text-white flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">contact_support</span>
              Centro de Atención y Soporte Técnico
            </h3>

            {tickets.length === 0 ? (
              <p className="text-center font-montserrat text-sm text-on-surface-variant py-8">
                No hay tickets de soporte abiertos. ¡Buen trabajo técnico!
              </p>
            ) : (
              <div className="space-y-6">
                {tickets.map((t) => {
                  const date = t.fechaCreacion ? new Date(t.fechaCreacion.seconds * 1000).toLocaleString("es-PE") : "—";
                  const isHigh = t.prioridad === "alta";
                  const isMedium = t.prioridad === "media";
                  
                  return (
                    <div
                      key={t.id}
                      className="border border-outline-variant/15 rounded-xl p-5 bg-surface-container-low/20 space-y-4"
                    >
                      {/* Ticket Info */}
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-montserrat text-body-lg font-bold text-white">
                              {t.titulo}
                            </h4>
                            <span
                              className={`chip-purple text-[9px] px-2 py-0.5 border rounded uppercase ${
                                isHigh
                                  ? "border-error/40 text-error bg-error/10"
                                  : isMedium
                                  ? "border-tertiary/40 text-tertiary bg-tertiary/10"
                                  : "border-primary-container/40 text-primary bg-primary-container/10"
                              }`}
                            >
                              Prioridad {t.prioridad}
                            </span>
                            <span
                              className={`chip-purple text-[9px] px-2 py-0.5 border rounded uppercase ${
                                t.estado === "resuelto" || t.estado === "cerrado"
                                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                  : "border-cyan-400/40 text-cyan-400 bg-cyan-400/10"
                              }`}
                            >
                              {t.estado.replace("_", " ")}
                            </span>
                          </div>
                          <p className="font-montserrat text-[10px] text-on-surface-variant font-semibold">
                            ID: {t.id.substring(0, 8).toUpperCase()} · Creado el {date} · Por: <strong className="text-white">{t.clienteEmail}</strong>
                          </p>
                        </div>

                        {/* Act button */}
                        {resolvingTicketId !== t.id && (
                          <button
                            onClick={() => {
                              setResolvingTicketId(t.id);
                              setSolucionText(t.solucion || "");
                              setObsText(t.observaciones || "");
                              setTicketStatus(t.estado);
                            }}
                            className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 font-montserrat font-bold uppercase tracking-wider"
                          >
                            <span className="material-symbols-outlined text-sm">edit_note</span>
                            Responder / Editar
                          </button>
                        )}
                      </div>

                      {/* Ticket problem description */}
                      <div className="font-montserrat text-xs text-white/90 bg-background/30 p-4 rounded-lg border border-outline-variant/5 leading-relaxed">
                        <p className="font-bold text-primary text-[10px] uppercase tracking-widest mb-1">Descripción del Cliente:</p>
                        {t.descripcion}
                      </div>

                      {/* Current response if any */}
                      {(t.solucion || t.observaciones) && resolvingTicketId !== t.id && (
                        <div className="font-montserrat text-xs text-emerald-300 bg-emerald-950/20 p-4 rounded-lg border border-emerald-500/10 space-y-1 leading-relaxed">
                          <p className="font-bold uppercase tracking-widest text-[10px] text-emerald-400">Respuesta Registrada:</p>
                          {t.solucion && <p><strong>Solución:</strong> {t.solucion}</p>}
                          {t.observaciones && <p className="text-on-surface-variant/80 italic"><strong>Observaciones:</strong> {t.observaciones}</p>}
                        </div>
                      )}

                      {/* Response Form */}
                      {resolvingTicketId === t.id && (
                        <form onSubmit={handleResolveTicket} className="space-y-4 p-4 rounded-lg bg-surface-container border border-outline-variant/15 animate-fade-in font-montserrat text-xs">
                          <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                            <h5 className="font-bold text-white uppercase text-[10px] tracking-wider text-primary">
                              Escribir Respuesta del Técnico
                            </h5>
                            <button
                              type="button"
                              onClick={() => setResolvingTicketId(null)}
                              className="text-on-surface-variant hover:text-white"
                            >
                              Cancelar
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2 space-y-1">
                              <label htmlFor={`solucion-${t.id}`} className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Diagnóstico / Solución</label>
                              <textarea
                                id={`solucion-${t.id}`}
                                required
                                rows={3}
                                value={solucionText}
                                onChange={(e) => setSolucionText(e.target.value)}
                                placeholder="Describe el procedimiento técnico realizado..."
                                className="w-full bg-background border border-outline-variant/20 rounded p-2 text-white focus:outline-none focus:border-primary-container"
                              />
                            </div>
                            
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label htmlFor={`obs-${t.id}`} className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Observaciones Internas</label>
                                <textarea
                                  id={`obs-${t.id}`}
                                  rows={2}
                                  value={obsText}
                                  onChange={(e) => setObsText(e.target.value)}
                                  placeholder="Detalles adicionales..."
                                  className="w-full bg-background border border-outline-variant/20 rounded p-2 text-white focus:outline-none focus:border-primary-container"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Nuevo Estado del Ticket</label>
                                <select
                                  value={ticketStatus}
                                  onChange={(e) => setTicketStatus(e.target.value)}
                                  className="w-full bg-background border border-outline-variant/20 rounded px-2.5 py-1.5 text-white focus:outline-none"
                                >
                                  <option value="abierto">Abierto</option>
                                  <option value="en_proceso">En Proceso</option>
                                  <option value="resuelto">Resuelto (Cerrar)</option>
                                  <option value="cerrado">Cerrado Administrativamente</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/10">
                            <button
                              type="button"
                              onClick={() => setResolvingTicketId(null)}
                              className="btn-secondary py-2 px-4 text-[10px]"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="btn-primary py-2 px-6 text-[10px]"
                            >
                              Guardar Respuesta
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
