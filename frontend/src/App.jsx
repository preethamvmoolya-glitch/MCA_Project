import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  }, [token, role]);

  const handleLogin = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        {/* Layer 1: Inspector Dashboard */}
        <Route 
          path="/" 
          element={token ? <Dashboard role={role} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        
        {/* Layer 1: Admin Panel */}
        <Route 
          path="/admin" 
          element={token && role === 'admin' ? <Admin onLogout={handleLogout} /> : <Navigate to="/" />} 
        />
      </Routes>
    </div>
  );
}

export default App;
