import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import Lab01 from './pages/Lab01';
import Lab02 from './pages/Lab02';
import Lab03 from './pages/Lab03';
import Home from './pages/Home';
import TestAPI from './pages/TestAPI';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lab01" element={<Lab01 />} />
        <Route path="/lab02" element={<Lab02 />} />
        <Route path="/lab03" element={<Lab03 />} />
        <Route path="/test" element={<TestAPI />} />
      </Routes>
    </Router>
  );
}

export default App;


