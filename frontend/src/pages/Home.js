import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  const openLab = (labNumber) => {
    const url = `/lab0${labNumber}`;
    window.open(url, '_blank');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>LearnPro Platform</h1>
        <p>Professional Online Learning</p>
      </header>

      <div className="labs-grid">
        <div className="lab-card">
          <div className="lab-card-header">
            <div className="lab-icon">📚</div>
            <h2>Course Marketplace</h2>
            <p className="lab-description">
              Browse and purchase premium online courses. Explore our catalog of professional development courses designed to advance your career.
            </p>
          </div>
          <div className="lab-details">
            <p><strong>Categories:</strong> Technology, Business, Design</p>
            <p><strong>Format:</strong> Video lectures, Hands-on projects</p>
            <p><strong>Access:</strong> Lifetime access, Mobile apps</p>
          </div>
          <div className="lab-button-container">
            <button className="lab-button" onClick={() => openLab(1)}>
              Browse Courses →
            </button>
          </div>
        </div>

        <div className="lab-card">
          <div className="lab-card-header">
            <div className="lab-icon">🎓</div>
            <h2>Learning Dashboard</h2>
            <p className="lab-description">
              Access your enrolled courses and track your learning progress. Continue your journey with interactive lessons and downloadable resources.
            </p>
          </div>
          <div className="lab-details">
            <p><strong>Features:</strong> Course library, Progress tracking</p>
            <p><strong>Resources:</strong> Video content, Course materials</p>
            <p><strong>Support:</strong> Community forums, Instructor Q&A</p>
          </div>
          <div className="lab-button-container">
            <button className="lab-button" onClick={() => openLab(2)}>
              View Dashboard →
            </button>
          </div>
        </div>

        <div className="lab-card">
          <div className="lab-card-header">
            <div className="lab-icon">⭐</div>
            <h2>Premium Membership</h2>
            <p className="lab-description">
              Manage your subscription and unlock exclusive premium content. Get access to advanced courses and priority support.
            </p>
          </div>
          <div className="lab-details">
            <p><strong>Benefits:</strong> Unlimited courses, Certificates</p>
            <p><strong>Support:</strong> Priority help, Live sessions</p>
            <p><strong>Price:</strong> Flexible monthly/annual plans</p>
          </div>
          <div className="lab-button-container">
            <button className="lab-button" onClick={() => openLab(3)}>
              Manage Account →
            </button>
          </div>
        </div>
      </div>

      <div className="social-section">
        <h2>Connect With Me</h2>
        <div className="social-links">
          <a href="https://lureo.shop" target="_blank" rel="noopener noreferrer" className="social-link">
            <span className="social-icon hacker-icon">💻</span>
            <div className="social-info">
              <strong>Learn Bug Bounty with zack0X01</strong>
              <span>lureo.shop</span>
            </div>
          </a>
          <a href="https://youtube.com/@zack0X01" target="_blank" rel="noopener noreferrer" className="social-link">
            <span className="social-icon">📺</span>
            <div className="social-info">
              <strong>YouTube Channel</strong>
              <span>zack0X01</span>
            </div>
          </a>
          <a href="https://twitter.com/zack0X01" target="_blank" rel="noopener noreferrer" className="social-link">
            <span className="social-icon">🐦</span>
            <div className="social-info">
              <strong>Twitter</strong>
              <span>@zack0X01</span>
            </div>
          </a>
        </div>
      </div>

      <footer className="home-footer">
        <p>© 2025 LearnPro Platform. All rights reserved.</p>
        <p>Transform your skills with our comprehensive courses</p>
      </footer>
    </div>
  );
}

export default Home;


