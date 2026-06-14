"use client";
// src/components/home/HeroSection.tsx

import Link from "next/link";

export default function HeroSection() {
  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-brand-lg xl:gap-brand-xl min-h-[820px] items-center pt-brand-xl">
      {/* Left: Text Content */}
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 chip-purple w-fit">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          GARANTÍA LOCAL · HUANCAYO, JUNÍN
        </div>

        <h1 className="font-poppins text-display-lg-mobile md:text-display-lg text-primary font-extrabold leading-tight tracking-tight max-w-xl">
          El Setup de tus Sueños,{" "}
          <span className="text-white">Simplificado</span>
        </h1>

        <p className="font-montserrat text-body-lg text-on-surface-variant max-w-lg leading-relaxed">
          Hardware de alto rendimiento y escritorios a medida con garantía local
          en Huancayo, Junín. Arma tu estación de trabajo ideal con nosotros.
        </p>

        <div className="flex flex-wrap gap-3 mt-2">
          <Link href="/configurator" className="btn-primary">
            Cotizar Ahora
          </Link>
          <button
            onClick={scrollToServices}
            className="btn-secondary"
          >
            Ver Catálogo
          </button>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-outline-variant/20">
          {[
            { icon: "verified_user",  text: "Garantía Local" },
            { icon: "speed",          text: "Ensamblaje Profesional" },
            { icon: "support_agent",  text: "Soporte Técnico" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1 font-montserrat text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[16px]">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Hero Image */}
      <div className="relative h-[400px] md:h-[600px] rounded-xl overflow-hidden glass-card group animate-slide-in-right">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXlO4pdCbrmxXT7LqSwK-hHzHY3UYzpRY4N8B0_5lIiyLa22q5XfJ7lspEaJBy7PYxPfVd0Qj1tbSLqKPcZ_sg11eRWLoridvokhvVf3uwKe9RepViAwfkU_GwKzeTD0YT7te40YSFsaPSoNGnYnis3ghGtsKN2JR8IJ4y7_Sh4DNe28qaYdw7aG1V4YNh7gR3uz4iCl8lvoEvvmWoCVN_I0qkYslBBNATECwFFCgTMDMDCAi0CtnABzNkv326oE8kikUVVhiXNqbR"
          alt="High-end RGB gaming PC build with purple LED lighting"
          className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

        {/* Tech Spec badge */}
        <div className="absolute bottom-4 right-4 bg-primary-container/15 border border-primary-container/40 backdrop-blur-md px-3 py-1 rounded-lg text-primary font-montserrat text-label-caps uppercase tracking-widest">
          Tech Spec: RTX 4090
        </div>

        {/* Floating stats */}
        <div className="absolute top-4 left-4 glass-card px-3 py-2 rounded-lg animate-pulse-glow">
          <p className="font-montserrat text-[10px] text-on-surface-variant uppercase tracking-wider">Ensambles</p>
          <p className="font-poppins text-xl font-bold text-primary">+500</p>
        </div>
      </div>
    </section>
  );
}
