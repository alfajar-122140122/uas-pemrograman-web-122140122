import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isTokenExpired } from '../utils/jwtUtils';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // Store user information here
      token: null, // Store JWT token
      isAuthenticated: false,

      login: (userData, authToken) => set({ user: userData, token: authToken, isAuthenticated: true }),
      
      logout: () => {
        localStorage.removeItem('token'); // Clear from localStorage
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      // Check if user is authenticated with a valid token
      checkAuth: () => {
        const { token, user } = get();
        
        // If no token or token is expired, user is not authenticated
        if (!token || isTokenExpired(token)) {
          // Clean up if needed
          if (token) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
          }
          return false;
        }
        
        // Token exists and is valid
        return true;
      },
      
      // Function to initialize auth state from localStorage on app load
      initAuth: () => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
          // Try to get user info from token (in a real app, you might want to 
          // validate the token with the server or decode it to get user info)
          try {
            // Just checking if token is valid here
            set({ token, isAuthenticated: true });
            return true;
          } catch (error) {
            console.error('Error initializing auth:', error);
            localStorage.removeItem('token');
          }
        }
        return false;
      }
    }),
    {
      name: 'auth-storage', // Name of the item in localStorage
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;

// How to use in a component:
// import useAuthStore from './path/to/useAuth';
//
// const MyComponent = () => {
//   const { user, login, logout, isAuthenticated } = useAuthStore();
//
//   if (!isAuthenticated) {
//     return <button onClick={() => login({name: "Test User"}, "fake-token")}>Login</button>;
//   }
//
//   return (
//     <div>
//       <p>Welcome, {user?.name}</p>
//       <button onClick={logout}>Logout</button>
//     </div>
//   );
// };
