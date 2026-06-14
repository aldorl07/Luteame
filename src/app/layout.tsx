// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ModularBackground from "@/components/layout/ModularBackground";
import LayoutShell from "../components/layout/LayoutShell";

export const metadata: Metadata = {
  title: {
    default:  "Luteame — El Setup de tus Sueños, Simplificado",
    template: "%s | Luteame",
  },
  description:
    "Hardware de alto rendimiento y escritorios a medida con garantía local en Huancayo, Junín. Arma tu setup ideal con Luteame.",
  keywords: [
    "gaming PC", "hardware Huancayo", "escritorios gaming",
    "setup gamer Peru", "Luteame",
  ],
  openGraph: {
    title:       "Luteame — El Setup de tus Sueños, Simplificado",
    description: "Hardware de alto rendimiento y escritorios a medida con garantía local en Huancayo.",
    type:        "website",
    locale:      "es_PE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <ModularBackground />
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
