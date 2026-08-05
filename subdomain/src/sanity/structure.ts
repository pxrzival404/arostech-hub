/**
 * Sanity Studio Custom Structure — Per-Spoke Content Grouping
 *
 * Instead of showing all documents in a flat list,
 * group them by spoke (category) so content editors
 * can easily find and manage content per category.
 *
 * Structure:
 *   📁 PJU
 *     ├── Produk
 *     ├── Artikel
 *     ├── Portfolio
 *     └── Info Perusahaan
 *   📁 Baterai
 *     ├── Produk
 *     ├── ...
 *   📁 Solar Panel
 *     ├── ...
 *   📁 Penangkal Petir
 *     ├── ...
 *   ⚙️ Konfigurasi
 *     └── Spoke Configuration
 */

import type { StructureResolver } from "sanity/structure";

const SPOKE_LIST = [
  { id: "pju", title: "PJU", emoji: "💡" },
  { id: "baterai", title: "Baterai", emoji: "🔋" },
  { id: "solarpanel", title: "Solar Panel", emoji: "☀️" },
  { id: "penangkalpetir", title: "Penangkal Petir", emoji: "⚡" },
];

const CONTENT_TYPES = [
  { type: "product", title: "Produk" },
  { type: "article", title: "Artikel" },
  { type: "portfolioEntry", title: "Portfolio" },
  { type: "companyInfo", title: "Info Perusahaan" },
] as const;

export const structure: StructureResolver = (S) => {
  return S.list()
    .title("Konten")
    .items([
      // Per-spoke content groups
      ...SPOKE_LIST.map((spoke) =>
        S.listItem()
          .title(`${spoke.emoji} ${spoke.title}`)
          .id(`spoke-${spoke.id}`)
          .child(
            S.list()
              .title(`${spoke.title}`)
              .id(`spoke-${spoke.id}-list`)
              .items(
                CONTENT_TYPES.map((content) =>
                  S.listItem()
                    .title(content.title)
                    .id(`spoke-${spoke.id}-${content.type}`)
                    .child(
                      S.documentList()
                        .title(`${content.title} — ${spoke.title}`)
                        .filter(
                          `_type == "${content.type}" && spoke->subdomain == "${spoke.id}"`
                        )
                        .defaultOrdering([
                          { field: "_createdAt", direction: "desc" },
                        ])
                    )
                )
              )
          )
      ),

      // Divider
      S.divider(),

      // Spoke Configuration (global settings)
      S.listItem()
        .title("⚙️ Konfigurasi Spoke")
        .child(
          S.documentList()
            .title("Konfigurasi Spoke")
            .filter('_type == "spokeConfig"')
            .defaultOrdering([{ field: "subdomain", direction: "asc" }])
        ),
    ]);
};
