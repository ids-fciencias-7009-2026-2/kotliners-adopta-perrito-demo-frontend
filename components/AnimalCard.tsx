"use client";

import BotonInteres from "./BotonInteres";
import { Pencil, Trash2, CheckCircle, Syringe, AlertTriangle, ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { useState } from "react";
import type { AnimalResponse, AnimalDetalleResponse } from "@/lib/apiClient";
import { useAnimalDetalle } from "@/hooks/useAnimalData";

// ---------------------------------------------------------------------------
// Tipos compartidos
// ---------------------------------------------------------------------------

export interface AnimalCardActions {
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggleAdoptado?: (id: string) => void;
}

interface BaseProps {
  rolUsuario?: string;
  userId?: string;
  tieneInteres?: boolean;
  actions?: AnimalCardActions;
  /** Callback llamado cuando el animal es eliminado exitosamente. */
  onDeleted?: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emojiEspecie(especie: string) {
  return especie.toLowerCase().includes("gato") || especie.toLowerCase().includes("cat")
    ? "🐱" : "🐶";
}

function calcularEdad(fechaNacimiento: string) {
  const [y, m, d] = fechaNacimiento.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const hoy = new Date();
  let edad = hoy.getFullYear() - y;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad--;
  return edad;
}

// ---------------------------------------------------------------------------
// AnimalCard.Compact — tarjeta de listado, enlaza al detalle
// ---------------------------------------------------------------------------

function Compact({ animal, rolUsuario, userId, tieneInteres = false, actions, onDeleted }: BaseProps & { animal: AnimalResponse }) {
  const esDueno = rolUsuario === "CUIDADOR" && animal.usuarioId === userId;
  const esAdoptado = animal.estatus === "ADOPTADO";
  const edad = calcularEdad(animal.fechaNacimiento);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Si fue eliminado, no renderizar nada
  if (deleted) return null;

  return (
    <>
    <div className={`rounded-box overflow-hidden shadow-xl transition-all duration-300 ${
      esAdoptado ? "bg-base-200 opacity-60 grayscale" : "bg-base-100 hover:-translate-y-1 hover:shadow-primary/40"
    }`}>

      {/* Imagen — click abre modal */}
      <button onClick={() => setModalOpen(true)} className="w-full">
        <div className="h-48 bg-base-300 flex items-center justify-center text-5xl relative">
          {emojiEspecie(animal.especie)}
          {esAdoptado && (
            <span className="absolute top-2 right-2 badge badge-neutral">Adoptado</span>
          )}
        </div>
      </button>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => setModalOpen(true)}>
            <h3 className={`text-xl font-bold hover:text-primary transition-colors text-left ${esAdoptado ? "text-base-content/50" : ""}`}>
              {animal.nombre}
            </h3>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-ghost btn-xs btn-square shrink-0 mt-1"
            title="Ver detalle completo"
          >
            <Expand size={14} />
          </button>
        </div>
        <p className="text-base-content/60 text-sm mt-1">
          {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""} · {edad} {edad === 1 ? "ano" : "anos"}
        </p>

        <div className="mt-4">
          {esDueno ? (
            <div className="flex flex-wrap gap-2">
              {actions?.onEdit && !esAdoptado && (
                <button onClick={() => actions.onEdit!(animal.id)} className="btn btn-sm btn-outline gap-1">
                  <Pencil size={14} /> Editar
                </button>
              )}
              {actions?.onToggleAdoptado && (
                <button
                  onClick={() => actions.onToggleAdoptado!(animal.id)}
                  className={`btn btn-sm gap-1 ${esAdoptado ? "btn-outline" : "btn-success"}`}
                >
                  <CheckCircle size={14} />
                  {esAdoptado ? "Desmarcar" : "Adoptado"}
                </button>
              )}
              {actions?.onDelete && (
                <button onClick={() => actions.onDelete!(animal.id)} className="btn btn-sm btn-error btn-outline gap-1">
                  <Trash2 size={14} /> Eliminar
                </button>
              )}
            </div>
          ) : (
            <BotonInteres
              animalId={animal.id}
              nombreAnimal={animal.nombre}
              tieneInteres={tieneInteres}
              estatus={animal.estatus}
              rolUsuario={rolUsuario}
            />
          )}
        </div>
      </div>
    </div>

    {modalOpen && (
      <DetailModal
        animalId={animal.id}
        rolUsuario={rolUsuario}
        userId={userId}
        onClose={() => setModalOpen(false)}
        onDeleted={(id) => { setDeleted(true); onDeleted?.(id); }}
      />
    )}
    </>
  );
}

// ---------------------------------------------------------------------------
// AnimalCard.Detail — vista expandida con galeria, vacunas, padecimientos
// ---------------------------------------------------------------------------

function GaleriaFotos({ fotos, nombre, especie }: { fotos: string[]; nombre: string; especie: string }) {
  const [idx, setIdx] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="h-72 bg-base-300 flex items-center justify-center text-8xl rounded-t-box">
        {emojiEspecie(especie)}
      </div>
    );
  }

  return (
    <div className="relative h-72 bg-base-300 rounded-t-box overflow-hidden">
      <img src={fotos[idx]} alt={`${nombre} foto ${idx + 1}`} className="w-full h-full object-cover" />
      {fotos.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + fotos.length) % fotos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost bg-base-100/70"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % fotos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost bg-base-100/70"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {fotos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${i === idx ? "bg-primary w-4" : "bg-base-100/70 w-2"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Detail({ animal, rolUsuario, userId, tieneInteres = false, actions, onClose }: BaseProps & {
  animal: AnimalDetalleResponse;
  onClose?: () => void;
}) {
  const esDueno = rolUsuario === "CUIDADOR" && animal.usuarioId === userId;
  const esAdoptado = animal.estatus === "ADOPTADO";
  const edad = calcularEdad(animal.fechaNacimiento);

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      <div className="relative">
        <GaleriaFotos fotos={animal.fotos} nombre={animal.nombre} especie={animal.especie} />
        {esAdoptado && (
          <span className="absolute top-4 right-4 badge badge-neutral badge-lg">Adoptado</span>
        )}
      </div>

      <div className="card-body gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{animal.nombre}</h1>
          <p className="text-base-content/60 mt-1">
            {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""} · {edad} {edad === 1 ? "ano" : "anos"} · {animal.sexo === "MACHO" ? "Macho" : "Hembra"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`badge ${esAdoptado ? "badge-neutral" : "badge-success"}`}>
            {esAdoptado ? "Adoptado" : "Disponible"}
          </span>
          <span className="badge badge-outline">
            {animal.esterilizado ? "Esterilizado" : "Sin esterilizar"}
          </span>
        </div>

        <div className="divider my-0" />

        <div>
          <h2 className="font-semibold mb-2">Descripcion</h2>
          <p className="text-base-content/80 leading-relaxed">{animal.descripcion}</p>
        </div>

        <div>
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Syringe size={16} className="text-primary" /> Vacunas
          </h2>
          {animal.vacunas.length === 0 ? (
            <p className="text-base-content/50 text-sm">Sin vacunas registradas</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {animal.vacunas.map((v) => (
                <span key={v} className="badge badge-success gap-1">
                  <CheckCircle size={12} /> {v}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" /> Condiciones medicas
          </h2>
          {animal.padecimientos.length === 0 ? (
            <p className="text-base-content/50 text-sm">Sin condiciones registradas</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {animal.padecimientos.map((p) => (
                <span key={p} className="badge badge-warning gap-1">{p}</span>
              ))}
            </div>
          )}
        </div>

        <div className="divider my-0" />

        {/* Acciones segun rol */}
        {esDueno ? (
          <div className="flex flex-wrap gap-2">
            {actions?.onEdit && !esAdoptado && (
              <button onClick={() => actions.onEdit!(animal.id)} className="btn btn-outline gap-2">
                <Pencil size={16} /> Editar
              </button>
            )}
            {actions?.onToggleAdoptado && (
              <button
                onClick={() => actions.onToggleAdoptado!(animal.id)}
                className={`btn gap-2 ${esAdoptado ? "btn-outline" : "btn-success"}`}
              >
                <CheckCircle size={16} />
                {esAdoptado ? "Desmarcar adoptado" : "Marcar como adoptado"}
              </button>
            )}
            {actions?.onDelete && (
              <button
                onClick={() => { actions.onDelete!(animal.id); onClose?.(); }}
                className="btn btn-error gap-2"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            )}
          </div>
        ) : (
          <BotonInteres
            animalId={animal.id}
            nombreAnimal={animal.nombre}
            tieneInteres={tieneInteres}
            estatus={animal.estatus}
            rolUsuario={rolUsuario}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnimalCard.DetailModal — modal que carga el detalle completo bajo demanda
// ---------------------------------------------------------------------------

function DetailModal({ animalId, rolUsuario, userId: userIdProp, onClose, onDeleted }: {
  animalId: string;
  rolUsuario?: string;
  userId?: string;
  onClose: () => void;
  onDeleted?: (id: string) => void;
}) {
  const { animal, tieneInteres, loading, error } = useAnimalDetalle(animalId);

  const userId = userIdProp ?? (typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").id as string | undefined
    : undefined);

  // Acciones del cuidador — llaman al backend directamente desde el modal
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  async function handleDelete(id: string) {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("user_token") : null;
    if (!token || !window.confirm("Eliminar esta mascota permanentemente?")) return;
    const res = await fetch(`${BASE_URL}/api/animales`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ animalId: id }),
    });
    if (res.ok) onClose();
  }

  async function handleToggleAdoptado(id: string) {
    // TODO: conectar con endpoint de cambio de estatus cuando este disponible
    // Por ahora solo cierra el modal
    onClose();
  }

  const actions: AnimalCardActions = {
    onDelete: handleDelete,
    onEdit: () => onClose(), // TODO: abrir form de edicion
    onToggleAdoptado: handleToggleAdoptado,
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : error || !animal ? (
          <div className="p-8 text-center text-error">{error ?? "No se pudo cargar."}</div>
        ) : (
          <div className="overflow-y-auto max-h-[85vh]">
            <Detail
              animal={animal}
              rolUsuario={rolUsuario}
              userId={userId}
              tieneInteres={tieneInteres}
              actions={actions}
              onClose={onClose}
            />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost bg-base-100/80">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compound component export
// ---------------------------------------------------------------------------

const AnimalCard = { Compact, Detail, DetailModal };
export default AnimalCard;
export type { AnimalCardActions };
