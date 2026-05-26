"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, CheckCircle, Syringe, AlertTriangle, ChevronLeft, ChevronRight, X, Expand, ZoomIn, Dog, Cat, Info } from "lucide-react";
import { getOptimizedImage } from "@/lib/cloudinary";
import BotonInteres from "./BotonInteres";
import ConfirmDialog from "./ConfirmDialog";
import MultiSelect from "./MultiSelect";
import GaleriaUpload from "./GaleriaUpload";
import { AdvancedImage } from "@cloudinary/react";
import { useAnimalDetalle, useAnimalActions } from "@/hooks/useAnimalData";
import { useRazaInfo } from "@/hooks/useRazaInfo";
import { listarVacunas, listarPadecimientos } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
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
  /** Si true, permite quitar el interes aunque el animal este adoptado (para favoritos) */
  allowRemove?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Icono de especie — perro o gato */
function IconoEspecie({ especie, size = 64 }: { especie: string; size?: number }) {
  const esGato = especie.toLowerCase().includes("gato") || especie.toLowerCase().includes("cat");
  return esGato
    ? <Cat size={size} className="text-base-content/30" />
    : <Dog size={size} className="text-base-content/30" />;
}

function calcularEdad(fechaNacimiento: string) {
  const [y, m, d] = fechaNacimiento.split("-").map(Number);
  if (!y || !m || !d) return "Edad desconocida";
  const hoy = new Date();
  const nacimiento = new Date(y, m - 1, d);
  let anos = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) meses--;
  if (meses < 0) { anos--; meses += 12; }
  if (anos < 0) return "Recién nacido";
  if (anos === 0 && meses <= 0) return "Recién nacido";
  if (anos === 0) return meses === 1 ? "1 mes" : `${meses} meses`;
  if (meses === 0) return anos === 1 ? "1 ano" : `${anos} años`;
  return `${anos} ${anos === 1 ? "año" : "años"} y ${meses} ${meses === 1 ? "mes" : "meses"}`;
}

function FotoImg({ url, alt, className }: { url: string; alt: string; className?: string }) {
  return url.includes("cloudinary.com")
    ? <AdvancedImage cldImg={getOptimizedImage(url, 800, 600)} className={className} alt={alt} />
    : <img src={url} alt={alt} className={className} />;
}

// ---------------------------------------------------------------------------
// Lightbox — fullscreen con navegacion
// ---------------------------------------------------------------------------

function Lightbox({ fotos, startIdx, onClose }: { fotos: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + fotos.length) % fotos.length);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % fotos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fotos.length]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-5xl max-h-screen w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <FotoImg url={fotos[idx]} alt={`Foto ${idx + 1}`} className="max-w-full max-h-full object-contain rounded-box" />

        {fotos.length > 1 && (
          <>
            <button onClick={() => setIdx((i) => (i - 1 + fotos.length) % fotos.length)}
              className="absolute left-2 btn btn-circle btn-ghost text-white bg-black/40 hover:bg-black/60">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setIdx((i) => (i + 1) % fotos.length)}
              className="absolute right-2 btn btn-circle btn-ghost text-white bg-black/40 hover:bg-black/60">
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {fotos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/40 w-2"}`} />
              ))}
            </div>
          </>
        )}

        <button onClick={onClose} className="absolute top-2 right-2 btn btn-circle btn-ghost text-white bg-black/40 hover:bg-black/60">
          <X size={20} />
        </button>
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-white/60 text-sm">
          {idx + 1} / {fotos.length}
        </span>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// GaleriaFotos — carrusel con lightbox
// ---------------------------------------------------------------------------

function GaleriaFotos({ fotos, nombre, especie }: { fotos: string[]; nombre: string; especie: string }) {
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (fotos.length === 0) {
    return (
      <div className="h-72 bg-base-200 flex items-center justify-center rounded-t-box">
        <IconoEspecie especie={especie} size={80} />
      </div>
    );
  }

  return (
    <>
      <div className="relative h-72 bg-base-200 rounded-t-box overflow-hidden group cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
        <FotoImg url={fotos[idx]} alt={`${nombre} ${idx + 1}`} className="w-full h-full object-contain" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <ZoomIn size={32} className="text-white drop-shadow" />
        </div>

        {fotos.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + fotos.length) % fotos.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost bg-base-100/70">
              <ChevronLeft size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % fotos.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost bg-base-100/70">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1" onClick={(e) => e.stopPropagation()}>
              {fotos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "bg-primary w-4" : "bg-base-100/70 w-2"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && <Lightbox fotos={fotos} startIdx={idx} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// EditForm
// ---------------------------------------------------------------------------

interface EditFormProps {
  animal: AnimalDetalleResponse;
  saving: boolean;
  error: string | null;
  onSave: (data: Partial<AnimalDetalleResponse>) => void;
  onCancel: () => void;
}

function EditForm({ animal, saving, error, onSave, onCancel }: EditFormProps) {
  const [form, setForm] = useState({
    nombre: animal.nombre,
    especie: animal.especie.toLowerCase().includes("gato") ? "Gato" : "Perro",
    raza: animal.raza ?? "",
    razaId: animal.razaId ?? "",
    fechaNacimiento: animal.fechaNacimiento,
    sexo: animal.sexo as "MACHO" | "HEMBRA",
    descripción: animal.descripción,
    estatus: animal.estatus as "DISPONIBLE" | "ADOPTADO",
    esterilizado: animal.esterilizado,
    vacunas: animal.vacunas ?? [],
    padecimientos: animal.padecimientos ?? [],
    fotos: animal.fotos ?? [],
  });
  const [catVacunas, setCatVacunas] = useState<string[]>([]);
  const [catPadecimientos, setCatPadecimientos] = useState<string[]>([]);
  const [razasDisponibles, setRazasDisponibles] = useState<{ id: string; nombreEs: string }[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([listarVacunas(token), listarPadecimientos(token)]).then(([v, p]) => {
      if (v.ok) setCatVacunas(v.data.map((x) => x.nombre));
      if (p.ok) setCatPadecimientos(p.data.map((x) => x.nombre));
    });
  }, []);

  // Cargar razas cuando cambia la especie
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const especieUpper = form.especie.toUpperCase() === "GATO" ? "GATO" : "PERRO";
    import("@/lib/apiClient").then(({ listarRazas }) => {
      listarRazas(token, especieUpper).then((res) => {
        if (res.ok) setRazasDisponibles(res.data.map((r) => ({ id: r.id, nombreEs: r.nombreEs })));
      });
    });
    // Limpiar raza al cambiar especie
    setForm((p) => ({ ...p, razaId: "", raza: "" }));
  }, [form.especie]);

  const set = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-bold">Editar mascota</h3>
      {error && <div role="alert" className="alert alert-error"><span>{error}</span></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="form-control sm:col-span-2">
          <label className="label"><span className="label-text">Nombre</span></label>
          <input className="input input-bordered w-full" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Especie</span></label>
          <select className="select select-bordered w-full" value={form.especie} onChange={(e) => set("especie", e.target.value)}>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Raza</span></label>
          <select
            className="select select-bordered w-full"
            value={form.razaId}
            onChange={(e) => {
              const selected = razasDisponibles.find((r) => r.id === e.target.value);
              set("razaId", e.target.value);
              set("raza", selected?.nombreEs ?? "");
            }}
          >
            <option value="">Sin raza / Mestizo</option>
            {razasDisponibles.map((r) => (
              <option key={r.id} value={r.id}>{r.nombreEs}</option>
            ))}
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Fecha de nacimiento</span></label>
          <input type="date" className="input input-bordered w-full" value={form.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Sexo</span></label>
          <select className="select select-bordered w-full" value={form.sexo} onChange={(e) => set("sexo", e.target.value)}>
            <option value="MACHO">Macho</option>
            <option value="HEMBRA">Hembra</option>
          </select>
        </div>
        <div className="form-control sm:col-span-2">
          <label className="label"><span className="label-text">Descripción</span></label>
          <textarea className="textarea textarea-bordered w-full" rows={3} value={form.descripción} onChange={(e) => set("descripción", e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Estatus</span></label>
          <select className="select select-bordered w-full" value={form.estatus} onChange={(e) => set("estatus", e.target.value)}>
            <option value="DISPONIBLE">Disponible</option>
            <option value="ADOPTADO">Adoptado</option>
          </select>
        </div>
        <label className="label cursor-pointer justify-start gap-3 mt-6">
          <input type="checkbox" className="checkbox" checked={form.esterilizado} onChange={(e) => set("esterilizado", e.target.checked)} />
          <span className="label-text">Esterilizado</span>
        </label>
        <div className="sm:col-span-2 relative">
          <MultiSelect label="Vacunas" opciones={catVacunas} values={form.vacunas} onChange={(v) => set("vacunas", v)} placeholder="Buscar vacuna o agregar nueva..." />
        </div>
        <div className="sm:col-span-2 relative">
          <MultiSelect label="Condiciones médicas" opciones={catPadecimientos} values={form.padecimientos} onChange={(v) => set("padecimientos", v)} placeholder="Buscar condicion o agregar nueva..." />
        </div>
        <div className="sm:col-span-2">
          <GaleriaUpload animalId={animal.id} fotos={form.fotos} onFotosChange={(f) => set("fotos", f)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-sm" /> : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnimalCard.Compact — thumbnail con primera foto si existe
// ---------------------------------------------------------------------------

function Compact({ animal, rolUsuario, userId, tieneInteres = false, actions, onDeleted, onUpdated, allowRemove = false }: BaseProps & { animal: AnimalResponse }) {
  const [animalLocal, setAnimalLocal] = useState(animal);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const esDueno = rolUsuario === "CUIDADOR" && animalLocal.usuarioId === userId;
  const esAdoptado = animalLocal.estatus === "ADOPTADO";
  const edad = calcularEdad(animalLocal.fechaNacimiento);
  const portada = animalLocal.fotoPortada;

  if (deleted) return null;

  return (
    <>
      <div className={`rounded-box overflow-hidden shadow-xl transition-all duration-300 ${esAdoptado ? "bg-base-200 opacity-60 grayscale" : "bg-base-100 hover:-translate-y-1 hover:shadow-primary/40"}`}>
        <button onClick={() => setModalOpen(true)} className="w-full">
          <div className="h-48 bg-base-200 flex items-center justify-center relative overflow-hidden">
            {portada ? (
              <FotoImg url={portada} alt={animalLocal.nombre} className="w-full h-full object-contain" />
            ) : (
              <IconoEspecie especie={animalLocal.especie} size={64} />
            )}
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
            <p className="text-base-content/50 text-xs mt-0.5 flex items-center gap-1">
              <span className="font-medium text-primary">{animalLocal.numInteresados ?? 0}</span>
              {(animalLocal.numInteresados ?? 0) === 1 ? "persona interesada" : "personas interesadas"}
            </p>
          )}

          <div className="mt-4">
            {esDueno ? (
              <div className="flex flex-wrap gap-2">
                {actions?.onEdit && !esAdoptado && <button onClick={() => actions.onEdit!(animalLocal.id)} className="btn btn-sm btn-outline gap-1"><Pencil size={14} /> Editar</button>}
                {actions?.onToggleAdoptado && <button onClick={() => actions.onToggleAdoptado!(animalLocal.id)} className={`btn btn-sm gap-1 ${esAdoptado ? "btn-outline" : "btn-success"}`}><CheckCircle size={14} />{esAdoptado ? "Desmarcar" : "Adoptado"}</button>}
                {actions?.onDelete && <button onClick={() => actions.onDelete!(animalLocal.id)} className="btn btn-sm btn-error btn-outline gap-1"><Trash2 size={14} /> Eliminar</button>}
              </div>
            ) : (
              <BotonInteres animalId={animalLocal.id} nombreAnimal={animalLocal.nombre} tieneInteres={tieneInteres} estatus={animalLocal.estatus} rolUsuario={rolUsuario} allowRemove={allowRemove} />
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
            setAnimalLocal((prev) => ({
              ...updated,
              fotoPortada: detalle?.fotos?.[0] ?? updated.fotoPortada ?? null,
              // Preservar numInteresados — no cambia al editar el animal
              numInteresados: (updated as any).numInteresados ?? (prev as any)?.numInteresados ?? 0,
            }));
            onUpdated?.(updated);
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// SecciónRaza — info de API externa con fallback
// ---------------------------------------------------------------------------

function SecciónRaza({ especie, razaId }: { especie: string; razaId: string | null }) {
  const { info, estado } = useRazaInfo(especie, razaId);

  if (!razaId) return null;

  if (estado === "cargando") {
    return (
      <div className="rounded-box border border-base-300 p-4 flex items-center gap-3 text-base-content/50">
        <span className="loading loading-spinner loading-sm" />
        <span className="text-sm">Buscando información de la raza...</span>
      </div>
    );
  }

  if (estado === "error" || estado === "no_encontrado" || !info) return null;

  return (
    <div className="rounded-box border border-primary/20 bg-primary/5 p-4 space-y-3">
      <h2 className="font-semibold flex items-center gap-2 text-primary">
        <Info size={16} />
        Información de la raza: {info.nombre}
      </h2>

      {/* Imagen de la raza si existe */}
      {info.imagenUrl && (
        <img
          src={info.imagenUrl}
          alt={info.nombre}
          className="w-full max-h-48 object-cover rounded-box"
        />
      )}

      {/* Todos los campos no nulos, dinamicamente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {info.campos.map(({ etiqueta, valor }) => (
          <div
            key={etiqueta}
            className={valor.length > 80 ? "sm:col-span-2" : ""}
          >
            <span className="font-medium text-xs text-base-content/50 block mb-0.5">
              {etiqueta}
            </span>
            <p className="text-base-content/80 leading-relaxed">{valor}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-base-content/30 text-right">
        Fuente: {especie.toUpperCase().includes("GATO") ? "The Cat API" : "The Dog API"}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnimalCard.Detail
// ---------------------------------------------------------------------------

function Detail({ animal, rolUsuario, userId, tieneInteres = false, actions }: BaseProps & { animal: AnimalDetalleResponse }) {
  const esDueno = rolUsuario === "CUIDADOR" && animal.usuarioId === userId;
  const esAdoptado = animal.estatus === "ADOPTADO";

  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      <div className="relative">
        <GaleriaFotos fotos={animal.fotos} nombre={animal.nombre} especie={animal.especie} />
        {esAdoptado && <span className="absolute top-4 right-4 badge badge-neutral badge-lg">Adoptado</span>}
      </div>

      <div className="card-body gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{animal.nombre}</h1>
          <p className="text-base-content/60 mt-1">
            {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""} · {calcularEdad(animal.fechaNacimiento)} · {animal.sexo === "MACHO" ? "Macho" : "Hembra"}
          </p>
          <p className="text-base-content/40 text-xs mt-1">
            Publicado: {new Date(animal.fechaRegistro).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          {esDueno && (
            <p className="text-base-content/60 text-sm mt-1 flex items-center gap-1">
              <span className="font-semibold text-primary">{animal.numInteresados ?? 0}</span>
              {(animal.numInteresados ?? 0) === 1 ? "persona interesada" : "personas interesadas"}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`badge ${esAdoptado ? "badge-neutral" : "badge-success"}`}>{esAdoptado ? "Adoptado" : "Disponible"}</span>
          <span className="badge badge-outline">{animal.esterilizado ? "Esterilizado" : "Sin esterilizar"}</span>
        </div>

        <div className="divider my-0" />

        <div>
          <h2 className="font-semibold mb-2">Descripción</h2>
          <p className="text-base-content/80 leading-relaxed">{animal.descripción}</p>
        </div>

        <div>
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Syringe size={16} className="text-primary" /> Vacunas</h2>
          {animal.vacunas.length === 0 ? <p className="text-base-content/50 text-sm">Sin vacunas registradas</p> : (
            <div className="flex flex-wrap gap-2">{animal.vacunas.map((v) => <span key={v} className="badge badge-success gap-1"><CheckCircle size={12} /> {v}</span>)}</div>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-warning" /> Condiciones médicas</h2>
          {animal.padecimientos.length === 0 ? <p className="text-base-content/50 text-sm">Sin condiciones registradas</p> : (
            <div className="flex flex-wrap gap-2">{animal.padecimientos.map((p) => <span key={p} className="badge badge-warning gap-1">{p}</span>)}</div>
          )}
        </div>

        <SecciónRaza especie={animal.especie} razaId={animal.razaId ?? null} />

        <div className="divider my-0" />

        {esDueno ? (
          <div className="flex flex-wrap gap-2">
            {actions?.onEdit && !esAdoptado && <button onClick={() => actions.onEdit!(animal.id)} className="btn btn-outline gap-2"><Pencil size={16} /> Editar</button>}
            {actions?.onToggleAdoptado && <button onClick={() => actions.onToggleAdoptado!(animal.id)} className={`btn gap-2 ${esAdoptado ? "btn-outline" : "btn-success"}`}><CheckCircle size={16} />{esAdoptado ? "Desmarcar adoptado" : "Marcar como adoptado"}</button>}
            {actions?.onDelete && <button onClick={() => actions.onDelete!(animal.id)} className="btn btn-error gap-2"><Trash2 size={16} /> Eliminar</button>}
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

function DetailModal({ animalId, rolUsuario, userId: userIdProp, onClose, onDeleted, onUpdated }: {
  animalId: string;
  rolUsuario?: string;
  userId?: string;
  onClose: () => void;
  onDeleted?: (id: string) => void;
  onUpdated?: (animal: AnimalResponse, detalle?: AnimalDetalleResponse) => void;
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
            // Preservar numInteresados — actualizar el animal no cambia el conteo
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
            <EditForm animal={animalData} saving={saving} error={saveError} onSave={handleSaveEdit} onCancel={() => setEditMode(false)} />
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[85vh]">
            <Detail animal={animalData} rolUsuario={rolUsuario} userId={userId} tieneInteres={tieneInteres} actions={actions} />
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
