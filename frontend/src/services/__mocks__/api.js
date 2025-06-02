// frontend/src/services/__mocks__/api.js
export default {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  // You can add default mock implementations if needed, e.g.:
  // get: jest.fn(() => Promise.resolve({ data: {} })),
  // post: jest.fn(() => Promise.resolve({ data: {} })),
};
