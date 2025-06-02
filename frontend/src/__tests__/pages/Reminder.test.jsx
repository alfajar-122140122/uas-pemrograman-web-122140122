import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Reminder from '../../pages/Reminder';
import api from '../../services/api';
import useAuthStore from '../../hooks/useAuth';
import quranService from '../../services/quranService';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('../../services/api');
jest.mock('../../hooks/useAuth');
jest.mock('../../services/quranService');

// Mock window.alert, window.confirm, and Notification API
global.alert = jest.fn();
global.confirm = jest.fn();

// Store the original Notification
const OriginalNotification = global.Notification;
let mockRequestPermissionFn;

beforeAll(() => {
  mockRequestPermissionFn = jest.fn().mockResolvedValue('granted');
  global.Notification = jest.fn((title, options) => {
    // This is a simplified mock for the constructor
    // You might need to expand this if your code uses Notification instances
    return {
      title,
      options,
      close: jest.fn(),
      // Add other instance properties/methods if needed
    };
  });
  global.Notification.requestPermission = mockRequestPermissionFn;
  global.Notification.permission = 'default';
});

afterAll(() => {
  // Restore original Notification
  global.Notification = OriginalNotification;
});


const mockNavigate = jest.requireMock('react-router-dom').useNavigate;

describe('Reminder Page', () => {
  const mockUser = { id: 1, name: 'Test User' };
  const mockSurahs = [
    { number: 1, englishName: 'Al-Fatihah', name: 'الفاتحة' },
    { number: 2, englishName: 'Al-Baqarah', name: 'البقرة' },
  ];
  const mockReminders = [
    { id: 1, user_id: 1, surat: 'Al-Fatihah', ayat: '1-7', due_date: '2025-06-10T23:59:59', is_completed: false },
    { id: 2, user_id: 1, surat: 'Al-Baqarah', ayat: '1-5', due_date: '2025-06-15T23:59:59', is_completed: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset permission for each test
    global.Notification.permission = 'default';
    mockRequestPermissionFn.mockClear().mockResolvedValue('granted'); 
    // Clear calls to the constructor mock if needed, e.g., if you check constructor calls
    // global.Notification.mockClear(); 
  });

  // --- Unauthenticated State Tests ---
  describe('Unauthenticated User', () => {
    beforeEach(() => {
      useAuthStore.mockReturnValue({ user: null, isAuthenticated: false });
    });

    test('renders login prompt if user is not authenticated', () => {
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      expect(screen.getByText((content, element) => {
        const hasText = (node) => node.textContent === "Silakan login terlebih dahulu untuk mengelola jadwal muraja\'ah Anda.";
        const elementHasText = hasText(element);
        const childrenDontHaveText = Array.from(element.children).every(
          (child) => !hasText(child)
        );
        return elementHasText && childrenDontHaveText;
      })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('login button navigates to /login', () => {
      const navigateFn = jest.fn();
      mockNavigate.mockReturnValue(navigateFn);
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      expect(navigateFn).toHaveBeenCalledWith('/login');
    });
  });

  // --- Authenticated State Tests ---
  describe('Authenticated User', () => {
    beforeEach(() => {
      useAuthStore.mockReturnValue({ user: mockUser, isAuthenticated: true });
      quranService.getAllSurahs.mockResolvedValue({ data: mockSurahs });
      api.get.mockResolvedValue({ data: [] }); // Default to no reminders
    });

    test('renders "Jadwal Muraja\'ah" title and form', async () => {
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /Jadwal Muraja'ah/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Buat Jadwal Baru/i })).toBeInTheDocument();
      await waitFor(() => {
        expect(quranService.getAllSurahs).toHaveBeenCalledTimes(1);
        expect(api.get).toHaveBeenCalledWith(`/v1/users/${mockUser.id}/reminders`);
      });
    });

    test('fetches and displays existing reminders', async () => {
      api.get.mockResolvedValue({ data: mockReminders });
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/Al-Fatihah : 1-7/i)).toBeInTheDocument();
        expect(screen.getByText(/Al-Baqarah : 1-5/i)).toBeInTheDocument();
      });
    });

    test('fetches and populates surah list in the form', async () => {
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /Surat/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Pilih Surat/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /1. Al-Fatihah \(الفاتحة\)/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /2. Al-Baqarah \(البقرة\)/i })).toBeInTheDocument();
      });
    });

    test('displays loading state while fetching reminders', async () => {
      api.get.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100)));
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      expect(screen.getByText(/Jadwal Muraja'ah/i)).toBeInTheDocument(); // Page title should be there
      // Check for loading spinner for reminders list
      await waitFor(() => {
        // The spinner is present initially
        expect(screen.getByRole('heading', {name: /Daftar Jadwal/i}).parentElement.querySelector('.animate-spin')).toBeInTheDocument();
      });
      // And then disappears
      await waitFor(() => {
        expect(screen.queryByRole('heading', {name: /Daftar Jadwal/i}).parentElement.querySelector('.animate-spin')).not.toBeInTheDocument();
      });
    });
    
    test('displays loading state while fetching surahs for the form', async () => {
      quranService.getAllSurahs.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ data: mockSurahs }), 100)));
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      expect(screen.getByText(/Memuat daftar surat.../i)).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByText(/Memuat daftar surat.../i)).not.toBeInTheDocument();
        expect(screen.getByRole('option', { name: /1. Al-Fatihah \(الفاتحة\)/i })).toBeInTheDocument();
      });
    });

    test('displays error message if fetching reminders fails and "Coba lagi" button works', async () => {
      const errorMessage = "Gagal mengambil data pengingat muraja'ah";
      api.get.mockRejectedValueOnce(new Error('Network Error'));
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(global.alert).toHaveBeenCalledWith('Gagal mengambil data pengingat');
      });

      api.get.mockResolvedValueOnce({ data: mockReminders }); // Subsequent call succeeds
      fireEvent.click(screen.getByRole('button', { name: /Coba lagi/i }));
      
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(2); // Initial + retry
        expect(screen.getByText(/Al-Fatihah : 1-7/i)).toBeInTheDocument();
      });
    });
    
    test('displays "Belum ada jadwal muraja\'ah" if no reminders exist', async () => {
      api.get.mockResolvedValue({ data: [] });
      render(
        <MemoryRouter>
          <Reminder />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(screen.getByText(/Belum ada jadwal muraja'ah./i)).toBeInTheDocument();
      });
    });

    // --- Form Functionality Tests ---
    describe('Form Functionality', () => {
      test('successfully creates a new reminder', async () => {
        const newReminderData = { surat: 'Al-Fatihah', ayat: '1-3', due_date: '2025-06-20T23:59:59', is_completed: false, user_id: mockUser.id };
        const newReminderResponse = { ...newReminderData, id: 3 };
        api.post.mockResolvedValue({ data: newReminderResponse });
        global.Notification.permission = 'granted'; // Assume permission is granted

        render(
          <MemoryRouter>
            <Reminder />
          </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByRole('option', { name: /1. Al-Fatihah \(الفاتحة\)/i })).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/Surat/i), { target: { value: '1' } }); // Select Al-Fatihah (number 1)
        fireEvent.change(screen.getByLabelText(/Ayat/i), { target: { value: '1-3' } });
        fireEvent.change(screen.getByLabelText(/Tanggal/i), { target: { value: '2025-06-20' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Tambah Jadwal/i }));

        await waitFor(() => {
          expect(api.post).toHaveBeenCalledWith(`/v1/users/${mockUser.id}/reminders`, newReminderData);
          expect(global.alert).toHaveBeenCalledWith('Pengingat muraja\'ah berhasil dibuat!');
          expect(screen.getByText(/Al-Fatihah : 1-3/i)).toBeInTheDocument(); // New reminder displayed
          expect(screen.getByLabelText(/Ayat/i).value).toBe(''); // Form reset
          expect(global.Notification).toHaveBeenCalledWith(
            'Pengingat Muraja\'ah Ditambahkan!',
            expect.objectContaining({
              body: 'Jangan lupa murajaah Al-Fatihah ayat 1-3 pada 20/6/2025',
            })
          );
        });
      });

      test('handles error during reminder creation', async () => {
        api.post.mockRejectedValue({ response: { data: { error: 'Create failed' } } });
        render(
          <MemoryRouter>
            <Reminder />
          </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByRole('option', { name: /1. Al-Fatihah \(الفاتحة\)/i })).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/Surat/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Ayat/i), { target: { value: '1-3' } });
        fireEvent.change(screen.getByLabelText(/Tanggal/i), { target: { value: '2025-06-20' } });
        fireEvent.click(screen.getByRole('button', { name: /Tambah Jadwal/i }));

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith('Gagal membuat pengingat: Create failed');
        });
      });
      
      test('requests notification permission if not granted and shows notification', async () => {
        const newReminderData = { surat: 'Al-Fatihah', ayat: '1-3', due_date: '2025-06-20T23:59:59', is_completed: false, user_id: mockUser.id };
        api.post.mockResolvedValue({ data: { ...newReminderData, id: 3 } });
        global.Notification.permission = 'default'; // Start with permission not granted
        mockRequestPermissionFn.mockResolvedValue('granted'); // Simulate user granting permission

        render(
          <MemoryRouter>
            <Reminder />
          </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByRole('option', { name: /1. Al-Fatihah \(الفاتحة\)/i })).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/Surat/i), { target: { value: '1' } });
        fireEvent.change(screen.getByLabelText(/Ayat/i), { target: { value: '1-3' } });
        fireEvent.change(screen.getByLabelText(/Tanggal/i), { target: { value: '2025-06-20' } });
        fireEvent.click(screen.getByRole('button', { name: /Tambah Jadwal/i }));

        await waitFor(() => {
          expect(mockRequestPermissionFn).toHaveBeenCalled();
          // Check that the Notification constructor was called for showing the notification
          expect(global.Notification).toHaveBeenCalledWith(
            'Pengingat Muraja\'ah Ditambahkan!',
            expect.objectContaining({
              body: 'Jangan lupa murajaah Al-Fatihah ayat 1-3 pada 20/6/2025',
            })
          );
        });
      });
    });

    // --- Reminder List Item Functionality Tests ---
    describe('Reminder List Item Functionality', () => {
      beforeEach(() => {
        api.get.mockResolvedValue({ data: [mockReminders[0]] }); // Start with one uncompleted reminder
      });

      test('"Tandai Selesai" button works', async () => {
        api.put.mockResolvedValue({ data: { ...mockReminders[0], is_completed: true } });
        render(
          <MemoryRouter>
            <Reminder />
          </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText(/Al-Fatihah : 1-7/i)).toBeInTheDocument());
        
        const markCompleteButton = screen.getByRole('button', { name: /Tandai Selesai/i });
        fireEvent.click(markCompleteButton);

        await waitFor(() => {
          expect(api.put).toHaveBeenCalledWith(`/v1/reminders/${mockReminders[0].id}`, { is_completed: true });
          expect(global.alert).toHaveBeenCalledWith('Pengingat ditandai sebagai selesai');
          expect(screen.getByText(/Status: Selesai/i)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /Tandai Belum/i })).toBeInTheDocument();
        });
      });
      
      test('"Tandai Belum" button works', async () => {
        api.get.mockResolvedValue({ data: [{ ...mockReminders[0], is_completed: true }] }); // Start with one completed reminder
        api.put.mockResolvedValue({ data: { ...mockReminders[0], is_completed: false } });
        render(
          <MemoryRouter>
            <Reminder />
          </MemoryRouter>
        );

        await waitFor(() => expect(screen.getByText(/Al-Fatihah : 1-7/i)).toBeInTheDocument());
        expect(screen.getByText(/Status: Selesai/i)).toBeInTheDocument();
        
        const markIncompleteButton = screen.getByRole('button', { name: /Tandai Belum/i });
        fireEvent.click(markIncompleteButton);

        await waitFor(() => {
          expect(api.put).toHaveBeenCalledWith(`/v1/reminders/${mockReminders[0].id}`, { is_completed: false });
          expect(global.alert).toHaveBeenCalledWith('Pengingat ditandai sebagai belum selesai');
          expect(screen.getByText(/Status: Belum selesai/i)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /Tandai Selesai/i })).toBeInTheDocument();
        });
      });

      test('"Hapus" button works', async () => {
        global.confirm.mockReturnValue(true); // User confirms deletion
        api.delete.mockResolvedValue({});
        render(
          <MemoryRouter>
            <Reminder />
          </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText(/Al-Fatihah : 1-7/i)).toBeInTheDocument());

        fireEvent.click(screen.getByRole('button', { name: /Hapus/i }));

        expect(global.confirm).toHaveBeenCalledWith('Apakah Anda yakin ingin menghapus pengingat ini?');
        await waitFor(() => {
          expect(api.delete).toHaveBeenCalledWith(`/v1/reminders/${mockReminders[0].id}`);
          expect(global.alert).toHaveBeenCalledWith('Pengingat berhasil dihapus');
          expect(screen.queryByText(/Al-Fatihah : 1-7/i)).not.toBeInTheDocument();
          expect(screen.getByText(/Belum ada jadwal muraja'ah./i)).toBeInTheDocument(); // Assuming it's the only one
        });
      });

      test('"Hapus" button does nothing if not confirmed', async () => {
        global.confirm.mockReturnValue(false); // User cancels deletion
        render(
          <MemoryRouter>
            <Reminder />
          </MemoryRouter>
        );
        await waitFor(() => expect(screen.getByText(/Al-Fatihah : 1-7/i)).toBeInTheDocument());
        
        fireEvent.click(screen.getByRole('button', { name: /Hapus/i }));

        expect(global.confirm).toHaveBeenCalledWith('Apakah Anda yakin ingin menghapus pengingat ini?');
        expect(api.delete).not.toHaveBeenCalled();
        expect(screen.getByText(/Al-Fatihah : 1-7/i)).toBeInTheDocument(); // Still there
      });
    });
  });
});
