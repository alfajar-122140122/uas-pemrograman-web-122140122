import { useAuth } from '../context/AuthContext';
import { 
  Typography, Box, Button, Container, Paper, Grid, Card, CardContent, 
  Avatar, Divider, List, ListItem, ListItemText
} from '@mui/material';
import { useState } from 'react';
import { blue, green, orange, red } from '@mui/material/colors';
import QuranBrowser from '../components/QuranBrowser';
import HafalanManagement from '../components/HafalanManagement';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [date] = useState(new Date().toLocaleDateString('id-ID', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }));
  const [activeMenu, setActiveMenu] = useState('beranda');

  const handleLogout = () => {
    logout();
  };

  // Data statistik hafalan
  const statItems = [
    { title: 'Total Juz', value: '30', color: blue[500] },
    { title: 'Sudah Dihafal', value: currentUser?.juzHafalan || '8', color: green[500] },
    { title: 'Sedang Dihafal', value: currentUser?.juzSedangDihafal || '2', color: orange[500] },
    { title: 'Target Mingguan', value: currentUser?.targetMingguan || '1', color: red[500] }
  ];

  // Data aktivitas terbaru
  const recentActivities = [
    { id: 1, type: 'hafalan', surah: 'Al-Mulk', ayat: '1-10', date: '10 Mei 2025' },
    { id: 2, type: 'muroja\'ah', surah: 'Ar-Rahman', ayat: '1-30', date: '9 Mei 2025' },
    { id: 3, type: 'hafalan', surah: 'Al-Mulk', ayat: '11-15', date: '8 Mei 2025' },
    { id: 4, type: 'muroja\'ah', surah: 'Al-Waqiah', ayat: '1-96', date: '7 Mei 2025' }
  ];

  // Target hafalan
  const hafalanTargets = [
    { surah: 'Al-Mulk', target: '16-20', progress: 45 },
    { surah: 'Al-Qalam', target: '1-15', progress: 20 },
    { surah: 'Al-Muzzammil', target: '1-10', progress: 10 }
  ];

  // Menu navigasi
  const menuItems = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'hafalan', label: 'Kelola Hafalan' },
    { id: 'quran', label: 'Baca Al-Qur\'an' },
    { id: 'reminder', label: 'Reminder' }
  ];

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Aplikasi */}
      <Box component="header" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography component="h1" variant="h4" fontWeight="bold">
            Hafidz Tracker
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleLogout}
            aria-label="Keluar dari aplikasi"
          >
            Keluar
          </Button>
        </Box>

        {/* Menu Navigasi Sederhana */}
        <Box component="nav" sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {menuItems.map(item => (
            <Button 
              key={item.id}
              variant={activeMenu === item.id ? "contained" : "outlined"}
              color="primary"
              onClick={() => setActiveMenu(item.id)}
              sx={{ flexGrow: { xs: 1, sm: 0 }, minWidth: '120px' }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Panel Informasi Utama */}
      <Box component="section" aria-label="Informasi Pengguna">
        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 2,
            bgcolor: blue[500],
            color: 'white'
          }}
        >
          <Typography component="h2" variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
            Selamat Datang, {currentUser?.name || 'Pengguna'}!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Lanjutkan perjalanan hafalan Al-Quran Anda.
          </Typography>
          
          <Typography variant="body2">
            {date}
          </Typography>
        </Paper>
      </Box>
      
      {activeMenu === 'beranda' && (
        <>
          {/* Statistik Ringkasan */}
          <Box component="section" aria-label="Statistik Hafalan">
            <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Ringkasan Hafalan
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statItems.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ borderRadius: 2 }} component="article">
                    <CardContent sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: item.color,
                          color: 'white',
                          width: 50,
                          height: 50,
                          mb: 2,
                          fontSize: '1.5rem'
                        }}
                        role="img"
                        aria-label={`${item.value} ${item.title}`}
                      >
                        {item.value}
                      </Avatar>
                      <Typography component="h3" variant="h6" color="text.secondary">
                        {item.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Target Hafalan */}
          <Box component="section" aria-label="Target Hafalan">
            <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 'bold' }}>
              Target Hafalan
            </Typography>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              {hafalanTargets.map((target, index) => (
                <Box component="article" key={index} sx={{ mb: 2, pb: 2, borderBottom: index !== hafalanTargets.length - 1 ? '1px solid #eee' : 'none' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography component="h3" variant="body1">
                      {target.surah} (Ayat {target.target})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {target.progress}% selesai
                    </Typography>
                  </Box>
                  <Box 
                    sx={{
                      height: 10,
                      width: '100%',
                      bgcolor: '#f0f0f0',
                      borderRadius: 5,
                      overflow: 'hidden'
                    }}
                    role="progressbar"
                    aria-valuenow={target.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${target.progress}%`,
                        bgcolor: target.progress < 30 ? orange[500] : 
                               target.progress < 70 ? blue[500] : green[500]
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Paper>
          </Box>

          {/* Aktivitas Terbaru */}
          <Box component="section" aria-label="Aktivitas Terbaru">
            <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Aktivitas Terbaru
            </Typography>
            
            <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
              <List>
                {recentActivities.map((activity, index) => (
                  <Box component="article" key={activity.id}>
                    <ListItem>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography component="h3" variant="body1" fontWeight="medium">
                              {activity.type === 'hafalan' ? 'Menghafal' : 'Muroja\'ah'} {activity.surah}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.date}
                            </Typography>
                          </Box>
                        }
                        secondary={`Ayat ${activity.ayat}`}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Paper>
          </Box>
          
          {/* Tips Hafalan */}
          <Box component="footer" aria-label="Tips Hafalan">
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(76, 175, 80, 0.05)' }}>
              <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 'medium', textAlign: 'center' }}>
                Tips Hari Ini
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                "Luangkan waktu 20 menit di pagi hari untuk muroja'ah hafalan Anda, dan 20 menit di malam hari untuk menambah hafalan baru."
              </Typography>
            </Paper>
          </Box>
        </>
      )}

      {activeMenu === 'hafalan' && (
        <HafalanManagement recentActivities={recentActivities} />
      )}

      {activeMenu === 'quran' && (
        <QuranBrowser />
      )}

      {activeMenu === 'reminder' && (
        <Box component="section" aria-label="Reminder Muroja'ah">
          <Typography component="h2" variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Reminder Muroja'ah
          </Typography>

          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" color="primary">
                Tambah Reminder
              </Button>
            </Box>
            
            <List>
              {[
                { surah: 'Al-Baqarah', ayat: '1-20', jadwal: 'Setiap Senin, 05:00' },
                { surah: 'Yasin', ayat: '1-83', jadwal: 'Setiap Jumat, 18:30' },
                { surah: 'Ar-Rahman', ayat: '1-78', jadwal: 'Setiap Rabu, 20:00' }
              ].map((reminder, index, arr) => (                <Box key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`${reminder.surah} (Ayat ${reminder.ayat})`}
                      secondary={reminder.jadwal}
                    />
                    <Button size="small" color="primary" style={{ marginRight: '8px' }}>
                      Edit
                    </Button>
                    <Button size="small" color="error">
                      Hapus
                    </Button>
                  </ListItem>
                  {index < arr.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Container>
  );
}

export default Dashboard;
