"use client";

import { useState, useCallback } from "react";
import AnimalCard from "@/components/AnimalCard";
import { useAnimalList } from "@/hooks/useAnimalData";
import type { FiltrosAnimales } from "@/lib/apiClient";
import { Search, SlidersHorizontal, MapPin, PawPrint, X, Expand, Cat, Dog } from "lucide-react";

const PIN_POSITIONS: Record<string, { x: number; y: number }> = {};
function getPinPosition(id: string) {
  if (!PIN_POSITIONS[id]) {
    const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    PIN_POSITIONS[id] = { x: 20 + (hash % 60), y: 20 + ((hash * 7) % 55) };
  }
  return PIN_POSITIONS[id];
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
  if (anos < 0) return "Recien nacido";
  if (anos === 0 && meses <= 0) return "Recien nacido";
  if (anos === 0) return meses === 1 ? "1 mes" : `${meses} meses`;
  if (meses === 0) return anos === 1 ? "1 año" : `${anos} años`;
  return `${anos} ${anos === 1 ? "año" : "años"} y ${meses} ${meses === 1 ? "mes" : "meses"}`;
}

/** Estado local del formulario de filtros antes de aplicarlos */
interface FiltroForm {
  busqueda: string;
  especie: string;
  sexo: string;
  esterilizado: string;
  codigoPostal: string;
  vacuna: string;
  sinPadecimientos: boolean;
  ordenar: string;
}

const FILTRO_INICIAL: FiltroForm = {
  busqueda: "",
  especie: "",
  sexo: "",
  esterilizado: "",
  codigoPostal: "",
  vacuna: "",
  sinPadecimientos: false,
  ordenar: "",
};

/** Convierte el formulario local en FiltrosAnimales para el backend */
function toFiltrosBackend(form: FiltroForm): FiltrosAnimales {
  return {
    especie: form.especie || undefined,
    sexo: form.sexo || undefined,
    esterilizado: form.esterilizado !== "" ? form.esterilizado === "true" : undefined,
    codigoPostal: form.codigoPostal.trim() || undefined,
    vacuna: form.vacuna.trim() || undefined,
    sinPadecimientos: form.sinPadecimientos || undefined,
    ordenar: form.ordenar || undefined,
  };
}

/** Pagina de exploracion de mascotas. Ruta protegida: /explorar */
export default function ExplorarPage() {
  const [filtroForm, setFiltroForm] = useState<FiltroForm>(FILTRO_INICIAL);
  // filtrosAplicados es lo que realmente se manda al backend
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosAnimales>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);

  const { animals: animales, interes, loading, error, rol: rolUsuario } = useAnimalList(filtrosAplicados);

  // Filtro de busqueda local por nombre/raza (no requiere llamada al backend)
  const filtrados = filtroForm.busqueda
    ? animales.filter((a) =>
        a.nombre.toLowerCase().includes(filtroForm.busqueda.toLowerCase()) ||
        (a.raza ?? "").toLowerCase().includes(filtroForm.busqueda.toLowerCase())
      )
    : animales;

  const selected = selectedId ? animales.find((a) => a.id === selectedId) : null;

  /** Aplica los filtros del formulario mandando la peticion al backend */
  const aplicarFiltros = useCallback(() => {
    setFiltrosAplicados(toFiltrosBackend(filtroForm));
  }, [filtroForm]);

  /** Limpia todos los filtros y recarga sin filtros */
  function limpiarFiltros() {
    setFiltroForm(FILTRO_INICIAL);
    setFiltrosAplicados({});
  }

  const hayFiltrosActivos = Object.values(filtrosAplicados).some((v) => v !== undefined && v !== false);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-base-200">

      {/* PANEL IZQUIERDO */}
      <div className="w-full lg:w-[440px] flex flex-col bg-base-100 shadow-xl z-10 overflow-hidden">

        {/* Barra de busqueda y filtros */}
        <div className="p-4 border-b border-base-200 flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <Search size={16} className="text-base-content/40" />
              <input
                type="text"
                placeholder="Buscar por nombre o raza..."
                value={filtroForm.busqueda}
                onChange={(e) => setFiltroForm((f) => ({ ...f, busqueda: e.target.value }))}
                className="grow"
              />
              {filtroForm.busqueda && (
                <button onClick={() => setFiltroForm((f) => ({ ...f, busqueda: "" }))}>
                  <X size={14} className="text-base-content/40" />
                </button>
              )}
            </label>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`btn btn-square btn-outline ${filtersOpen ? "btn-primary" : ""} ${hayFiltrosActivos ? "btn-primary" : ""}`}
              title="Filtros avanzados"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {filtersOpen && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                {/* Especie */}
                <div className="form-control">
                  <label className="label py-0"><span className="label-text text-xs">Especie</span></label>
                  <select
                    className="select select-bordered select-sm"
                    value={filtroForm.especie}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, especie: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="PERRO">Perro</option>
                    <option value="GATO">Gato</option>
                  </select>
                </div>

                {/* Sexo */}
                <div className="form-control">
                  <label className="label py-0"><span className="label-text text-xs">Sexo</span></label>
                  <select
                    className="select select-bordered select-sm"
                    value={filtroForm.sexo}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, sexo: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="MACHO">Macho</option>
                    <option value="HEMBRA">Hembra</option>
                  </select>
                </div>

                {/* Esterilizado */}
                <div className="form-control">
                  <label className="label py-0"><span className="label-text text-xs">Esterilizado</span></label>
                  <select
                    className="select select-bordered select-sm"
                    value={filtroForm.esterilizado}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, esterilizado: e.target.value }))}
                  >
                    <option value="">Todos</option>
                    <option value="true">Si</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Ordenar */}
                <div className="form-control">
                  <label className="label py-0"><span className="label-text text-xs">Ordenar por</span></label>
                  <select
                    className="select select-bordered select-sm"
                    value={filtroForm.ordenar}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, ordenar: e.target.value }))}
                  >
                    <option value="">Mas reciente</option>
                    <option value="nombre">Nombre A-Z</option>
                    <option value="fechaNacimiento">Edad</option>
                    <option value="fechaRegistro">Fecha de registro</option>
                  </select>
                </div>
              </div>

              {/* Codigo postal */}
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Codigo postal del cuidador</span></label>
                <input
                  type="text"
                  placeholder="Ej: 06600"
                  maxLength={5}
                  className="input input-bordered input-sm"
                  value={filtroForm.codigoPostal}
                  onChange={(e) => setFiltroForm((f) => ({ ...f, codigoPostal: e.target.value.replace(/\D/g, "") }))}
                />
              </div>

              {/* Vacuna */}
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Tiene vacuna</span></label>
                <input
                  type="text"
                  placeholder="Ej: Rabia, Moquillo..."
                  className="input input-bordered input-sm"
                  value={filtroForm.vacuna}
                  onChange={(e) => setFiltroForm((f) => ({ ...f, vacuna: e.target.value }))}
                />
              </div>

              {/* Sin padecimientos */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={filtroForm.sinPadecimientos}
                  onChange={(e) => setFiltroForm((f) => ({ ...f, sinPadecimientos: e.target.checked }))}
                />
                <span className="text-sm">Solo animales sin padecimientos</span>
              </label>

              {/* Botones aplicar / limpiar */}
              <div className="flex gap-2">
                <button onClick={aplicarFiltros} className="btn btn-primary btn-sm flex-1">
                  Aplicar filtros
                </button>
                {hayFiltrosActivos && (
                  <button onClick={limpiarFiltros} className="btn btn-ghost btn-sm gap-1">
                    <X size={14} /> Limpiar
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-base-content/50">
            {loading
              ? "Cargando..."
              : `${filtrados.length} mascota${filtrados.length !== 1 ? "s" : ""} encontrada${filtrados.length !== 1 ? "s" : ""}${hayFiltrosActivos ? " (con filtros)" : ""}`}
          </p>
        </div>

        {/* Lista scrolleable */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-16">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : error ? (
            <p className="text-center text-error py-8 px-4">{error}</p>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/40 p-8">
              <PawPrint size={48} />
              <p className="text-center">No se encontraron mascotas con esos filtros.</p>
              {hayFiltrosActivos && (
                <button onClick={limpiarFiltros} className="btn btn-ghost btn-sm">
                  Quitar filtros
                </button>
              )}
            </div>
          ) : (
            filtrados.map((animal) => (
              <div
                key={animal.id}
                className={`flex gap-4 p-4 border-b border-base-200 transition hover:bg-base-200 cursor-pointer ${
                  selectedId === animal.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                }`}
                onClick={() => setSelectedId(animal.id === selectedId ? null : animal.id)}
              >
                <div className="w-16 h-16 rounded-box bg-base-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {animal.fotoPortada ? (
                    animal.fotoPortada.includes("cloudinary.com") ? (
                      <img
                        src={`https://res.cloudinary.com/dhrsbftoc/image/upload/w_64,h_64,c_fit,q_auto,f_auto/${animal.fotoPortada.match(/\/upload\/(?:v\d+\/)?(.+)$/)?.[1]?.replace(/\.[^/.]+$/, "") ?? ""}`}
                        alt={animal.nombre}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img src={animal.fotoPortada} alt={animal.nombre} className="w-full h-full object-contain" />
                    )
                  ) : (
                    <span className="flex items-center justify-center w-full h-full">
                      {animal.especie.toLowerCase().includes("gato")
                        ? <Cat size={28} className="text-base-content/30" />
                        : <Dog size={28} className="text-base-content/30" />}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{animal.nombre}</span>
                    {animal.estatus === "ADOPTADO" && (
                      <span className="badge badge-neutral badge-sm">Adoptado</span>
                    )}
                  </div>
                  <p className="text-sm text-base-content/60 truncate">
                    {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""} · {animal.sexo === "MACHO" ? "Macho" : "Hembra"}
                  </p>
                  <p className="text-xs text-base-content/40 mt-1">
                    {calcularEdad(animal.fechaNacimiento)}
                  </p>
                </div>
                {/* Boton expandir */}
                <button
                  onClick={(e) => { e.stopPropagation(); setModalId(animal.id); }}
                  className="btn btn-ghost btn-xs btn-square self-center shrink-0"
                  title="Ver detalle completo"
                >
                  <Expand size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Preview de mascota seleccionada */}
        {selected && (
          <div className="border-t border-base-200 p-4 bg-base-100 shadow-inner">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{selected.nombre}</h3>
                <p className="text-sm text-base-content/60">
                  {selected.especie}{selected.raza ? ` · ${selected.raza}` : ""} · {calcularEdad(selected.fechaNacimiento)}
                </p>
                <p className="text-xs text-base-content/50 mt-1 line-clamp-2">{selected.descripcion}</p>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <button
                  onClick={() => setModalId(selected.id)}
                  className="btn btn-ghost btn-xs gap-1"
                  title="Ver detalle completo"
                >
                  <Expand size={14} /> Ver mas
                </button>
                <button onClick={() => setSelectedId(null)} className="btn btn-ghost btn-xs btn-square">
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAPA — placeholder */}
      <div className="hidden lg:flex flex-1 relative bg-primary/5 items-center justify-center">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, #888 0, #888 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #888 0, #888 1px, transparent 1px, transparent 40px)",
          }}
        />
        {filtrados.map((animal) => {
          const pos = getPinPosition(animal.id);
          const isSelected = selectedId === animal.id;
          const isAdoptado = animal.estatus === "ADOPTADO";
          return (
            <button
              key={animal.id}
              onClick={() => setSelectedId(animal.id === selectedId ? null : animal.id)}
              className="absolute transition-transform hover:scale-110"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap ${
                  isSelected ? "bg-primary text-primary-content scale-110"
                  : isAdoptado ? "bg-neutral text-neutral-content"
                  : "bg-base-100 text-base-content border border-base-300"
                }`}>
                  {animal.nombre}
                </div>
                <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-primary" : isAdoptado ? "bg-neutral" : "bg-base-content/40"}`} />
              </div>
            </button>
          );
        })}
        <div className="text-center text-base-content/30 select-none pointer-events-none">
          <MapPin size={48} className="mx-auto mb-2" />
          <p className="text-sm">Mapa interactivo proximamente</p>
        </div>
      </div>

      {/* Modal de detalle */}
      {modalId && (
        <AnimalCard.DetailModal
          animalId={modalId}
          rolUsuario={rolUsuario}
          onClose={() => setModalId(null)}
        />
      )}
    </div>
  );
}
