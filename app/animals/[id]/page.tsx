"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BotonInteres from "@/components/BotonInteres";
import ErrorMessage from "@/components/ErrorMessage";
import { Animal, obtenerAnimalPorId } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ImageIcon,
  MapPin,
  PawPrint,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type StoredUser = {
  id?: string | number | null;
  rol?: string;
  username?: string;
};

function getParamId(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function getStoredUser(): StoredUser {
  if (typeof window === "undefined") return {};
  const raw = sessionStorage.getItem("usuario");
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return {};
  }
}

function isHttpImage(value: string | null): value is string {
  return !!value && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"));
}

function parseApiDate(value: string | null): Date | null {
  if (!value) return null;
  const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}$/) ? `${value}T00:00:00` : value;
  const date = new Date(dateOnly);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null): string {
  const date = parseApiDate(value);
  if (!date) return "No registrada";
  return date.toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
}

function formatAge(value: string | null): string {
  const birthDate = parseApiDate(value);
  if (!birthDate) return "No registrada";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayPending =
    today.getMonth() < birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (birthdayPending) age -= 1;

  if (age <= 0) return "Menos de 1 ano";
  return `${age} ${age === 1 ? "ano" : "anos"}`;
}

function statusClass(status: string | null): string {
  return status?.toUpperCase() === "DISPONIBLE" ? "badge-success" : "badge-warning";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-box bg-base-200 p-4">
      <p className="text-xs uppercase text-base-content/50">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

/** Vista de detalle de animal. Ruta protegida: /animals/{id}. */
export default function AnimalDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [usuario, setUsuario] = useState<StoredUser>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    const animalId = getParamId(params.id);
    if (!animalId) {
      setError("No se recibio el identificador del animal.");
      setLoading(false);
      return;
    }

    setUsuario(getStoredUser());
    obtenerAnimalPorId(token, animalId).then((res) => {
      if (res.ok) {
        setAnimal(res.data);
      } else {
        setError(res.error);
      }
      setLoading(false);
    });
  }, [params.id, router]);

  const esDueno = Boolean(animal?.esDueno || animal?.puedeEditar || animal?.puedeEliminar);
  const puedeUsarInteres = usuario.rol === "ADOPTANTE" && !esDueno;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </main>
    );
  }

  if (error || !animal) {
    return (
      <main className="min-h-screen bg-base-200 p-6">
        <div className="mx-auto max-w-3xl">
          <Link href={ROUTES.HOME} className="btn btn-ghost btn-sm mb-4 gap-2">
            <ArrowLeft size={16} /> Volver
          </Link>
          <ErrorMessage message={error ?? "No se pudo cargar el detalle del animal."} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="mx-auto max-w-6xl">
        <Link href={ROUTES.HOME} className="btn btn-ghost btn-sm mb-4 gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="overflow-hidden rounded-box bg-base-100 shadow-xl">
            <div className="h-80 bg-base-300">
              {isHttpImage(animal.imagenUrl) ? (
                <img src={animal.imagenUrl} alt={animal.nombre} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon size={72} className="text-base-content/30" />
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-primary">{animal.nombre}</h1>
                  <p className="mt-2 text-base-content/70">
                    {animal.especie}{animal.raza ? ` ${animal.raza}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`badge ${statusClass(animal.estatus)}`}>
                    {animal.estatus ?? "Sin estatus"}
                  </span>
                  {animal.esterilizado && (
                    <span className="badge badge-info gap-1">
                      <CheckCircle2 size={14} /> Esterilizado
                    </span>
                  )}
                  {esDueno && (
                    <span className="badge badge-primary gap-1">
                      <ShieldCheck size={14} /> Publicacion propia
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-6 whitespace-pre-line leading-relaxed text-base-content/80">
                {animal.descripcion ?? "Sin descripcion registrada."}
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-box bg-base-100 p-6 shadow-xl">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <PawPrint size={22} className="text-primary" />
                Informacion
              </h2>
              <div className="grid gap-3">
                <DetailRow label="Edad" value={formatAge(animal.fechaNacimiento)} />
                <DetailRow label="Nacimiento" value={formatDate(animal.fechaNacimiento)} />
                <DetailRow label="Sexo" value={animal.sexo ?? "No registrado"} />
                <DetailRow label="Estatus" value={animal.estatus ?? "No registrado"} />
              </div>
            </div>

            <div className="rounded-box bg-base-100 p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold">Ubicacion y cuidador</h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  <span>{animal.codigoPostal ? `CP ${animal.codigoPostal}` : "Codigo postal no registrado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserRound size={18} className="text-primary" />
                  <span>{animal.duenoNombre ?? "Cuidador no registrado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <span>{animal.fechaRegistro ? `Registrado ${formatDate(animal.fechaRegistro)}` : "Fecha de registro no disponible"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-box bg-base-100 p-6 shadow-xl">
              {puedeUsarInteres ? (
                <BotonInteres
                  animalId={animal.id}
                  tieneInteres={animal.tieneInteres}
                  estatus={animal.estatus ?? undefined}
                  rolUsuario={usuario.rol}
                />
              ) : (
                <p className="text-sm text-base-content/60">
                  {esDueno ? "Este registro pertenece a tu cuenta." : "Solo usuarios adoptantes pueden manifestar interes."}
                </p>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
