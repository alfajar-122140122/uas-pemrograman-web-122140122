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
      <h1 className="text-3xl font-bold text-text-primary mb-8 text-center">Baca Al-Qur'an</h1>
      
      {/* Search Bar */} 
      <div className="mb-8 px-2 sm:px-0 max-w-3xl mx-auto">
        <TextField 
          fullWidth
          variant="outlined"
          placeholder="Cari Surat (nama, nomor, atau nama Arab)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'var(--text-secondary)' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '12px', 
              backgroundColor: 'var(--bg-primary)', 
              color: 'var(--text-primary)',
              'input::placeholder': {
                color: 'var(--text-secondary)',
                opacity: 1
              }
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'var(--border-color)', 
              },
              '&:hover fieldset': {
                borderColor: 'var(--accent-primary)', 
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--accent-primary)', 
                borderWidth: '2px',
              },
            },
          }}
        />
      </div>

      {/* Surah Cards Grid - Display if no surah is selected */} 
      {!selectedSurah && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
          {filteredSurahs.length > 0 ? filteredSurahs.map(surah => (
            <SurahCard key={surah.number} surah={surah} onClick={handleSurahChange} />
          )) : (
            <div className="col-span-full text-center py-10 bg-bg-secondary rounded-2xl border border-border-color">
              <p className="text-text-secondary text-lg">Tidak ada surat yang cocok dengan pencarian "{searchTerm}".</p>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator for surah list or verses */}
      {loading && (
        <div className="flex flex-col items-center justify-center my-16">
          <CircularProgress sx={{ color: 'var(--accent-primary)' }} />
          <p className="mt-3 text-text-secondary">Memuat data...</p>
        </div>
      )}

      {/* Selected Surah Verses - Display if a surah is selected and not loading */} 
      {selectedSurah && !loading && verses.length > 0 && (
        <div className="mt-6 bg-bg-secondary p-4 sm:p-6 rounded-2xl shadow-xl border border-border-color">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-4 border-b border-border-color">
            <h2 className="text-2xl sm:text-3xl font-semibold text-accent-primary-dark mb-2 sm:mb-0">
              {surahs.find(s => s.number === parseInt(selectedSurah))?.englishName}
              <span className="text-xl text-text-secondary ml-2">
                ({surahs.find(s => s.number === parseInt(selectedSurah))?.name})
              </span>
            </h2>
            <button 
              onClick={() => handleSurahChange(null)} // Clear selection
              className="bg-bg-primary hover:bg-border-color text-text-secondary font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 border border-border-color focus:outline-none focus:ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-secondary self-start sm:self-center mt-2 sm:mt-0"
            >
              &larr; Kembali ke Daftar Surat
            </button>
          </div>
          
          <div className="space-y-6">
            {verses.map(verse => (
              <div key={verse.numberInSurah} className="bg-bg-primary shadow-lg rounded-2xl p-5 sm:p-6 border border-border-color transition-shadow duration-200 hover:shadow-xl">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium bg-accent-primary/10 text-accent-primary-dark px-3 py-1 rounded-full">
                    Ayat {verse.numberInSurah}
                  </span>
                  <p className="text-right text-3xl sm:text-4xl font-arabic leading-relaxed text-text-primary" dir="rtl" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
                    {verse.text}
                  </p>
                </div>
                <p className="text-text-primary mb-2 text-base leading-relaxed font-inter">{verse.translation.id}</p>
                <p className="text-sm text-text-secondary italic mb-4 font-inter">{verse.translation.en}</p>
                <button
                  onClick={() => handleAddToHafalan(verse)}
                  className="mt-3 bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 ring-offset-2 ring-accent-primary ring-offset-bg-primary"
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
