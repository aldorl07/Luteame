// src/components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-outline-variant/10 mt-brand-xl" style={{ background: "rgba(18,11,23,0.95)" }}>
      <div className="section-container py-brand-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Brand */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="font-poppins text-headline-md font-extrabold text-primary">
              Luteame
            </span>
            <p className="font-montserrat text-body-sm text-on-surface-variant max-w-xs">
              Elite Accessibility. Hardware y setups modulares diseñados para el máximo rendimiento en Huancayo, Junín.
            </p>
            <div className="inline-flex items-center gap-1 bg-primary-container/10 border border-primary-container/30 px-3 py-1 rounded text-primary font-montserrat text-label-caps uppercase tracking-widest w-fit">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Garantía Local
            </div>
            <p className="font-montserrat text-body-sm text-on-surface-variant/60">
              © {year} Luteame. Garantía y Soporte Local en Huancayo, Junín
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-8 flex flex-wrap gap-brand-lg justify-start md:justify-end items-start">
            <nav className="flex flex-col gap-3">
              <h5 className="font-montserrat text-label-caps uppercase tracking-widest text-on-surface mb-1">
                Plataforma
              </h5>
              <Link href="/shop"         className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Catálogo</Link>
              <Link href="/configurator" className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Configurador PC</Link>
              <Link href="/services"     className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Servicios Técnicos</Link>
            </nav>

            <nav className="flex flex-col gap-3">
              <h5 className="font-montserrat text-label-caps uppercase tracking-widest text-on-surface mb-1">
                Atención & Clientes
              </h5>
              <Link href="/tracking"     className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Seguimiento de Pedido</Link>
              <Link href="/warranty"     className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Garantía Local (2 Años)</Link>
              <Link href="/support"      className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Centro de Soporte</Link>
            </nav>

            <nav className="flex flex-col gap-3">
              <h5 className="font-montserrat text-label-caps uppercase tracking-widest text-on-surface mb-1">
                Contacto Huancayo
              </h5>
              <a href="https://wa.me/51969445063" target="_blank" rel="noopener noreferrer" className="font-montserrat text-body-sm text-emerald-400 hover:underline">WhatsApp: 969 445 063</a>
              <span className="font-montserrat text-body-sm text-on-surface-variant">Huancayo, Junín</span>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
