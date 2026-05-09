"use client";

import { useState } from "react";
import { AdvancedImage } from "@cloudinary/react";
import { getOptimizedImage } from "@/lib/cloudinary";
import { subirFotoAnimal, eliminarFotoAnimal } from "@/lib/apiClient";
import { getToken } from "@/lib/session";
import { Upload, Trash2, Loader } from "lucide-react";

interface GaleriaUploadProps {
  animalId: string;
  fotos: string[];
  onFotosChange: (fotos: string[]) => void;
}

/**
 * Componente de galeria con upload multiple para fotos de animales.
 * - Muestra las fotos existentes en grid
 * - Permite subir nuevas fotos (multiples a la vez)
 * - Permite eliminar fotos existentes
 */
export default function GaleriaUpload({ animalId, fotos, onFotosChange }: GaleriaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const token = getToken();
    if (!token) return;

    setUploading(true);
    setError(null);

    const nuevasUrls: string[] = [];
    for (const file of files) {
      const res = await subirFotoAnimal(token, animalId, file);
      if (res.ok) {
        nuevasUrls.push(res.data.url);
      } else {
        setError(`Error al subir ${file.name}: ${res.error}`);
      }
    }

    if (nuevasUrls.length > 0) {
      onFotosChange([...fotos, ...nuevasUrls]);
    }
    setUploading(false);
    // Reset input
    e.target.value = "";
  }

  async function handleDelete(url: string) {
    const token = getToken();
    if (!token) return;
    setDeletingUrl(url);
    const res = await eliminarFotoAnimal(token, animalId, url);
    if (res.ok) {
      onFotosChange(fotos.filter((f) => f !== url));
    } else {
      setError(res.error);
    }
    setDeletingUrl(null);
  }

  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">Fotos de la mascota</span>
        <span className="label-text-alt text-base-content/40">{fotos.length} foto{fotos.length !== 1 ? "s" : ""}</span>
      </label>

      {error && <div role="alert" className="alert alert-error alert-sm mb-2"><span className="text-xs">{error}</span></div>}

      {/* Grid de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {fotos.map((url) => (
            <div key={url} className="relative group aspect-square rounded-box overflow-hidden bg-base-300">
              {url.includes("cloudinary.com") ? (
                <AdvancedImage
                  cldImg={getOptimizedImage(url, 200, 200)}
                  className="w-full h-full object-cover"
                  alt="Foto mascota"
                />
              ) : (
                <img src={url} alt="Foto mascota" className="w-full h-full object-cover" />
              )}
              {/* Boton eliminar — aparece en hover */}
              <button
                type="button"
                onClick={() => handleDelete(url)}
                disabled={deletingUrl === url}
                className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {deletingUrl === url
                  ? <Loader size={10} className="animate-spin" />
                  : <Trash2 size={10} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Boton de upload */}
      <label className={`btn btn-outline btn-sm gap-2 cursor-pointer w-fit ${uploading ? "loading" : ""}`}>
        {uploading
          ? <><span className="loading loading-spinner loading-xs" /> Subiendo...</>
          : <><Upload size={16} /> Agregar fotos</>}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      <label className="label">
        <span className="label-text-alt text-base-content/40">JPG, PNG o WebP · max 5MB por foto</span>
      </label>
    </div>
  );
}
