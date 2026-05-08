import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

/** Instancia de Cloudinary configurada con el cloud name del proyecto. */
export const cld = new Cloudinary({
  cloud: { cloudName: "dhrsbftoc" },
});

/**
 * Genera una imagen optimizada de Cloudinary a partir de una URL completa.
 * Extrae el public_id de la URL y aplica auto-format, auto-quality y resize.
 *
 * @param url URL completa de Cloudinary (ej: https://res.cloudinary.com/dhrsbftoc/image/upload/v123/colitas/perfiles/abc.jpg)
 * @param width Ancho deseado (default 400)
 * @param height Alto deseado (default 400)
 */
export function getOptimizedImage(url: string, width = 400, height = 400) {
  // Extraer el public_id de la URL de Cloudinary
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  const publicId = match ? match[1].replace(/\.[^/.]+$/, "") : url;

  return cld
    .image(publicId)
    .format("auto")
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(width).height(height));
}
