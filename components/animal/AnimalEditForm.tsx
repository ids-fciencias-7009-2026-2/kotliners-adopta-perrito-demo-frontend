"use client";

import { useState, useEffect } from "react";
import MultiSelect from "@/components/MultiSelect";
import GaleriaUpload from "@/components/GaleriaUpload";
import { listarVacunas, listarPadecimientos, listarRazas } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import type { AnimalDetalleResponse } from "@/lib/apiClient";

interface EditFormProps {
  animal: AnimalDetalleResponse;
  saving: boolean;
  error: string | null;
  onSave: (data: Partial<AnimalDetalleResponse>) => void;
  onCancel: () => void;
}

/**
 * Formulario de edicion de un animal existente.
 * Separado de AnimalCard para mantener el archivo principal manejable.
 */
export default function AnimalEditForm({ animal, saving, error, onSave, onCancel }: EditFormProps) {
  const [form, setForm] = useState({
    nombre: animal.nombre,
    especie: animal.especie.toLowerCase().includes("gato") ? "Gato" : "Perro",
    raza: animal.raza ?? "",
    razaId: animal.razaId ?? "",
    fechaNacimiento: animal.fechaNacimiento,
    sexo: animal.sexo as "MACHO" | "HEMBRA",
    descripcion: animal.descripcion,
    estatus: animal.estatus as "DISPONIBLE" | "ADOPTADO",
    esterilizado: animal.esterilizado,
    vacunas: animal.vacunas ?? [],
    padecimientos: animal.padecimientos ?? [],
    fotos: animal.fotos ?? [],
  });
  const [catVacunas, setCatVacunas] = useState<string[]>([]);
  const [catPadecimientos, setCatPadecimientos] = useState<string[]>([]);
  const [razasDisponibles, setRazasDisponibles] = useState<{ id: string; nombreEs: string }[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    Promise.all([listarVacunas(token), listarPadecimientos(token)]).then(([v, p]) => {
      if (v.ok) setCatVacunas(v.data.map((x) => x.nombre));
      if (p.ok) setCatPadecimientos(p.data.map((x) => x.nombre));
    });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const especieUpper = form.especie.toUpperCase() === "GATO" ? "GATO" : "PERRO";
    listarRazas(token, especieUpper).then((res) => {
      if (res.ok) setRazasDisponibles(res.data.map((r) => ({ id: r.id, nombreEs: r.nombreEs })).sort((a, b) => a.nombreEs.localeCompare(b.nombreEs)));
    });
    setForm((p) => ({ ...p, razaId: "", raza: "" }));
  }, [form.especie]);

  const set = (key: string, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-xl font-bold">Editar mascota</h3>
      {error && <div role="alert" className="alert alert-error"><span>{error}</span></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="form-control sm:col-span-2">
          <label className="label"><span className="label-text">Nombre</span></label>
          <input className="input input-bordered w-full" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Especie</span></label>
          <select className="select select-bordered w-full" value={form.especie} onChange={(e) => set("especie", e.target.value)}>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Raza</span></label>
          <select
            className="select select-bordered w-full"
            value={form.razaId}
            onChange={(e) => {
              const selected = razasDisponibles.find((r) => r.id === e.target.value);
              set("razaId", e.target.value);
              set("raza", selected?.nombreEs ?? "");
            }}
          >
            <option value="">Sin raza / Mestizo</option>
            {razasDisponibles.map((r) => (
              <option key={r.id} value={r.id}>{r.nombreEs}</option>
            ))}
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Fecha de nacimiento</span></label>
          <input type="date" className="input input-bordered w-full" value={form.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Sexo</span></label>
          <select className="select select-bordered w-full" value={form.sexo} onChange={(e) => set("sexo", e.target.value)}>
            <option value="MACHO">Macho</option>
            <option value="HEMBRA">Hembra</option>
          </select>
        </div>
        <div className="form-control sm:col-span-2">
          <label className="label"><span className="label-text">Descripcion</span></label>
          <textarea className="textarea textarea-bordered w-full" rows={3} value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Estatus</span></label>
          <select className="select select-bordered w-full" value={form.estatus} onChange={(e) => set("estatus", e.target.value)}>
            <option value="DISPONIBLE">Disponible</option>
            <option value="ADOPTADO">Adoptado</option>
          </select>
        </div>
        <label className="label cursor-pointer justify-start gap-3 mt-6">
          <input type="checkbox" className="checkbox" checked={form.esterilizado} onChange={(e) => set("esterilizado", e.target.checked)} />
          <span className="label-text">Esterilizado</span>
        </label>
        <div className="sm:col-span-2 relative">
          <MultiSelect label="Vacunas" opciones={catVacunas} values={form.vacunas} onChange={(v) => set("vacunas", v)} placeholder="Buscar vacuna o agregar nueva..." />
        </div>
        <div className="sm:col-span-2 relative">
          <MultiSelect label="Condiciones medicas" opciones={catPadecimientos} values={form.padecimientos} onChange={(v) => set("padecimientos", v)} placeholder="Buscar condicion o agregar nueva..." />
        </div>
        <div className="sm:col-span-2">
          <GaleriaUpload animalId={animal.id} fotos={form.fotos} onFotosChange={(f) => set("fotos", f)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button className="btn btn-primary" onClick={() => onSave(form)} disabled={saving}>
          {saving ? <span className="loading loading-spinner loading-sm" /> : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
