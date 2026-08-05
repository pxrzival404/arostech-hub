import type {
  ProductWithRelations,
  Certification,
  PortfolioWithRelations,
  SpokeConfigWithProducts,
  PageWithSpoke,
  PortableTextBlock,
} from '../types'

export const mockProduct = (overrides?: Partial<ProductWithRelations>): ProductWithRelations => ({
  _id: 'product-1',
  _type: 'product',
  title: 'Solar Panel',
  slug: 'solar-panel',
  spoke: {
    _id: 'spoke-1',
    subdomain: 'pju',
    name: 'Penerangan Jalan Umum',
  },
  shortDescription: 'Reliable and high efficiency solar panels.',
  fullDescription: [
    {
      _key: 'block-1',
      _type: 'block',
      style: 'normal',
      children: [{ _type: 'span', text: 'Full description text' }],
    },
  ] as PortableTextBlock[],
  specifications: [
    { key: 'Power', value: '100W' },
    { key: 'Efficiency', value: '20%' },
  ],
  images: [
    {
      _key: 'img-1',
      _type: 'image',
      asset: {
        _ref: 'image-abc123-800x600-jpg',
        _type: 'reference',
      },
    },
  ],
  datasheetUrl: 'https://cdn.sanity.io/files/abcdef12/production/abc123.pdf',
  relatedCertifications: [
    { _id: 'cert-1', title: 'SNI', slug: 'sni' },
  ],
  seoMeta: {
    title: 'Solar Panel - DBSN',
    description: 'High efficiency solar panels.',
  },
  ...overrides,
})

export const mockCertification = (overrides?: Partial<Certification>): Certification => ({
  _id: 'cert-1',
  _type: 'certification',
  title: 'Sertifikasi SNI',
  slug: 'sni',
  certificationBody: 'BSN',
  certType: 'SNI',
  issueDate: '2025-01-01',
  expiryDate: '2030-01-01',
  documentUrl: 'https://cdn.sanity.io/files/abcdef12/production/cert123.pdf',
  isIndexable: true,
  seoMeta: {
    title: 'SNI Certification - DBSN',
    description: 'National certification of conformity.',
  },
  ...overrides,
})

export const mockPortfolioEntry = (overrides?: Partial<PortfolioWithRelations>): PortfolioWithRelations => ({
  _id: 'port-1',
  _type: 'portfolioEntry',
  title: 'Solar Installation',
  slug: 'solar-installation',
  projectType: 'EPC',
  clientCategory: 'Government',
  location: 'Jakarta',
  completionYear: 2026,
  scopeDescription: [
    {
      _key: 'block-1',
      _type: 'block',
      style: 'normal',
      children: [{ _type: 'span', text: 'Scope description text' }],
    },
  ] as PortableTextBlock[],
  outcome: 'Successfully installed 500kW panels',
  images: [
    {
      _key: 'img-1',
      _type: 'image',
      asset: {
        _ref: 'image-xyz789-800x600-jpg',
        _type: 'reference',
      },
    },
  ],
  relatedSpoke: {
    _id: 'spoke-1',
    subdomain: 'pju',
    name: 'Penerangan Jalan Umum',
  },
  relatedProducts: [
    { _id: 'product-1', title: 'Solar Panel', slug: 'solar-panel' },
  ],
  seoMeta: {
    title: 'Solar Installation Project - DBSN',
    description: 'EPC solar energy project.',
  },
  ...overrides,
})

export const mockSpokeConfig = (overrides?: Partial<SpokeConfigWithProducts>): SpokeConfigWithProducts => ({
  _id: 'cfg-1',
  _type: 'spokeConfig',
  name: 'PJU',
  subdomain: 'pju',
  tagline: 'Penerangan Jalan Umum Terpercaya',
  primaryColor: '#2563eb',
  featuredProducts: [
    {
      _id: 'product-1',
      title: 'Solar Panel',
      slug: 'solar-panel',
      shortDescription: 'Reliable solar panels',
      images: [
        {
          _key: 'img-1',
          _type: 'image',
          asset: {
            _ref: 'image-abc123-800x600-jpg',
            _type: 'reference',
          },
        },
      ],
    },
  ],
  seoDefaults: {
    title: 'PJU Solutions - DBSN',
    description: 'Solar lighting solutions for cities.',
  },
  ...overrides,
})

export const mockPage = (overrides?: Partial<PageWithSpoke>): PageWithSpoke => ({
  _id: 'page-1',
  _type: 'page',
  title: 'Home Page',
  slug: 'home',
  targetSpoke: {
    _id: 'spoke-1',
    subdomain: 'pju',
    name: 'PJU',
  },
  sections: [
    {
      _key: 'block-1',
      _type: 'block',
      style: 'normal',
      children: [{ _type: 'span', text: 'Section content' }],
    },
  ] as PortableTextBlock[],
  seoMeta: {
    title: 'DBSN Home',
    description: 'Welcome to Sentra Daya Sinergi.',
  },
  ...overrides,
})
