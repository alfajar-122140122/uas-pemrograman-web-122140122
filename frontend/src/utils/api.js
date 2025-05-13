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
  // Base URL untuk Quran.com API
  QURAN_COM_API_URL: 'https://api.quran.com/api/v4',
  
  // Base URL untuk Quran Cloud API
  QURAN_CLOUD_API_URL: 'https://api.alquran.cloud/v1',
  
  // Mendapatkan semua surah
  getAllSurahs: async () => {
    try {
      // Menggunakan API Quran Cloud untuk data surah
      const response = await axios.get(`${QuranAPI.QURAN_CLOUD_API_URL}/surah`);
      return { data: response.data.data };
    } catch (error) {
      console.error('Error mendapatkan data surah dari Quran Cloud:', error);
      
      // Fallback ke Quran.com API jika Quran Cloud gagal
      try {
        const fallbackResponse = await axios.get(`${QuranAPI.QURAN_COM_API_URL}/chapters`);
        return { data: fallbackResponse.data.chapters };
      } catch (fallbackError) {
        console.error('Error mendapatkan data surah:', fallbackError);
        return { data: [] };
      }
    }
  },
  
  // Mendapatkan ayat-ayat dari surah tertentu
  getSurahVerses: async (surahNumber) => {
    try {
      // Menggunakan API Quran Cloud untuk ayat-ayat 
      const arabicResponse = await axios.get(`${QuranAPI.QURAN_CLOUD_API_URL}/surah/${surahNumber}`);
      const translationResponse = await axios.get(`${QuranAPI.QURAN_CLOUD_API_URL}/surah/${surahNumber}/id.indonesian`);
      
      // Memproses respons untuk mendapatkan teks Arab dan terjemahan
      const arabicVerses = arabicResponse.data.data.ayahs;
      const translationVerses = translationResponse.data.data.ayahs;
      
      // Menggabungkan teks Arab dengan terjemahannya
      const verses = arabicVerses.map((verse, index) => ({
        number: verse.numberInSurah,
        text: verse.text,
        translation: translationVerses[index]?.text || '',
        audio: verse.audio,
        page: verse.page,
        juz: verse.juz
      }));
      
      return { 
        data: { 
          verses,
          name: arabicResponse.data.data.name,
          englishName: arabicResponse.data.data.englishName,
          englishNameTranslation: arabicResponse.data.data.englishNameTranslation,
          numberOfAyahs: arabicResponse.data.data.numberOfAyahs,
          revelationType: arabicResponse.data.data.revelationType
        } 
      };
    } catch (error) {
      console.error('Error mendapatkan ayat-ayat dari Quran Cloud:', error);
      
      // Fallback ke Quran.com API jika Quran Cloud gagal
      try {
        const fallbackResponse = await axios.get(`${QuranAPI.QURAN_COM_API_URL}/verses/by_chapter/${surahNumber}?language=id&words=true&translations=33`);
        
        // Memproses respons untuk mendapatkan teks Arab dan terjemahan
        const verses = fallbackResponse.data.verses.map(verse => ({
          number: verse.verse_number,
          text: verse.text_imlaei || verse.text_uthmani,
          translation: verse.translations[0]?.text || ''
        }));
        
        return { data: { verses } };
      } catch (fallbackError) {
        console.error('Error mendapatkan ayat-ayat:', fallbackError);
        return { data: { verses: [] } };
      }
    }
  },
  
  // Mendapatkan detail juz tertentu
  getJuzDetails: async (juzNumber) => {
    try {
      // Menggunakan API Quran Cloud untuk data juz
      const response = await axios.get(`${QuranAPI.QURAN_CLOUD_API_URL}/juz/${juzNumber}`);
      return { data: response.data.data };
    } catch (error) {
      console.error('Error mendapatkan data juz:', error);
      return { data: null };
    }
  },
  
  // Mendapatkan audio surah
  getAudioSurah: async (surahNumber, reciter = 'ar.alafasy') => {
    try {
      // Mendapatkan audio Quran dengan qari tertentu
      const response = await axios.get(`${QuranAPI.QURAN_CLOUD_API_URL}/surah/${surahNumber}/${reciter}`);
      return { data: response.data.data };
    } catch (error) {
      console.error('Error mendapatkan audio surah:', error);
      return { data: null };
    }
  },
  
  // Mendapatkan daftar qari/penghafal
  getReciters: async () => {
    try {
      // Menggunakan API Quran Cloud untuk daftar qari
      const response = await axios.get(`${QuranAPI.QURAN_CLOUD_API_URL}/edition/format/audio`);
      return { data: response.data.data };
    } catch (error) {
      console.error('Error mendapatkan daftar qari:', error);
      return { data: [] };
    }
  },
  
  // Mendapatkan ayat berdasarkan halaman
  getPageVerses: async (pageNumber) => {
    try {
      // Menggunakan API Quran Cloud untuk ayat-ayat pada halaman tertentu
      const response = await axios.get(`${QuranAPI.QURAN_CLOUD_API_URL}/page/${pageNumber}/quran-uthmani`);
      return { data: response.data.data };
    } catch (error) {
      console.error('Error mendapatkan ayat-ayat berdasarkan halaman:', error);
      return { data: null };
    }
  },
  
  // Pencarian Al-Qur'an
  searchQuran: async (query) => {
    try {
      // Pencarian menggunakan API Quran.com (karena Quran Cloud tidak memiliki API pencarian yang robust)
      const response = await axios.get(`${QuranAPI.QURAN_COM_API_URL}/search?q=${query}&language=id&size=20`);
      
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

// Fungsi-fungsi API untuk Muraja'ah
export const MurajaahAPI = {
  // Mendapatkan semua jadwal muraja'ah pengguna
  getUserMurajaah: async () => {
    try {
      // Untuk saat ini, mengembalikan data contoh (mock data) sampai backend siap
      return { 
        data: [
          {
            id: 1,
            title: 'Muraja\'ah Al-Mulk',
            surahNumber: 67,  // Al-Mulk
            startVerse: 1,
            endVerse: 10,
            date: '2025-05-15',
            reminderTime: '08:00',
            notes: 'Fokus pada tajwid',
            isCompleted: false,
            juz: 29
          },
          {
            id: 2,
            title: 'Muraja\'ah Al-Kahfi',
            surahNumber: 18,  // Al-Kahfi
            startVerse: 1,
            endVerse: 10,
            date: '2025-05-16',
            reminderTime: '18:30',
            notes: 'Perhatikan hafalan di ayat 5-7',
            isCompleted: false,
            juz: 15
          },
          {
            id: 3,
            title: 'Muraja\'ah Ar-Rahman',
            surahNumber: 55,  // Ar-Rahman
            startVerse: 1,
            endVerse: 20,
            date: '2025-05-14',
            reminderTime: '20:00',
            notes: '',
            isCompleted: true,
            juz: 27
          }
        ]
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.get('/murajaah');
    } catch (error) {
      console.error('Error mendapatkan data muraja\'ah:', error);
      return { data: [] };
    }
  },
  
  // Menambahkan jadwal muraja'ah baru
  addMurajaah: async (murajaahData) => {
    try {
      // Jika surah dan ayat telah ditentukan, dapatkan data tambahan dari Quran Cloud API
      let additionalData = {};
      
      if (murajaahData.surahNumber && murajaahData.startVerse) {
        try {
          // Mendapatkan informasi lengkap tentang ayat dari QuranAPI
          const response = await QuranAPI.getSurahVerses(murajaahData.surahNumber);
          const verseData = response.data.verses.find(v => v.number === parseInt(murajaahData.startVerse));
          
          if (verseData) {
            additionalData = {
              juz: verseData.juz,
              page: verseData.page
            };
          }
        } catch (apiError) {
          console.error('Error mendapatkan data tambahan dari Quran API:', apiError);
        }
      }
      
      // Respons contoh (mock)
      return { 
        data: {
          id: Math.floor(Math.random() * 1000) + 4,  // ID acak
          ...murajaahData,
          ...additionalData,
          isCompleted: false
        }
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.post('/murajaah', {...murajaahData, ...additionalData});
    } catch (error) {
      console.error('Error menambahkan muraja\'ah:', error);
      throw error;
    }
  },
  
  // Memperbarui jadwal muraja'ah yang sudah ada
  updateMurajaah: async (id, murajaahData) => {
    try {
      // Jika surah atau ayat berubah, dapatkan data tambahan dari Quran Cloud API
      let additionalData = {};
      
      if (murajaahData.surahNumber && murajaahData.startVerse) {
        try {
          // Mendapatkan informasi lengkap tentang ayat dari QuranAPI
          const response = await QuranAPI.getSurahVerses(murajaahData.surahNumber);
          const verseData = response.data.verses.find(v => v.number === parseInt(murajaahData.startVerse));
          
          if (verseData) {
            additionalData = {
              juz: verseData.juz,
              page: verseData.page
            };
          }
        } catch (apiError) {
          console.error('Error mendapatkan data tambahan dari Quran API:', apiError);
        }
      }
      
      // Respons contoh (mock)
      return { 
        data: {
          id,
          ...murajaahData,
          ...additionalData
        }
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.put(`/murajaah/${id}`, {...murajaahData, ...additionalData});
    } catch (error) {
      console.error('Error memperbarui muraja\'ah:', error);
      throw error;
    }
  },
  
  // Menghapus jadwal muraja'ah
  deleteMurajaah: async (id) => {
    try {
      // Respons contoh (mock)
      return { data: { success: true } };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.delete(`/murajaah/${id}`);
    } catch (error) {
      console.error('Error menghapus muraja\'ah:', error);
      throw error;
    }
  },
  
  // Mendapatkan semua surah (menggunakan fungsi QuranAPI)
  getAllSurahs: async () => {
    return await QuranAPI.getAllSurahs();
  },
  
  // Mendapatkan rekomendasi muraja'ah berdasarkan riwayat hafalan
  getMurajaahRecommendations: async () => {
    try {
      // Dalam implementasi nyata, ini akan menganalisis riwayat hafalan untuk memberikan rekomendasi
      // Untuk demo, mengembalikan data contoh (mock data)
      return {
        data: [
          {
            surahNumber: 67,  // Al-Mulk
            surahName: 'Al-Mulk',
            lastReviewed: '2025-05-10',
            daysElapsed: 4,
            priority: 'high',
            reason: 'Terakhir direview 4 hari lalu'
          },
          {
            surahNumber: 56,  // Al-Waqiah
            surahName: 'Al-Waqiah',
            lastReviewed: '2025-05-05',
            daysElapsed: 9,
            priority: 'urgent',
            reason: 'Terakhir direview 9 hari lalu'
          },
          {
            surahNumber: 36,  // Ya Sin
            surahName: 'Ya Sin',
            lastReviewed: '2025-05-12',
            daysElapsed: 2,
            priority: 'medium',
            reason: 'Terakhir direview 2 hari lalu'
          }
        ]
      };
    } catch (error) {
      console.error('Error mendapatkan rekomendasi muraja\'ah:', error);
      return { data: [] };
    }
  },
    // Mendapatkan informasi juz tertentu (menggunakan fungsi QuranAPI)
  getJuzDetails: async (juzNumber) => {
    return await QuranAPI.getJuzDetails(juzNumber);
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
            surahName: 'Al-Mulk',
            startVerse: 1,
            endVerse: 10,
            date: '2025-05-01',
            quality: 'good',
            status: 'completed',
            notes: 'Alhamdulillah lancar',
            juz: 29,
            page: 562
          },
          {
            id: 2,
            surahNumber: 67,  // Al-Mulk
            surahName: 'Al-Mulk',
            startVerse: 11,
            endVerse: 15,
            date: '2025-05-08',
            quality: 'average',
            status: 'in_progress',
            notes: 'Perlu diulang lagi',
            juz: 29,
            page: 563
          },
          {
            id: 3,
            surahNumber: 56,  // Al-Waqiah
            surahName: 'Al-Waqiah',
            startVerse: 1,
            endVerse: 30,
            date: '2025-04-20',
            quality: 'excellent',
            status: 'completed',
            notes: '',
            juz: 27,
            page: 534
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
      // Jika surah dan ayat telah ditentukan, dapatkan data tambahan dari Quran Cloud API
      let additionalData = {};
      let surahName = '';
      
      if (hafalanData.surahNumber) {
        try {
          // Mendapatkan informasi surah
          const surahsResponse = await QuranAPI.getAllSurahs();
          const surahInfo = surahsResponse.data.find(surah => surah.number === parseInt(hafalanData.surahNumber));
          
          if (surahInfo) {
            surahName = surahInfo.name;
          }
          
          // Mendapatkan informasi ayat
          if (hafalanData.startVerse) {
            const versesResponse = await QuranAPI.getSurahVerses(hafalanData.surahNumber);
            const verseData = versesResponse.data.verses.find(v => v.number === parseInt(hafalanData.startVerse));
            
            if (verseData) {
              additionalData = {
                juz: verseData.juz,
                page: verseData.page
              };
            }
          }
        } catch (apiError) {
          console.error('Error mendapatkan data tambahan dari Quran API:', apiError);
        }
      }
      
      // Respons contoh (mock)
      return { 
        data: {
          id: Math.floor(Math.random() * 1000) + 4,  // ID acak
          ...hafalanData,
          ...additionalData,
          surahName
        }
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.post('/hafalan', {...hafalanData, ...additionalData, surahName});
    } catch (error) {
      console.error('Error menambahkan hafalan:', error);
      throw error;
    }
  },
  
  // Memperbarui hafalan yang sudah ada
  updateHafalan: async (id, hafalanData) => {
    try {
      // Jika surah atau ayat berubah, dapatkan data tambahan dari Quran Cloud API
      let additionalData = {};
      let surahName = '';
      
      if (hafalanData.surahNumber) {
        try {
          // Mendapatkan informasi surah
          const surahsResponse = await QuranAPI.getAllSurahs();
          const surahInfo = surahsResponse.data.find(surah => surah.number === parseInt(hafalanData.surahNumber));
          
          if (surahInfo) {
            surahName = surahInfo.name;
          }
          
          // Mendapatkan informasi ayat
          if (hafalanData.startVerse) {
            const versesResponse = await QuranAPI.getSurahVerses(hafalanData.surahNumber);
            const verseData = versesResponse.data.verses.find(v => v.number === parseInt(hafalanData.startVerse));
            
            if (verseData) {
              additionalData = {
                juz: verseData.juz,
                page: verseData.page
              };
            }
          }
        } catch (apiError) {
          console.error('Error mendapatkan data tambahan dari Quran API:', apiError);
        }
      }
      
      // Respons contoh (mock)
      return { 
        data: {
          id,
          ...hafalanData,
          ...additionalData,
          surahName: surahName || hafalanData.surahName
        }
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.put(`/hafalan/${id}`, {...hafalanData, ...additionalData, surahName});
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
  },
  
  // Mendapatkan statistik hafalan
  getHafalanStatistics: async () => {
    try {
      // Dalam implementasi nyata, ini akan menganalisis data hafalan dari backend
      // Untuk demo, mengembalikan data contoh (mock data)
      return {
        data: {
          totalSurahs: 3,
          totalJuz: 2,
          totalVerses: 40,
          averageQuality: 'good',
          hafalanByJuz: [
            { juz: 27, count: 30, percentage: 25 },
            { juz: 29, count: 15, percentage: 20 }
          ],
          hafalanByMonth: [
            { month: 'Jan', count: 0 },
            { month: 'Feb', count: 0 },
            { month: 'Mar', count: 0 },
            { month: 'Apr', count: 30 },
            { month: 'May', count: 15 },
            { month: 'Jun', count: 0 },
            { month: 'Jul', count: 0 },
            { month: 'Aug', count: 0 },
            { month: 'Sep', count: 0 },
            { month: 'Oct', count: 0 },
            { month: 'Nov', count: 0 },
            { month: 'Dec', count: 0 }
          ],
          qualityDistribution: [
            { quality: 'excellent', count: 1, percentage: 33 },
            { quality: 'good', count: 1, percentage: 33 },
            { quality: 'average', count: 1, percentage: 33 },
            { quality: 'poor', count: 0, percentage: 0 }
          ]
        }
      };
    } catch (error) {
      console.error('Error mendapatkan statistik hafalan:', error);
      return { data: null };
    }
  },
  
  // Mendapatkan audio untuk ayat-ayat yang dihafal
  getAudioForHafalan: async (surahNumber, startVerse, endVerse, reciter = 'ar.alafasy') => {
    try {
      const surahData = await QuranAPI.getAudioSurah(surahNumber, reciter);
      
      if (surahData && surahData.data && surahData.data.ayahs) {
        // Filter ayat berdasarkan range yang diinginkan
        const requestedAyahs = surahData.data.ayahs.filter(
          ayah => ayah.numberInSurah >= startVerse && ayah.numberInSurah <= endVerse
        );
        
        return {
          data: {
            reciter: surahData.data.edition.name,
            audioAyahs: requestedAyahs
          }
        };
      }
      
      return { data: null };
    } catch (error) {
      console.error('Error mendapatkan audio untuk hafalan:', error);
      return { data: null };
    }
  }
};

// Fungsi-fungsi API untuk sistem notifikasi
export const NotificationAPI = {
  // Mendapatkan semua notifikasi pengguna
  getUserNotifications: async () => {
    try {
      // Untuk saat ini, mengembalikan data contoh (mock data)
      return { 
        data: [
          {
            id: 1,
            title: 'Waktu Muraja\'ah',
            message: 'Muraja\'ah Al-Mulk dijadwalkan dalam 30 menit',
            type: 'reminder',
            createdAt: '2025-05-14T07:30:00Z',
            isRead: false,
            actionData: {
              type: 'murajaah',
              id: 1,
              surahNumber: 67,
              startVerse: 1,
              endVerse: 10
            }
          },
          {
            id: 2,
            title: 'Target Hafalan',
            message: 'Anda belum mencapai target hafalan minggu ini',
            type: 'info',
            createdAt: '2025-05-13T15:00:00Z',
            isRead: true,
            actionData: {
              type: 'statistics'
            }
          },
          {
            id: 3,
            title: 'Pengingat Jadwal',
            message: 'Anda memiliki jadwal muraja\'ah Ar-Rahman hari ini pukul 20:00',
            type: 'reminder',
            createdAt: '2025-05-14T09:00:00Z',
            isRead: false,
            actionData: {
              type: 'murajaah',
              id: 3,
              surahNumber: 55,
              startVerse: 1,
              endVerse: 20
            }
          }
        ]
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.get('/notifications');
    } catch (error) {
      console.error('Error mendapatkan notifikasi:', error);
      return { data: [] };
    }
  },
  
  // Mendapatkan pengaturan notifikasi pengguna
  getUserNotificationSettings: async () => {
    try {
      // Untuk saat ini, mengembalikan data contoh (mock data)
      return { 
        data: {
          enabled: true,
          reminderTime: 30,  // menit sebelum jadwal
          sound: true,
          vibration: true,
          dailyReminder: true,
          dailyReminderTime: '20:00',
          weeklyReport: true,
          weeklyReportDay: 'friday'
        }
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.get('/notifications/settings');
    } catch (error) {
      console.error('Error mendapatkan pengaturan notifikasi:', error);
      return { 
        data: {
          enabled: true,
          reminderTime: 30,
          sound: true,
          vibration: true,
          dailyReminder: true,
          dailyReminderTime: '20:00',
          weeklyReport: true,
          weeklyReportDay: 'friday'
        } 
      };
    }
  },
  
  // Memperbarui pengaturan notifikasi
  updateNotificationSettings: async (settings) => {
    try {
      // Respons contoh (mock)
      return { 
        data: {
          ...settings
        }
      };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.put('/notifications/settings', settings);
    } catch (error) {
      console.error('Error memperbarui pengaturan notifikasi:', error);
      throw error;
    }
  },
  
  // Menandai notifikasi sebagai sudah dibaca
  markNotificationAsRead: async (id) => {
    try {
      // Respons contoh (mock)
      return { data: { success: true } };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Error menandai notifikasi sebagai dibaca:', error);
      throw error;
    }
  },
  
  // Menandai semua notifikasi sebagai sudah dibaca
  markAllNotificationsAsRead: async () => {
    try {
      // Respons contoh (mock)
      return { data: { success: true } };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.put('/notifications/read-all');
    } catch (error) {
      console.error('Error menandai semua notifikasi sebagai dibaca:', error);
      throw error;
    }
  },
  
  // Menghapus notifikasi
  deleteNotification: async (id) => {
    try {
      // Respons contoh (mock)
      return { data: { success: true } };
      
      // Setelah backend siap, gunakan ini:
      // return await axios.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Error menghapus notifikasi:', error);
      throw error;
    }
  },
  
  // Mendaftarkan browser untuk notifikasi
  requestBrowserPermission: async () => {
    try {
      // Permintaan izin notifikasi browser
      if (typeof Notification !== 'undefined') {
        const permission = await Notification.requestPermission();
        return { data: { permission } };
      }
      return { data: { permission: 'unavailable' } };
    } catch (error) {
      console.error('Error meminta izin notifikasi browser:', error);
      return { data: { permission: 'error' } };
    }
  },
  
  // Menampilkan notifikasi browser
  showBrowserNotification: (title, options = {}) => {
    try {
      // Menampilkan notifikasi browser jika diizinkan
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: options.body || '',
          icon: options.icon || '/logo192.png',
          tag: options.tag || 'hafidz-tracker-notification'
        });
        
        if (options.onClick) {
          notification.onclick = options.onClick;
        }
        
        return { success: true, notification };
      }
      return { success: false, reason: 'permission-denied' };
    } catch (error) {
      console.error('Error menampilkan notifikasi browser:', error);
      return { success: false, error };
    }
  },
  
  // Mendapatkan semua notifikasi terkait muraja'ah
  getMurajaahNotifications: async () => {
    try {
      // Mendapatkan semua notifikasi
      const notifications = await NotificationAPI.getUserNotifications();
      
      // Filter notifikasi tipe muraja'ah saja
      const murajaahNotifications = notifications.data.filter(
        notification => notification.actionData && notification.actionData.type === 'murajaah'
      );
      
      return { data: murajaahNotifications };
    } catch (error) {
      console.error('Error mendapatkan notifikasi muraja\'ah:', error);
      return { data: [] };
    }
  },
  
  // Menjadwalkan notifikasi muraja'ah berdasarkan jadwal
  scheduleMurajaahNotification: async (murajaahData) => {
    // Dalam implementasi nyata, ini akan mengirimkan data ke backend untuk menjadwalkan notifikasi
    // Di sini hanya mengembalikan respons contoh (mock)
    try {
      // Mendapatkan data surah untuk detail notifikasi
      let surahName = '';
      
      try {
        const surahsResponse = await QuranAPI.getAllSurahs();
        const surah = surahsResponse.data.find(s => s.number === parseInt(murajaahData.surahNumber));
        if (surah) {
          surahName = surah.name;
        }
      } catch (apiError) {
        console.error('Error mendapatkan data surah:', apiError);
      }
      
      return { 
        data: {
          scheduled: true,
          notificationId: Math.floor(Math.random() * 1000) + 100,
          murajaahId: murajaahData.id,
          surahName,
          scheduleTime: murajaahData.date + 'T' + murajaahData.reminderTime
        }
      };
    } catch (error) {
      console.error('Error menjadwalkan notifikasi muraja\'ah:', error);
      throw error;
    }
  }
}

export default axios;
