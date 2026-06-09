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

const zxcvbnWarnings: Record<string, string> = {
  "Straight rows of keys are easy to guess": "Las filas de teclas seguidas son fáciles de adivinar",
  "Short keyboard patterns are easy to guess": "Los patrones cortos de teclado son fáciles de adivinar",
  "Use a longer keyboard pattern with more turns": "Usa un patrón de teclado más largo con más giros",
  "Repeats like \"aaa\" are easy to guess": "Las repeticiones como \"aaa\" son fáciles de adivinar",
  "Repeats like \"abcabcabc\" are only slightly harder to guess than \"abc\"": "Las repeticiones como \"abcabcabc\" son solo un poco más difíciles que \"abc\"",
  "Sequences like abc or 6543 are easy to guess": "Las secuencias como abc o 6543 son fáciles de adivinar",
  "Recent years are easy to guess": "Los años recientes son fáciles de adivinar",
  "Dates are often easy to guess": "Las fechas suelen ser fáciles de adivinar",
  "This is a top-10 common password": "Esta es una de las 10 contraseñas más comunes",
  "This is a top-100 common password": "Esta es una de las 100 contraseñas más comunes",
  "This is a very common password": "Esta es una contraseña muy común",
  "This is similar to a commonly used password": "Es similar a una contraseña de uso común",
  "A word by itself is easy to guess": "Una palabra sola es fácil de adivinar",
  "Names and surnames by themselves are easy to guess": "Los nombres y apellidos solos son fáciles de adivinar",
  "Common names and surnames are easy to guess": "Los nombres y apellidos comunes son fáciles de adivinar",
};

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
 * Campo de formulario reútilizable con label y mensaje de error DaisyUI.
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
// Página de registro
// ---------------------------------------------------------------------------

/** Página de registro de nuevos usuarios. Ruta publica: /registro */
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
    // CURP siempre en mayusculas, email siempre en minusculas
    const finalValue = name === "curp" ? value.toUpperCase() : name === "email" ? value.toLowerCase() : value;
    setForm((prev) => ({ ...prev, [name]: finalValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  /** Valida todos los campos del formulario. Retorna true si son validos. */
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.nombres.trim()) newErrors.nombres = "Ingresa tu nombre completo.";

    // Validación CURP — formato oficial mexicano
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    if (!form.curp.trim()) {
      newErrors.curp = "Ingresa tu CURP para verificar tu identidad.";
    } else if (!curpRegex.test(form.curp)) {
      newErrors.curp = "CURP no válida. Formato: 4 letras, 6 dígitos de fecha, H/M, 5 letras, 1 alfanumérico, 1 dígito.";
    } else {
      // Extraer fecha de nacimiento del CURP (posiciones 4-9: AAMMDD)
      const anio = parseInt(form.curp.substring(4, 6), 10);
      const mes = parseInt(form.curp.substring(6, 8), 10);
      const dia = parseInt(form.curp.substring(8, 10), 10);
      // Determinar siglo: si anio <= anio actual (2 dígitos) asumimos 2000s, sino 1900s
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
        newErrors.curp = "Debes ser mayor de 18 años para registrarte.";
      }
    }

    if (!form.username.trim()) newErrors.username = "Elige un nombre de usuario para tu perfil.";
    if (!form.apellidoPaterno.trim()) newErrors.apellidoPaterno = "Ingresa tu apellido paterno.";
    if (!form.apellidoMaterno.trim()) newErrors.apellidoMaterno = "Ingresa tu apellido materno.";
    if (!form.email.trim()) newErrors.email = "Ingresa tu correo electrónico para recibir notificaciones.";
    else if (!form.email.match(/\S+@\S+\.\S+/)) newErrors.email = "El formato no es válido. Ejemplo: tu@correo.com";
    if (!form.codigoPostal.trim()) newErrors.codigoPostal = "Ingresa tu código postal para ubicarte en el mapa.";
    else if (!form.codigoPostal.match(/^\d{5}$/)) newErrors.codigoPostal = "El código postal debe tener exactamente 5 dígitos.";
    if (!form.password.trim()) newErrors.password = "Crea una contraseña segura.";
    else if (form.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    else if (!/[A-Z]/.test(form.password)) newErrors.password = "Debe incluir al menos una letra mayúscula.";
    else if (!/[a-z]/.test(form.password)) newErrors.password = "Debe incluir al menos una letra minúscula.";
    else if (!/[0-9]/.test(form.password)) newErrors.password = "Debe incluir al menos un número.";
    else if (!/[^A-Za-z0-9]/.test(form.password)) newErrors.password = "Debe incluir al menos un carácter especial (!@#$%...).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /** Envia el formulario al backend y redirige al login si el registro es éxitoso. */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      router.push(ROUTES.LOGIN);
    } catch (err: any) {
      // Leer el mensaje de error del backend si existe
      const backendMsg = err?.response?.data;
      if (typeof backendMsg === "string" && backendMsg.trim()) {
        setServerError(backendMsg);
      } else if (err?.response?.status === 409 || err?.response?.status === 400) {
        setServerError("El correo, usuario o CURP ya está registrado. Intenta con otros datos.");
      } else {
        setServerError("Error al registrar. Intenta de nuevo más tarde.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Indicador de fortaleza de contraseña
  const pwdResult = form.password.length > 0 ? zxcvbn(form.password) : null;
  const pwdColors = ["progress-error", "progress-error", "progress-warning", "progress-warning", "progress-success"];
  const pwdLabels = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
  const pwdLabelColors = ["text-error", "text-error", "text-warning", "text-warning", "text-success"];

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body gap-4">

          {/* Encabezado */}
          <div className="flex flex-col items-center gap-2">
            <PawPrint size={48} className="text-primary" />
            <h1 className="card-title text-2xl">Crear cuenta</h1>
            <p className="text-base-content/60 text-sm text-center">Únete y ayuda a encontrar hogares felices</p>
          </div>

          <ErrorMessage message={serverError} />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1" noValidate>

            <Field label="Nombre(s)" name="nombres" value={form.nombres} error={errors.nombres} onChange={handleChange} />
            <Field label="Apellido paterno" name="apellidoPaterno" value={form.apellidoPaterno} error={errors.apellidoPaterno} onChange={handleChange} />
            <Field label="Apellido materno" name="apellidoMaterno" value={form.apellidoMaterno} error={errors.apellidoMaterno} onChange={handleChange} />
            <Field label="CURP" name="curp" value={form.curp} error={errors.curp} onChange={handleChange} placeholder="18 caracteres" />
            <Field label="Usuario" name="username" value={form.username} error={errors.username} onChange={handleChange} />
            <Field label="Correo electrónico" name="email" type="email" value={form.email} error={errors.email} onChange={handleChange} placeholder="tu@correo.com" />
            <Field label="Código postal" name="codigoPostal" value={form.codigoPostal} error={errors.codigoPostal} onChange={handleChange} placeholder="5 dígitos" />

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
              label="Contraseña"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Mínimo 8 caracteres"
            />

            {/* Indicador de fortaleza de contraseña */}
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
                    {form.password.length >= 8 ? "✓" : "✗"} Mínimo 8 caracteres
                  </li>
                  <li className={/[A-Z]/.test(form.password) ? "text-success" : "text-error"}>
                    {/[A-Z]/.test(form.password) ? "✓" : "✗"} Una mayúscula
                  </li>
                  <li className={/[a-z]/.test(form.password) ? "text-success" : "text-error"}>
                    {/[a-z]/.test(form.password) ? "✓" : "✗"} Una minúscula
                  </li>
                  <li className={/[0-9]/.test(form.password) ? "text-success" : "text-error"}>
                    {/[0-9]/.test(form.password) ? "✓" : "✗"} Un número
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(form.password) ? "text-success" : "text-error"}>
                    {/[^A-Za-z0-9]/.test(form.password) ? "✓" : "✗"} Un carácter especial
                  </li>
                </ul>
                {pwdResult.feedback.warning && (
                  <p className="text-xs text-warning">{zxcvbnWarnings[pwdResult.feedback.warning] ?? pwdResult.feedback.warning}</p>
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
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
