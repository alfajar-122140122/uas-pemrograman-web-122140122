import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from '../../pages/Login';
import useAuthStore from '../../hooks/useAuth';
import api from '../../services/api';

// Mocks
jest.mock('../../hooks/useAuth');
jest.mock('../../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock window.alert
global.alert = jest.fn();

describe('Login Page', () => {
  let mockLogin;
  let mockAuthStore;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin = jest.fn();
    mockAuthStore = { user: null, login: mockLogin, logout: jest.fn() };
    useAuthStore.mockReturnValue(mockAuthStore);
    api.post.mockResolvedValue({ data: { token: 'fake-token', user: { id: 1, username: 'testuser' } } });
  });

  const renderLogin = () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders login form by default', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /Login ke Akun Anda/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Alamat Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Belum punya akun\? Daftar/i })).toBeInTheDocument();
  });

  test('toggles to registration form and back', () => {
    renderLogin();
    const toggleButton = screen.getByRole('button', { name: /Belum punya akun\? Daftar/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('heading', { name: /Buat Akun Baru/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Daftar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sudah punya akun\? Login/i })).toBeInTheDocument();

    const switchToLoginButton = screen.getByRole('button', { name: /Sudah punya akun\? Login/i });
    fireEvent.click(switchToLoginButton);
    expect(screen.getByRole('heading', { name: /Login ke Akun Anda/i })).toBeInTheDocument();
  });

  test('handles input changes for login', () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });

    expect(screen.getByPlaceholderText(/Alamat Email/i)).toHaveValue('test@example.com');
    expect(screen.getByPlaceholderText(/Password/i)).toHaveValue('password123');
  });

  test('handles input changes for registration', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Belum punya akun\? Daftar/i }));

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'newpassword' } });

    expect(screen.getByPlaceholderText(/Username/i)).toHaveValue('newuser');
    expect(screen.getByPlaceholderText(/Alamat Email/i)).toHaveValue('new@example.com');
    expect(screen.getByPlaceholderText(/Password/i)).toHaveValue('newpassword');
  });

  test('successful login', async () => {
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/v1/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
    expect(mockLogin).toHaveBeenCalledWith({ id: 1, username: 'testuser' }, 'fake-token');
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(global.alert).toHaveBeenCalledWith('Login berhasil!');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('successful registration', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Belum punya akun\? Daftar/i }));

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'newpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/v1/auth/register', {
        username: 'newuser',
        email: 'new@example.com',
        password: 'newpassword',
      });
    });
    expect(mockLogin).toHaveBeenCalledWith({ id: 1, username: 'testuser' }, 'fake-token');
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(global.alert).toHaveBeenCalledWith('Registrasi berhasil!');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('login failure displays error message', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('registration failure displays error message', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { error: 'Email already exists' } },
    });
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Belum punya akun\? Daftar/i }));

    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }));

    expect(await screen.findByText(/Email already exists/i)).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows loading state during login submission', async () => {
    api.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ data: { token: 'fake-token', user: { id: 1, username: 'testuser' } } }), 100)));
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByRole('button', { name: /Login.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login.../i })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()); // Wait for submission to complete
  });

  test('shows loading state during registration submission', async () => {
    api.post.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({ data: { token: 'fake-token', user: { id: 1, username: 'testuser' } } }), 100)));
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /Belum punya akun\? Daftar/i }));
    
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'newpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }));

    expect(screen.getByRole('button', { name: /Mendaftar.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mendaftar.../i })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('button', { name: /Daftar/i })).toBeInTheDocument());
  });

  test('toggling form clears previous error messages', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { error: 'Login failed miserably' } },
    });
    renderLogin();
    fireEvent.change(screen.getByPlaceholderText(/Alamat Email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(await screen.findByText(/Login failed miserably/i)).toBeInTheDocument();

    // Toggle to registration form
    const toggleButton = screen.getByRole('button', { name: /Belum punya akun\? Daftar/i });
    fireEvent.click(toggleButton);

    expect(screen.queryByText(/Login failed miserably/i)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Buat Akun Baru/i })).toBeInTheDocument();
  });
});
