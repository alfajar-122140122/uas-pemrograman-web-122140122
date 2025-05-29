import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../hooks/useAuth';
import quranService from '../services/quranService'; // Import quranService

const Reminder = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [schedules, setSchedules] = useState([]);
  const [surat, setSurat] = useState('');
  const [ayat, setAyat] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [allSurahs, setAllSurahs] = useState([]); // State for storing all surahs
  const [loadingSurahs, setLoadingSurahs] = useState(true); // State for loading surahs

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReminders();
      fetchAllSurahs(); // Fetch surahs when component mounts
    } else {
      setLoading(false);
      setLoadingSurahs(false);
    }
  }, [isAuthenticated, user]);

  const fetchAllSurahs = async () => {
    setLoadingSurahs(true);
    try {
      const response = await quranService.getAllSurahs();
      setAllSurahs(response.data || []); // Ensure response.data is not undefined
    } catch (err) {
      console.error("Error fetching all surahs:", err);
      // Optionally set an error state for surahs
    } finally {
      setLoadingSurahs(false);
    }
  };

  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/v1/users/${user.id}/reminders`);
      setSchedules(response.data);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError("Gagal mengambil data pengingat muraja'ah");
      alert("Gagal mengambil data pengingat");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Anda harus login untuk membuat pengingat");
      return;
    }
    
    setSubmitting(true);
    
    // Format the date string to include time (end of day)
    const formattedDate = `${tanggal}T23:59:59`;
    
    // Find the selected surah object to get its name
    const selectedSurahObject = allSurahs.find(s => s.number === parseInt(surat));
    const surahName = selectedSurahObject ? selectedSurahObject.englishName : surat; // Fallback to number if name not found

    try {
      const newReminder = {
        user_id: user.id,
        surat: surahName, // Use surahName
        ayat: ayat,
        due_date: formattedDate,
        is_completed: false
      };
        const response = await api.post(`/v1/users/${user.id}/reminders`, newReminder);
      
      setSchedules([...schedules, response.data]);
      alert('Pengingat muraja\'ah berhasil dibuat!');
      
      // Reset form fields
      setSurat(''); // Reset to empty string or default value
      setAyat('');
      setTanggal('');
      
      // Potentially show browser notification if API allows and user permits
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pengingat Muraja\'ah Ditambahkan!', {
          body: `Jangan lupa murajaah ${surahName} ayat ${ayat} pada ${new Date(formattedDate).toLocaleDateString('id-ID')}`,
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Pengingat Muraja\'ah Ditambahkan!', {
              body: `Jangan lupa murajaah ${surahName} ayat ${ayat} pada ${new Date(formattedDate).toLocaleDateString('id-ID')}`,
            });
          }
        });
      }    } catch (error) {
      console.error("Error creating reminder:", error);
      alert(`Gagal membuat pengingat: ${error.response?.data?.error || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengingat ini?')) {
      try {
        await api.delete(`/v1/reminders/${id}`);
        setSchedules(schedules.filter(s => s.id !== id));
        alert('Pengingat berhasil dihapus');
      } catch (error) {
        console.error("Error deleting reminder:", error);
        alert(`Gagal menghapus pengingat: ${error.response?.data?.error || error.message}`);
      }
    }
  };
  const handleMarkComplete = async (id, isCompleted) => {
    try {
      await api.put(`/api/v1/reminders/${id}`, { is_completed: !isCompleted });
      setSchedules(schedules.map(s => s.id === id ? {...s, is_completed: !isCompleted} : s));
      alert(`Pengingat ditandai sebagai ${!isCompleted ? 'selesai' : 'belum selesai'}`);
    } catch (error) {
      console.error("Error updating reminder status:", error);
      alert(`Gagal memperbarui status: ${error.response?.data?.error || error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-bg-secondary shadow-lg rounded-2xl p-6 text-center border border-border-color">
          <p className="text-text-secondary mb-4">
            Silakan <button onClick={() => navigate('/login')} className="text-accent-primary hover:text-accent-primary-dark underline font-medium">login</button> terlebih dahulu untuk mengelola jadwal muraja'ah Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-text-primary mb-8 text-center">Jadwal Muraja'ah</h1>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-bg-secondary shadow-xl rounded-2xl p-6 sm:p-8 mb-10 border border-border-color">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">Buat Jadwal Baru</h2>
        <div className="space-y-5">
          <div>
            <label htmlFor="suratReminder" className="block text-sm font-medium text-text-secondary mb-1">Surat</label>
            {loadingSurahs ? (
              <div className="mt-1 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-sm text-text-secondary">Memuat daftar surat...</p>
              </div>
            ) : (
              <select
                id="suratReminder"
                value={surat}
                onChange={(e) => setSurat(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 border border-border-color bg-bg-primary text-text-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors duration-150"
                required
                disabled={submitting || loadingSurahs}
              >
                <option value="" disabled className="text-text-secondary">Pilih Surat</option>
                {allSurahs.map((s) => (
                  <option key={s.number} value={s.number} className="text-text-primary">
                    {s.number}. {s.englishName} ({s.name})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label htmlFor="ayatReminder" className="block text-sm font-medium text-text-secondary mb-1">Ayat (Contoh: 1-5)</label>
            <input
              type="text"
              id="ayatReminder"
              value={ayat}
              onChange={(e) => setAyat(e.target.value)}
              className="mt-1 block w-full px-3 py-2.5 border border-border-color bg-bg-primary text-text-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors duration-150"
              required
              disabled={submitting}
              placeholder="Masukkan nomor ayat atau rentang"
            />
          </div>
          <div>
            <label htmlFor="tanggalReminder" className="block text-sm font-medium text-text-secondary mb-1">Tanggal</label>
            <input
              type="date"
              id="tanggalReminder"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="mt-1 block w-full px-3 py-2.5 border border-border-color bg-bg-primary text-text-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-colors duration-150"
              required
              disabled={submitting}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || loadingSurahs}
          className={`w-full mt-8 bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary ${submitting || loadingSurahs ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {submitting ? 'Menyimpan...' : 'Tambah Jadwal'}
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-6">Daftar Jadwal</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-300 shadow-lg rounded-2xl p-6 text-center">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchReminders}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-colors duration-150"
            >
              Coba lagi
            </button>
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-bg-secondary shadow-lg rounded-2xl p-8 text-center border border-border-color">
            <p className="text-text-secondary">Belum ada jadwal muraja'ah.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {schedules.map(schedule => (
              <li key={schedule.id} className={`bg-bg-secondary shadow-lg rounded-2xl p-5 border border-border-color flex flex-col sm:flex-row justify-between sm:items-center transition-all duration-200 hover:shadow-xl ${schedule.is_completed ? 'opacity-70 bg-green-50 border-green-200' : ''}`}>
                <div className="mb-3 sm:mb-0">
                  <p className={`font-semibold text-lg ${schedule.is_completed ? 'text-green-700 line-through' : 'text-accent-primary-dark'}`}>
                    {schedule.surat} : {schedule.ayat}
                  </p>
                  <p className="text-sm text-text-secondary">
                    Jadwal: {new Date(schedule.due_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className={`text-xs mt-1 font-medium px-2 py-0.5 inline-block rounded-full ${schedule.is_completed ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    Status: {schedule.is_completed ? 'Selesai' : 'Belum selesai'}
                  </p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={() => handleMarkComplete(schedule.id, schedule.is_completed)}
                    className={`text-sm py-2 px-3.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 ring-offset-1 ${
                      schedule.is_completed 
                      ? 'bg-gray-200 hover:bg-gray-300 text-text-secondary focus:ring-gray-400' 
                      : 'bg-accent-primary hover:bg-accent-primary-dark text-white focus:ring-accent-primary'
                    }`}
                  >
                    {schedule.is_completed ? 'Tandai Belum' : 'Tandai Selesai'}
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white py-2 px-3.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 ring-offset-1 ring-red-500"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reminder;
