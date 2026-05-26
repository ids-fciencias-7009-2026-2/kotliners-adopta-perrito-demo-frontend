"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  publicarAnimal, actualizarVacunasAnimal, actualizarPadecimientosAnimal,
  listarVacunas, listarPadecimientos, listarRazas,
  type CreateAnimalPayload, type RazaResponse
} from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import ErrorMessage from "@/components/ErrorMessage";
import DatePicker from "@/components/DatePicker";
import MultiSelect from "@/components/MultiSelect";
import GaleriaUpload from "@/components/GaleriaUpload";
import { PawPrint, Send, CheckCircle } from "lucide-react";

/** Pagina para que un cuidador publique un nuevo animal. Ruta protegida: /publicar */
export default function PublicarPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [animalPublicadoId, setAnimalPublicadoId] = useState<string | null>(null);
  const [fotosAnimal, setFotosAnimal] = useState<string[]>([]);

  const [form, setForm] = useState<CreateAnimalPayload & { razaId: string }>({
    nombre: "", especie: "", raza: "", razaId: "", fechaNacimiento: "",
    sexo: "MACHO", descripcion: "", esterilizado: false,
  });
  const [vacunas, setVacunas] = useState<string[]>([]);
  const [padecimientos, setPadecimientos] = useState<string[]>([]);
  const [catVacunas, setCatVacunas] = useState<string[]>([]);
  const [catPadecimientos, setCatPadecimientos] = useState<string[]>([]);
  const [razasDisponibles, setRazasDisponibles] = useState<RazaResponse[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([listarVacunas(token), listarPadecimientos(token)]).then(([v, p]) => {
      if (v.ok) setCatVacunas(v.data.map((x) => x.nombre));
      if (p.ok) setCatPadecimientos(p.data.map((x) => x.nombre));
    });
  }, []);

  // Cargar razas cuando cambia la especie
  useEffect(() => {
    if (!form.especie) { setRazasDisponibles([]); return; }
    const token = getToken();
    if (!token) return;
    const especieUpper = form.especie.toUpperCase() === "GATO" ? "GATO" : "PERRO";
    listarRazas(token, especieUpper).then((res) => {
      if (res.ok) setRazasDisponibles(res.data);
    });
    setForm((p) => ({ ...p, razaId: "", raza: "" }));
  }, [form.especie]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleRazaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const razaId = e.target.value;
    const raza = razasDisponibles.find((r) => r.id === razaId);
    setForm((p) => ({ ...p, razaId, raza: raza?.nombreEs ?? "" }));
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

    const payload: CreateAnimalPayload = {
      ...form,
      raza: form.raza?.trim() || undefined,
      razaId: form.razaId || undefined,
    };
    const result = await publicarAnimal(token, payload);

    if (result.ok) {
      await Promise.all([
        vacunas.length > 0 ? actualizarVacunasAnimal(token, result.data.id, vacunas) : Promise.resolve(),
        padecimientos.length > 0 ? actualizarPadecimientosAnimal(token, result.data.id, padecimientos) : Promise.resolve(),
      ]);
      setLoading(false);
      setAnimalPublicadoId(result.data.id);
    } else {
      setLoading(false);
      setError(result.error);
    }
  }

  // Paso 2: subir fotos despues de publicar
  if (animalPublicadoId) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
        <div className="card w-full max-w-lg bg-base-100 shadow-xl">
          <div className="card-body gap-4">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle size={48} className="text-success" />
              <h1 className="card-title text-2xl">Mascota publicada</h1>
              <p className="text-base-content/60 text-sm text-center">
                Ahora puedes agregar fotos para que los adoptantes la conozcan mejor.
              </p>
            </div>
            <GaleriaUpload
              animalId={animalPublicadoId}
              fotos={fotosAnimal}
              onFotosChange={setFotosAnimal}
            />
            <button
              onClick={() => router.push(ROUTES.MIS_MASCOTAS)}
              className="btn btn-primary w-full gap-2"
            >
              {fotosAnimal.length > 0 ? "Listo, ver mis mascotas" : "Omitir por ahora"}
            </button>
          </div>
        </div>
      </main>
    );
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

            <div className="form-control sm:col-span-2">
              <label className="label" htmlFor="nombre"><span className="label-text">Nombre <span className="text-error">*</span></span></label>
              <input id="nombre" name="nombre" type="text" value={form.nombre} onChange={handleChange} placeholder="Ej: Luna"
                className={`input input-bordered w-full ${errors.nombre ? "input-error" : ""}`} />
              {errors.nombre && <span className="label-text-alt text-error mt-1">{errors.nombre}</span>}
            </div>

            <div className="form-control">
              <label className="label" htmlFor="especie"><span className="label-text">Especie <span className="text-error">*</span></span></label>
              <select id="especie" name="especie" value={form.especie} onChange={handleChange}
                className={`select select-bordered w-full ${errors.especie ? "select-error" : ""}`}>
                <option value="">Selecciona</option>
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
              {errors.especie && <span className="label-text-alt text-error mt-1">{errors.especie}</span>}
            </div>

            <div className="form-control">
              <label className="label" htmlFor="razaId">
                <span className="label-text">Raza <span className="text-base-content/40 text-xs">(opcional)</span></span>
              </label>
              <select
                id="razaId"
                value={form.razaId}
                onChange={handleRazaChange}
                disabled={!form.especie || razasDisponibles.length === 0}
                className="select select-bordered w-full"
              >
                <option value="">Sin raza / Mestizo</option>
                {razasDisponibles.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombreEs}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 relative">
              <DatePicker label="Fecha de nacimiento" value={form.fechaNacimiento}
                onChange={(v) => { setForm((p) => ({ ...p, fechaNacimiento: v })); setErrors((p) => ({ ...p, fechaNacimiento: "" })); }}
                max={new Date().toISOString().split("T")[0]} error={errors.fechaNacimiento} required />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="sexo"><span className="label-text">Sexo <span className="text-error">*</span></span></label>
              <select id="sexo" name="sexo" value={form.sexo} onChange={handleChange} className="select select-bordered w-full">
                <option value="MACHO">Macho</option>
                <option value="HEMBRA">Hembra</option>
              </select>
            </div>

            <div className="form-control sm:col-span-2">
              <label className="label" htmlFor="descripcion"><span className="label-text">Descripcion <span className="text-error">*</span></span></label>
              <textarea id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange}
                placeholder="Cuentanos sobre la mascota..." rows={3}
                className={`textarea textarea-bordered w-full ${errors.descripcion ? "textarea-error" : ""}`} />
              {errors.descripcion && <span className="label-text-alt text-error mt-1">{errors.descripcion}</span>}
            </div>

            <div className="form-control sm:col-span-2">
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" name="esterilizado" checked={form.esterilizado} onChange={handleChange} className="checkbox checkbox-primary" />
                <span className="label-text">Esta esterilizado/a</span>
              </label>
            </div>

            <div className="sm:col-span-2 relative">
              <MultiSelect label="Vacunas (opcional)" opciones={catVacunas} values={vacunas} onChange={setVacunas} placeholder="Buscar vacuna o agregar nueva..." />
            </div>

            <div className="sm:col-span-2 relative">
              <MultiSelect label="Condiciones medicas (opcional)" opciones={catPadecimientos} values={padecimientos} onChange={setPadecimientos} placeholder="Buscar condicion o agregar nueva..." />
            </div>

            <div className="sm:col-span-2 mt-2">
              <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2">
                {loading ? <span className="loading loading-spinner loading-sm" /> : <><Send size={18} /> Publicar mascota</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
