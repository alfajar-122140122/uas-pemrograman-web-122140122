import axios from 'axios';
import useAuthStore from '../hooks/useAuth'; // Import the auth store

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:6543/api', // Fallback if .env is not working
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses (e.g., for 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      useAuthStore.getState().logout(); // Call logout from the auth store
      if (window.location.pathname !== '/login') {
         window.location.href = '/login'; // Force redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;
