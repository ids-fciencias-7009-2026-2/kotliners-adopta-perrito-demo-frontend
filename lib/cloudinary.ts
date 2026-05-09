import { Cloudinary } from "@cloudinary/url-gen";
import { fill, fit } from "@cloudinary/url-gen/actions/resize";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";
import { face } from "@cloudinary/url-gen/qualifiers/focusOn";

export const cld = new Cloudinary({
  cloud: { cloudName: "dhrsbftoc" },
});

function extractPublicId(url: string): string {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  return match ? match[1].replace(/\.[^/.]+$/, "") : url;
}

/**
 * Foto de perfil — crop cuadrado centrado en la cara.
 * Ideal para avatares circulares.
 */
export function getProfileImage(url: string, size = 96) {
  return cld
    .image(extractPublicId(url))
    .format("auto")
    .quality("auto")
    .resize(fill().width(size).height(size).gravity(focusOn(face())));
}

/**
 * Foto de animal — imagen completa sin recortar, ajustada al contenedor.
 * Usa "fit" para que la imagen quepa sin cortes.
 */
export function getOptimizedImage(url: string, width = 600, height = 400) {
  return cld
    .image(extractPublicId(url))
    .format("auto")
    .quality("auto")
    .resize(fit().width(width).height(height));
}
