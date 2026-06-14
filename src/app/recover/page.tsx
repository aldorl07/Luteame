// src/app/recover/page.tsx
import type { Metadata } from "next";
import RecoverForm from "@/components/auth/RecoverForm";

export const metadata: Metadata = {
  title: "Recuperar Contraseña",
  description: "Restablece tu contraseña de Luteame de forma segura.",
};

export default function RecoverPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-gutter py-xl">
      <RecoverForm />
    </div>
  );
}
