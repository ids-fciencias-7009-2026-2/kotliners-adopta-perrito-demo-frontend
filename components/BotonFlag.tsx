"use client";

import { marcarAnimalInapropiado } from "@/lib/apiClient";

import { 
    Flag, 
    AlertTriangle, 
    CheckCircle, 
    X 
} from "lucide-react";

import { useState } from "react";
import { createPortal } from "react-dom";

/**
 * Propiedades del modal de confirmación para el reporte de un animal.
 */
interface FlagModalProps {
    open: boolean;
    nombreAnimal: string;
    onClose: () => void;
}

/**
 * Modal de confirmación que se muestra al reportar un animal como inapropiado.
 */
function FlagModal({ 
    open, 
    nombreAnimal, 
    onClose 
}: FlagModalProps) {
    if (!open || typeof document === "undefined") return null;
    return createPortal(
        <div className="modal modal-open">
            <div className="modal-box">
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                    <X size={16} />
                </button>
                <div className="flex flex-col items-center gap-3 py-2">
                    <CheckCircle size={48} className="text-warning" />
                    <h3 className="font-bold text-lg text-center">
                        Reporte enviado
                    </h3>
                    <p className="text-center text-base-content/70 text-sm">
                        Gracias por reportar a{" "}
                        <strong>{nombreAnimal ?? "esta mascota"}</strong>.
                        El contenido será revisado.
                    </p>
                </div>

                <div className="modal-action">
                    <button
                        onClick={onClose}
                        className="btn btn-primary w-full"
                    >
                        Entendido
                    </button>
                </div>
            </div>
            <div
                className="modal-backdrop"
                onClick={onClose}
            />
        </div>,
        document.body
    );
}

/**
 * Propiedades del componente BotonFlag
 */
interface BotonFlagProps {
    // ID del animal a reportar
    animalId: string;
    // Nombre del animal 
    nombreAnimal: string;
    // Rol del usuario 
    rolUsuario?: string;
}

/**
 * Componente BotonFlag para reportar un animal como inapropiado.
 * @param animalId - ID del animal a reportar
 * @param nombreAnimal - Nombre del animal (para mostrar en el modal)
 * @param rolUsuario - Rol del usuario (oculta el boton a cuidadores)
 */
export default function BotonFlag({
    animalId,
    nombreAnimal,
    rolUsuario,
    }: BotonFlagProps) {

    const [loading, setLoading] = useState(false);
    const [reportado, setReportado] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    if (rolUsuario === "CUIDADOR") 
        return null;

    async function handleFlag() {
        setLoading(true);
        setError(null);
        try {
            const res = await marcarAnimalInapropiado(animalId);
            if (res.ok) {
                setReportado(true);
                setModalOpen(true);
            } else {
                setError(res.error);
            }
        } catch {
        setError("No se pudo reportar el animal.");
        } finally {
        setLoading(false);
        }
    }

    return (
        <>
        <div className="flex flex-col gap-1">
            <button
            onClick={handleFlag}
            disabled={loading || reportado}
            className={`btn  gap-2 ${
                reportado ? "btn-success" : "btn-outline btn-warning"
            }`}
            >
            {loading ? (
                <span className="loading loading-spinner loading-sm" />
            ) : (
                <>
                <Flag size={18} />
                {reportado ? "Reportado" : "Reportar"}
                </>
            )}
            </button>

            {error && (
            <div className="flex items-center gap-1 text-error text-xs">
                <AlertTriangle size={12} />
                <span>{error}</span>
            </div>
            )}
        </div>

        <FlagModal
            open={modalOpen}
            nombreAnimal={nombreAnimal}
            onClose={() => setModalOpen(false)}
        />
        </>
    );
}