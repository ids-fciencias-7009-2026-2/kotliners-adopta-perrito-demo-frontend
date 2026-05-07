"use client";

import { useState } from "react";
import { manifestarInteres, eliminarInteres } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

interface BotonInteresProps {
  /** ID del animal */
  animalId: string;
  /** Si el usuario ya tiene interés registrado en este animal */
  tieneInteres: boolean;
}

/**
 * Botón "Me interesa" / "Ya no me interesa" para usar en la vista de detalle de animal.
 * Llama al backend para registrar o eliminar el interés del usuario autenticado.
 */
export default function BotonInteres({ animalId, tieneInteres: initialInteres }: BotonInteresProps) {
  const router = useRouter();
  const [tieneInteres, setTieneInteres] = useState(initialInteres);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    const token = getToken();
    if (!token) { router.replace(ROUTES.LOGIN); return; }

    setLoading(true);
    setError(null);

    const res = tieneInteres
      ? await eliminarInteres(token, animalId)
      : await manifestarInteres(token, animalId);

    if (res.ok) {
      setTieneInteres(!tieneInteres);
    } else if (res.error === "SESSION_EXPIRED") {
      router.replace(ROUTES.LOGIN);
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
        className={`btn ${tieneInteres ? "btn-error btn-outline" : "btn-primary"}`}
      >
        {loading
          ? <span className="loading loading-spinner loading-sm" />
          : tieneInteres ? "💔 Ya no me interesa" : "❤️ Me interesa"}
      </button>
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
