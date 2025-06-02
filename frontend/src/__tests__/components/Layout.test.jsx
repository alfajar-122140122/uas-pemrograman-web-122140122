import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from '../../components/Layout';
import '@testing-library/jest-dom';

// Mock Navbar and Footer components
jest.mock('../../components/Navbar', () => {
  return function MockNavbar({ toggleSidebar }) {
    return (
      <div data-testid="navbar">
        <button onClick={toggleSidebar}>Toggle Sidebar</button>
      </div>
    );
  };
});

jest.mock('../../components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer Component</div>;
  };
});

// Mock child component
const MockChild = () => <div data-testid="child-component">Child Content</div>;

describe('Layout Component', () => {
  test('renders navbar, sidebar, content area and footer', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout><MockChild /></Layout>} />
        </Routes>
      </MemoryRouter>
    );

    // Check that all main parts are rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content-area')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    
    // Check that child content is rendered
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });

  test('toggles sidebar visibility when button is clicked', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout><MockChild /></Layout>} />
        </Routes>
      </MemoryRouter>
    );

    // Get sidebar element
    const sidebar = screen.getByTestId('sidebar');

    // Get toggle button from navbar mock and click it
    const toggleButton = screen.getByText('Toggle Sidebar');

    // Initial state - sidebar should be hidden (transformed out of view)
    expect(sidebar).toHaveClass('-translate-x-full');

    // Click to show sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('translate-x-0');
    expect(sidebar).not.toHaveClass('-translate-x-full');

    // Click again to hide sidebar
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('-translate-x-full');
    expect(sidebar).not.toHaveClass('translate-x-0');
  });

  test('navigation links are rendered correctly', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout><MockChild /></Layout>} />
        </Routes>
      </MemoryRouter>
    );

    // Check for dashboard link
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check for Quran link
    expect(screen.getByText(/Al-Qur'an/i)).toBeInTheDocument(); // Adjusted to match actual text
    
    // Check for Reminder link
    expect(screen.getByText(/Muraja'ah/i)).toBeInTheDocument(); // Adjusted to match actual text

    // Check for Progress link
    expect(screen.getByText(/Progress/i)).toBeInTheDocument(); // Added test for Progress link
  });
});
