"use client";
// src/app/support/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { createSupportTicket, subscribeToTicketsByUser } from "@/lib/firestore";

interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
  estado: "abierto" | "en_revision" | "en_proceso" | "resuelto" | "cerrado";
  fechaCreacion: { seconds: number; nanoseconds: number } | null;
  solucion?: string;
  observaciones?: string;
}

export default function SupportTicketsPage() {
  const { user, loading } = useAuthContext();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<"baja" | "media" | "alta">("baja");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Subscribe to tickets list if logged in
  useEffect(() => {
    if (!user) return;
    setLoadingTickets(true);
    const unsub = subscribeToTicketsByUser(user.uid, (data) => {
      setTickets(data as Ticket[]);
      setLoadingTickets(false);
    });
    return () => unsub();
  }, [user]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !titulo.trim() || !descripcion.trim()) return;

    setSubmitting(true);
    try {
      await createSupportTicket({
        clienteId: user.uid,
        clienteEmail: user.email || "",
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        prioridad,
      });

      setSuccess(true);
      setTitulo("");
      setDescripcion("");
      setPrioridad("baja");
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
      }, 1500);
    } catch (err) {
      console.error("Error creating ticket:", err);
      alert("Error al enviar el ticket. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // State checking
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">progress_activity</span>
        <p className="font-montserrat text-on-surface-variant text-body-lg animate-pulse">Comprobando autenticación...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section-container py-brand-xl flex flex-col items-center justify-center min-h-[500px] text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <div>
          <h1 className="font-poppins text-headline-md font-bold text-white mb-2">Acceso Restringido</h1>
          <p className="font-montserrat text-body-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Inicia sesión con tu cuenta de cliente de LUTEAME para poder abrir un ticket de soporte técnico o ver tus casos activos.
          </p>
        </div>
        <Link href="/login" className="btn-primary py-2.5 px-8">
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container py-brand-xl">
      {/* Page Header */}
      <div className="mb-8 border-b border-outline-variant/20 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="font-poppins text-display-lg-mobile md:text-headline-md font-extrabold text-white mb-1">
            Centro de Soporte Técnico
          </h1>
          <p className="font-montserrat text-body-sm text-on-surface-variant">
            Apertura y seguimiento de incidentes o consultas sobre tu hardware.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary py-2 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add_box</span>
          {showForm ? "Cerrar Formulario" : "Abrir Nuevo Ticket"}
        </button>
      </div>

      {/* Ticket form */}
      {showForm && (
        <div className="max-w-xl mx-auto glass-panel p-6 rounded-xl border border-outline-variant/20 mb-10 animate-fade-in">
          <h2 className="font-poppins text-title-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">contact_support</span>
            Nuevo Ticket de Asistencia
          </h2>

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-montserrat text-xs flex items-center gap-2 animate-fade-in">
              <span className="material-symbols-outlined text-base">check_circle</span>
              ¡Ticket creado con éxito! Cargando historial...
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label htmlFor="ticket-title" className="block font-montserrat text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
                Asunto / Resumen
              </label>
              <input
                id="ticket-title"
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej. Mi PC se apaga al jugar"
                className="input-glass pl-4"
              />
            </div>

            <div>
              <label htmlFor="ticket-desc" className="block font-montserrat text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
                Descripción del Problema
              </label>
              <textarea
                id="ticket-desc"
                required
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe detalladamente los síntomas del equipo..."
                className="w-full bg-surface-container border border-outline-variant/10 text-white rounded p-3 focus:outline-none focus:border-primary-container min-h-[100px] font-montserrat text-xs"
              />
            </div>

            <div>
              <label className="block font-montserrat text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
                Prioridad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["baja", "media", "alta"] as const).map((p) => {
                  const isActive = prioridad === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrioridad(p)}
                      className={`py-2 border rounded-lg text-xs font-montserrat font-bold capitalize transition-all ${
                        isActive
                          ? p === "alta"
                            ? "bg-error/20 border-error text-error"
                            : p === "media"
                            ? "bg-tertiary/20 border-tertiary text-tertiary"
                            : "bg-primary-container/20 border-primary-container text-primary"
                          : "border-outline-variant/20 text-on-surface-variant hover:bg-white/5"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-2.5 text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-2"
            >
              {submitting && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
              {submitting ? "Enviando..." : "Enviar Ticket de Soporte"}
            </button>
          </form>
        </div>
      )}

      {/* Tickets List */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="font-poppins text-title-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">history</span>
          Tus Tickets Activos y Pasados
        </h2>

        {loadingTickets ? (
          <div className="glass-panel rounded-xl p-8 flex justify-center items-center">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 border border-outline-variant/15 text-center flex flex-col justify-center items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-outline-variant">support_agent</span>
            <p className="font-montserrat text-body-sm text-on-surface-variant">No tienes ningún ticket de soporte activo.</p>
          </div>
        ) : (
          tickets.map((t) => {
            const date = t.fechaCreacion ? new Date(t.fechaCreacion.seconds * 1000).toLocaleDateString("es-PE") : "—";
            const isHigh = t.prioridad === "alta";
            const isMedium = t.prioridad === "media";

            return (
              <div
                key={t.id}
                className="glass-card rounded-xl p-5 border border-outline-variant/10 flex flex-col gap-4 transition-all hover:border-primary-container/30"
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div>
                    <h3 className="font-montserrat text-body-lg font-bold text-white mb-1">
                      {t.titulo}
                    </h3>
                    <p className="font-montserrat text-[10px] text-on-surface-variant uppercase font-semibold">
                      ID: {t.id.substring(0, 8).toUpperCase()} · Creado el {date}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Priority chip */}
                    <span
                      className={`chip-purple text-[9px] px-2 py-0.5 border rounded uppercase ${
                        isHigh
                          ? "border-error/40 text-error bg-error/10"
                          : isMedium
                          ? "border-tertiary/40 text-tertiary bg-tertiary/10"
                          : "border-primary-container/40 text-primary bg-primary-container/10"
                      }`}
                    >
                      Prioridad {t.prioridad}
                    </span>

                    {/* Status chip */}
                    <span
                      className={`chip-purple text-[9px] px-2 py-0.5 border rounded uppercase ${
                        t.estado === "resuelto" || t.estado === "cerrado"
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                          : "border-cyan-400/40 text-cyan-400 bg-cyan-400/10"
                      }`}
                    >
                      Estado: {t.estado.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <p className="font-montserrat text-xs text-on-surface-variant leading-relaxed">
                  {t.descripcion}
                </p>

                {/* Resolution / Tech notes if resolved */}
                {(t.solucion || t.observaciones) && (
                  <div className="p-4 rounded-lg bg-surface-container/50 border border-outline-variant/10 space-y-2 mt-2">
                    <p className="font-montserrat text-[10px] text-white uppercase font-bold tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                      Respuesta del Técnico
                    </p>
                    {t.solucion && (
                      <p className="font-montserrat text-xs text-emerald-300">
                        <strong>Solución:</strong> {t.solucion}
                      </p>
                    )}
                    {t.observaciones && (
                      <p className="font-montserrat text-[11px] text-on-surface-variant italic">
                        <strong>Obs:</strong> {t.observaciones}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
