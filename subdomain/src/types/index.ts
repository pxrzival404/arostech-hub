import type { Subdomain } from "@/lib/subdomain";

// Product types
export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Subdomain | string;
  subcategory: string;
  description: string;
  specifications: ProductSpecification[];
  images: string[];
  highlights: string[];
  isHighlight: boolean;
  tags: string[];
  specificationMethod?: "manual" | "upload" | "from-specs";
  specificationManualContent?: string;
  specificationFileUrl?: string;
}

// Article types
export interface Article {
  id: string;
  title: string;
  slug: string;
  category: Subdomain | string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  readingTime: number;
  isHighlight: boolean;
  publishedAt: string;
  author: string;
}

export interface Comment {
  id: string;
  articleId: string;
  name: string;
  email: string;
  comment: string;
  createdAt: string;
}

// Company types
export interface Certification {
  name: string;
  description: string;
}

export interface CompanyInfo {
  category: string;
  companyName: string;
  companyDescription: string;
  vision: string;
  mission: string[];
  certifications: Certification[];
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  workingHours: string;
  stats?: {
    projectsCompleted: number;
    yearsExperience: number;
    citiesCovered: number;
  };
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
}

// Site config
export interface SiteConfig {
  name: string;
  description: string;
  category: string;
  domain: string;
  mainDomain: string;
  badgeLabel: string;
}

// RFQ types
export interface RFQCartItem {
  productId: string;
  productName: string;
  productSlug: string;
  productSerial: string;
  subcategory: string;
  quantity: number;
  /** RFQ ID for individually submitted items (single-product / satuan mode) */
  rfqId?: string;
  /** Submission timestamp for individually submitted items */
  submittedAt?: string;
}

export interface RFQFolder {
  id: string;
  name: string;
  description: string;
  items: RFQCartItem[];
  createdAt: string;
  updatedAt: string;
  /** Jika diisi, folder ini sudah pernah diajukan sebagai RFQ */
  submittedAt?: string | null;
  /** ID RFQ yang terkait dengan folder ini */
  submittedRFQId?: string | null;
  /** Subdomain this folder belongs to (for multi-tenant localStorage isolation) */
  subdomain?: string;
}

export interface ClientData {
  companyName: string;
  companyContactPerson: string;
  companyEmail: string;
  companyAddress: string;
  clientName: string;
  email: string;
  phone: string;
  shippingCity: string;
  shippingAddress: string;
}

export type RFQSubmitMethod = "whatsapp" | "pdf" | "email";

export interface RFQSubmission {
  folderId: string;
  clientData: ClientData;
  submitMethod: RFQSubmitMethod;
  submittedAt: string;
}

// Project / Portfolio types
export interface Project {
  id: string;
  title: string;
  slug: string;
  category: Subdomain | string;
  client: string;
  location: string;
  year: number;
  description: string;
  scope: string[];
  results: string[];
  productCategory: string; // PJU LED, PJU Tenaga Surya, Smart PJU
  projectScale: "Kecil" | "Menengah" | "Besar";
  duration: string; // e.g. "3 bulan"
  coverImage: string;
  isHighlight: boolean;
  tags: string[];
}
