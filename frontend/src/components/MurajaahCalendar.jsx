import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import { MurajaahAPI } from '../utils/api';

function MurajaahCalendar() {
  // State untuk data dan UI
  const [murajaahEvents, setMurajaahEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [surahs, setSurahs] = useState([]);
  
  // State untuk form
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    surahNumber: '',
    startVerse: '',
    endVerse: '',
    notes: '',
    reminderTime: '08:00',
    isCompleted: false
  });

  // Mengambil user dari konteks autentikasi
  const { currentUser } = useAuth();

  // Mengambil data muraja'ah dan surah saat komponen dimuat
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      try {
        // Mengambil data muraja'ah
        const murajaahResponse = await MurajaahAPI.getUserMurajaah();
        setMurajaahEvents(murajaahResponse.data);
        
        // Mengambil data surah
        const surahsResponse = await MurajaahAPI.getAllSurahs();
        setSurahs(surahsResponse.data);
      } catch (err) {
        setError('Gagal memuat data. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInitialData();
  }, []);

  // Mengambil event pada tanggal yang dipilih
  const eventsOnSelectedDate = murajaahEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  // Handler untuk perubahan tanggal di kalender
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handler untuk perubahan input pada form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handler untuk membuka dialog tambah muraja'ah baru
  const handleAddMurajaah = () => {
    setEditMode(false);
    setFormData({
      title: '',
      date: selectedDate.toISOString().split('T')[0],
      surahNumber: '',
      startVerse: '',
      endVerse: '',
      notes: '',
      reminderTime: '08:00',
      isCompleted: false
    });
    setOpenDialog(true);
  };

  // Handler untuk membuka dialog edit muraja'ah
  const handleEditMurajaah = (event) => {
    setEditMode(true);
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      surahNumber: event.surahNumber,
      startVerse: event.startVerse,
      endVerse: event.endVerse,
      notes: event.notes || '',
      reminderTime: event.reminderTime || '08:00',
      isCompleted: event.isCompleted
    });
    setOpenDialog(true);
  };

  // Handler untuk menandai muraja'ah sebagai selesai
  const handleToggleComplete = async (event) => {
    setLoading(true);
    try {
      const updatedEvent = { ...event, isCompleted: !event.isCompleted };
      await MurajaahAPI.updateMurajaah(event.id, updatedEvent);
      
      // Update state lokal
      setMurajaahEvents(murajaahEvents.map(item => 
        item.id === event.id ? updatedEvent : item
      ));
    } catch (err) {
      setError('Gagal memperbarui status. Silakan coba lagi nanti.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk menyimpan form
  const handleSubmit = async () => {
    // Validasi form
    if (!formData.title || !formData.date || !formData.surahNumber) {
      setError('Mohon lengkapi field yang wajib diisi: judul, tanggal, dan surah');
      return;
    }

    setLoading(true);
    try {
      if (editMode) {
        // Update muraja'ah yang sudah ada
        await MurajaahAPI.updateMurajaah(selectedEvent.id, formData);
        
        // Update state lokal
        setMurajaahEvents(murajaahEvents.map(item => 
          item.id === selectedEvent.id ? { ...item, ...formData } : item
        ));
      } else {
        // Tambahkan muraja'ah baru
        const response = await MurajaahAPI.addMurajaah(formData);
        
        // Update state lokal dengan muraja'ah baru
        setMurajaahEvents([...murajaahEvents, response.data]);
      }
      
      // Tutup dialog dan reset error
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError('Gagal menyimpan data. Silakan coba lagi nanti.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk menghapus muraja'ah
  const handleDeleteMurajaah = async (id) => {
    // Konfirmasi terlebih dahulu
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal muraja\'ah ini?')) {
      return;
    }
    
    setLoading(true);
    try {
      // Panggil API untuk menghapus
      await MurajaahAPI.deleteMurajaah(id);
      
      // Update state lokal dengan menghapus data yang dihapus
      setMurajaahEvents(murajaahEvents.filter(item => item.id !== id));
    } catch (err) {
      setError('Gagal menghapus data. Silakan coba lagi nanti.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan nama surah berdasarkan nomornya
  const getSurahName = (surahNumber) => {
    const surah = surahs.find(s => s.number === parseInt(surahNumber));
    return surah ? surah.name : `Surah #${surahNumber}`;
  };

  return (
    <Box>
      {/* Judul dan tombol tambah */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography component="h2" variant="h5" fontWeight="bold">
          Jadwal Muraja'ah
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddMurajaah}
        >
          Tambah Muraja'ah
        </Button>
      </Box>

      {/* Tampilkan alert jika ada error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tampilkan status loading */}
      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Memuat data...
        </Alert>
      )}

      {/* Grid layout untuk kalender dan daftar event */}
      <Grid container spacing={3}>
        {/* Kalender */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: '100%' }}
                renderDay={(day, _value, DayComponentProps) => {
                  // Tandai hari yang memiliki event muraja'ah
                  const isEventDay = murajaahEvents.some(event => 
                    new Date(event.date).toDateString() === day.toDateString()
                  );
                  
                  return (
                    <Box
                      sx={{
                        position: 'relative',
                        ...(!DayComponentProps.outsideCurrentMonth && isEventDay && {
                          backgroundColor: 'primary.main',
                          borderRadius: '50%',
                          color: 'white',
                        })
                      }}
                    >
                      {day.getDate()}
                    </Box>
                  );
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>

        {/* Daftar event untuk tanggal yang dipilih */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            
            {eventsOnSelectedDate.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Tidak ada jadwal muraja'ah untuk tanggal ini
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Judul</TableCell>
                      <TableCell>Surah</TableCell>
                      <TableCell>Waktu</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventsOnSelectedDate.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.title}</TableCell>
                        <TableCell>
                          {getSurahName(event.surahNumber)}
                          {event.startVerse && event.endVerse && (
                            <Typography variant="body2" color="text.secondary">
                              Ayat {event.startVerse} - {event.endVerse}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{event.reminderTime}</TableCell>
                        <TableCell>
                          <Button
                            variant={event.isCompleted ? "contained" : "outlined"}
                            color={event.isCompleted ? "success" : "primary"}
                            size="small"
                            onClick={() => handleToggleComplete(event)}
                          >
                            {event.isCompleted ? "Selesai" : "Belum"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEditMurajaah(event)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteMurajaah(event.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog untuk Tambah/Edit Muraja'ah */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Jadwal Muraja\'ah' : 'Tambah Jadwal Muraja\'ah Baru'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {/* Judul */}
            <TextField
              fullWidth
              label="Judul Muraja'ah"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            {/* Tanggal */}
            <TextField
              fullWidth
              label="Tanggal"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            
            {/* Waktu Pengingat */}
            <TextField
              fullWidth
              label="Waktu Pengingat"
              type="time"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            {/* Surah */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="surah-select-label">Surah</InputLabel>
              <Select
                labelId="surah-select-label"
                id="surah-select"
                name="surahNumber"
                value={formData.surahNumber}
                onChange={handleInputChange}
                label="Surah"
                required
              >
                {surahs.map(surah => (
                  <MenuItem key={surah.number} value={surah.number}>
                    {surah.number}. {surah.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Ayat */}
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
            {editMode ? 'Simpan Perubahan' : 'Tambah Muraja\'ah'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MurajaahCalendar;
