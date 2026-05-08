"use client";

import BotonInteres from "./BotonInteres";
import ConfirmDialog from "./ConfirmDialog";
import { Pencil, Trash2, CheckCircle, Syringe, AlertTriangle, ChevronLeft, ChevronRight, X, Expand } from "lucide-react";
import { useState } from "react";
import { 
  eliminarAnimal,
    actualizarAnimal, 
    type AnimalResponse, 
    type AnimalDetalleResponse, 
    type UpdateAnimalPayload 
} from "@/lib/apiClient";
import { useAnimalDetalle } from "@/hooks/useAnimalData";
import { AdvancedImage } from "@cloudinary/react";
import { getOptimizedImage } from "@/lib/cloudinary";
import { getToken } from "@/lib/session";

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
  /** Callback llamado cuando el animal cambia y la tarjeta debe refrescarse. */
  onUpdated?: (animal: AnimalResponse) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emojiEspecie(especie: string) {
  return especie.toLowerCase().includes("gato") || especie.toLowerCase().includes("cat")
    ? "🐱" : "🐶";
}

function normalizarEspecie(especie: string) {
  const valor = especie.toLowerCase();
  if (valor.includes("gato") || valor.includes("cat")) return "Gato";
  return "Perro";
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

function Compact({ animal, rolUsuario, userId, tieneInteres = false, actions, onDeleted, onUpdated }: BaseProps & { animal: AnimalResponse }) {
  const [animalLocal, setAnimalLocal] = useState(animal);
  const esDueno = rolUsuario === "CUIDADOR" && animalLocal.usuarioId === userId;
  const esAdoptado = animalLocal.estatus === "ADOPTADO";
  const edad = calcularEdad(animalLocal.fechaNacimiento);
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
          {emojiEspecie(animalLocal.especie)}
          {esAdoptado && (
            <span className="absolute top-2 right-2 badge badge-neutral">Adoptado</span>
          )}
        </div>
      </button>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <button onClick={() => setModalOpen(true)}>
            <h3 className={`text-xl font-bold hover:text-primary transition-colors text-left ${esAdoptado ? "text-base-content/50" : ""}`}>
              {animalLocal.nombre}
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
          {animalLocal.especie}{animalLocal.raza ? ` · ${animalLocal.raza}` : ""} · {edad} {edad === 1 ? "ano" : "anos"}
        </p>

        <div className="mt-4">
          {esDueno ? (
            <div className="flex flex-wrap gap-2">
              {actions?.onEdit && !esAdoptado && (
                <button onClick={() => actions.onEdit!(animalLocal.id)} className="btn btn-sm btn-outline gap-1">
                  <Pencil size={14} /> Editar
                </button>
              )}
              {actions?.onToggleAdoptado && (
                <button
                  onClick={() => actions.onToggleAdoptado!(animalLocal.id)}
                  className={`btn btn-sm gap-1 ${esAdoptado ? "btn-outline" : "btn-success"}`}
                >
                  <CheckCircle size={14} />
                  {esAdoptado ? "Desmarcar" : "Adoptado"}
                </button>
              )}
              {actions?.onDelete && (
                <button onClick={() => actions.onDelete!(animalLocal.id)} className="btn btn-sm btn-error btn-outline gap-1">
                  <Trash2 size={14} /> Eliminar
                </button>
              )}
            </div>
          ) : (
            <BotonInteres
              animalId={animalLocal.id}
              nombreAnimal={animalLocal.nombre}
              tieneInteres={tieneInteres}
              estatus={animalLocal.estatus}
              rolUsuario={rolUsuario}
            />
          )}
        </div>
      </div>
    </div>

    {modalOpen && (
      <DetailModal
        animalId={animalLocal.id}
        rolUsuario={rolUsuario}
        userId={userId}
        onClose={() => setModalOpen(false)}
        onDeleted={(id) => { setDeleted(true); onDeleted?.(id); }}
        onUpdated={(updatedAnimal) => {
          setAnimalLocal(updatedAnimal);
          onUpdated?.(updatedAnimal);
        }}
      />
    )}
    </>
  );
}

// ---------------------------------------------------------------------------
// AnimalCard.Detail — vista expandida con galeria, vacunas, padecimientos
// ---------------------------------------------------------------------------

function isCloudinaryUrl(url: string) {
  return url.includes("cloudinary.com");
}

function GaleriaFotos({ fotos, nombre, especie }: { fotos: string[]; nombre: string; especie: string }) {
  const [idx, setIdx] = useState(0);

  if (fotos.length === 0) {
    return (
      <div className="h-72 bg-base-300 flex items-center justify-center text-8xl rounded-t-box">
        {emojiEspecie(especie)}
      </div>
    );
  }

  const fotoActual = fotos[idx];

  return (
    <div className="relative h-72 bg-base-300 rounded-t-box overflow-hidden">
      {isCloudinaryUrl(fotoActual) ? (
        <AdvancedImage
          cldImg={getOptimizedImage(fotoActual, 600, 288)}
          className="w-full h-full object-cover"
          alt={`${nombre} foto ${idx + 1}`}
        />
      ) : (
        <img src={fotoActual} alt={`${nombre} foto ${idx + 1}`} className="w-full h-full object-cover" />
      )}
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

function Detail({ animal, rolUsuario, userId, tieneInteres = false, actions }: BaseProps & {
  animal: AnimalDetalleResponse;
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
                onClick={() => actions.onDelete!(animal.id)}
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

function DetailModal({ animalId, rolUsuario, userId: userIdProp, onClose, onDeleted, onUpdated }: {
  animalId: string;
  rolUsuario?: string;
  userId?: string;
  onClose: () => void;
  onDeleted?: (id: string) => void;
  onUpdated?: (animal: AnimalResponse) => void;
}) {
  const { animal, tieneInteres, loading, error } = useAnimalDetalle(animalId);
  const [animalLocal, setAnimalLocal] = useState<AnimalDetalleResponse | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateAnimalPayload | null>(null);
  const animalData = animalLocal ?? animal;

  const userId = userIdProp ?? (typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").id as string | undefined
    : undefined);

  function syncFromResponse(updatedAnimal: AnimalResponse) {
    setAnimalLocal((prev) => {
      const current = prev ?? animal;
      if (!current) return prev;
      return {
        ...current,
        nombre: updatedAnimal.nombre,
        especie: updatedAnimal.especie,
        raza: updatedAnimal.raza,
        fechaNacimiento: updatedAnimal.fechaNacimiento,
        sexo: updatedAnimal.sexo,
        descripcion: updatedAnimal.descripcion,
        estatus: updatedAnimal.estatus,
        esterilizado: updatedAnimal.esterilizado,
        usuarioId: updatedAnimal.usuarioId,
        fechaRegistro: updatedAnimal.fechaRegistro,
      };
    });
    setEditForm((prev) => prev ? {
      ...prev,
      nombre: updatedAnimal.nombre,
      especie: normalizarEspecie(updatedAnimal.especie),
      raza: updatedAnimal.raza ?? "",
      fechaNacimiento: updatedAnimal.fechaNacimiento,
      sexo: updatedAnimal.sexo === "HEMBRA" ? "HEMBRA" : "MACHO",
      descripcion: updatedAnimal.descripcion,
      estatus: updatedAnimal.estatus === "ADOPTADO" ? "ADOPTADO" : "DISPONIBLE",
      esterilizado: updatedAnimal.esterilizado,
    } : prev);
  }

  // Acciones del cuidador — llaman al backend a traves de apiClient

  async function confirmDeleteAnimal() {
    if (!pendingDeleteId) return;
    const token = getToken();
    if (!token) {
      setPendingDeleteId(null);
      return;
    }
    setDeleting(true);
    const result = await eliminarAnimal(token, { animalId: pendingDeleteId });
    setDeleting(false);
    if (result.ok) {
      onDeleted?.(pendingDeleteId);
      setPendingDeleteId(null);
      onClose();
    } else {
      setSaveError(result.error);
    }
  }

  function handleDelete(id: string) {
    setPendingDeleteId(id);
  }

  async function handleSaveEdit() {
    if (!editForm) return;
    const token = getToken();
    if (!token) {
      setSaveError("Token requerido");
      return;
    }
    if (!editForm.nombre.trim() || !editForm.especie.trim() || !editForm.descripcion.trim()) {
      setSaveError("Nombre, especie y descripcion son obligatorios.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    const payload: UpdateAnimalPayload = {
      ...editForm,
      raza: editForm.raza?.trim() || undefined,
    };
    const result = await actualizarAnimal(token, animalId, payload);
    setSaving(false);

    if (!result.ok) {
      setSaveError(result.error);
      return;
    }

    onUpdated?.(result.data);
    syncFromResponse(result.data);
    setEditMode(false);
  }

  async function handleToggleAdoptado(id: string) {
    if (!animalData) return;
    const token = getToken();
    if (!token) {
      setSaveError("Token requerido");
      return;
    }

    const nextStatus = animalData.estatus === "ADOPTADO" ? "DISPONIBLE" : "ADOPTADO";
    const payload: UpdateAnimalPayload = {
      nombre: animalData.nombre,
      especie: animalData.especie,
      raza: animalData.raza ?? undefined,
      fechaNacimiento: animalData.fechaNacimiento,
      sexo: animalData.sexo === "HEMBRA" ? "HEMBRA" : "MACHO",
      descripcion: animalData.descripcion,
      estatus: nextStatus,
      inapropiado: false,
      esterilizado: animalData.esterilizado,
    };

    setSaving(true);
    setSaveError(null);
    const result = await actualizarAnimal(token, id, payload);
    setSaving(false);

    if (!result.ok) {
      setSaveError(result.error);
      return;
    }

    onUpdated?.(result.data);
    syncFromResponse(result.data);
  }

  const actions: AnimalCardActions = {
    onDelete: handleDelete,
    onEdit: () => {
      if (!animalData) return;
      setEditForm({
        nombre: animalData.nombre,
        especie: normalizarEspecie(animalData.especie),
        raza: animalData.raza ?? "",
        fechaNacimiento: animalData.fechaNacimiento,
        sexo: animalData.sexo === "HEMBRA" ? "HEMBRA" : "MACHO",
        descripcion: animalData.descripcion,
        estatus: animalData.estatus === "ADOPTADO" ? "ADOPTADO" : "DISPONIBLE",
        inapropiado: false,
        esterilizado: animalData.esterilizado,
      });
      setSaveError(null);
      setEditMode(true);
    },
    onToggleAdoptado: handleToggleAdoptado,
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : error || !animalData ? (
          <div className="p-8 text-center text-error">{error ?? "No se pudo cargar."}</div>
        ) : editMode && editForm ? (
          <div className="p-6 space-y-4">
            <h3 className="text-xl font-bold">Editar mascota</h3>
            {saveError && (
              <div role="alert" className="alert alert-error">
                <span>{saveError}</span>
              </div>
            )}
            <label className="form-control w-full">
              <span className="label-text">Nombre</span>
              <input
                className="input input-bordered w-full"
                value={editForm.nombre}
                onChange={(e) => setEditForm((prev) => prev ? { ...prev, nombre: e.target.value } : prev)}
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text">Especie</span>
              <select
                className="select select-bordered w-full"
                value={editForm.especie}
                onChange={(e) => setEditForm((prev) => prev ? { ...prev, especie: e.target.value } : prev)}
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
            </label>
            <label className="form-control w-full">
              <span className="label-text">Raza</span>
              <input
                className="input input-bordered w-full"
                value={editForm.raza ?? ""}
                onChange={(e) => setEditForm((prev) => prev ? { ...prev, raza: e.target.value } : prev)}
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="form-control w-full">
                <span className="label-text">Fecha de nacimiento</span>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={editForm.fechaNacimiento}
                  onChange={(e) => setEditForm((prev) => prev ? { ...prev, fechaNacimiento: e.target.value } : prev)}
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text">Sexo</span>
                <select
                  className="select select-bordered w-full"
                  value={editForm.sexo}
                  onChange={(e) => setEditForm((prev) => prev ? { ...prev, sexo: e.target.value as "MACHO" | "HEMBRA" } : prev)}
                >
                  <option value="MACHO">Macho</option>
                  <option value="HEMBRA">Hembra</option>
                </select>
              </label>
            </div>
            <label className="form-control w-full">
              <span className="label-text">Descripcion</span>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={4}
                value={editForm.descripcion}
                onChange={(e) => setEditForm((prev) => prev ? { ...prev, descripcion: e.target.value } : prev)}
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="form-control w-full">
                <span className="label-text">Estatus</span>
                <select
                  className="select select-bordered w-full"
                  value={editForm.estatus}
                  onChange={(e) => setEditForm((prev) => prev ? { ...prev, estatus: e.target.value as "DISPONIBLE" | "ADOPTADO" } : prev)}
                >
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="ADOPTADO">Adoptado</option>
                </select>
              </label>
              <label className="label cursor-pointer justify-start gap-3 mt-6">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={editForm.esterilizado}
                  onChange={(e) => setEditForm((prev) => prev ? { ...prev, esterilizado: e.target.checked } : prev)}
                />
                <span className="label-text">Esterilizado</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn btn-ghost" onClick={() => setEditMode(false)} disabled={saving}>
                Cancelar
              </button>
              <button className={`btn btn-primary ${saving ? "loading" : ""}`} onClick={handleSaveEdit} disabled={saving}>
                {saving ? "Guardando" : "Guardar cambios"}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[85vh]">
            <Detail
              animal={animalData}
              rolUsuario={rolUsuario}
              userId={userId}
              tieneInteres={tieneInteres}
              actions={actions}
            />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost bg-base-100/80">
            <X size={16} />
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Eliminar mascota"
        message="Eliminar esta mascota permanentemente?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDeleteAnimal}
      />
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compound component export
// ---------------------------------------------------------------------------

const AnimalCard = { Compact, Detail, DetailModal };
export default AnimalCard;
