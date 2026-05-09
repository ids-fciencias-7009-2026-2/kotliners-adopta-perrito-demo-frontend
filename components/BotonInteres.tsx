"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { manifestarInteres, eliminarInteres } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { Heart, AlertCircle, CheckCircle, X } from "lucide-react";

/** Props del componente BotonInteres. */
interface BotonInteresProps {
  animalId: string;
  nombreAnimal?: string;
  tieneInteres: boolean;
  estatus?: string;
  rolUsuario?: string;
  /** Si true, permite quitar el interes aunque el animal este adoptado */
  allowRemove?: boolean;
}

/**
 * Boton de interes para un animal.
 * - Solo visible para usuarios con rol ADOPTANTE.
 * - Deshabilitado si el animal esta ADOPTADO o ya no existe.
 * - Alterna entre "Me interesa" y "En favoritos" llamando al backend.
 * - Muestra modal de confirmacion al registrar interes exitosamente.
 */
export default function BotonInteres({
  animalId,
  nombreAnimal,
  tieneInteres: initialInteres,
  estatus,
  rolUsuario,
  allowRemove = false,
}: BotonInteresProps) {
  const [tieneInteres, setTieneInteres] = useState(initialInteres);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Si allowRemove=true (favoritos), no bloquear aunque este adoptado
  const [animalNoDisponible, setAnimalNoDisponible] = useState(estatus === "ADOPTADO" && !allowRemove);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<"agregar" | "quitar">("agregar");

  if (rolUsuario === "CUIDADOR") return null;

  if (animalNoDisponible) {
    return (
      <div className="flex items-center gap-2 text-base-content/50 text-sm">
        <AlertCircle size={16} className="text-warning" />
        <span>Animal no disponible</span>
      </div>
    );
  }

  async function handleClick() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      if (tieneInteres) {
        const res = await eliminarInteres(token, animalId);
        if (res.ok) {
          setTieneInteres(false);
          setModalTipo("quitar");
          setModalOpen(true);
        } else {
          const msg = res.error.toLowerCase();
          if (msg.includes("animal no encontrado") || msg.includes("adoptado")) {
            setAnimalNoDisponible(true);
          } else {
            setError(res.error);
          }
        }
      } else {
        const res = await manifestarInteres(token, animalId);
        if (res.ok) {
          setTieneInteres(true);
          setModalTipo("agregar");
          setModalOpen(true);
        } else {
          const msg = res.error.toLowerCase();
          if (msg.includes("animal no encontrado") || msg.includes("adoptado") || msg.includes("no esta disponible")) {
            setAnimalNoDisponible(true);
          } else if (msg.includes("ya manifestaste")) {
            setTieneInteres(true);
          } else {
            setError(res.error);
          }
        }
      }
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const nombre = nombreAnimal ?? "esta mascota";

  return (
    <>
      <div className="flex flex-col gap-1">
        <button
          onClick={handleClick}
          disabled={loading}
          className={`btn gap-2 ${tieneInteres ? "btn-error btn-active" : "btn-outline btn-primary"}`}
          aria-label={tieneInteres ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <Heart size={18} className={tieneInteres ? "fill-current" : ""} />
              {tieneInteres ? "En favoritos" : "Me interesa"}
            </>
          )}
        </button>
        {error && (
          <div className="flex items-center gap-1 text-error text-xs">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Modal renderizado en el body via portal — no queda atrapado dentro de la tarjeta */}
      {modalOpen && typeof document !== "undefined" && createPortal(
        <div className="modal modal-open">
          <div className="modal-box">
            <button
              onClick={() => setModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center gap-3 py-2">
              <CheckCircle size={48} className={modalTipo === "agregar" ? "text-success" : "text-warning"} />
              <h3 className="font-bold text-lg text-center">
                {modalTipo === "agregar" ? "Interes registrado" : "Interes retirado"}
              </h3>
              {modalTipo === "quitar" ? (
                <p className="text-center text-base-content/70 text-sm">
                  Has retirado tu interes en <strong>{nombre}</strong>.
                  El cuidador sera notificado por correo.
                </p>
              ) : (
                <p className="text-center text-base-content/70 text-sm">
                  Le hemos notificado al cuidador de <strong>{nombre}</strong> sobre tu interes.
                  El cuidador se pondra en contacto contigo pronto.
                </p>
              )}
            </div>

            <div className="modal-action">
              <button onClick={() => setModalOpen(false)} className="btn btn-primary w-full">
                Entendido
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        </div>,
        document.body
      )}
    </>
  );
}
