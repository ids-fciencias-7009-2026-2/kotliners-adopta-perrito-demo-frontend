"use client";

import Link from "next/link";
import BotonInteres from "./BotonInteres";
import { Animal, sameId } from "@/lib/apiClient";
import { ROUTES } from "@/lib/routes";
import { Eye, Home, ImageIcon, MapPin, Pencil, Trash2 } from "lucide-react";

type StoredUser = {
  id?: string | number | null;
  rol?: string;
};

function getStoredUser(): StoredUser {
  if (typeof window === "undefined") return {};
  const raw = sessionStorage.getItem("usuario");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return {};
  }
}

function formatStatus(status: string | null): string {
  return status ? status.replaceAll("_", " ") : "Sin estatus";
}

function getAgeText(fechaNacimiento: string | null): string {
  if (!fechaNacimiento) return "Edad no disponible";
  const birthDate = new Date(fechaNacimiento);
  if (Number.isNaN(birthDate.getTime())) return "Edad no disponible";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayPending =
    today.getMonth() < birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (birthdayPending) age -= 1;

  if (age <= 0) return "Menos de 1 ano";
  return `${age} ${age === 1 ? "ano" : "anos"}`;
}

function isHttpImage(value: string | null): value is string {
  return !!value && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"));
}

/**
 * Tarjeta de animal.
 * - ADOPTANTE: muestra boton "Me interesa" (deshabilitado si esta adoptado).
 * - CUIDADOR dueno: muestra botones de editar y eliminar.
 * - CUIDADOR no dueno: no muestra acciones (Persona 4 filtra la lista).
 */
export default function PetCard({ pet, onDelete, onEdit, onMarcarAdoptado }: {
  pet: Animal;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  /** Callback para marcar el animal como adoptado. Lo implementa Persona 4 en el backend. */
  onMarcarAdoptado?: (id: string) => void;
}) {
  const stored = getStoredUser();
  const rolUsuario: string | undefined = stored.rol;
  const esDueno = rolUsuario === "CUIDADOR" && sameId(pet.duenoId, stored.id);
  const esAdoptado = pet.estatus?.toUpperCase() === "ADOPTADO";

  return (
    <div className={`rounded-box overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2 ${
      esAdoptado ? "bg-base-200 opacity-60" : "bg-base-100 hover:shadow-primary/40"
    }`}>

      {/* Imagen */}
      <div className="h-48 bg-base-300 flex items-center justify-center relative overflow-hidden">
        {isHttpImage(pet.imagenUrl) ? (
          <img src={pet.imagenUrl} alt={pet.nombre} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={48} className="text-base-content/30" aria-hidden />
        )}
        {esAdoptado && (
          <span className="absolute top-2 right-2 badge badge-neutral">Adoptado</span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className={`text-xl font-bold ${esAdoptado ? "text-base-content/50" : ""}`}>
          {pet.nombre}
        </h3>
        <p className="text-base-content/60 text-sm mt-1 flex flex-wrap gap-x-2 gap-y-1">
          <span>{pet.especie}{pet.raza ? ` ${pet.raza}` : ""}</span>
          <span>{getAgeText(pet.fechaNacimiento)}</span>
          {pet.codigoPostal && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} />
              CP {pet.codigoPostal}
            </span>
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="badge badge-outline">{formatStatus(pet.estatus)}</span>
          {pet.esterilizado && <span className="badge badge-info">Esterilizado</span>}
        </div>

        <div className="mt-4">
          {esDueno ? (
            /* Cuidador dueno - botones de gestion */
            <div className="flex flex-wrap gap-2">
              <Link href={ROUTES.ANIMAL_DETAIL(pet.id)} className="btn btn-sm btn-primary gap-1">
                <Eye size={14} /> Detalle
              </Link>
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
            /* Adoptante - boton de interes */
            <div className="flex flex-wrap gap-2">
              <Link href={ROUTES.ANIMAL_DETAIL(pet.id)} className="btn btn-sm btn-primary gap-1">
                <Eye size={14} /> Detalle
              </Link>
              <BotonInteres
                animalId={pet.id}
                tieneInteres={pet.tieneInteres}
                estatus={pet.estatus ?? undefined}
                rolUsuario={rolUsuario}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
