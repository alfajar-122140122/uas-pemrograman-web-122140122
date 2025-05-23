import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import api from '../services/api'; // Assuming api.js is set up
// import useAuthStore from '../store/useStore'; // Assuming a zustand store

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

  useEffect(() => {
    // Fetch hafalan data from backend
    // api.get('/hafalan')
    //   .then(response => setHafalanList(response.data))
    //   .catch(error => console.error("Error fetching hafalan list:", error));
    console.log("Fetching hafalan list for dashboard..."); // Placeholder
    setHafalanList([
      { id: 1, surat: 'Al-Fatihah', ayat: '1-7', status: 'dihafal', catatan: 'Review setiap hari' },
      { id: 2, surat: 'Al-Baqarah', ayat: '1-5', status: 'belum', catatan: 'Mulai pekan ini' },
      { id: 3, surat: 'An-Nas', ayat: '1-6', status: 'dilupa', catatan: 'Perlu diulang lagi' },
    ]);

    // Fetch upcoming reminders (e.g., next 3)
    // api.get('/reminders?limit=3&status=upcoming') // Example API call
    //   .then(response => setUpcomingReminders(response.data))
    //   .catch(error => console.error("Error fetching reminders:", error));
    console.log("Fetching upcoming reminders..."); // Placeholder
    setUpcomingReminders([
      { id: 1, surat: 'Al-Mulk', ayat: '1-30', tanggal: '2025-05-24' },
      { id: 2, surat: 'Yasin', ayat: '1-83', tanggal: '2025-05-25' },
    ]);

    // Set a random quote
    setCurrentQuote(quranQuotes[Math.floor(Math.random() * quranQuotes.length)]);
  }, []);

  const handleDelete = async (id) => {
    // if (window.confirm("Yakin ingin menghapus hafalan ini?")) {
    //   try {
    //     await api.delete(`/hafalan/${id}`);
    //     setHafalanList(hafalanList.filter(item => item.id !== id));
    //     // Show success toast/alert
    //   } catch (error) {
    //     console.error("Error deleting hafalan:", error);
    //     // Show error toast/alert
    //   }
    // }
    console.log(`Deleting hafalan with id: ${id}`); // Placeholder
    setHafalanList(hafalanList.filter(item => item.id !== id)); // Optimistic update
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-bg-secondary shadow-lg rounded-2xl p-6 border border-border-color">
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Pengingat Muraja&apos;ah</h2>
            {upcomingReminders.length > 0 ? (
              <ul className="space-y-3">
                {upcomingReminders.map(reminder => (
                  <li key={reminder.id} className="p-3 bg-accent-primary/10 rounded-lg shadow-sm">
                    <p className="font-semibold text-accent-primary-dark">{reminder.surat} : {reminder.ayat}</p>
                    <p className="text-sm text-text-secondary">
                      Jadwal: {new Date(reminder.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-secondary">Tidak ada pengingat muraja&apos;ah dalam waktu dekat.</p>
            )}
            <Link to="/reminder" className="mt-4 inline-block text-sm text-accent-primary hover:text-accent-primary-dark font-semibold transition-colors duration-150">
              Lihat Semua Jadwal &rarr;
            </Link>
          </section>

          {currentQuote && (
            <section className="bg-bg-secondary shadow-lg rounded-2xl p-6 border border-border-color">
              <h2 className="text-2xl font-semibold text-text-primary mb-3">Kutipan Hari Ini</h2>
              <blockquote className="italic text-text-secondary">
                <p>"{currentQuote.text}"</p>
                <footer className="mt-2 text-sm text-accent-primary">
                  - QS. {currentQuote.surah}: {currentQuote.ayat}
                </footer>
              </blockquote>
            </section>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-text-primary">Daftar Hafalan Saya</h2>
            <Link
              to="/hafalan/new"
              className="bg-accent-primary hover:bg-accent-primary-dark text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary"
            >
              Tambah Hafalan Baru
            </Link>
          </div>

          {hafalanList.length === 0 ? (
            <div className="bg-bg-secondary shadow-lg rounded-2xl p-6 text-center border border-border-color">
                <p className="text-text-secondary">Belum ada data hafalan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hafalanList.map((item) => (
                <div key={item.id} className="bg-bg-secondary shadow-lg rounded-2xl p-6 flex flex-col justify-between border border-border-color">
                  <div>
                    <h3 className="text-xl font-semibold text-accent-primary-dark">{item.surat} : {item.ayat}</h3>
                    <p className={`capitalize mt-1 px-3 py-1 inline-block text-sm rounded-full font-medium ${
                      item.status === 'dihafal' ? 'bg-accent-primary/20 text-accent-primary-dark' :
                      item.status === 'dilupa' ? 'bg-gray-400/30 text-gray-700' : 
                      'bg-gray-300/40 text-gray-600' 
                    }`}>
                      {item.status.replace('_', ' ')}
                    </p>
                    <p className="text-text-secondary my-3">{item.catatan || 'Tidak ada catatan.'}</p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <Link
                      to={`/hafalan/edit/${item.id}`}
                      className="text-sm bg-gray-200 hover:bg-gray-300 text-text-primary font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-sm bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
