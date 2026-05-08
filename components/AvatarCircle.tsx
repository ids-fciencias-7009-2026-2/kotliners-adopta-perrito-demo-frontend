"use client";

import { useState } from "react";
import { AdvancedImage } from "@cloudinary/react";
import { getOptimizedImage } from "@/lib/cloudinary";

interface AvatarCircleProps {
  fotoPerfil?: string | null;
  nombre?: string | null;
  /** Tailwind size class number (e.g. 7 = w-7, 24 = w-24) */
  size?: number;
}

/**
 * Avatar circular con fallback a inicial del nombre.
 * - Si hay foto de Cloudinary: muestra imagen optimizada
 * - Si hay foto de otra URL: muestra con <img> y fallback en onError
 * - Si no hay foto o la imagen falla: muestra inicial sobre fondo primario
 */
export default function AvatarCircle({ fotoPerfil, nombre, size = 10 }: AvatarCircleProps) {
  const [imgError, setImgError] = useState(false);

  const inicial = nombre?.charAt(0)?.toUpperCase() ?? "?";
  const showFoto = fotoPerfil && !imgError;
  const isCloudinary = fotoPerfil?.includes("cloudinary.com");

  const sizeClass = `w-${size}`;
  const textSize = size <= 8 ? "text-xs" : size <= 16 ? "text-lg" : "text-3xl";

  return (
    <div className={`avatar ${!showFoto ? "placeholder" : ""}`}>
      <div className={`${sizeClass} rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 bg-primary text-primary-content overflow-hidden`}>
        {showFoto ? (
          isCloudinary ? (
            <AdvancedImage
              cldImg={getOptimizedImage(fotoPerfil!, size * 4, size * 4)}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <img
              src={fotoPerfil!}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <span className={`font-bold ${textSize} flex items-center justify-center w-full h-full`}>
            {inicial}
          </span>
        )}
      </div>
    </div>
  );
}
