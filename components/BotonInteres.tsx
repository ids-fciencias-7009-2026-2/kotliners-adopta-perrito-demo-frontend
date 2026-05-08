"use client";

import { useState } from "react";
import { manifestarInteres, eliminarInteres } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { Heart, AlertCircle } from "lucide-react";

/** Props del componente BotonInteres. */
interface BotonInteresProps {
  /** ID del animal. */
  animalId: string;
  /** Indica si el usuario ya tiene interes registrado en este animal. */
  tieneInteres: boolean;
  /** Estatus actual del animal. Si es ADOPTADO, el boton se deshabilita. */
  estatus?: string;
  /** Rol del usuario autenticado. Si es CUIDADOR, el boton no se muestra. */
  rolUsuario?: string;
}

/**
 * Boton de interes para un animal.
 * - Solo visible para usuarios con rol ADOPTANTE.
 * - Deshabilitado si el animal esta ADOPTADO o ya no existe.
 * - Alterna entre "Me interesa" y "En favoritos" llamando al backend.
 */
export default function BotonInteres({
  animalId,
  tieneInteres: initialInteres,
  estatus,
  rolUsuario,
}: BotonInteresProps) {
  const [tieneInteres, setTieneInteres] = useState(initialInteres);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animalNoDisponible, setAnimalNoDisponible] = useState(
    estatus === "ADOPTADO"
  );

  // Los cuidadores no pueden dar like
  if (rolUsuario === "CUIDADOR") return null;

  // Animal adoptado o eliminado — mostrar estado informativo
  if (animalNoDisponible) {
    return (
      <div className="flex items-center gap-2 text-base-content/50 text-sm">
        <AlertCircle size={16} className="text-warning" />
        <span>Animal no disponible</span>
      </div>
    );
  }

  /**
   * Registra o elimina el interes del usuario en el animal.
   * Detecta cuando el animal fue adoptado o eliminado y actualiza el estado.
   */
  async function handleClick() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    const res = tieneInteres
      ? await eliminarInteres(token, animalId)
      : await manifestarInteres(token, animalId);

    if (res.ok) {
      setTieneInteres(!tieneInteres);
    } else {
      const msg = res.error.toLowerCase();
      if (msg.includes("animal no encontrado") || msg.includes("not found") ||
          msg.includes("adoptado") || msg.includes("no esta disponible")) {
        // Animal eliminado o adoptado — deshabilitar el boton
        setAnimalNoDisponible(true);
      } else if (msg.includes("ya manifestaste")) {
        // Sincronizar estado si el backend dice que ya existe el interes
        setTieneInteres(true);
        setError(null);
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  }

  return (
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
  );
}
