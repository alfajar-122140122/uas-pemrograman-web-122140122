import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuth';

// Actual SVG icons
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-text-secondary group-hover:text-accent-primary transition-colors duration-150"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);
const BellIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
    />
  </svg>
);
const UserCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);
const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
    />
  </svg>
);

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileSidebar = () => {
    console.log('Toggle mobile sidebar'); // Placeholder
  };

  return (
    <nav className="bg-bg-primary shadow-md fixed top-0 left-0 right-0 z-50 h-16 border-b border-border-color">
      <div className="max-w-screen-xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side: Logo and mobile menu toggle */}
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="text-2xl font-bold text-accent-primary hover:text-accent-primary-dark transition-colors duration-150"
            >
              Hafidz<span className="text-text-primary">Tracker</span>
            </Link>
            {/* Mobile menu button - shown on small screens */}
            <button
              onClick={toggleMobileSidebar}
              className="ml-4 md:hidden text-text-secondary hover:text-accent-primary transition-colors duration-150"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Center: Search bar - hidden on small screens */}
          <div className="hidden md:flex flex-grow max-w-xl mx-4">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Cari..."
                className="block w-full pl-10 pr-3 py-2.5 border border-border-color rounded-lg bg-bg-secondary text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors duration-150 shadow-sm group-hover:border-accent-primary"
              />
            </div>
          </div>

          {/* Right side: Icons and User/Login */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              className="p-2 rounded-full text-text-secondary hover:bg-bg-hover hover:text-accent-primary transition-colors duration-150"
              aria-label="Notifications"
            >
              <BellIcon />
            </button>

            {isAuthenticated && user && (
              <div className="flex items-center space-x-2 text-text-primary">
                <UserCircleIcon />
                {/* Display username */}
                <span className="hidden sm:inline text-sm font-medium">
                  {user.username || 'User'}
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                // Reverted to a style similar to the login button for now
                className="flex items-center space-x-2 bg-accent-primary hover:bg-accent-primary-dark text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors duration-150 shadow-sm text-sm"
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-accent-primary hover:bg-accent-primary-dark text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors duration-150 shadow-sm text-sm"
              >
                Login
              </Link>
            )}
            {/* Fallback for UserIcon if not authenticated and user object is not present */}
            {!isAuthenticated && (
                 <UserCircleIcon className="text-text-secondary" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
