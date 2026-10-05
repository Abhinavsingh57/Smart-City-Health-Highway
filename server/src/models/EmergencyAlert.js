const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: String,
  patientPhone: String,
  abhaId: String,
  
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String,
    landmark: String
  },
  
  condition: { 
    type: String, 
    enum: ['cardiac_arrest', 'accident', 'stroke', 'breathing_difficulty', 'severe_allergy', 'unconscious', 'other'],
    default: 'other'
  },
  conditionDescription: String,
  
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'high' },
  
  status: { 
    type: String, 
    enum: ['pending', 'acknowledged', 'ambulance_dispatched', 'ambulance_arrived', 'patient_transported', 'resolved', 'false_alarm'],
    default: 'pending'
  },
  
  assignedAmbulance: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who handled
  
  timeline: [{
    event: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  
  resolvedAt: Date,
  resolutionNotes: String,
}, { timestamps: true });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
