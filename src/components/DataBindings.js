import React, { useState, useEffect } from 'react';

function DataBindings() {
  const [bindings, setBindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDataId, setNewDataId] = useState('');
  const [newFunctionAddress, setNewFunctionAddress] = useState('');

  useEffect(() => {
    loadBindings();
  }, []);

  const loadBindings = async () => {
    try {
      setLoading(true);
      const result = await window.api.getBindings();
      setBindings(result || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading bindings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBinding = async () => {
    if (!newDataId || !newFunctionAddress) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await window.api.setBinding(newDataId, newFunctionAddress);
      setNewDataId('');
      setNewFunctionAddress('');
      await loadBindings();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading bindings...</div>;
  }

  return (
    <div className="card">
      <h2 className="card-title">Data Bindings</h2>
      {error && <div className="error">{error}</div>}

      <div style={{ marginBottom: '2rem' }}>
        <h3>Add New Binding</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Data ID"
            value={newDataId}
            onChange={(e) => setNewDataId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Function Address"
            value={newFunctionAddress}
            onChange={(e) => setNewFunctionAddress(e.target.value)}
          />
          <button className="button button-primary" onClick={handleAddBinding}>
            Add
          </button>
        </div>
      </div>

      <h3>Existing Bindings</h3>
      {bindings.length === 0 ? (
        <p>No bindings configured</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Data ID</th>
              <th>Function Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bindings.map((binding, idx) => (
              <tr key={idx}>
                <td>
                  <code>{binding.data_id}</code>
                </td>
                <td>
                  <code>{binding.function_address}</code>
                </td>
                <td>
                  <button className="button button-secondary" onClick={() => alert('Edit feature coming soon')}>
                    Edit
                  </button>
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

export default DataBindings;
