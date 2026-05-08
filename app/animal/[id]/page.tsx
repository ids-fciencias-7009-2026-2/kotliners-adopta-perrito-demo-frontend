"use client";

import { useParams, useRouter } from "next/navigation";
import AnimalCard from "@/components/AnimalCard";
import { useAnimalDetalle } from "@/hooks/useAnimalData";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft } from "lucide-react";
import { getToken } from "@/lib/session";

/** Pagina de detalle de un animal. Ruta protegida: /animal/[id] */
export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { animal, tieneInteres, loading, error, rol } = useAnimalDetalle(id);

  const stored = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("usuario") || "{}")
    : {};
  const userId: string | undefined = stored.id;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  async function handleDelete(animalId: string) {
    const token = getToken();
    if (!token || !window.confirm("Eliminar esta mascota permanentemente?")) return;
    const res = await fetch(`${BASE_URL}/api/animales`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ animalId }),
    });
    if (res.ok) router.push(ROUTES.MIS_MASCOTAS);
  }

  const actions = {
    onDelete: handleDelete,
    onEdit: () => router.push(`${ROUTES.PUBLICAR}?edit=${id}`), // TODO: form de edicion
    onToggleAdoptado: () => {}, // TODO: endpoint de cambio de estatus
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  if (error || !animal) return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-error text-lg">{error ?? "Animal no encontrado."}</p>
      <button className="btn btn-primary" onClick={() => router.push(ROUTES.HOME)}>
        Volver al catalogo
      </button>
    </main>
  );

  return (
    <main className="min-h-screen bg-base-200 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm gap-1 mb-4">
          <ArrowLeft size={16} /> Volver
        </button>
        <AnimalCard.Detail
          animal={animal}
          rolUsuario={rol}
          userId={userId}
          tieneInteres={tieneInteres}
          actions={actions}
        />
      </div>
    </main>
  );
}
