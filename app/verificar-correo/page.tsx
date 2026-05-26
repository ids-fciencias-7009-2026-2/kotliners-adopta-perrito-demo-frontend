"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { verificarCorreo } from "@/lib/apiClient";
import { ROUTES } from "@/lib/routes";
import { MailCheck, PawPrint } from "lucide-react";

export default function VerificarCorreoPage() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
    setEmail(params.get("email"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token.trim()) {
      setError("Ingresa el token de verificacion.");
      return;
    }
    setLoading(true);
    const response = await verificarCorreo(token.trim());
    if (response.ok) setSuccess(response.data.mensaje);
    else setError(response.error);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <section className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <PawPrint size={44} className="text-primary" />
            <h1 className="card-title text-2xl">Verificar correo</h1>
            <p className="text-sm text-base-content/60">
              {email ? `Revisa el correo enviado a ${email}.` : "Revisa tu correo e ingresa el token recibido."}
            </p>
          </div>

          <ErrorMessage message={error} />
          {success && <div role="alert" className="alert alert-success"><span>{success}</span></div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="token">
                <span className="label-text">Token de verificacion</span>
              </label>
              <input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Token recibido por correo"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2">
              {loading ? <span className="loading loading-spinner loading-sm" /> : <><MailCheck size={18} /> Verificar</>}
            </button>
          </form>

          <Link href={ROUTES.LOGIN} className="btn btn-ghost btn-sm">
            Ir a iniciar sesion
          </Link>
        </div>
      </section>
    </main>
  );
}
