"use client";
// src/components/auth/RecoverForm.tsx

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function RecoverForm() {
  const [email, setEmail]           = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [globalError, setGlobalError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setGlobalError("");

    if (!email) { setEmailError("El correo es requerido."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingresa un correo válido.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/user-not-found") {
        setEmailError("No existe una cuenta con este correo.");
      } else {
        setGlobalError("Error al enviar el enlace. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <h1 className="font-poppins text-display-lg-mobile text-primary">Luteame</h1>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-outline-variant/20 p-8 md:p-10 flex flex-col gap-6"
        style={{ background: "rgba(18,11,23,0.90)", backdropFilter: "blur(20px)" }}>

        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary-container/15 border border-primary-container/30 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
          </div>
          <h2 className="font-montserrat text-headline-md text-on-surface mb-1">
            Recuperar Contraseña
          </h2>
          <p className="font-montserrat text-body-sm text-on-surface-variant">
            Te enviaremos un enlace para restablecer tu acceso
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center gap-4 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center"
              style={{ boxShadow: "0 0 20px rgba(167,0,254,0.3)" }}>
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                mark_email_read
              </span>
            </div>
            <p className="font-montserrat text-body-lg text-on-surface text-center font-semibold">
              Enlace de recuperación enviado a tu correo
            </p>
            <p className="font-montserrat text-body-sm text-on-surface-variant text-center">
              Revisa tu bandeja de entrada en <strong className="text-primary">{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {globalError && (
              <div className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error font-montserrat text-body-sm">
                {globalError}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="recover-email" className="font-montserrat text-label-caps text-on-surface-variant uppercase tracking-widest">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                  mail
                </span>
                <input
                  id="recover-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  placeholder="ejemplo@correo.com"
                  className={`input-glass ${emailError ? "border-error/70" : ""}`}
                />
              </div>
              {emailError && (
                <p className="font-montserrat text-body-sm text-red-500">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-base">send</span>
              )}
              Enviar Enlace
            </button>
          </form>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link href="/login" className="font-montserrat text-body-sm text-primary hover:text-primary-fixed transition-colors duration-200 inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
