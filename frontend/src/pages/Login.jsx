import { useState } from 'react';
import axios from 'axios';

const PORT_IMAGE = 'https://images.unsplash.com/photo-1586528116311-ad8ed3c84a0d?q=80&w=2070&auto=format&fit=crop';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Hardcoded Admin check for demonstration
    if (username === 'admin' && password === 'Admin@123') {
      onLogin('mock-jwt-token-admin', 'admin');
      return;
    } else if (username === 'inspector' && password === 'inspector') {
      onLogin('mock-jwt-token-inspector', 'inspector');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: username,
        password: password // Fallback if backend expects password now
      });
      onLogin(res.data.token, res.data.role);
    } catch (err) {
      setError('Invalid credentials. Use admin / Admin@123');
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${PORT_IMAGE})` }}>
      <div className="login-overlay"></div>
      <div className="login-box">
        <h2>Welcome to NMPA</h2>
        <p>Smart Cargo Inspection System</p>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              placeholder="Enter username" 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Enter password" 
            />
          </div>
          {error && <p style={{color: '#de350b', fontSize: '14px', marginBottom: '16px', textAlign: 'left'}}>{error}</p>}
          <button type="submit" className="btn primary full-width">Sign In</button>
        </form>
      </div>
    </div>
  );
}
