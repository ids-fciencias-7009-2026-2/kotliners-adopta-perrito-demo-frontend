"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PawPrint, KeyRound, Mail } from "lucide-react";
import PasswordField from "@/components/PasswordField";
import ErrorMessage from "@/components/ErrorMessage";
import Link from "next/link";
import axios from "@/api/axios";

export default function RecuperarPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Si hay token → mostrar form de nueva contraseña
  // Si no hay token → mostrar form de solicitud de recuperación
  return token ? <RestablecerForm token={token} /> : <SolicitarForm />;
}

function SolicitarForm() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await axios.post("/usuarios/recuperar", { email });
      setEnviado(true);
    } catch {
      setError("No se pudo procesar la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="card w-full max-w-sm bg-base-100 shadow-xl">
          <div className="card-body items-center text-center gap-4">
            <Mail size={48} className="text-success" />
            <h2 className="card-title">Revisa tu correo</h2>
            <p className="text-base-content/70 text-sm">
              Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link href="/login" className="btn btn-primary btn-sm mt-2">Volver al login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex flex-col items-center gap-2">
            <KeyRound size={48} className="text-primary" />
            <h1 className="card-title text-xl">Recuperar contraseña</h1>
            <p className="text-base-content/60 text-sm text-center">Ingresa tu correo y te enviaremos un enlace.</p>
          </div>
          <ErrorMessage message={error} />
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              className="input input-bordered w-full"
              required
            />
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Enviar enlace"}
            </button>
          </form>
          <Link href="/login" className="btn btn-ghost btn-sm">← Volver al login</Link>
        </div>
      </div>
    </div>
  );
}

function RestablecerForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Mínimo 8 caracteres."); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      await axios.post("/usuarios/restablecer", { token, password });
      setExito(true);
    } catch {
      setError("Token inválido o expirado. Solicita un nuevo enlace.");
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div className="card w-full max-w-sm bg-base-100 shadow-xl">
          <div className="card-body items-center text-center gap-4">
            <PawPrint size={48} className="text-success" />
            <h2 className="card-title">Contraseña actualizada</h2>
            <p className="text-base-content/70 text-sm">Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <Link href="/login" className="btn btn-primary btn-sm mt-2">Ir al login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          <div className="flex flex-col items-center gap-2">
            <KeyRound size={48} className="text-primary" />
            <h1 className="card-title text-xl">Nueva contraseña</h1>
          </div>
          <ErrorMessage message={error} />
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <PasswordField name="password" label="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
            <PasswordField name="confirmPassword" label="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Guardar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
