import React, { useState } from 'react';
import API_BASE from '../config';

function TestAPI() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRequest = async (endpoint) => {
    setLoading(true);
    setResult('Making request...');
    console.log(`[TEST] Making request to: ${API_BASE}${endpoint}`);
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });
      
      console.log(`[TEST] Response status: ${response.status}`);
      const data = await response.json();
      console.log(`[TEST] Response data:`, data);
      
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[TEST] Error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>API Request Test Page</h1>
      <p>Use this page to verify requests are being made and can be intercepted.</p>
      
      <div style={{ margin: '20px 0' }}>
        <h3>Test Endpoints:</h3>
        <button 
          onClick={() => testRequest('/courses')}
          disabled={loading}
          style={{ margin: '5px', padding: '10px' }}
        >
          Test /api/courses
        </button>
        <button 
          onClick={() => testRequest('/course/course-101/price')}
          disabled={loading}
          style={{ margin: '5px', padding: '10px' }}
        >
          Test /api/course/course-101/price
        </button>
        <button 
          onClick={() => testRequest('/userType?userId=user1')}
          disabled={loading}
          style={{ margin: '5px', padding: '10px' }}
        >
          Test /api/userType
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {result && (
        <div style={{ 
          background: '#f5f5f5', 
          padding: '20px', 
          marginTop: '20px',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap'
        }}>
          <h4>Response:</h4>
          <pre>{result}</pre>
        </div>
      )}

      <div style={{ marginTop: '40px', background: '#fff3cd', padding: '20px', borderRadius: '5px' }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Open Browser DevTools (F12) → Network tab</li>
          <li>Or configure Burp Suite proxy (127.0.0.1:8080)</li>
          <li>Click any test button above</li>
          <li>Check Network tab or Burp Suite HTTP history</li>
          <li>You should see the request to the API endpoint</li>
        </ol>
        <p><strong>Check the browser console (F12 → Console) for detailed logs!</strong></p>
      </div>
    </div>
  );
}

export default TestAPI;


