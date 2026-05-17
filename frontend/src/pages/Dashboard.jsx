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
      // Mock Layer 4: Cargo mgmt
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
      // Mock Layer 4: Doc upload (GridFS/S3)
      const updated = cargos.map(c => c._id === cargoId ? { ...c, documents: [...c.documents, 'Uploaded Doc (GridFS)'] } : c);
      saveLocal(updated);
    }
  };

  const runAIEngine = async (cargoId) => {
    try {
      await axios.post(`${API_URL}/api/cargo/${cargoId}/evaluate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchCargos();
    } catch (err) {
      // Mock Layer 5: AI inspection engine
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
    alert("Layer 4 & 8: Generating PDF/CSV inspection summary...");
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Layer 1 — Inspector Dashboard</h1>
            <p>Role: {role.toUpperCase()}</p>
          </div>
          <div className="header-actions">
            {role === 'admin' && <Link to="/admin" className="btn sm" style={{background: '#6f42c1', color: 'white'}}>Admin Panel</Link>}
            <button className="btn sm logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="cargo-entry-form">
          <h3>Workflow Step 3: Cargo Data Entry</h3>
          <form onSubmit={handleCargoEntry} style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
            <input name="shipmentId" placeholder="Shipment ID (e.g. S-100)" required />
            <input name="cargoType" placeholder="Cargo Type (e.g. Electronics)" required />
            <input name="originPort" placeholder="Origin Port (e.g. Dubai)" required />
            <input name="vesselName" placeholder="Vessel Name" required />
            <input name="arrivalDate" type="date" required />
            <button type="submit" className="btn primary">Add Cargo</button>
          </form>
        </section>

        <section className="cargo-list" style={{marginTop: '30px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>Workflow Step 4-7: Inspection Pipeline</h3>
            <button onClick={generateReport} className="btn primary">Generate Report</button>
          </div>
          
          <table className="cargo-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Type & Origin</th>
                <th>Docs</th>
                <th>Risk (Layer 5 AI)</th>
                <th>Status (Decision)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cargos.map(c => (
                <tr key={c._id} className={`risk-${c.riskLevel?.toLowerCase()}`}>
                  <td>{c.shipmentId}</td>
                  <td>{c.cargoType} <br/><small>{c.originPort}</small></td>
                  <td>{c.documents?.length} files</td>
                  <td>
                    <span className={`badge risk-${c.riskLevel?.toLowerCase()}`}>{c.riskLevel}</span>
                  </td>
                  <td>{c.status}</td>
                  <td>
                    <button className="btn sm" onClick={() => handleDocUpload(c._id)}>Upload Doc</button>
                    {c.status === 'Data Entry' && (
                      <button className="btn sm primary" style={{marginLeft:'5px'}} onClick={() => runAIEngine(c._id)}>
                        Run AI Rules
                      </button>
                    )}
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
