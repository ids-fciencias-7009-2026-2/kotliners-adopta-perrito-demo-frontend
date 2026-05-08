"use client";

import { useEffect, useState } from "react";
import BotonInteres from "@/components/BotonInteres";
import { listarAnimales, type AnimalResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { Search, SlidersHorizontal, MapPin, PawPrint, X } from "lucide-react";

// Pins mock posicionados en % del contenedor — se actualizan cuando haya coordenadas reales
const PIN_POSITIONS: Record<string, { x: number; y: number }> = {};
let pinCounter = 0;
function getPinPosition(id: string) {
  if (!PIN_POSITIONS[id]) {
    // Distribuir pins de forma pseudo-aleatoria pero estable por ID
    const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    PIN_POSITIONS[id] = {
      x: 20 + (hash % 60),
      y: 20 + ((hash * 7) % 55),
    };
  }
  return PIN_POSITIONS[id];
}

function calcularEdad(fechaNacimiento: string): number {
  const nac = new Date(fechaNacimiento);
  const hoy = new Date();
  return hoy.getFullYear() - nac.getFullYear();
}

/** Pagina de exploracion de mascotas. Ruta protegida: /explorar */
export default function ExplorarPage() {
  const [animales, setAnimales] = useState<AnimalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("TODOS");
  const [filtroSexo, setFiltroSexo] = useState("TODOS");
  const [filtroEstatus, setFiltroEstatus] = useState("DISPONIBLE");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const stored = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}")
    : {};
  const rolUsuario: string | undefined = stored.rol;

  useEffect(() => {
    async function fetchAnimales() {
      const token = getToken() ?? undefined;
      const result = await listarAnimales(token);
      if (result.ok) {
        setAnimales(result.data);
      } else {
        setError("No se pudieron cargar los animales.");
      }
      setLoading(false);
    }
    fetchAnimales();
  }, []);

  const filtrados = animales.filter((a) => {
    const matchBusqueda =
      a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (a.raza ?? "").toLowerCase().includes(busqueda.toLowerCase());
    const matchEspecie = filtroEspecie === "TODOS" ||
      a.especie.toUpperCase() === filtroEspecie;
    const matchSexo = filtroSexo === "TODOS" || a.sexo === filtroSexo;
    const matchEstatus = filtroEstatus === "TODOS" || a.estatus === filtroEstatus;
    return matchBusqueda && matchEspecie && matchSexo && matchEstatus;
  });

  const selected = selectedId ? animales.find((a) => a.id === selectedId) : null;

  const emoji = (especie: string) =>
    especie.toLowerCase().includes("gato") || especie.toLowerCase().includes("cat")
      ? "🐱" : "🐶";

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-base-200">

      {/* PANEL IZQUIERDO */}
      <div className="w-full lg:w-[420px] flex flex-col bg-base-100 shadow-xl z-10 overflow-hidden">

        {/* Barra de busqueda y filtros */}
        <div className="p-4 border-b border-base-200 flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <Search size={16} className="text-base-content/40" />
              <input
                type="text"
                placeholder="Buscar por nombre o raza..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="grow"
              />
              {busqueda && (
                <button onClick={() => setBusqueda("")}>
                  <X size={14} className="text-base-content/40" />
                </button>
              )}
            </label>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`btn btn-square btn-outline ${filtersOpen ? "btn-primary" : ""}`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {filtersOpen && (
            <div className="grid grid-cols-3 gap-2">
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Especie</span></label>
                <select className="select select-bordered select-sm" value={filtroEspecie} onChange={(e) => setFiltroEspecie(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  <option value="PERRO">Perro</option>
                  <option value="GATO">Gato</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Sexo</span></label>
                <select className="select select-bordered select-sm" value={filtroSexo} onChange={(e) => setFiltroSexo(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  <option value="MACHO">Macho</option>
                  <option value="HEMBRA">Hembra</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Estatus</span></label>
                <select className="select select-bordered select-sm" value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="ADOPTADO">Adoptado</option>
                </select>
              </div>
            </div>
          )}

          <p className="text-xs text-base-content/50">
            {loading ? "Cargando..." : `${filtrados.length} mascota${filtrados.length !== 1 ? "s" : ""} encontrada${filtrados.length !== 1 ? "s" : ""}`}
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
            </div>
          ) : (
            filtrados.map((animal) => (
              <button
                key={animal.id}
                onClick={() => setSelectedId(animal.id === selectedId ? null : animal.id)}
                className={`w-full text-left flex gap-4 p-4 border-b border-base-200 transition hover:bg-base-200 ${
                  selectedId === animal.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="w-16 h-16 rounded-box bg-base-300 flex items-center justify-center text-3xl shrink-0">
                  {emoji(animal.especie)}
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
                    {calcularEdad(animal.fechaNacimiento)} {calcularEdad(animal.fechaNacimiento) === 1 ? "ano" : "anos"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detalle de mascota seleccionada */}
        {selected && (
          <div className="border-t border-base-200 p-4 bg-base-100 shadow-inner">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{selected.nombre}</h3>
                <p className="text-sm text-base-content/60">
                  {selected.especie}{selected.raza ? ` · ${selected.raza}` : ""} · {calcularEdad(selected.fechaNacimiento)} anos
                </p>
                <p className="text-xs text-base-content/50 mt-1 line-clamp-2">{selected.descripcion}</p>
              </div>
              <button onClick={() => setSelectedId(null)} className="btn btn-ghost btn-xs btn-square">
                <X size={14} />
              </button>
            </div>
            <BotonInteres
              animalId={selected.id}
              tieneInteres={false}
              estatus={selected.estatus}
              rolUsuario={rolUsuario}
            />
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

        {/* Pins de animales reales */}
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

    </div>
  );
}
