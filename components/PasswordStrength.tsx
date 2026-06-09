"use client";

import zxcvbn from "zxcvbn";

const warnings: Record<string, string> = {
  "Straight rows of keys are easy to guess": "Las filas de teclas seguidas son fáciles de adivinar",
  "Short keyboard patterns are easy to guess": "Los patrones cortos de teclado son fáciles de adivinar",
  "Repeats like \"aaa\" are easy to guess": "Las repeticiones como \"aaa\" son fáciles de adivinar",
  "Sequences like abc or 6543 are easy to guess": "Las secuencias como abc o 6543 son fáciles de adivinar",
  "Recent years are easy to guess": "Los años recientes son fáciles de adivinar",
  "Dates are often easy to guess": "Las fechas suelen ser fáciles de adivinar",
  "This is a top-10 common password": "Esta es una de las 10 contraseñas más comunes",
  "This is a top-100 common password": "Esta es una de las 100 contraseñas más comunes",
  "This is a very common password": "Esta es una contraseña muy común",
  "This is similar to a commonly used password": "Es similar a una contraseña de uso común",
  "A word by itself is easy to guess": "Una palabra sola es fácil de adivinar",
  "Names and surnames by themselves are easy to guess": "Los nombres y apellidos solos son fáciles de adivinar",
  "Common names and surnames are easy to guess": "Los nombres y apellidos comunes son fáciles de adivinar",
};

const colors = ["progress-error", "progress-error", "progress-warning", "progress-warning", "progress-success"];
const labels = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
const labelColors = ["text-error", "text-error", "text-warning", "text-warning", "text-success"];

/**
 * Indicador de fortaleza de contraseña con checklist de requisitos.
 */
export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const result = zxcvbn(password);

  return (
    <div className="flex flex-col gap-2">
      <progress className={`progress w-full ${colors[result.score]}`} value={result.score + 1} max={5} />
      <p className={`text-xs font-semibold ${labelColors[result.score]}`}>{labels[result.score]}</p>
      <ul className="text-xs text-base-content/60 flex flex-wrap gap-x-4 gap-y-1">
        <li className={password.length >= 8 ? "text-success" : "text-error"}>
          {password.length >= 8 ? "✓" : "✗"} Mínimo 8 caracteres
        </li>
        <li className={/[A-Z]/.test(password) ? "text-success" : "text-error"}>
          {/[A-Z]/.test(password) ? "✓" : "✗"} Una mayúscula
        </li>
        <li className={/[a-z]/.test(password) ? "text-success" : "text-error"}>
          {/[a-z]/.test(password) ? "✓" : "✗"} Una minúscula
        </li>
        <li className={/[0-9]/.test(password) ? "text-success" : "text-error"}>
          {/[0-9]/.test(password) ? "✓" : "✗"} Un número
        </li>
        <li className={/[^A-Za-z0-9]/.test(password) ? "text-success" : "text-error"}>
          {/[^A-Za-z0-9]/.test(password) ? "✓" : "✗"} Un carácter especial
        </li>
      </ul>
      {result.feedback.warning && (
        <p className="text-xs text-warning">{warnings[result.feedback.warning] ?? result.feedback.warning}</p>
      )}
    </div>
  );
}
