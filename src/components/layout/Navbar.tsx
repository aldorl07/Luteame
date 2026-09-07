"use client";
// src/components/layout/Navbar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";

const NAV_LINKS = [
  { href: "/",             label: "Inicio" },
  { href: "/configurator", label: "Configurador" },
  { href: "/shop",         label: "Tienda" },
  { href: "/services",     label: "Servicios" },
  { href: "/support",      label: "Soporte" },
  { href: "/warranty",     label: "Garantías" },
];

export default function Navbar() {
  const pathname        = usePathname();
  const router          = useRouter();
  const { user, loading, isAdmin, logout } = useAuthContext();
  const itemCount       = useCartStore((s) => s.itemCount);
  const cartOpen        = useUIStore((s) => s.cartOpen);
  const setCartOpen    = useUIStore((s) => s.setCartOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await logout("manual");
    router.push("/");
  };

  const navItems = [...NAV_LINKS];
  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin Portal" });
  }

  return (
    <header className="sticky top-0 z-50 w-full" style={{ backdropFilter: "blur(12px)", background: "rgba(24,17,28,0.85)" }}>
      <div className="section-container flex justify-between items-center h-[80px]">
        {/* Brand */}
        <Link href="/" className="shrink-0 mr-4 lg:mr-8 font-poppins text-2xl font-extrabold text-primary tracking-tight hover:text-glow transition-all">
          Luteame
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-7 flex-nowrap">
          {navItems.map(({ href, label }) => {
            const isAdminLink = href === "/admin";
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

            if (isAdminLink) {
              return (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg border text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 ${
                    isActive
                      ? "bg-tertiary/25 border-tertiary text-tertiary shadow-[0_0_15px_rgba(255,183,77,0.35)]"
                      : "bg-tertiary/10 border-tertiary/40 text-tertiary hover:bg-tertiary/20 hover:border-tertiary hover:shadow-[0_0_12px_rgba(255,183,77,0.25)]"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                  Portal Admin
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap font-montserrat text-xs xl:text-[13px] font-bold tracking-widest uppercase transition-colors duration-300 pb-1 ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="shrink-0 ml-4 flex items-center gap-3 lg:gap-4">
          {/* Cart */}
          <button
            className="relative text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1"
            aria-label="Carrito de compras"
            onClick={() => setCartOpen(!cartOpen)}
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-container text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse-glow">
                {itemCount}
              </span>
            )}
          </button>

          <Link
            href="/configurator"
            className="hidden sm:flex btn-primary text-xs py-2.5 px-4"
          >
            Armar Setup
          </Link>

          {/* Auth button */}
          {!loading && (
            user ? (
              <button
                onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1.5 text-on-surface-variant hover:text-primary font-montserrat text-xs font-bold tracking-widest uppercase transition-colors px-2 py-1"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Salir
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex btn-secondary text-xs py-2 px-3"
              >
                Ingresar
              </Link>
            )
          )}

          {/* Mobile/Tablet menu toggle */}
          <button
            className="lg:hidden text-on-surface-variant hover:text-primary transition-colors p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-t border-outline-variant/20 animate-fade-in">
          <nav className="section-container py-4 flex flex-col gap-3">
            {navItems.map(({ href, label }) => {
              const isAdminLink = href === "/admin";
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-montserrat text-label-caps font-bold tracking-widest uppercase py-2 transition-colors ${
                    isActive
                      ? isAdminLink ? "text-tertiary text-glow" : "text-primary"
                      : isAdminLink ? "text-tertiary/80 hover:text-tertiary" : "text-on-surface-variant"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="border-t border-outline-variant/20 pt-3 mt-1">
              {user ? (
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="text-on-surface-variant font-montserrat text-label-caps font-bold tracking-widest uppercase"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-primary inline-flex">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
