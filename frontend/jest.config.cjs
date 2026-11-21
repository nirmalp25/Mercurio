/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    // import.meta.env is Vite-only; tests get a static env module instead.
    '^@/shared/config/env$': '<rootDir>/test/envMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|svg|gif|webp)$': '<rootDir>/test/fileMock.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  clearMocks: true,
};
