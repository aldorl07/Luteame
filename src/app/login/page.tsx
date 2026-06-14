// src/app/login/page.tsx
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta Luteame para gestionar tu setup y pedidos de hardware élite.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-gutter py-xl">
      <LoginForm />
    </div>
  );
}
