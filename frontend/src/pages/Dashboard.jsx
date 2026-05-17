import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard({ role, onLogout }) {
  const [cargos, setCargos] = useState([]);
  const token = localStorage.getItem('token');

  const fetchCargos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cargo`, { headers: { Authorization: `Bearer ${token}` } });
      setCargos(res.data);
    } catch (err) {
      console.warn("Backend not reached, using local mock state");
      const local = JSON.parse(localStorage.getItem('mock_cargos') || '[]');
      setCargos(local);
    }
  };

  useEffect(() => { fetchCargos(); }, []);

  const saveLocal = (data) => {
    setCargos(data);
    localStorage.setItem('mock_cargos', JSON.stringify(data));
  };

  const handleCargoEntry = async (e) => {
    e.preventDefault();
    const newCargo = {
      shipmentId: e.target.shipmentId.value,
      cargoType: e.target.cargoType.value,
      originPort: e.target.originPort.value,
      vesselName: e.target.vesselName.value,
      arrivalDate: e.target.arrivalDate.value,
    };

    try {
      await axios.post(`${API_URL}/api/cargo`, newCargo, { headers: { Authorization: `Bearer ${token}` } });
      fetchCargos();
    } catch (err) {
      newCargo._id = Date.now().toString();
      newCargo.documents = [];
      newCargo.riskLevel = 'Pending';
      newCargo.status = 'Data Entry';
      saveLocal([...cargos, newCargo]);
    }
    e.target.reset();
  };

  const handleDocUpload = async (cargoId) => {
    try {
      await axios.post(`${API_URL}/api/cargo/${cargoId}/document`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchCargos();
    } catch (err) {
      const updated = cargos.map(c => c._id === cargoId ? { ...c, documents: [...c.documents, 'Uploaded Doc'] } : c);
      saveLocal(updated);
    }
  };

  const runAIEngine = async (cargoId) => {
    try {
      await axios.post(`${API_URL}/api/cargo/${cargoId}/evaluate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchCargos();
    } catch (err) {
      const updated = cargos.map(c => {
        if (c._id === cargoId) {
          let score = 0;
          if (c.cargoType.toLowerCase().includes('hazard')) score += 50;
          if (c.originPort.toLowerCase().includes('unknown')) score += 40;
          if (c.documents.length === 0) score += 30;
          
          let risk = score >= 70 ? 'High' : (score >= 30 ? 'Medium' : 'Low');
          let status = risk === 'High' ? 'Detain cargo' : (risk === 'Medium' ? 'Secondary inspection' : 'Expedite');
          
          return { ...c, riskLevel: risk, status: status };
        }
        return c;
      });
      saveLocal(updated);
    }
  };

  const generateReport = () => {
    alert("Generating PDF/CSV inspection summary...");
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Inspector Dashboard</h1>
            <p>Welcome back! You are logged in as <strong>{role.toUpperCase()}</strong></p>
          </div>
          <div className="header-actions">
            {role === 'admin' && (
              <Link to="/admin" className="btn sm" style={{background: '#0052cc', color: 'white', padding: '10px 16px', fontSize: '14px', borderRadius: '8px'}}>
                Admin Panel
              </Link>
            )}
            <button className="btn sm logout-btn" style={{padding: '10px 16px', fontSize: '14px', borderRadius: '8px'}} onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="cargo-entry-form">
          <h3>Register New Cargo Manifest</h3>
          <form onSubmit={handleCargoEntry}>
            <input name="shipmentId" placeholder="Shipment ID (e.g. S-100)" required />
            <input name="cargoType" placeholder="Cargo Type (e.g. Electronics)" required />
            <input name="originPort" placeholder="Origin Port (e.g. Dubai)" required />
            <input name="vesselName" placeholder="Vessel Name" required />
            <input name="arrivalDate" type="date" required />
            <button type="submit" className="btn primary">Register Cargo</button>
          </form>
        </section>

        <section className="cargo-list">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{margin: 0}}>Inspection Pipeline</h3>
            <button onClick={generateReport} className="btn sm">Download Report</button>
          </div>
          
          <table className="cargo-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Cargo Details</th>
                <th>Documents</th>
                <th>AI Risk Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cargos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', color: '#5e6c84', padding: '30px'}}>No cargo data available.</td>
                </tr>
              ) : cargos.map(c => (
                <tr key={c._id} className={`risk-${c.riskLevel?.toLowerCase()}`}>
                  <td><strong>{c.shipmentId}</strong></td>
                  <td>
                    <div style={{fontWeight: 500, color: '#172b4d'}}>{c.cargoType}</div>
                    <div style={{fontSize: '12px', color: '#5e6c84'}}>From: {c.originPort}</div>
                  </td>
                  <td>{c.documents?.length} files</td>
                  <td>
                    <span className={`badge risk-${c.riskLevel?.toLowerCase()}`}>{c.riskLevel}</span>
                  </td>
                  <td style={{fontWeight: 500}}>{c.status}</td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button className="btn sm" onClick={() => handleDocUpload(c._id)}>Add Doc</button>
                      {c.status === 'Data Entry' && (
                        <button className="btn sm primary" onClick={() => runAIEngine(c._id)}>
                          Evaluate Risk
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
