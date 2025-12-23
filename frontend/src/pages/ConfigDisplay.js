import React from 'react';

function ConfigDisplay() {
  const apiBase = '/api';
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#fff3cd', 
      padding: '15px', 
      border: '2px solid #ffc107',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <strong>🔧 API Configuration</strong>
      <br />
      <strong>API_BASE:</strong> {apiBase}
      <br />
      <strong>Environment:</strong> {process.env.NODE_ENV}
      <br />
      {!process.env.REACT_APP_API_URL && (
        <div style={{ color: 'red', marginTop: '5px' }}>
          ⚠️ Using default '/api' - Create .env file with REACT_APP_API_URL for ngrok!
        </div>
      )}
    </div>
  );
}

export default ConfigDisplay;


