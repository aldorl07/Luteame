// src/app/page.tsx
import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import ServicesGrid from "@/components/home/ServicesGrid";

export const metadata: Metadata = {
  title: "Luteame — El Setup de tus Sueños, Simplificado",
  description: "Hardware de alto rendimiento y escritorios a medida con garantía local en Huancayo, Junín. Arma tu setup gamer ideal.",
};

export default function HomePage() {
  return (
    <div className="section-container pb-xl">
      <HeroSection />
      <ServicesGrid />
    </div>
  );
}
