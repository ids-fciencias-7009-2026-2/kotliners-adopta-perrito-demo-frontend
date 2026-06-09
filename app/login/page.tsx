"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import PasswordField from "@/components/PasswordField";
import { login, verificar2fa, getPerfil, verificarCorreo } from "@/api/authApi";
import { ROUTES } from "@/lib/routes";
import { PawPrint, LogIn, ShieldCheck, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificado, setVerificado] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [paso2fa, setPaso2fa] = useState(false);
  const [email2fa, setEmail2fa] = useState("");
  const [codigo, setCodigo] = useState("");

  // Verificar correo si viene con ?verificar=TOKEN
  useEffect(() => {
    const token = searchParams.get("verificar");
    if (!token) return;
    verificarCorreo(token)
      .then(() => { setVerificado(true); setServerError(null); })
      .catch(() => { if (!verificado) setServerError("El enlace de verificación es inválido o ya expiró."); });
  }, [searchParams]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "username" ? value.toLowerCase() : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) newErrors.username = "Ingresa tu correo electrónico para continuar.";
    else if (!/\S+@\S+\.\S+/.test(form.username)) newErrors.username = "El formato del correo no es válido. Ejemplo: tu@correo.com";
    if (!form.password.trim()) newErrors.password = "Ingresa tu contraseña para continuar.";
    else if (form.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ email: form.username, password: form.password });
      if (res.data.requiere2fa) {
        setEmail2fa(res.data.email);
        setPaso2fa(true);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data;
      if (status === 423) setServerError("Tu cuenta está bloqueada temporalmente por múltiples intentos fallidos. Intenta en 15 minutos.");
      else if (status === 403) setServerError("Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.");
      else setServerError(typeof msg === "string" ? msg : "No pudimos iniciar sesión. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerificar2fa(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!codigo.trim() || codigo.length !== 6) {
      setServerError("Ingresa el código de 6 dígitos que recibiste por correo.");
      return;
    }
    setLoading(true);
    try {
      const res = await verificar2fa(email2fa, codigo);
      const token = res.data.token;
      sessionStorage.setItem("user_token", token);
      document.cookie = "user_session=1; path=/; SameSite=Strict";
      const perfilResponse = await getPerfil();
      sessionStorage.setItem("usuario", JSON.stringify(perfilResponse.data));
      const destino = perfilResponse.data.rol === "ADMINISTRADOR" ? ROUTES.ADMIN : ROUTES.HOME;
      router.push(destino);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data;
      if (status === 410) setServerError("El código ha expirado. Inicia sesión de nuevo.");
      else if (status === 401) setServerError("Código incorrecto. Revisa tu correo e intenta de nuevo.");
      else setServerError(typeof msg === "string" ? msg : "Error al verificar el código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">

          {!paso2fa ? (
            <>
              {/* Paso 1: Credenciales */}
              <div className="flex flex-col items-center gap-2">
                <PawPrint size={48} className="text-primary" />
                <h1 className="card-title text-2xl">Bienvenido</h1>
                <p className="text-base-content/60 text-sm text-center">Inicia sesión en Colitas Felices</p>
              </div>

              <ErrorMessage message={serverError} />

              {verificado && (
                <div className="alert alert-success text-sm">
                  <CheckCircle size={16} />
                  <span>Correo verificado. Ya puedes iniciar sesión.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
                <div className="form-control">
                  <label className="label" htmlFor="username">
                    <span className="label-text">Correo electrónico</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="email"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    aria-describedby={errors.username ? "username-error" : undefined}
                    className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`}
                  />
                  {errors.username && (
                    <label className="label" id="username-error">
                      <span className="label-text-alt text-error">{errors.username}</span>
                    </label>
                  )}
                </div>

                <PasswordField
                  name="password"
                  label="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                />

                <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2 mt-2">
                  {loading ? <span className="loading loading-spinner loading-sm" /> : <><LogIn size={18} /> Iniciar sesión</>}
                </button>
              </form>

              <Link href="/recuperar" className="text-xs text-primary hover:underline text-right mt-1">
                ¿Olvidaste tu contraseña?
              </Link>

              <div className="divider text-xs">No tienes cuenta?</div>
              <Link href={ROUTES.REGISTRO} className="btn btn-outline btn-secondary w-full btn-sm">
                Regístrate aquí
              </Link>
            </>
          ) : (
            <>
              {/* Paso 2: Código 2FA */}
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck size={48} className="text-primary" />
                <h1 className="card-title text-2xl">Verificación</h1>
                <p className="text-base-content/60 text-sm text-center">
                  Ingresa el código de 6 dígitos que enviamos a <strong>{email2fa}</strong>
                </p>
              </div>

              <ErrorMessage message={serverError} />

              <form onSubmit={handleVerificar2fa} className="flex flex-col gap-3" noValidate>
                <div className="form-control">
                  <label className="label" htmlFor="codigo">
                    <span className="label-text">Código de verificación</span>
                  </label>
                  <input
                    id="codigo"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="input input-bordered w-full text-center text-2xl tracking-widest"
                    autoFocus
                  />
                </div>

                <button type="submit" disabled={loading || codigo.length !== 6} className="btn btn-primary w-full gap-2 mt-2">
                  {loading ? <span className="loading loading-spinner loading-sm" /> : <><ShieldCheck size={18} /> Verificar</>}
                </button>
              </form>

              <button onClick={() => { setPaso2fa(false); setCodigo(""); setServerError(null); }} className="btn btn-ghost btn-sm mt-2">
                ← Volver al login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
