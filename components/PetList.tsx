"use client";

import { useEffect, useState } from "react";
import PetCard from "./PetCard";
import { listarAnimales, type AnimalResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";

/**
 * Convierte un AnimalResponse del backend al formato que espera PetCard.
 */
function toPet(animal: AnimalResponse) {
  const nacimiento = new Date(animal.fechaNacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - nacimiento.getFullYear();

  const emoji =
    animal.especie.toLowerCase().includes("gato") ||
    animal.especie.toLowerCase().includes("cat")
      ? "🐱"
      : "🐶";

  return {
    id: animal.id,
    name: animal.nombre,
    type: (animal.especie.toLowerCase().includes("gato") ||
    animal.especie.toLowerCase().includes("cat")
      ? "cat"
      : "dog") as "dog" | "cat",
    age: edad,
    zip: "",
    image: emoji,
    estatus: animal.estatus,
    ownerId: animal.usuarioId,
  };
}

/**
 * Lista de animales obtenidos desde el backend.
 * Reemplaza el catálogo de datos simulados.
 */
export default function PetList() {
  const [animals, setAnimals] = useState<AnimalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnimals() {
      const token = getToken() ?? undefined;
      const result = await listarAnimales(token);
      if (result.ok) {
        setAnimals(result.data);
      } else {
        setError("No se pudieron cargar los animales.");
      }
      setLoading(false);
    }
    fetchAnimals();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-error py-8">{error}</p>
    );
  }

  if (animals.length === 0) {
    return (
      <p className="text-center text-base-content/60 py-8">
        Aún no hay animales registrados. ¡Sé el primero en publicar uno!
      </p>
    );
  }

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {animals.map((animal) => (
        <PetCard key={animal.id} pet={toPet(animal)} />
      ))}
    </div>
  );
}