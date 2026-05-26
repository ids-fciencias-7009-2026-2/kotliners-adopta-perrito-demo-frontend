"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

/**
 * Sección de mapa en la home — redirige a /explorar donde está el mapa real.
 */
export default function MapView() {
  return (
    <div className="h-72 bg-primary/5 rounded-box flex flex-col items-center justify-center gap-4 border border-primary/20">
      <MapPin size={48} className="text-primary/40" />
      <p className="text-base-content/60 text-sm">
        Explora las mascotas disponibles en el mapa interactivo
      </p>
      <Link href="/explorar" className="btn btn-primary gap-2">
        <MapPin size={16} />
        Abrir mapa
      </Link>
    </div>
  );
}
