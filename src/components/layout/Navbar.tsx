"use client";
// src/components/layout/Navbar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { useCartStore } from "@/store/cartStore";

const NAV_LINKS = [
  { href: "/",             label: "Home" },
  { href: "/configurator", label: "Configurator" },
  { href: "/shop",         label: "Shop" },
];

export default function Navbar() {
  const pathname        = usePathname();
  const router          = useRouter();
  const { user, loading, isAdmin } = useAuthContext();
  const itemCount       = useCartStore((s) => s.itemCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const navItems = [...NAV_LINKS];
  if (isAdmin) {
    navItems.push({ href: "/admin", label: "Admin Portal" });
  }

  return (
    <header className="sticky top-0 z-50 w-full" style={{ backdropFilter: "blur(12px)", background: "rgba(24,17,28,0.82)" }}>
      <div className="section-container flex justify-between items-center h-[80px]">
        {/* Brand */}
        <Link href="/" className="font-poppins text-2xl font-extrabold text-primary tracking-tight hover:text-glow transition-all">
          Luteame
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map(({ href, label }) => {
            const isAdminLink = href === "/admin";
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`font-montserrat text-label-caps font-bold tracking-widest uppercase transition-colors duration-300 pb-1 ${
                  isActive
                    ? isAdminLink
                      ? "text-tertiary border-b-2 border-tertiary text-glow"
                      : "text-primary border-b-2 border-primary"
                    : isAdminLink
                      ? "text-tertiary/80 hover:text-tertiary hover:text-glow"
                      : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <button
            className="relative text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Carrito de compras"
            onClick={() => {}}
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-container text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth button */}
          {!loading && (
            user ? (
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 text-on-surface-variant hover:text-primary font-montserrat text-label-caps font-bold tracking-widest uppercase transition-colors"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Salir
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex btn-primary"
              >
                Iniciar Sesión
              </Link>
            )
          )}

          <Link
            href="/configurator"
            className="hidden md:flex btn-primary"
          >
            Armar Setup
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            <span className="material-symbols-outlined">
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
