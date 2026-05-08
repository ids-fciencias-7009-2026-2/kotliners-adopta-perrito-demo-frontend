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

// ---------------------------------------------------------------------------
// Componente Field — definido FUERA del componente padre para evitar
// que React lo desmonte/remonte en cada render y el input pierda el foco.
// ---------------------------------------------------------------------------

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Campo de formulario reutilizable con label y mensaje de error DaisyUI.
 * Debe estar definido fuera del componente padre para evitar re-montajes.
 */
function Field({ label, name, type = "text", placeholder, value, error, onChange }: FieldProps) {
  return (
    <div className="form-control">
      <label className="label" htmlFor={name}>
        <span className="label-text">{label} <span className="text-error">*</span></span>
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input input-bordered w-full ${error ? "input-error" : ""}`}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagina de registro
// ---------------------------------------------------------------------------

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
    const { name, value } = e.target;
    // CURP siempre en mayusculas
    const finalValue = name === "curp" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: finalValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  /** Valida todos los campos del formulario. Retorna true si son validos. */
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.nombres.trim()) newErrors.nombres = "Obligatorio.";

    // Validacion CURP — formato oficial mexicano
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    if (!form.curp.trim()) {
      newErrors.curp = "Obligatorio.";
    } else if (!curpRegex.test(form.curp)) {
      newErrors.curp = "CURP no valida. Formato: 4 letras, 6 digitos de fecha, H/M, 5 letras, 1 alfanumerico, 1 digito.";
    } else {
      // Extraer fecha de nacimiento del CURP (posiciones 4-9: AAMMDD)
      const anio = parseInt(form.curp.substring(4, 6), 10);
      const mes = parseInt(form.curp.substring(6, 8), 10);
      const dia = parseInt(form.curp.substring(8, 10), 10);
      // Determinar siglo: si anio <= anio actual (2 digitos) asumimos 2000s, sino 1900s
      const anioActual2d = new Date().getFullYear() % 100;
      const anioCompleto = anio <= anioActual2d ? 2000 + anio : 1900 + anio;
      const fechaNac = new Date(anioCompleto, mes - 1, dia);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      if (hoy.getMonth() < fechaNac.getMonth() ||
          (hoy.getMonth() === fechaNac.getMonth() && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      if (edad < 18) {
        newErrors.curp = "Debes ser mayor de 18 anos para registrarte.";
      }
    }

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

  // Indicador de fortaleza de contrasena
  const pwdResult = form.password.length > 0 ? zxcvbn(form.password) : null;
  const pwdColors = ["progress-error", "progress-error", "progress-warning", "progress-warning", "progress-success"];
  const pwdLabels = ["Muy debil", "Debil", "Aceptable", "Buena", "Fuerte"];
  const pwdLabelColors = ["text-error", "text-error", "text-warning", "text-warning", "text-success"];

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

            <Field label="Nombre(s)" name="nombres" value={form.nombres} error={errors.nombres} onChange={handleChange} />
            <Field label="Apellido paterno" name="apellidoPaterno" value={form.apellidoPaterno} error={errors.apellidoPaterno} onChange={handleChange} />
            <Field label="Apellido materno" name="apellidoMaterno" value={form.apellidoMaterno} error={errors.apellidoMaterno} onChange={handleChange} />
            <Field label="CURP" name="curp" value={form.curp} error={errors.curp} onChange={handleChange} placeholder="18 caracteres" />
            <Field label="Usuario" name="username" value={form.username} error={errors.username} onChange={handleChange} />
            <Field label="Correo electronico" name="email" type="email" value={form.email} error={errors.email} onChange={handleChange} placeholder="tu@correo.com" />
            <Field label="Codigo postal" name="codigoPostal" value={form.codigoPostal} error={errors.codigoPostal} onChange={handleChange} placeholder="5 digitos" />

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

            {/* Indicador de fortaleza de contrasena */}
            {pwdResult && (
              <div className="sm:col-span-2 flex flex-col gap-2">
                <progress
                  className={`progress w-full ${pwdColors[pwdResult.score]}`}
                  value={pwdResult.score + 1}
                  max={5}
                />
                <p className={`text-xs font-semibold ${pwdLabelColors[pwdResult.score]}`}>
                  {pwdLabels[pwdResult.score]}
                </p>
                <ul className="text-xs text-base-content/60 flex flex-wrap gap-x-4 gap-y-1">
                  <li className={form.password.length >= 8 ? "text-success" : "text-error"}>
                    {form.password.length >= 8 ? "✓" : "✗"} Minimo 8 caracteres
                  </li>
                  <li className={/[A-Z]/.test(form.password) ? "text-success" : "text-error"}>
                    {/[A-Z]/.test(form.password) ? "✓" : "✗"} Una mayuscula
                  </li>
                  <li className={/[a-z]/.test(form.password) ? "text-success" : "text-error"}>
                    {/[a-z]/.test(form.password) ? "✓" : "✗"} Una minuscula
                  </li>
                  <li className={/[0-9]/.test(form.password) ? "text-success" : "text-error"}>
                    {/[0-9]/.test(form.password) ? "✓" : "✗"} Un numero
                  </li>
                </ul>
                {pwdResult.feedback.warning && (
                  <p className="text-xs text-warning">{pwdResult.feedback.warning}</p>
                )}
              </div>
            )}

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
