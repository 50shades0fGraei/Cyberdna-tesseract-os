import React, { useState } from 'react';

function LicenseActivation({ onActivated }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [licensee, setLicensee] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey || !licensee) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const result = await window.api.activateLicense(licenseKey, licensee);
      if (result.success) {
        onActivated();
      } else {
        setError(result.message || 'Activation failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
        <h1 style={{ textAlign: 'center', color: '#333', margin: '0 0 1.5rem 0' }}>CodemapOS</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>License Activation</p>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label>License Key</label>
          <input
            type="password"
            placeholder="Enter your license key"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Licensee Name</label>
          <input
            type="text"
            placeholder="Your name or company"
            value={licensee}
            onChange={(e) => setLicensee(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          className="button button-primary"
          onClick={handleActivate}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Activating...' : 'Activate License'}
        </button>

        <p style={{ fontSize: '0.85rem', color: '#999', textAlign: 'center', marginTop: '1rem' }}>
          Don't have a license? <a href="#" style={{ color: '#667eea' }}>Purchase one</a>
        </p>
      </div>
    </div>
  );
}

export default LicenseActivation;
