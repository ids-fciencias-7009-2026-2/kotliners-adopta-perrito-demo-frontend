"use client";

import { useState } from "react";
import BotonInteres from "@/components/BotonInteres";
import { Search, SlidersHorizontal, MapPin, PawPrint, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Datos mock — reemplazar con GET /api/animales cuando este disponible
// ---------------------------------------------------------------------------
const mockPets = [
  { id: "a1", name: "Luna", type: "Gato", breed: "Siames", age: 2, zip: "04510", image: "🐱", estatus: "DISPONIBLE", sexo: "HEMBRA" },
  { id: "a2", name: "Max", type: "Perro", breed: "Labrador", age: 3, zip: "01000", image: "🐶", estatus: "DISPONIBLE", sexo: "MACHO" },
  { id: "a3", name: "Mochi", type: "Gato", breed: "Persa", age: 1, zip: "06600", image: "🐱", estatus: "DISPONIBLE", sexo: "HEMBRA" },
  { id: "a4", name: "Rocky", type: "Perro", breed: "Bulldog", age: 4, zip: "03100", image: "🐶", estatus: "ADOPTADO", sexo: "MACHO" },
  { id: "a5", name: "Nala", type: "Perro", breed: "Golden", age: 2, zip: "04510", image: "🐶", estatus: "DISPONIBLE", sexo: "HEMBRA" },
  { id: "a6", name: "Kira", type: "Gato", breed: "Angora", age: 3, zip: "11800", image: "🐱", estatus: "DISPONIBLE", sexo: "HEMBRA" },
];

// Pins mock para el mapa — coordenadas aproximadas de CDMX
const mockPins = [
  { id: "a1", x: 38, y: 55, name: "Luna" },
  { id: "a2", x: 52, y: 42, name: "Max" },
  { id: "a3", x: 45, y: 60, name: "Mochi" },
  { id: "a4", x: 60, y: 48, name: "Rocky" },
  { id: "a5", x: 35, y: 65, name: "Nala" },
  { id: "a6", x: 55, y: 35, name: "Kira" },
];

/** Pagina de exploracion de mascotas. Ruta protegida: /explorar */
export default function ExplorarPage() {
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

  const filtrados = mockPets.filter((p) => {
    const matchBusqueda = p.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.breed.toLowerCase().includes(busqueda.toLowerCase());
    const matchEspecie = filtroEspecie === "TODOS" || p.type.toUpperCase() === filtroEspecie;
    const matchSexo = filtroSexo === "TODOS" || p.sexo === filtroSexo;
    const matchEstatus = filtroEstatus === "TODOS" || p.estatus === filtroEstatus;
    return matchBusqueda && matchEspecie && matchSexo && matchEstatus;
  });

  const selected = selectedId ? mockPets.find((p) => p.id === selectedId) : null;

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

          {/* Filtros expandibles */}
          {filtersOpen && (
            <div className="grid grid-cols-3 gap-2">
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Especie</span></label>
                <select
                  className="select select-bordered select-sm"
                  value={filtroEspecie}
                  onChange={(e) => setFiltroEspecie(e.target.value)}
                >
                  <option value="TODOS">Todos</option>
                  <option value="PERRO">Perro</option>
                  <option value="GATO">Gato</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Sexo</span></label>
                <select
                  className="select select-bordered select-sm"
                  value={filtroSexo}
                  onChange={(e) => setFiltroSexo(e.target.value)}
                >
                  <option value="TODOS">Todos</option>
                  <option value="MACHO">Macho</option>
                  <option value="HEMBRA">Hembra</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Estatus</span></label>
                <select
                  className="select select-bordered select-sm"
                  value={filtroEstatus}
                  onChange={(e) => setFiltroEstatus(e.target.value)}
                >
                  <option value="TODOS">Todos</option>
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="ADOPTADO">Adoptado</option>
                </select>
              </div>
            </div>
          )}

          <p className="text-xs text-base-content/50">
            {filtrados.length} mascota{filtrados.length !== 1 ? "s" : ""} encontrada{filtrados.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Lista scrolleable */}
        <div className="overflow-y-auto flex-1">
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/40 p-8">
              <PawPrint size={48} />
              <p className="text-center">No se encontraron mascotas con esos filtros.</p>
            </div>
          ) : (
            filtrados.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedId(pet.id === selectedId ? null : pet.id)}
                className={`w-full text-left flex gap-4 p-4 border-b border-base-200 transition hover:bg-base-200 ${
                  selectedId === pet.id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                }`}
              >
                {/* Imagen */}
                <div className="w-16 h-16 rounded-box bg-base-300 flex items-center justify-center text-3xl shrink-0">
                  {pet.image}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{pet.name}</span>
                    {pet.estatus === "ADOPTADO" && (
                      <span className="badge badge-neutral badge-sm">Adoptado</span>
                    )}
                  </div>
                  <p className="text-sm text-base-content/60 truncate">
                    {pet.type} · {pet.breed} · {pet.sexo === "MACHO" ? "Macho" : "Hembra"}
                  </p>
                  <p className="text-xs text-base-content/40 flex items-center gap-1 mt-1">
                    <MapPin size={11} /> CP {pet.zip}
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
                <h3 className="font-bold text-lg">{selected.name}</h3>
                <p className="text-sm text-base-content/60">
                  {selected.type} · {selected.breed} · {selected.age} {selected.age === 1 ? "ano" : "anos"}
                </p>
                <p className="text-xs text-base-content/40 flex items-center gap-1 mt-1">
                  <MapPin size={11} /> CP {selected.zip}
                </p>
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

        {/* Fondo tipo mapa */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, #888 0, #888 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #888 0, #888 1px, transparent 1px, transparent 40px)",
          }}
        />

        {/* Pins mock */}
        {mockPins.map((pin) => {
          const pet = mockPets.find((p) => p.id === pin.id);
          const isSelected = selectedId === pin.id;
          const isAdoptado = pet?.estatus === "ADOPTADO";
          return (
            <button
              key={pin.id}
              onClick={() => setSelectedId(pin.id === selectedId ? null : pin.id)}
              className="absolute transition-transform hover:scale-110"
              style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -100%)" }}
            >
              <div className={`flex flex-col items-center gap-0.5`}>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap ${
                  isSelected
                    ? "bg-primary text-primary-content scale-110"
                    : isAdoptado
                    ? "bg-neutral text-neutral-content"
                    : "bg-base-100 text-base-content border border-base-300"
                }`}>
                  {pin.name}
                </div>
                <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-primary" : isAdoptado ? "bg-neutral" : "bg-base-content/40"}`} />
              </div>
            </button>
          );
        })}

        {/* Label placeholder */}
        <div className="text-center text-base-content/30 select-none pointer-events-none">
          <MapPin size={48} className="mx-auto mb-2" />
          <p className="text-sm">Mapa interactivo proximamente</p>
        </div>
      </div>

    </div>
  );
}
