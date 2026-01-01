import React, { useState, useEffect } from 'react';

function ProcessMapper() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProcessName, setNewProcessName] = useState('');
  const [newFunctionAddress, setNewFunctionAddress] = useState('');

  useEffect(() => {
    loadMappings();
  }, []);

  const loadMappings = async () => {
    try {
      setLoading(true);
      const result = await window.api.getProcessMappings();
      setMappings(result || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading process mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMapping = async () => {
    if (!newProcessName || !newFunctionAddress) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await window.api.setProcessMapping(newProcessName, newFunctionAddress);
      setNewProcessName('');
      setNewFunctionAddress('');
      await loadMappings();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading process mappings...</div>;
  }

  return (
    <div className="card">
      <h2 className="card-title">Process Mapper</h2>
      {error && <div className="error">{error}</div>}

      <div style={{ marginBottom: '2rem' }}>
        <h3>Add Process to Function Mapping</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Process name (e.g., notepad.exe)"
            value={newProcessName}
            onChange={(e) => setNewProcessName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Function address"
            value={newFunctionAddress}
            onChange={(e) => setNewFunctionAddress(e.target.value)}
          />
          <button className="button button-primary" onClick={handleAddMapping}>
            Add Mapping
          </button>
        </div>
      </div>

      <h3>Process Mappings</h3>
      {mappings.length === 0 ? (
        <p>No process mappings configured</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Process Name</th>
              <th>Function Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping, idx) => (
              <tr key={idx}>
                <td>
                  <code>{mapping.process_name}</code>
                </td>
                <td>
                  <code>{mapping.function_address}</code>
                </td>
                <td>
                  <button className="button button-secondary">Edit</button>
                  <button className="button button-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProcessMapper;
