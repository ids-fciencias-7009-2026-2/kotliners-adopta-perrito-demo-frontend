"use client";

import BotonInteres from "./BotonInteres";
import { Pencil, Trash2, Home } from "lucide-react";

/**
 * Tipo que representa un animal del catalogo.
 * Debe coincidir con la respuesta del backend (GET /api/animales).
 */
type Pet = {
  id: string;
  name: string;
  type: "dog" | "cat";
  age: number;
  zip: string;
  image: string;
  estatus?: string;
  /** ID del usuario dueno del animal */
  ownerId?: string;
};

/**
 * Tarjeta de animal.
 * - ADOPTANTE: muestra boton "Me interesa" (deshabilitado si esta adoptado).
 * - CUIDADOR dueno: muestra botones de editar y eliminar.
 * - CUIDADOR no dueno: no muestra acciones (Persona 4 filtra la lista).
 */
export default function PetCard({ pet, onDelete, onEdit, onMarcarAdoptado }: {
  pet: Pet;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  /** Callback para marcar el animal como adoptado. Lo implementa Persona 4 en el backend. */
  onMarcarAdoptado?: (id: string) => void;
}) {
  const stored = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}")
    : {};
  const rolUsuario: string | undefined = stored.rol;
  const userId: string | undefined = stored.id;
  const esDueno = rolUsuario === "CUIDADOR" && pet.ownerId === userId;
  const esAdoptado = pet.estatus === "ADOPTADO";

  return (
    <div className={`rounded-box overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2 ${
      esAdoptado ? "bg-base-200 opacity-60" : "bg-base-100 hover:shadow-primary/40"
    }`}>

      {/* Imagen */}
      <div className="h-48 bg-base-300 flex items-center justify-center text-5xl relative">
        {pet.image}
        {esAdoptado && (
          <span className="absolute top-2 right-2 badge badge-neutral">Adoptado</span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className={`text-xl font-bold ${esAdoptado ? "text-base-content/50" : ""}`}>
          {pet.name}
        </h3>
        <p className="text-base-content/60 text-sm mt-1">
          {pet.type === "dog" ? "Perro" : "Gato"} · {pet.age} anos · CP {pet.zip}
        </p>

        <div className="mt-4">
          {esDueno ? (
            /* Cuidador dueno — botones de gestion */
            <div className="flex flex-wrap gap-2">
              {onEdit && !esAdoptado && (
                <button onClick={() => onEdit(pet.id)} className="btn btn-sm btn-outline gap-1">
                  <Pencil size={14} /> Editar
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(pet.id)} className="btn btn-sm btn-error gap-1">
                  <Trash2 size={14} /> Eliminar
                </button>
              )}
              {onMarcarAdoptado && !esAdoptado && (
                <button
                  onClick={() => onMarcarAdoptado(pet.id)}
                  className="btn btn-sm btn-neutral gap-1"
                  title="Marcar como adoptado"
                >
                  <Home size={14} /> Adoptado
                </button>
              )}
            </div>
          ) : (
            /* Adoptante — boton de interes */
            <BotonInteres
              animalId={pet.id}
              tieneInteres={false}
              estatus={pet.estatus}
              rolUsuario={rolUsuario}
            />
          )}
        </div>
      </div>
    </div>
  );
}
