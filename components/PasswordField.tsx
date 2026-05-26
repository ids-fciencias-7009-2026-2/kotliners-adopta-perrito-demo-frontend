"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  /** Nombre e id del campo. */
  name: string;
  /** Etiqueta visible. */
  label: string;
  /** Valor controlado. */
  value: string;
  /** Handler de cambio. */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Mensaje de error a mostrar. */
  error?: string;
  /** Placeholder del input. */
  placeholder?: string;
}

/**
 * Campo de contraseña con boton para mostrar u ocultar el texto.
 * Usa el icono Eye/EyeOff de lucide-react y componentes DaisyUI.
 */
export default function PasswordField({
  name, label, value, onChange, error, placeholder,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-control">
      <label className="label" htmlFor={name}>
        <span className="label-text">{label} <span className="text-error">*</span></span>
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? "••••••••"}
          className={`input input-bordered w-full pr-10 ${error ? "input-error" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
