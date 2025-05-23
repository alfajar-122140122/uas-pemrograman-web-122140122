import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Import the Layout component
import Dashboard from './pages/Dashboard';
import Quran from './pages/Quran';
import Reminder from './pages/Reminder';
import Chart from './pages/Chart';
import Login from './pages/Login';
import HafalanForm from './components/HafalanForm'; // Assuming this will be a shared component
// import useAuthStore from './hooks/useAuth'; // To check auth status on load if needed

function App() {
  // const checkAuth = useAuthStore(state => state.checkAuth); // Example if you add checkAuth
  // useEffect(() => {
  //  checkAuth(); // Check auth status when app loads
  // }, [checkAuth]);

  return (
    <Router>
      <Layout> {/* Wrap all routes with the Layout component */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/chart" element={<Chart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hafalan/new" element={<HafalanForm />} />
          <Route path="/hafalan/edit/:id" element={<HafalanForm />} />
          {/* Add a 404 Not Found page if desired */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
