/**
 * Sanity Schema: Spoke Configuration (Hub-Spoke Architecture)
 *
 * Schema ini diadopsi dari main domain (repo: pampam666/dayaberkah).
 * 1 dokumen `spokeConfig` per spoke (sub-domain):
 *   - pju.dayaberkah.id              → spokeConfig { subdomain: "pju", ... }
 *   - baterai.dayaberkah.id          → spokeConfig { subdomain: "baterai", ... }
 *   - solarpanel.dayaberkah.id       → spokeConfig { subdomain: "solarpanel", ... }
 *   - penangkalpetir.dayaberkah.id   → spokeConfig { subdomain: "penangkalpetir", ... }
 *
 * Schema lain (product, portfolioEntry, article, companyInfo) punya
 * field `spoke: reference -> spokeConfig` untuk multi-tenant filter.
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "spokeConfig",
  title: "Spoke Configuration",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description:
        "Nama display spoke. Contoh: 'Arostech PJU', 'Arostech Baterai'.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subdomain",
      title: "Subdomain",
      type: "string",
      description:
        "Identifier sub-domain (lowercase, tanpa titik). Contoh: 'pju', 'baterai', 'solarpanel', 'penangkalpetir'.",
      validation: (Rule) => Rule.required().lowercase(),
      options: {
        list: [
          { title: "PJU", value: "pju" },
          { title: "Baterai", value: "baterai" },
          { title: "Solar Panel", value: "solarpanel" },
          { title: "Penangkal Petir", value: "penangkalpetir" },
        ],
      },
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      description: "Tagline singkat spoke. Contoh: 'Solusi Penerangan Jalan Umum'.",
    }),
    defineField({
      name: "primaryColor",
      title: "Primary Color",
      type: "string",
      description: "Hex code untuk primary color spoke. Contoh: '#10b981' (emerald).",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image (Legacy)",
      type: "image",
      options: { hotspot: true },
      description: "Hero image default untuk spoke ini (single image, legacy).",
    }),
    defineField({
      name: "heroImages",
      title: "Hero Images (Slideshow)",
      type: "array",
      of: [{
        type: "image",
        options: { hotspot: true },
      }],
      description: "Gambar-gambar untuk hero slideshow di homepage. Upload 4 gambar atau lebih. Jika kosong, akan pakai gambar default.",
      validation: (Rule) => Rule.max(8).warning("Maksimal 8 gambar untuk performa optimal"),
    }),
    defineField({
      name: "seoDefaults",
      title: "SEO Defaults",
      type: "object",
      description: "Default SEO meta untuk spoke. Dipakai kalau halaman tidak set SEO sendiri.",
      fields: [
        defineField({
          name: "title",
          title: "SEO Title",
          type: "string",
          description: "Title tag default. Contoh: 'Arostech PJU - Solusi Penerangan Jalan Umum'.",
        }),
        defineField({
          name: "description",
          title: "SEO Description",
          type: "text",
          rows: 3,
          description: "Meta description default (max 160 char).",
        }),
      ],
    }),
    defineField({
      name: "footerProductLinks",
      title: "Footer Product Links",
      type: "array",
      of: [{
        type: "object",
        fields: [
          defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
          defineField({ name: "href", title: "URL Path", type: "string", description: "Contoh: /products?category=pju-led", validation: (Rule) => Rule.required() }),
        ],
        preview: { select: { title: "label", subtitle: "href" } },
      }],
      description: "Link produk yang ditampilkan di footer section 'Produk'.",
    }),
    defineField({
      name: "heroBadge",
      title: "Hero Badge Text",
      type: "string",
      description: "Badge text di hero section. Contoh: 'Solusi PJU Terpercaya #1 di Indonesia'.",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      description: "Judul utama hero. Contoh: 'Solusi Penerangan Jalan Umum Terpercaya'.",
    }),
    defineField({
      name: "heroDescription",
      title: "Hero Description",
      type: "text",
      rows: 3,
      description: "Deskripsi singkat di hero section.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "subdomain",
      media: "heroImage",
    },
  },
});
