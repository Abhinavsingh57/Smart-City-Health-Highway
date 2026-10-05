const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  
  visitDate: { type: Date, default: Date.now },
  visitType: { type: String, enum: ['OPD', 'Emergency', 'Follow-up', 'Teleconsultation', 'Lab Test'], default: 'OPD' },
  
  title: String,
  recordType: String,
  description: String,
  
  // Vitals
  vitals: {
    bloodPressure: String, // "120/80"
    heartRate: Number,
    temperature: Number, // Celsius
    oxygenSaturation: Number, // SpO2 %
    weight: Number, // kg
    height: Number, // cm
    bmi: Number,
    bloodGlucose: Number
  },
  
  // Clinical
  chiefComplaint: String,
  diagnosis: [String],
  symptoms: [String],
  
  // Prescription
  prescription: [{
    medicineName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  
  prescriptionImage: String, // File path for uploaded prescription image
  
  // Lab results
  labReports: [{
    testName: String,
    result: String,
    normalRange: String,
    unit: String,
    reportFile: String,
    date: Date
  }],
  
  // AI Analysis
  aiAnalysis: {
    drugInteractions: [String],
    riskFactors: [String],
    recommendations: String,
    analyzedAt: Date
  },
  
  notes: String,
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
