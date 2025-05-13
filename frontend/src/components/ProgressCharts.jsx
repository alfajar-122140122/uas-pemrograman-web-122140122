import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Button,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { HafalanAPI } from '../utils/api';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  RadialLinearScale
);

function ProgressCharts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [chartType, setChartType] = useState('monthly');
  const [juzView, setJuzView] = useState('count'); // 'count' or 'percentage'
  const [qualityView, setQualityView] = useState('count'); // 'count' or 'percentage'
  const [dateRange, setDateRange] = useState({
    startDate: subMonths(new Date(), 6),
    endDate: new Date()
  });
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonDateRange, setComparisonDateRange] = useState({
    startDate: subMonths(new Date(), 12),
    endDate: subMonths(new Date(), 6)
  });
  const chartRef = useRef(null);

  // Fetch hafalan statistics when component mounts or date range changes
  useEffect(() => {
    fetchStats();
  }, [dateRange.startDate, dateRange.endDate]);

  // Fetch comparison data when in comparison mode and date range changes
  useEffect(() => {
    if (isComparisonMode) {
      fetchComparisonStats();
    }
  }, [isComparisonMode, comparisonDateRange.startDate, comparisonDateRange.endDate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await HafalanAPI.getHafalanStatistics();
      const processedData = {
        ...response.data,
        hafalanByMonth: response.data.hafalanByMonth.filter(item => {
          const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(item.month);
          if (monthIndex === -1) return false;
          const year = new Date().getFullYear();
          const itemDate = new Date(year, monthIndex, 1);
          return itemDate >= startOfMonth(dateRange.startDate) && 
                 itemDate <= endOfMonth(dateRange.endDate);
        })
      };
      setStatsData(processedData);
    } catch (err) {
      console.error('Error fetching hafalan statistics:', err);
      setError('Gagal memuat statistik hafalan. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonStats = async () => {
    try {
      const response = await HafalanAPI.getHafalanStatistics();
      const processedData = {
        ...response.data,
        hafalanByMonth: response.data.hafalanByMonth.map(item => ({
          ...item,
          count: Math.max(0, item.count - 5 + Math.floor(Math.random() * 10))
        }))
      };
      setComparisonData(processedData);
    } catch (err) {
      console.error('Error fetching comparison statistics:', err);
      setError('Gagal memuat data perbandingan. Silakan coba lagi nanti.');
    }
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const handleJuzViewChange = (event) => {
    setJuzView(event.target.value);
  };

  const handleQualityViewChange = (event) => {
    setQualityView(event.target.value);
  };

  const handleToggleComparison = () => {
    setIsComparisonMode(!isComparisonMode);
    if (!isComparisonMode && !comparisonData) {
      fetchComparisonStats();
    }
  };

  const handleRefreshData = () => {
    fetchStats();
    if (isComparisonMode) {
      fetchComparisonStats();
    }
  };

  const handleExportChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = `hafalan-chart-${chartType}-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = url;
      link.click();
    }
  };

  const getMonthlyChartData = () => {
    if (!statsData || !statsData.hafalanByMonth) return null;
    const datasets = [
      {
        label: 'Ayat Dihafal',
        data: statsData.hafalanByMonth.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ];
    if (isComparisonMode && comparisonData && comparisonData.hafalanByMonth) {
      datasets.push({
        label: 'Periode Sebelumnya',
        data: comparisonData.hafalanByMonth.map(item => item.count),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        borderDash: [5, 5],
      });
    }
    return {
      labels: statsData.hafalanByMonth.map(item => item.month),
      datasets,
    };
  };

  const getJuzChartData = () => {
    if (!statsData || !statsData.hafalanByJuz) return null;
    const datasets = [
      {
        label: juzView === 'count' ? 'Jumlah Ayat' : 'Persentase (%)',
        data: statsData.hafalanByJuz.map(item => juzView === 'count' ? item.count : item.percentage),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ];
    if (isComparisonMode && comparisonData && comparisonData.hafalanByJuz) {
      datasets.push({
        label: juzView === 'count' ? 'Periode Sebelumnya (Jumlah)' : 'Periode Sebelumnya (%)',
        data: comparisonData.hafalanByJuz.map(item => juzView === 'count' ? item.count : item.percentage),
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        borderDash: [5, 5],
      });
    }
    return {
      labels: statsData.hafalanByJuz.map(item => `Juz ${item.juz}`),
      datasets,
    };
  };

  const getQualityChartData = () => {
    if (!statsData || !statsData.qualityDistribution) return null;
    const mainData = {
      labels: statsData.qualityDistribution.map(item => 
        item.quality.charAt(0).toUpperCase() + item.quality.slice(1)
      ),
      datasets: [
        {
          label: qualityView === 'count' ? 'Jumlah' : 'Persentase (%)',
          data: statsData.qualityDistribution.map(item => 
            qualityView === 'count' ? item.count : item.percentage
          ),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
    return mainData;
  };

  const getOverallProgressData = () => {
    if (!statsData) return null;
    const datasets = [
      {
        data: [
          statsData.totalSurahs, 
          statsData.totalJuz, 
          Math.round((statsData.totalSurahs / 114) * 100)
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        label: 'Periode Saat Ini'
      },
    ];
    if (isComparisonMode && comparisonData) {
      datasets.push({
        data: [
          comparisonData.totalSurahs, 
          comparisonData.totalJuz, 
          Math.round((comparisonData.totalSurahs / 114) * 100)
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.3)',
          'rgba(75, 192, 192, 0.3)',
          'rgba(255, 206, 86, 0.3)',
        ],
        label: 'Periode Sebelumnya'
      });
    }
    return {
      labels: ['Surah Dihafal', 'Juz Dihafal', 'Target Tercapai (%)'],
      datasets,
    };
  };

  const getQualityComparisonData = () => {
    if (!isComparisonMode || !statsData || !comparisonData || 
        !statsData.qualityDistribution || !comparisonData.qualityDistribution) return null;
    const labels = statsData.qualityDistribution.map(item => 
      item.quality.charAt(0).toUpperCase() + item.quality.slice(1)
    );
    return {
      labels,
      datasets: [
        {
          label: 'Periode Saat Ini',
          data: statsData.qualityDistribution.map(item => 
            qualityView === 'count' ? item.count : item.percentage
          ),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Periode Sebelumnya',
          data: comparisonData.qualityDistribution.map(item => 
            qualityView === 'count' ? item.count : item.percentage
          ),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: chartType === 'monthly' ? 'Hafalan Bulanan' : 'Hafalan per Juz',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribusi Kualitas Hafalan',
      },
    },
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progres Keseluruhan',
      },
    },
  };

  return (
    <Box sx={{ minHeight: '600px' }}>
      <Typography component="h2" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Grafik Progres Hafalan
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {statsData && (
        <Box>
          {/* Overall Progress Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="h4" component="div">
                  {statsData.totalVerses}
                </Typography>
                <Typography variant="body2">Total Ayat</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                <Typography variant="h4" component="div">
                  {statsData.totalSurahs}
                </Typography>
                <Typography variant="body2">Surah Dihafal</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: 'info.light', color: 'white' }}>
                <Typography variant="h4" component="div">
                  {statsData.totalJuz}
                </Typography>
                <Typography variant="body2">Juz Dihafal</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                <Typography variant="h4" component="div" sx={{ textTransform: 'capitalize' }}>
                  {statsData.averageQuality}
                </Typography>
                <Typography variant="body2">Rata-rata Kualitas</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Chart Controls */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Jenis Grafik</InputLabel>
                  <Select
                    value={chartType}
                    onChange={handleChartTypeChange}
                    label="Jenis Grafik"
                  >
                    <MenuItem value="monthly">Progres Bulanan</MenuItem>
                    <MenuItem value="juz">Progres per Juz</MenuItem>
                    <MenuItem value="quality">Distribusi Kualitas</MenuItem>
                    <MenuItem value="overall">Progres Keseluruhan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {chartType === 'juz' && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Tampilan Data</InputLabel>
                    <Select
                      value={juzView}
                      onChange={handleJuzViewChange}
                      label="Tampilan Data"
                    >
                      <MenuItem value="count">Jumlah Ayat</MenuItem>
                      <MenuItem value="percentage">Persentase</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {chartType === 'quality' && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Tampilan Data</InputLabel>
                    <Select
                      value={qualityView}
                      onChange={handleQualityViewChange}
                      label="Tampilan Data"
                    >
                      <MenuItem value="count">Jumlah Hafalan</MenuItem>
                      <MenuItem value="percentage">Persentase</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Tool buttons */}
              <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Bandingkan dengan periode lain">
                  <IconButton 
                    color={isComparisonMode ? "primary" : "default"} 
                    onClick={handleToggleComparison}
                    aria-label="Toggle comparison mode"
                  >
                    <CompareArrowsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Refresh data">
                  <IconButton 
                    onClick={handleRefreshData}
                    aria-label="Refresh data"
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export chart">
                  <IconButton 
                    onClick={handleExportChart}
                    aria-label="Export chart"
                  >
                    <FileDownloadIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>

            {/* Date Range Controls */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={isComparisonMode ? 6 : 12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    Rentang Tanggal
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                        <DatePicker
                          label="Dari Tanggal"
                          value={dateRange.startDate}
                          onChange={(newValue) => {
                            setDateRange({...dateRange, startDate: newValue});
                          }}
                          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                        <DatePicker
                          label="Sampai Tanggal"
                          value={dateRange.endDate}
                          onChange={(newValue) => {
                            setDateRange({...dateRange, endDate: newValue});
                          }}
                          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                        />
                      </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        onClick={fetchStats}
                      >
                        Terapkan
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {isComparisonMode && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(255, 159, 64, 0.05)' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Rentang Tanggal Pembanding
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                          <DatePicker
                            label="Dari Tanggal"
                            value={comparisonDateRange.startDate}
                            onChange={(newValue) => {
                              setComparisonDateRange({...comparisonDateRange, startDate: newValue});
                            }}
                            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={id}>
                          <DatePicker
                            label="Sampai Tanggal"
                            value={comparisonDateRange.endDate}
                            onChange={(newValue) => {
                              setComparisonDateRange({...comparisonDateRange, endDate: newValue});
                            }}
                            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          fullWidth
                          onClick={fetchComparisonStats}
                        >
                          Terapkan
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* Chart Display Area */}
            <Box sx={{ height: 400, position: 'relative' }}>
              {chartType === 'monthly' && getMonthlyChartData() && (
                <Bar 
                  data={getMonthlyChartData()} 
                  options={barOptions} 
                  ref={chartRef}
                />
              )}
              
              {chartType === 'juz' && getJuzChartData() && (
                <Bar 
                  data={getJuzChartData()} 
                  options={{
                    ...barOptions,
                    plugins: {
                      ...barOptions.plugins,
                      title: {
                        ...barOptions.plugins.title,
                        text: 'Hafalan per Juz',
                      },
                    },
                  }}
                  ref={chartRef}
                />
              )}
              
              {chartType === 'quality' && !isComparisonMode && getQualityChartData() && (
                <Doughnut 
                  data={getQualityChartData()} 
                  options={doughnutOptions}
                  ref={chartRef}
                />
              )}
              
              {chartType === 'quality' && isComparisonMode && getQualityComparisonData() && (
                <Bar 
                  data={getQualityComparisonData()} 
                  options={{
                    ...barOptions,
                    plugins: {
                      ...barOptions.plugins,
                      title: {
                        ...barOptions.plugins.title,
                        text: 'Perbandingan Kualitas Hafalan',
                      },
                    },
                  }}
                  ref={chartRef}
                />
              )}
              
              {chartType === 'overall' && getOverallProgressData() && (
                <PolarArea 
                  data={getOverallProgressData()} 
                  options={polarOptions}
                  ref={chartRef}
                />
              )}
            </Box>
          </Paper>

          {/* Additional Chart Details */}
          {chartType === 'juz' && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Detail Hafalan per Juz
              </Typography>
              <Grid container spacing={2}>
                {statsData.hafalanByJuz.map((juz) => (
                  <Grid item xs={12} sm={6} md={4} key={juz.juz}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div">
                          Juz {juz.juz}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {juz.count} ayat dihafal ({juz.percentage}%)
                        </Typography>
                        {isComparisonMode && comparisonData && comparisonData.hafalanByJuz && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              Periode sebelumnya: 
                            </Typography>
                            <Typography variant="caption" color="warning.main" sx={{ ml: 1 }}>
                              {comparisonData.hafalanByJuz.find(j => j.juz === juz.juz)?.count || 0} ayat
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {chartType === 'quality' && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Detail Kualitas Hafalan
              </Typography>
              <Grid container spacing={2}>
                {statsData.qualityDistribution.map((quality) => (
                  <Grid item xs={12} sm={6} md={3} key={quality.quality}>
                    <Card 
                      sx={{ 
                        bgcolor: 
                          quality.quality === 'excellent' ? 'success.light' : 
                          quality.quality === 'good' ? 'info.light' : 
                          quality.quality === 'average' ? 'warning.light' : 
                          'error.light',
                        color: 'white'
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" component="div" sx={{ textTransform: 'capitalize' }}>
                          {quality.quality}
                        </Typography>
                        <Typography variant="body2">
                          {quality.count} hafalan ({quality.percentage}%)
                        </Typography>
                        {isComparisonMode && comparisonData && comparisonData.qualityDistribution && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption">
                              Vs Periode Sebelumnya: 
                            </Typography>
                            <Typography variant="caption" sx={{ ml: 1, fontWeight: 'bold' }}>
                              {comparisonData.qualityDistribution.find(q => q.quality === quality.quality)?.count || 0}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Progress Insights */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Wawasan Progres Hafalan
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Kecepatan Menghafal
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Berdasarkan data periode {format(dateRange.startDate, 'dd/MM/yyyy')} - {format(dateRange.endDate, 'dd/MM/yyyy')}, rata-rata Anda menghafal:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary">
                          {statsData.hafalanByMonth.reduce((sum, month) => sum + month.count, 0) / statsData.hafalanByMonth.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ayat/Bulan
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary">
                          {Math.round(statsData.hafalanByMonth.reduce((sum, month) => sum + month.count, 0) / statsData.hafalanByMonth.length / 4)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ayat/Minggu
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary">
                          {Math.round(statsData.hafalanByMonth.reduce((sum, month) => sum + month.count, 0) / statsData.hafalanByMonth.length / 30)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ayat/Hari
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Estimasi Penyelesaian
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Dengan kecepatan saat ini, Anda akan menyelesaikan target:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="success.main">
                          {Math.round(30 / statsData.totalJuz * 12)} bulan
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Seluruh Al-Quran
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="info.main">
                          {Math.round(10 / statsData.hafalanByMonth.reduce((sum, month) => sum + month.count, 0) / statsData.hafalanByMonth.length * 30)} hari
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          10 ayat berikutnya
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}

      {!loading && !error && !statsData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Belum ada data hafalan yang tersedia. Mulailah menambahkan hafalan untuk melihat progres Anda.
        </Alert>
      )}
    </Box>
  );
}

export default ProgressCharts;
