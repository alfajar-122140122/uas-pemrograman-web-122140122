import { useAuth } from '../context/AuthContext';
import { Typography, Box, Button, Container, Paper, Grid, Card, CardContent, Avatar } from '@mui/material';
import { useState } from 'react';
import { blue, green, orange, red } from '@mui/material/colors';

function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [date] = useState(new Date().toLocaleDateString('id-ID', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }));

  const handleLogout = () => {
    logout();
  };

  // Data statistik dummy
  const statItems = [
    { title: 'Total Tugas', value: '24', color: blue[500], bgColor: blue[50] },
    { title: 'Selesai', value: '18', color: green[500], bgColor: green[50] },
    { title: 'Dalam Proses', value: '4', color: orange[500], bgColor: orange[50] },
    { title: 'Belum Dimulai', value: '2', color: red[500], bgColor: red[50] }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" fontWeight="bold">
            Dasbor
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleLogout}
          >
            Keluar
          </Button>
        </Box>

        {/* Kartu Selamat Datang */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
            Selamat Datang, {currentUser?.name || 'Pengguna'}!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
            Anda telah berhasil masuk ke dalam sistem.
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {date}
          </Typography>
        </Paper>
        
        {/* Data Statistik */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Ringkasan Aktivitas
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', borderRadius: 2 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: item.bgColor, 
                      color: item.color,
                      width: 56,
                      height: 56,
                      mb: 2
                    }}
                  >
                    {item.value}
                  </Avatar>
                  <Typography variant="h6" color="text.secondary" fontWeight="medium">
                    {item.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Informasi Demo */}
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Ini adalah versi demo dasbor. Integrasi backend akan diimplementasikan nanti.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Dashboard;
