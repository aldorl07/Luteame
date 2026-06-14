// src/components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-outline-variant/10 mt-xl" style={{ background: "rgba(18,11,23,0.95)" }}>
      <div className="section-container py-lg">
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
          <div className="md:col-span-8 flex flex-wrap gap-lg justify-start md:justify-end items-start">
            <nav className="flex flex-col gap-3">
              <h5 className="font-montserrat text-label-caps uppercase tracking-widest text-on-surface mb-1">
                Plataforma
              </h5>
              <Link href="/shop"         className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Catálogo</Link>
              <Link href="/configurator" className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Configurador</Link>
            </nav>

            <nav className="flex flex-col gap-3">
              <h5 className="font-montserrat text-label-caps uppercase tracking-widest text-on-surface mb-1">
                Legal
              </h5>
              <Link href="#" className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Privacy Policy</Link>
              <Link href="#" className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Terms of Service</Link>
            </nav>

            <nav className="flex flex-col gap-3">
              <h5 className="font-montserrat text-label-caps uppercase tracking-widest text-on-surface mb-1">
                Soporte
              </h5>
              <Link href="#" className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Warranty</Link>
              <Link href="#" className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">Contact</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
