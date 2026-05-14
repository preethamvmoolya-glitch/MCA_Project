import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchCargos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cargo`);
      setCargos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cargos:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const evaluateRisk = async (id) => {
    try {
      await axios.post(`${API_URL}/api/cargo/${id}/evaluate`);
      fetchCargos(); // Refresh list
    } catch (error) {
      console.error('Error evaluating risk:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
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
      shipName: 'NMPA Express',
      arrivalDate: new Date(),
      manifestDetails: 'Electronics, Auto Parts',
      documentsValid: true
    };
    try {
      await axios.post(`${API_URL}/api/cargo`, newCargo);
      fetchCargos();
    } catch (error) {
      console.error('Error adding cargo:', error);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>NMPA Smart Cargo Inspection System</h1>
        <p>Inspector Portal</p>
      </header>

      <main className="main-content">
        <div className="controls">
          <button className="btn primary" onClick={addDummyCargo}>Simulate Cargo Arrival</button>
        </div>

        {loading ? (
          <p>Loading cargo data...</p>
        ) : (
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
              {cargos.map((cargo) => (
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
                      <span>Archived</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

export default App;
