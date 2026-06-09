"use client";

import { useState, useCallback } from "react";
import AnimalCard from "./AnimalCard";
import FiltrosPanel from "./FiltrosPanel";
import { useAnimalList } from "@/hooks/useAnimalData";
import type { FiltrosAnimales } from "@/lib/apiClient";

/**
 * Lista de animales con panel de filtros opcional.
 */
export default function PetList({ showFilters = true }: { showFilters?: boolean }) {
  const [filtros, setFiltros] = useState<FiltrosAnimales>({});
  const [busqueda, setBusqueda] = useState("");

  const { animals, interes, loading, error, rol } = useAnimalList(
    Object.keys(filtros).length > 0 ? filtros : undefined
  );

  const stored = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}")
    : {};
  const userId: string | undefined = stored.id;

  const filtrados = busqueda
    ? animals.filter((a) =>
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (a.raza ?? "").toLowerCase().includes(busqueda.toLowerCase())
      )
    : animals;

  const handleFiltrosChange = useCallback((f: FiltrosAnimales) => setFiltros(f), []);
  const handleBusquedaChange = useCallback((b: string) => setBusqueda(b), []);

  return (
    <div>
      {showFilters && <FiltrosPanel onFiltrosChange={handleFiltrosChange} onBusquedaChange={handleBusquedaChange} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : error ? (
        <p className="text-center text-error py-8">{error}</p>
      ) : filtrados.length === 0 ? (
        <p className="text-center text-base-content/60 py-8">
          {rol === "CUIDADOR"
            ? "Aún no tienes mascotas registradas. Usa el botón Publicar para agregar una."
            : "No se encontraron mascotas con esos filtros."}
        </p>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((animal) => (
            <AnimalCard.Compact
              key={animal.id}
              animal={animal}
              rolUsuario={rol}
              userId={userId}
              tieneInteres={interes.ids.has(animal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
