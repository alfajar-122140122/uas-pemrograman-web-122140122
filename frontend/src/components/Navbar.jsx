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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Mobile Menu Toggle (visible on small screens) & Logo */}
          <div className="flex items-center">
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 mr-2 rounded-md text-text-secondary hover:text-accent-primary hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary group"
            >
              <MenuIcon />
            </button>
            <Link
              to="/"
              className="text-2xl font-bold text-accent-primary hover:text-accent-primary-dark transition-colors duration-150 flex-shrink-0"
            >
              Hafidz Tracker
            </Link>
          </div>

          {/* Center: Search Bar (visible on md screens and up, adjusted position) */}
          <div className="hidden md:block flex-grow max-w-xl lg:max-w-2xl px-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Cari..."
                className="bg-bg-secondary text-text-primary placeholder-text-secondary block w-full pl-10 pr-4 py-2.5 border border-border-color rounded-xl leading-5 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary sm:text-sm transition-all duration-150 shadow-sm hover:shadow-md focus:shadow-lg"
              />
            </div>
          </div>

          {/* Right side: Notifications, User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button className="p-2 rounded-full text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary group transition-colors duration-150">
              <BellIcon />
            </button>

            {isAuthenticated ? (
              <div className="relative flex items-center">
                <button className="flex items-center space-x-2 p-1.5 rounded-full text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary group transition-colors duration-150">
                  <UserCircleIcon />
                  <span className="text-sm font-medium text-text-primary hidden sm:block group-hover:text-accent-primary transition-colors duration-150">
                    {user?.name || 'User'}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="ml-2 sm:ml-3 bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-bg-primary ring-accent-primary flex items-center space-x-1.5"
                >
                  <LogoutIcon />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-bg-primary ring-accent-primary"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
