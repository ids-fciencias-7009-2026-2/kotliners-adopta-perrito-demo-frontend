"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listarIntereses, eliminarInteres, AnimalInteresResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import ErrorMessage from "@/components/ErrorMessage";
import { Heart, PawPrint, Trash2 } from "lucide-react";

/**
 * Vista "Mis favoritos" — muestra los animales en los que el usuario autenticado
 * ha manifestado interes. Permite eliminar el interes desde esta vista.
 * Ruta: /favoritos (protegida)
 */
export default function FavoritosPage() {
  const router = useRouter();
  const [animales, setAnimales] = useState<AnimalInteresResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace(ROUTES.LOGIN); return; }

    listarIntereses(token).then((res) => {
      if (!res.ok) {
        if (res.error === "SESSION_EXPIRED") { router.replace(ROUTES.LOGIN); return; }
        setError(res.error);
      } else {
        setAnimales(res.data);
      }
      setLoading(false);
    });
  }, [router]);

  async function handleEliminar(animalId: string) {
    const token = getToken();
    if (!token) { router.replace(ROUTES.LOGIN); return; }

    setRemovingId(animalId);
    const res = await eliminarInteres(token, animalId);
    if (res.ok) {
      setAnimales((prev) => prev.filter((a) => a.animalId !== animalId));
    } else {
      setError(res.error);
    }
    setRemovingId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

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
            <button
              onClick={() => router.push(ROUTES.HOME)}
              className="btn btn-primary mt-6"
            >
              Explorar animales
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {animales.map((animal) => (
              <div key={animal.animalId} className="card card-compact bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">{animal.nombre}</h2>
                  <p className="text-sm text-base-content/70">
                    {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""}
                  </p>
                  <p className="text-sm">{animal.descripcion}</p>
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
                  <div className="card-actions justify-end mt-4">
                    <button
                      onClick={() => handleEliminar(animal.animalId)}
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
    </main>
  );
}
