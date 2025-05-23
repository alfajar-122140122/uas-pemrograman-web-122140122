import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import api from '../services/api';

// Mock data - replace with API call
const initialData = {
  weekly: [
    { name: 'Pekan 1', ayatDihafal: 30 },
    { name: 'Pekan 2', ayatDihafal: 45 },
    { name: 'Pekan 3', ayatDihafal: 60 },
    { name: 'Pekan 4', ayatDihafal: 50 },
  ],
  monthly: [
    { name: 'Jan', ayatDihafal: 120 },
    { name: 'Feb', ayatDihafal: 150 },
    { name: 'Mar', ayatDihafal: 180 },
    { name: 'Apr', ayatDihafal: 200 },
  ],
  yearly: [
    { name: '2023', ayatDihafal: 1000 },
    { name: '2024', ayatDihafal: 1500 },
  ],
};

const Chart = () => {
  const [filter, setFilter] = useState('monthly'); // weekly, monthly, yearly
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Fetch chart data from backend based on filter
    // api.get(`/progress?filter=${filter}`)
    //   .then(response => setChartData(response.data))
    //   .catch(error => console.error(`Error fetching ${filter} progress:`, error));
    console.log(`Fetching chart data for filter: ${filter}`); // Placeholder
    setChartData(initialData[filter]); // Use mock data
  }, [filter]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Progress Hafalan</h1>

      <div className="mb-6 flex justify-center space-x-2">
        {['weekly', 'monthly', 'yearly'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl shadow font-semibold ${
              filter === f ? 'bg-green-500 text-white' : 'bg-white text-green-500 hover:bg-green-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-4" style={{ height: 400 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ayatDihafal" stroke="#10B981" activeDot={{ r: 8 }} name="Ayat Dihafal" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 h-full flex items-center justify-center">
            Tidak ada data untuk ditampilkan pada filter "{filter}".
          </p>
        )}
      </div>
    </div>
  );
};

export default Chart;
