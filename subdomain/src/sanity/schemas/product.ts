/**
 * Sanity Schema: Product
 *
 * Schema untuk produk Arostech (PJU, panel surya, dll).
 * Field `spoke` (reference -> spokeConfig) untuk multi-tenant filter.
 * Multi-tenant pattern diadopsi dari main domain (pampam666/dayaberkah).
 *
 * Updated: Spec PDF is auto-generated from technical specifications.
 */

import { defineField, defineType } from "sanity";
import { SpecificationPdfInput } from "../components/SpecificationPdfInput";

export default defineType({
  name: "product",
  title: "Produk",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nama Produk",
      type: "string",
      description: "Contoh: PJU LED 100W Smart Series",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      description: "URL-friendly identifier. Klik 'Generate' untuk auto dari Nama Produk.",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "spoke",
      title: "Spoke",
      type: "reference",
      description:
        "Spoke (sub-domain) yang memiliki produk ini. Select salah satu spokeConfig. Wajib diisi.",
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
          { title: "Baterai", value: "baterai" },
          { title: "Solar Panel", value: "solarpanel" },
          { title: "Penangkal Petir", value: "penangkalpetir" },
        ],
      },
      description: "Kategori produk. Harus sesuai dengan spoke yang dipilih di atas (otomatis disinkronkan).",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "subcategory",
      title: "Sub-Kategori",
      type: "string",
      description: "Contoh: PJU LED, PJU Tenaga Surya, Smart PJU",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Deskripsi Produk",
      type: "text",
      rows: 6,
      description: "Deskripsi lengkap produk. Akan ditampilkan di halaman detail produk.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "specifications",
      title: "Spesifikasi Teknis",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "value", title: "Nilai", type: "string" },
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        },
      ],
      description: "Daftar spesifikasi teknis (Daya, Lumens, IP Rating, dll).",
    }),
    defineField({
      name: "images",
      title: "Gambar Produk",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
              description: "Deskripsi gambar untuk accessibility & SEO",
            },
          ],
        },
      ],
      description: "Upload gambar produk. Gambar pertama akan jadi thumbnail di list produk.",
    }),
    defineField({
      name: "highlights",
      title: "Highlight Produk",
      type: "array",
      of: [{ type: "string" }],
      description: "Poin-poin unggulan produk. Tampil sebagai checklist di halaman detail.",
    }),
    defineField({
      name: "isHighlight",
      title: "Tampilkan di Homepage?",
      type: "boolean",
      description: "Centang untuk tampilkan produk ini di section 'Featured Products' di homepage.",
      initialValue: false,
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      description: "Tags untuk search & filter. Contoh: led, pju, 100w, jalan-raya",
      options: { layout: "tags" },
    }),
    // ===== Specification PDF System =====
    // specificationMethod is hardcoded to "from-specs" — hidden from Studio UI
    // since there's only one option. The value is set automatically.
    defineField({
      name: "specificationFileUrl",
      title: "URL File Spec (PDF)",
      type: "string",
      description: "URL ke file spec PDF. Klik tombol Generate di bawah untuk membuat PDF dari Spesifikasi Teknis.",
      components: {
        input: SpecificationPdfInput,
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "subcategory",
      media: "images.0",
    },
  },
  orderings: [
    {
      title: "Nama (A-Z)",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Spoke + Nama",
      name: "spokeName",
      by: [
        { field: "spoke", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
});
