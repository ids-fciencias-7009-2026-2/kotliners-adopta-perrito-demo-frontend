"use client";

import { Info, Star, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { useRazaInfo } from "@/hooks/useRazaInfo";

function Estrellas({ valor }: { valor: string }) {
  const n = Math.min(5, Math.max(1, parseInt(valor) || 1));
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={14} className={i <= n ? "fill-warning text-warning" : "text-base-content/20"} />
      ))}
    </div>
  );
}

function BoolIcon({ valor }: { valor: string }) {
  const es = valor === "1" || valor.toLowerCase() === "si" || valor.toLowerCase() === "true";
  return es
    ? <ThumbsUp size={16} className="text-success" />
    : <ThumbsDown size={16} className="text-base-content/30" />;
}

/**
 * Seccion de informacion de raza desde API externa.
 * Muestra texto traducido, estrellas para numericos y like/dislike para booleanos.
 * Fallback silencioso si no hay raza o la API no responde.
 */
export default function SeccionRaza({ especie, razaId }: { especie: string; razaId: string | null }) {
  const { info, estado } = useRazaInfo(especie, razaId);

  if (!razaId) return null;

  if (estado === "cargando") {
    return (
      <div className="rounded-box border border-base-300 p-4 flex items-center gap-3 text-base-content/50">
        <span className="loading loading-spinner loading-sm" />
        <span className="text-sm">Buscando informacion de la raza...</span>
      </div>
    );
  }

  if (estado === "error" || estado === "no_encontrado" || !info) return null;

  const camposTexto = info.campos.filter((c) => c.tipo === "TEXT");
  const camposScore = info.campos.filter((c) => c.tipo === "SCORE");
  const camposBool  = info.campos.filter((c) => c.tipo === "BOOL");

  return (
    <div className="rounded-box border border-primary/20 bg-primary/5 p-4 space-y-4">
      <h2 className="font-semibold flex items-center gap-2 text-primary">
        <Info size={16} />
        Informacion de la raza: {info.nombre}
      </h2>

      {info.imagenUrl && (
        <img
          src={info.imagenUrl}
          alt={info.nombre}
          className="w-full max-h-48 object-contain object-top rounded-box bg-base-200"
        />
      )}

      {camposTexto.length > 0 && (
        <div className="space-y-2">
          {camposTexto.map(({ etiqueta, valor }) => (
            <div key={etiqueta} className="text-sm">
              <span className="font-medium text-xs text-base-content/50 block mb-0.5">{etiqueta}</span>
              <p className="text-base-content/80 leading-relaxed">{valor}</p>
            </div>
          ))}
        </div>
      )}

      {camposScore.length > 0 && (
        <div>
          <p className="text-xs font-medium text-base-content/50 mb-2">Caracteristicas (1-5)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {camposScore.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="flex flex-col gap-0.5">
                <span className="text-xs text-base-content/60">{etiqueta}</span>
                <Estrellas valor={valor} />
              </div>
            ))}
          </div>
        </div>
      )}

      {camposBool.length > 0 && (
        <div>
          <p className="text-xs font-medium text-base-content/50 mb-2">Caracteristicas</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {camposBool.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="flex items-center gap-2 text-sm">
                <BoolIcon valor={valor} />
                <span className="text-base-content/70">{etiqueta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {info.wikipediaUrl && (
        <a href={info.wikipediaUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline">
          <ExternalLink size={12} /> Ver en Wikipedia
        </a>
      )}

      <p className="text-xs text-base-content/30 text-right">
        Fuente: {especie.toUpperCase().includes("GATO") ? "The Cat API" : "The Dog API"}
      </p>
    </div>
  );
}
