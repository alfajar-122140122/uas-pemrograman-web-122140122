import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthCheck from '../../components/AuthCheck';
import useAuthStore from '../../hooks/useAuth';

// Mock useAuth hook
jest.mock('../../hooks/useAuth');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const MockLoginPage = () => <div data-testid="login-page">Login Page</div>;

describe('AuthCheck Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    // Reset the mock before each test
    useAuthStore.mockReset();
  });

  test('renders children when authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      checkAuth: jest.fn(), // Add mock for checkAuth
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<AuthCheck><div data-testid="protected-content">Protected Content</div></AuthCheck>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  test('redirects to /login when not authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      checkAuth: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<AuthCheck><div data-testid="protected-content">Protected Content</div></AuthCheck>} />
          <Route path="/login" element={<MockLoginPage />} />
        </Routes>
      </MemoryRouter>
    );
    // Check that the login page is rendered as Navigate will redirect
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('does not render children when loading and not authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true, // isLoading is true
      checkAuth: jest.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<AuthCheck><div data-testid="protected-content">Protected Content</div></AuthCheck>} />
          <Route path="/login" element={<MockLoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    // If not authenticated, it should redirect to login, even if technically loading.
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});
