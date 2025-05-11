import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './App.css'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

// Tema kustom
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#1976d2',
    }
  },
  shape: {
    borderRadius: 8
  }
})

function App() {
  const { currentUser } = useAuth()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Rute publik */}
        <Route path="/login" element={
          currentUser ? <Navigate to="/dashboard" /> : <Login />
        } />
        <Route path="/register" element={
          currentUser ? <Navigate to="/dashboard" /> : <Register />
        } />
        
        {/* Rute terproteksi */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Rute default */}
        <Route path="/" element={
          currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        } />
      </Routes>
    </ThemeProvider>
  )
}

export default App
