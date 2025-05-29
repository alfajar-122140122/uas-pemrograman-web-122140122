import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../hooks/useAuth';

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

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchReminders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);  const fetchReminders = async () => {
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
    
    try {
      const newReminder = {
        user_id: user.id,
        surat: surat,
        ayat: ayat,
        due_date: formattedDate,
        is_completed: false
      };
        const response = await api.post(`/v1/users/${user.id}/reminders`, newReminder);
      
      setSchedules([...schedules, response.data]);
      alert('Pengingat muraja\'ah berhasil dibuat!');
      
      // Reset form fields
      setSurat('');
      setAyat('');
      setTanggal('');
      
      // Potentially show browser notification if API allows and user permits
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pengingat Muraja\'ah Ditambahkan!', {
          body: `Jangan lupa murajaah ${surat} ayat ${ayat} pada ${new Date(formattedDate).toLocaleDateString('id-ID')}`,
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Pengingat Muraja\'ah Ditambahkan!', {
              body: `Jangan lupa murajaah ${surat} ayat ${ayat} pada ${new Date(formattedDate).toLocaleDateString('id-ID')}`,
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
        <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
          <p className="text-gray-600 mb-4">
            Silakan <button onClick={() => navigate('/login')} className="text-green-600 hover:underline font-medium">login</button> terlebih dahulu untuk mengelola jadwal muraja'ah Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Jadwal Muraja'ah</h1>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Buat Jadwal Baru</h2>
        <div className="mb-4">
          <label htmlFor="suratReminder" className="block text-sm font-medium text-gray-700">Surat</label>
          <input
            type="text"
            id="suratReminder"
            value={surat}
            onChange={(e) => setSurat(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
            disabled={submitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="ayatReminder" className="block text-sm font-medium text-gray-700">Ayat (Contoh: 1-5)</label>
          <input
            type="text"
            id="ayatReminder"
            value={ayat}
            onChange={(e) => setAyat(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
            disabled={submitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="tanggalReminder" className="block text-sm font-medium text-gray-700">Tanggal</label>
          <input
            type="date"
            id="tanggalReminder"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
            disabled={submitting}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className={`w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-green-400 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {submitting ? 'Menyimpan...' : 'Tambah Jadwal'}
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Daftar Jadwal</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-lg text-red-700">
            <p>{error}</p>
            <button 
              onClick={fetchReminders}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
            >
              Coba lagi
            </button>
          </div>
        ) : schedules.length === 0 ? (
          <p className="text-gray-600 text-center p-6 bg-white shadow-lg rounded-2xl">Belum ada jadwal muraja'ah.</p>
        ) : (
          <ul className="space-y-4">
            {schedules.map(schedule => (
              <li key={schedule.id} className={`bg-white shadow-lg rounded-2xl p-4 flex justify-between items-center ${schedule.is_completed ? 'bg-green-50' : ''}`}>
                <div>
                  <p className={`font-semibold ${schedule.is_completed ? 'text-green-700' : 'text-green-600'}`}>
                    {schedule.surat} : {schedule.ayat}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tanggal: {new Date(schedule.due_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    Status: {schedule.is_completed ? 'Selesai' : 'Belum selesai'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMarkComplete(schedule.id, schedule.is_completed)}
                    className={`text-sm py-1 px-2 rounded-2xl shadow ${
                      schedule.is_completed 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {schedule.is_completed ? 'Batalkan' : 'Selesai'}
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-2xl shadow"
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
