module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/jest-environment.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next-auth$': '<rootDir>/jest-environment/next-auth-mock.js',
    '^next-auth/jwt$': '<rootDir>/jest-environment/next-auth-jwt-mock.js',
    '^next-auth/providers/google$': '<rootDir>/jest-environment/next-auth-providers-google-mock.js',
    '^next-auth/providers/credentials$': '<rootDir>/jest-environment/next-auth-providers-credentials-mock.js',
  },
  testMatch: [
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '**/src/**/*.test.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: ['/\\.next/', '/node_modules/'],
  testTimeout: 15000,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
}
