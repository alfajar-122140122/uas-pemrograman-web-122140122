import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Divider, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, TextField,
  IconButton, Alert, Chip, Tab, Tabs
} from '@mui/material';
// Import komponen dasar dan icon yang dibutuhkan
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
// Import konteks dan API
import { useAuth } from '../context/AuthContext';
import { HafalanAPI } from '../utils/api';

function HafalanManagement() {
  // Menggunakan konteks user
  const { currentUser } = useAuth();
  
  // State untuk loading dan error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk data utama
  const [hafalanList, setHafalanList] = useState([]);
  const [surahs, setSurahs] = useState([]);
  
  // State untuk dialog dan UI
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedHafalan, setSelectedHafalan] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // State untuk form data
  const [formData, setFormData] = useState({
    surahNumber: '',
    startVerse: '',
    endVerse: '',
    date: new Date().toISOString().split('T')[0], // Simpan format tanggal sederhana yyyy-mm-dd
    quality: 'good',
    notes: '',
    status: 'in_progress'
  });
  
  // Mengambil data awal ketika komponen dimuat
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        // Mengambil data surah dari API
        const surahsResponse = await HafalanAPI.getAllSurahs();
        setSurahs(surahsResponse.data);
        
        // Mengambil data hafalan user dari API
        const hafalanResponse = await HafalanAPI.getUserHafalan();
        setHafalanList(hafalanResponse.data);
      } catch (err) {
        setError('Gagal memuat data. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    // Memanggil fungsi untuk mengambil data
    fetchInitialData();
  }, []);
    // Handler untuk perubahan input pada form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handler untuk membuka dialog tambah hafalan baru
  const handleAddHafalan = () => {
    setEditMode(false);
    setFormData({
      surahNumber: '',
      startVerse: '',
      endVerse: '',
      date: new Date().toISOString().split('T')[0],
      quality: 'good',
      notes: '',
      status: 'in_progress'
    });
    setOpenDialog(true);
  };
  
  // Handler untuk membuka dialog edit hafalan
  const handleEditHafalan = (hafalan) => {
    setEditMode(true);
    setSelectedHafalan(hafalan);
    setFormData({
      surahNumber: hafalan.surahNumber,
      startVerse: hafalan.startVerse,
      endVerse: hafalan.endVerse,
      date: hafalan.date,
      quality: hafalan.quality,
      notes: hafalan.notes || '',
      status: hafalan.status
    });
    setOpenDialog(true);
  };
  
  // Handler untuk menyimpan form
  const handleSubmit = async () => {
    // Validasi form
    if (!formData.surahNumber || !formData.startVerse || !formData.endVerse) {
      setError('Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    
    setLoading(true);
    try {
      if (editMode) {
        // Update hafalan yang sudah ada
        await HafalanAPI.updateHafalan(selectedHafalan.id, formData);
        
        // Update state lokal
        setHafalanList(hafalanList.map(item => 
          item.id === selectedHafalan.id ? { ...item, ...formData } : item
        ));
      } else {
        // Tambahkan hafalan baru
        const response = await HafalanAPI.addHafalan(formData);
        
        // Update state lokal dengan hafalan baru
        setHafalanList([...hafalanList, response.data]);
      }
      
      // Tutup dialog dan reset
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError('Gagal menyimpan data. Silakan coba lagi nanti.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
    // Handler untuk menghapus hafalan
  const handleDeleteHafalan = async (id) => {
    // Konfirmasi terlebih dahulu
    if (!window.confirm('Apakah Anda yakin ingin menghapus hafalan ini?')) {
      return;
    }
    
    setLoading(true);
    try {
      // Panggil API untuk menghapus
      await HafalanAPI.deleteHafalan(id);
      
      // Update state lokal dengan menghapus data yang dihapus
      setHafalanList(hafalanList.filter(item => item.id !== id));
    } catch (err) {
      setError('Gagal menghapus data. Silakan coba lagi nanti.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handler untuk pergantian tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Hitung statistik hafalan
  const completedHafalan = hafalanList.filter(item => item.status === 'completed');
  const inProgressHafalan = hafalanList.filter(item => item.status === 'in_progress');

  // Kelompokkan hafalan berdasarkan surah
  const hafalanBySurah = {};
  
  // Loop melalui semua item hafalan untuk dikelompokkan
  hafalanList.forEach(item => {
    const surahNumber = item.surahNumber;
    const surahData = surahs.find(s => s.number === surahNumber) || { name: `Surah #${surahNumber}` };
    
    // Jika belum ada dalam objek, buat entri baru
    if (!hafalanBySurah[surahNumber]) {
      hafalanBySurah[surahNumber] = {
        surahNumber: surahNumber,
        surahName: surahData.name,
        surahEnglishName: surahData.englishName,
        hafalanItems: [],
        completedVerses: 0
      };
    }
    
    // Tambahkan item hafalan ke entri surah ini
    hafalanBySurah[surahNumber].hafalanItems.push(item);
    
    // Hitung jumlah ayat yang sudah dihafal dengan status completed
    if (item.status === 'completed') {
      hafalanBySurah[surahNumber].completedVerses += 
        (item.endVerse - item.startVerse) + 1;
    }
  });
  
  // Konversi dari objek ke array untuk lebih mudah diproses dalam rendering
  const surahHafalanArray = Object.values(hafalanBySurah);
    return (
    <Box>
      {/* Judul dan tombol tambah */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography component="h2" variant="h5" fontWeight="bold">
          Kelola Hafalan
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddHafalan}
        >
          Tambah Hafalan Baru
        </Button>
      </Box>

      {/* Tampilkan alert jika ada error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Konten utama */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {loading && <Alert severity="info">Memuat data...</Alert>}

        {/* Tabs untuk tampilan berbeda */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="hafalan management tabs">
            <Tab label="Ringkasan" id="tab-0" />
            <Tab label="Daftar Hafalan" id="tab-1" />
            <Tab label="Per Surah" id="tab-2" />
          </Tabs>
        </Box>

        {/* Tab Ringkasan */}
        {tabValue === 0 && (
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Total Hafalan */}
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h3" fontWeight="bold">
                    {hafalanList.length}
                  </Typography>
                  <Typography>
                    Total Hafalan
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Hafalan Selesai */}
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h3" fontWeight="bold">
                    {completedHafalan.length}
                  </Typography>
                  <Typography>
                    Hafalan Selesai
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Dalam Proses */}
              <Grid item xs={12} sm={4}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: 'warning.main',
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h3" fontWeight="bold">
                    {inProgressHafalan.length}
                  </Typography>
                  <Typography>
                    Dalam Proses
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Tabel Hafalan Terbaru */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Hafalan Terbaru
            </Typography>

            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Surah</TableCell>
                    <TableCell>Ayat</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Kualitas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hafalanList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Belum ada hafalan. Silakan tambah hafalan baru.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hafalanList.slice(0, 5).map((hafalan) => {
                      const surahData = surahs.find(s => s.number === hafalan.surahNumber);
                      
                      return (
                        <TableRow key={hafalan.id}>
                          <TableCell>
                            {surahData ? `${surahData.name}` : `Surah #${hafalan.surahNumber}`}
                          </TableCell>
                          <TableCell>
                            {hafalan.startVerse} - {hafalan.endVerse}
                          </TableCell>
                          <TableCell>
                            {new Date(hafalan.date).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            {hafalan.status === 'completed' ? (
                              <Chip 
                                size="small" 
                                color="success" 
                                label="Selesai" 
                                icon={<CheckCircleIcon />} 
                              />
                            ) : (
                              <Chip 
                                size="small" 
                                color="warning" 
                                label="Dalam Proses" 
                                icon={<AccessTimeIcon />} 
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {hafalan.quality === 'excellent' && 'Sangat Baik'}
                            {hafalan.quality === 'good' && 'Baik'}
                            {hafalan.quality === 'average' && 'Sedang'}
                            {hafalan.quality === 'poor' && 'Perlu Perbaikan'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab Daftar Hafalan */}
        {tabValue === 1 && (
          <Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Surah</TableCell>
                    <TableCell>Ayat</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Kualitas</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hafalanList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Belum ada hafalan. Silakan tambah hafalan baru.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hafalanList.map((hafalan) => {
                      const surahData = surahs.find(s => s.number === hafalan.surahNumber);
                      
                      return (
                        <TableRow key={hafalan.id}>
                          <TableCell>
                            {surahData ? surahData.name : `Surah #${hafalan.surahNumber}`}
                          </TableCell>
                          <TableCell>
                            {hafalan.startVerse} - {hafalan.endVerse}
                          </TableCell>
                          <TableCell>
                            {new Date(hafalan.date).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            {hafalan.status === 'completed' ? (
                              <Chip 
                                size="small" 
                                color="success" 
                                label="Selesai" 
                              />
                            ) : (
                              <Chip 
                                size="small" 
                                color="warning" 
                                label="Dalam Proses" 
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {hafalan.quality === 'excellent' && 'Sangat Baik'}
                            {hafalan.quality === 'good' && 'Baik'}
                            {hafalan.quality === 'average' && 'Sedang'}
                            {hafalan.quality === 'poor' && 'Perlu Perbaikan'}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditHafalan(hafalan)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteHafalan(hafalan.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab Per Surah */}
        {tabValue === 2 && (
          <Box>
            {surahHafalanArray.length === 0 ? (
              <Alert severity="info">
                Belum ada progres hafalan. Silakan tambah hafalan baru.
              </Alert>
            ) : (
              surahHafalanArray.map((surah) => (
                <Paper key={surah.surahNumber} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6">
                    {surah.surahName} {surah.surahEnglishName ? `(${surah.surahEnglishName})` : ''}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Jumlah ayat hafalan: {surah.completedVerses} ayat
                  </Typography>
                  
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Ayat</TableCell>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Kualitas</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {surah.hafalanItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.startVerse} - {item.endVerse}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>
                            {item.status === 'completed' ? 'Selesai' : 'Dalam Proses'}
                          </TableCell>
                          <TableCell>
                            {item.quality === 'excellent' && 'Sangat Baik'}
                            {item.quality === 'good' && 'Baik'}
                            {item.quality === 'average' && 'Sedang'}
                            {item.quality === 'poor' && 'Perlu Perbaikan'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              ))
            )}
          </Box>
        )}
      </Paper>
      
      {/* Dialog untuk Tambah/Edit Hafalan */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Hafalan' : 'Tambah Hafalan Baru'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* Pilih Surah */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="surah-select-label">Surah</InputLabel>
              <Select
                labelId="surah-select-label"
                id="surah-select"
                name="surahNumber"
                value={formData.surahNumber}
                onChange={handleInputChange}
                label="Surah"
              >
                {surahs.map(surah => (
                  <MenuItem key={surah.number} value={surah.number}>
                    {surah.number}. {surah.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Ayat Mulai dan Akhir */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Ayat Mulai"
                type="number"
                name="startVerse"
                value={formData.startVerse}
                onChange={handleInputChange}
              />
              
              <TextField
                fullWidth
                label="Ayat Akhir"
                type="number"
                name="endVerse"
                value={formData.endVerse}
                onChange={handleInputChange}
              />
            </Box>
            
            {/* Tanggal */}
            <TextField
              fullWidth
              label="Tanggal Hafalan"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            {/* Status */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                label="Status"
              >
                <MenuItem value="in_progress">Dalam Proses</MenuItem>
                <MenuItem value="completed">Selesai</MenuItem>
              </Select>
            </FormControl>
            
            {/* Kualitas */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="quality-select-label">Kualitas Hafalan</InputLabel>
              <Select
                labelId="quality-select-label"
                id="quality-select"
                name="quality"
                value={formData.quality}
                onChange={handleInputChange}
                label="Kualitas Hafalan"
              >
                <MenuItem value="excellent">Sangat Baik</MenuItem>
                <MenuItem value="good">Baik</MenuItem>
                <MenuItem value="average">Sedang</MenuItem>
                <MenuItem value="poor">Perlu Perbaikan</MenuItem>
              </Select>
            </FormControl>
            
            {/* Catatan */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Catatan"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Batal
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {editMode ? 'Simpan Perubahan' : 'Tambah Hafalan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HafalanManagement;
