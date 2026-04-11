"use client";

import { useEffect, useState } from "react";
import { actualizarPerfil } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import ErrorMessage from "@/components/ErrorMessage";
import { ROUTES } from "@/lib/routes";

export default function PerfilPage() {

  const [usuario, setUsuario] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 🔹 cargar sesión
  useEffect(() => {
    const data = sessionStorage.getItem("usuario");
    if (data) {
      const parsed = JSON.parse(data);
      setUsuario(parsed);
      setForm(parsed);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const token = getToken();

    if (!token) {
      setError("Sesión expirada");
      setLoading(false);
      return;
    }

    try {
      const res = await actualizarPerfil(token, {
        nombres: form.nombres,
        apellidoPaterno: form.apellidoPaterno,
        apellidoMaterno: form.apellidoMaterno,
        email: form.email,
        codigoPostal: form.codigoPostal,
        fotoPerfil: form.fotoPerfil || null,
      });

      if (!res.ok) {
        if (res.error === "SESSION_EXPIRED") {
          sessionStorage.clear();
          window.location.href = ROUTES.LOGIN;
          return;
        }
        setError(res.error);
        return;
      }

      sessionStorage.setItem("usuario", JSON.stringify(res.data));
      setUsuario(res.data);
      setForm(res.data);

      setSuccess("Perfil actualizado correctamente");
      setEditing(false);

      setTimeout(() => setSuccess(null), 3000);

    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-xl mx-auto bg-base-100 rounded-box shadow-xl p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">
            👤 Mi perfil
          </h1>

          {/* EDIT BUTTON */}
          <button
            onClick={() => setEditing(!editing)}
            className="btn btn-sm btn-outline"
          >
            {editing ? "Cancelar" : "Editar"}
          </button>
        </div>

        <ErrorMessage message={error} />

        {success && (
          <div className="alert alert-success mt-2">
            <span>{success}</span>
          </div>
        )}

        {/* FOTO */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-base-200 shadow-md">
            {form.fotoPerfil ? (
              <img
                src={form.fotoPerfil}
                alt="Foto"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-4xl">
                👤
              </div>
            )}
          </div>
        </div>

        {/* FORM / VIEW */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* FOTO URL (solo en edición) */}
          {editing && (
            <div>
              <label className="label">Foto (URL)</label>
              <input
                name="fotoPerfil"
                value={form.fotoPerfil || ""}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
          )}

          {/* NOMBRE */}
          <div>
            <label className="label">Nombre(s)</label>
            {editing ? (
              <input
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                className="input w-full"
              />
            ) : (
              <p className="font-semibold">{usuario.nombres}</p>
            )}
          </div>

          {/* APELLIDO P */}
          <div>
            <label className="label">Apellido paterno</label>
            {editing ? (
              <input
                name="apellidoPaterno"
                value={form.apellidoPaterno}
                onChange={handleChange}
                className="input w-full"
              />
            ) : (
              <p className="font-semibold">{usuario.apellidoPaterno}</p>
            )}
          </div>

          {/* APELLIDO M */}
          <div>
            <label className="label">Apellido materno</label>
            {editing ? (
              <input
                name="apellidoMaterno"
                value={form.apellidoMaterno}
                onChange={handleChange}
                className="input w-full"
              />
            ) : (
              <p className="font-semibold">{usuario.apellidoMaterno}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="label">Correo</label>
            {editing ? (
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input w-full"
              />
            ) : (
              <p className="font-semibold">{usuario.email}</p>
            )}
          </div>

          {/* CP */}
          <div>
            <label className="label">Código postal</label>
            {editing ? (
              <input
                name="codigoPostal"
                value={form.codigoPostal}
                onChange={handleChange}
                className="input w-full"
              />
            ) : (
              <p className="font-semibold">{usuario.codigoPostal}</p>
            )}
          </div>

          {/* BOTÓN */}
          {editing && (
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-4"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          )}

        </form>
      </div>
    </main>
  );
}