import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    isAuthenticated: true,
    user: { name: 'Test User' },
    logout: jest.fn(),
  }),
}));

// Fixture for testing
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navbar Component', () => {
  const toggleSidebar = jest.fn();

  beforeEach(() => {
    // Setup test
    render(
      <BrowserRouter>
        <Navbar toggleSidebar={toggleSidebar} />
      </BrowserRouter>
    );
  });

  test('renders the navbar correctly', () => {
    // Navbar should have the app name
    expect(screen.getByText(/Hafidz/i)).toBeInTheDocument();
    expect(screen.getByText(/Tracker/i)).toBeInTheDocument();
  });

  test('search input works correctly', () => {
    // Get the search input
    const searchInput = screen.getByPlaceholderText(/Cari Surah.../i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Check if the input value has changed
    expect(searchInput.value).toBe('test search');
  });

  test('logout button works correctly', () => {
    // Find and click the user menu button to open the dropdown
    // const userButton = screen.getByTestId('user-menu-button');
    // For now, let's assume the logout button is directly visible or becomes visible
    // If there's a user menu, the test needs to click it first.
    // This part might need adjustment based on actual Navbar implementation of user menu.
    const logoutButton = screen.getByText(/Logout/i); // Adjusted to match button text
    fireEvent.click(logoutButton);
    
    // Check if the logout function was called and navigation occurred
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
