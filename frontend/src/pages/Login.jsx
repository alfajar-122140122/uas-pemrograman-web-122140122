import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import useStore from '../store/useStore'; // Assuming zustand store for auth

const Login = () => {
  const navigate = useNavigate();
  // const loginUser = useStore(state => state.login); // Zustand action
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false); // Toggle between login and register
  const [name, setName] = useState(''); // For registration
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        // await api.post('/auth/register', { name, email, password });
        console.log("Registering user:", { name, email, password }); // Placeholder
        // Show success message, maybe auto-login or redirect to login
        alert('Registrasi berhasil! Silakan login.');
        setIsRegister(false); // Switch to login form
      } else {
        // const response = await api.post('/auth/login', { email, password });
        // const { token, user } = response.data;
        // localStorage.setItem('token', token);
        // loginUser(user); // Update zustand store
        console.log("Logging in user:", { email, password }); // Placeholder
        localStorage.setItem('token', 'fake-jwt-token'); // Mock token
        // loginUser({ name: 'Nama Pengguna', email }); // Mock user
        navigate('/'); // Redirect to dashboard
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || `Gagal ${isRegister ? 'registrasi' : 'login'}. Silakan coba lagi.`);
      // Show error toast/alert
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-lg rounded-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Buat Akun Baru' : 'Login ke Akun Anda'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
          {isRegister && (
            <div className="rounded-2xl shadow-sm -space-y-px">
              <div>
                <label htmlFor="name" className="sr-only">Nama Lengkap</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-2xl focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Nama Lengkap"
                />
              </div>
            </div>
          )}
          <div className="rounded-2xl shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Alamat Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isRegister ? '' : 'rounded-t-2xl'} focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm`}
                placeholder="Alamat Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-2xl focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isRegister ? 'Daftar' : 'Login'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="font-medium text-green-600 hover:text-green-500"
          >
            {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
