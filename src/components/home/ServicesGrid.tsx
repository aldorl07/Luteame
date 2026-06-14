"use client";
// src/components/home/ServicesGrid.tsx
import Link from "next/link";

const SERVICES = [
  {
    id:          "hardware",
    icon:        "memory",
    title:       "Hardware & Parts",
    description: "Componentes de última generación seleccionados para maximizar el rendimiento de tu estación de trabajo o gaming.",
    link:        "/shop",
    linkLabel:   "Explorar",
  },
  {
    id:          "assembly",
    icon:        "build",
    title:       "Professional Assembly",
    description: "Ensamblaje meticuloso con gestión de cables perfecta, pruebas de estrés térmico y optimización de BIOS incluidas.",
    link:        "/configurator",
    linkLabel:   "Detalles",
  },
  {
    id:          "furniture",
    icon:        "desk",
    title:       "Custom Furniture",
    description: "Escritorios modulares diseñados a medida para integrar tu setup, ocultar cables y soportar hardware pesado.",
    link:        "/shop",
    linkLabel:   "Ver Diseños",
  },
];

export default function ServicesGrid() {
  return (
    <section id="services" className="mt-xl pt-xl border-t border-outline-variant/10">
      <div className="mb-8">
        <h2 className="font-poppins text-headline-md text-on-background font-extrabold">
          Nuestros Servicios
        </h2>
        <p className="font-montserrat text-body-sm text-on-surface-variant mt-1">
          Modularidad y rendimiento garantizado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {SERVICES.map(({ id, icon, title, description, link, linkLabel }) => (
          <div
            key={id}
            className="glass-card p-6 rounded-xl flex flex-col gap-4 transition-all duration-300 group cursor-pointer
              hover:scale-105 hover:border-primary-container/50"
            style={{
              transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(167,0,254,0.2)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,0,254,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = "";
              (e.currentTarget as HTMLElement).style.borderColor = "";
            }}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary-container/20">
              <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 flex-grow">
              <h3 className="font-montserrat text-title-lg text-on-surface font-semibold">{title}</h3>
              <p className="font-montserrat text-body-sm text-on-surface-variant flex-grow">{description}</p>
            </div>

            {/* CTA */}
            <Link
              href={link}
              className="flex items-center gap-1 text-primary font-montserrat text-label-caps tracking-widest uppercase hover:gap-2 transition-all duration-300 w-fit"
            >
              {linkLabel}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
