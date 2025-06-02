// Import Jest Dom untuk memungkinkan metode tambahan seperti toBeInTheDocument()
import '@testing-library/jest-dom';

// Setup global mocks disini jika diperlukan
global.fetch = jest.fn();

// Mock import.meta.env for Vite environment variables
Object.defineProperty(global, 'import.meta', {
    value: {
      env: {
        VITE_API_BASE_URL: 'http://localhost:6543/api',
        // Add other environment variables used by your application here
      },
    },
    configurable: true, // Allows redefining for other tests if needed
    writable: true, 
  });

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
