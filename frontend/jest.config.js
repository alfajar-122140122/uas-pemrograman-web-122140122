/**
 * @jest-environment jsdom
 */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    // Untuk file JSX and JS
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!vite/|recharts|@babel/runtime|d3-.+|@emotion/react)' // More permissive for recharts and related deps
  ],
  moduleNameMapper: {
    // Mock untuk CSS dan file statis
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/main.jsx'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
