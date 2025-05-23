import React, { useState, useEffect } from 'react';
import axios from 'axios'; // For alquran.cloud API
import QuranCard from '../components/QuranCard';

const Quran = () => {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch list of surahs
  useEffect(() => {
    setLoading(true);
    axios.get('https://api.alquran.cloud/v1/surah')
      .then(response => {
        setSurahs(response.data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching surahs:", error);
        setLoading(false);
        // Show error toast/alert
      });
  }, []);

  const handleSurahChange = (surahNumber) => {
    if (!surahNumber) {
      setSelectedSurah(null);
      setVerses([]);
      return;
    }
    setSelectedSurah(surahNumber);
    setLoading(true);
    // Fetch verses for selected surah with translation (e.g., en.sahih)
    axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,id.indonesian`)
      .then(response => {
        // The API returns multiple editions, we need to combine them.
        // Assuming quran-uthmani is at index 0, en.sahih at 1, id.indonesian at 2
        const arabicVerses = response.data.data[0].ayahs;
        const englishTranslation = response.data.data[1].ayahs;
        const indonesianTranslation = response.data.data[2].ayahs;

        const combinedVerses = arabicVerses.map((ayah, index) => ({
          numberInSurah: ayah.numberInSurah,
          text: ayah.text, // Arabic text
          translation: {
            en: englishTranslation[index].text,
            id: indonesianTranslation[index].text,
            latin: ayah.text // Placeholder for actual transliteration if available or generated
          }
        }));
        setVerses(combinedVerses);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching verses:", error);
        setLoading(false);
        // Show error toast/alert
      });
  };

  const handleAddToHafalan = (verse) => {
    // This would typically navigate to HafalanForm with pre-filled data
    // or open a modal to add to hafalan.
    console.log("Add to hafalan:", selectedSurah, verse);
    alert(`Tambahkan ke hafalan: Surah ${selectedSurah}, Ayat ${verse.numberInSurah}`);
    // navigate(`/hafalan/new?surah=${selectedSurah}&ayat=${verse.numberInSurah}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Baca Al-Qur'an</h1>
      <div className="mb-6">
        <select
          onChange={(e) => handleSurahChange(e.target.value)}
          className="block w-full md:w-1/2 mx-auto p-3 border border-gray-300 bg-white rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          defaultValue=""
        >
          <option value="" disabled>Pilih Surat</option>
          {surahs.map(surah => (
            <option key={surah.number} value={surah.number}>
              {surah.number}. {surah.englishName} ({surah.name})
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-center text-gray-600">Memuat...</p>}

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
                  {verse.text} ({verse.numberInSurah})
                </p>
                <p className="text-gray-700 mb-1">{verse.translation.id}</p>
                <p className="text-sm text-gray-500 italic mb-3">{verse.translation.en}</p>
                {/* <p className="text-sm text-gray-500">{verse.translation.latin}</p> */}
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
    </div>
  );
};

export default Quran;
