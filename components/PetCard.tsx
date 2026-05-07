"use client";

import BotonInteres from "./BotonInteres";

/**
 * Tipo que representa un animal del catálogo.
 * Debe coincidir con la respuesta del backend (GET /api/animales).
 */
type Pet = {
  id: string;
  name: string;
  type: "dog" | "cat";
  age: number;
  zip: string;
  image: string;
};

/**
 * Tarjeta de animal que muestra su información básica
 * y el botón "Me interesa" conectado al backend.
 */
export default function PetCard({ pet }: { pet: Pet }) {
  return (
    <div className="
      bg-base-100
      rounded-box
      overflow-hidden
      shadow-xl
      transition-all duration-300
      hover:shadow-primary/40
      hover:-translate-y-2
    ">
      
      {/* Imagen */}
      <div className="h-48 bg-base-200 flex items-center justify-center text-5xl">
        {pet.image}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-xl font-bold">
          {pet.name}
        </h3>

        <p className="text-base-content/60 text-sm mt-1">
          {pet.type === "dog" ? "Perro" : "Gato"} · {pet.age} años · CP {pet.zip}
        </p>

        {/* Botón conectado al backend */}
        <div className="mt-4">
          <BotonInteres animalId={pet.id} tieneInteres={false} />
        </div>
      </div>
    </div>
  );
}
