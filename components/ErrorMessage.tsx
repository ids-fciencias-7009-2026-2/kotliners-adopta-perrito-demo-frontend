"use client";

/**
 * Componente para mostrar mensajes de error del servidor.
 * Si el mensaje es null o vacío, no renderiza nada.
 * @param message - Texto del error a mostrar, o null para ocultar el componente.
 */
export default function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="alert alert-error">
      <span>{message}</span>
    </div>
  );
}
