const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAbhaId, generateAbhaAddress, generateAbhaCard } = require('../services/abha.service');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, dateOfBirth, gender, bloodGroup, specialization, licenseNumber, experience, qualification, hospitalAffiliation, consultationFee } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    const userData = { name, email, password, phone, role: role || 'patient', dateOfBirth, gender, bloodGroup };

    // Doctor-specific fields
    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.experience = experience;
      userData.qualification = qualification ? (Array.isArray(qualification) ? qualification : [qualification]) : [];
      userData.hospitalAffiliation = hospitalAffiliation;
      userData.consultationFee = consultationFee;
      userData.isVerified = false;
    }

    const user = new User(userData);

    // Generate ABHA ID for patients
    if (role === 'patient' || !role) {
      user.abhaId = generateAbhaId();
      user.abhaQRCode = generateAbhaCard(user.abhaId, name, dateOfBirth);
    }

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `${role || 'Patient'} registered successfully!`,
      token,
      user: user.toJSON(),
      abhaGenerated: (role === 'patient' || !role) ? true : false
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// Get current user
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions } = req.body;
    const updates = { name, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact };
    if (allergies) updates.allergies = Array.isArray(allergies) ? allergies : allergies.split(',').map(a => a.trim());
    if (chronicConditions) updates.chronicConditions = Array.isArray(chronicConditions) ? chronicConditions : chronicConditions.split(',').map(c => c.trim());
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Get all doctors (for patient to book appointment)
const getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const query = { role: 'doctor', isActive: true };
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (search) query.name = { $regex: search, $options: 'i' };
    
    const doctors = await User.find(query).select('-password').limit(20);
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch doctors' });
  }
};

module.exports = { register, login, getMe, updateProfile, getDoctors };
