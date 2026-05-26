"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import PasswordField from "@/components/PasswordField";
import { getPerfil } from "@/api/authApi";
import { loginUsuario, verificarTwoFactor } from "@/lib/apiClient";
import { ROUTES } from "@/lib/routes";
import { KeyRound, LogIn, PawPrint } from "lucide-react";

/** Pagina de inicio de sesion. Ruta publica: /login */
export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** Actualiza el campo del formulario y limpia su error. */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  function handleTwoFactorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6));
    setErrors((prev) => ({ ...prev, twoFactorCode: "" }));
  }

  /** Valida los campos del formulario. Retorna true si son validos. */
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) newErrors.username = "El correo es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(form.username)) newErrors.username = "Correo no valido.";
    if (!form.password.trim()) newErrors.password = "La contrasena es obligatoria.";
    else if (form.password.length < 8) newErrors.password = "Minimo 8 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /** Envia las credenciales al backend y guarda el token en sessionStorage. */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const loginResponse = await loginUsuario({ email: form.username, password: form.password });
      if (!loginResponse.ok) {
        setServerError(loginResponse.error);
        return;
      }
      if ("requiere2FA" in loginResponse.data) {
        setRequiresTwoFactor(true);
        setServerError(null);
        return;
      }
      const token = loginResponse.data.token;
      sessionStorage.setItem("user_token", token);
      const perfilResponse = await getPerfil();
      sessionStorage.setItem("usuario", JSON.stringify(perfilResponse.data));
      router.push(ROUTES.HOME);
    } catch {
      setServerError("No se pudo iniciar sesion. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!/^\d{6}$/.test(twoFactorCode)) {
      setErrors((prev) => ({ ...prev, twoFactorCode: "Ingresa el codigo de 6 digitos." }));
      return;
    }
    setLoading(true);
    try {
      const response = await verificarTwoFactor(form.username, twoFactorCode);
      if (!response.ok) {
        setServerError(response.error);
        return;
      }
      sessionStorage.setItem("user_token", response.data.token);
      const perfilResponse = await getPerfil();
      sessionStorage.setItem("usuario", JSON.stringify(perfilResponse.data));
      router.push(ROUTES.HOME);
    } catch {
      setServerError("No se pudo validar el codigo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">

          {/* Encabezado */}
          <div className="flex flex-col items-center gap-2">
            <PawPrint size={48} className="text-primary" />
            <h1 className="card-title text-2xl">Bienvenido</h1>
            <p className="text-base-content/60 text-sm text-center">Inicia sesion en Colitas Felices</p>
          </div>

          <ErrorMessage message={serverError} />

          {!requiresTwoFactor ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>

            {/* Campo correo */}
            <div className="form-control">
              <label className="label" htmlFor="username">
                <span className="label-text">Correo electronico</span>
              </label>
              <input
                id="username"
                name="username"
                type="email"
                value={form.username}
                onChange={handleChange}
                placeholder="tu@correo.com"
                className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`}
              />
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.username}</span>
                </label>
              )}
            </div>

            {/* Campo contrasena */}
            <PasswordField
              name="password"
              label="Contrasena"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
            />

            <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2 mt-2">
              {loading ? <span className="loading loading-spinner loading-sm" /> : <><LogIn size={18} /> Iniciar sesion</>}
            </button>
          </form>
          ) : (
            <form onSubmit={handleTwoFactorSubmit} className="flex flex-col gap-3" noValidate>
              <div className="alert alert-info">
                <span>Enviamos un codigo de seguridad a tu correo.</span>
              </div>

              <div className="form-control">
                <label className="label" htmlFor="twoFactorCode">
                  <span className="label-text">Codigo 2FA</span>
                </label>
                <input
                  id="twoFactorCode"
                  name="twoFactorCode"
                  type="text"
                  inputMode="numeric"
                  value={twoFactorCode}
                  onChange={handleTwoFactorChange}
                  placeholder="123456"
                  className={`input input-bordered w-full tracking-widest text-center ${errors.twoFactorCode ? "input-error" : ""}`}
                />
                {errors.twoFactorCode && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.twoFactorCode}</span>
                  </label>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2 mt-2">
                {loading ? <span className="loading loading-spinner loading-sm" /> : <><KeyRound size={18} /> Verificar codigo</>}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRequiresTwoFactor(false)}>
                Cambiar credenciales
              </button>
            </form>
          )}

          <div className="divider text-xs">No tienes cuenta?</div>
          <Link href={ROUTES.REGISTRO} className="btn btn-outline btn-secondary w-full btn-sm">
            Registrate aqui
          </Link>
          <Link href={ROUTES.RECUPERAR_CONTRASENA} className="btn btn-ghost w-full btn-sm">
            Olvide mi contrasena
          </Link>
        </div>
      </div>
    </div>
  );
}
