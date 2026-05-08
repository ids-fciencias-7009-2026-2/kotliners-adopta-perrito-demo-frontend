"use client";

import { useState } from "react";
import { Pencil, Trash2, CheckCircle, Search, SlidersHorizontal, Plus, PawPrint, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Datos mock — reemplazar con GET /api/animales/me cuando este disponible
// ---------------------------------------------------------------------------
const mockMascotas = [
  { id: "m1", nombre: "Luna", especie: "Gato", raza: "Siames", edad: 2, sexo: "HEMBRA", estatus: "DISPONIBLE", esterilizado: true, image: "🐱" },
  { id: "m2", nombre: "Max", especie: "Perro", raza: "Labrador", edad: 3, sexo: "MACHO", estatus: "DISPONIBLE", esterilizado: false, image: "🐶" },
  { id: "m3", nombre: "Mochi", especie: "Gato", raza: "Persa", edad: 1, sexo: "HEMBRA", estatus: "ADOPTADO", esterilizado: true, image: "🐱" },
  { id: "m4", nombre: "Rocky", especie: "Perro", raza: "Bulldog", edad: 4, sexo: "MACHO", estatus: "DISPONIBLE", esterilizado: false, image: "🐶" },
];

type Mascota = typeof mockMascotas[0];

type Orden = "nombre-asc" | "nombre-desc" | "edad-asc" | "edad-desc";

/** Pagina de gestion de mascotas del cuidador. Ruta protegida: /mis-mascotas */
export default function MisMascotasPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>(mockMascotas);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("TODOS");
  const [filtroEstatus, setFiltroEstatus] = useState("TODOS");
  const [filtroSexo, setFiltroSexo] = useState("TODOS");
  const [orden, setOrden] = useState<Orden>("nombre-asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtrar
  const filtradas = mascotas
    .filter((m) => {
      const matchBusqueda = m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.raza.toLowerCase().includes(busqueda.toLowerCase());
      const matchEspecie = filtroEspecie === "TODOS" || m.especie.toUpperCase() === filtroEspecie;
      const matchEstatus = filtroEstatus === "TODOS" || m.estatus === filtroEstatus;
      const matchSexo = filtroSexo === "TODOS" || m.sexo === filtroSexo;
      return matchBusqueda && matchEspecie && matchEstatus && matchSexo;
    })
    .sort((a, b) => {
      if (orden === "nombre-asc") return a.nombre.localeCompare(b.nombre);
      if (orden === "nombre-desc") return b.nombre.localeCompare(a.nombre);
      if (orden === "edad-asc") return a.edad - b.edad;
      if (orden === "edad-desc") return b.edad - a.edad;
      return 0;
    });

  /** Marca/desmarca una mascota como adoptada (mock — sin backend aun) */
  function toggleAdoptado(id: string) {
    setMascotas((prev) =>
      prev.map((m) => m.id === id
        ? { ...m, estatus: m.estatus === "ADOPTADO" ? "DISPONIBLE" : "ADOPTADO" }
        : m
      )
    );
  }

  /** Elimina una mascota de la lista (mock — sin backend aun) */
  function eliminar(id: string) {
    setMascotas((prev) => prev.filter((m) => m.id !== id));
    setConfirmDeleteId(null);
  }

  const disponibles = mascotas.filter((m) => m.estatus === "DISPONIBLE").length;
  const adoptados = mascotas.filter((m) => m.estatus === "ADOPTADO").length;

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-screen-xl mx-auto">

        {/* Encabezado */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <PawPrint size={30} />
              Mis mascotas
            </h1>
            <p className="text-base-content/60 text-sm mt-1">
              {disponibles} disponible{disponibles !== 1 ? "s" : ""} · {adoptados} adoptada{adoptados !== 1 ? "s" : ""}
            </p>
          </div>
          {/* TODO: habilitar cuando este disponible POST /api/animales */}
          <button className="btn btn-primary gap-2" disabled title="Proximamente">
            <Plus size={18} />
            Agregar mascota
          </button>
        </div>

        {/* Barra de busqueda y filtros */}
        <div className="bg-base-100 rounded-box shadow p-4 mb-6 flex flex-col gap-3">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Especie</span></label>
                <select className="select select-bordered select-sm" value={filtroEspecie} onChange={(e) => setFiltroEspecie(e.target.value)}>
                  <option value="TODOS">Todas</option>
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
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Ordenar por</span></label>
                <select className="select select-bordered select-sm" value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
                  <option value="nombre-asc">Nombre A-Z</option>
                  <option value="nombre-desc">Nombre Z-A</option>
                  <option value="edad-asc">Mas jovenes</option>
                  <option value="edad-desc">Mas mayores</option>
                </select>
              </div>
            </div>
          )}

          <p className="text-xs text-base-content/50">
            {filtradas.length} mascota{filtradas.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Grid de tarjetas */}
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/30">
            <PawPrint size={56} />
            <p>No hay mascotas con esos filtros.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtradas.map((m) => {
              const esAdoptado = m.estatus === "ADOPTADO";
              return (
                <div
                  key={m.id}
                  className={`rounded-box overflow-hidden shadow-xl transition-all duration-300 ${
                    esAdoptado
                      ? "bg-base-200 opacity-60 grayscale"
                      : "bg-base-100 hover:-translate-y-1 hover:shadow-primary/40"
                  }`}
                >
                  {/* Imagen */}
                  <div className="h-44 bg-base-300 flex items-center justify-center text-5xl relative">
                    {m.image}
                    <span className={`absolute top-2 right-2 badge badge-sm ${esAdoptado ? "badge-neutral" : "badge-success"}`}>
                      {esAdoptado ? "Adoptado" : "Disponible"}
                    </span>
                    {m.esterilizado && (
                      <span className="absolute top-2 left-2 badge badge-sm badge-info">Esterilizado</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{m.nombre}</h3>
                    <p className="text-sm text-base-content/60 mt-0.5">
                      {m.especie} · {m.raza} · {m.sexo === "MACHO" ? "Macho" : "Hembra"}
                    </p>
                    <p className="text-xs text-base-content/40 mt-0.5">
                      {m.edad} {m.edad === 1 ? "ano" : "anos"}
                    </p>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {!esAdoptado && (
                        <button
                          className="btn btn-sm btn-outline gap-1"
                          disabled
                          title="Proximamente"
                        >
                          <Pencil size={13} /> Editar
                        </button>
                      )}
                      <button
                        onClick={() => toggleAdoptado(m.id)}
                        className={`btn btn-sm gap-1 ${esAdoptado ? "btn-outline" : "btn-success"}`}
                      >
                        <CheckCircle size={13} />
                        {esAdoptado ? "Desmarcar" : "Adoptado"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(m.id)}
                        className="btn btn-sm btn-error btn-outline gap-1"
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmacion de eliminacion */}
      {confirmDeleteId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmar eliminacion</h3>
            <p className="py-4 text-base-content/70">
              Esta accion no se puede deshacer. La mascota sera eliminada permanentemente.
            </p>
            <div className="modal-action">
              <button onClick={() => setConfirmDeleteId(null)} className="btn btn-ghost">
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmDeleteId)} className="btn btn-error">
                Eliminar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setConfirmDeleteId(null)} />
        </div>
      )}
    </main>
  );
}
