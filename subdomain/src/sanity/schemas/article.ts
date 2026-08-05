/**
 * Sanity Schema: Article (Blog Post)
 *
 * Schema untuk artikel/blog Arostech.
 * Field `spoke` (reference -> spokeConfig) untuk multi-tenant filter.
 *
 * Field `content` memakai custom WYSIWYG Markdown editor (MDXEditor)
 * — bukan textarea biasa. Output tetap string Markdown, di-render
 * pakai ReactMarkdown di web. Lihat src/sanity/components/MarkdownEditorInput.tsx
 */

import { defineField, defineType } from "sanity";
import { MarkdownEditorInput } from "../components/MarkdownEditorInput";

export default defineType({
  name: "article",
  title: "Artikel",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Artikel",
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
        "Spoke (sub-domain) yang memiliki artikel ini. Select salah satu spokeConfig. Wajib diisi.",
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
      name: "excerpt",
      title: "Excerpt (Ringkasan)",
      type: "text",
      rows: 3,
      description: "Ringkasan singkat artikel. Tampil di card artikel dan meta description SEO.",
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "content",
      title: "Konten Artikel",
      type: "text",
      rows: 20,
      description:
        "Konten lengkap artikel. Pakai toolbar di atas editor untuk format (Bold, Heading, List, dll). Output Markdown, di-render sebagai rich text di web.",
      validation: (Rule) => Rule.required(),
      // Custom input component — ganti default textarea dengan WYSIWYG editor
      components: {
        input: MarkdownEditorInput,
      },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt Text",
          type: "string",
        },
      ],
      description: "Gambar cover artikel. Tampil di list artikel dan di atas konten.",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "isHighlight",
      title: "Tampilkan di Homepage?",
      type: "boolean",
      description: "Centang untuk tampilkan di section 'Latest Articles' di homepage.",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Tanggal Publish",
      type: "date",
      description: "Tanggal publikasi artikel. Dipakai untuk sorting & SEO.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description: "Nama penulis artikel. Contoh: Tim Arostech",
      initialValue: "Tim Arostech",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "coverImage",
    },
  },
  orderings: [
    {
      title: "Tanggal Publish (Terbaru)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
