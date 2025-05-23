import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar'; // This is the top bar

// Placeholder icons for sidebar - replace with actual icons
const HomeIcon = () => <span className="group-hover:text-accent-primary">🏠</span>;
const BookOpenIcon = () => <span className="group-hover:text-accent-primary">📖</span>;
const CalendarIcon = () => <span className="group-hover:text-accent-primary">📅</span>;
const ChartBarIcon = () => <span className="group-hover:text-accent-primary">📊</span>;
const CogIcon = () => <span className="group-hover:text-accent-primary">⚙️</span>; // Example for a settings link

const navLinks = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/quran', label: 'Al-Qur\'an', icon: BookOpenIcon },
  { href: '/reminder', label: 'Muraja\'ah', icon: CalendarIcon },
  { href: '/chart', label: 'Progress', icon: ChartBarIcon },
  // Add more links like Settings if needed
  // { href: '/settings', label: 'Settings', icon: CogIcon },
];

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
      <Navbar />
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-64 bg-bg-primary p-4 space-y-6 fixed top-16 left-0 h-[calc(100vh-4rem)] hidden lg:block shadow-lg overflow-y-auto border-r border-border-color">
          <nav className="mt-4">
            <ul className="space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-bg-secondary hover:text-accent-primary-dark transition-colors duration-150 ease-in-out group
                        ${isActive ? 'bg-accent-primary/10 text-accent-primary-dark font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-bg-primary">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
