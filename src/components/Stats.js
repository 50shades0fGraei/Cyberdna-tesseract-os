import React, { useState, useEffect } from 'react';

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(false);
      const result = await window.api.getStats();
      setStats(result);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading stats:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading stats...</div>;
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Functions</div>
              <div className="stat-value">{stats.total_functions || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Function Calls</div>
              <div className="stat-value">{stats.function_calls || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Data Bindings</div>
              <div className="stat-value">{stats.data_bindings || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">ACL Rules</div>
              <div className="stat-value">{stats.acl_rules || 0}</div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Performance Metrics</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Subprocess Invocations</td>
                  <td>{stats.subprocess_calls || 0}</td>
                </tr>
                <tr>
                  <td>Local Invocations (Energy Saving)</td>
                  <td>{stats.local_calls || 0}</td>
                </tr>
                <tr>
                  <td>Average Execution Time</td>
                  <td>{stats.avg_exec_time?.toFixed(3) || 'N/A'} ms</td>
                </tr>
                <tr>
                  <td>Library Size</td>
                  <td>{stats.library_size || 0} functions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Stats;
