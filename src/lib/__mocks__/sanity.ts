import { createClient } from '@sanity/client'

const mockFetch = jest.fn()

/**
 * Mock Sanity client for testing.
 */
export const mockSanityClient = {
  createClient: jest.fn(() => ({
    fetch: mockFetch,
    config: jest.fn(() => ({
      projectId: 'mock-project-id',
      dataset: 'production',
      apiVersion: 'v2025-05-21',
    })),
  })),
}

export { mockFetch }

/**
 * Mock fetch responses by query type.
 */
export const mockSanityFetch = {
  products: jest.fn(),
  certifications: jest.fn(),
  portfolio: jest.fn(),
  spokeConfig: jest.fn(),
  page: jest.fn(),
}