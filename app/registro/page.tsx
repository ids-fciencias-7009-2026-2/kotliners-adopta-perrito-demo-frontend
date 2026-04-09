"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormField from "@/components/FormField";
import ErrorMessage from "@/components/ErrorMessage";
import { register } from "@/api/authApi";
import { ROUTES } from "@/lib/routes";

export default function RegistroPage() {

  const router = useRouter();
  const [form, setForm] = useState({
    nombres: "", curp: "", username: "", apellidoPaterno: "",
    apellidoMaterno: "", email: "", codigoPostal: "", password: "",
    rol: "ADOPTANTE",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.nombres.trim()) newErrors.nombres = "El nombre es obligatorio.";
    if (!form.curp.trim()) newErrors.curp = "La CURP es obligatoria.";
    if (!form.curp.match(/^[A-Z0-9]{18}$/)) newErrors.curp = "La CURP no es válida.";
    if (!form.username.trim()) newErrors.username = "El usuario es obligatorio.";
    if (!form.apellidoPaterno.trim()) newErrors.apellidoPaterno = "El apellido paterno es obligatorio.";
    if (!form.apellidoMaterno.trim()) newErrors.apellidoMaterno = "El apellido materno es obligatorio.";
    if (!form.email.trim()) newErrors.email = "El correo es obligatorio.";
    if (!form.email.match(/\S+@\S+\.\S+/)) newErrors.email = "El correo no es válido.";
    if (!form.codigoPostal.trim()) newErrors.codigoPostal = "El código postal es obligatorio.";
    if (!form.codigoPostal.match(/^\d{5}$/)) newErrors.codigoPostal = "El código postal no es válido.";
    if (!form.password.trim()) newErrors.password = "La contraseña es obligatoria.";
    if (form.password.length > 0 && form.password.length < 8)
      newErrors.password = "Mínimo 8 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form);
      router.push(ROUTES.LOGIN);
    } catch {
      setServerError("Error al registrar. Verifica que los datos no estén duplicados.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-2">
            <span className="text-5xl">🐾</span>
            <h1 className="card-title text-2xl justify-center mt-2">Crear cuenta</h1>
            <p className="text-base-content/60 text-sm">Únete y ayuda a encontrar hogares felices</p>
          </div>

          <ErrorMessage message={serverError} />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2" noValidate>
            <FormField label="Nombre(s)" name="nombres" value={form.nombres} onChange={handleChange} error={errors.nombres} required />
            <FormField label="Apellido paterno" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} error={errors.apellidoPaterno} required />
            <FormField label="Apellido materno" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} error={errors.apellidoMaterno} required />
            <FormField label="CURP" name="curp" value={form.curp} onChange={handleChange} error={errors.curp} placeholder="18 caracteres" required />
            <FormField label="Usuario" name="username" value={form.username} onChange={handleChange} error={errors.username} required />
            <FormField label="Correo electrónico" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
            <FormField label="Código postal" name="codigoPostal" value={form.codigoPostal} onChange={handleChange} error={errors.codigoPostal} placeholder="5 dígitos" required />

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Rol <span className="text-error ml-1">*</span></legend>
              <select name="rol" value={form.rol} onChange={handleChange} className="select w-full">
                <option value="ADOPTANTE">🏠 Quiero adoptar</option>
                <option value="CUIDADOR">🐕 Soy cuidador</option>
              </select>
            </fieldset>

            <FormField label="Contraseña" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Mínimo 8 caracteres" required />

            <div className="sm:col-span-2 mt-2">
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? <span className="loading loading-spinner loading-sm" /> : "🐾 Crear mi cuenta"}
              </button>
            </div>
          </form>

          <div className="divider text-xs">¿Ya tienes cuenta?</div>
          <Link href={ROUTES.LOGIN} className="btn btn-outline btn-secondary w-full btn-sm">
            Iniciar sesión 🐶
          </Link>
        </div>
      </div>
    </div>
  );
}
