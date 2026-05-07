"use client";

import { useState } from "react";
import { manifestarInteres, eliminarInteres } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { Heart } from "lucide-react";

/** Props del componente BotonInteres. */
interface BotonInteresProps {
  /** ID del animal. */
  animalId: string;
  /** Indica si el usuario ya tiene interes registrado en este animal. */
  tieneInteres: boolean;
}

/**
 * Boton de interes para un animal.
 * Alterna entre "Me interesa" y "En favoritos" llamando al backend.
 * Redirige al login si la sesion expira.
 */
export default function BotonInteres({ animalId, tieneInteres: initialInteres }: BotonInteresProps) {
  const [tieneInteres, setTieneInteres] = useState(initialInteres);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Registra o elimina el interes del usuario en el animal.
   * Si el token expira, el evento session:expired se encarga de redirigir.
   */
  async function handleClick() {
    const token = getToken();
    if (!token) return; // El evento session:expired redirige si no hay token

    setLoading(true);
    setError(null);

    const res = tieneInteres
      ? await eliminarInteres(token, animalId)
      : await manifestarInteres(token, animalId);

    if (res.ok) {
      setTieneInteres(!tieneInteres);
    } else {
      setError(res.error);
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
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
