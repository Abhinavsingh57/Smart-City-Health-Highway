const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // "10:00 AM - 10:30 AM"
  type: { type: String, enum: ['consultation', 'follow-up', 'emergency', 'teleconsultation'], default: 'consultation' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'], default: 'pending' },
  mode: { type: String, enum: ['in-person', 'video', 'phone'], default: 'in-person' },
  symptoms: { type: String },
  notes: { type: String },
  prescription: { type: String }, // File path or text
  diagnosis: { type: String },
  followUpDate: { type: Date },
  consultationFee: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'waived'], default: 'pending' },
  
  // AI features
  aiTriageScore: { type: Number, min: 1, max: 10 }, // AI severity score
  aiRecommendation: { type: String }, // AI recommendation
  aiSlotScore: { type: Number }, // AI optimal slot score
  
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
