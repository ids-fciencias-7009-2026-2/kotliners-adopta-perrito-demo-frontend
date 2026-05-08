"use client";

/**
 * Modal para confirmar acciones críticas:
 * - Eliminar un animal. 
 * 
 * Se muestra sobre un backdrop que bloquea interacción con el fondo.
 */
type ConfirmDialogProps = {
    /* El modal se muestra solo si `open` es true. */
    open: boolean;
    /* Título del modal. */
    title: string;
    /* Mensaje descriptivo de la acción a confirmar. */
    message: string;
    /* Texto del botón de confirmación. Por defecto "Confirmar". */
    confirmText?: string;
    /* Texto del botón de cancelación. Por defecto "Cancelar". */
    cancelText?: string;
    /* Si true, muestra un spinner en el botón de confirmación y deshabilita ambos botones. */
    loading?: boolean;
    /* Función a ejecutar al confirmar la acción. */
    onConfirm: () => void;
    /* Función a ejecutar al cancelar o cerrar el modal. */
    onCancel: () => void;
};

/**
 * Componente modal para confirmar acciones críticas.
 * 
 * El modal bloquea la interacción con el fondo y se cierra al hacer click fuera del cuadro o al cancelar.
 * El botón de confirmación muestra un spinner y se deshabilita si `loading` es true, para indicar que se está procesando la acción.
 * 
 * 
 * @param props ConfirmDialogProps con la configuración del modal.
 * @returns Un componente modal que se muestra solo si `open` es true.
 */
export default function ConfirmDialog({
    open,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    loading = false,
    onConfirm,
    onCancel,
    }: ConfirmDialogProps) {
    if (!open) return null;
    return (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-box">
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="py-4 text-base-content/70">{message}</p>
            <div className="modal-action">
            <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
                {cancelText}
            </button>
            <button className={`btn btn-error ${loading ? "loading" : ""}`} onClick={onConfirm} disabled={loading}>
                {loading ? "Procesando" : confirmText}
            </button>
            </div>
        </div>
        <div className="modal-backdrop" onClick={onCancel} />
        </div>
    );
}
