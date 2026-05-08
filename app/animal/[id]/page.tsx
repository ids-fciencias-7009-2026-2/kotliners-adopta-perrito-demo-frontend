"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { obtenerAnimal, type AnimalResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { useRouteGuard } from "@/hooks/useRouteGuard";

/**
 * Vista de detalle de un animal especifico.
 */
export default function AnimalDetailPage() {
  const checking = useRouteGuard();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [animal, setAnimal] = useState<AnimalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchAnimal() {
      const token = getToken() ?? undefined;
      const result = await obtenerAnimal(id, token);
      if (result.ok) {
        setAnimal(result.data);
      } else {
        setError("No se pudo cargar la informacion del animal.");
      }
      setLoading(false);
    }
    fetchAnimal();
  }, [id]);

  if (checking || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !animal) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-error text-lg">{error ?? "Animal no encontrado."}</p>
        <button className="btn btn-primary" onClick={() => router.push(ROUTES.HOME)}>
          Volver al catalogo
        </button>
      </main>
    );
  }

  const esGato =
    animal.especie.toLowerCase().includes("gato") ||
    animal.especie.toLowerCase().includes("cat");
  const emoji = esGato ? "🐱" : "🐶";
  const nacimiento = new Date(animal.fechaNacimiento);
  const edad = new Date().getFullYear() - nacimiento.getFullYear();
  const esAdoptado = animal.estatus === "ADOPTADO";

  return (
    <main className="min-h-screen bg-base-200 px-4 py-12">
      <div className="max-w-2xl mx-auto bg-base-100 rounded-box shadow-xl overflow-hidden">

        <div className="h-56 bg-base-300 flex items-center justify-center text-8xl relative">
          {emoji}
          {esAdoptado && (
            <span className="absolute top-4 right-4 badge badge-neutral badge-lg">
              Adoptado
            </span>
          )}
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-primary mb-2">{animal.nombre}</h1>
          <p className="text-base-content/60 mb-6">
            {animal.especie}{animal.raza ? ` · ${animal.raza}` : ""} · {edad} {edad === 1 ? "ano" : "anos"} · {animal.sexo === "MACHO" ? "Macho" : "Hembra"}
          </p>

          <div className="divider" />

          <p className="text-base-content/80 leading-relaxed mb-6">{animal.descripcion}</p>

          <div className="flex flex-wrap gap-2 mb-8">
            <span className="badge badge-outline">
              {animal.esterilizado ? "Esterilizado" : "Sin esterilizar"}
            </span>
            <span className={`badge ${esAdoptado ? "badge-neutral" : "badge-success"}`}>
              {esAdoptado ? "Adoptado" : "Disponible"}
            </span>
          </div>

          <button
            className="btn btn-outline w-full"
            onClick={() => router.push(ROUTES.HOME)}
          >
            Volver al catalogo
          </button>
        </div>
      </div>
    </main>
  );
}