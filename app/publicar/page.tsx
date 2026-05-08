"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publicarAnimal, type CreateAnimalPayload } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import ErrorMessage from "@/components/ErrorMessage";
import DatePicker from "@/components/DatePicker";
import { PawPrint, Send } from "lucide-react";

/** Pagina para que un cuidador publique un nuevo animal. Ruta protegida: /publicar */
export default function PublicarPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.nombre.trim()) newErrors.nombre = "Obligatorio.";
    if (!form.especie.trim()) newErrors.especie = "Obligatorio.";
    if (!form.fechaNacimiento) newErrors.fechaNacimiento = "Obligatorio.";
    if (!form.descripcion.trim()) newErrors.descripcion = "Obligatorio.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);

    const token = getToken();
    if (!token) { router.push(ROUTES.LOGIN); return; }

    // Limpiar raza vacia para no enviar string vacio
    const payload: CreateAnimalPayload = {
      ...form,
      raza: form.raza?.trim() || undefined,
    };

    const result = await publicarAnimal(token, payload);
    setLoading(false);

    if (result.ok) {
      router.push(ROUTES.MIS_MASCOTAS);
    } else {
      setError(result.error);
    }
  }

  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body gap-4">

          <div className="flex flex-col items-center gap-2">
            <PawPrint size={40} className="text-primary" />
            <h1 className="card-title text-2xl">Publicar mascota</h1>
            <p className="text-base-content/60 text-sm text-center">
              Completa la informacion para que los adoptantes puedan encontrar a tu mascota.
            </p>
          </div>

          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1" noValidate>

            {/* Nombre */}
            <div className="form-control sm:col-span-2">
              <label className="label" htmlFor="nombre">
                <span className="label-text">Nombre <span className="text-error">*</span></span>
              </label>
              <input
                id="nombre" name="nombre" type="text"
                value={form.nombre} onChange={handleChange}
                placeholder="Ej: Luna"
                className={`input input-bordered w-full ${errors.nombre ? "input-error" : ""}`}
              />
              {errors.nombre && <span className="label-text-alt text-error mt-1">{errors.nombre}</span>}
            </div>

            {/* Especie */}
            <div className="form-control">
              <label className="label" htmlFor="especie">
                <span className="label-text">Especie <span className="text-error">*</span></span>
              </label>
              <select
                id="especie" name="especie"
                value={form.especie} onChange={handleChange}
                className={`select select-bordered w-full ${errors.especie ? "select-error" : ""}`}
              >
                <option value="">Selecciona</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
              {errors.especie && <span className="label-text-alt text-error mt-1">{errors.especie}</span>}
            </div>

            {/* Raza */}
            <div className="form-control">
              <label className="label" htmlFor="raza">
                <span className="label-text">Raza <span className="text-base-content/40 text-xs">(opcional)</span></span>
              </label>
              <input
                id="raza" name="raza" type="text"
                value={form.raza ?? ""} onChange={handleChange}
                placeholder="Ej: Labrador"
                className="input input-bordered w-full"
              />
            </div>

            {/* Fecha de nacimiento */}
            <div className="sm:col-span-2 relative">
              <DatePicker
                label="Fecha de nacimiento"
                value={form.fechaNacimiento}
                onChange={(v) => {
                  setForm((prev) => ({ ...prev, fechaNacimiento: v }));
                  setErrors((prev) => ({ ...prev, fechaNacimiento: "" }));
                }}
                max={new Date().toISOString().split("T")[0]}
                error={errors.fechaNacimiento}
                required
              />
            </div>

            {/* Sexo */}
            <div className="form-control">
              <label className="label" htmlFor="sexo">
                <span className="label-text">Sexo <span className="text-error">*</span></span>
              </label>
              <select
                id="sexo" name="sexo"
                value={form.sexo} onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </select>
            </div>

            {/* Descripcion */}
            <div className="form-control sm:col-span-2">
              <label className="label" htmlFor="descripcion">
                <span className="label-text">Descripcion <span className="text-error">*</span></span>
              </label>
              <textarea
                id="descripcion" name="descripcion"
                value={form.descripcion} onChange={handleChange}
                placeholder="Cuent sobre la mascota: su personalidad, cuidados especiales, etc."
                rows={3}
                className={`textarea textarea-bordered w-full ${errors.descripcion ? "textarea-error" : ""}`}
              />
              {errors.descripcion && <span className="label-text-alt text-error mt-1">{errors.descripcion}</span>}
            </div>

            {/* Esterilizado */}
            <div className="form-control sm:col-span-2">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox" name="esterilizado"
                  checked={form.esterilizado}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <span className="label-text">Esta esterilizado/a</span>
              </label>
            </div>

            <div className="sm:col-span-2 mt-2">
              <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2">
                {loading
                  ? <span className="loading loading-spinner loading-sm" />
                  : <><Send size={18} /> Publicar mascota</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
