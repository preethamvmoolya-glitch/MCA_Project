import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PORT_IMAGE = 'https://images.unsplash.com/photo-1586528116311-ad8ed3c84a0d?q=80&w=2070&auto=format&fit=crop';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [totp, setTotp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid Google email.');
      return;
    }
    setError('');
    setStep(2); // Move to TOTP 2FA step
  };

  const handleTotpVerify = async (e) => {
    e.preventDefault();
    try {
      // Layer 2: Auth (Mock API call to Flask)
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: email,
        totp_code: totp
      });
      // JWT session token issued
      onLogin(res.data.token, res.data.role);
    } catch (err) {
      console.warn("Backend not running, falling back to mock login.");
      // Fallback for Github Pages demo
      const mockRole = email.includes('admin') ? 'admin' : 'inspector';
      onLogin('mock-jwt-token-12345', mockRole);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${PORT_IMAGE})` }}>
      <div className="login-overlay"></div>
      <div className="login-box">
        <h2>NMPA Auth</h2>
        <p>Layer 2 — Authentication & Authorisation</p>
        
        {step === 1 && (
          <form onSubmit={handleGoogleSignIn}>
            <div className="input-group">
              <label>Google Email (OAuth Simulator)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="inspector@nmpa.gov.in" />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="btn primary full-width">Continue with Google</button>
            <p className="login-hint">Hint: Use 'admin@nmpa.gov.in' for Admin Panel access</p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleTotpVerify}>
            <div className="input-group">
              <label>Google Authenticator (TOTP)</label>
              <input type="text" value={totp} onChange={e => setTotp(e.target.value)} required placeholder="123456" maxLength="6" />
            </div>
            <button type="submit" className="btn primary full-width">Verify 2FA & Login</button>
            <button type="button" className="btn sm" style={{marginTop: '10px'}} onClick={() => setStep(1)}>Back</button>
          </form>
        )}
      </div>
    </div>
  );
}
