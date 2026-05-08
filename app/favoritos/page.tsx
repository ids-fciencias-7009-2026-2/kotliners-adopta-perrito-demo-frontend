"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listarIntereses, eliminarInteres, type AnimalInteresResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import ErrorMessage from "@/components/ErrorMessage";
import AnimalCard from "@/components/AnimalCard";
import { Heart, PawPrint, Trash2, Expand } from "lucide-react";

export default function FavoritosPage() {
  const router = useRouter();
  const [animales, setAnimales] = useState<AnimalInteresResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);

  const rolUsuario = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").rol as string | undefined
    : undefined;

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace(ROUTES.LOGIN); return; }
    listarIntereses(token).then((res) => {
      if (!res.ok) setError(res.error);
      else setAnimales(res.data);
      setLoading(false);
    });
  }, [router]);

  async function handleEliminar(animalId: string, nombre: string) {
    const token = getToken();
    if (!token) { router.replace(ROUTES.LOGIN); return; }
    if (!window.confirm(`Quitar a ${nombre} de tus favoritos?`)) return;
    setRemovingId(animalId);
    const res = await eliminarInteres(token, animalId);
    if (res.ok || res.error.toLowerCase().includes("no encontrado")) {
      setAnimales((prev) => prev.filter((a) => a.animalId !== animalId));
    } else {
      setError(res.error);
    }
    setRemovingId(null);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-primary mb-6">
          <Heart size={28} />
          Mis favoritos
        </h1>

        <ErrorMessage message={error} />

        {animales.length === 0 ? (
          <div className="text-center py-16 text-base-content/60">
            <PawPrint size={64} className="mx-auto mb-4 opacity-40" />
            <p className="mt-4 text-lg">Aun no tienes animales favoritos.</p>
            <button onClick={() => router.push(ROUTES.EXPLORAR)} className="btn btn-primary mt-6">
              Explorar animales
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {animales.map((animal) => (
              <div key={animal.animalId} className="card card-compact bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title">{animal.nombre}</h2>
                    {/* Boton expandir */}
                    <button
                      onClick={() => setModalId(animal.animalId)}
                      className="btn btn-ghost btn-xs btn-square"
                      title="Ver detalle completo"
                    >
                      <Expand size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-base-content/70">
                    {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""}
                  </p>
                  <p className="text-sm line-clamp-2">{animal.descripcion}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="badge badge-outline">{animal.sexo}</span>
                    <span className={`badge ${animal.estatus === "DISPONIBLE" ? "badge-success" : "badge-warning"}`}>
                      {animal.estatus}
                    </span>
                    {animal.esterilizado && <span className="badge badge-info">Esterilizado</span>}
                  </div>
                  <p className="text-xs text-base-content/50 mt-2">
                    Interes registrado: {new Date(animal.fechaInteres).toLocaleDateString("es-MX")}
                  </p>
                  <div className="card-actions justify-end mt-2">
                    <button
                      onClick={() => handleEliminar(animal.animalId, animal.nombre)}
                      disabled={removingId === animal.animalId}
                      className="btn btn-error btn-sm gap-1"
                    >
                      {removingId === animal.animalId
                        ? <span className="loading loading-spinner loading-xs" />
                        : <><Trash2 size={16} /> Quitar</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {modalId && (
        <AnimalCard.DetailModal
          animalId={modalId}
          rolUsuario={rolUsuario}
          onClose={() => setModalId(null)}
        />
      )}
    </main>
  );
}
