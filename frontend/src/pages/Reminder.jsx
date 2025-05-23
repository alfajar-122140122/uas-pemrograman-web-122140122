import React, { useState, useEffect } from 'react';
// import api from '../services/api';

const Reminder = () => {
  const [schedules, setSchedules] = useState([]);
  const [surat, setSurat] = useState('');
  const [ayat, setAyat] = useState('');
  const [tanggal, setTanggal] = useState('');

  useEffect(() => {
    // Fetch schedules from backend
    // api.get('/reminders')
    //   .then(response => setSchedules(response.data))
    //   .catch(error => console.error("Error fetching reminders:", error));
    console.log("Fetching reminders..."); // Placeholder
    setSchedules([ // Mock data
      { id: 1, surat: 'Al-Fatihah', ayat: '1-7', tanggal: '2025-05-30' },
      { id: 2, surat: 'An-Nas', ayat: '1-6', tanggal: '2025-06-01' },
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newSchedule = { surat, ayat, tanggal };
    try {
      // const response = await api.post('/reminders', newSchedule);
      // setSchedules([...schedules, response.data]);
      console.log("Creating new reminder:", newSchedule); // Placeholder
      setSchedules([...schedules, { ...newSchedule, id: Date.now() }]); // Mock add
      setSurat('');
      setAyat('');
      setTanggal('');
      // Show success toast/alert
      // Potentially show browser notification if API allows and user permits
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Reminder Murajaah Ditambahkan!', {
          body: `Jangan lupa murajaah ${surat} ayat ${ayat} pada ${tanggal}`,
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Reminder Murajaah Ditambahkan!', {
              body: `Jangan lupa murajaah ${surat} ayat ${ayat} pada ${tanggal}`,
            });
          }
        });
      }

    } catch (error) {
      console.error("Error creating reminder:", error);
      // Show error toast/alert
    }
  };

  const handleDelete = async (id) => {
    // try {
    //   await api.delete(`/reminders/${id}`);
    //   setSchedules(schedules.filter(s => s.id !== id));
    //   // Show success toast/alert
    // } catch (error) {
    //   console.error("Error deleting reminder:", error);
    //   // Show error toast/alert
    // }
    console.log(`Deleting reminder with id: ${id}`); // Placeholder
    setSchedules(schedules.filter(s => s.id !== id)); // Mock delete
  };


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
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Tambah Jadwal
        </button>
      </form>

      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Daftar Jadwal</h2>
        {schedules.length === 0 ? (
          <p className="text-gray-600">Belum ada jadwal muraja'ah.</p>
        ) : (
          <ul className="space-y-4">
            {schedules.map(schedule => (
              <li key={schedule.id} className="bg-white shadow-lg rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-green-600">{schedule.surat} : {schedule.ayat}</p>
                  <p className="text-sm text-gray-500">Tanggal: {new Date(schedule.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-2xl shadow"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Reminder;
