import React, { useState, useEffect } from 'react';

function FileACL() {
  const [acls, setAcls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFilePath, setNewFilePath] = useState('');
  const [newOperation, setNewOperation] = useState('read');
  const [newFunctionAddress, setNewFunctionAddress] = useState('');

  const operations = ['read', 'write', 'delete', 'execute', 'list'];

  useEffect(() => {
    loadACL();
  }, []);

  const loadACL = async () => {
    try {
      setLoading(true);
      const result = await window.api.getFileACL();
      setAcls(result || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading ACL:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddACL = async () => {
    if (!newFilePath || !newOperation || !newFunctionAddress) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await window.api.setFileACL(newFilePath, newOperation, newFunctionAddress);
      setNewFilePath('');
      setNewOperation('read');
      setNewFunctionAddress('');
      await loadACL();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading file ACL...</div>;
  }

  return (
    <div className="card">
      <h2 className="card-title">File Access Control</h2>
      {error && <div className="error">{error}</div>}

      <div style={{ marginBottom: '2rem' }}>
        <h3>Add New ACL Rule</h3>
        <div className="form-group">
          <label>File Path Pattern</label>
          <input
            type="text"
            placeholder="e.g., C:/Users/*/Documents/* or *.txt"
            value={newFilePath}
            onChange={(e) => setNewFilePath(e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Operation</label>
            <select value={newOperation} onChange={(e) => setNewOperation(e.target.value)}>
              {operations.map((op) => (
                <option key={op} value={op}>
                  {op.charAt(0).toUpperCase() + op.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Authorizing Function</label>
            <input
              type="text"
              placeholder="Function address"
              value={newFunctionAddress}
              onChange={(e) => setNewFunctionAddress(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="button button-primary" onClick={handleAddACL}>
              Add Rule
            </button>
          </div>
        </div>
      </div>

      <h3>ACL Rules</h3>
      {acls.length === 0 ? (
        <p>No ACL rules configured</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>File Path</th>
              <th>Operation</th>
              <th>Authorizing Function</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {acls.map((acl, idx) => (
              <tr key={idx}>
                <td>
                  <code>{acl.file_path}</code>
                </td>
                <td>
                  <span className="badge badge-info">{acl.operation}</span>
                </td>
                <td>
                  <code>{acl.function_address || 'N/A'}</code>
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

export default FileACL;
