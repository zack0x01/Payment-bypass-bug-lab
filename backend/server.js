const express = require('express');
const cors = require('cors');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

// CORS configuration to work with any origin (for ngrok)
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Add headers to prevent caching and make requests interceptable
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  // Log all requests for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Simulated database
let users = {
  'user1': { userType: 'free', email: 'user1@example.com' },
  'user2': { userType: 'paid', email: 'user2@example.com' }
};

let courses = {
  'course-101': { 
    id: 'course-101', 
    name: 'Advanced Web Security', 
    price: 99,
    files: ['course-content.zip'],
    description: 'Learn advanced web security techniques'
  },
  'course-102': { 
    id: 'course-102', 
    name: 'Bug Bounty Mastery', 
    price: 149,
    files: ['bug-bounty-course.zip'],
    description: 'Master bug bounty hunting skills'
  },
  'course-103': { 
    id: 'course-103', 
    name: 'Penetration Testing', 
    price: 199,
    files: ['pentest-course.zip'],
    description: 'Complete penetration testing course'
  }
};

// Course content files (zip files contain text files with video links)
let courseContent = {
  'course-content.zip': {
    files: [
      {
        name: 'course-videos.txt',
        content: `Course Videos:
================

Video 1: Advanced Web Security Fundamentals
URL: https://www.youtube.com/watch?v=fCmVnnlsID4&t=115s

Video 2: Security Best Practices
URL: https://www.youtube.com/watch?v=POeAY_H_PgI&t=5s

Video 3: Advanced Techniques
URL: https://www.youtube.com/watch?v=g79KvzT19sw&t=63s

Course Materials:
- All videos are accessible via the links above
- Complete the labs to unlock full access`
      }
    ]
  },
  'bug-bounty-course.zip': {
    files: [
      {
        name: 'bug-bounty-videos.txt',
        content: `Bug Bounty Course Videos:
===========================

Video 1: Introduction to Bug Bounty
URL: https://www.youtube.com/watch?v=fCmVnnlsID4&t=115s

Video 2: Finding Vulnerabilities
URL: https://www.youtube.com/watch?v=POeAY_H_PgI&t=5s

Video 3: Advanced Bug Hunting
URL: https://www.youtube.com/watch?v=g79KvzT19sw&t=63s

Course Content:
- Learn how to find and report bugs
- Practice on real-world applications
- Earn bounties and improve your skills`
      }
    ]
  },
  'pentest-course.zip': {
    files: [
      {
        name: 'pentest-videos.txt',
        content: `Penetration Testing Course Videos:
====================================

Video 1: Penetration Testing Basics
URL: https://www.youtube.com/watch?v=fCmVnnlsID4&t=115s

Video 2: Network Penetration Testing
URL: https://www.youtube.com/watch?v=POeAY_H_PgI&t=5s

Video 3: Web Application Testing
URL: https://www.youtube.com/watch?v=g79KvzT19sw&t=63s

Course Materials:
- Complete penetration testing methodology
- Hands-on labs and exercises
- Real-world scenarios and case studies`
      }
    ]
  }
};

// ============================================
// API ROUTES - Must be defined BEFORE proxy
// ============================================

// Lab 01: Price modification vulnerability
app.get('/api/course/:courseId/price', (req, res) => {
  const { courseId } = req.params;
  const course = courses[courseId];
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  // VULNERABLE: Returns price directly, can be modified in response
  res.json({ 
    courseId: course.id,
    courseName: course.name,
    price: course.price,
    message: 'Course price retrieved successfully'
  });
});

app.post('/api/course/:courseId/purchase', (req, res) => {
  const { courseId } = req.params;
  const { price } = req.body;
  const course = courses[courseId];
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  // VULNERABLE: Frontend checks price from response, not server validation
  res.json({ 
    success: true, 
    message: 'Course purchased successfully',
    accessGranted: true,
    courseId: course.id,
    downloadUrl: `/api/course/${courseId}/download/${course.files[0]}` // First file in course
  });
});

// Lab 02: Direct path access vulnerability
app.get('/api/courses', (req, res) => {
  // VULNERABLE: Returns all course details including FULL file paths
  const courseList = Object.values(courses).map(course => ({
    id: course.id,
    name: course.name,
    price: course.price,
    files: course.files, // Exposed file names
    filePaths: course.files.map(fileName => ({
      fileName: fileName,
      accessPath: `/api/course/${course.id}/files/${fileName}`,
      downloadPath: `/api/course/${course.id}/download/${fileName}`
    })) // VULNERABLE: Full paths exposed!
  }));
  
  res.json(courseList);
});

app.get('/api/course/:courseId', (req, res) => {
  const { courseId } = req.params;
  const course = courses[courseId];
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  // VULNERABLE: Returns course details without checking payment
  // FULL FILE PATHS are exposed in the response - this is the vulnerability!
  res.json({
    id: course.id,
    name: course.name,
    price: course.price,
    files: course.files, // File names
    filePaths: course.files.map(fileName => ({
      fileName: fileName,
      accessPath: `/api/course/${courseId}/files/${fileName}`,
      downloadPath: `/api/course/${courseId}/download/${fileName}`
    })), // VULNERABLE: Full paths exposed!
    description: course.description || 'Premium course content'
  });
});

app.get('/api/course/:courseId/files/:fileName', (req, res) => {
  const { courseId, fileName } = req.params;
  const course = courses[courseId];
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  // VULNERABLE: No payment verification, direct access allowed
  if (course.files.includes(fileName)) {
    // Redirect to download endpoint to trigger actual file download
    const downloadUrl = `/api/course/${courseId}/download/${fileName}`;
    return res.json({
      success: true,
      fileUrl: `/courses/${courseId}/${fileName}`,
      message: 'File access granted',
      fileName: fileName,
      content: courseContent[fileName] ? courseContent[fileName].files : null,
      downloadUrl: downloadUrl
    });
  }
  
  res.status(404).json({ error: 'File not found' });
});

// Download endpoint for course files - ACTUALLY DOWNLOADS THE FILE
app.get('/api/course/:courseId/download/:fileName', (req, res) => {
  const { courseId, fileName } = req.params;
  const course = courses[courseId];
  
  if (!course || !course.files.includes(fileName)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // VULNERABLE: Direct download without payment verification
  if (courseContent[fileName]) {
    // Combine all file contents into one downloadable text file
    const allContent = courseContent[fileName].files.map(f => 
      `=== ${f.name} ===\n\n${f.content}\n\n`
    ).join('\n');
    
    // Set headers to force download (browser will download the file)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace('.zip', '.txt')}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Send the file content
    res.send(allContent);
    return;
  }
  
  res.status(404).json({ error: 'File content not found' });
});

// Lab 03: Permission bypass vulnerability
app.get('/api/userType', (req, res) => {
  const userId = req.query.userId || 'user1';
  const user = users[userId];
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // VULNERABLE: Returns userType that frontend trusts without server-side validation
  res.json({
    userId: userId,
    userType: user.userType,
    email: user.email
  });
});

app.get('/api/course/:courseId/access', (req, res) => {
  const { courseId } = req.params;
  const course = courses[courseId];
  
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  res.json({
    hasAccess: false,
    message: 'Access check endpoint (not used by frontend)'
  });
});

// Test endpoint to verify interception
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    server: 'backend'
  });
});

// Catch-all for API routes not found
app.use('/api/*', (req, res) => {
  console.log(`[404] API route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: `Cannot ${req.method} ${req.url}`,
    message: 'API route not found',
    availableRoutes: [
      'GET /api/courses',
      'GET /api/course/:courseId/price',
      'POST /api/course/:courseId/purchase',
      'GET /api/course/:courseId',
      'GET /api/course/:courseId/files/:fileName',
      'GET /api/userType?userId=user1',
      'GET /api/test'
    ]
  });
});

// ============================================
// FRONTEND PROXY - Must be AFTER all API routes
// ============================================

// Proxy all non-API requests to React dev server
const frontendProxy = createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
  logLevel: 'silent',
  pathFilter: (pathname) => {
    // Only proxy non-API routes
    return !pathname.startsWith('/api');
  },
  onProxyReq: (proxyReq, req) => {
    console.log(`[Proxy] Forwarding to frontend: ${req.method} ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`[Proxy] Error: ${err.message}`);
    if (!req.path.startsWith('/api')) {
      res.status(503).send(`
        <html>
          <body>
            <h1>Frontend Server Not Available</h1>
            <p>Please start the frontend server:</p>
            <pre>cd frontend && npm start</pre>
            <p>Or test API directly: <a href="/api/test">/api/test</a></p>
          </body>
        </html>
      `);
    }
  }
});

app.use('/', frontendProxy);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Payment Bypass Lab - Backend Server');
  console.log('='.repeat(60));
  console.log(`✅ Backend running on: http://localhost:${PORT}`);
  console.log(`✅ Proxying frontend from: http://localhost:3000`);
  console.log('\n📋 Available API Endpoints:');
  console.log('   GET  /api/courses');
  console.log('   GET  /api/course/:courseId/price');
  console.log('   POST /api/course/:courseId/purchase');
  console.log('   GET  /api/course/:courseId');
  console.log('   GET  /api/course/:courseId/files/:fileName');
  console.log('   GET  /api/userType?userId=user1');
  console.log('   GET  /api/test');
  console.log('\n💡 To expose with ngrok:');
  console.log(`   ngrok http ${PORT}`);
  console.log('   Then access everything via the ngrok URL!');
  console.log('='.repeat(60) + '\n');
});

