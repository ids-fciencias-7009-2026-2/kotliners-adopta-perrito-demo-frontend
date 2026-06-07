"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import {
  listarReportesPendientes,
  resolverReporte,
  desestimarReporte,
  ReporteResponse,
  Usuario,
} from "@/lib/apiClient";
import { ROUTES } from "@/lib/routes";
import { Shield, Trash2, XCircle, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import AnimalCard from "@/components/AnimalCard";

export default function AdminPage() {
  const checking = useRouteGuard();
  const router = useRouter();
  const [reportes, setReportes] = useState<ReporteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: "resolver" | "desestimar" } | null>(null);
  const [animalPreview, setAnimalPreview] = useState<string | null>(null);

  // Verificar rol admin
  useEffect(() => {
    if (checking) return;
    const raw = sessionStorage.getItem("usuario");
    if (!raw) { router.replace(ROUTES.LOGIN); return; }
    const usuario: Usuario = JSON.parse(raw);
    if (usuario.rol !== "ADMINISTRADOR") {
      router.replace(ROUTES.HOME);
      return;
    }
    cargarReportes();
  }, [checking]);

  async function cargarReportes() {
    setLoading(true);
    setError(null);
    const res = await listarReportesPendientes();
    if (res.ok) {
      setReportes(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }

  async function handleAction(id: string, type: "resolver" | "desestimar") {
    setActionLoading(id);
    const res = type === "resolver" ? await resolverReporte(id) : await desestimarReporte(id);
    if (res.ok) {
      // Quitar todos los reportes del mismo animal
      const reporte = reportes.find((r) => r.id === id);
      if (reporte) {
        setReportes((prev) => prev.filter((r) => r.animalId !== reporte.animalId));
      }
    } else {
      setError(res.error);
    }
    setActionLoading(null);
    setConfirmAction(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Agrupar reportes por animalId, ordenar por cantidad (mayor primero)
  const grouped = reportes.reduce((acc, r) => {
    if (!acc[r.animalId]) acc[r.animalId] = [];
    acc[r.animalId].push(r);
    return acc;
  }, {} as Record<string, ReporteResponse[]>);
  const agrupados = Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length);

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Shield size={32} className="text-primary" />
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : reportes.length === 0 ? (
          <div className="card bg-base-100 shadow p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle size={40} className="text-success" />
              <p className="text-base-content/60">No hay reportes pendientes</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-base-content/60">
              {agrupados.length} publicación(es) reportada(s) · {reportes.length} reporte(s) total(es)
            </p>
            {agrupados.map(([animalId, reportesAnimal]) => (
              <div key={animalId} className="card bg-base-100 shadow">
                <div className="card-body p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-error">{reportesAnimal.length} reporte{reportesAnimal.length > 1 ? "s" : ""}</span>
                        <button
                          onClick={() => setAnimalPreview(animalId)}
                          className="link link-primary text-xs"
                        >
                          Ver publicación
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        {reportesAnimal.map((r) => (
                          <div key={r.id} className="text-sm border-l-2 border-warning pl-2">
                            <span className="text-base-content/70">&quot;{r.motivo}&quot;</span>
                            <span className="text-xs text-base-content/40 ml-2">
                              {new Date(r.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setConfirmAction({ id: reportesAnimal[0].id, type: "resolver" })}
                        disabled={actionLoading === reportesAnimal[0].id}
                        className="btn btn-error btn-sm gap-1"
                      >
                        <Trash2 size={14} /> Eliminar publicación
                      </button>
                      <button
                        onClick={() => setConfirmAction({ id: reportesAnimal[0].id, type: "desestimar" })}
                        disabled={actionLoading === reportesAnimal[0].id}
                        className="btn btn-ghost btn-sm gap-1"
                      >
                        <XCircle size={14} /> Desestimar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de confirmación */}
      {confirmAction && (
        <ConfirmDialog
          open={true}
          title={confirmAction.type === "resolver" ? "¿Eliminar publicación?" : "¿Desestimar reporte?"}
          message={
            confirmAction.type === "resolver"
              ? "Esto eliminará la publicación permanentemente y notificará al cuidador por correo."
              : "El reporte se marcará como revisado sin eliminar la publicación."
          }
          confirmText={confirmAction.type === "resolver" ? "Eliminar" : "Desestimar"}
          onConfirm={() => handleAction(confirmAction.id, confirmAction.type)}
          onCancel={() => setConfirmAction(null)}
          loading={actionLoading === confirmAction.id}
        />
      )}

      {/* Modal preview del animal */}
      {animalPreview && (
        <AnimalCard.DetailModal
          animalId={animalPreview}
          rolUsuario="ADMINISTRADOR"
          onClose={() => setAnimalPreview(null)}
          extraFooter={
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setAnimalPreview(null); const r = reportes.find((x) => x.animalId === animalPreview); if (r) setConfirmAction({ id: r.id, type: "resolver" }); }}
                className="btn btn-error btn-sm gap-1"
              >
                <Trash2 size={14} /> Eliminar publicación
              </button>
              <button
                onClick={() => { setAnimalPreview(null); const r = reportes.find((x) => x.animalId === animalPreview); if (r) setConfirmAction({ id: r.id, type: "desestimar" }); }}
                className="btn btn-ghost btn-sm gap-1"
              >
                <XCircle size={14} /> Desestimar
              </button>
            </div>
          }
        />
      )}
    </div>
  );
}
