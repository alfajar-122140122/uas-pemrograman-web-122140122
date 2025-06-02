// filepath: d:/Kuliah/Akademik/Semester 6/Pemrograman Web/Tugas Besar/uas-pemrograman-web-122140122/frontend/src/__tests__/pages/Quran.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import Quran from '../../pages/Quran';
import quranService from '../../services/quranService';
import HafalanForm from '../../components/HafalanForm'; // Corrected path: HafalanForm is a component
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { useAuthStore } from '../../stores/authStore'; // Not directly used in Quran.jsx tests

// --- React Toastify Mock ---
// Define these at the module scope, so they exist when jest.mock is hoisted and executed.

jest.mock('react-toastify', () => {
  const mockToastErrorFn = jest.fn(); // Defined inside
  const mockToastSuccessFn = jest.fn(); // Defined inside

  // To allow tests to access these, we can expose them via the module itself,
  // though it's often cleaner to just assert on toast.error.
  // For this specific case, we need to reset them in beforeEach.
  // A common pattern is to make the mock functions properties of the mocked module.
  const actualToast = jest.requireActual('react-toastify');
  actualToast.toast.error = mockToastErrorFn;
  actualToast.toast.success = mockToastSuccessFn;
  
  // Store them for reset
  global.mockToastFns = { error: mockToastErrorFn, success: mockToastSuccessFn };


  return {
    ...actualToast, // Spread actual exports
    ToastContainer: () => <div data-testid="toast-container-mock" />,
    toast: { // Override toast methods
      ...actualToast.toast, // Spread other toast methods if any
      error: mockToastErrorFn,
      success: mockToastSuccessFn,
    },
  };
});
// --- End React Toastify Mock ---

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: jest.fn(), // Will be further mocked in beforeEach
}));

jest.mock('../../services/quranService');
jest.mock('../../components/HafalanForm', () => () => <div data-testid="hafalan-form-mock">Hafalan Form Mock</div>);

// Mock window.scrollTo
global.scrollTo = jest.fn();

const mockSurahs = {
  data: [
    { number: 1, englishName: 'Al-Fatihah', name: 'الفاتحة', numberOfAyahs: 7, revelationType: 'Meccan' },
    { number: 2, englishName: 'Al-Baqarah', name: 'البقرة', numberOfAyahs: 286, revelationType: 'Medinan' },
    { number: 114, englishName: 'An-Nas', name: 'الناس', numberOfAyahs: 6, revelationType: 'Meccan' },
  ]
};

const mockSurahDetail = (surahNumber) => {
  if (surahNumber === 1) {
    return {
      number: 1,
      englishName: 'Al-Fatihah',
      name: 'الفاتحة',
      ayahs: [
        { numberInSurah: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ', translation: { id: 'Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang.', en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' } },
        { numberInSurah: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: { id: 'Segala puji bagi Allah, Tuhan semesta alam.', en: 'All praise is due to Allah, Lord of the worlds.' } },
      ]
    };
  }
  return { number: surahNumber, englishName: 'Unknown', name: 'غير معروف', ayahs: [] };
};

describe('Quran Page', () => {
  beforeEach(() => {
    quranService.getAllSurahs.mockReset();
    quranService.getSurahWithAyahs.mockReset();
    mockNavigate.mockReset();
    
    // Reset mocks using the globally stored references
    if (global.mockToastFns) {
      global.mockToastFns.error.mockReset();
      global.mockToastFns.success.mockReset();
    }

    // Default mock for useSearchParams for each test
    (useSearchParams).mockReturnValue([new URLSearchParams(), jest.fn()]);
    global.scrollTo.mockClear(); // Clear scrollTo calls
  });

  test('renders Quran page and fetches initial surah list', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );

    expect(screen.getByText(/Baca Al-Qur'an/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Cari Surat/i)).toBeInTheDocument();
    expect(quranService.getAllSurahs).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument();
      expect(screen.getByText(/Al-Baqarah/i)).toBeInTheDocument();
      expect(screen.getByText(/An-Nas/i)).toBeInTheDocument();
    });
  });

  test('filters surahs based on search term (english name)', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Cari Surat/i);
    fireEvent.change(searchInput, { target: { value: 'Al-Fatihah' } });

    await waitFor(() => {
      expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument();
      expect(screen.queryByText(/Al-Baqarah/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/An-Nas/i)).not.toBeInTheDocument();
    });
  });

  test('filters surahs based on search term (arabic name)', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument());
    
    const searchInput = screen.getByPlaceholderText(/Cari Surat/i);
    fireEvent.change(searchInput, { target: { value: 'البقرة' } }); // Al-Baqarah in Arabic

    await waitFor(() => {
      expect(screen.getByText(/Al-Baqarah/i)).toBeInTheDocument();
      expect(screen.queryByText(/Al-Fatihah/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/An-Nas/i)).not.toBeInTheDocument();
    });
  });

  test('filters surahs based on search term (surah number)', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument());
    
    const searchInput = screen.getByPlaceholderText(/Cari Surat/i);
    fireEvent.change(searchInput, { target: { value: '114' } }); // An-Nas

    await waitFor(() => {
      expect(screen.getByText(/An-Nas/i)).toBeInTheDocument();
      expect(screen.queryByText(/Al-Fatihah/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Al-Baqarah/i)).not.toBeInTheDocument();
    });
  });

  test('displays "no results" message when search yields no surahs', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Cari Surat/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistentSurah' } });

    await waitFor(() => {
      // Adjusted assertion to match the actual text content
      expect(screen.getByText(/Tidak ada surat yang cocok dengan pencarian "NonExistentSurah"./i)).toBeInTheDocument();
    });
  });

  test('selects a surah and displays its verses', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    quranService.getSurahWithAyahs.mockImplementation(surahNumber => Promise.resolve(mockSurahDetail(surahNumber)));
    
    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );

    // Adjusted to wait for the specific text within the rendered SurahCard
    await waitFor(() => expect(screen.getByText(/1. Al-Fatihah/i)).toBeInTheDocument());
    
    // Click on Al-Fatihah card
    fireEvent.click(screen.getByText(/1. Al-Fatihah/i).closest('button') || screen.getByText(/1. Al-Fatihah/i));

    expect(quranService.getSurahWithAyahs).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText(/بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ/i)).toBeInTheDocument(); // Ayah 1 text
      expect(screen.getByText(/Dengan menyebut nama Allah Yang Maha Pemurah lagi Maha Penyayang./i)).toBeInTheDocument(); // Ayah 1 translation
      // Corrected Arabic text: رَبِّ instead of RABِّ
      expect(screen.getByText(/الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ/i)).toBeInTheDocument(); // Ayah 2 text
    });

    expect(screen.getByRole('button', { name: /Kembali ke Daftar Surat/i })).toBeInTheDocument();
  });

  test('navigates to Add Hafalan page when "Tambahkan ke Hafalan" is clicked', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    quranService.getSurahWithAyahs.mockResolvedValue(mockSurahDetail(1)); // Mock for Surah 1 (Al-Fatihah)

    render(
      <MemoryRouter initialEntries={['/quran']}>
        <Routes>
          <Route path="/quran" element={<Quran />} />
          {/* Ensure the path here matches where the app navigates for new hafalan */}
          <Route path="/hafalan/new" element={<HafalanForm />} /> 
        </Routes>
      </MemoryRouter>
    );

    // Select Al-Fatihah
    await waitFor(() => screen.getByText(/Al-Fatihah/i));
    fireEvent.click(screen.getByText(/Al-Fatihah/i).closest('button') || screen.getByText(/Al-Fatihah/i));
    
    // Wait for verses to load
    await waitFor(() => screen.getByText(/بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ/i));
    
    // Click "Tambahkan ke Hafalan" for the first verse
    const addButton = screen.getAllByRole('button', { name: /Tambahkan ke Hafalan/i })[0];
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/hafalan/new?surah=1&ayah=1');
  });
  
  test('handles error when fetching surah list', async () => {
    quranService.getAllSurahs.mockRejectedValue(new Error('Network Error'));
    render(
      <MemoryRouter>
        <Quran />
        <ToastContainer /> 
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(global.mockToastFns.error).toHaveBeenCalledWith(
        'Error fetching surahs: Network Error',
        expect.any(Object) // Re-added expect.any(Object) for toast options
      );
    });
    expect(screen.queryByText(/Al-Fatihah/i)).not.toBeInTheDocument();
  });

  test('handles error when fetching verses for a selected surah', async () => {
    quranService.getAllSurahs.mockResolvedValue({ data: mockSurahs.data.slice(0, 1) }); 
    quranService.getSurahWithAyahs.mockRejectedValue(new Error('Failed to load verses'));

    render(
      <MemoryRouter>
        <Quran />
        <ToastContainer />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/1. Al-Fatihah/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/1. Al-Fatihah/i));

    await waitFor(() => {
      expect(quranService.getSurahWithAyahs).toHaveBeenCalledWith(1);
      expect(global.mockToastFns.error).toHaveBeenCalledWith(
        'Error fetching verses: Failed to load verses',
        expect.any(Object) // Re-added expect.any(Object) for toast options
      );
    });
    expect(screen.queryByText(/بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ/i)).not.toBeInTheDocument();
  });

  test('"Kembali ke Daftar Surat" button works correctly', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    quranService.getSurahWithAyahs.mockResolvedValue(mockSurahDetail(1));

    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );

    // Go to verse view
    await waitFor(() => screen.getByText(/Al-Fatihah/i));
    fireEvent.click(screen.getByText(/Al-Fatihah/i).closest('button') || screen.getByText(/Al-Fatihah/i));
    await waitFor(() => screen.getByText(/بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ/i));

    // Click back button
    fireEvent.click(screen.getByRole('button', { name: /Kembali ke Daftar Surat/i }));

    // Should be back to surah list
    await waitFor(() => {
      expect(screen.getByText(/Al-Fatihah/i)).toBeInTheDocument();
      expect(screen.getByText(/Al-Baqarah/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ/i)).not.toBeInTheDocument(); // Verses should not be visible
  });
  
  test('displays loading indicator when fetching surahs', () => {
    quranService.getAllSurahs.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );
    // MUI CircularProgress has role="progressbar"
    // We check if the surah list is NOT yet there, implying loading
    expect(screen.queryByText(/Al-Fatihah/i)).not.toBeInTheDocument();
    // Note: Directly testing for MUI's CircularProgress might be brittle.
    // It's better to test the absence of content or presence of a specific loading text if available.
    // The component doesn't have a specific text like "Loading surahs...".
    // It shows a general loading state which might be a spinner.
  });

  test('displays loading indicator when fetching verses', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    quranService.getSurahWithAyahs.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter>
        <Quran />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Al-Fatihah/i));
    fireEvent.click(screen.getByText(/Al-Fatihah/i).closest('button') || screen.getByText(/Al-Fatihah/i));
    
    // After clicking, it should be loading verses.
    // Verses should not be visible yet.
    expect(screen.queryByText(/بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ/i)).not.toBeInTheDocument();
    // The component shows a general loading state.
  });

  test('reads and applies search term from URL query parameters on initial load', async () => {
    quranService.getAllSurahs.mockResolvedValue(mockSurahs);
    (useSearchParams).mockReturnValue([new URLSearchParams("search=An-Nas"), jest.fn()]);

    render(
      <MemoryRouter initialEntries={['/quran?search=An-Nas']}>
        <Quran />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('An-Nas')).toBeInTheDocument(); // Search input should have the value
      expect(screen.getByText(/An-Nas/i)).toBeInTheDocument();
      expect(screen.queryByText(/Al-Fatihah/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Al-Baqarah/i)).not.toBeInTheDocument();
    });
  });

});
