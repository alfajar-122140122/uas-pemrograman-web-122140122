import { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, 
  Switch, IconButton, Badge, Popover, Divider,
  FormControl, FormControlLabel, MenuItem, Select, 
  Button, Alert, Snackbar
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';
import { NotificationAPI } from '../utils/api';

function NotificationSystem() {
  // State untuk data dan UI
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    reminderTime: 30, // menit sebelum jadwal
    sound: true,
    vibration: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Mengambil user dari konteks autentikasi
  const { currentUser } = useAuth();
  
  // State untuk menghitung notifikasi yang belum dibaca
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Mengambil data notifikasi saat komponen dimuat
  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        // Mengambil data notifikasi dan pengaturan
        const notificationsResponse = await NotificationAPI.getUserNotifications();
        setNotifications(notificationsResponse.data);
        
        const settingsResponse = await NotificationAPI.getUserNotificationSettings();
        if (settingsResponse.data) {
          setNotificationSettings(settingsResponse.data);
        }
      } catch (err) {
        console.error('Gagal memuat notifikasi:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNotifications();
    
    // Atur polling untuk memeriksa notifikasi baru setiap 1 menit
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);
    
    // Bersihkan interval saat komponen di-unmount
    return () => clearInterval(intervalId);
  }, []);

  // Fungsi untuk permintaan izin notifikasi browser
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setError("Browser ini tidak mendukung notifikasi desktop.");
      return false;
    }
    
    if (Notification.permission === "granted") {
      return true;
    }
    
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    
    return false;
  };

  // Handler untuk mengubah pengaturan notifikasi
  const handleSettingChange = async (setting, value) => {
    try {
      const updatedSettings = {
        ...notificationSettings,
        [setting]: value
      };
      
      // Jika mengaktifkan notifikasi, minta izin notifikasi browser
      if (setting === 'enabled' && value === true) {
        const permissionGranted = await requestNotificationPermission();
        if (!permissionGranted) {
          setError('Izin notifikasi ditolak.');
          return;
        }
      }
      
      // Update pengaturan di server
      await NotificationAPI.updateNotificationSettings(updatedSettings);
      
      // Update state lokal
      setNotificationSettings(updatedSettings);
      
      // Tampilkan pesan sukses
      setSnackbarMessage('Pengaturan notifikasi berhasil disimpan');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Gagal menyimpan pengaturan. Silakan coba lagi nanti.');
      console.error(err);
    }
  };

  // Handler untuk menandai notifikasi sebagai dibaca
  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationAPI.markNotificationAsRead(notificationId);
      
      // Update state lokal
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (err) {
      console.error('Gagal menandai notifikasi sebagai telah dibaca:', err);
    }
  };

  // Handler untuk menghapus notifikasi
  const handleDeleteNotification = async (notificationId) => {
    try {
      await NotificationAPI.deleteNotification(notificationId);
      
      // Update state lokal
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Gagal menghapus notifikasi:', err);
    }
  };

  // Handler untuk menandai semua notifikasi sebagai dibaca
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationAPI.markAllNotificationsAsRead();
      
      // Update state lokal
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      
      // Tampilkan pesan sukses
      setSnackbarMessage('Semua notifikasi telah ditandai sebagai dibaca');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Gagal menandai semua notifikasi sebagai telah dibaca:', err);
    }
  };

  // Handler untuk membuka popover notifikasi
  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handler untuk menutup popover notifikasi
  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const popoverOpen = Boolean(anchorEl);

  return (
    <>
      {/* Ikon notifikasi dengan badge */}
      <Box sx={{ position: 'relative' }}>
        <IconButton 
          color="inherit" 
          onClick={handleNotificationClick}
          sx={{ mr: 2 }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Box>

      {/* Popover untuk menampilkan daftar notifikasi */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 350, maxHeight: 400, overflow: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">
              Notifikasi
            </Typography>
            {notifications.length > 0 && (
              <Button 
                size="small" 
                onClick={handleMarkAllAsRead}
              >
                Tandai semua dibaca
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 1 }} />
          
          {notifications.length === 0 ? (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Tidak ada notifikasi
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', p: 0 }}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{ 
                    borderBottom: '1px solid #eee',
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover'
                  }}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => handleDeleteNotification(notification.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCircleIcon fontSize="small" color="primary" />
                          </IconButton>
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" display="block">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleString('id-ID')}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>

      {/* Snackbar untuk menampilkan pesan sukses */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
}

// Komponen untuk pengaturan notifikasi
export function NotificationSettings() {
  // State untuk data dan UI
  const [settings, setSettings] = useState({
    enabled: true,
    reminderTime: 30,
    sound: true,
    vibration: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Mengambil user dari konteks autentikasi
  const { currentUser } = useAuth();

  // Mengambil pengaturan notifikasi saat komponen dimuat
  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      try {
        const response = await NotificationAPI.getUserNotificationSettings();
        if (response.data) {
          setSettings(response.data);
        }
      } catch (err) {
        setError('Gagal memuat pengaturan. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSettings();
  }, []);

  // Handler untuk mengubah pengaturan
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  // Handler untuk menyimpan pengaturan
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await NotificationAPI.updateNotificationSettings(settings);
      setSuccess('Pengaturan notifikasi berhasil disimpan');
      setError(null);
    } catch (err) {
      setError('Gagal menyimpan pengaturan. Silakan coba lagi nanti.');
      setSuccess(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Pengaturan Notifikasi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Alert severity="info">Memuat pengaturan...</Alert>
      ) : (
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              />
            }
            label="Aktifkan notifikasi"
          />
          
          <FormControl fullWidth margin="normal">
            <Typography variant="body2" gutterBottom>
              Ingatkan sebelum jadwal
            </Typography>
            <Select
              value={settings.reminderTime}
              onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
              disabled={!settings.enabled}
            >
              <MenuItem value={5}>5 menit sebelumnya</MenuItem>
              <MenuItem value={10}>10 menit sebelumnya</MenuItem>
              <MenuItem value={15}>15 menit sebelumnya</MenuItem>
              <MenuItem value={30}>30 menit sebelumnya</MenuItem>
              <MenuItem value={60}>1 jam sebelumnya</MenuItem>
              <MenuItem value={120}>2 jam sebelumnya</MenuItem>
              <MenuItem value={1440}>1 hari sebelumnya</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.sound}
                onChange={(e) => handleSettingChange('sound', e.target.checked)}
                disabled={!settings.enabled}
              />
            }
            label="Aktifkan suara notifikasi"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.vibration}
                onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                disabled={!settings.enabled}
              />
            }
            label="Aktifkan getaran"
          />
          
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleSaveSettings}
              disabled={loading}
            >
              Simpan Pengaturan
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default NotificationSystem;
