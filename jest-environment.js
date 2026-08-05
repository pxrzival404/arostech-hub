/* eslint-disable @typescript-eslint/no-require-imports */
const { TestEnvironment } = require('jest-environment-jsdom')

class CustomJSDOMEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context)
    
    // Copy Node native web APIs to JSDOM environment
    this.global.Request = global.Request
    this.global.Response = global.Response
    this.global.Headers = global.Headers
    this.global.fetch = global.fetch
    Object.defineProperty(this.global, 'crypto', {
      value: require('crypto').webcrypto,
      writable: true,
      configurable: true,
    })
    this.global.TextEncoder = global.TextEncoder || require('util').TextEncoder
    this.global.TextDecoder = global.TextDecoder || require('util').TextDecoder

    // Make location configurable after construction
    try {
      Object.defineProperty(this.global, 'location', {
        get: () => this.global._location,
        set: (value) => {
          this.global._location = value
        },
        configurable: true,
      })
      // Store the current location
      this.global._location = this.global.location
    } catch {
      // Fallback if location can't be redefined
    }
  }
}

module.exports = CustomJSDOMEnvironment

