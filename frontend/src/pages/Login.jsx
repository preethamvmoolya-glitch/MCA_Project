import { useState } from 'react';
import axios from 'axios';
import { Anchor } from 'lucide-react'; // Using an anchor icon for the port theme

const PORT_IMAGE = 'https://images.unsplash.com/photo-1586528116311-ad8ed3c84a0d?q=80&w=2070&auto=format&fit=crop';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for realistic feel
    setTimeout(async () => {
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
          password: password 
        });
        onLogin(res.data.token, res.data.role);
      } catch (err) {
        setError('Invalid username or password. Please try again.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${PORT_IMAGE})` }}>
      <div className="login-overlay"></div>
      <div className="login-box">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ background: '#0052cc', padding: '12px', borderRadius: '50%', color: 'white' }}>
            <Anchor size={32} />
          </div>
        </div>
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
              placeholder="Enter your registered username" 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Enter your secure password" 
            />
          </div>
          {error && <p style={{color: '#de350b', fontSize: '14px', marginBottom: '16px', textAlign: 'left', fontWeight: '500'}}>{error}</p>}
          <button type="submit" className="btn primary full-width" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
