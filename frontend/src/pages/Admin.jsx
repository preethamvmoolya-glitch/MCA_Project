import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Admin({ onLogout }) {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/audit`, { headers: { Authorization: `Bearer ${token}` } });
        setLogs(res.data);
      } catch (err) {
        setLogs([
          { _id: '1', user: 'system', action: 'INIT', details: 'Offline mode active - no live audit logs available', timestamp: new Date().toISOString() }
        ]);
      }
    };
    fetchLogs();
  }, [token]);

  return (
    <div className="container">
      <header className="header" style={{backgroundColor: '#6f42c1'}}>
        <div className="header-content">
          <div>
            <h1>Layer 1 — Admin Panel</h1>
            <p>Layer 9 Workflow — Admin oversight</p>
          </div>
          <div className="header-actions">
            <Link to="/" className="btn sm" style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}>Back to Dashboard</Link>
            <button className="btn sm logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <h3>System Analytics & Data Persistence (Layer 6)</h3>
        <div style={{display: 'flex', gap: '20px', marginBottom: '30px'}}>
          <div style={{padding: '20px', background: '#f8f9fa', borderRadius: '8px', flex: 1, border: '1px solid #ddd'}}>
            <h4>MongoDB Atlas Storage</h4>
            <p>Collections active: <strong>cargo, users, logs</strong></p>
          </div>
          <div style={{padding: '20px', background: '#f8f9fa', borderRadius: '8px', flex: 1, border: '1px solid #ddd'}}>
            <h4>Cloud File Storage</h4>
            <p>GridFS / S3 bucket: <strong>Active</strong></p>
          </div>
        </div>

        <h3>Full Audit Trail</h3>
        <table className="cargo-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.user}</td>
                <td><strong>{log.action}</strong></td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
