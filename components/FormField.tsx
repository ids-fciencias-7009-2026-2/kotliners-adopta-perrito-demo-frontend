"use client";

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
