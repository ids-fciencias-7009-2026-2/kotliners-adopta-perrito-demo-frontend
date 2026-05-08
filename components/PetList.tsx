"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";
import PetCard from "./PetCard";
import { Animal, listarAnimales } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { PawPrint } from "lucide-react";

export default function PetList() {
  const router = useRouter();
  const [pets, setPets] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    listarAnimales(token).then((res) => {
      if (res.ok) {
        setPets(res.data);
      } else {
        setError(res.error);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-box bg-base-100 px-6 py-12 text-center shadow">
        <PawPrint size={56} className="mb-4 text-base-content/30" />
        <p className="text-lg font-semibold">No hay animales disponibles.</p>
        <p className="mt-2 text-sm text-base-content/60">
          Cuando el backend registre animales, apareceran aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}
