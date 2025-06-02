import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import useAuthStore from '../../hooks/useAuth'; // Changed import
import api from '../../services/api';

// Mock useAuthStore (default export)
jest.mock('../../hooks/useAuth'); 

// Mock api
jest.mock('../../services/api');

// Mock Math.random for consistent quote testing
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5; // Always return the same value for predictability
global.Math = mockMath;

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Reset mocks before each test
    useAuthStore.mockReset();
    api.get.mockReset();
  });

  // Test 1: Displaying a "login required" message if the user is not authenticated.
  test('displays login required message when user is not authenticated', () => {
    useAuthStore.mockReturnValue({ user: null, isAuthenticated: false }); // Corrected mock return
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    // Updated text to match component
    expect(screen.getByText(/Silakan/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/terlebih dahulu untuk melihat dashboard Anda./i)).toBeInTheDocument();
  });

  // Test 2: Fetching and displaying hafalan data when the user is authenticated.
  test('fetches and displays hafalan data when user is authenticated', async () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true }); // Corrected mock return
    
    const mockHafalanData = [
      { id: 1, user_id: 1, surah_name: 'Al-Fatihah', ayah_range: '1-7', status: 'selesai', catatan: 'Lancarr', last_reviewed_at: '2024-01-01T10:00:00.000Z' },
      { id: 2, user_id: 1, surah_name: 'Al-Baqarah', ayah_range: '1-5', status: 'sedang', catatan: 'Masih diulang', last_reviewed_at: null },
    ];
    
    // Mock API responses
    api.get.mockImplementation(url => {
      if (url === `/v1/users/${testUser.id}/hafalan`) {
        return Promise.resolve({ data: mockHafalanData });
      }
      if (url === `/v1/users/${testUser.id}/reminders`) {
        return Promise.resolve({ data: [] }); // Mock empty reminders for this test
      }
      return Promise.reject(new Error(`Unknown API call: ${url}`));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Memuat data hafalan.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Al-Fatihah : 1-7/i)).toBeInTheDocument();
      expect(screen.getByText(/Al-Baqarah : 1-5/i)).toBeInTheDocument();
    });

    // Verify API calls
    expect(api.get).toHaveBeenCalledWith(`/v1/users/${testUser.id}/hafalan`);
    expect(api.get).toHaveBeenCalledWith(`/v1/users/${testUser.id}/reminders`);
  });

  // Test 3: Fetching and displaying upcoming reminders.
  test('fetches and displays upcoming reminders when user is authenticated', async () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true }); // Corrected mock return

    const mockRemindersData = [
      { id: 1, user_id: 1, surat: 'Yasin', ayat: '1-10', due_date: '2025-06-05T10:00:00.000Z', is_completed: false },
      { id: 2, user_id: 1, surat: 'Al-Mulk', ayat: '1-15', due_date: '2025-06-10T10:00:00.000Z', is_completed: false },
    ];

    api.get.mockImplementation(url => {
      if (url === `/v1/users/${testUser.id}/hafalan`) {
        return Promise.resolve({ data: [] }); // Mock empty hafalan for this test
      }
      if (url === `/v1/users/${testUser.id}/reminders`) {
        return Promise.resolve({ data: mockRemindersData });
      }
      return Promise.reject(new Error(`Unknown API call: ${url}`));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    
    // Check for reminder loading state
    // The text "Pengingat Muraja'ah" should be present, then loading spinner or content
    expect(screen.getByText(/Pengingat Muraja'ah/i)).toBeInTheDocument();

    await waitFor(() => {
      // Updated to match component rendering
      expect(screen.getByText(/Yasin : 1-10/i)).toBeInTheDocument();
      expect(screen.getByText(/Al-Mulk : 1-15/i)).toBeInTheDocument();
      // Check for formatted date (example, actual format depends on locale and options)
      expect(screen.getByText(new RegExp(new Date('2025-06-05T10:00:00.000Z').toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 'i'))).toBeInTheDocument();
    });
    expect(api.get).toHaveBeenCalledWith(`/v1/users/${testUser.id}/reminders`);
  });

  // Test 4: Displaying a Quran quote (from local data).
  test('displays a Quran quote', async () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true }); // Corrected mock return

    // Mock API calls for hafalan and reminders as they are still called
    api.get.mockImplementation(url => {
      if (url === `/v1/users/${testUser.id}/hafalan`) {
        return Promise.resolve({ data: [] });
      }
      if (url === `/v1/users/${testUser.id}/reminders`) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`Unknown API call: ${url}`));
    });
    
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // The quote is selected using Math.random. We mocked Math.random to be predictable.
    // quranQuotes[Math.floor(0.5 * quranQuotes.length)]
    // If quranQuotes has 4 items, index will be Math.floor(0.5 * 4) = Math.floor(2) = 2. This is the 3rd quote.
    // const quranQuotes = [
    //   { id: 1, text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", surah: "Al-Baqarah", ayat: "152" },
    //   { id: 2, text: "Indeed, Allah is with the patient.", surah: "Al-Anfal", ayat: "46" },
    //   { id: 3, text: "And He found you lost and guided [you].", surah: "Ad-Duhaa", ayat: "7" },
    //   { id: 4, text: "Verily, with hardship, there is relief.", surah: "Ash-Sharh", ayat: "6" },
    // ];
    // The third quote is "And He found you lost and guided [you]." - QS. Ad-Duhaa: 7

    await waitFor(() => {
      expect(screen.getByText(/Kutipan Hari Ini/i)).toBeInTheDocument();
      expect(screen.getByText(/And He found you lost and guided \[you\]./i)).toBeInTheDocument();
      expect(screen.getByText(/- QS. Ad-Duhaa: 7/i)).toBeInTheDocument();
    });
    // No API call for quote
  });

  // Test 5: Displays loading state for hafalan
  test('displays loading state for hafalan list', () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true });

    api.get.mockImplementation(url => {
      if (url === `/v1/users/${testUser.id}/hafalan`) {
        return new Promise(() => {}); // Never resolves to keep loading
      }
      if (url === `/v1/users/${testUser.id}/reminders`) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`Unknown API call: ${url}`));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/Memuat data hafalan.../i)).toBeInTheDocument();
  });

  // Test 6: Displays loading state for reminders
  test('displays loading state for reminders list', () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true });

    api.get.mockImplementation(url => {
      if (url === `/v1/users/${testUser.id}/hafalan`) {
        return Promise.resolve({ data: [] });
      }
      if (url === `/v1/users/${testUser.id}/reminders`) {
        return new Promise(() => {}); // Never resolves to keep loading
      }
      return Promise.reject(new Error(`Unknown API call: ${url}`));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    // Check for the loading spinner via its parent div structure or a more specific attribute if available
    // For now, we'll check if the "Tidak ada pengingat" message is NOT there, implying loading or has data.
    // A more robust way would be to add a data-testid to the spinner.
    expect(screen.getByText(/Pengingat Muraja'ah/i)).toBeInTheDocument();
    // Assuming the spinner is present, the empty message shouldn't be.
    expect(screen.queryByText(/Tidak ada pengingat muraja'ah dalam waktu dekat./i)).not.toBeInTheDocument();
  });

  // Test 7: Displays error state for hafalan list
  test('displays error state for hafalan list when API call fails', async () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true });
    const errorMessage = "Gagal mengambil data hafalan. Silakan coba lagi nanti.";

    api.get.mockImplementation(url => {
      if (url === `/v1/users/${testUser.id}/hafalan`) {
        return Promise.reject(new Error('API Error'));
      }
      if (url === `/v1/users/${testUser.id}/reminders`) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`Unknown API call: ${url}`));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Coba Lagi/i })).toBeInTheDocument();
  });

  // Test 8: Displays empty state for hafalan list
  test('displays empty state for hafalan list when no data', async () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true });

    api.get.mockImplementation(url => {
      if (url === `/v1/users/${testUser.id}/hafalan`) {
        return Promise.resolve({ data: [] }); // Empty hafalan list
      }
      if (url === `/v1/users/${testUser.id}/reminders`) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error(`Unknown API call: ${url}`));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Belum ada data hafalan./i)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Tambahkan hafalan pertama Anda/i })).toHaveAttribute('href', '/hafalan/new');
  });

  // Test 9: Displays empty state for reminders list
  test('displays empty state for reminders list when no data', async () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true });

    api.get.mockImplementation(url => {
      if (url === `/v1/users/${testUser.id}/hafalan`) {
        return Promise.resolve({ data: [] }); 
      }
      if (url === `/v1/users/${testUser.id}/reminders`) {
        return Promise.resolve({ data: [] }); // Empty reminders list
      }
      return Promise.reject(new Error(`Unknown API call: ${url}`));
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Tidak ada pengingat muraja'ah dalam waktu dekat./i)).toBeInTheDocument();
    });
  });

  // Test 10: "Tambah Hafalan Baru" button navigates correctly
  test('"Tambah Hafalan Baru" button has correct link', () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true });
    api.get.mockResolvedValue({ data: [] }); // Mock API calls to prevent errors

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /Tambah Hafalan Baru/i })).toHaveAttribute('href', '/hafalan/new');
  });

  // Test 11: "Lihat Semua Jadwal" link navigates correctly
  test('"Lihat Semua Jadwal" link has correct link', async () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true });
    api.get.mockResolvedValue({ data: [] }); // Mock API calls

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    // Wait for reminders to potentially load/fail to ensure link is rendered
    await waitFor(() => {
        expect(screen.getByRole('link', { name: /Lihat Semua Jadwal/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /Lihat Semua Jadwal/i })).toHaveAttribute('href', '/reminder');
  });

  // Test 12: "Coba Lagi" button retries fetching hafalan data
  test('"Coba Lagi" button retries fetching hafalan data', async () => {
    const testUser = { id: 1, name: 'Test User' };
    useAuthStore.mockReturnValue({ user: testUser, isAuthenticated: true });
    const hafalanApiUrl = `/v1/users/${testUser.id}/hafalan`;
    const remindersApiUrl = `/v1/users/${testUser.id}/reminders`;

    // Mock implementation for api.get
    api.get
      .mockImplementationOnce(url => { // First call for hafalan - fails
        if (url === hafalanApiUrl) {
          return Promise.reject(new Error('API Error'));
        }
        if (url === remindersApiUrl) { // First call for reminders - succeeds
          return Promise.resolve({ data: [] });
        }
        return Promise.reject(new Error(`Unknown API call (1st round): ${url}`));
      })
      .mockImplementationOnce(url => { // Second call for hafalan (after retry) - succeeds
        if (url === hafalanApiUrl) {
          return Promise.resolve({ data: [{ id: 3, surah_name: 'An-Nasr', ayah_range: '1-3', status: 'selesai' }] });
        }
        // This mock might be for the reminders call that happens in the same useEffect after hafalan succeeds
        // or if fetchReminders is called again explicitly. For safety, ensure it returns valid empty data.
        if (url === remindersApiUrl) { 
          return Promise.resolve({ data: [] });
        }
        return Promise.reject(new Error(`Unknown API call (2nd round): ${url}`));
      })
      // Add a default implementation for any subsequent calls to reminders, if any, to prevent errors.
      .mockImplementation(url => { 
        if (url === remindersApiUrl) {
          return Promise.resolve({ data: [] });
        }
        // Fallback for any other unexpected calls during the successful render phase
        if (url === hafalanApiUrl) { // Should not be called a third time for hafalan in this test
             return Promise.resolve({ data: [{ id: 3, surah_name: 'An-Nasr', ayah_range: '1-3', status: 'selesai' }] });
        }
        return Promise.reject(new Error(`Unknown API call (default mock): ${url}`));
      });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for error message and button
    await waitFor(() => {
      expect(screen.getByText(/Gagal mengambil data hafalan. Silakan coba lagi nanti./i)).toBeInTheDocument();
    });
    const cobaLagiButton = screen.getByRole('button', { name: /Coba Lagi/i });
    
    // Click the "Coba Lagi" button
    fireEvent.click(cobaLagiButton);

    // Check if API was called again and data is displayed
    await waitFor(() => {
      expect(screen.getByText(/An-Nasr : 1-3/i)).toBeInTheDocument();
    });

    // Verify api.get calls
    // Initial calls: hafalan (fail), reminders (ok)
    // After click: hafalan (success), reminders (ok)
    expect(api.get).toHaveBeenCalledWith(hafalanApiUrl);
    expect(api.get).toHaveBeenCalledWith(remindersApiUrl);
    
    const hafalanCalls = api.get.mock.calls.filter(call => call[0] === hafalanApiUrl);
    expect(hafalanCalls.length).toBe(2); // Called twice for hafalan

    const reminderCalls = api.get.mock.calls.filter(call => call[0] === remindersApiUrl);
    // Reminders are called initially, and potentially again after hafalan succeeds in useEffect
    expect(reminderCalls.length).toBeGreaterThanOrEqual(1); // At least once, likely twice
  });
});
