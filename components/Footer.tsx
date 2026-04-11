/**
 * Pie de página global de la aplicación.
 * Se muestra en todas las vistas a través del layout principal.
 */
export default function Footer() {
  return (
    <footer className="footer footer-center bg-base-300 text-base-content p-4 mt-auto">
      <p className="text-sm">
        🐾 Colitas Felices © {new Date().getFullYear()} — Adoptando con amor
      </p>
    </footer>
  );
}
