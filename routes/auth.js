const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Admin Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials against env variables
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        admin: { email, role: 'admin' }
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify Token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, admin: decoded });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
