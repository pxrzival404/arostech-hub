require('@testing-library/jest-dom')

// Override window.location after jsdom has been initialized
const originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location')

Object.defineProperty(window, 'location', {
  get() {
    return global.__mockLocation
  },
  set(value) {
    Object.assign(global.__mockLocation, value)
  },
  configurable: true,
})
