import axios from 'axios';

// External Quran API
const quranCloudApi = axios.create({
  baseURL: 'https://api.alquran.cloud/v1',
});

/**
 * Service for interacting with the alquran.cloud API
 */
const quranService = {
  /**
   * Get all surahs from the alquran.cloud API
   */
  getAllSurahs: async () => {
    try {
      // Get data directly from alquran.cloud
      const response = await quranCloudApi.get('/surah');
      return {
        data: response.data.data,
        source: 'external'
      };
    } catch (error) {
      console.error('Error fetching surahs from alquran.cloud:', error);
      throw error;
    }
  },

  /**
   * Get a specific surah with its ayahs from alquran.cloud
   * @param {number} surahNumber - The surah number (1-114)
   * @returns {Object} The surah data with ayahs
   */
  getSurahWithAyahs: async (surahNumber) => {
    try {
      // Get directly from external API
      const response = await quranCloudApi.get(`/surah/${surahNumber}/editions/quran-uthmani,en.sahih,id.indonesian`);
      
      // Extract the data from different editions
      const arabicEdition = response.data.data[0];
      const englishEdition = response.data.data[1];
      const indonesianEdition = response.data.data[2];
      
      // Combine data
      return {
        surah: {
          number: arabicEdition.number,
          name: arabicEdition.name,
          englishName: arabicEdition.englishName,
          englishNameTranslation: arabicEdition.englishNameTranslation,
          numberOfAyahs: arabicEdition.numberOfAyahs,
          revelationType: arabicEdition.revelationType,
        },
        ayahs: arabicEdition.ayahs.map((ayah, index) => ({
          number: ayah.number,
          text: ayah.text,
          numberInSurah: ayah.numberInSurah,
          translation: {
            en: englishEdition.ayahs[index].text,
            id: indonesianEdition.ayahs[index].text,
          }
        })),
        source: 'external'
      };
    } catch (error) {
      console.error('Error fetching surah with ayahs from alquran.cloud:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific ayah from a surah
   * @param {number} surahNumber - The surah number
   * @param {number} ayahNumber - The ayah number within the surah
   * @returns {Object} The ayah data
   */
  getAyah: async (surahNumber, ayahNumber) => {
    try {
      const result = await quranService.getSurahWithAyahs(surahNumber);
      const ayah = result.ayahs.find(a => a.numberInSurah === Number(ayahNumber));
      
      if (!ayah) {
        throw new Error(`Ayah ${ayahNumber} not found in Surah ${surahNumber}`);
      }
      
      return {
        ...ayah,
        surah: result.surah
      };
    } catch (error) {
      console.error('Error fetching specific ayah:', error);
      throw error;
    }
  }
};

export default quranService;
