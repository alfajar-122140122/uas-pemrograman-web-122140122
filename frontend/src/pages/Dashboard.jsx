import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../hooks/useAuth';

// Placeholder for quotes - in a real app, this might come from an API or a larger local collection
const quranQuotes = [
  { id: 1, text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", surah: "Al-Baqarah", ayat: "152" },
  { id: 2, text: "Indeed, Allah is with the patient.", surah: "Al-Anfal", ayat: "46" },
  { id: 3, text: "And He found you lost and guided [you].", surah: "Ad-Duhaa", ayat: "7" },
  { id: 4, text: "Verily, with hardship, there is relief.", surah: "Ash-Sharh", ayat: "6" },
];

const Dashboard = () => {
  const [hafalanList, setHafalanList] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReminderLoading, setIsReminderLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Set a random quote regardless of loading state
    setCurrentQuote(quranQuotes[Math.floor(Math.random() * quranQuotes.length)]);
    
    // Only fetch data if user is authenticated
    if (isAuthenticated && user) {
      fetchHafalanData();
      fetchReminders();
    } else {
      setIsLoading(false);
      setIsReminderLoading(false);
    }
  }, [isAuthenticated, user]);
    const fetchHafalanData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the proper API endpoint with user_id
      const response = await api.get(`/v1/users/${user.id}/hafalan`);
      setHafalanList(response.data);    } catch (err) {
      console.error("Error fetching hafalan list:", err);
      setError("Gagal mengambil data hafalan. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };
    const fetchReminders = async () => {
    setIsReminderLoading(true);
    try {
      // Use the proper API endpoint with user_id
      const response = await api.get(`/v1/users/${user.id}/reminders`);
      // Filter for upcoming reminders that are not completed
      const upcomingOnes = response.data
        .filter(reminder => !reminder.is_completed)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 3); // Get the first 3
      
      setUpcomingReminders(upcomingOnes);    } catch (err) {
      console.error("Error fetching reminders:", err);
      // We don't set the main error state here since this is a secondary feature
    } finally {
      setIsReminderLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus hafalan ini?")) {      try {
        await api.delete(`/v1/hafalan/${id}`);
        // Update local state optimistically
        setHafalanList(hafalanList.filter(item => item.id !== id));
        alert("Hafalan berhasil dihapus");
      } catch (error) {
        console.error("Error deleting hafalan:", error);
        alert("Gagal menghapus hafalan");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-bg-secondary shadow-lg rounded-2xl p-6 text-center border border-border-color">
          <p className="text-text-secondary">
            Silakan <Link to="/login" className="text-accent-primary font-semibold">login</Link> terlebih dahulu untuk melihat dashboard Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Poster Section - Full Width at the top */}
      {currentQuote && (
        <section className="bg-gradient-to-br from-accent-primary to-green-400 shadow-lg rounded-2xl p-8 text-white border border-border-color flex flex-col items-center text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Kutipan Hari Ini</h2>
          <blockquote className="italic text-lg mb-4">
            <p>"{currentQuote.text}"</p>
            <footer className="mt-3 text-sm text-green-100">
              - QS. {currentQuote.surah}: {currentQuote.ayat}
            </footer>
          </blockquote>
          {/* Optional: Add a share button or a refresh button for a new quote */}
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pengingat Muraja'ah Section */}
        <div className="lg:col-span-1">
          {/* Removed h-full from section to allow it to shrink to content height */}
          <section className="bg-bg-secondary shadow-lg rounded-2xl p-6 border border-border-color flex flex-col">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Pengingat Muraja&apos;ah</h2>
            {isReminderLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
              </div>
            ) : upcomingReminders.length > 0 ? (
              // Removed flex-grow from ul
              <ul className="space-y-3">
                {upcomingReminders.map(reminder => (
                  <li key={reminder.id} className="p-3 bg-green-100 rounded-lg shadow-sm">
                    <p className="font-semibold text-accent-primary-dark">{reminder.surat} : {reminder.ayat}</p>
                    <p className="text-sm text-text-secondary">
                      Jadwal: {new Date(reminder.due_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-secondary">Tidak ada pengingat muraja&apos;ah dalam waktu dekat.</p>
            )}
            {/* mt-auto will now push the link to the bottom of the content, pt-4 provides spacing */}
            <Link to="/reminder" className="mt-auto pt-4 inline-block text-sm text-accent-primary hover:text-accent-primary-dark font-semibold transition-colors duration-150 self-start">
              Lihat Semua Jadwal &rarr;
            </Link>
          </section>
        </div>

        {/* Daftar Hafalan Saya Section */}
        <div className="lg:col-span-2">
          <section className="bg-bg-secondary shadow-lg rounded-2xl p-6 border border-border-color h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
              <h2 className="text-2xl font-semibold text-text-primary">Daftar Hafalan Saya</h2>
              <Link
                to="/hafalan/new"
                className="bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
              >
                Tambah Hafalan Baru
              </Link>
            </div>

            {isLoading ? (
              <div className="flex-grow flex flex-col justify-center items-center p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mb-4"></div>
                <p className="text-text-secondary">Memuat data hafalan...</p>
              </div>
            ) : error ? (
              <div className="flex-grow flex flex-col justify-center items-center bg-red-100 p-6 text-center border border-red-300 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchHafalanData} 
                  className="mt-4 bg-accent-primary hover:bg-accent-primary-dark text-white px-4 py-2 rounded-lg"
                >
                  Coba Lagi
                </button>
              </div>
            ) : hafalanList.length === 0 ? (
              <div className="bg-bg-secondary shadow-lg rounded-2xl p-6 text-center border border-border-color">
                <p className="text-text-secondary">Belum ada data hafalan.</p>
                <Link 
                  to="/hafalan/new" 
                  className="mt-4 inline-block text-sm text-accent-primary hover:text-accent-primary-dark font-semibold transition-colors duration-150"
                >
                  Tambahkan hafalan pertama Anda &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
                {hafalanList.map((item) => (
                  <div key={item.id} className="bg-green-100 shadow-md rounded-xl p-5 flex flex-col justify-between border border-border-color hover:shadow-lg transition-shadow duration-200">
                    <div>
                      <h3 className="text-xl font-semibold text-accent-primary-dark">{item.surah_name} : {item.ayah_range}</h3>
                      <p className={`capitalize mt-1 px-3 py-1 inline-block text-sm rounded-full font-medium ${
                        item.status === 'selesai' ? 'bg-green-200 text-green-800' : // Adjusted for better contrast on green-100
                        item.status === 'sedang' ? 'bg-accent-primary/20 text-accent-primary-dark' :
                        item.status === 'belum' ? 'bg-gray-200 text-gray-700' : 
                        'bg-gray-300/40 text-gray-600' 
                      }`}>
                        {item.status.replace('_', ' ')}
                      </p>
                      <p className="text-text-secondary my-3">{item.catatan || 'Tidak ada catatan.'}</p>
                      {item.last_reviewed_at && (
                        <p className="text-xs text-gray-500">
                          Terakhir diulas: {new Date(item.last_reviewed_at).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                      <Link
                        to={`/hafalan/edit/${item.id}`}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-text-primary font-medium py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-sm bg-accent-primary hover:bg-accent-primary-dark text-white font-medium py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
         </section>
        </div>
      </div>

      {/* Quick Actions Section - Removed */}
      {/* 
      <div className="bg-bg-secondary shadow-lg rounded-2xl p-6 border border-border-color mb-8">
        <h2 className="text-2xl font-semibold text-text-primary mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/hafalan/new"
            className="bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Hafalan Baru
          </Link>
          <Link
            to="/reminder"
            className="bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8" />
            </svg>
            Jadwal Pengingat
          </Link>
          <Link
            to="/"
            className="bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v18H3V3z" />
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
      */}
    </div>
  );
};

export default Dashboard;
