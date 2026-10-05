/**
 * Smart City Health Highway — Database Seed Script
 * Run: node src/seed.js
 * 
 * Creates demo users:
 * - patient@demo.com / demo1234
 * - doctor@demo.com / demo1234
 * - admin@demo.com / demo1234
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Ambulance = require('./models/Ambulance');
const Appointment = require('./models/Appointment');

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!');

  // Clear existing demo users
  await User.deleteMany({ email: { $in: ['patient@demo.com', 'doctor@demo.com', 'admin@demo.com'] } });
  console.log('🗑️  Cleared old demo users');



  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    phone: '+91 9876543210',
    gender: 'male',
    isActive: true,
    isVerified: true,
  });
  console.log('✅ Admin created:', admin.email);

  // Create doctor
  const doctor = await User.create({
    name: 'Priya Sharma',
    email: 'doctor@demo.com',
    password: 'demo1234',
    role: 'doctor',
    phone: '+91 9876543211',
    gender: 'female',
    specialization: 'General Medicine',
    licenseNumber: 'MCI/2024/12345',
    isActive: true,
    isVerified: true,
    isApproved: true,
    availableSlots: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Friday', startTime: '14:00', endTime: '18:00' },
    ],
  });
  console.log('✅ Doctor created:', doctor.email, '| ABHA:', doctor.abhaId);

  // Create patient
  const patient = await User.create({
    name: 'Rahul Gupta',
    email: 'patient@demo.com',
    password: 'demo1234',
    role: 'patient',
    phone: '+91 9876543212',
    gender: 'male',
    dateOfBirth: new Date('1990-05-15'),
    bloodGroup: 'B+',
    chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
    allergies: ['Penicillin', 'Aspirin'],
    isActive: true,
    isVerified: true,
  });
  console.log('✅ Patient created:', patient.email, '| ABHA:', patient.abhaId);

  // Create ambulances
  const ambulances = await Ambulance.insertMany([
    {
      vehicleNumber: 'DL-1C-AMB-001',
      vehicleType: 'Advanced Life Support',
      status: 'available',
      driverName: 'Ramesh Kumar',
      driverPhone: '+91 9811234567',
      equipment: { defibrillator: true, oxygenSupply: true, stretcher: true, firstAidKit: true },
      currentLocation: { lat: 28.6139, lng: 77.2090 }, // Delhi center
    },
    {
      vehicleNumber: 'DL-1C-AMB-002',
      vehicleType: 'Basic Life Support',
      status: 'available',
      driverName: 'Suresh Yadav',
      driverPhone: '+91 9811234568',
      equipment: { defibrillator: false, oxygenSupply: true, stretcher: true, firstAidKit: true },
      currentLocation: { lat: 28.5355, lng: 77.3910 }, // Noida
    },
    {
      vehicleNumber: 'DL-1C-AMB-003',
      vehicleType: 'Advanced Life Support',
      status: 'maintenance',
      driverName: 'Vijay Singh',
      driverPhone: '+91 9811234569',
      equipment: { defibrillator: true, oxygenSupply: true, stretcher: true, firstAidKit: true },
      currentLocation: { lat: 28.7041, lng: 77.1025 }, // North Delhi
    },
  ]);
  console.log(`✅ ${ambulances.length} ambulances created`);

  // Create a sample appointment
  await Appointment.create({
    patient: patient._id,
    doctor: doctor._id,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    timeSlot: '10:00 AM',
    symptoms: 'High blood pressure and dizziness',
    urgency: 'medium',
    status: 'confirmed',
  });
  console.log('✅ Sample appointment created');

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Demo Login Credentials:');
  console.log('  Patient: patient@demo.com / demo1234');
  console.log('  Doctor:  doctor@demo.com / demo1234');
  console.log('  Admin:   admin@demo.com / demo1234');
  
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
