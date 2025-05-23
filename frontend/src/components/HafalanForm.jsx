import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import api from '../services/api'; // Assuming api.js is set up

const HafalanForm = () => {
  const { id } = useParams(); // For editing existing hafalan
  const navigate = useNavigate();
  const [surat, setSurat] = useState('');
  const [ayat, setAyat] = useState('');
  const [status, setStatus] = useState('belum'); // belum, dihafal, dilupa
  const [catatan, setCatatan] = useState('');

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      // Fetch existing hafalan data if in edit mode
      // api.get(`/hafalan/${id}`).then(response => {
      //   const { surat, ayat, status, catatan } = response.data;
      //   setSurat(surat);
      //   setAyat(ayat);
      //   setStatus(status);
      //   setCatatan(catatan);
      // }).catch(error => console.error("Error fetching hafalan:", error));
      console.log(`Fetching hafalan with id: ${id}`); // Placeholder
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hafalanData = { surat, ayat, status, catatan };
    try {
      if (isEditMode) {
        // await api.put(`/hafalan/${id}`, hafalanData);
        console.log("Updating hafalan:", hafalanData); // Placeholder
        // Show success toast/alert
      } else {
        // await api.post('/hafalan', hafalanData);
        console.log("Creating hafalan:", hafalanData); // Placeholder
        // Show success toast/alert
      }
      navigate('/'); // Navigate to dashboard or hafalan list
    } catch (error) {
      console.error("Error submitting hafalan:", error);
      // Show error toast/alert
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {isEditMode ? 'Edit Hafalan' : 'Tambah Hafalan Baru'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="surat" className="block text-sm font-medium text-gray-700">Surat</label>
          <input
            type="text"
            id="surat"
            value={surat}
            onChange={(e) => setSurat(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="ayat" className="block text-sm font-medium text-gray-700">Ayat</label>
          <input
            type="text"
            id="ayat"
            value={ayat}
            onChange={(e) => setAyat(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="belum">Belum Dihafal</option>
            <option value="dihafal">Sudah Dihafal</option>
            <option value="dilupa">Dilupa</option>
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="catatan" className="block text-sm font-medium text-gray-700">Catatan</label>
          <textarea
            id="catatan"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {isEditMode ? 'Simpan Perubahan' : 'Tambah Hafalan'}
        </button>
      </form>
    </div>
  );
};

export default HafalanForm;
