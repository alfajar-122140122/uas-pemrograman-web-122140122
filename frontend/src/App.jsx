import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Import the Layout component
import Dashboard from './pages/Dashboard';
import Quran from './pages/Quran';
import Reminder from './pages/Reminder';
import Chart from './pages/Chart';
import Login from './pages/Login';
import HafalanForm from './components/HafalanForm'; // Assuming this will be a shared component
import AuthCheck from './components/AuthCheck'; // Import the AuthCheck component
import useAuthStore from './hooks/useAuth'; // To check auth status on load

function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  
  useEffect(() => {
    // Initialize auth state on app load
    initAuth();
  }, [initAuth]);
  return (
    <Router>
      <Layout> {/* Wrap all routes with the Layout component */}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/quran" element={<Quran />} />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/" 
            element={
              <Dashboard />
            } 
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
  );
}

export default App;
