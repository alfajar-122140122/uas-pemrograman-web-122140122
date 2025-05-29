import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Quran from './pages/Quran';
import Reminder from './pages/Reminder';
import Chart from './pages/Chart';
import Login from './pages/Login';
import HafalanForm from './components/HafalanForm';
import AuthCheck from './components/AuthCheck';
import useAuthStore from './hooks/useAuth';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define a theme to apply Poppins font globally to MUI components
const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
    // Initialize auth state on app load
    initAuth();
  }, [initAuth]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/quran" element={<Quran />} />

            {/* Protected routes - require authentication */}
            <Route 
              path="/" 
              element={<Dashboard />} 
            />
            <Route 
              path="/reminder" 
              element={
                <AuthCheck>
                  <Reminder />
                </AuthCheck>
              } 
            />
            <Route 
              path="/chart" 
              element={
                <AuthCheck>
                  <Chart />
                </AuthCheck>
              } 
            />
            <Route 
              path="/hafalan/new" 
              element={
                <AuthCheck>
                  <HafalanForm />
                </AuthCheck>
              } 
            />
            <Route 
              path="/hafalan/edit/:id" 
              element={
                <AuthCheck>
                  <HafalanForm />
                </AuthCheck>
              } 
            />
            {/* Add a 404 Not Found page if desired */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
