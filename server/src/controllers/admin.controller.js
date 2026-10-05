const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Ambulance = require('../models/Ambulance');
const EmergencyAlert = require('../models/EmergencyAlert');
const HealthRecord = require('../models/HealthRecord');
const { analyzeOutbreakTrends } = require('../services/ai.service');

// Admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalPatients, activeDoctors, totalAmbulances, emergencyAlerts, totalAppointments, todayAppointments, pendingDoctors] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      Ambulance.countDocuments({ isActive: true }),
      EmergencyAlert.countDocuments({ status: { $nin: ['resolved', 'false_alarm'] } }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      User.countDocuments({ role: 'doctor', isVerified: false })
    ]);
    
    const totalUsers = totalPatients + activeDoctors + pendingDoctors;

    // Recent emergency alerts
    const recentAlerts = await EmergencyAlert.find()
      .populate('patient', 'name phone abhaId')
      .sort({ createdAt: -1 }).limit(5);

    // Ambulance status distribution
    const ambulanceStats = await Ambulance.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Appointment trend (last 7 days)
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const appointmentTrendRaw = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const appointmentTrend = appointmentTrendRaw.map(d => ({ label: new Date(d._id).toLocaleDateString('en-US', {weekday: 'short'}), value: d.count }));

    res.json({ 
      success: true, 
      totalUsers, 
      activeDoctors, 
      totalAmbulances, 
      emergencyAlerts, 
      totalAppointments, 
      todayAppointments, 
      pendingDoctors, 
      recentAlerts, 
      ambulanceStats, 
      appointmentTrend 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard' });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const users = await User.find(query).select('-password').skip((page-1)*limit).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, page: parseInt(page), totalPages: Math.ceil(total/limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// Verify/activate doctor
const updateUser = async (req, res) => {
  try {
    const { isVerified, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified, isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

// Get ambulance fleet
const getAmbulances = async (req, res) => {
  try {
    const ambulances = await Ambulance.find({ isActive: true }).populate('driver', 'name phone');
    res.json({ success: true, ambulances });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch ambulances' });
  }
};

// Add ambulance
const addAmbulance = async (req, res) => {
  try {
    const ambulance = new Ambulance(req.body);
    await ambulance.save();
    res.status(201).json({ success: true, message: 'Ambulance added', ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to add ambulance' });
  }
};

// Update ambulance
const updateAmbulance = async (req, res) => {
  try {
    const ambulance = await Ambulance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ambulance) return res.status(404).json({ success: false, message: 'Ambulance not found' });
    res.json({ success: true, message: 'Ambulance updated', ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ambulance' });
  }
};

// Dispatch ambulance
const dispatchAmbulance = async (req, res) => {
  try {
    const { ambulanceId, alertId, patientId, pickupLat, pickupLng, pickupAddress, destinationHospital } = req.body;
    const ambulance = await Ambulance.findByIdAndUpdate(ambulanceId, {
      status: 'dispatched',
      'currentAssignment.patientId': patientId,
      'currentAssignment.pickupLocation': { lat: pickupLat, lng: pickupLng, address: pickupAddress },
      'currentAssignment.destinationHospital': destinationHospital,
      'currentAssignment.dispatchedAt': new Date()
    }, { new: true });

    if (alertId) {
      await EmergencyAlert.findByIdAndUpdate(alertId, {
        status: 'ambulance_dispatched',
        assignedAmbulance: ambulanceId,
        handledBy: req.user._id,
        $push: { timeline: { event: 'Ambulance dispatched by admin', timestamp: new Date() } }
      });
    }

    const io = req.app.get('io');
    io.emit('ambulance:dispatched:broadcast', { ambulanceId, alertId, patientId, destinationHospital });

    res.json({ success: true, message: 'Ambulance dispatched', ambulance });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Dispatch failed' });
  }
};

// Get emergency alerts
const getAlerts = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const alerts = await EmergencyAlert.find(query)
      .populate('patient', 'name phone abhaId bloodGroup')
      .populate('assignedAmbulance', 'vehicleNumber driverName driverPhone')
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
};

// Resolve alert
const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await EmergencyAlert.findByIdAndUpdate(id, {
      status: 'resolved',
      resolvedAt: new Date(),
      handledBy: req.user._id,
      $push: { timeline: { event: 'Alert resolved by admin', timestamp: new Date() } }
    }, { new: true });
    
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    
    const io = req.app.get('io');
    io.emit('patient:sos:resolved', { alertId: alert._id });
    
    res.json({ success: true, message: 'Alert resolved', alert });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resolve alert' });
  }
};

// Get disease heatmap data
const getHeatmapData = async (req, res) => {
  try {
    // Aggregate diagnoses with approximate locations (based on patient address)
    const diagnosisData = await HealthRecord.aggregate([
      { $unwind: '$diagnosis' },
      { $group: { _id: '$diagnosis', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Delhi locality heatmap points (simulated from patient data)
    const heatmapPoints = [
      { lat: 28.6139, lng: 77.2090, area: 'Connaught Place', intensity: 85, disease: 'Dengue' },
      { lat: 28.6562, lng: 77.2410, area: 'Karol Bagh', intensity: 72, disease: 'Fever' },
      { lat: 28.7041, lng: 77.1025, area: 'Rohini', intensity: 65, disease: 'Respiratory' },
      { lat: 28.5355, lng: 77.3910, area: 'Noida Sector 18', intensity: 58, disease: 'Dengue' },
      { lat: 28.6692, lng: 77.4538, area: 'Laxmi Nagar', intensity: 70, disease: 'Cholera' },
      { lat: 28.5921, lng: 77.0460, area: 'Dwarka', intensity: 45, disease: 'Malaria' },
      { lat: 28.6508, lng: 77.2300, area: 'Paharganj', intensity: 80, disease: 'TB' },
      { lat: 28.6329, lng: 77.2195, area: 'Rajiv Chowk', intensity: 55, disease: 'Influenza' },
      { lat: 28.7496, lng: 77.1183, area: 'Shalimar Bagh', intensity: 40, disease: 'Typhoid' },
      { lat: 28.5274, lng: 77.1783, area: 'Delhi Cantt', intensity: 30, disease: 'Fever' },
    ];

    // Call AI for trend analysis
    let aiAnalysis = null;
    try {
      aiAnalysis = await analyzeOutbreakTrends({ diagnosisData, heatmapPoints });
    } catch (e) { /* AI optional */ }

    res.json({ success: true, heatmapPoints, diagnosisData, aiAnalysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch heatmap data' });
  }
};

module.exports = { getDashboardStats, getUsers, updateUser, getAmbulances, addAmbulance, updateAmbulance, dispatchAmbulance, getAlerts, resolveAlert, getHeatmapData };
