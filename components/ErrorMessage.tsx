"use client";

/**
 * Muestra un mensaje de error usando el componente alert de DaisyUI.
 * No renderiza nada si el mensaje es null o vacio.
 * @param message - Texto del error a mostrar, o null para ocultar.
 */
export default function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" aria-live="assertive" className="alert alert-error">
      <span>{message}</span>
    </div>
  );
}
