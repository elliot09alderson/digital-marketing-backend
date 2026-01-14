const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const registrationRoutes = require('./routes/registrations');

const app = express();

// CORS Configuration - must be before routes
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/registrations', registrationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI,{dbName:"digitalmarkting"})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 Admin: ${process.env.ADMIN_EMAIL}`);
      console.log(`🌐 CORS enabled for: http://localhost:5173`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
