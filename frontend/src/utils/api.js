import axios from 'axios';

// Set the default base URL for API requests
const API_URL = 'http://localhost:6543/api'; // Update this to match your Pyramid backend URL

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Set up request interceptor to add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API functions
export const AuthAPI = {
  // Register a new user
  register: async (userData) => {
    return await axios.post('/auth/register', userData);
  },

  // Login a user
  login: async (credentials) => {
    return await axios.post('/auth/login', credentials);
  },

  // Get current user profile
  getCurrentUser: async () => {
    return await axios.get('/auth/me');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  }
};

export default axios;
