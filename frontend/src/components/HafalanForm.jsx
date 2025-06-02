import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import quranService from '../services/quranService';
import { Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, TextField, Button, CircularProgress } from '@mui/material'; // Ensure InputLabel is imported
import useAuthStore from '../hooks/useAuth';
import { act } from '@testing-library/react';

const HafalanForm = () => {
  const { id } = useParams(); // For editing existing hafalan
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    surah_name: '',
    ayah_range: '',
    status: 'belum', // belum, sedang, selesai
    catatan: '',
    ayah_id: null
  });
  
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const isEditMode = Boolean(id);

  // Load surahs for the dropdown
  useEffect(() => {
    const fetchSurahsAndParams = async () => {
      act(() => { 
        setLoading(true);
      });
      try {
        const result = await quranService.getAllSurahs();
        act(() => { // Wrap state update in act
          setSurahs(result.data);
        });
      } catch (error) {
        console.error("Error fetching surahs:", error);
        act(() => { // Wrap state update in act
          showNotification(`Error loading Surah list: ${error.message}`, 'error');
        });
      } finally {
        act(() => { // Wrap state update in act
          setLoading(false);
        });
      }
    };

    fetchSurahsAndParams();
    
    // Get query parameters for pre-filling the form
    const surahNumber = searchParams.get('surah');
    const ayahNumber = searchParams.get('ayah');
    
    if (surahNumber && ayahNumber) {
      act(() => { // Wrap state update in act
        setLoading(true);
      });
      // Find surah name from surah number
      quranService.getSurahWithAyahs(surahNumber)
        .then(result => {
          act(() => { // Wrap state update in act
            setFormData(prev => ({
              ...prev,
              surah_name: result.data.englishName,
              ayah_range: ayahNumber
            }));
          });
        })
        .catch(error => {
          console.error("Error fetching surah details:", error);
          act(() => { // Wrap state update in act
            showNotification(`Error fetching surah details: ${error.message}`, 'error');
          });
        })
        .finally(() => {
          act(() => { // Wrap state update in act
            setLoading(false);
          });
        });
    }
  }, [searchParams]); // Removed navigate from dependencies as it's stable

  useEffect(() => {
    if (isEditMode) {
      act(() => { // Wrap state update in act
        setLoading(true);
      });
      // Fetch existing hafalan data if in edit mode
      api.get(`/v1/hafalan/${id}`)
        .then(response => {
          const { surah_name, ayah_range, status, catatan, ayah_id } = response.data;
          act(() => { // Wrap state update in act
            setFormData({
              surah_name,
              ayah_range,
              status,
              catatan: catatan || '',
              ayah_id
            });
          });
        })
        .catch(error => {
          console.error("Error fetching hafalan:", error);
          act(() => { // Wrap state update in act
            showNotification(`Error loading data: ${error.response?.data?.error || error.message}`, 'error');
          });
          // setTimeout(() => navigate('/'), 1500); // Consider if navigation is needed on error during test
        })
        .finally(() => {
          act(() => { // Wrap state update in act
            setLoading(false);
          });
        });
    }
  }, [id, isEditMode]); // Removed navigate from dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
      if (!user || !user.id) {
      showNotification('You must be logged in to save hafalan', 'error');
      alert("Anda harus login untuk menyimpan hafalan");
      return;
    }
    
    setLoading(true);

    // Prepare data to be sent
    let dataToSend = { ...formData };

    // If status is 'selesai' and last_reviewed_at is not set (or was not set previously for this save action),
    // set it to the current date.
    // This ensures that if a user marks an item as 'selesai', it gets a review date.
    if (dataToSend.status === 'selesai' && !dataToSend.last_reviewed_at) {
      dataToSend.last_reviewed_at = new Date().toISOString();
    }

    // If status is NOT 'selesai', we might want to clear last_reviewed_at
    // if the backend doesn't handle this. For now, we'll let the backend logic
    // (as implemented previously) handle keeping or clearing it.
    // If you want frontend to explicitly clear it:
    // if (dataToSend.status !== 'selesai') {
    //   dataToSend.last_reviewed_at = null;
    // }

      try {
      if (isEditMode) {
        // For PUT requests, send the potentially updated dataToSend
        await api.put(`/v1/hafalan/${id}`, dataToSend);
        showNotification('Hafalan berhasil diperbarui!', 'success');
      } else {
        // For POST requests, send the potentially updated dataToSend
        await api.post(`/v1/users/${user.id}/hafalan`, dataToSend);
        showNotification('Hafalan berhasil dibuat!', 'success');
      }
      
      // Navigate after a short delay to show the notification
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error("Error submitting hafalan:", error);
      const errorMsg = error.response?.data?.error || error.message;
      showNotification(`Error: ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-bg-secondary shadow-lg rounded-2xl border border-border-color">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Required</h2>
        <p className="mb-4 text-text-secondary">You need to login to access this page.</p>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: '#22C55E', // accent-primary
            color: '#FFFFFF', // white
            '&:hover': { backgroundColor: '#16A34A' } // accent-primary-dark
          }}
          fullWidth
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 mb-8 p-6 sm:p-8 bg-bg-secondary shadow-xl rounded-2xl border border-border-color">
      <h2 className="text-3xl font-semibold text-text-primary mb-8 text-center">
        {isEditMode ? 'Edit Hafalan' : 'Tambah Hafalan Baru'}
      </h2>

      {loading && !surahs.length && !isEditMode ? (
        <div className="flex flex-col items-center justify-center py-12">
          <CircularProgress sx={{ color: '#22C55E' /* accent-primary */}} />
          <p className="mt-3 text-text-secondary">Memuat data surah...</p>
        </div>
      ) : loading && isEditMode ? (
        <div className="flex flex-col items-center justify-center py-12">
          <CircularProgress sx={{ color: '#22C55E' /* accent-primary */}} />
          <p className="mt-3 text-text-secondary">Memuat data hafalan...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* <label htmlFor="surah-select" className="block text-sm font-medium text-text-primary mb-1">Surah</label> */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="surah-label">Surah</InputLabel>
              <Select
                labelId="surah-label"
                id="surah-select"
                name="surah_name"
                value={formData.surah_name}
                onChange={handleChange}
                required
                disabled={loading || !surahs.length}
                displayEmpty
                label="Surah" // Added for outlined variant
                sx={{
                  backgroundColor: '#FFFFFF', // bg-primary
                  color: formData.surah_name ? '#1F2937' : '#6B7280', // text-primary or placeholder
                  borderRadius: '0.375rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' /* border-color */ },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#22C55E' /* accent-primary */ },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#22C55E', boxShadow: '0 0 0 1px #22C55E' },
                  '& .MuiSelect-icon': { color: '#6B7280' /* gray-500 */},
                  '.MuiSelect-select': { padding: '10px 14px' }
                }}
              >
                <MenuItem value="" disabled sx={{ color: '#6B7280' }}>
                  Pilih Surat
                </MenuItem>
                {surahs.map(surah => (
                  <MenuItem key={surah.number} value={surah.englishName} sx={{color: '#1F2937' /* text-primary */}}>
                    {surah.number}. {surah.englishName} ({surah.name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div>
            <label htmlFor="ayah-range-input" className="block text-sm font-medium text-text-primary mb-1">Range Ayat</label>
            <TextField
              id="ayah-range-input"
              fullWidth
              variant="outlined"
              name="ayah_range"
              placeholder="Masukkan nomor ayat atau rentang"
              value={formData.ayah_range}
              onChange={handleChange}
              required
              disabled={loading}
              helperText="Nomor ayat atau rentang (misalnya: 1-7 atau cukup tulis 5)"
              InputLabelProps={{ style: { display: 'none' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.375rem',
                  backgroundColor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#22C55E' },
                  '&.Mui-focused fieldset': { borderColor: '#22C55E', boxShadow: '0 0 0 1px #22C55E' },
                  '& input': { 
                    padding: '10px 14px', 
                    color: '#1F2937',
                    '&::placeholder': { color: '#6B7280', opacity: 1 }
                  }
                },
                '.MuiFormHelperText-root': { color: '#6B7280', marginLeft: 0 }
              }}
            />
          </div>

          <div>
            {/* <label htmlFor="status-select" className="block text-sm font-medium text-text-primary mb-1">Status</label> */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                id="status-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={loading}
                label="Status" // Added for outlined variant
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  borderRadius: '0.375rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#22C55E' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#22C55E', boxShadow: '0 0 0 1px #22C55E' },
                  '& .MuiSelect-icon': { color: '#6B7280'},
                  '.MuiSelect-select': { padding: '10px 14px' }
                }}
              >
                <MenuItem value="belum" sx={{color: '#1F2937'}}>Belum Dihafal</MenuItem>
                <MenuItem value="sedang" sx={{color: '#1F2937'}}>Sedang Dihafal</MenuItem>
                <MenuItem value="selesai" sx={{color: '#1F2937'}}>Selesai Dihafal</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div>
            <label htmlFor="catatan-input" className="block text-sm font-medium text-text-primary mb-1">Catatan</label>
            <TextField
              id="catatan-input"
              fullWidth
              variant="outlined"
              name="catatan"
              multiline
              rows={4}
              value={formData.catatan}
              onChange={handleChange}
              disabled={loading}
              placeholder="Tambahkan catatan jika diperlukan (opsional)"
              InputLabelProps={{ style: { display: 'none' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.375rem',
                  backgroundColor: '#FFFFFF',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#22C55E' },
                  '&.Mui-focused fieldset': { borderColor: '#22C55E', boxShadow: '0 0 0 1px #22C55E' },
                  '& textarea': { 
                    padding: '10px 14px', 
                    color: '#1F2937',
                    '&::placeholder': { color: '#6B7280', opacity: 1 }
                  }
                }
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={() => navigate('/')}
              disabled={loading}
              sx={{
                color: '#4B5563', // text-secondary
                borderColor: '#E5E7EB', // border-color
                textTransform: 'none',
                padding: '10px 0',
                fontSize: '0.95rem',
                fontWeight: '600',
                borderRadius: '0.375rem',
                '&:hover': {
                  borderColor: '#4B5563', 
                  backgroundColor: 'rgba(75, 85, 99, 0.04)'
                }
              }}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: '#22C55E', // accent-primary
                color: '#FFFFFF', // white
                textTransform: 'none',
                padding: '10px 0',
                fontSize: '0.95rem',
                fontWeight: '600',
                borderRadius: '0.375rem',
                '&:hover': {
                  backgroundColor: '#16A34A' // accent-primary-dark
                },
                '&.Mui-disabled': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: '#FFFFFF' }} />
              ) : (
                isEditMode ? 'Simpan Perubahan' : 'Simpan Hafalan'
              )}
            </Button>
          </div>
        </form>
      )}

      <Snackbar
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default HafalanForm;
