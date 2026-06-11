"use client";

import { marcarAnimalInapropiado, checkReporte, retirarReporte } from "@/lib/apiClient";
import { Flag, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface BotonFlagProps {
  animalId: string;
  nombreAnimal: string;
  rolUsuario?: string;
}

export default function BotonFlag({ animalId, nombreAnimal, rolUsuario }: BotonFlagProps) {
  const [loading, setLoading] = useState(false);
  const [reportado, setReportado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (rolUsuario === "CUIDADOR" || rolUsuario === "ADMINISTRADOR") return;
    checkReporte(animalId).then((res) => {
      if (res.ok && res.data.reportado) setReportado(true);
    });
  }, [animalId, rolUsuario]);

  if (rolUsuario === "CUIDADOR" || rolUsuario === "ADMINISTRADOR") return null;

  async function handleSubmit() {
    if (!motivo.trim()) return;
    setLoading(true);
    setError(null);
    const res = await marcarAnimalInapropiado(animalId, motivo.trim());
    if (res.ok) {
      setReportado(true);
      setModalOpen(false);
      setSuccessOpen(true);
    } else {
      const msg = res.error.toLowerCase();
      if (msg.includes("no existe") || msg.includes("eliminad")) {
        setModalOpen(false);
        setError("Esta publicación ya no existe.");
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  }

  async function handleRetirar() {
    setLoading(true);
    setError(null);
    const res = await retirarReporte(animalId);
    if (res.ok) {
      setReportado(false);
    } else {
      // Si el reporte ya no existe (admin lo resolvió/desestimó), simplemente actualizar UI
      const msg = res.error.toLowerCase();
      if (msg.includes("no tienes") || msg.includes("no encontr") || msg.includes("no existe")) {
        setReportado(false);
      } else {
        setError(res.error);
      }
    }
    setLoading(false);
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {reportado ? (
          <button
            onClick={handleRetirar}
            disabled={loading}
            className="btn btn-outline btn-success gap-2"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : <><Flag size={18} /> Reportado</>}
          </button>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            disabled={loading}
            className="btn btn-outline btn-warning gap-2"
          >
            <Flag size={18} /> Reportar
          </button>
        )}
        {error && (
          <div className="flex items-center gap-1 text-error text-xs">
            <AlertTriangle size={12} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Modal para pedir motivo */}
      {modalOpen && typeof document !== "undefined" && createPortal(
        <div className="modal modal-open">
          <div className="modal-box">
            <button onClick={() => setModalOpen(false)} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <X size={16} />
            </button>
            <h3 className="font-bold text-lg">Reportar publicación</h3>
            <p className="text-sm text-base-content/70 mt-1">
              ¿Por qué consideras que la publicación de <strong>{nombreAnimal}</strong> es inapropiada?
            </p>
            <textarea
              className="textarea textarea-bordered w-full mt-3"
              placeholder="Describe el motivo del reporte..."
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={500}
            />
            {error && <p className="text-error text-xs mt-1">{error}</p>}
            <div className="modal-action">
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost">Cancelar</button>
              <button onClick={handleSubmit} disabled={loading || !motivo.trim()} className="btn btn-warning gap-2">
                {loading ? <span className="loading loading-spinner loading-sm" /> : <><Flag size={16} /> Enviar reporte</>}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        </div>,
        document.body
      )}

      {/* Modal de éxito */}
      {successOpen && typeof document !== "undefined" && createPortal(
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex flex-col items-center gap-3 py-2">
              <CheckCircle size={48} className="text-warning" />
              <h3 className="font-bold text-lg text-center">Reporte enviado</h3>
              <p className="text-center text-base-content/70 text-sm">
                Gracias por reportar a <strong>{nombreAnimal}</strong>. El contenido será revisado.
              </p>
            </div>
            <div className="modal-action">
              <button onClick={() => setSuccessOpen(false)} className="btn btn-primary w-full">Entendido</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSuccessOpen(false)} />
        </div>,
        document.body
      )}
    </>
  );
}
