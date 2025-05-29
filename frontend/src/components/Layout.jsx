import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar'; // This is the top bar
import Footer from './Footer'; // Import the Footer component

// Using Heroicons (outline style) as SVGs for better visual consistency
const HomeIcon = () => (
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
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5"
    />
  </svg>
);
const BookOpenIcon = () => (
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
      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V3.75m0 12.582A8.966 8.966 0 0 1 6 18H4.5a1.125 1.125 0 0 1-1.125-1.125V9.75M18 18h1.5a1.125 1.125 0 0 0 1.125-1.125V9.75M12 3.75h.008v.008H12V3.75Z"
    />
  </svg>
);
const CalendarIcon = () => (
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
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-3.75h.008v.008H12v-.008Z"
    />
  </svg>
);
const ChartBarIcon = () => (
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
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
    />
  </svg>
);

const navLinks = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/quran', label: 'Al-Qur\'an', icon: BookOpenIcon },
  { href: '/reminder', label: 'Muraja\'ah', icon: CalendarIcon },
  { href: '/chart', label: 'Progress', icon: ChartBarIcon },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside
          className={`
            w-60 bg-bg-primary p-4 space-y-4 fixed top-16 left-0 h-[calc(100vh-4rem)] 
            flex flex-col shadow-lg overflow-y-auto border-r border-border-color 
            transform transition-transform duration-300 ease-in-out z-40
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <nav className="mt-3 flex-grow">
            <ul className="space-y-1.5">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.href ||
                  (link.href !== '/' && location.pathname.startsWith(link.href));
                return (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className={`flex items-center space-x-3 py-2.5 px-3 rounded-lg hover:bg-accent-primary/10 hover:text-accent-primary-dark transition-all duration-200 ease-in-out group
                        ${
                          isActive
                            ? 'bg-accent-primary/10 text-accent-primary-dark font-semibold shadow-sm border-l-4 border-accent-primary'
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                      <link.icon className={`w-5 h-5 ${isActive ? 'text-accent-primary-dark' : 'text-text-secondary group-hover:text-accent-primary-dark transition-colors duration-200'}`} />
                      <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Optional: Footer in Sidebar */}
          {/* <div className="mt-auto p-2 text-center text-xs text-text-secondary">
            Hafidz Tracker v1.0
          </div> */}
        </aside>

        {/* Main Content Area */}
        <main
          className={`
            flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'lg:ml-60' : 'ml-0'}
          `}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
