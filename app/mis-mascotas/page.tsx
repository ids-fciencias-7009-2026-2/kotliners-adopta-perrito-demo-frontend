"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, Plus, PawPrint, X } from "lucide-react";
import Link from "next/link";
import AnimalCard from "@/components/AnimalCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { eliminarAnimal, listarMisAnimales, type AnimalResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

type Orden = "nombre-asc" | "nombre-desc" | "edad-asc" | "edad-desc";

function calcularEdad(fechaNacimiento: string): string {
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
  if (meses === 0) return anos === 1 ? "1 ano" : `${anos} años`;
  return `${anos} ${anos === 1 ? "año" : "años"} y ${meses} ${meses === 1 ? "mes" : "meses"}`;
}

function calcularEdadMeses(fechaNacimiento: string): number {
  const [y, m, d] = fechaNacimiento.split("-").map(Number);
  if (!y || !m || !d) return 0;
  const hoy = new Date();
  return (hoy.getFullYear() - y) * 12 + (hoy.getMonth() + 1 - m);
}
export default function MisMascotasPage() {
  const router = useRouter();
  const [mascotas, setMascotas] = useState<AnimalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("TODOS");
  const [filtroEstatus, setFiltroEstatus] = useState("TODOS");
  const [filtroSexo, setFiltroSexo] = useState("TODOS");
  const [orden, setOrden] = useState<Orden>("nombre-asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rol = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").rol as string | undefined
    : undefined;
  const userId: string | undefined = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").id as string | undefined
    : undefined;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    listarMisAnimales(token).then((res) => {
      if (res.ok) {
        setMascotas(res.data);
      } else if (res.error !== "SESSION_EXPIRED") {
        // Solo mostrar error si no es un problema de sesion
        // Lista vacia no es un error
        setError(res.error);
      }
      setLoading(false);
    });
  }, []);

  function removeMascotaFromList(id: string) {
    setMascotas((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMascotaInList(updatedAnimal: AnimalResponse) {
    setMascotas((prev) => prev.map((m) => (m.id === updatedAnimal.id ? updatedAnimal : m)));
  }

  function handleDeleteAnimal(id: string) {
    setPendingDeleteId(id);
  }

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
      removeMascotaFromList(pendingDeleteId);
      setPendingDeleteId(null);
    } else {
      setError("No se pudo eliminar la mascota.");
    }
  }

  function handleEditAnimal(id: string) {
    router.push(`${ROUTES.PUBLICAR}?edit=${id}`);
  }

  const filtradas = mascotas
    .filter((m) => {
      const matchBusqueda =
        m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (m.raza ?? "").toLowerCase().includes(busqueda.toLowerCase());
      const matchEspecie = filtroEspecie === "TODOS" || m.especie.toUpperCase() === filtroEspecie;
      const matchEstatus = filtroEstatus === "TODOS" || m.estatus === filtroEstatus;
      const matchSexo = filtroSexo === "TODOS" || m.sexo === filtroSexo;
      return matchBusqueda && matchEspecie && matchEstatus && matchSexo;
    })
    .sort((a, b) => {
      if (orden === "nombre-asc") return a.nombre.localeCompare(b.nombre);
      if (orden === "nombre-desc") return b.nombre.localeCompare(a.nombre);
      if (orden === "edad-asc") return calcularEdadMeses(a.fechaNacimiento) - calcularEdadMeses(b.fechaNacimiento);
      if (orden === "edad-desc") return calcularEdadMeses(b.fechaNacimiento) - calcularEdadMeses(a.fechaNacimiento);
      return 0;
    });

  const disponibles = mascotas.filter((m) => m.estatus === "DISPONIBLE").length;
  const adoptados = mascotas.filter((m) => m.estatus === "ADOPTADO").length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

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
          <Link href="/publicar" className="btn btn-primary gap-2">
            <Plus size={18} />
            Agregar mascota
          </Link>
        </div>

        {error && <div role="alert" className="alert alert-error mb-4"><span>{error}</span></div>}

        {/* Barra de busqueda y filtros */}
        <div className="bg-base-100 rounded-box shadow p-4 mb-6 flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="input input-bordered flex items-center gap-2 flex-1">
              <Search size={16} className="text-base-content/40" />
              <input
                type="text"
                placeholder="Buscar por nombre"
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
            <p>{mascotas.length === 0 ? "Aun no tienes mascotas registradas." : "No hay mascotas con esos filtros."}</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtradas.map((m) => {
              return (
                <AnimalCard.Compact
                  key={m.id}
                  animal={m}
                  rolUsuario={rol}
                  userId={userId}
                  onDeleted={(id) => removeMascotaFromList(id)}
                  onUpdated={updateMascotaInList}
                  actions={{
                    //onEdit: handleEditAnimal,
                    onDelete: handleDeleteAnimal,
                  }}
                />
              );
            })}
          </div>
        )}
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
    </main>
  );
}
