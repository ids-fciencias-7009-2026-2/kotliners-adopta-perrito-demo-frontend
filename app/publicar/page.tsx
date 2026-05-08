"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publicarAnimal, type CreateAnimalPayload } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import FormField from "@/components/FormField";
import ErrorMessage from "@/components/ErrorMessage";

/**
 * Vista para que un cuidador publique un nuevo animal en adopción.
 */
export default function PublicarPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CreateAnimalPayload>({
    nombre: "",
    especie: "",
    raza: "",
    fechaNacimiento: "",
    sexo: "MACHO",
    descripcion: "",
    esterilizado: false,
  });

  function handleChange(
    e: React.ChangeEvent
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const token = getToken();
    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }

    const result = await publicarAnimal(token, form);
    setLoading(false);

    if (result.ok) {
      router.push(ROUTES.HOME);
    } else {
      setError(result.error);
    }
  }

  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
      <div className="bg-base-100 rounded-box shadow-xl w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          Publicar animal 🐾
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Nombre">
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Ej: Luna"
              required
            />
          </FormField>

          <FormField label="Especie">
            <select
              name="especie"
              value={form.especie}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="">Selecciona una especie</option>
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
            </select>
          </FormField>

          <FormField label="Raza (opcional)">
            <input
              name="raza"
              value={form.raza ?? ""}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Ej: Labrador"
            />
          </FormField>

          <FormField label="Fecha de nacimiento">
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </FormField>

          <FormField label="Sexo">
            <select
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              className="select select-bordered w-full"
              required
            >
              <option value="MACHO">Macho</option>
              <option value="HEMBRA">Hembra</option>
            </select>
          </FormField>

          <FormField label="Descripción">
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="textarea textarea-bordered w-full"
              placeholder="Cuéntanos sobre el animal..."
              rows={3}
              required
            />
          </FormField>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="esterilizado"
              checked={form.esterilizado}
              onChange={handleChange}
              className="checkbox checkbox-primary"
            />
            <span className="label-text">¿Está esterilizado?</span>
          </label>

          {error && <ErrorMessage message={error} />}

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Publicar animal"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}