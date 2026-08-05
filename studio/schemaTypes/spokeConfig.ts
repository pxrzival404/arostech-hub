import { defineType, defineField } from 'sanity'

export const spokeConfig = defineType({
  name: 'spokeConfig',
  title: 'Spoke Configuration',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subdomain',
      title: 'Subdomain',
      type: 'string',
      validation: (rule) => rule.required().lowercase(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'string',
      description: 'Hex code (e.g., #FFFFFF)',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'seoDefaults',
      title: 'SEO Defaults',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'SEO Title', type: 'string' }),
        defineField({
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
        }),
      ],
    }),
  ],
})