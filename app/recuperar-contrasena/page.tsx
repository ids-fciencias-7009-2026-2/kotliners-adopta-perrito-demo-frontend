"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import PasswordField from "@/components/PasswordField";
import {
  confirmarRecuperacionContrasena,
  solicitarRecuperacionContrasena,
} from "@/lib/apiClient";
import { ROUTES } from "@/lib/routes";
import { KeyRound, Mail, PawPrint } from "lucide-react";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Ingresa un correo valido.");
      return;
    }
    setLoadingRequest(true);
    const response = await solicitarRecuperacionContrasena(email);
    if (response.ok) setSuccess(response.data.mensaje);
    else setError(response.error);
    setLoadingRequest(false);
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token.trim()) {
      setError("Ingresa el token de recuperacion.");
      return;
    }
    if (newPassword.length < 8) {
      setError("La nueva contrasena debe tener al menos 8 caracteres.");
      return;
    }
    setLoadingConfirm(true);
    const response = await confirmarRecuperacionContrasena(token.trim(), newPassword);
    if (response.ok) setSuccess(response.data.mensaje);
    else setError(response.error);
    setLoadingConfirm(false);
  }

  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <section className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <PawPrint size={44} className="text-primary" />
            <h1 className="card-title text-2xl">Recuperar contrasena</h1>
            <p className="text-sm text-base-content/60">
              Solicita un token por correo y usalo para definir una nueva contrasena.
            </p>
          </div>

          <ErrorMessage message={error} />
          {success && <div role="alert" className="alert alert-success"><span>{success}</span></div>}

          <form onSubmit={handleRequest} className="flex flex-col gap-3" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text">Correo electronico</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
                placeholder="tu@correo.com"
              />
            </div>
            <button type="submit" disabled={loadingRequest} className="btn btn-outline btn-primary w-full gap-2">
              {loadingRequest ? <span className="loading loading-spinner loading-sm" /> : <><Mail size={18} /> Enviar token</>}
            </button>
          </form>

          <div className="divider text-xs">Ya tengo token</div>

          <form onSubmit={handleConfirm} className="flex flex-col gap-3" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="token">
                <span className="label-text">Token de recuperacion</span>
              </label>
              <input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Token recibido por correo"
              />
            </div>

            <PasswordField
              name="newPassword"
              label="Nueva contrasena"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimo 8 caracteres"
            />

            <button type="submit" disabled={loadingConfirm} className="btn btn-primary w-full gap-2">
              {loadingConfirm ? <span className="loading loading-spinner loading-sm" /> : <><KeyRound size={18} /> Cambiar contrasena</>}
            </button>
          </form>

          <Link href={ROUTES.LOGIN} className="btn btn-ghost btn-sm">
            Volver a iniciar sesion
          </Link>
        </div>
      </section>
    </main>
  );
}
