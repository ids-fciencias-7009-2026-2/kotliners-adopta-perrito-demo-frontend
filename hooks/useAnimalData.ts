"use client";

import { useEffect, useState } from "react";
import { listarAnimales, listarIntereses, obtenerAnimal, type AnimalResponse, type AnimalDetalleResponse, type FiltrosAnimales } from "@/lib/apiClient";
import { getToken } from "@/lib/session";

export interface InteresState {
  ids: Set<string>;
  add: (id: string) => void;
  remove: (id: string) => void;
}

export function useAnimalList(filtros?: FiltrosAnimales) {
  const [animals, setAnimals] = useState<AnimalResponse[]>([]);
  const [interesIds, setInteresIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rol = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").rol as string | undefined
    : undefined;

  // Serializar filtros para detectar cambios reales
  const filtrosKey = JSON.stringify(filtros ?? {});

  useEffect(() => {
    setLoading(true);
    const token = getToken() ?? undefined;
    Promise.all([
      listarAnimales(token, filtros),
      token && rol === "ADOPTANTE"
        ? listarIntereses(token)
        : Promise.resolve({ ok: true as const, data: [] }),
    ]).then(([animalesRes, interesesRes]) => {
      if (animalesRes.ok) setAnimals(animalesRes.data);
      else setError("No se pudieron cargar los animales.");
      if (interesesRes.ok) setInteresIds(new Set(interesesRes.data.map((i) => i.animalId)));
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrosKey]);

  const interes: InteresState = {
    ids: interesIds,
    add: (id) => setInteresIds((prev) => new Set([...prev, id])),
    remove: (id) => setInteresIds((prev) => { const s = new Set(prev); s.delete(id); return s; }),
  };

  function removeAnimal(id: string) {
    setAnimals((prev) => prev.filter((a) => a.id !== id));
  }

  return { animals, interes, removeAnimal, loading, error, rol };
}

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
      else setError("No se pudo cargar la información del animal.");
      if (interesesRes.ok) setTieneInteres(interesesRes.data.some((i) => i.animalId === id));
      setLoading(false);
    });
  }, [id]);

  return { animal, tieneInteres, loading, error, rol };
}

/** Hook que encapsula las acciones del cuidador sobre un animal. */
export function useAnimalActions(
  animalId: string,
  animalData: AnimalDetalleResponse | null,
  callbacks: {
    onDeleted?: (id: string) => void;
    onUpdated?: (animal: AnimalResponse, fullData?: AnimalDetalleResponse) => void;
  }
) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    const token = getToken();
    if (!token) { setPendingDeleteId(null); return; }
    setDeleting(true);
    const { eliminarAnimal } = await import("@/lib/apiClient");
    const result = await eliminarAnimal(token, { animalId: pendingDeleteId });
    setDeleting(false);
    if (result.ok) {
      callbacks.onDeleted?.(pendingDeleteId);
      setPendingDeleteId(null);
    } else {
      setSaveError(result.error);
    }
  }

  async function handleToggleAdoptado(id: string) {
    if (!animalData) return;
    const token = getToken();
    if (!token) { setSaveError("Token requerido"); return; }
    const nextStatus = animalData.estatus === "ADOPTADO" ? "DISPONIBLE" : "ADOPTADO";
    const { actualizarAnimal } = await import("@/lib/apiClient");
    setSaving(true);
    setSaveError(null);
    const result = await actualizarAnimal(token, id, {
      nombre: animalData.nombre,
      especie: animalData.especie,
      raza: animalData.raza ?? undefined,
      fechaNacimiento: animalData.fechaNacimiento,
      sexo: animalData.sexo === "HEMBRA" ? "HEMBRA" : "MACHO",
      descripcion: animalData.descripcion,
      estatus: nextStatus,
      inapropiado: false,
      esterilizado: animalData.esterilizado,
    });
    setSaving(false);
    if (result.ok) {
      // Preservar numInteresados del estado actual — actualizar el animal no cambia el conteo
      const updatedWithCount = { ...result.data, numInteresados: (animalData as any).numInteresados ?? 0 };
      const fullData: AnimalDetalleResponse = {
        ...updatedWithCount,
        vacunas: animalData.vacunas ?? [],
        padecimientos: animalData.padecimientos ?? [],
        fotos: animalData.fotos ?? [],
      };
      callbacks.onUpdated?.(updatedWithCount, fullData);
    } else {
      setSaveError(result.error);
    }
  }

  async function handleSaveEdit(formData: Partial<AnimalDetalleResponse>) {
    const token = getToken();
    if (!token) { setSaveError("Token requerido"); return; }
    if (!formData.nombre?.trim() || !formData.especie?.trim() || !formData.descripcion?.trim()) {
      setSaveError("Nombre, especie y descripcion son obligatorios.");
      return;
    }
    const { actualizarAnimal, actualizarVacunasAnimal, actualizarPadecimientosAnimal } = await import("@/lib/apiClient");
    setSaving(true);
    setSaveError(null);
    const result = await actualizarAnimal(token, animalId, {
      nombre: formData.nombre!,
      especie: formData.especie!,
      raza: (formData.raza as string)?.trim() || undefined,
      razaId: (formData as any).razaId || undefined,
      fechaNacimiento: formData.fechaNacimiento!,
      sexo: (formData.sexo as "MACHO" | "HEMBRA") ?? "MACHO",
      descripcion: formData.descripcion!,
      estatus: (formData.estatus as "DISPONIBLE" | "ADOPTADO") ?? "DISPONIBLE",
      inapropiado: false,
      esterilizado: formData.esterilizado ?? false,
    });
    if (!result.ok) { setSaving(false); setSaveError(result.error); return; }

    const vacunas = (formData as any).vacunas as string[] | undefined;
    const padecimientos = (formData as any).padecimientos as string[] | undefined;
    await Promise.all([
      vacunas !== undefined ? actualizarVacunasAnimal(token, animalId, vacunas) : Promise.resolve(),
      padecimientos !== undefined ? actualizarPadecimientosAnimal(token, animalId, padecimientos) : Promise.resolve(),
    ]);

    setSaving(false);
    const updatedWithCount = { ...result.data, numInteresados: (animalData as any)?.numInteresados ?? 0 };
    const fullData: AnimalDetalleResponse = {
      ...updatedWithCount,
      vacunas: vacunas ?? animalData?.vacunas ?? [],
      padecimientos: padecimientos ?? animalData?.padecimientos ?? [],
      fotos: (formData as any).fotos ?? animalData?.fotos ?? [],
    };
    callbacks.onUpdated?.(updatedWithCount, fullData);
  }

  return {
    saving, saveError, pendingDeleteId, deleting,
    handleDelete: (id: string) => setPendingDeleteId(id),
    confirmDelete, handleToggleAdoptado, handleSaveEdit, setPendingDeleteId,
  };
}
