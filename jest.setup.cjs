require('@testing-library/jest-dom')

jest.mock('./src/lib/api/sanity/image', () => {
  try {
    const state = expect.getState()
    if (state.testPath && state.testPath.includes('image.test')) {
      return jest.requireActual('./src/lib/api/sanity/image')
    }
  } catch (e) {
    // expect.getState is not yet defined during early init
  }

  return {
    getOptimizedImageUrl: jest.fn(() => 'https://mocked-sanity-image.url'),
    urlForImage: jest.fn(() => ({
      image: jest.fn().mockReturnThis(),
      width: jest.fn().mockReturnThis(),
      height: jest.fn().mockReturnThis(),
      quality: jest.fn().mockReturnThis(),
      auto: jest.fn().mockReturnThis(),
      url: jest.fn(() => 'https://mocked-sanity-image.url'),
    })),
    sanityImageLoader: jest.fn(() => 'https://mocked-sanity-image.url'),
  }
})

const React = require('react')

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion')
  
  const motionMock = new Proxy(
    {},
    {
      get: (target, key) => {
        return React.forwardRef(({ children, ...props }, ref) => {
          const cleanProps = { ...props }
          delete cleanProps.animate
          delete cleanProps.initial
          delete cleanProps.variants
          delete cleanProps.transition
          delete cleanProps.whileHover
          delete cleanProps.whileTap
          delete cleanProps.viewport
          delete cleanProps.exit
          delete cleanProps.layout
          
          return React.createElement(key, { ...cleanProps, ref }, children)
        })
      },
    }
  )

  return {
    ...actual,
    motion: motionMock,
    useInView: jest.fn(() => true),
    AnimatePresence: ({ children }) => children,
  }
})


