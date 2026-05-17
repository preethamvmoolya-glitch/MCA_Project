import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, Ship, FileText, Activity, CheckCircle, Search, ShieldAlert, LogOut } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard({ role, onLogout }) {
  const [cargos, setCargos] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const token = localStorage.getItem('token');

  const fetchCargos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/cargo`, { headers: { Authorization: `Bearer ${token}` } });
      setCargos(res.data);
    } catch (err) {
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
      saveLocal([newCargo, ...cargos]); // Add to top
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
    setIsProcessing(true);
    // Simulate AI processing time for UX
    setTimeout(async () => {
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
            let status = risk === 'High' ? 'Detain Cargo' : (risk === 'Medium' ? 'Secondary Inspection' : 'Expedite');
            
            return { ...c, riskLevel: risk, status: status };
          }
          return c;
        });
        saveLocal(updated);
      }
      setIsProcessing(false);
    }, 1000);
  };

  const generateReport = () => {
    alert("Generating official NMPA PDF inspection summary...");
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ background: '#f4f5f7', padding: '10px', borderRadius: '8px', color: '#0052cc' }}>
              <Ship size={28} />
            </div>
            <div>
              <h1>New Mangalore Port Authority</h1>
              <p>Smart Cargo Operations & Inspection Portal</p>
            </div>
          </div>
          <div className="header-actions">
            {role === 'admin' && (
              <Link to="/admin" className="btn sm" style={{background: '#0052cc', color: 'white', padding: '10px 16px', fontSize: '14px', borderRadius: '8px'}}>
                <ShieldAlert size={16} style={{display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom'}}/> 
                Admin Console
              </Link>
            )}
            <button className="btn sm logout-btn" style={{padding: '10px 16px', fontSize: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px'}} onClick={onLogout}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="cargo-entry-form">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Package size={20} color="#0052cc" />
            <h3 style={{ margin: 0 }}>Vessel Pre-Arrival Notice</h3>
          </div>
          <p style={{ fontSize: '14px', color: '#5e6c84', marginBottom: '20px' }}>Enter 72-hour advance cargo manifest details to initiate the inspection pipeline.</p>
          <form onSubmit={handleCargoEntry}>
            <input name="shipmentId" placeholder="Shipment ID (e.g. S-100)" required />
            <input name="cargoType" placeholder="Cargo Type (e.g. Electronics)" required />
            <input name="originPort" placeholder="Origin Port (e.g. Dubai)" required />
            <input name="vesselName" placeholder="Vessel Name" required />
            <input name="arrivalDate" type="date" required />
            <button type="submit" className="btn primary">Submit Manifest</button>
          </form>
        </section>

        <section className="cargo-list">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#0052cc" />
              <h3 style={{margin: 0}}>Live Inspection Pipeline</h3>
            </div>
            <button onClick={generateReport} className="btn sm" style={{ display: 'flex', alignItems: 'center', gap: '6px'}}>
              <FileText size={16} /> Download Summary Report
            </button>
          </div>
          
          <table className="cargo-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Cargo Details</th>
                <th>Documents</th>
                <th>AI Risk Score</th>
                <th>Pipeline Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cargos.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', color: '#5e6c84', padding: '40px'}}>
                    <Search size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <br/>
                    No cargo manifests currently in the pipeline.
                  </td>
                </tr>
              ) : cargos.map(c => (
                <tr key={c._id} className={`risk-${c.riskLevel?.toLowerCase()}`}>
                  <td><strong>{c.shipmentId}</strong></td>
                  <td>
                    <div style={{fontWeight: 500, color: '#172b4d'}}>{c.cargoType}</div>
                    <div style={{fontSize: '12px', color: '#5e6c84'}}>Vessel: {c.vesselName} | Origin: {c.originPort}</div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: c.documents?.length > 0 ? '#00875a' : '#ff991f' }}>
                      <FileText size={14} /> {c.documents?.length} files
                    </span>
                  </td>
                  <td>
                    <span className={`badge risk-${c.riskLevel?.toLowerCase()}`}>{c.riskLevel}</span>
                  </td>
                  <td style={{fontWeight: 500}}>
                    {c.status === 'Data Entry' && <span style={{color: '#5e6c84'}}>Awaiting AI Scrutiny</span>}
                    {c.status === 'Expedite' && <span style={{color: '#00875a', display: 'flex', alignItems: 'center', gap:'4px'}}><CheckCircle size={14}/> Berth Cleared</span>}
                    {c.status === 'Secondary Inspection' && <span style={{color: '#ff991f'}}>Targeted Physical Check</span>}
                    {c.status === 'Detain Cargo' && <span style={{color: '#de350b', display: 'flex', alignItems: 'center', gap:'4px'}}><ShieldAlert size={14}/> Full Inspection Required</span>}
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button className="btn sm" onClick={() => handleDocUpload(c._id)} title="Upload Bill of Lading / Manifest">Add Doc</button>
                      {c.status === 'Data Entry' && (
                        <button className="btn sm primary" onClick={() => runAIEngine(c._id)} disabled={isProcessing}>
                          {isProcessing ? 'Analyzing...' : 'Run AI Evaluation'}
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
