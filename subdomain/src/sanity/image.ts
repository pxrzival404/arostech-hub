/**
 * Sanity Image URL Builder
 *
 * Helper untuk generate URL gambar Sanity dengan transformasi
 * (resize, crop, format WebP, quality).
 *
 * Pakai: urlForImage(imageRef).width(800).url()
 */

import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "./client";

const builder = imageUrlBuilder(client);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max");
}

/**
 * Helper untuk generate placeholder URL (low-quality, blur)
 * untuk efek progressive image loading.
 */
export function urlForImagePlaceholder(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max").width(20).blur(10).url();
}
