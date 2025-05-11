import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Pengguna dummy untuk pengujian frontend tanpa backend
const dummyUsers = [
  {
    id: 1,
    name: 'Pengguna Test',
    email: 'test@example.com',
    password: 'password123'
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(() => {
    // Try to load users from localStorage
    const storedUsers = localStorage.getItem('dummyUsers');
    return storedUsers ? JSON.parse(storedUsers) : dummyUsers;
  });

  useEffect(() => {
    // Check if user is logged in on component mount
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);

  // Save users to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dummyUsers', JSON.stringify(users));
  }, [users]);
  const login = async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user exists
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Create a copy without the password
      const { password, ...userWithoutPassword } = user;
      
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      // Update state
      setCurrentUser(userWithoutPassword);
      return { success: true };
    } else {
      return { 
        success: false, 
        message: 'Invalid email or password'
      };
    }
  };

  const register = async (name, email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password
    };
    
    // Add to dummy users array
    setUsers([...users, newUser]);
    
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
