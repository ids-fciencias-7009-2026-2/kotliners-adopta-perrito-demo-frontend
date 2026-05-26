import { PawPrint } from "lucide-react";

/** Pie de página global. Se muestra en todas las vistas a traves del layout. */
export default function Footer() {
  return (
    <footer className="footer footer-center bg-base-300 text-base-content p-4 mt-auto">
      <p className="flex items-center gap-2 text-sm">
        <PawPrint size={16} />
        Colitas Felices &copy; {new Date().getFullYear()} — Adoptando con amor
      </p>
    </footer>
  );
}
