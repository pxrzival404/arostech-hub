import { describe, it, expect, beforeEach } from '@jest/globals'

const mockBuilderInstance = {
  image: jest.fn().mockReturnThis(),
  width: jest.fn().mockReturnThis(),
  height: jest.fn().mockReturnThis(),
  quality: jest.fn().mockReturnThis(),
  auto: jest.fn().mockReturnThis(),
  url: jest.fn().mockReturnValue('https://cdn.sanity.io/mock-image-url.jpg'),
}

jest.mock('@sanity/image-url', () => {
  const mockFn = jest.fn(() => mockBuilderInstance)
  return {
    __esModule: true,
    default: mockFn,
    createImageUrlBuilder: mockFn,
  }
})

jest.mock('../client', () => ({
  client: {
    projectId: 'mock-project',
    dataset: 'mock-dataset',
  },
}))

describe('Sanity Image URL Builder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call image builder and return URL', async () => {
    const { urlForImage } = await import('../image')
    const source = { _type: 'image' as const, asset: { _ref: 'image-123' } }
    
    const result = urlForImage(source)
    expect(result).toBe(mockBuilderInstance)
    expect(mockBuilderInstance.image).toHaveBeenCalledWith(source)
  })

  it('should get optimized image URL', async () => {
    const { getOptimizedImageUrl } = await import('../image')
    const source = { _type: 'image' as const, asset: { _ref: 'image-123' } }
    
    const result = getOptimizedImageUrl(source, 800, 600, 90)
    expect(result).toBe('https://cdn.sanity.io/mock-image-url.jpg')
    expect(mockBuilderInstance.width).toHaveBeenCalledWith(800)
    expect(mockBuilderInstance.height).toHaveBeenCalledWith(600)
    expect(mockBuilderInstance.quality).toHaveBeenCalledWith(90)
    expect(mockBuilderInstance.auto).toHaveBeenCalledWith('format')
  })

  it('should return null if source is not provided', async () => {
    const { getOptimizedImageUrl } = await import('../image')
    const result = getOptimizedImageUrl(null, 800)
    expect(result).toBeNull()
  })

  it('should act as a Next.js image loader', async () => {
    const { sanityImageLoader } = await import('../image')
    const result = sanityImageLoader({ src: 'image-123', width: 800, quality: 75 })
    expect(result).toBe('https://cdn.sanity.io/mock-image-url.jpg')
    expect(mockBuilderInstance.image).toHaveBeenCalledWith('image-123')
    expect(mockBuilderInstance.width).toHaveBeenCalledWith(800)
    expect(mockBuilderInstance.quality).toHaveBeenCalledWith(75)
  })
})
