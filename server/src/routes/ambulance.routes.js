const express = require('express');
const router = express.Router();
const Ambulance = require('../models/Ambulance');
const { authenticate } = require('../middleware/auth.middleware');

// Get all active ambulances (public for tracking)
router.get('/', async (req, res) => {
  try {
    const ambulances = await Ambulance.find({ isActive: true }).select('vehicleNumber vehicleType driverName driverPhone currentLocation status currentAssignment');
    res.json({ success: true, ambulances });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ambulances' });
  }
});

// Get ambulance by ID
router.get('/:id', async (req, res) => {
  try {
    const ambulance = await Ambulance.findById(req.params.id).populate('driver', 'name phone');
    if (!ambulance) return res.status(404).json({ success: false, message: 'Ambulance not found' });
    res.json({ success: true, ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ambulance' });
  }
});

// Update ambulance location (called by driver app)
router.put('/:id/location', authenticate, async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, {
      'currentLocation.lat': lat,
      'currentLocation.lng': lng,
      'currentLocation.address': address,
      'currentLocation.updatedAt': new Date()
    }, { new: true });
    if (!ambulance) return res.status(404).json({ success: false, message: 'Ambulance not found' });
    
    // Broadcast location update
    const io = req.app.get('io');
    io.emit('ambulance:location:update', { ambulanceId: req.params.id, lat, lng, status: ambulance.status, timestamp: new Date() });
    
    res.json({ success: true, ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
});

module.exports = router;
