"use client";
// src/components/auth/LoginForm.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

function mapFirebaseError(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "Usuario no encontrado. Verifica tu correo.";
    case "auth/wrong-password":
      return "Contraseña incorrecta. Inténtalo de nuevo.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento.";
    case "auth/invalid-email":
      return "El formato del correo no es válido.";
    case "auth/user-disabled":
      return "Esta cuenta ha sido deshabilitada.";
    default:
      return "Error al iniciar sesión. Inténtalo de nuevo.";
  }
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [emailError, setEmailError]       = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError]     = useState("");
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);

  // Real-time email validation
  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailError("Ingresa un correo válido (ej: usuario@correo.com)");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    let valid = true;
    if (!email) { setEmailError("El correo es requerido."); valid = false; }
    if (!password) { setPasswordError("La contraseña es requerida."); valid = false; }
    if (!valid) return;

    setLoading(true);
    setGlobalError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess(true);

      // Restore configurator state from localStorage if saved before redirect
      const savedConfig = localStorage.getItem("luteame-pending-config");
      router.push(savedConfig ? "/configurator" : "/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      const msg  = mapFirebaseError(code);
      // Map specific errors to their field
      if (code === "auth/invalid-email") setEmailError(msg);
      else if (code === "auth/wrong-password") setPasswordError(msg);
      else setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-outline-variant/20 shadow-2xl animate-fade-in"
      style={{ background: "rgba(18,11,23,0.85)", backdropFilter: "blur(20px)" }}>

      {/* Left: Branding panel */}
      <div className="hidden md:flex flex-col justify-center items-center p-brand-xl relative overflow-hidden"
        style={{ background: "rgba(32,25,37,0.6)" }}>
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Aj2VQ4i5Po85zCfyLxEJSoRfHbVkgBbf3H4yR4yeNhtR90JBfi2nSeMPufCVTq7EKle_QGiBaF9i-KrdiQe8fqNMkwsG_ZypnEhXhneTYrs_wKja6hEoa3M7IlBjYyMyBr1btzQsn1c_ouhNQhKviqpEdg9UnPR2vItA5Dl_fb4p95PzPMmKLmOyxDviXaLs9cSE5RMNIpMPJA8XCggDhq42_7VtiGBb8u6Bkj3PdmEk945Z5blTfaPLZBiTNEeSd0CrsMSc-lJm"
            alt="Elite gaming setup"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="z-10 text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center"
            style={{ boxShadow: "0 0 30px rgba(167,0,254,0.5)" }}>
            <span className="material-symbols-outlined text-white text-4xl">memory</span>
          </div>
          <h2 className="font-poppins text-display-lg text-primary">Luteame</h2>
          <p className="font-montserrat text-body-lg text-on-surface-variant max-w-[280px] text-center">
            Tu centro de comando para hardware de élite y rendimiento sin compromisos.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="p-8 md:p-12 flex flex-col justify-center">
        <div className="mb-8">
          <h1 className="font-poppins text-headline-md text-on-background mb-1">
            Iniciar Sesión
          </h1>
          <p className="font-montserrat text-body-sm text-on-surface-variant">
            Bienvenido de vuelta, comandante.
          </p>
        </div>

        {globalError && (
          <div className="mb-4 p-3 rounded-lg bg-error-container/30 border border-error/30 text-error font-montserrat text-body-sm animate-fade-in">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-montserrat text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                mail
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="tu@correo.com"
                className={`input-glass ${emailError ? "border-error/70" : ""}`}
              />
            </div>
            {emailError && (
              <p className="mt-1 font-montserrat text-body-sm text-red-500 animate-fade-in">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="font-montserrat text-label-caps text-on-surface-variant uppercase tracking-widest">
                Contraseña
              </label>
              <Link href="/recover" className="font-montserrat text-body-sm text-primary-container hover:text-primary transition-colors">
                ¿Olvidé mi contraseña?
              </Link>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
                lock
              </span>
              <input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                placeholder="••••••••"
                className={`input-glass pr-10 ${passwordError ? "border-error/70" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPass ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 font-montserrat text-body-sm text-red-500 animate-fade-in">{passwordError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full btn-primary flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : success ? (
              <span className="material-symbols-outlined text-base">check_circle</span>
            ) : null}
            {success ? "¡Bienvenido!" : "Iniciar Sesión"}
            {!loading && !success && (
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-outline-variant/30" />
          <span className="px-3 font-montserrat text-label-caps text-outline-variant uppercase">O conecta con</span>
          <div className="flex-grow border-t border-outline-variant/30" />
        </div>

        {/* Social (visual stubs) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => alert("Google OAuth — configura tu proveedor en Firebase Console.")}
            className="flex items-center justify-center gap-2 border border-white/20 text-white/80 font-montserrat text-label-caps py-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">login</span> GOOGLE
          </button>
          <button
            type="button"
            onClick={() => alert("Discord OAuth — configura tu proveedor en Firebase Console.")}
            className="flex items-center justify-center gap-2 border border-white/20 text-white/80 font-montserrat text-label-caps py-3 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">forum</span> DISCORD
          </button>
        </div>

        {/* Register link */}
        <p className="mt-8 text-center font-montserrat text-body-sm text-on-surface-variant">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="text-primary-container font-semibold hover:text-primary transition-colors">
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
