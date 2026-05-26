"use client";

/**
 * Props del componente FormField.
 */
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
}

/**
 * Campo de formulario reútilizable con etiqueta, input y mensaje de error.
 * Aplica estilos de error automáticamente cuando se proporciona el prop `error`.
 * @param label - Texto de la etiqueta visible.
 * @param name - Nombre del campo (usado como id y name del input).
 * @param type - Tipo del input (text, email, password, etc.). Por defecto "text".
 * @param value - Valor controlado del input.
 * @param onChange - Handler para cambios en el input.
 * @param error - Mensaje de error a mostrar debajo del input.
 * @param placeholder - Texto de placeholder del input.
 * @param required - Si el campo es obligatorio (muestra asterisco rojo).
 */
export default function FormField({
  label, name, type = "text", value, onChange, error, placeholder, required = false,
}: FormFieldProps) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">
        {label}{required && <span className="text-error ml-1">*</span>}
      </legend>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`input w-full ${error ? "input-error" : ""}`}
      />
      {error && <p className="fieldset-label text-error">{error}</p>}
    </fieldset>
  );
}
