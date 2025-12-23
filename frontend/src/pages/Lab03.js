import React, { useState, useEffect } from 'react';
import './Lab03.css';
import ConfigDisplay from './ConfigDisplay';
import API_BASE from '../config';

function Lab03() {
  const [userType, setUserType] = useState('free');
  const [userEmail, setUserEmail] = useState('');
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserType();
    fetchCourses();
  }, []);

  const fetchUserType = async () => {
    const url = `${API_BASE}/userType?userId=user1`;
    console.log(`[Lab03] Fetching user type from: ${url}`);
    console.log(`[Lab03] API_BASE is: ${API_BASE}`);
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });
      console.log(`[Lab03] Response status: ${response.status}`);
      console.log(`[Lab03] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`[Lab03] Non-JSON response received!`);
        console.error(`[Lab03] Content-Type: ${contentType}`);
        console.error(`[Lab03] Response text:`, text.substring(0, 500));
        throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
      }
      
      const data = await response.json();
      console.log(`[Lab03] User type data:`, data);
      setUserType(data.userType);
      setUserEmail(data.email);
    } catch (error) {
      console.error('[Lab03] Error fetching user type:', error);
      setMessage(`❌ Error: ${error.message}. Check console for details. API_BASE: ${API_BASE}`);
    }
  };

  const fetchCourses = async () => {
    console.log(`[Lab03] Fetching courses from: ${API_BASE}/courses`);
    try {
      const response = await fetch(`${API_BASE}/courses`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });
      console.log(`[Lab03] Courses response status: ${response.status}`);
      const data = await response.json();
      console.log(`[Lab03] Courses data:`, data);
      setCourses(data);
    } catch (error) {
      console.error('[Lab03] Error fetching courses:', error);
    }
  };

  const handleCheckAccess = async () => {
    setLoading(true);
    setMessage('');
    console.log(`[Lab03] Making request to: ${API_BASE}/userType?userId=user1`);
    try {
      // VULNERABLE: Frontend checks userType from API response
      const response = await fetch(`${API_BASE}/userType?userId=user1`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });
      console.log(`[Lab03] Check access response status: ${response.status}`);
      const data = await response.json();
      console.log(`[Lab03] Check access data:`, data);
      setUserType(data.userType);
      
      if (data.userType === 'paid') {
        setMessage('✅ You have premium access! All courses unlocked.');
      } else {
        setMessage('❌ You are on the free plan. Upgrade to premium to access all courses.');
      }
    } catch (error) {
      setMessage('❌ Error checking access status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab03-container">
      <nav className="lab03-nav">
        <div className="nav-content">
          <h1 className="nav-logo">ProLearn</h1>
          <div className="nav-links">
            <span className="active">Dashboard</span>
            <span>Settings</span>
            <span>Help</span>
          </div>
        </div>
      </nav>

      <div className="lab03-hero">
        <div className="hero-content">
          <h2>Welcome back!</h2>
          <p>Manage your subscription and access premium content</p>
        </div>
      </div>

      <div className="lab03-content">
        <div className="dashboard-grid">
          <div className="dashboard-card account-card">
            <h3>Account Status</h3>
            <div className="account-info">
              <div className="user-avatar">
                <div className="avatar-placeholder">LP</div>
              </div>
              <div className="user-details">
                <p className="user-email">{userEmail}</p>
                <div className="subscription-status">
                  <span className={`status-badge ${userType === 'paid' ? 'premium' : 'free'}`}>
                    {userType === 'paid' ? '⭐ Premium' : '🆓 Free'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              className="check-access-btn"
              onClick={handleCheckAccess}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Access Status'}
            </button>
          </div>

          <div className="dashboard-card courses-card">
            <h3>Available Courses</h3>
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-mini-card">
                  <div className="mini-course-icon">📚</div>
                  <h4>{course.name}</h4>
                  <p className="mini-price">${course.price}</p>
                  {userType === 'paid' ? (
                    <button 
                      className="access-unlocked"
                      onClick={() => {
                        // Download course when clicked as paid user
                        if (course.files && course.files.length > 0) {
                          const downloadUrl = `/api/course/${course.id}/download/${course.files[0]}`;
                          const downloadLink = document.createElement('a');
                          downloadLink.href = downloadUrl;
                          downloadLink.download = '';
                          document.body.appendChild(downloadLink);
                          downloadLink.click();
                          document.body.removeChild(downloadLink);
                          setMessage(`✅ Downloading ${course.name} course content...`);
                        }
                      }}
                    >
                      ✅ Download Course
                    </button>
                  ) : (
                    <button className="access-locked">🔒 Locked</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card features-card">
            <h3>Premium Features</h3>
            <ul className="features-list">
              <li className={userType === 'paid' ? 'enabled' : 'disabled'}>
                {userType === 'paid' ? '✅' : '❌'} Unlimited Course Access
              </li>
              <li className={userType === 'paid' ? 'enabled' : 'disabled'}>
                {userType === 'paid' ? '✅' : '❌'} Download Course Materials
              </li>
              <li className={userType === 'paid' ? 'enabled' : 'disabled'}>
                {userType === 'paid' ? '✅' : '❌'} Priority Support
              </li>
              <li className={userType === 'paid' ? 'enabled' : 'disabled'}>
                {userType === 'paid' ? '✅' : '❌'} Advanced Certificates
              </li>
            </ul>
          </div>
        </div>

        {message && (
          <div className={`message-box ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="hint-box">
          <h4>💡 Lab Instructions</h4>
          <ol>
            <li>Open Burp Suite and configure your browser proxy</li>
            <li>Click "Check Access Status" button</li>
            <li>Intercept the response from <code>/api/userType</code></li>
            <li>Modify <code>userType</code> from <code>"free"</code> to <code>"paid"</code></li>
            <li>Forward the modified response</li>
            <li>Click "Check Access Status" again - you're now a premium user!</li>
            <li>All courses and features will be unlocked</li>
          </ol>
        </div>
      </div>
      <ConfigDisplay />
    </div>
  );
}

export default Lab03;


