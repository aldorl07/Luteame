"use client";
// src/components/layout/LayoutShell.tsx
// Conditionally renders Navbar, CartSidebar, and Footer based on current route.

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";
import ChatFloatingButton from "../chat/ChatFloatingButton";
import ChatWindow from "../chat/ChatWindow";

const STANDALONE_ROUTES = ["/login", "/register", "/recover", "/auth", "/admin"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      {!isStandalone && <Navbar />}
      <main className="relative z-10 flex-grow">
        {children}
      </main>
      {!isStandalone && <CartSidebar />}
      {!isStandalone && <ChatWindow />}
      {!isStandalone && <ChatFloatingButton />}
      {!isStandalone && <Footer />}
    </>
  );
}

