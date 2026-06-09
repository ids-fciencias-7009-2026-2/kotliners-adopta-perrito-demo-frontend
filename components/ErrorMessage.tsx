"use client";

import { CircleAlert } from "lucide-react";

/**
 * Muestra un mensaje de error con ícono usando alert de DaisyUI.
 * No renderiza nada si el mensaje es null o vacío.
 */
export default function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" aria-live="assertive" className="alert alert-error text-sm">
      <CircleAlert size={16} />
      <span>{message}</span>
    </div>
  );
}
