// src/app/login/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta Luteame para gestionar tu setup y pedidos de hardware élite.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 md:px-8 py-16">
      <Suspense fallback={<div className="text-on-surface-variant font-montserrat">Cargando acceso...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
