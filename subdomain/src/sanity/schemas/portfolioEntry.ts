/**
 * Sanity Schema: Portfolio Entry (Case Study)
 *
 * Schema untuk project/portfolio Arostech (case study pekerjaan).
 * Field `spoke` (reference -> spokeConfig) untuk multi-tenant filter.
 *
 * RENAMED: sebelumnya `project` (di sub-domain), sekarang `portfolioEntry`
 * untuk konsistensi dengan main domain (pampam666/dayaberkah).
 */

import { defineField, defineType } from "sanity";

export default defineType({
  name: "portfolioEntry",
  title: "Portfolio Entry",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Project",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 120 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "spoke",
      title: "Spoke",
      type: "reference",
      description:
        "Spoke (sub-domain) yang memiliki portfolio entry ini. Select salah satu spokeConfig. Wajib diisi.",
      to: [{ type: "spokeConfig" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "PJU", value: "pju" },
          { title: "Solar Panel", value: "solarpanel" },
          { title: "Penangkal Petir", value: "penangkalpetir" },
          { title: "Baterai", value: "baterai" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "client",
      title: "Klien",
      type: "string",
      description: "Nama instansi/perusahaan klien. Contoh: Dinas Perhubungan Kota Surabaya",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Lokasi",
      type: "string",
      description: "Lokasi project. Contoh: Surabaya, Jawa Timur",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Tahun",
      type: "number",
      description: "Tahun project diselesaikan. Contoh: 2024",
      validation: (Rule) => Rule.required().min(2000).max(2030),
    }),
    defineField({
      name: "description",
      title: "Deskripsi Project",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "scope",
      title: "Scope Pekerjaan",
      type: "array",
      of: [{ type: "string" }],
      description: "List scope pekerjaan yang dilakukan. Tampil sebagai checklist.",
    }),
    defineField({
      name: "results",
      title: "Hasil / Outcome",
      type: "array",
      of: [{ type: "string" }],
      description: "Hasil yang dicapai setelah project selesai. Contoh: 'Penghematan energi 62%'.",
    }),
    defineField({
      name: "productCategory",
      title: "Kategori Produk",
      type: "string",
      description: "Kategori produk yang dipakai. Contoh: PJU LED, PJU Tenaga Surya, Smart PJU",
    }),
    defineField({
      name: "projectScale",
      title: "Skala Project",
      type: "string",
      options: {
        list: [
          { title: "Kecil", value: "Kecil" },
          { title: "Menengah", value: "Menengah" },
          { title: "Besar", value: "Besar" },
        ],
      },
      initialValue: "Menengah",
    }),
    defineField({
      name: "duration",
      title: "Durasi",
      type: "string",
      description: "Durasi pengerjaan project. Contoh: 8 bulan",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt Text", type: "string" }],
    }),
    defineField({
      name: "images",
      title: "Gallery Gambar",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt Text", type: "string" }],
        },
      ],
      description: "Gambar tambahan project (progress, hasil jadi, dll).",
    }),
    defineField({
      name: "isHighlight",
      title: "Tampilkan di Homepage?",
      type: "boolean",
      description: "Centang untuk tampilkan di section 'Featured Projects' di homepage.",
      initialValue: false,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "client",
      media: "coverImage",
    },
  },
  orderings: [
    {
      title: "Tahun (Terbaru)",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
});
