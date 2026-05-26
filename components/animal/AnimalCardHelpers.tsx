"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn, Dog, Cat } from "lucide-react";
import { AdvancedImage } from "@cloudinary/react";
import { getOptimizedImage } from "@/lib/cloudinary";

// ---------------------------------------------------------------------------
// Helpers compartidos
// ---------------------------------------------------------------------------

export function IconoEspecie({ especie, size = 64 }: { especie: string; size?: number }) {
  const esGato = especie.toLowerCase().includes("gato") || especie.toLowerCase().includes("cat");
  return esGato
    ? <Cat size={size} className="text-base-content/30" />
    : <Dog size={size} className="text-base-content/30" />;
}

export function calcularEdad(fechaNacimiento: string) {
  const [y, m, d] = fechaNacimiento.split("-").map(Number);
  if (!y || !m || !d) return "Edad desconocida";
  const hoy = new Date();
  const nacimiento = new Date(y, m - 1, d);
  let anos = hoy.getFullYear() - nacimiento.getFullYear();
  let meses = hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) meses--;
  if (meses < 0) { anos--; meses += 12; }
  if (anos < 0) return "Recien nacido";
  if (anos === 0 && meses <= 0) return "Recien nacido";
  if (anos === 0) return meses === 1 ? "1 mes" : `${meses} meses`;
  if (meses === 0) return anos === 1 ? "1 año" : `${anos} años`;
  return `${anos} ${anos === 1 ? "año" : "años"} y ${meses} ${meses === 1 ? "mes" : "meses"}`;
}

export function FotoImg({ url, alt, className }: { url: string; alt: string; className?: string }) {
  return url.includes("cloudinary.com")
    ? <AdvancedImage cldImg={getOptimizedImage(url, 800, 600)} className={className} alt={alt} />
    : <img src={url} alt={alt} className={className} />;
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

export function Lightbox({ fotos, startIdx, onClose }: { fotos: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + fotos.length) % fotos.length);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % fotos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fotos.length]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-5xl max-h-screen w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <FotoImg url={fotos[idx]} alt={`Foto ${idx + 1}`} className="max-w-full max-h-full object-contain rounded-box" />
        {fotos.length > 1 && (
          <>
            <button onClick={() => setIdx((i) => (i - 1 + fotos.length) % fotos.length)}
              className="absolute left-2 btn btn-circle btn-ghost text-white bg-black/40 hover:bg-black/60">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setIdx((i) => (i + 1) % fotos.length)}
              className="absolute right-2 btn btn-circle btn-ghost text-white bg-black/40 hover:bg-black/60">
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {fotos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/40 w-2"}`} />
              ))}
            </div>
          </>
        )}
        <button onClick={onClose} className="absolute top-2 right-2 btn btn-circle btn-ghost text-white bg-black/40 hover:bg-black/60">
          <X size={20} />
        </button>
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-white/60 text-sm">{idx + 1} / {fotos.length}</span>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------------------------------------------------------
// GaleriaFotos — carrusel con lightbox
// Usa object-contain + object-top para mostrar bien las cabezas de los animales
// ---------------------------------------------------------------------------

export function GaleriaFotos({ fotos, nombre, especie }: { fotos: string[]; nombre: string; especie: string }) {
  const [idx, setIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (fotos.length === 0) {
    return (
      <div className="h-72 bg-base-200 flex items-center justify-center rounded-t-box">
        <IconoEspecie especie={especie} size={80} />
      </div>
    );
  }

  return (
    <>
      <div
        className="relative h-72 bg-base-200 rounded-t-box overflow-hidden group cursor-zoom-in"
        onClick={() => setLightboxOpen(true)}
      >
        {/* object-contain + object-top: muestra la imagen completa priorizando la parte superior (cabeza) */}
        <FotoImg
          url={fotos[idx]}
          alt={`${nombre} ${idx + 1}`}
          className="w-full h-full object-contain object-top"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <ZoomIn size={32} className="text-white drop-shadow" />
        </div>
        {fotos.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + fotos.length) % fotos.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost bg-base-100/70">
              <ChevronLeft size={18} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % fotos.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm btn-ghost bg-base-100/70">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1" onClick={(e) => e.stopPropagation()}>
              {fotos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "bg-primary w-4" : "bg-base-100/70 w-2"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {lightboxOpen && <Lightbox fotos={fotos} startIdx={idx} onClose={() => setLightboxOpen(false)} />}
    </>
  );
}
