import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../hooks/useAuth';

// Placeholder icons (replace with actual icons later)
const SearchIcon = () => <span className="text-text-secondary group-hover:text-accent-primary"></span>; // Removed "Search" text
const BellIcon = () => <span className="text-text-secondary group-hover:text-accent-primary"></span>;
const UserCircleIcon = () => <span className="text-text-secondary group-hover:text-accent-primary">👤</span>; // Added user icon
const MenuIcon = () => <span className="text-text-secondary group-hover:text-accent-primary">Menu</span>;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileSidebar = () => {
    console.log("Toggle mobile sidebar"); // Placeholder
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
            <Link to="/" className="text-2xl font-bold text-accent-primary hover:text-accent-primary-dark transition-colors duration-150 flex-shrink-0">
              Hafidz Tracker
            </Link>
          </div>

          {/* Center: Search Bar (visible on md screens and up, adjusted position) */}
          <div className="hidden md:block flex-grow max-w-xl lg:max-w-2xl px-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="bg-bg-secondary text-text-primary placeholder-text-secondary block w-full pl-10 pr-3 py-2 border border-border-color rounded-2xl leading-5 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary sm:text-sm transition-colors duration-150"
              />
            </div>
          </div>

          {/* Right side: Notifications, User Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button className="p-1 rounded-full text-text-secondary hover:text-accent-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary group transition-colors duration-150">
              <BellIcon />
            </button>

            {isAuthenticated ? (
              <div className="relative flex items-center">
                <button className="flex items-center space-x-2 p-1 rounded-full text-text-secondary hover:text-accent-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary focus:ring-accent-primary group transition-colors duration-150">
                  <UserCircleIcon />
                  <span className="text-sm font-medium text-text-primary hidden sm:block">{user?.name || 'User'}</span>
                </button>
                 <button
                    onClick={handleLogout}
                    className="ml-2 sm:ml-3 bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-2 px-3.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 ring-offset-2 ring-offset-bg-primary ring-accent-primary transition-colors duration-150"
                  >
                    Logout
                  </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 ring-offset-2 ring-offset-bg-primary ring-accent-primary transition-colors duration-150"
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
