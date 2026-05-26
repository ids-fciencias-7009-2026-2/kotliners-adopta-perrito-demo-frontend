"use client";

import { useEffect, useState } from "react";
import { obtenerRazaInfo, type RazaInfoResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";

type Estado = "cargando" | "ok" | "no_encontrado" | "error";

/**
 * Hook que consulta el endpoint del backend para obtener información
 * de una raza ya traducida al espanol.
 *
 * @param especie "PERRO" o "GATO"
 * @param razaId  UUID de la raza en la BD. Null = no buscar.
 */
export function useRazaInfo(especie: string, razaId: string | null): {
  info: RazaInfoResponse | null;
  estado: Estado;
} {
  const [info, setInfo]     = useState<RazaInfoResponse | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");

  useEffect(() => {
    if (!razaId) {
      setEstado("no_encontrado");
      return;
    }

    const token = getToken();
    if (!token) { setEstado("error"); return; }

    setEstado("cargando");
    setInfo(null);

    obtenerRazaInfo(token, razaId, especie.toUpperCase()).then((res) => {
      if (res.ok) {
        setInfo(res.data);
        setEstado("ok");
      } else {
        setEstado("no_encontrado");
      }
    }).catch(() => setEstado("error"));
  }, [especie, razaId]);

  return { info, estado };
}
