import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Container, Alert, Paper } from '@mui/material';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi harus minimal 6 karakter");
      setLoading(false);
      return;
    }

    try {
      const result = await register(name, email, password);
      
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message === 'User with this email already exists' 
          ? 'Email sudah terdaftar' 
          : 'Gagal membuat akun. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Gagal membuat akun. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container component="main" maxWidth="sm">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
          Daftar
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2, width: '100%', borderRadius: 1 }}>
          Pendaftaran berhasil! Mengalihkan ke halaman masuk...
        </Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Nama Lengkap"
            name="name"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Alamat Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Kata Sandi"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Konfirmasi Kata Sandi"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ 
              mt: 4, 
              mb: 2,
              py: 1.5,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
            disabled={loading || success}
          >
            {loading ? 'Sedang Mendaftar...' : 'Daftar'}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body1">
              Sudah memiliki akun?{' '}
              <Link to="/login" style={{ 
                textDecoration: 'none',
                fontWeight: 'bold',
                color: '#1976d2'
              }}>
                Masuk
              </Link>
            </Typography>          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
