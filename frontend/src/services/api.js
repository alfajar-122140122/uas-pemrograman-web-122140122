import axios from 'axios';
import useAuthStore from '../hooks/useAuth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:6543/api', // Fallback if .env is not working
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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

// Interceptor to handle responses (e.g., for 401 Unauthorized, 403 Forbidden)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific HTTP error status codes
      switch (error.response.status) {
        case 401: // Unauthorized
          // Handle unauthorized access, redirect to login
          useAuthStore.getState().logout(); // Call logout from the auth store
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        
        case 403: // Forbidden
          // You might want to show a different message for forbidden vs unauthorized
          console.error('Forbidden access:', error.response.data);
          break;
          
        case 404: // Not Found
          console.error('Resource not found:', error.response.data);
          break;
          
        case 500: // Server Error
          console.error('Server error:', error.response.data);
          break;
          
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error: No response received from server');
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
