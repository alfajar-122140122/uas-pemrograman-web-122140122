import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../hooks/useAuth';

/**
 * A component that checks if the user is authenticated
 * If not, redirects to the login page
 */
const AuthCheck = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check if the token is valid
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    // Redirect to login page and remember the page user tried to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default AuthCheck;
