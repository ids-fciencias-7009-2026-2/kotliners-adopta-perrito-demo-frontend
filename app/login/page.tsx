"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormField from "@/components/FormField";
import ErrorMessage from "@/components/ErrorMessage";
import { login, getPerfil } from "@/api/authApi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) newErrors.username = "El correo es obligatorio.";
    if (!form.password.trim()) newErrors.password = "La contraseña es obligatoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // Paso 1 — obtenemos el token
      const loginResponse = await login({ email: form.username, password: form.password })
      const token = loginResponse.data.token

      // Paso 2 — guardamos el token en sessionStorage
      sessionStorage.setItem('user_token', token)

      // Paso 3 — obtenemos el perfil (el interceptor ya agrega el token solo)
      const perfilResponse = await getPerfil()
      const usuario = perfilResponse.data

      // Paso 4 — guardamos el usuario en sessionStorage
      sessionStorage.setItem('usuario', JSON.stringify(usuario))

      // Paso 5 — navegamos al home
      router.push('/home')
    } catch {
      setServerError("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="text-center mb-2">
            <span className="text-5xl">🐶</span>
            <h1 className="card-title text-2xl justify-center mt-2">¡Bienvenido!</h1>
            <p className="text-base-content/60 text-sm">Inicia sesión en Colitas Felices</p>
          </div>

          <ErrorMessage message={serverError} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2" noValidate>
            <FormField
              label="Correo electrónico" name="username" type="email"
              value={form.username} onChange={handleChange}
              error={errors.username} placeholder="tu@correo.com" required
            />
            <FormField
              label="Contraseña" name="password" type="password"
              value={form.password} onChange={handleChange}
              error={errors.password} placeholder="••••••••" required
            />
            <button type="submit" disabled={loading} className="btn btn-primary mt-4 w-full">
              {loading ? <span className="loading loading-spinner loading-sm" /> : "🐾 Iniciar sesión"}
            </button>
          </form>

          <div className="divider text-xs">¿No tienes cuenta?</div>
          <Link href="/registro" className="btn btn-outline btn-secondary w-full btn-sm">
            Regístrate aquí 🐱
          </Link>
        </div>
      </div>
    </div>
  );
}
