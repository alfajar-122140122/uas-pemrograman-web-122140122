import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// This is a simple Zustand store for authentication state.
// You might want to expand this based on your needs.

const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // Store user information here
      token: null, // Store JWT token
      isAuthenticated: false,

      login: (userData, authToken) => set({ user: userData, token: authToken, isAuthenticated: true }),
      
      logout: () => {
        localStorage.removeItem('token'); // Also clear from actual localStorage if you stored it there directly too
        set({ user: null, token: null, isAuthenticated: false });
      },

      // You can add more actions here, e.g., for checking auth status on app load
      // checkAuth: () => {
      //   const token = localStorage.getItem('token'); // Or from cookie
      //   if (token) {
      //     // Potentially verify token with backend or decode to get user info
      //     // For now, just assume token means authenticated
      //     // You'd fetch user details with this token in a real app
      //     set({ token: token, isAuthenticated: true, user: { name: "User from token" } });
      //   }
      // }
    }),
    {
      name: 'auth-storage', // Name of the item in localStorage
      // getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      // partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }), // Persist only token and user
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
