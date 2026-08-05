/**
 * Sanity Schema: Company Info (Singleton per Spoke)
 *
 * Schema untuk informasi perusahaan (satu dokumen per spoke).
 * Field `spoke` (reference -> spokeConfig) untuk multi-tenant filter.
 *
 * Adopted ke main domain (pampam666/dayaberkah) dengan field yang sama.
 */
import { defineField, defineType } from "sanity";

export default defineType({
  name: "companyInfo",
  title: "Info Perusahaan",
  type: "document",
  fields: [
    defineField({
      name: "spoke",
      title: "Spoke",
      type: "reference",
      description:
        "Spoke (sub-domain) yang memiliki companyInfo ini. Satu dokumen companyInfo per spoke.",
      to: [{ type: "spokeConfig" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      initialValue: "pju",
    }),
    defineField({
      name: "companyName",
      title: "Nama Perusahaan",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "companyDescription",
      title: "Deskripsi Perusahaan",
      type: "text",
      rows: 6,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "vision",
      title: "Visi",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "mission",
      title: "Misi",
      type: "array",
      of: [{ type: "string" }],
      description: "List poin misi perusahaan.",
    }),
    defineField({
      name: "certifications",
      title: "Sertifikasi",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Nama Sertifikasi", type: "string" },
            { name: "description", title: "Deskripsi", type: "string" },
          ],
          preview: {
            select: { title: "name", subtitle: "description" },
          },
        },
      ],
    }),
    defineField({
      name: "contactEmail",
      title: "Email Kontak",
      type: "string",
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "contactPhone",
      title: "Telepon",
      type: "string",
    }),
    defineField({
      name: "whatsappNumber",
      title: "Nomor WhatsApp",
      type: "string",
      description: "Format: 6282230261340 (tanpa + atau spasi)",
    }),
    defineField({
      name: "address",
      title: "Alamat",
      type: "string",
    }),
    defineField({
      name: "projectsCompleted",
      title: "Proyek Selesai",
      type: "number",
      description: "Jumlah proyek yang telah diselesaikan (untuk statistik homepage)",
    }),
    defineField({
      name: "yearsExperience",
      title: "Tahun Pengalaman",
      type: "number",
      description: "Jumlah tahun pengalaman perusahaan (untuk statistik homepage)",
    }),
    defineField({
      name: "citiesCovered",
      title: "Kota Terjangkau",
      type: "number",
      description: "Jumlah kota yang terjangkau (untuk statistik homepage)",
    }),
  ],
  preview: {
    select: {
      title: "companyName",
      subtitle: "subdomain",
    },
  },
});
