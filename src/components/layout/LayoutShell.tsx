"use client";
// src/components/layout/LayoutShell.tsx
// Conditionally renders Navbar and Footer based on current route.

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AUTH_ROUTES = ["/login", "/register", "/recover"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className={`relative z-10 flex-grow ${isAuthPage ? "" : ""}`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}
