// src/app/register/page.tsx
import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Únete a Luteame y construye el setup de tus sueños con garantía local en Huancayo.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-gutter py-xl">
      <RegisterForm />
    </div>
  );
}
