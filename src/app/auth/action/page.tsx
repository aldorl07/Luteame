"use client";
// src/app/auth/action/page.tsx

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";

function AuthActionHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState<"verifying" | "form" | "success" | "error">("verifying");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") {
      setStatus("error");
      setGlobalError("El enlace de acción no es válido, ha expirado o no está soportado.");
      return;
    }

    // Verify reset code with Firebase
    verifyPasswordResetCode(auth, oobCode)
      .then((userEmail) => {
        setEmail(userEmail);
        setStatus("form");
      })
      .catch((error) => {
        console.error("Error verifying password reset code:", error);
        setStatus("error");
        setGlobalError("El enlace de restablecimiento ha expirado o ya ha sido utilizado.");
      });
  }, [oobCode, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");
    setGlobalError("");

    let valid = true;

    if (!newPassword) {
      setPasswordError("La contraseña es requerida.");
      valid = false;
    } else if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Por favor, confirma tu contraseña.");
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
      valid = false;
    }

    if (!valid || !oobCode) return;

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");

      // Auto redirect to login after a brief visual confirmation delay
      setTimeout(() => {
        router.push("/login");
      }, 4000);
    } catch (error: unknown) {
      console.error("Error setting new password:", error);
      const code = (error as { code?: string }).code ?? "";
      if (code === "auth/weak-password") {
        setPasswordError("La contraseña es muy débil. Usa al menos 6 caracteres.");
      } else if (code === "auth/expired-action-code") {
        setGlobalError("El enlace ha expirado. Por favor solicita uno nuevo.");
        setStatus("error");
      } else if (code === "auth/invalid-action-code") {
        setGlobalError("El código de acción no es válido.");
        setStatus("error");
      } else {
        setGlobalError("Error al restablecer la contraseña. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="w-full max-w-md animate-fade-in text-center">
        <div className="rounded-xl border border-outline-variant/20 p-8 md:p-10 flex flex-col gap-6"
          style={{ background: "rgba(18,11,23,0.90)", backdropFilter: "blur(20px)" }}>
          <div className="flex flex-col items-center gap-4 py-8">
            <span className="material-symbols-outlined animate-spin text-primary text-5xl">
              progress_activity
            </span>
            <h2 className="font-montserrat text-headline-md text-on-surface mt-4">
              Verificando Enlace
            </h2>
            <p className="font-montserrat text-body-sm text-on-surface-variant max-w-[280px]">
              Comprobando la validez del código de seguridad...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
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
            <div className="w-14 h-14 rounded-full bg-error/15 border border-error/30 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error text-3xl">error</span>
            </div>
            <h2 className="font-montserrat text-headline-md text-on-surface mb-1">
              Enlace no válido
            </h2>
            <p className="font-montserrat text-body-sm text-on-surface-variant">
              {globalError || "El enlace de restablecimiento ha expirado o ya ha sido utilizado."}
            </p>
          </div>

          <div className="text-center mt-4 flex flex-col gap-3">
            <Link
              href="/recover"
              className="btn-primary flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">lock_reset</span>
              Solicitar nuevo enlace
            </Link>

            <Link href="/login" className="font-montserrat text-body-sm text-primary hover:text-primary-fixed transition-colors duration-200 inline-flex items-center justify-center gap-1 mt-2">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-poppins text-display-lg-mobile text-primary">Luteame</h1>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-outline-variant/20 p-8 md:p-10 flex flex-col gap-6"
          style={{ background: "rgba(18,11,23,0.90)", backdropFilter: "blur(20px)" }}>

          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary-container/40 flex items-center justify-center"
              style={{ boxShadow: "0 0 20px rgba(167,0,254,0.3)" }}>
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h2 className="font-montserrat text-headline-md text-on-surface">
              ¡Contraseña Restablecida!
            </h2>
            <p className="font-montserrat text-body-sm text-on-surface-variant max-w-[280px]">
              Tu contraseña ha sido actualizada correctamente. Redirigiéndote al inicio de sesión...
            </p>
          </div>

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Iniciar sesión ahora
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="material-symbols-outlined text-primary text-3xl">key</span>
          </div>
          <h2 className="font-montserrat text-headline-md text-on-surface mb-1">
            Nueva Contraseña
          </h2>
          <p className="font-montserrat text-body-sm text-on-surface-variant max-w-[280px] mx-auto">
            Ingresa tu nueva clave de acceso para <span className="text-primary font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          {globalError && (
            <div className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error font-montserrat text-body-sm">
              {globalError}
            </div>
          )}

          {/* Nueva Contraseña */}
          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className="font-montserrat text-label-caps text-on-surface-variant uppercase tracking-widest">
              Nueva Contraseña
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                lock
              </span>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Mínimo 6 caracteres"
                className={`input-glass pr-10 ${passwordError ? "border-error/70" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {passwordError && (
              <p className="font-montserrat text-body-sm text-red-500">{passwordError}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="flex flex-col gap-1">
            <label htmlFor="confirm-password" className="font-montserrat text-label-caps text-on-surface-variant uppercase tracking-widest">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                lock_reset
              </span>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError("");
                }}
                placeholder="Repite tu contraseña"
                className={`input-glass pr-10 ${confirmPasswordError ? "border-error/70" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <span className="material-symbols-outlined text-lg">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {confirmPasswordError && (
              <p className="font-montserrat text-body-sm text-red-500">{confirmPasswordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">save</span>
            )}
            Guardar Contraseña
          </button>
        </form>

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

export default function AuthActionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-gutter py-brand-xl">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center">
            <div className="rounded-xl border border-outline-variant/20 p-8 md:p-10 flex flex-col gap-6"
              style={{ background: "rgba(18,11,23,0.90)", backdropFilter: "blur(20px)" }}>
              <div className="flex flex-col items-center gap-4 py-8">
                <span className="material-symbols-outlined animate-spin text-primary text-5xl">
                  progress_activity
                </span>
                <p className="font-montserrat text-body-sm text-on-surface-variant mt-4">
                  Cargando módulo de recuperación...
                </p>
              </div>
            </div>
          </div>
        }
      >
        <AuthActionHandler />
      </Suspense>
    </div>
  );
}
