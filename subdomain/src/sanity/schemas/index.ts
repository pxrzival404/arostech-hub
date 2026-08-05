/**
 * Sanity Schema Registry
 *
 * 5 schema types untuk Arostech hub-spoke architecture:
 *   - spokeConfig     : Konfigurasi per spoke (1 dokumen per sub-domain)
 *   - product         : Produk (multi-tenant via spoke reference)
 *   - portfolioEntry  : Project / case study (multi-tenant via spoke reference)
 *   - article         : Artikel / blog post (multi-tenant via spoke reference)
 *   - companyInfo     : Info perusahaan (1 dokumen per spoke)
 *
 * Schema ini dipakai oleh Sanity Studio (untuk UI editor)
 * dan oleh next-sanity client (untuk query data).
 *
 * Konsisten dengan main domain (pampam666/dayaberkah).
 */

import spokeConfig from "./spokeConfig";
import product from "./product";
import portfolioEntry from "./portfolioEntry";
import article from "./article";
import companyInfo from "./company";

export const schemaTypes = [
  spokeConfig,
  product,
  portfolioEntry,
  article,
  companyInfo,
];
