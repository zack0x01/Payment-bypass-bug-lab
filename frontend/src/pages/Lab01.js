import React, { useState, useEffect } from 'react';
import './Lab01.css';
import API_BASE from '../config';

function Lab01() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [cart, setCart] = useState([]);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    console.log(`[Lab01] Fetching courses from: ${API_BASE}/courses`);
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
      console.log(`[Lab01] Courses response status: ${response.status}`);
      const data = await response.json();
      console.log(`[Lab01] Courses data:`, data);
      setCourses(data);
    } catch (error) {
      console.error('[Lab01] Error fetching courses:', error);
    }
  };

  const handleCheckPrice = async (courseId) => {
    setLoading(true);
    setMessage('');
    const url = `${API_BASE}/course/${courseId}/price`;
    console.log(`[Lab01] Making request to: ${url}`);
    console.log(`[Lab01] API_BASE is: ${API_BASE}`);
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
      console.log(`[Lab01] Response status: ${response.status}`);
      console.log(`[Lab01] Response headers:`, Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`[Lab01] Non-JSON response received!`);
        console.error(`[Lab01] Content-Type: ${contentType}`);
        console.error(`[Lab01] Response text:`, text.substring(0, 500));
        throw new Error(`Expected JSON but got ${contentType}. Check if API_BASE is correct: ${API_BASE}`);
      }
      
      const data = await response.json();
      console.log(`[Lab01] Response data:`, data);
      setPrice(data.price);
      setSelectedCourse(data);
      
      // VULNERABLE: Frontend trusts the price from response
      if (data.price === 0) {
        setMessage('✅ Course is free! Added to cart.');
        addToCart(data);
      } else if (data.price > 0) {
        setMessage(`❌ Course price is $${data.price}. Payment required.`);
      }
    } catch (error) {
      setMessage('❌ Error checking price');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (course) => {
    if (!cart.find(item => item.courseId === course.courseId)) {
      setCart([...cart, course]);
    }
  };

  const handlePurchase = async (courseId) => {
    setLoading(true);
    console.log(`[Lab01] Making purchase request to: ${API_BASE}/course/${courseId}/purchase`);
    try {
      const response = await fetch(`${API_BASE}/course/${courseId}/purchase`, {
        method: 'POST',
        cache: 'no-cache',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ price: price })
      });
      console.log(`[Lab01] Purchase response status: ${response.status}`);
      const data = await response.json();
      console.log(`[Lab01] Purchase data:`, data);
      if (data.success && data.accessGranted) {
        setMessage('✅ Purchase successful! Course unlocked! Downloading course content...');
        setCart(cart.filter(item => item.courseId !== courseId));
        
        // Trigger download if downloadUrl is provided
        if (data.downloadUrl) {
          const downloadLink = document.createElement('a');
          downloadLink.href = data.downloadUrl;
          downloadLink.download = '';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      } else {
        setMessage('❌ Purchase failed');
      }
    } catch (error) {
      setMessage('❌ Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (courseId) => {
    setCart(cart.filter(item => item.courseId !== courseId));
  };

  return (
    <div className="lab01-container">
      <nav className="lab01-nav">
        <div className="nav-content">
          <h1 className="nav-logo">LearnPro</h1>
          <div className="nav-links">
            <span>Courses</span>
            <span>My Learning</span>
            <span className="cart-icon">Cart ({cart.length})</span>
          </div>
        </div>
      </nav>

      <div className="lab01-hero">
        <h2>Premium Online Courses</h2>
        <p>Master new skills with our expert-led courses</p>
      </div>

      <div className="lab01-content">
        <div className="courses-section">
          <h3>Featured Courses</h3>
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-image">
                  <div className="course-placeholder">📚</div>
                </div>
                <div className="course-info">
                  <h4>{course.name}</h4>
                  <div className="course-meta">
                    <span>⭐ 4.8</span>
                    <span>👥 1,234 students</span>
                  </div>
                  <div className="course-price-section">
                    {selectedCourse && selectedCourse.courseId === course.id ? (
                      <div className="price-check-result">
                        <p className="price-display">Price: ${price}</p>
                        {price === 0 ? (
                          <button 
                            className="btn-success"
                            onClick={() => handlePurchase(course.id)}
                            disabled={loading}
                          >
                            {loading ? 'Processing...' : 'Complete Purchase'}
                          </button>
                        ) : (
                          <p className="error-message">Payment required</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="course-price">${course.price}</p>
                        <button 
                          className="btn-primary"
                          onClick={() => handleCheckPrice(course.id)}
                          disabled={loading}
                        >
                          {loading ? 'Checking...' : 'Check Price & Add to Cart'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
            <li>Click "Check Price & Add to Cart" on any course</li>
            <li>Intercept the response from <code>/api/course/:courseId/price</code></li>
            <li>Modify the <code>price</code> field from <code>99</code> to <code>0</code></li>
            <li>Forward the modified response</li>
            <li>The course will be added to cart for free!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Lab01;


