import Link from "next/link";
import { PawPrint } from "lucide-react";

/** Página 404 personalizada. Se muestra cuando la ruta no existe. */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="text-center">
        <PawPrint size={80} className="mx-auto text-primary opacity-40 mb-6" />
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <p className="text-xl text-base-content/70 mb-2">Página no encontrada</p>
        <p className="text-base-content/50 mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <Link href="/home" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
