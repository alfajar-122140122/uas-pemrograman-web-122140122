import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import quranService from '../services/quranService';
import { Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, TextField, Button, CircularProgress } from '@mui/material';
import useAuthStore from '../hooks/useAuth';

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
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const result = await quranService.getAllSurahs();
        setSurahs(result.data);      } catch (error) {
        console.error("Error fetching surahs:", error);
        showNotification(`Error loading Surah list: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
    
    // Get query parameters for pre-filling the form
    const surahNumber = searchParams.get('surah');
    const ayahNumber = searchParams.get('ayah');
    
    if (surahNumber && ayahNumber) {
      setLoading(true);
      // Find surah name from surah number
      quranService.getSurahWithAyahs(surahNumber)
        .then(result => {
          setFormData(prev => ({
            ...prev,
            surah_name: result.data.englishName,
            ayah_range: ayahNumber
          }));
        })        .catch(error => {
          console.error("Error fetching surah details:", error);
          showNotification(`Error fetching surah details: ${error.message}`, 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams]);
  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      // Fetch existing hafalan data if in edit mode
      api.get(`/v1/hafalan/${id}`)
        .then(response => {
          const { surah_name, ayah_range, status, catatan, ayah_id } = response.data;
          setFormData({
            surah_name,
            ayah_range,
            status,
            catatan: catatan || '',
            ayah_id
          });
        })
        .catch(error => {          console.error("Error fetching hafalan:", error);
          showNotification(`Error loading data: ${error.response?.data?.error || error.message}`, 'error');
          // Redirect back to dashboard on error
          setTimeout(() => navigate('/'), 1500);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditMode, navigate]);

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
      try {      if (isEditMode) {
        await api.put(`/v1/hafalan/${id}`, formData);
        showNotification('Hafalan berhasil diperbarui!', 'success');
      } else {
        await api.post(`/v1/users/${user.id}/hafalan`, formData);
        showNotification('Hafalan berhasil dibuat!', 'success');
      }
      
      // Navigate after a short delay to show the notification
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {      console.error("Error submitting hafalan:", error);
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
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Required</h2>
        <p className="mb-4">You need to login to access this page.</p>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {isEditMode ? 'Edit Hafalan' : 'Tambah Hafalan Baru'}
      </h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <CircularProgress color="success" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormControl fullWidth>
            <InputLabel id="surah-label">Surah</InputLabel>
            <Select
              labelId="surah-label"
              name="surah_name"
              value={formData.surah_name}
              onChange={handleChange}
              required
              disabled={loading}
            >
              {surahs.map(surah => (
                <MenuItem key={surah.number} value={surah.englishName}>
                  {surah.number}. {surah.englishName} ({surah.name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Range Ayat"
            name="ayah_range"
            placeholder="e.g., 1-7 or just 5"
            value={formData.ayah_range}
            onChange={handleChange}
            required
            disabled={loading}
            helperText="Nomor ayat atau rentang (mis.: 1-7)"
          />

          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <MenuItem value="belum">Belum Dihafal</MenuItem>
              <MenuItem value="sedang">Sedang Dihafal</MenuItem>
              <MenuItem value="selesai">Selesai Dihafal</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Catatan"
            name="catatan"
            multiline
            rows={3}
            value={formData.catatan}
            onChange={handleChange}
            disabled={loading}
            placeholder="Tambahkan catatan jika diperlukan"
          />

          <div className="flex space-x-4 pt-2">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : (isEditMode ? 'Update' : 'Simpan')}
            </Button>
          </div>
        </form>
      )}
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default HafalanForm;
