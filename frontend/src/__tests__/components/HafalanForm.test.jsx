import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HafalanForm from '../../components/HafalanForm';
import useAuthStore from '../../hooks/useAuth';
import api from '../../services/api';
import quranService from '../../services/quranService';

// Mocks
jest.mock('../../hooks/useAuth');
jest.mock('../../services/api'); // This will now use the mock from __mocks__
jest.mock('../../services/quranService');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn(),
  useSearchParams: () => [new URLSearchParams()], // Mock useSearchParams
}));

const mockUser = { id: 1, username: 'testuser' };

describe('HafalanForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    useAuthStore.mockReturnValue({ user: mockUser });
    quranService.getAllSurahs.mockResolvedValue({ data: [{ number: 1, englishName: 'Al-Fatiha' }, { number: 2, englishName: 'Al-Baqarah' }] });
    quranService.getSurahWithAyahs.mockResolvedValue({ data: { englishName: 'Al-Fatiha' } }); // Mock for pre-fill
    api.get.mockResolvedValue({ data: { surah_name: 'Al-Fatiha', ayah_range: '1-7', status: 'selesai', catatan: 'Test note' } });
    api.post.mockResolvedValue({ data: { message: 'Hafalan berhasil dibuat!' } });
    api.put.mockResolvedValue({ data: { message: 'Hafalan berhasil diperbarui!' } });
  });

  const renderForm = (idParam = null, queryParams = '') => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ id: idParam });
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams(queryParams),
    ]);
    render(
      <MemoryRouter initialEntries={idParam ? [`/hafalan/edit/${idParam}${queryParams}`] : [`/hafalan/new${queryParams}`]}>
        <Routes>
          <Route path="/hafalan/:action/:id?" element={<HafalanForm />} />
          <Route path="/hafalan/new" element={<HafalanForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders add form correctly', async () => {
    renderForm();
    expect(screen.getByText('Tambah Hafalan Baru')).toBeInTheDocument();

    // Wait for surahs to load
    await waitFor(() => {
      expect(screen.queryByText(/Memuat data surah.../i)).not.toBeInTheDocument();
    });

    const surahCombobox = await screen.findByRole('combobox', { name: /Surah/i });
    expect(surahCombobox).toBeInTheDocument();
    expect(surahCombobox).not.toBeDisabled();

    expect(screen.getByLabelText(/Range Ayat/i)).toBeInTheDocument();

    const statusCombobox = await screen.findByRole('combobox', { name: /Status/i });
    expect(statusCombobox).toBeInTheDocument();
  });

  test('renders edit form correctly and loads existing data', async () => {
    renderForm('123');
    expect(screen.getByText('Edit Hafalan')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Memuat data hafalan...')).not.toBeInTheDocument();
    });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/v1/hafalan/123'));

    const surahCombobox = await screen.findByRole('combobox', { name: /Surah/i });
    expect(surahCombobox).toHaveTextContent(/Al-Fatiha/i);
    
    expect(screen.getByDisplayValue('1-7')).toBeInTheDocument(); 

    const statusCombobox = await screen.findByRole('combobox', { name: /Status/i });
    expect(statusCombobox).toHaveTextContent(/Selesai Dihafal/i);

    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument(); 
  });

  test('shows authentication required message if user is not logged in', () => {
    useAuthStore.mockReturnValue({ user: null });
    renderForm();
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('You need to login to access this page.')).toBeInTheDocument();
  });

  test('handles surah selection and input changes', async () => {
    renderForm();
    // Wait for surah loading
    await waitFor(() => expect(screen.queryByText(/Memuat data surah.../i)).not.toBeInTheDocument());

    const surahCombobox = await screen.findByRole('combobox', { name: /Surah/i });
    expect(surahCombobox).not.toBeDisabled();

    fireEvent.mouseDown(surahCombobox);
    const surahOption = await screen.findByRole('option', { name: /Al-Baqarah/i });
    fireEvent.click(surahOption);
    expect(surahCombobox).toHaveTextContent(/Al-Baqarah/i);

    fireEvent.change(screen.getByLabelText(/Range Ayat/i), { target: { value: '1-5' } });
    expect(screen.getByLabelText(/Range Ayat/i)).toHaveValue('1-5');

    fireEvent.change(screen.getByRole('textbox', { name: /Catatan/i }), { target: { value: 'Surah penting' } });
    expect(screen.getByRole('textbox', { name: /Catatan/i })).toHaveValue('Surah penting');
  });

  test('submits new hafalan data correctly', async () => {
    renderForm();
    await waitFor(() => expect(screen.queryByText(/Memuat data surah.../i)).not.toBeInTheDocument());

    const surahCombobox = await screen.findByRole('combobox', { name: /Surah/i });
    expect(surahCombobox).not.toBeDisabled();
    fireEvent.mouseDown(surahCombobox);
    const surahOption = await screen.findByRole('option', { name: /Al-Fatiha/i });
    fireEvent.click(surahOption);

    fireEvent.change(screen.getByLabelText(/Range Ayat/i), { target: { value: '1-7' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Catatan/i }), { target: { value: 'Test submission' } });
    
    const statusCombobox = await screen.findByRole('combobox', { name: /Status/i });
    fireEvent.mouseDown(statusCombobox);
    const statusOption = await screen.findByRole('option', { name: /Selesai Dihafal/i }); 
    fireEvent.click(statusOption);

    fireEvent.click(screen.getByRole('button', { name: /Simpan Hafalan/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(`/v1/users/${mockUser.id}/hafalan`, expect.objectContaining({
        surah_name: 'Al-Fatiha',
        ayah_range: '1-7',
        status: 'selesai', 
        catatan: 'Test submission',
        last_reviewed_at: expect.any(String)
      }));
    });
    // Check for Snackbar message
    expect(await screen.findByText('Hafalan berhasil dibuat!')).toBeInTheDocument();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'), { timeout: 2000 });
  });

  test('submits updated hafalan data correctly', async () => {
    renderForm('123'); 
    
    await waitFor(() => {
      expect(screen.queryByText('Memuat data hafalan...')).not.toBeInTheDocument();
    });
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/v1/hafalan/123'));

    // Ensure form is populated before changing data
    // Check current values using the new selector strategy
    const surahCombobox = await screen.findByRole('combobox', { name: /Surah/i });
    expect(surahCombobox).toHaveTextContent(/Al-Fatiha/i); 

    const statusCombobox = await screen.findByRole('combobox', { name: /Status/i });
    expect(statusCombobox).toHaveTextContent(/Selesai Dihafal/i);
    
    expect(screen.getByDisplayValue('1-7')).toBeInTheDocument(); 
    expect(screen.getByDisplayValue('Test note')).toBeInTheDocument();

    // Change some data
    fireEvent.change(screen.getByLabelText('Range Ayat'), { target: { value: '1-10' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Catatan/i }), { target: { value: 'Updated note' } });

    fireEvent.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/v1/hafalan/123', expect.objectContaining({
        surah_name: 'Al-Fatiha', 
        ayah_range: '1-10',
        status: 'selesai', 
        catatan: 'Updated note',
      }));
    });
    expect(await screen.findByText('Hafalan berhasil diperbarui!')).toBeInTheDocument();
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'), { timeout: 2000 });
  });

  test('pre-fills form from query parameters', async () => {
    quranService.getAllSurahs.mockResolvedValueOnce({ data: [{ number: 1, englishName: 'Al-Fatiha' }, { number: 2, englishName: 'Al-Baqarah' }] });
    quranService.getSurahWithAyahs.mockResolvedValueOnce({ data: { englishName: 'Al-Fatiha' } });
    
    renderForm(null, '?surah=1&ayah=5');

    await waitFor(() => {
      expect(screen.queryByText('Memuat data surah...')).not.toBeInTheDocument();
    });
    await waitFor(() => expect(quranService.getSurahWithAyahs).toHaveBeenCalledWith('1'));
        
    const surahCombobox = await screen.findByRole('combobox', { name: /Surah/i });
    expect(surahCombobox).toHaveTextContent(/Al-Fatiha/i);

    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
  });

});
