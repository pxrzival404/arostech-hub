import { defineType, defineField } from 'sanity'

export const portfolioEntry = defineType({
  name: 'portfolioEntry',
  title: 'Portfolio Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'projectType',
      title: 'Project Type',
      type: 'string',
    }),
    defineField({
      name: 'clientCategory',
      title: 'Client Category',
      type: 'string',
      options: {
        list: [
          { title: 'Government', value: 'Government' },
          { title: 'BUMN', value: 'BUMN' },
          { title: 'Private', value: 'Private' },
          { title: 'EPC', value: 'EPC' },
        ],
      },
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'completionYear',
      title: 'Completion Year',
      type: 'number',
    }),
    defineField({
      name: 'scopeDescription',
      title: 'Scope Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
  ],
})
