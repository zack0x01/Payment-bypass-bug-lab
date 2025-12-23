import React, { useState, useEffect } from 'react';
import './Lab02.css';
import API_BASE from '../config';

function Lab02() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    console.log(`[Lab02] Fetching courses from: ${API_BASE}/courses`);
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
      console.log(`[Lab02] Courses response status: ${response.status}`);
      const data = await response.json();
      console.log(`[Lab02] Courses data:`, data);
      setCourses(data);
    } catch (error) {
      console.error('[Lab02] Error fetching courses:', error);
    }
  };

  const handleViewCourse = async (courseId) => {
    console.log(`[Lab02] Making request to: ${API_BASE}/course/${courseId}`);
    try {
      const response = await fetch(`${API_BASE}/course/${courseId}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });
      console.log(`[Lab02] Course response status: ${response.status}`);
      const data = await response.json();
      console.log(`[Lab02] Course data:`, data);
      // VULNERABLE: Don't show files immediately - user must find them in API response
      // Files are exposed in the API response but not displayed in UI
      setCourseDetails(data); // Store but don't display files
      setSelectedCourse(courseId);
      setMessage(`✅ Course details loaded. Check the API response in DevTools/Burp Suite to find file paths!`);
    } catch (error) {
      setMessage('❌ Error loading course');
    }
  };

  const handleAccessFile = async (courseId, fileName) => {
    console.log(`[Lab02] Making request to: ${API_BASE}/course/${courseId}/files/${fileName}`);
    try {
      const response = await fetch(`${API_BASE}/course/${courseId}/files/${fileName}`, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        }
      });
      console.log(`[Lab02] File access response status: ${response.status}`);
      const data = await response.json();
      console.log(`[Lab02] File access data:`, data);
      if (data.success) {
        setMessage(`✅ Access granted to ${fileName}! Downloading...`);
        
        // Trigger download
        if (data.downloadUrl) {
          const downloadLink = document.createElement('a');
          downloadLink.href = data.downloadUrl;
          downloadLink.download = '';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      }
    } catch (error) {
      setMessage('❌ File access denied');
    }
  };

  return (
    <div className="lab02-container">
      <nav className="lab02-nav">
        <div className="nav-content">
          <h1 className="nav-logo">CourseHub</h1>
          <div className="nav-links">
            <span className="active">My Courses</span>
            <span>Browse</span>
            <span>Progress</span>
          </div>
        </div>
      </nav>

      <div className="lab02-hero">
        <h2>My Learning Dashboard</h2>
        <p>Continue your learning journey</p>
      </div>

      <div className="lab02-content">
        <div className="courses-section">
          <h3>Your Courses</h3>
          <div className="courses-list">
            {courses.map(course => (
              <div key={course.id} className="course-item">
                <div className="course-thumbnail">
                  <div className="thumbnail-placeholder">📚</div>
                </div>
                <div className="course-content">
                  <h4>{course.name}</h4>
                  <p className="course-description">Premium course content with video lessons and resources</p>
                  <div className="course-actions">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewCourse(course.id)}
                    >
                      View Course Details
                    </button>
                    {selectedCourse === course.id && (
                      <div className="course-challenge">
                        <p className="challenge-text">
                          🔍 <strong>Challenge:</strong> The course files are exposed in the API response, 
                          but not shown here. Find them in the Network tab or Burp Suite!
                        </p>
                        <p className="hint-text">
                          💡 Hint: Check the response from <code>/api/course/{course.id}</code> 
                          or <code>/api/courses</code> - the file paths are there!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="course-badge">
                  <span className="badge">Premium</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {message && (
          <div className={`message-box ${message.includes('✅') ? 'success' : 'error'}`}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9em' }}>
              {message}
            </pre>
          </div>
        )}

        <div className="hint-box">
          <h4>💡 Lab Instructions</h4>
          <ol>
            <li>Open browser DevTools (F12) or Burp Suite</li>
            <li>Click "View Course Details" on any course</li>
            <li>Check the Network tab - the response from <code>/api/course/:courseId</code> contains <strong>full file paths</strong>!</li>
            <li>Or check <code>/api/courses</code> response in Burp history - it exposes <code>filePaths</code> with complete URLs!</li>
            <li>Look for <code>filePaths</code> array in the response - it contains <code>accessPath</code> and <code>downloadPath</code></li>
            <li>Use the exposed full paths directly (e.g., <code>/api/course/course-101/download/course-content.zip</code>)</li>
            <li>The file will automatically download with course video links!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Lab02;


