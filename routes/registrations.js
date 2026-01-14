const express = require('express');
const Registration = require('../models/Registration');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create Registration (Public)
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, country, city, profession } = req.body;

    // Validate required fields
    if (!name || !phone || !country || !city || !profession) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields' 
      });
    }

    // Check for duplicate phone
    const existing = await Registration.findOne({ phone });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'This phone number is already registered' 
      });
    }

    const registration = new Registration({
      name,
      phone,
      email: email || '',
      country,
      city,
      profession
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: registration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get All Registrations (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date, search } = req.query;
    let query = {};

    // Date filter
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const registrations = await Registration.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete Single Registration (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, message: 'Registration deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete Multiple Registrations (Admin only)
router.post('/delete-multiple', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided' });
    }

    await Registration.deleteMany({ _id: { $in: ids } });

    res.json({ success: true, message: `${ids.length} registrations deleted` });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete All Registrations (Admin only)
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Registration.deleteMany({});
    res.json({ success: true, message: 'All registrations deleted' });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get Stats (Admin only)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const total = await Registration.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCount = await Registration.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    res.json({
      success: true,
      stats: { total, today: todayCount }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
