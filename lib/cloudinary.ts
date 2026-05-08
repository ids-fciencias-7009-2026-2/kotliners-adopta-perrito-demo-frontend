import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";
import { face } from "@cloudinary/url-gen/qualifiers/focusOn";

/** Instancia de Cloudinary configurada con el cloud name del proyecto. */
export const cld = new Cloudinary({
  cloud: { cloudName: "dhrsbftoc" },
});

/**
 * Genera una imagen optimizada de Cloudinary a partir de una URL completa.
 * Usa fill + face gravity para fotos de perfil — centra en la cara sin cortes raros.
 *
 * @param url URL completa de Cloudinary
 * @param width Ancho deseado (default 400)
 * @param height Alto deseado (default 400)
 */
export function getOptimizedImage(url: string, width = 400, height = 400) {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  const publicId = match ? match[1].replace(/\.[^/.]+$/, "") : url;

  return cld
    .image(publicId)
    .format("auto")
    .quality("auto")
    .resize(fill().width(width).height(height).gravity(focusOn(face())));
}
