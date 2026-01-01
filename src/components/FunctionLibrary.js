import React, { useState, useEffect } from 'react';

function FunctionLibrary() {
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFunc, setSelectedFunc] = useState(null);
  const [callArgs, setCallArgs] = useState('{}');
  const [callResult, setCallResult] = useState(null);

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    try {
      setLoading(true);
      const result = await window.api.getFunctions();
      setFunctions(result || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading functions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallFunction = async () => {
    if (!selectedFunc) return;

    try {
      let args = {};
      try {
        args = JSON.parse(callArgs);
      } catch (e) {
        setError('Invalid JSON in arguments');
        return;
      }

      const result = await window.api.callFunction(selectedFunc.address, args);
      setCallResult(result);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading function library...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2 className="card-title">Function Library</h2>
        {error && <div className="error">{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <h3>Available Functions</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
              {functions.length === 0 ? (
                <div style={{ padding: '1rem', color: '#999' }}>No functions found</div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {functions.map((func, idx) => (
                    <li
                      key={idx}
                      onClick={() => setSelectedFunc(func)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        background: selectedFunc?.address === func.address ? '#f0f0f0' : 'transparent',
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{func.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{func.address}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            {selectedFunc && (
              <>
                <h3>Function Details</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={selectedFunc.name} disabled />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input type="text" value={selectedFunc.address} disabled />
                </div>
                <div className="form-group">
                  <label>Purpose</label>
                  <input type="text" value={selectedFunc.purpose || 'N/A'} disabled />
                </div>
                <div className="form-group">
                  <label>Arguments (JSON)</label>
                  <textarea
                    value={callArgs}
                    onChange={(e) => setCallArgs(e.target.value)}
                    rows="4"
                  />
                </div>
                <button className="button button-primary" onClick={handleCallFunction}>
                  Call Function
                </button>
              </>
            )}

            {callResult && (
              <>
                <h3>Result</h3>
                <div className="success">
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {JSON.stringify(callResult, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FunctionLibrary;
