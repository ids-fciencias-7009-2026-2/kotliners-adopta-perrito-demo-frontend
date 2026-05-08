"use client";

import { useEffect, useState } from "react";
import { listarAnimales, listarIntereses, obtenerAnimal, type AnimalResponse, type AnimalDetalleResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";

/** Estado compartido de intereses del usuario actual. */
export interface InteresState {
  /** IDs de animales en los que el usuario ya manifesto interes. */
  ids: Set<string>;
  /** Agrega un ID al set local (optimistic update). */
  add: (id: string) => void;
  /** Elimina un ID del set local (optimistic update). */
  remove: (id: string) => void;
}

/** Hook para cargar la lista de animales + intereses del usuario en paralelo. */
export function useAnimalList() {
  const [animals, setAnimals] = useState<AnimalResponse[]>([]);
  const [interesIds, setInteresIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rol = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").rol as string | undefined
    : undefined;

  useEffect(() => {
    const token = getToken() ?? undefined;
    Promise.all([
      listarAnimales(token),
      token && rol === "ADOPTANTE"
        ? listarIntereses(token)
        : Promise.resolve({ ok: true as const, data: [] }),
    ]).then(([animalesRes, interesesRes]) => {
      if (animalesRes.ok) setAnimals(animalesRes.data);
      else setError("No se pudieron cargar los animales.");
      if (interesesRes.ok) {
        setInteresIds(new Set(interesesRes.data.map((i) => i.animalId)));
      }
      setLoading(false);
    });
  }, []);

  const interes: InteresState = {
    ids: interesIds,
    add: (id) => setInteresIds((prev) => new Set([...prev, id])),
    remove: (id) => setInteresIds((prev) => { const s = new Set(prev); s.delete(id); return s; }),
  };

  /** Elimina un animal de la lista local sin recargar desde el backend. */
  function removeAnimal(id: string) {
    setAnimals((prev) => prev.filter((a) => a.id !== id));
  }

  return { animals, interes, removeAnimal, loading, error, rol };
}

/** Hook para cargar el detalle de un animal + si el usuario ya tiene interes. */
export function useAnimalDetalle(id: string) {
  const [animal, setAnimal] = useState<AnimalDetalleResponse | null>(null);
  const [tieneInteres, setTieneInteres] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rol = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").rol as string | undefined
    : undefined;

  useEffect(() => {
    if (!id) return;
    const token = getToken() ?? undefined;
    Promise.all([
      obtenerAnimal(id, token),
      token && rol === "ADOPTANTE"
        ? listarIntereses(token)
        : Promise.resolve({ ok: true as const, data: [] }),
    ]).then(([animalRes, interesesRes]) => {
      if (animalRes.ok) setAnimal(animalRes.data);
      else setError("No se pudo cargar la informacion del animal.");
      if (interesesRes.ok) {
        setTieneInteres(interesesRes.data.some((i) => i.animalId === id));
      }
      setLoading(false);
    });
  }, [id]);

  function onInteresChange(tiene: boolean) {
    setTieneInteres(tiene);
  }

  return { animal, tieneInteres, onInteresChange, loading, error, rol };
}
