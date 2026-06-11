"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listarIntereses, eliminarInteres, type AnimalInteresResponse, type AnimalResponse } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import ErrorMessage from "@/components/ErrorMessage";
import AnimalCard from "@/components/AnimalCard";
import { Heart, PawPrint } from "lucide-react";

/** Convierte AnimalInteresResponse al shape de AnimalResponse para usar AnimalCard.Compact */
function toAnimalResponse(a: AnimalInteresResponse): AnimalResponse {
  return {
    id: a.animalId,
    nombre: a.nombre,
    especie: a.especie,
    raza: a.raza,
    razaId: null,
    fechaNacimiento: a.fechaNacimiento,
    sexo: a.sexo,
    descripcion: a.descripcion,
    estatus: a.estatus,
    esterilizado: a.esterilizado,
    usuarioId: "",
    fechaRegistro: a.fechaRegistro ?? "",
    fotoPortada: a.fotoPortada,
    numInteresados: 0,
    latitud: null,
    longitud: null,
    cuidadorUsername: null,
    cuidadorFoto: null,
  };
}

export default function FavoritosPage() {
  const router = useRouter();
  const [animales, setAnimales] = useState<AnimalInteresResponse[]>([]);
  const [interesIds, setInteresIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rolUsuario = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}").rol as string | undefined
    : undefined;

  useEffect(() => {
    const token = getToken();
    if (!token) { router.replace(ROUTES.LOGIN); return; }
    listarIntereses(token).then((res) => {
      if (!res.ok) setError(res.error);
      else {
        const sorted = res.data.sort((a, b) => new Date(b.fechaInteres).getTime() - new Date(a.fechaInteres).getTime());
        setAnimales(sorted);
        setInteresIds(new Set(sorted.map((a) => a.animalId)));
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-primary mb-6">
          <Heart size={28} />
          Mis favoritos
        </h1>

        <ErrorMessage message={error} />

        {animales.length === 0 ? (
          <div className="text-center py-16 text-base-content/60">
            <PawPrint size={64} className="mx-auto mb-4 opacity-40" />
            <p className="mt-4 text-lg">Aún no tienes animales favoritos.</p>
            <button onClick={() => router.push(ROUTES.EXPLORAR)} className="btn btn-primary mt-6">
              Explorar animales
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {animales.map((animal) => (
              <div key={animal.animalId} className="flex flex-col gap-1">
                <AnimalCard.Compact
                  animal={toAnimalResponse(animal)}
                  rolUsuario={rolUsuario}
                  tieneInteres={interesIds.has(animal.animalId)}
                  allowRemove={true}
                  onInteresChange={(id, tiene) => {
                    if (!tiene) {
                      setAnimales((prev) => prev.filter((a) => a.animalId !== id));
                      setInteresIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
                    }
                  }}
                />
                {/* Fecha de interes debajo de la tarjeta */}
                <p className="text-xs text-base-content/40 text-center">
                  Me interesa desde: {new Date(animal.fechaInteres).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
