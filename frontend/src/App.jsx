import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Using a high-quality port image from Unsplash for the login background
const PORT_IMAGE = 'https://images.unsplash.com/photo-1586528116311-ad8ed3c84a0d?q=80&w=2070&auto=format&fit=crop';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [loginError, setLoginError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isLoggedIn) {
      fetchCargos();
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    
    // Simple mock authentication
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use admin / admin');
    }
  };

  const fetchCargos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/cargo`);
      setCargos(response.data);
      setOfflineMode(false);
    } catch (error) {
      console.warn('Backend not reachable, switching to Offline Mode (Mock Data)');
      setOfflineMode(true);
      
      // Use local storage fallback for GitHub Pages demo
      const localData = localStorage.getItem('nmpa_cargos');
      if (localData) {
        setCargos(JSON.parse(localData));
      } else {
        const defaultData = [
          { _id: '1', cargoId: 'C-9281', shipName: 'NMPA Voyager', arrivalDate: new Date(), riskLevel: 'Pending', status: 'Data Entry' }
        ];
        setCargos(defaultData);
        localStorage.setItem('nmpa_cargos', JSON.stringify(defaultData));
      }
    }
    setLoading(false);
  };

  const updateLocalCargos = (newCargos) => {
    setCargos(newCargos);
    localStorage.setItem('nmpa_cargos', JSON.stringify(newCargos));
  };

  const evaluateRisk = async (id) => {
    if (offlineMode) {
      const updated = cargos.map(c => {
        if (c._id === id) {
          return { ...c, riskLevel: Math.random() > 0.5 ? 'High' : 'Low', status: 'Cargo Triage' };
        }
        return c;
      });
      updateLocalCargos(updated);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/cargo/${id}/evaluate`);
      fetchCargos();
    } catch (error) {
      console.error('Error evaluating risk:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (offlineMode) {
      const updated = cargos.map(c => c._id === id ? { ...c, status: newStatus } : c);
      updateLocalCargos(updated);
      return;
    }

    try {
      await axios.put(`${API_URL}/api/cargo/${id}`, { status: newStatus });
      fetchCargos();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const addDummyCargo = async () => {
    const newCargo = {
      cargoId: `C-${Math.floor(Math.random() * 10000)}`,
      shipName: 'Oceanic Express',
      arrivalDate: new Date(),
      manifestDetails: 'Electronics, Auto Parts',
      documentsValid: true
    };

    if (offlineMode) {
      newCargo._id = Date.now().toString();
      newCargo.riskLevel = 'Pending';
      newCargo.status = 'Data Entry';
      updateLocalCargos([newCargo, ...cargos]);
      return;
    }

    try {
      await axios.post(`${API_URL}/api/cargo`, newCargo);
      fetchCargos();
    } catch (error) {
      console.error('Error adding cargo:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container" style={{ backgroundImage: `url(${PORT_IMAGE})` }}>
        <div className="login-overlay"></div>
        <div className="login-box">
          <h2>NMPA Smart Cargo System</h2>
          <p>Sign in to access the Inspector Portal</p>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>
              <input type="text" name="username" defaultValue="admin" required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" defaultValue="admin" required />
            </div>
            {loginError && <p className="error-text">{loginError}</p>}
            <button type="submit" className="btn primary full-width">Login</button>
          </form>
          <p className="login-hint">Hint: Use admin / admin to login</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>NMPA Smart Cargo Inspection System</h1>
            <p>Inspector Portal</p>
          </div>
          <div className="header-actions">
            {offlineMode && <span className="offline-badge">Offline Mode (Demo)</span>}
            <button className="btn sm logout-btn" onClick={() => setIsLoggedIn(false)}>Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="controls">
          <button className="btn primary" onClick={addDummyCargo}>+ Simulate Cargo Arrival</button>
        </div>

        {loading ? (
          <p>Loading cargo data...</p>
        ) : (
          <div className="table-responsive">
            <table className="cargo-table">
              <thead>
                <tr>
                  <th>Cargo ID</th>
                  <th>Ship Name</th>
                  <th>Arrival Date</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cargos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No cargo found</td>
                  </tr>
                ) : (
                  cargos.map((cargo) => (
                    <tr key={cargo._id} className={`risk-${cargo.riskLevel.toLowerCase()}`}>
                      <td>{cargo.cargoId}</td>
                      <td>{cargo.shipName}</td>
                      <td>{new Date(cargo.arrivalDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge risk-${cargo.riskLevel.toLowerCase()}`}>
                          {cargo.riskLevel}
                        </span>
                      </td>
                      <td>{cargo.status}</td>
                      <td>
                        {cargo.status === 'Data Entry' && (
                          <button className="btn sm" onClick={() => evaluateRisk(cargo._id)}>
                            Run AI Risk Evaluation
                          </button>
                        )}
                        {cargo.status === 'Cargo Triage' && (
                          <button className="btn sm" onClick={() => updateStatus(cargo._id, 'Focused Inspection')}>
                            Assign Inspection
                          </button>
                        )}
                        {cargo.status === 'Focused Inspection' && (
                          <button className="btn sm" onClick={() => updateStatus(cargo._id, 'Disposition')}>
                            Complete Inspection
                          </button>
                        )}
                        {cargo.status === 'Disposition' && (
                          <span style={{color: '#666'}}>Archived</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
