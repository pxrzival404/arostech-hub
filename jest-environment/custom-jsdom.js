const JSDOMEnvironment = require('jest-environment-jsdom').default

class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config)
    // Make location configurable
    const locationDescriptor = Object.getOwnPropertyDescriptor(this.window, 'location')
    if (locationDescriptor) {
      Object.defineProperty(this.window, 'location', {
        ...locationDescriptor,
        configurable: true,
        writable: true,
      })
    }
  }
}

module.exports = CustomJSDOMEnvironment
