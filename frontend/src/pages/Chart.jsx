import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../hooks/useAuth';
import { CircularProgress, Typography, Paper, Tabs, Tab, Box } from '@mui/material';
import { subWeeks, format, parseISO, getMonth, getYear, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek, endOfWeek, differenceInCalendarWeeks, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

// Helper function to calculate number of ayahs from range like "1-10" or "5"
const calculateAyahCount = (ayahRange) => {
  if (!ayahRange) return 0;
  const parts = ayahRange.split('-').map(s => parseInt(s.trim(), 10));
  if (parts.length === 1) return 1; // Single ayah
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[1] - parts[0] + 1;
  }
  return 0; // Invalid range
};

const Chart = () => {
  const [filter, setFilter] = useState('monthly'); // weekly, monthly, yearly
  const [chartData, setChartData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({ totalAyahs: 0, totalSurahs: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate(); // Assuming useNavigate is imported for the login button

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      setError("Silakan login untuk melihat progress hafalan.");
      setChartData([]);
      setSummaryStats({ totalAyahs: 0, totalSurahs: 0 });
      console.log('[Chart.jsx] User not authenticated or not available');
      return;
    }
    console.log('[Chart.jsx] User authenticated:', user);
    console.log('[Chart.jsx] Current filter:', filter);

    const fetchAndProcessHafalan = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`[Chart.jsx] Fetching hafalan for user ID: ${user.id}`);
        const response = await api.get(`/v1/users/${user.id}/hafalan`);
        console.log('[Chart.jsx] Raw API response:', response);
        const hafalanItems = response.data;
        console.log('[Chart.jsx] Hafalan items from API:', hafalanItems);
        // Added log to inspect last_reviewed_at
        console.log('[Chart.jsx] Hafalan items from API (checking last_reviewed_at):', hafalanItems.map(item => ({ id: item.id, status: item.status, last_reviewed_at: item.last_reviewed_at })));

        if (!Array.isArray(hafalanItems)) {
          console.error('[Chart.jsx] hafalanItems is not an array:', hafalanItems);
          setError("Data hafalan yang diterima tidak valid.");
          setChartData([]);
          setSummaryStats({ totalAyahs: 0, totalSurahs: 0 });
          setIsLoading(false);
          return;
        }

        const completedHafalan = hafalanItems.filter(
          item => {
            const isSelesai = item.status === 'selesai';
            const hasLastReviewed = !!item.last_reviewed_at;
            // console.log(`[Chart.jsx] Filtering item ID ${item.id}: status=${item.status}, last_reviewed_at=${item.last_reviewed_at}, isSelesai=${isSelesai}, hasLastReviewed=${hasLastReviewed}`);
            return isSelesai && hasLastReviewed;
          }
        ).map(item => {
          let parsedDate;
          try {
            parsedDate = parseISO(item.last_reviewed_at);
          } catch (e) {
            console.error(`[Chart.jsx] Error parsing date for item ID ${item.id}: ${item.last_reviewed_at}`, e);
            return null; // Skip this item if date is invalid
          }
          const ayahs = calculateAyahCount(item.ayah_range);
          // console.log(`[Chart.jsx] Mapping item ID ${item.id}: date=${parsedDate}, ayahCount=${ayahs}`);
          return {
            ...item,
            date: parsedDate,
            ayahCount: ayahs
          };
        }).filter(item => item !== null) // Remove items with parsing errors
        .sort((a, b) => a.date - b.date); // Sort by date for cumulative calculation
        console.log('[Chart.jsx] Filtered and mapped completedHafalan:', completedHafalan);

        let processedData = [];
        let cumulativeAyahs = 0;
        const today = new Date();

        if (filter === 'monthly') {
          const currentYear = getYear(today);
          const monthsInYear = eachMonthOfInterval({
            start: startOfYear(today),
            end: today // up to the current month
          });

          processedData = monthsInYear.map(monthStart => {
            const monthEnd = endOfMonth(monthStart);
            const ayahsThisMonth = completedHafalan
              .filter(item => item.date >= monthStart && item.date <= monthEnd)
              .reduce((sum, item) => sum + item.ayahCount, 0);
            cumulativeAyahs += ayahsThisMonth;
            return {
              name: format(monthStart, 'MMM', { locale: id }),
              ayatDihafal: cumulativeAyahs,
              newAyahs: ayahsThisMonth // For tooltip or bar chart
            };
          });
        } else if (filter === 'weekly') {
          const last8Weeks = eachWeekOfInterval({
            start: subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 7), // Start of 8 weeks ago
            end: startOfWeek(today, { weekStartsOn: 1 }) // Start of current week
          }, { weekStartsOn: 1 });
          
          processedData = last8Weeks.map(weekStart => {
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            const ayahsThisWeek = completedHafalan
              .filter(item => item.date >= weekStart && item.date <= weekEnd)
              .reduce((sum, item) => sum + item.ayahCount, 0);
            cumulativeAyahs += ayahsThisWeek;
            return {
              name: `Pekan ${format(weekStart, 'dd/MM')}`,
              ayatDihafal: cumulativeAyahs,
              newAyahs: ayahsThisWeek
            };
          });
        } else if (filter === 'yearly') {
          const uniqueYears = [...new Set(completedHafalan.map(item => getYear(item.date)))].sort();
          const displayYears = uniqueYears.slice(-3); // Max last 3 years or all if less

          if (displayYears.length === 0 && completedHafalan.length > 0) { // Handle case where all hafalan is in current year but no full previous year
             displayYears.push(getYear(completedHafalan[0].date));
          } else if (displayYears.length === 0) {
            displayYears.push(getYear(today)); // Default to current year if no data
          }


          processedData = displayYears.map(year => {
            const yearStart = startOfYear(new Date(year, 0, 1));
            const yearEnd = endOfYear(new Date(year, 0, 1));
            const ayahsThisYear = completedHafalan
              .filter(item => getYear(item.date) === year)
              .reduce((sum, item) => sum + item.ayahCount, 0);
            cumulativeAyahs += ayahsThisYear; // This cumulative logic might need adjustment for yearly if not reset
            return {
              name: year.toString(),
              ayatDihafal: completedHafalan.filter(item => getYear(item.date) <= year).reduce((sum, item) => sum + item.ayahCount, 0), // True cumulative up to this year
              newAyahs: ayahsThisYear
            };
          });
           // For yearly, we want the total for that year, not a running cumulative across years in the chart
           // So, let's recalculate ayatDihafal to be the total up to that year.
           let runningTotalForYearly = 0;
           processedData = processedData.map(dataPoint => {
               runningTotalForYearly += dataPoint.newAyahs; // This was ayahsThisYear
               return { ...dataPoint, ayatDihafal: runningTotalForYearly };
           });
        }
        
        console.log('[Chart.jsx] Processed chart data before setting state:', processedData);
        setChartData(processedData);

        const totalAyahs = completedHafalan.reduce((sum, item) => sum + item.ayahCount, 0);
        const totalSurahs = new Set(completedHafalan.map(item => item.surah_name)).size;
        console.log('[Chart.jsx] Summary stats: totalAyahs=', totalAyahs, 'totalSurahs=', totalSurahs);
        setSummaryStats({ totalAyahs, totalSurahs });

      } catch (err) {
        console.error("[Chart.jsx] Error fetching or processing hafalan data:", err);
        setError("Gagal memuat data progress. Silakan coba lagi.");
        setChartData([]);
        setSummaryStats({ totalAyahs: 0, totalSurahs: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndProcessHafalan();
  }, [filter, user, isAuthenticated]);

  const handleFilterChange = (event, newValue) => {
    setFilter(newValue);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-80">
        <CircularProgress sx={{ color: '#22C55E' }} />
        <Typography sx={{ marginTop: 2, color: '#4B5563' }}>Memuat data progress...</Typography>
      </div>
    );
  }

  if (error && (!user || !isAuthenticated)) {
    return (
      <Paper elevation={3} className="p-6 text-center bg-white border border-[#E5E7EB] rounded-2xl max-w-lg mx-auto mt-10">
        <Typography variant="h6" sx={{ color: '#16A34A' }} gutterBottom>Akses Terbatas</Typography>
        <Typography sx={{ color: '#4B5563', marginBottom: 2 }}>{error}</Typography>
        <button
          onClick={() => navigate('/login')}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-2 px-6 rounded-lg shadow hover:shadow-md transition-colors duration-150"
        >
          Login
        </button>
      </Paper>
    );
  } else if (error) {
     return (
      <Paper elevation={3} className="p-6 text-center bg-white border border-[#E5E7EB] rounded-2xl max-w-lg mx-auto mt-10">
        <Typography variant="h6" color="error" gutterBottom>Oops! Terjadi Kesalahan</Typography>
        <Typography sx={{ color: '#B91C1C' }}>{error}</Typography> {/* Using a red from Tailwind's palette e.g. red-700 */}
      </Paper>
    );
  }
  
  const filterLabels = {
    weekly: "Mingguan",
    monthly: "Bulanan",
    yearly: "Tahunan"
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Typography variant="h4" component="h1" className="font-bold text-[#1F2937] mb-6 text-center">
        Progress Hafalan Saya
      </Typography>
      
      <Paper elevation={2} className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-lg">
        <Typography variant="h6" sx={{ color: '#16A34A', marginBottom: 2, fontWeight: 600 }}>Ringkasan Total</Typography>
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Paper elevation={1} className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-md">
                <Typography variant="subtitle1" className="font-semibold text-[#4B5563] opacity-90">Total Ayat Dihafal</Typography>
                <Typography variant="h4" className="font-bold text-[#1F2937]">{summaryStats.totalAyahs}</Typography>
            </Paper>
            <Paper elevation={1} className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-md">
                <Typography variant="subtitle1" className="font-semibold text-[#4B5563] opacity-90">Total Surah Tersentuh</Typography>
                <Typography variant="h4" className="font-bold text-[#1F2937]">{summaryStats.totalSurahs}</Typography>
            </Paper>
        </Box>
      </Paper>

      <Paper elevation={3} className="p-4 sm:p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-lg">
        <Box sx={{ borderBottom: 1, borderColor: '#E5E7EB', marginBottom: 3 }}>
          <Tabs 
            value={filter} 
            onChange={handleFilterChange} 
            aria-label="Filter progress hafalan" 
            variant="fullWidth"
            textColor="inherit"
            TabIndicatorProps={{ style: { backgroundColor: '#22C55E', height: '3px' } }}
          >
            <Tab label="Mingguan" value="weekly" sx={{ color: filter === 'weekly' ? '#16A34A' : '#4B5563', fontWeight: filter === 'weekly' ? 600 : 500, paddingX: {xs: 1, sm: 2}, fontSize: {xs: '0.8rem', sm: '0.9rem'} }} />
            <Tab label="Bulanan" value="monthly" sx={{ color: filter === 'monthly' ? '#16A34A' : '#4B5563', fontWeight: filter === 'monthly' ? 600 : 500, paddingX: {xs: 1, sm: 2}, fontSize: {xs: '0.8rem', sm: '0.9rem'} }} />
            <Tab label="Tahunan" value="yearly" sx={{ color: filter === 'yearly' ? '#16A34A' : '#4B5563', fontWeight: filter === 'yearly' ? 600 : 500, paddingX: {xs: 1, sm: 2}, fontSize: {xs: '0.8rem', sm: '0.9rem'} }} />
          </Tabs>
        </Box>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{
                top: 5, right: 20, left: -20, bottom: 20, 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB"/>
              <XAxis dataKey="name" stroke="#4B5563" tick={{fontSize: 12}} />
              <YAxis stroke="#4B5563" allowDecimals={false} tick={{fontSize: 12}}/>
              <Tooltip 
                contentStyle={{ backgroundColor: '#F9FAFB', borderRadius: '12px', borderColor: '#E5E7EB', padding: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#1F2937', fontWeight: 'bold', marginBottom: '5px' }}
                itemStyle={{ color: '#1F2937'}}
                formatter={(value, name, props) => {
                  const label = `Total Ayat Kumulatif: ${props.payload.ayatDihafal}`;
                  const newAyahsLabel = props.payload.newAyahs ? ` (Ayat Baru: ${props.payload.newAyahs})` : '';
                  // Return an array: [value, formattedName]
                  // The 'name' argument is "Ayat Dihafal (Filter)", we want to replace it with our detailed string.
                  return [value, label + newAyahsLabel]; 
                }}
                labelFormatter={(label) => <span style={{color: '#1F2937'}}>{label}</span>}
              />
              <Legend 
                formatter={(value) => <span style={{ color: '#1F2937', fontSize: '14px' }}>{value}</span>} 
                wrapperStyle={{paddingTop: '20px'}}
              />
              <Line 
                type="monotone" 
                dataKey="ayatDihafal" 
                strokeWidth={3} 
                stroke="#22C55E" 
                activeDot={{ r: 8, fill: '#16A34A', stroke: '#FFFFFF', strokeWidth: 2 }} 
                name={`Ayat Dihafal (${filterLabels[filter]})`} 
                dot={{ r: 5, fill: '#22C55E', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography className="text-center text-[#4B5563] h-64 flex items-center justify-center p-4">
            Tidak ada data hafalan yang selesai untuk periode "{filterLabels[filter]}" atau belum ada data sama sekali untuk ditampilkan.
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default Chart;
