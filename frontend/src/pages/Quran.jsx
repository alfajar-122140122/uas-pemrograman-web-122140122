import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, CircularProgress, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import quranService from '../services/quranService';
import SurahCard from '../components/SurahCard';

const Quran = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch list of surahs
  useEffect(() => {
    const fetchSurahs = async () => {
      setLoading(true);
      try {
        const result = await quranService.getAllSurahs();
        setSurahs(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching surahs:", error);
        setLoading(false);
        showNotification(`Error fetching surahs: ${error.message}`, 'error');
      }
    };

    fetchSurahs();
  }, []);

  const handleSurahChange = async (surahNumber) => {
    if (!surahNumber) {
      setSelectedSurah(null);
      setVerses([]);
      return;
    }
    
    setSelectedSurah(surahNumber);
    setLoading(true);
    
    try {
      // Scroll to top when a surah is selected
      window.scrollTo(0, 0);
      const result = await quranService.getSurahWithAyahs(surahNumber);
      setVerses(result.ayahs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching verses:", error);
      setLoading(false);
      showNotification(`Error fetching verses: ${error.message}`, 'error');
    }
  };

  const handleAddToHafalan = (verse) => {
    // Navigate to hafalan form with pre-filled data
    navigate(`/hafalan/new?surah=${selectedSurah}&ayah=${verse.numberInSurah}`);
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

  // Filter surahs based on search term
  const filteredSurahs = surahs.filter(surah => 
    surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.number.toString().includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-text-primary mb-6 text-center">Baca Al-Qur'an</h1>
      
      {/* Search Bar */} 
      <div className="mb-8 px-2 sm:px-0">
        <TextField 
          fullWidth
          variant="outlined"
          placeholder="Cari Surat (nama, nomor, atau nama Arab)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '12px', // Rounded corners
              backgroundColor: 'white', // White background
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'var(--border-color)', // Use theme border color
              },
              '&:hover fieldset': {
                borderColor: 'var(--accent-primary)', // Use theme accent color on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--accent-primary)', // Use theme accent color when focused
              },
            },
          }}
        />
      </div>

      {/* Surah Cards Grid - Display if no surah is selected */} 
      {!selectedSurah && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {filteredSurahs.map(surah => (
            <SurahCard key={surah.number} surah={surah} onClick={handleSurahChange} />
          ))}
        </div>
      )}

      {/* Loading indicator for surah list or verses */}
      {loading && (
        <div className="flex justify-center my-12">
          <CircularProgress sx={{ color: 'var(--accent-primary)' }} />
        </div>
      )}

      {/* Selected Surah Verses - Display if a surah is selected and not loading */} 
      {selectedSurah && !loading && verses.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-accent-primary-dark">
              {surahs.find(s => s.number === parseInt(selectedSurah))?.englishName}
              {' ('}
              {surahs.find(s => s.number === parseInt(selectedSurah))?.name}
              {')'}
            </h2>
            <button 
              onClick={() => handleSurahChange(null)} // Clear selection
              className="bg-bg-secondary hover:bg-border-color text-text-secondary font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-150"
            >
              &larr; Kembali ke Daftar Surat
            </button>
          </div>
          
          <div className="space-y-4">
            {verses.map(verse => (
              <div key={verse.numberInSurah} className="bg-white shadow-lg rounded-2xl p-6 border border-border-color">
                <p className="text-right text-3xl font-arabic leading-loose mb-4 text-text-primary" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
                  {verse.text} <span className="text-accent-primary-dark text-xl">({verse.numberInSurah})</span>
                </p>
                <p className="text-text-primary mb-2 text-base leading-relaxed">{verse.translation.id}</p>
                <p className="text-sm text-text-secondary italic mb-4">{verse.translation.en}</p>
                <button
                  onClick={() => handleAddToHafalan(verse)}
                  className="mt-3 bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 ring-offset-2 ring-accent-primary"
                >
                  Tambahkan ke Hafalan
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Notification Snackbar */}
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

export default Quran;
