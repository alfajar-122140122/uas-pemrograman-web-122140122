import axios from 'axios';

// Set the default base URL for API requests
const API_URL = 'http://localhost:6543/api'; // Update this to match your Pyramid backend URL

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Set up request interceptor to add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API functions
export const AuthAPI = {
  // Register a new user
  register: async (userData) => {
    return await axios.post('/auth/register', userData);
  },

  // Login a user
  login: async (credentials) => {
    return await axios.post('/auth/login', credentials);
  },

  // Get current user profile
  getCurrentUser: async () => {
    return await axios.get('/auth/me');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Fungsi-fungsi API untuk Al-Qur'an - menggunakan API publik
export const QuranAPI = {
  // Mendapatkan semua surah
  getAllSurahs: async () => {
    try {
      // Menggunakan API Quran.com untuk data surah
      const response = await axios.get('https://api.quran.com/api/v4/chapters');
      return { data: response.data.chapters };
    } catch (error) {
      console.error('Error mendapatkan data surah:', error);
      return { data: [] };
    }
  },
  
  // Mendapatkan ayat-ayat dari surah tertentu
  getSurahVerses: async (surahNumber) => {
    try {
      const response = await axios.get(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?language=id&words=true&translations=33`);
      
      // Memproses respons untuk mendapatkan teks Arab dan terjemahan
      const verses = response.data.verses.map(verse => ({
        number: verse.verse_number,
        text: verse.text_imlaei || verse.text_uthmani,
        translation: verse.translations[0]?.text || ''
      }));
      
      return { data: { verses } };
    } catch (error) {
      console.error('Error mendapatkan ayat-ayat:', error);
      return { data: { verses: [] } };
    }
  },
  
  // Pencarian Al-Qur'an
  searchQuran: async (query) => {
    try {
      const response = await axios.get(`https://api.quran.com/api/v4/search?q=${query}&language=id&size=20`);
      
      // Memproses respons pencarian
      const matches = response.data.search.results.map(result => ({
        id: `${result.verse_key}`,
        surahNumber: parseInt(result.verse_key.split(':')[0]),
        verseNumber: parseInt(result.verse_key.split(':')[1]),
        surahName: result.verse.chapter_name,
        surahEnglishName: result.verse.chapter_name,
        text: result.verse.text_imlaei || result.verse.text_uthmani,
        translation: result.verse.translations[0]?.text || ''
      }));
      
      return { data: { matches, query } };
    } catch (error) {
      console.error('Error melakukan pencarian:', error);
      return { data: { matches: [], query } };
    }
  }
};

// Fungsi-fungsi API untuk manajemen Hafalan
export const HafalanAPI = {
  // Mendapatkan semua hafalan pengguna
  getUserHafalan: async () => {
    try {
      // Untuk saat ini, mengembalikan data contoh (mock data) sampai backend siap
      return { 
        data: [
          {
            id: 1,
            surahNumber: 67,  // Al-Mulk
            startVerse: 1,
            endVerse: 10,
            date: '2025-05-01',
            quality: 'good',
            status: 'completed',
            notes: 'Alhamdulillah lancar'
          },
          {
            id: 2,
            surahNumber: 67,  // Al-Mulk
            startVerse: 11,
            endVerse: 15,
            date: '2025-05-08',
            quality: 'average',
            status: 'in_progress',
            notes: 'Perlu diulang lagi'
          },
          {
            id: 3,
            surahNumber: 56,  // Al-Waqiah
            startVerse: 1,
            endVerse: 30,
            date: '2025-04-20',
            quality: 'excellent',
            status: 'completed',
            notes: ''
          }
        ]
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.get('/hafalan');
    } catch (error) {
      console.error('Error mendapatkan data hafalan:', error);
      return { data: [] };
    }
  },
  
  // Menambahkan hafalan baru
  addHafalan: async (hafalanData) => {
    try {
      // Respons contoh (mock)
      return { 
        data: {
          id: Math.floor(Math.random() * 1000) + 4,  // ID acak
          ...hafalanData
        }
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.post('/hafalan', hafalanData);
    } catch (error) {
      console.error('Error menambahkan hafalan:', error);
      throw error;
    }
  },
  
  // Memperbarui hafalan yang sudah ada
  updateHafalan: async (id, hafalanData) => {
    try {
      // Respons contoh (mock)
      return { 
        data: {
          id,
          ...hafalanData
        }
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.put(`/hafalan/${id}`, hafalanData);
    } catch (error) {
      console.error('Error memperbarui hafalan:', error);
      throw error;
    }
  },
  
  // Menghapus hafalan
  deleteHafalan: async (id) => {
    try {
      // Respons contoh (mock)
      return { data: { success: true } };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.delete(`/hafalan/${id}`);
    } catch (error) {
      console.error('Error menghapus hafalan:', error);
      throw error;
    }
  },
  
  // Mendapatkan semua surah (menggunakan fungsi QuranAPI)
  getAllSurahs: async () => {
    return await QuranAPI.getAllSurahs();
  }
};

export default axios;
