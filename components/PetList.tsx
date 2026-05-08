"use client";

import AnimalCard from "./AnimalCard";
import { useAnimalList } from "@/hooks/useAnimalData";

/**
 * Lista de animales — usa useAnimalList para cargar datos + intereses en paralelo.
 * Delega el renderizado a AnimalCard.Compact.
 */
export default function PetList() {
  const { animals, interes, loading, error, rol } = useAnimalList();

  const stored = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}")
    : {};
  const userId: string | undefined = stored.id;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) return <p className="text-center text-error py-8">{error}</p>;

  if (animals.length === 0) {
    return (
      <p className="text-center text-base-content/60 py-8">
        {rol === "CUIDADOR"
          ? "Aun no tienes mascotas registradas. Usa el boton Publicar para agregar una."
          : "Vuelve pronto, pronto habra mascotas disponibles para adoptar."}
      </p>
    );
  }

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {animals.map((animal) => (
        <AnimalCard.Compact
          key={animal.id}
          animal={animal}
          rolUsuario={rol}
          userId={userId}
          tieneInteres={interes.ids.has(animal.id)}
        />
      ))}
    </div>
  );
}
