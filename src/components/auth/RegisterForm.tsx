"use client";
// src/components/auth/RegisterForm.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";

interface FormErrors {
  nombre?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export default function RegisterForm() {
  const router = useRouter();

  const [nombre, setNombre]               = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirm]     = useState("");
  const [terms, setTerms]                 = useState(false);
  const [showPass, setShowPass]           = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [errors, setErrors]               = useState<FormErrors>({});
  const [globalError, setGlobalError]     = useState("");
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);

  const validatePassword = (pw: string): string => {
    if (pw.length < 8) return "Mínimo 8 caracteres.";
    if (!/\d/.test(pw)) return "Debe contener al menos un número.";
    return "";
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es requerido.";
    if (!email) newErrors.email = "El correo es requerido.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Correo inválido.";
    const pwError = validatePassword(password);
    if (pwError) newErrors.password = pwError;
    if (password !== confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden.";
    if (!terms) newErrors.terms = "Debes aceptar los términos para continuar.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError("");

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(user.uid, { nombre: nombre.trim(), correo: email });
      setSuccess(true);
      setTimeout(() => router.push("/"), 1200);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/email-already-in-use") {
        setErrors((prev) => ({ ...prev, email: "Este correo ya está registrado." }));
      } else {
        setGlobalError("Error al crear cuenta. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubmitEnabled = terms && !loading && !success;

  return (
    <div className="w-full max-w-md rounded-xl border border-outline-variant/20 p-8 md:p-10 animate-fade-in"
      style={{ background: "rgba(18,11,23,0.9)", backdropFilter: "blur(20px)" }}>

      <div className="text-center mb-8">
        <h1 className="font-poppins text-display-lg-mobile text-primary mb-1">Luteame</h1>
        <p className="font-montserrat text-body-lg text-on-surface-variant">Únete a la élite tecnológica</p>
      </div>

      {globalError && (
        <div className="mb-4 p-3 rounded-lg bg-error-container/30 border border-error/30 text-error font-montserrat text-body-sm">
          {globalError}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-primary-container/20 border border-primary-container/40 text-primary font-montserrat text-body-sm flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          ¡Cuenta creada! Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div className="space-y-1">
          <label htmlFor="nombre" className="block font-montserrat text-label-caps text-on-surface-variant uppercase tracking-widest">
            Nombre Completo
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">person</span>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setErrors((p) => ({ ...p, nombre: "" })); }}
              placeholder="John Doe"
              className={`input-glass ${errors.nombre ? "border-error/70" : ""}`}
            />
          </div>
          {errors.nombre && <p className="font-montserrat text-body-sm text-red-500">{errors.nombre}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label htmlFor="reg-email" className="block font-montserrat text-label-caps text-on-surface-variant uppercase tracking-widest">
            Correo Electrónico
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">mail</span>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
              placeholder="john@example.com"
              className={`input-glass ${errors.email ? "border-error/70" : ""}`}
            />
          </div>
          {errors.email && <p className="font-montserrat text-body-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label htmlFor="reg-password" className="block font-montserrat text-label-caps text-on-surface-variant uppercase tracking-widest">
            Contraseña
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">lock</span>
            <input
              id="reg-password"
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: validatePassword(e.target.value) || "" })); }}
              placeholder="••••••••"
              className={`input-glass pr-10 ${errors.password ? "border-error/70" : ""}`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">{showPass ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {errors.password && <p className="font-montserrat text-body-sm text-red-500">{errors.password}</p>}
          <p className="font-montserrat text-[11px] text-on-surface-variant/60">Mínimo 8 caracteres, incluye al menos un número.</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label htmlFor="confirm-password" className="block font-montserrat text-label-caps text-on-surface-variant uppercase tracking-widest">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">lock_reset</span>
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
              placeholder="••••••••"
              className={`input-glass pr-10 ${errors.confirmPassword ? "border-error/70" : ""}`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-lg">{showConfirm ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {errors.confirmPassword && <p className="font-montserrat text-body-sm text-red-500">{errors.confirmPassword}</p>}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={terms}
            onChange={(e) => { setTerms(e.target.checked); setErrors((p) => ({ ...p, terms: "" })); }}
            className="mt-1 w-4 h-4 rounded border-outline-variant bg-surface-container accent-primary-container cursor-pointer"
          />
          <label htmlFor="terms" className="font-montserrat text-body-sm text-on-surface-variant cursor-pointer">
            Acepto los{" "}
            <Link href="#" className="text-primary hover:underline transition-all">
              Términos y Condiciones
            </Link>{" "}
            y la Política de Privacidad.
          </label>
        </div>
        {errors.terms && <p className="font-montserrat text-body-sm text-red-500 -mt-2">{errors.terms}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isSubmitEnabled}
          className={`w-full btn-primary flex justify-center items-center gap-2 mt-2 ${
            !isSubmitEnabled ? "opacity-50 cursor-not-allowed !shadow-none" : ""
          }`}
        >
          {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
          {success ? "¡Cuenta Creada!" : "Crear Cuenta"}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-outline-variant/10 pt-5">
        <Link href="/login" className="font-montserrat text-body-sm text-on-surface-variant hover:text-primary transition-colors duration-200">
          Ya tengo una cuenta — Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
