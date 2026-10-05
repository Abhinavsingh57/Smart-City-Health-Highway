const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  vehicleType: { type: String, enum: ['Basic Life Support', 'Advanced Life Support', 'Patient Transport'], default: 'Basic Life Support' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  
  // Real-time location (updated via Socket.io)
  currentLocation: {
    lat: { type: Number, default: 28.6139 }, // Delhi default
    lng: { type: Number, default: 77.2090 },
    address: String,
    updatedAt: { type: Date, default: Date.now }
  },
  
  status: { 
    type: String, 
    enum: ['available', 'dispatched', 'on_scene', 'transporting', 'at_hospital', 'maintenance', 'off_duty'],
    default: 'available' 
  },
  
  // Route tracking
  route: [{
    lat: Number,
    lng: Number,
    timestamp: Date
  }],
  
  // Current assignment
  currentAssignment: {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    patientName: String,
    patientPhone: String,
    pickupLocation: {
      lat: Number,
      lng: Number,
      address: String
    },
    destinationHospital: String,
    dispatchedAt: Date,
    arrivedAt: Date,
    completedAt: Date,
    emergencyType: String
  },
  
  // Statistics
  totalTrips: { type: Number, default: 0 },
  lastServiceDate: { type: Date },
  fuelLevel: { type: Number, default: 100 }, // percentage
  
  // Equipment
  equipment: {
    defibrillator: { type: Boolean, default: true },
    oxygenSupply: { type: Boolean, default: true },
    stretcher: { type: Boolean, default: true },
    firstAidKit: { type: Boolean, default: true }
  },
  
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Ambulance', ambulanceSchema);
