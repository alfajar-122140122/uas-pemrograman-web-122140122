import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert, CircularProgress } from '@mui/material';
import quranService from '../services/quranService';

const Quran = () => {
  const navigate = useNavigate();
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Baca Al-Qur'an</h1>
      <div className="mb-6">
        <select
          onChange={(e) => handleSurahChange(e.target.value)}
          className="block w-full md:w-1/2 mx-auto p-3 border border-gray-300 bg-white rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          defaultValue=""
          disabled={loading}
        >
          <option value="" disabled>Pilih Surat</option>
          {surahs.map(surah => (
            <option key={surah.number} value={surah.number}>
              {surah.number}. {surah.englishName} ({surah.name})
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center my-12">
          <CircularProgress color="success" />
        </div>
      )}

      {selectedSurah && !loading && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-green-600 mb-4 text-center">
            {surahs.find(s => s.number === parseInt(selectedSurah))?.englishName}
            {' ('}
            {surahs.find(s => s.number === parseInt(selectedSurah))?.name}
            {')'}
          </h2>
          
          <div className="space-y-4">
            {verses.map(verse => (
              <div key={verse.numberInSurah} className="bg-white shadow-lg rounded-2xl p-6">
                <p className="text-right text-2xl font-arabic leading-relaxed mb-3" style={{ fontFamily: "'Traditional Arabic', serif" }}>
                  {verse.text} <span className="text-green-600">({verse.numberInSurah})</span>
                </p>
                <p className="text-gray-700 mb-1">{verse.translation.id}</p>
                <p className="text-sm text-gray-500 italic mb-3">{verse.translation.en}</p>
                <button
                  onClick={() => handleAddToHafalan(verse)}
                  className="mt-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Tambahkan ke Hafalan
                </button>
              </div>
            ))}
          </div>
        </div>
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

export default Quran;
