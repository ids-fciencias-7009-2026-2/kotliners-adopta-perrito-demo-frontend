"use client";

import { useEffect, useState } from "react";
import { actualizarPerfil, obtenerPerfil, Usuario } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { User, Pencil, X, Save } from "lucide-react";

/** Pagina de perfil del usuario autenticado. Ruta protegida: /profile */
export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Usuario & { fotoPerfil?: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /** Carga el perfil desde el backend al montar el componente. */
  useEffect(() => {
    const token = getToken();
    if (!token) { window.location.href = ROUTES.LOGIN; return; }
    obtenerPerfil(token).then((res) => {
      if (!res.ok) return; // El evento session:expired se encarga de redirigir
      sessionStorage.setItem("usuario", JSON.stringify(res.data));
      setUsuario(res.data);
      setForm(res.data);
    });
  }, []);

  /** Actualiza el campo del formulario y limpia mensajes de estado. */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  }

  /** Envia los cambios al backend y actualiza sessionStorage. */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const token = getToken();
    if (!token) { setError("Sesion expirada"); setLoading(false); return; }
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
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 p-6">
      <div className="max-w-xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body gap-4">

            {/* Encabezado */}
            <div className="flex justify-between items-center">
              <h1 className="card-title text-2xl gap-2">
                <User size={24} className="text-primary" />
                Mi perfil
              </h1>
              <button
                onClick={() => { setEditing(!editing); setError(null); setSuccess(null); }}
                className="btn btn-sm btn-ghost gap-1"
              >
                {editing ? <><X size={16} /> Cancelar</> : <><Pencil size={16} /> Editar</>}
              </button>
            </div>

            {/* Alertas */}
            {error && (
              <div role="alert" className="alert alert-error">
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div role="alert" className="alert alert-success">
                <span>{success}</span>
              </div>
            )}

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  {form.fotoPerfil ? (
                    <img src={form.fotoPerfil} alt="Foto de perfil" />
                  ) : (
                    <div className="bg-base-200 flex items-center justify-center w-full h-full">
                      <User size={40} className="text-base-content/30" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              {editing && (
                <div className="form-control">
                  <label className="label"><span className="label-text">Foto (URL)</span></label>
                  <input name="fotoPerfil" value={form.fotoPerfil || ""} onChange={handleChange} className="input input-bordered w-full" placeholder="https://..." />
                </div>
              )}

              {/* Tabla de datos en modo vista */}
              {!editing ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <tbody>
                      <tr><th>Nombre(s)</th><td>{usuario.nombres}</td></tr>
                      <tr><th>Apellido paterno</th><td>{usuario.apellidoPaterno}</td></tr>
                      <tr><th>Apellido materno</th><td>{usuario.apellidoMaterno}</td></tr>
                      <tr><th>Correo</th><td>{usuario.email}</td></tr>
                      <tr><th>Codigo postal</th><td>{usuario.codigoPostal}</td></tr>
                      <tr><th>Rol</th><td><span className="badge badge-primary">{usuario.rol}</span></td></tr>
                      <tr><th>Username</th><td>@{usuario.username}</td></tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Campos editables */
                <>
                  {[
                    { label: "Nombre(s)", name: "nombres" },
                    { label: "Apellido paterno", name: "apellidoPaterno" },
                    { label: "Apellido materno", name: "apellidoMaterno" },
                    { label: "Correo", name: "email", type: "email" },
                    { label: "Codigo postal", name: "codigoPostal" },
                  ].map(({ label, name, type = "text" }) => (
                    <div key={name} className="form-control">
                      <label className="label"><span className="label-text">{label}</span></label>
                      <input
                        name={name}
                        type={type}
                        value={form[name] || ""}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>
                  ))}
                  <button type="submit" disabled={loading} className="btn btn-primary w-full gap-2 mt-2">
                    {loading
                      ? <span className="loading loading-spinner loading-sm" />
                      : <><Save size={18} /> Guardar cambios</>}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
