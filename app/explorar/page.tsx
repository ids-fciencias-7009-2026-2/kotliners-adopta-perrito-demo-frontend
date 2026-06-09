"use client";

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import AnimalCard from "@/components/AnimalCard";
import RangeSlider from "@/components/RangeSlider";
import { useAnimalList } from "@/hooks/useAnimalData";
import { listarRazas, type FiltrosAnimales, type RazaResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { Search, SlidersHorizontal, PawPrint, X, Expand, Cat, Dog, ArrowUpDown } from "lucide-react";

const MapaAnimales = lazy(() => import("@/components/MapaAnimales"));


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
  if (meses === 0) return anos === 1 ? "1 año" : `${anos} anos`;
  return `${anos} ${anos === 1 ? "ano" : "años"} y ${meses} ${meses === 1 ? "mes" : "meses"}`;
}

interface FiltroForm {
  busqueda: string;
  especie: string;
  sexo: string;
  esterilizado: boolean;
  codigoPostal: string;
  vacuna: string;
  sinPadecimientos: boolean;
  soloVacunados: boolean;
  ordenar: string;
  ordenDesc: boolean;
  edadMin: number;
  edadMax: number;
  distanciaKm: number;
  razaId: string;
}

const EDAD_MAX_DEFAULT = 20;
const DISTANCIA_MAX_DEFAULT = 100;

const FILTRO_INICIAL: FiltroForm = {
  busqueda: "",
  especie: "",
  sexo: "",
  esterilizado: false,
  codigoPostal: "",
  vacuna: "",
  sinPadecimientos: false,
  soloVacunados: false,
  ordenar: "",
  ordenDesc: true,
  edadMin: 0,
  edadMax: EDAD_MAX_DEFAULT,
  distanciaKm: DISTANCIA_MAX_DEFAULT,
  razaId: "",
};

function toFiltrosBackend(form: FiltroForm): FiltrosAnimales {
  return {
    especie: form.especie || undefined,
    sexo: form.sexo || undefined,
    esterilizado: form.esterilizado || undefined,
    codigoPostal: form.codigoPostal.trim() || undefined,
    vacuna: form.vacuna.trim() || undefined,
    sinPadecimientos: form.sinPadecimientos || undefined,
    soloVacunados: form.soloVacunados || undefined,
    ordenar: form.ordenar || undefined,
    ordenDesc: form.ordenDesc,
    razaId: form.razaId || undefined,
    edadMinAnios: form.edadMin > 0 ? form.edadMin : undefined,
    edadMaxAnios: form.edadMax < EDAD_MAX_DEFAULT ? form.edadMax : undefined,
    distanciaKm: form.distanciaKm < DISTANCIA_MAX_DEFAULT ? form.distanciaKm : undefined,
  };
}

export default function ExplorarPage() {
  const [filtroForm, setFiltroForm] = useState<FiltroForm>(FILTRO_INICIAL);
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosAnimales>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);

  const { animals: animales, loading, error, rol: rolUsuario } = useAnimalList(filtrosAplicados);

  const [razasDisponibles, setRazasDisponibles] = useState<RazaResponse[]>([]);
  const [especieAnterior, setEspecieAnterior] = useState("");

  useEffect(() => {
    if (filtroForm.especie === especieAnterior) return;
    setEspecieAnterior(filtroForm.especie);
    if (!filtroForm.especie) {
      setRazasDisponibles([]);
      setFiltroForm((f) => ({ ...f, razaId: "" }));
      setFiltrosAplicados((prev) => ({ ...prev, razaId: undefined }));
      return;
    }
    const token = getToken();
    if (!token) return;
    listarRazas(token, filtroForm.especie.toUpperCase()).then((res) => {
      if (res.ok) setRazasDisponibles(res.data.sort((a, b) => a.nombreEs.localeCompare(b.nombreEs)));
    });
    setFiltroForm((f) => ({ ...f, razaId: "" }));
    setFiltrosAplicados((prev) => ({ ...prev, razaId: undefined }));
  }, [filtroForm.especie]);

  const filtrados = filtroForm.busqueda
    ? animales.filter((a) =>
        a.nombre.toLowerCase().includes(filtroForm.busqueda.toLowerCase()) ||
        (a.raza ?? "").toLowerCase().includes(filtroForm.busqueda.toLowerCase())
      )
    : animales;

  const selected = selectedId ? animales.find((a) => a.id === selectedId) : null;

  const aplicarFiltros = useCallback(() => {
    setFiltrosAplicados(toFiltrosBackend(filtroForm));
  }, [filtroForm]);

  function limpiarFiltros() {
    setFiltroForm(FILTRO_INICIAL);
    setFiltrosAplicados({});
  }

  const hayFiltrosActivos = Object.values(filtrosAplicados).some((v) => v !== undefined && v !== false);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-base-200">

      <div className="w-full lg:w-[440px] flex flex-col bg-base-100 shadow-xl z-10 overflow-hidden">

        <div className="p-4 border-b border-base-200 flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <Search size={16} className="text-base-content/40" />
              <input type="text" placeholder="Buscar por nombre o raza..."
                value={filtroForm.busqueda}
                onChange={(e) => setFiltroForm((f) => ({ ...f, busqueda: e.target.value }))}
                className="grow" />
              {filtroForm.busqueda && (
                <button onClick={() => setFiltroForm((f) => ({ ...f, busqueda: "" }))}>
                  <X size={14} className="text-base-content/40" />
                </button>
              )}
            </label>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`btn btn-square btn-outline ${filtersOpen || hayFiltrosActivos ? "btn-primary" : ""}`}>
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {filtersOpen && (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[65vh] pr-1">

              {/* Especie + Sexo */}
              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label py-0"><span className="label-text text-xs">Especie</span></label>
                  <select className="select select-bordered select-sm" value={filtroForm.especie}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, especie: e.target.value }))}>
                    <option value="">Todos</option>
                    <option value="PERRO">Perro</option>
                    <option value="GATO">Gato</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label py-0"><span className="label-text text-xs">Sexo</span></label>
                  <select className="select select-bordered select-sm" value={filtroForm.sexo}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, sexo: e.target.value }))}>
                    <option value="">Todos</option>
                    <option value="MACHO">Macho</option>
                    <option value="HEMBRA">Hembra</option>
                  </select>
                </div>
              </div>

              {/* Raza */}
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Raza</span></label>
                <select className="select select-bordered select-sm" value={filtroForm.razaId}
                  disabled={!filtroForm.especie}
                  onChange={(e) => setFiltroForm((f) => ({ ...f, razaId: e.target.value }))}>
                  <option value="">{filtroForm.especie ? "Todas las razas" : "Selecciona especie primero"}</option>
                  {razasDisponibles.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombreEs}</option>
                  ))}
                </select>
              </div>

              {/* Ordenar */}
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Ordenar por</span></label>
                <div className="flex gap-1">
                  <select className="select select-bordered select-sm flex-1" value={filtroForm.ordenar}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, ordenar: e.target.value }))}>
                    <option value="">Más reciente</option>
                    <option value="nombre">Nombre</option>
                    <option value="fechaNacimiento">Edad</option>
                    <option value="distancia">Distancia</option>
                  </select>
                  <div className="tooltip" data-tip={filtroForm.ordenDesc ? "Orden descendente (click para ascendente)" : "Orden ascendente (click para descendente)"}>
                    <button type="button"
                      onClick={() => setFiltroForm((f) => ({ ...f, ordenDesc: !f.ordenDesc }))}
                      className="btn btn-sm btn-square btn-outline">
                      <ArrowUpDown size={14} className={filtroForm.ordenDesc ? "text-primary" : "text-base-content/40"} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rango de edad */}
              <div className="form-control gap-1">
                <label className="label py-0">
                  <span className="label-text text-xs">Rango de edad</span>
                  <span className="label-text-alt text-xs text-base-content/50">
                    {filtroForm.edadMin === 0 && filtroForm.edadMax === EDAD_MAX_DEFAULT
                      ? "Cualquier edad"
                      : `${filtroForm.edadMin} – ${filtroForm.edadMax === EDAD_MAX_DEFAULT ? `${EDAD_MAX_DEFAULT}+` : filtroForm.edadMax} anos`}
                  </span>
                </label>
                <RangeSlider
                  min={0} max={EDAD_MAX_DEFAULT} valueMin={filtroForm.edadMin} valueMax={filtroForm.edadMax} step={1}
                  formatValue={(v: number) => v === EDAD_MAX_DEFAULT ? `${v}+` : `${v}`}
                  onChange={(minV: number, maxV: number) => setFiltroForm((f) => ({ ...f, edadMin: minV, edadMax: maxV }))}
                />
              </div>

              {/* Distancia */}
              <div className="form-control gap-1">
                <label className="label py-0">
                  <span className="label-text text-xs">Distancia maxima</span>
                  <span className="label-text-alt text-xs font-medium text-primary">
                    {filtroForm.distanciaKm >= DISTANCIA_MAX_DEFAULT ? "Sin limite" : `${filtroForm.distanciaKm} km`}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-base-content/40">1</span>
                  <input type="range" min={1} max={DISTANCIA_MAX_DEFAULT} step={1}
                    value={filtroForm.distanciaKm}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, distanciaKm: Number(e.target.value) }))}
                    className="range range-xs range-accent flex-1" />
                  <span className="text-xs text-base-content/40">100km</span>
                </div>
                {filtroForm.distanciaKm < DISTANCIA_MAX_DEFAULT && (
                  <p className="text-xs text-base-content/40">Basado en el CP de tu perfil</p>
                )}
              </div>

              {/* Checkboxes consistentes */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-sm checkbox-primary"
                    checked={filtroForm.esterilizado}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, esterilizado: e.target.checked }))} />
                  <span className="text-sm">Solo esterilizados</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-sm checkbox-primary"
                    checked={filtroForm.sinPadecimientos}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, sinPadecimientos: e.target.checked }))} />
                  <span className="text-sm">Sin padecimientos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="checkbox checkbox-sm checkbox-success"
                    checked={filtroForm.soloVacunados}
                    onChange={(e) => setFiltroForm((f) => ({ ...f, soloVacunados: e.target.checked }))} />
                  <span className="text-sm">Con al menos una vacuna</span>
                </label>
              </div>

              {/* Vacuna especifica */}
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Vacuna especifica</span></label>
                <input type="text" placeholder="Ej: Rabia, Moquillo..."
                  className="input input-bordered input-sm"
                  value={filtroForm.vacuna}
                  onChange={(e) => setFiltroForm((f) => ({ ...f, vacuna: e.target.value }))} />
              </div>

              {/* Botones */}
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
                <button onClick={limpiarFiltros} className="btn btn-ghost btn-sm">Quitar filtros</button>
              )}
            </div>
          ) : (
            filtrados.map((animal) => (
              <div key={animal.id}
                className={`flex gap-4 p-4 border-b border-base-200 transition hover:bg-base-200 cursor-pointer ${
                  selectedId === animal.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                }`}
                onClick={() => setSelectedId(animal.id === selectedId ? null : animal.id)}>
                <div className="w-16 h-16 rounded-box bg-base-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {animal.fotoPortada ? (
                    animal.fotoPortada.includes("cloudinary.com") ? (
                      <img src={`https://res.cloudinary.com/dhrsbftoc/image/upload/w_64,h_64,c_fit,q_auto,f_auto/${animal.fotoPortada.match(/\/upload\/(?:v\d+\/)?(.+)$/)?.[1]?.replace(/\.[^/.]+$/, "") ?? ""}`}
                        alt={animal.nombre} className="w-full h-full object-contain object-top" />
                    ) : (
                      <img src={animal.fotoPortada} alt={animal.nombre} className="w-full h-full object-contain object-top" />
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
                    {animal.estatus === "ADOPTADO" && <span className="badge badge-neutral badge-sm">Adoptado</span>}
                  </div>
                  <p className="text-sm text-base-content/60 truncate">
                    {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""} · {animal.sexo === "MACHO" ? "Macho" : "Hembra"}
                  </p>
                  <p className="text-xs text-base-content/40 mt-1">{calcularEdad(animal.fechaNacimiento)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setModalId(animal.id); }}
                  className="btn btn-ghost btn-xs btn-square self-center shrink-0">
                  <Expand size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="border-t border-base-200 p-4 bg-base-100 shadow-inner">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{selected.nombre}</h3>
                <p className="text-sm text-base-content/60">
                  {selected.especie}{selected.raza ? ` · ${selected.raza}` : ""} · {calcularEdad(selected.fechaNacimiento)}
                </p>
                <p className="text-xs text-base-content/50 mt-1 line-clamp-2">{selected.descripcion}</p>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <button onClick={() => setModalId(selected.id)} className="btn btn-ghost btn-xs gap-1">
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

      {/* MAPA con OpenStreetMap */}
      <div className="hidden lg:block flex-1 relative">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-base-200">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        }>
          <MapaAnimales
            animales={filtrados}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
            onOpenModal={(id) => setModalId(id)}
          />
        </Suspense>
      </div>

      {modalId && (
        <AnimalCard.DetailModal animalId={modalId} rolUsuario={rolUsuario} onClose={() => setModalId(null)} />
      )}
    </div>
  );
}
