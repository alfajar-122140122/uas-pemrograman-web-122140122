import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Menampilkan status loading saat memeriksa autentikasi
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Memuat...
        </Typography>
      </Box>
    );
  }

  // Mengalihkan ke halaman login jika belum terautentikasi
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  // Menampilkan komponen jika sudah terautentikasi
  return children;
}

export default ProtectedRoute;
