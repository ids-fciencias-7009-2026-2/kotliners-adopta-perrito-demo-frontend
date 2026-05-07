"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import PasswordField from "@/components/PasswordField";
import { register } from "@/api/authApi";
import { ROUTES } from "@/lib/routes";
import { PawPrint, UserPlus } from "lucide-react";
import zxcvbn from "zxcvbn";

/** Pagina de registro de nuevos usuarios. Ruta publica: /registro */
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

  /** Actualiza el campo del formulario y limpia su error. */
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  /** Valida todos los campos del formulario. Retorna true si son validos. */
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.nombres.trim()) newErrors.nombres = "Obligatorio.";
    if (!form.curp.trim()) newErrors.curp = "Obligatorio.";
    else if (!form.curp.match(/^[A-Z0-9]{18}$/)) newErrors.curp = "CURP no valida (18 caracteres).";
    if (!form.username.trim()) newErrors.username = "Obligatorio.";
    if (!form.apellidoPaterno.trim()) newErrors.apellidoPaterno = "Obligatorio.";
    if (!form.apellidoMaterno.trim()) newErrors.apellidoMaterno = "Obligatorio.";
    if (!form.email.trim()) newErrors.email = "Obligatorio.";
    else if (!form.email.match(/\S+@\S+\.\S+/)) newErrors.email = "Correo no valido.";
    if (!form.codigoPostal.trim()) newErrors.codigoPostal = "Obligatorio.";
    else if (!form.codigoPostal.match(/^\d{5}$/)) newErrors.codigoPostal = "5 digitos numericos.";
    if (!form.password.trim()) newErrors.password = "Obligatorio.";
    else if (form.password.length < 8) newErrors.password = "Minimo 8 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /** Envia el formulario al backend y redirige al login si el registro es exitoso. */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      router.push(ROUTES.LOGIN);
    } catch {
      setServerError("Error al registrar. Verifica que los datos no esten duplicados.");
    } finally {
      setLoading(false);
    }
  }

  /** Renderiza un campo de formulario con label y mensaje de error DaisyUI. */
  function Field({ label, name, type = "text", placeholder }: {
    label: string; name: string; type?: string; placeholder?: string;
  }) {
    return (
      <div className="form-control">
        <label className="label" htmlFor={name}>
          <span className="label-text">{label} <span className="text-error">*</span></span>
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={(form as any)[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`input input-bordered w-full ${errors[name] ? "input-error" : ""}`}
        />
        {errors[name] && (
          <label className="label">
            <span className="label-text-alt text-error">{errors[name]}</span>
          </label>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body gap-4">

          {/* Encabezado */}
          <div className="flex flex-col items-center gap-2">
            <PawPrint size={48} className="text-primary" />
            <h1 className="card-title text-2xl">Crear cuenta</h1>
            <p className="text-base-content/60 text-sm text-center">Unete y ayuda a encontrar hogares felices</p>
          </div>

          <ErrorMessage message={serverError} />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1" noValidate>
            <Field label="Nombre(s)" name="nombres" />
            <Field label="Apellido paterno" name="apellidoPaterno" />
            <Field label="Apellido materno" name="apellidoMaterno" />
            <Field label="CURP" name="curp" placeholder="18 caracteres" />
            <Field label="Usuario" name="username" />
            <Field label="Correo electronico" name="email" type="email" placeholder="tu@correo.com" />
            <Field label="Codigo postal" name="codigoPostal" placeholder="5 digitos" />

            {/* Selector de rol */}
            <div className="form-control">
              <label className="label" htmlFor="rol">
                <span className="label-text">Rol <span className="text-error">*</span></span>
              </label>
              <select
                id="rol"
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="ADOPTANTE">Quiero adoptar</option>
                <option value="CUIDADOR">Soy cuidador</option>
              </select>
            </div>

            <PasswordField
              name="password"
              label="Contrasena"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Minimo 8 caracteres"
            />

            {/* Indicador de fortaleza de contrasena usando zxcvbn */}
            {form.password.length > 0 && (() => {
              const result = zxcvbn(form.password);
              const score = result.score; // 0-4
              const hasUpper  = /[A-Z]/.test(form.password);
              const hasLower  = /[a-z]/.test(form.password);
              const hasNumber = /[0-9]/.test(form.password);
              const hasMin8   = form.password.length >= 8;
              const colors = ["progress-error", "progress-error", "progress-warning", "progress-warning", "progress-success"];
              const labels = ["Muy debil", "Debil", "Aceptable", "Buena", "Fuerte"];
              const labelColors = ["text-error", "text-error", "text-warning", "text-warning", "text-success"];
              return (
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <progress className={`progress w-full ${colors[score]}`} value={score + 1} max={5} />
                  <p className={`text-xs font-semibold ${labelColors[score]}`}>{labels[score]}</p>
                  <ul className="text-xs text-base-content/60 flex flex-wrap gap-x-4 gap-y-1">
                    <li className={hasMin8 ? "text-success" : "text-error"}>{hasMin8 ? "✓" : "✗"} Minimo 8 caracteres</li>
                    <li className={hasUpper ? "text-success" : "text-error"}>{hasUpper ? "✓" : "✗"} Una mayuscula</li>
                    <li className={hasLower ? "text-success" : "text-error"}>{hasLower ? "✓" : "✗"} Una minuscula</li>
                    <li className={hasNumber ? "text-success" : "text-error"}>{hasNumber ? "✓" : "✗"} Un numero</li>
                  </ul>
                  {result.feedback.warning && (
                    <p className="text-xs text-warning">{result.feedback.warning}</p>
                  )}
                </div>
              );
            })()}

            <div className="sm:col-span-2 mt-2">
              <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2">
                {loading
                  ? <span className="loading loading-spinner loading-sm" />
                  : <><UserPlus size={18} /> Crear mi cuenta</>}
              </button>
            </div>
          </form>

          <div className="divider text-xs">Ya tienes cuenta?</div>
          <Link href={ROUTES.LOGIN} className="btn btn-outline btn-secondary w-full btn-sm">
            Iniciar sesion
          </Link>
        </div>
      </div>
    </div>
  );
}
