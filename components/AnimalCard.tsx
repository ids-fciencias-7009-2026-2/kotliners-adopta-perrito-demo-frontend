"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, CheckCircle, Syringe, AlertTriangle, Expand, X } from "lucide-react";
import BotonInteres from "./BotonInteres";
import BotonFlag from "./BotonFlag";
import ConfirmDialog from "./ConfirmDialog";
import { GaleriaFotos, FotoImg, IconoEspecie, calcularEdad } from "./animal/AnimalCardHelpers";
import SeccionRaza from "./animal/SeccionRaza";
import AnimalEditForm from "./animal/AnimalEditForm";
import { useAnimalDetalle, useAnimalActions } from "@/hooks/useAnimalData";
import type { AnimalResponse, AnimalDetalleResponse } from "@/lib/apiClient";

// ---------------------------------------------------------------------------
// Tipos
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
  onDeleted?: (id: string) => void;
  onUpdated?: (animal: AnimalResponse) => void;
  allowRemove?: boolean;
  onInteresChange?: (animalId: string, tieneInteres: boolean) => void;
}

// ---------------------------------------------------------------------------
// AnimalCard.Compact
// ---------------------------------------------------------------------------

function InteresadosModal({ animalId, nombreAnimal, onClose }: { animalId: string; nombreAnimal: string; onClose: () => void }) {
  const [interesados, setInteresados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("user_token") : null;
    if (!token) return;
    import("@/lib/apiClient").then(({ listarInteresadosPorAnimal }) => {
      listarInteresadosPorAnimal(token, animalId).then((res) => {
        if (res.ok) setInteresados(res.data.sort((a: any, b: any) => new Date(a.fechaInteres).getTime() - new Date(b.fechaInteres).getTime()));
        setLoading(false);
      });
    });
  }, [animalId]);

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><X size={16} /></button>
        <h3 className="font-bold text-lg mb-3">Interesados en {nombreAnimal}</h3>
        {loading ? (
          <div className="flex justify-center py-4"><span className="loading loading-spinner" /></div>
        ) : interesados.length === 0 ? (
          <p className="text-base-content/50 text-sm">Nadie ha manifestado interés aún.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {interesados.map((i) => (
              <div key={i.adoptanteId} className="flex items-center gap-3">
                {i.fotoAdoptante ? (
                  <img src={i.fotoAdoptante} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {i.nombreAdoptante.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{i.nombreAdoptante}</p>
                  <p className="text-xs text-base-content/40">{i.emailAdoptante}</p>
                  <p className="text-xs text-base-content/40">Interesado desde: {new Date(i.fechaInteres).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ---------------------------------------------------------------------------

function Compact({ animal, rolUsuario, userId, tieneInteres = false, actions, onDeleted, onUpdated, allowRemove = false, onInteresChange }: BaseProps & { animal: AnimalResponse }) {
  const [animalLocal, setAnimalLocal] = useState(animal);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showInteresados, setShowInteresados] = useState(false);

  const esDueno = rolUsuario === "CUIDADOR" && animalLocal.usuarioId === userId;
  const esAdoptado = animalLocal.estatus === "ADOPTADO";
  const edad = calcularEdad(animalLocal.fechaNacimiento);
  const portada = animalLocal.fotoPortada;

  if (deleted) return null;

  return (
    <>
      <div className={`rounded-box overflow-hidden shadow-xl transition-all duration-300 bg-base-100 hover:-translate-y-1 hover:shadow-primary/40`}>
        {/* Cuidador info */}
        {animalLocal.cuidadorUsername && !esDueno && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-base-200">
            {animalLocal.cuidadorFoto ? (
              <img src={animalLocal.cuidadorFoto} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {animalLocal.cuidadorUsername.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs text-base-content/60">@{animalLocal.cuidadorUsername}</span>
          </div>
        )}
        <button onClick={() => setModalOpen(true)} className="w-full">
          <div className="h-48 bg-base-200 flex items-center justify-center relative overflow-hidden">
            {portada
              ? <FotoImg url={portada} alt={animalLocal.nombre} className="w-full h-full object-contain object-top" />
              : <IconoEspecie especie={animalLocal.especie} size={64} />}
            {esAdoptado && <span className="absolute top-2 right-2 badge badge-neutral">Adoptado</span>}
          </div>
        </button>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => setModalOpen(true)}>
              <h3 className={`text-xl font-bold hover:text-primary transition-colors text-left ${esAdoptado ? "text-base-content/50" : ""}`}>
                {animalLocal.nombre}
              </h3>
            </button>
            <button onClick={() => setModalOpen(true)} className="btn btn-ghost btn-xs btn-square shrink-0 mt-1" title="Ver detalle">
              <Expand size={14} />
            </button>
          </div>
          <p className="text-base-content/60 text-sm mt-1">
            {animalLocal.especie}{animalLocal.raza ? ` · ${animalLocal.raza}` : ""} · {edad}
          </p>
          <p className="text-base-content/40 text-xs mt-0.5">
            Nacimiento: {new Date(animalLocal.fechaNacimiento + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p className="text-base-content/40 text-xs mt-0.5">
            Publicado: {new Date(animalLocal.fechaRegistro).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          {esDueno && (
            <button
              onClick={() => setShowInteresados(true)}
              className="text-xs mt-0.5 flex items-center gap-1 hover:underline cursor-pointer text-base-content/50"
            >
              <span className="font-medium text-primary">{animalLocal.numInteresados ?? 0}</span>
              {(animalLocal.numInteresados ?? 0) === 1 ? "persona interesada" : "personas interesadas"}
            </button>
          )}
          <div className="mt-4">
            {esDueno ? (
              <div className="flex flex-wrap gap-2">
                {actions?.onEdit && !esAdoptado && <button onClick={() => actions.onEdit!(animalLocal.id)} className="btn btn-sm btn-outline gap-1"><Pencil size={14} /> Editar</button>}
                {actions?.onToggleAdoptado && <button onClick={() => actions.onToggleAdoptado!(animalLocal.id)} className={`btn btn-sm gap-1 ${esAdoptado ? "btn-outline" : "btn-success"}`}><CheckCircle size={14} />{esAdoptado ? "Desmarcar" : "Adoptado"}</button>}
                {actions?.onDelete && <button onClick={() => actions.onDelete!(animalLocal.id)} className="btn btn-sm btn-error btn-outline gap-1"><Trash2 size={14} /> Eliminar</button>}
              </div>
            ) : (
                <div className="flex gap-2 flex-wrap">
                    <BotonInteres
                        animalId={animalLocal.id}
                        nombreAnimal={animalLocal.nombre}
                        tieneInteres={tieneInteres}
                        estatus={animalLocal.estatus}
                        rolUsuario={rolUsuario}
                        allowRemove={allowRemove}
                        onInteresChange={(tiene) => onInteresChange?.(animalLocal.id, tiene)}
                    />

                    <BotonFlag
                        animalId={animalLocal.id}
                        nombreAnimal={animalLocal.nombre}
                        rolUsuario={rolUsuario}
                    />
                </div>
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
          onUpdated={(updated, detalle) => {
            const withFoto = {
              ...updated,
              fotoPortada: detalle?.fotos?.length ? detalle.fotos[0] : (detalle ? null : updated.fotoPortada ?? animalLocal.fotoPortada ?? null),
              numInteresados: (updated as any).numInteresados ?? (animalLocal as any)?.numInteresados ?? 0,
            };
            setAnimalLocal(withFoto);
            onUpdated?.(withFoto);
          }}
        />
      )}
      {showInteresados && (
        <InteresadosModal
          animalId={animalLocal.id}
          nombreAnimal={animalLocal.nombre}
          onClose={() => setShowInteresados(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// AnimalCard.Detail
// ---------------------------------------------------------------------------

function Detail({ animal, rolUsuario, userId, tieneInteres = false, actions, extraActions }: BaseProps & { animal: AnimalDetalleResponse; extraActions?: React.ReactNode }) {
  const esDueno = rolUsuario === "CUIDADOR" && animal.usuarioId === userId;
  const esAdoptado = animal.estatus === "ADOPTADO";
  const [showInteresadosDetail, setShowInteresadosDetail] = useState(false);

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      <div className="relative">
        <GaleriaFotos fotos={animal.fotos} nombre={animal.nombre} especie={animal.especie} />
        {esAdoptado && <span className="absolute top-4 right-4 badge badge-neutral badge-lg">Adoptado</span>}
      </div>

      <div className="card-body gap-4">
        <div>
          {!esDueno && (animal as any).cuidadorUsername && (
            <div className="flex items-center gap-2 mb-2">
              {(animal as any).cuidadorFoto ? (
                <img src={(animal as any).cuidadorFoto} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {(animal as any).cuidadorUsername.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-base-content/60">@{(animal as any).cuidadorUsername}</span>
            </div>
          )}
          <h1 className="text-3xl font-bold text-primary">{animal.nombre}</h1>
          <p className="text-base-content/60 mt-1">
            {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""} · {calcularEdad(animal.fechaNacimiento)} · {animal.sexo === "MACHO" ? "Macho" : "Hembra"}
          </p>
          <p className="text-base-content/40 text-xs mt-1">
            Publicado: {new Date(animal.fechaRegistro).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          {esDueno && (
            <button
              onClick={() => setShowInteresadosDetail(true)}
              className="text-base-content/60 text-sm mt-1 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span className="font-semibold text-primary">{animal.numInteresados ?? 0}</span>
              {(animal.numInteresados ?? 0) === 1 ? "persona interesada" : "personas interesadas"}
            </button>
          )}
          {showInteresadosDetail && (
            <InteresadosModal animalId={animal.id} nombreAnimal={animal.nombre} onClose={() => setShowInteresadosDetail(false)} />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`badge ${esAdoptado ? "badge-neutral" : "badge-success"}`}>{esAdoptado ? "Adoptado" : "Disponible"}</span>
          <span className="badge badge-outline">{animal.esterilizado ? "Esterilizado" : "Sin esterilizar"}</span>
        </div>

        <div className="divider my-0" />

        <div>
          <h2 className="font-semibold mb-2">Descripcion</h2>
          <p className="text-base-content/80 leading-relaxed">{animal.descripcion}</p>
        </div>

        <div>
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Syringe size={16} className="text-primary" /> Vacunas</h2>
          {animal.vacunas.length === 0
            ? <p className="text-base-content/50 text-sm">Sin vacunas registradas</p>
            : <div className="flex flex-wrap gap-2">{animal.vacunas.map((v) => <span key={v} className="badge badge-success gap-1"><CheckCircle size={12} /> {v}</span>)}</div>}
        </div>

        <div>
          <h2 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-warning" /> Condiciones medicas</h2>
          {animal.padecimientos.length === 0
            ? <p className="text-base-content/50 text-sm">Sin condiciones registradas</p>
            : <div className="flex flex-wrap gap-2">{animal.padecimientos.map((p) => <span key={p} className="badge badge-warning gap-1">{p}</span>)}</div>}
        </div>

        <SeccionRaza especie={animal.especie} razaId={animal.razaId ?? null} />

        <div className="divider my-0" />

        {esDueno ? (
          <div className="flex flex-wrap gap-2">
            {actions?.onEdit && !esAdoptado && <button onClick={() => actions.onEdit!(animal.id)} className="btn btn-outline gap-2"><Pencil size={16} /> Editar</button>}
            {actions?.onToggleAdoptado && <button onClick={() => actions.onToggleAdoptado!(animal.id)} className={`btn gap-2 ${esAdoptado ? "btn-outline" : "btn-success"}`}><CheckCircle size={16} />{esAdoptado ? "Desmarcar adoptado" : "Marcar como adoptado"}</button>}
            {actions?.onDelete && <button onClick={() => actions.onDelete!(animal.id)} className="btn btn-error gap-2"><Trash2 size={16} /> Eliminar</button>}
          </div>
        ) : extraActions ? (
          <div className="flex flex-wrap gap-2">
            {extraActions}
          </div>
        ) : (
          <BotonInteres animalId={animal.id} nombreAnimal={animal.nombre} tieneInteres={tieneInteres} estatus={animal.estatus} rolUsuario={rolUsuario} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnimalCard.DetailModal
// ---------------------------------------------------------------------------

function DetailModal({ animalId, rolUsuario, userId: userIdProp, onClose, onDeleted, onUpdated, extraFooter }: {
  animalId: string;
  rolUsuario?: string;
  userId?: string;
  onClose: () => void;
  onDeleted?: (id: string) => void;
  onUpdated?: (animal: AnimalResponse, detalle?: AnimalDetalleResponse) => void;
  extraFooter?: React.ReactNode;
}) {
  const { animal, tieneInteres, loading, error } = useAnimalDetalle(animalId);
  const [editMode, setEditMode] = useState(false);
  const [animalLocal, setAnimalLocal] = useState<AnimalDetalleResponse | null>(null);

  const userId = userIdProp ?? (typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").id as string | undefined
    : undefined);

  const animalData = animalLocal ?? animal;

  const { saving, saveError, pendingDeleteId, deleting, handleDelete, confirmDelete, handleToggleAdoptado, handleSaveEdit, setPendingDeleteId } =
    useAnimalActions(animalId, animalData, {
      onDeleted: (id) => { onDeleted?.(id); onClose(); },
      onUpdated: (updated, fullData) => {
        setAnimalLocal((prev) => {
          const base = prev ?? animal;
          if (!base) return prev;
          return {
            ...base,
            ...updated,
            numInteresados: (base as any).numInteresados ?? (updated as any).numInteresados ?? 0,
            vacunas: fullData?.vacunas ?? base.vacunas,
            padecimientos: fullData?.padecimientos ?? base.padecimientos,
            fotos: fullData?.fotos ?? base.fotos,
          };
        });
        onUpdated?.(updated, fullData);
        setEditMode(false);
      },
    });

  const actions: AnimalCardActions = {
    onDelete: handleDelete,
    onEdit: () => setEditMode(true),
    onToggleAdoptado: handleToggleAdoptado,
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>
        ) : error || !animalData ? (
          <div className="p-8 text-center text-error">{error ?? "No se pudo cargar."}</div>
        ) : editMode ? (
          <div className="overflow-y-auto max-h-[85vh]">
            <AnimalEditForm animal={animalData} saving={saving} error={saveError} onSave={handleSaveEdit} onCancel={() => setEditMode(false)} />
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[85vh]">
            <Detail animal={animalData} rolUsuario={rolUsuario} userId={userId} tieneInteres={tieneInteres} actions={actions} extraActions={extraFooter} />
          </div>
        )}
        <button onClick={onClose} className="absolute top-3 right-3 btn btn-circle btn-sm btn-ghost bg-base-100/80"><X size={16} /></button>
      </div>
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Eliminar mascota"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
      />
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

const AnimalCard = { Compact, Detail, DetailModal };
export default AnimalCard;
