"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Plus, PawPrint, X, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import AnimalCard from "@/components/AnimalCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { eliminarAnimal, listarMisAnimales, listarHistorialAdoptados, type AnimalResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";

type CriterioOrden = "nombre" | "edad" | "fechaRegistro" | "interesados";

function calcularEdadMeses(fechaNacimiento: string): number {
  const [y, m, d] = fechaNacimiento.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const hoy = new Date();
  return (hoy.getFullYear() - y) * 12 + (hoy.getMonth() + 1 - m);
}

export default function MisMascotasPage() {
  const [mascotas, setMascotas] = useState<AnimalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("TODOS");
  const [filtroSexo, setFiltroSexo] = useState("TODOS");
  const [filtroEsterilizado, setFiltroEsterilizado] = useState("TODOS");
  const [criterio, setCriterio] = useState<CriterioOrden>("fechaRegistro");
  const [ordenDesc, setOrdenDesc] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [historialAdoptados, setHistorialAdoptados] = useState<AnimalResponse[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const rol = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").rol as string | undefined
    : undefined;
  const userId: string | undefined = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").id as string | undefined
    : undefined;

  useEffect(() => {
    async function cargarDatos() {
      const token = getToken();
      if (!token) return;
      const res = await listarMisAnimales(token);
      if (res.ok) setMascotas(res.data.filter((m) => m.estatus === "DISPONIBLE"));
      else if (res.error !== "SESSION_EXPIRED") setError(res.error);
      setLoading(false);
      setLoadingHistorial(true);
      const resHistorial = await listarHistorialAdoptados(token);
      if (resHistorial.ok) setHistorialAdoptados(resHistorial.data);
      setLoadingHistorial(false);
    }
    cargarDatos();
  }, []);

  function removeMascotaFromList(id: string) {
    setMascotas((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMascotaInList(updatedAnimal: AnimalResponse) {
    if (updatedAnimal.estatus === "ADOPTADO") {
      // Preservar la foto del animal original
      const original = mascotas.find((m) => m.id === updatedAnimal.id);
      const conFoto = { ...updatedAnimal, fotoPortada: updatedAnimal.fotoPortada || original?.fotoPortada || null };
      setMascotas((prev) => prev.filter((m) => m.id !== updatedAnimal.id));
      setHistorialAdoptados((prev) => [conFoto, ...prev]);
    } else {
      const original = historialAdoptados.find((m) => m.id === updatedAnimal.id);
      const conFoto = { ...updatedAnimal, fotoPortada: updatedAnimal.fotoPortada || original?.fotoPortada || null };
      setMascotas((prev) => prev.map((m) => (m.id === updatedAnimal.id ? conFoto : m)));
    }
  }

  async function confirmDeleteAnimal() {
    if (!pendingDeleteId) return;
    const token = getToken();
    if (!token) { setPendingDeleteId(null); return; }
    setDeleting(true);
    const result = await eliminarAnimal(token, { animalId: pendingDeleteId });
    setDeleting(false);
    if (result.ok) { removeMascotaFromList(pendingDeleteId); setPendingDeleteId(null); }
    else setError("No se pudo eliminar la mascota.");
  }

  const filtradas = mascotas
    .filter((m) => {
      const matchBusqueda =
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (m.raza ?? "").toLowerCase().includes(busqueda.toLowerCase());
      const matchEspecie = filtroEspecie === "TODOS" || m.especie.toUpperCase() === filtroEspecie;
      const matchSexo = filtroSexo === "TODOS" || m.sexo === filtroSexo;
      const matchEsterilizado = filtroEsterilizado === "TODOS" ||
        (filtroEsterilizado === "SI" ? m.esterilizado : !m.esterilizado);
      return matchBusqueda && matchEspecie && matchSexo && matchEsterilizado;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (criterio === "nombre") cmp = a.nombre.localeCompare(b.nombre);
      else if (criterio === "edad") cmp = calcularEdadMeses(a.fechaNacimiento) - calcularEdadMeses(b.fechaNacimiento);
      else if (criterio === "fechaRegistro") cmp = new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime();
      else if (criterio === "interesados") cmp = (a.numInteresados ?? 0) - (b.numInteresados ?? 0);
      return ordenDesc ? -cmp : cmp;
    });

  const disponibles = mascotas.length;
  const adoptados = historialAdoptados.length;
  const hayFiltros = filtroEspecie !== "TODOS" || filtroSexo !== "TODOS" || filtroEsterilizado !== "TODOS";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-screen-xl mx-auto">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <PawPrint size={30} /> Mis mascotas
            </h1>
            <p className="text-base-content/60 text-sm mt-1">
              {disponibles} disponible{disponibles !== 1 ? "s" : ""} · {adoptados} adoptada{adoptados !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/publicar" className="btn btn-primary gap-2">
            <Plus size={18} /> Agregar mascota
          </Link>
        </div>

        {error && <div role="alert" className="alert alert-error mb-4"><span>{error}</span></div>}

        {/* Barra de busqueda y filtros */}
        <div className="bg-base-100 rounded-box shadow p-4 mb-6 flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <Search size={16} className="text-base-content/40" />
              <input type="text" placeholder="Buscar por nombre o raza..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="grow" />
              {busqueda && (
                <button onClick={() => setBusqueda("")}>
                  <X size={14} className="text-base-content/40" />
                </button>
              )}
            </label>
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`btn btn-square btn-outline ${filtersOpen || hayFiltros ? "btn-primary" : ""}`}>
              <SlidersHorizontal size={18} />
            </button>
          </div>

          {filtersOpen && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Especie</span></label>
                <select className="select select-bordered select-sm" value={filtroEspecie}
                  onChange={(e) => setFiltroEspecie(e.target.value)}>
                  <option value="TODOS">Todas</option>
                  <option value="PERRO">Perro</option>
                  <option value="GATO">Gato</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Sexo</span></label>
                <select className="select select-bordered select-sm" value={filtroSexo}
                  onChange={(e) => setFiltroSexo(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  <option value="MACHO">Macho</option>
                  <option value="HEMBRA">Hembra</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Esterilizado</span></label>
                <select className="select select-bordered select-sm" value={filtroEsterilizado}
                  onChange={(e) => setFiltroEsterilizado(e.target.value)}>
                  <option value="TODOS">Todos</option>
                  <option value="SI">Si</option>
                  <option value="NO">No</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label py-0"><span className="label-text text-xs">Ordenar por</span></label>
                <div className="flex gap-1">
                  <select className="select select-bordered select-sm flex-1" value={criterio}
                    onChange={(e) => setCriterio(e.target.value as CriterioOrden)}>
                    <option value="fechaRegistro">Más reciente</option>
                    <option value="nombre">Nombre</option>
                    <option value="edad">Edad</option>
                    <option value="interesados">Interesados</option>
                  </select>
                  <button type="button"
                    title={ordenDesc ? "Cambiar a ascendente" : "Cambiar a descendente"}
                    onClick={() => setOrdenDesc((v) => !v)}
                    className="btn btn-sm btn-square btn-outline">
                    <ArrowUpDown size={14} className={ordenDesc ? "text-primary" : "text-base-content/40"} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-base-content/50">
            {filtradas.length} mascota{filtradas.length !== 1 ? "s" : ""}
            {hayFiltros ? " (con filtros)" : ""}
          </p>
        </div>

        {/* Grid de tarjetas */}
        {filtradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-base-content/30">
            <PawPrint size={56} />
            <p>{mascotas.length === 0 ? "Aún no tienes mascotas registradas." : "No hay mascotas con esos filtros."}</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtradas.map((m) => (
              <AnimalCard.Compact
                key={m.id}
                animal={m}
                rolUsuario={rol}
                userId={userId}
                onDeleted={removeMascotaFromList}
                onUpdated={updateMascotaInList}
                actions={{ onDelete: (id) => setPendingDeleteId(id) }}
              />
            ))}
          </div>
        )}

        {/* Historial de adoptados */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Historial de adoptados</h2>
          {loadingHistorial ? (
            <p className="text-base-content/40">Cargando...</p>
          ) : historialAdoptados.length === 0 ? (
            <p className="text-base-content/40">Aún no tienes animales marcados como adoptados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {historialAdoptados.map((animal) => (
                <AnimalCard.Compact
                  key={animal.id}
                  animal={animal}
                  rolUsuario={rol}
                  userId={userId}
                  onUpdated={(updated) => {
                    if (updated.estatus === "DISPONIBLE") {
                      setHistorialAdoptados((prev) => prev.filter((a) => a.id !== updated.id));
                      setMascotas((prev) => [...prev, updated]);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Eliminar mascota"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={confirmDeleteAnimal}
      />
    </main>
  );
}
