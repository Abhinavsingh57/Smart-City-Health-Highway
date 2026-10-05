const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true },
  sessionId: { type: String, required: true }, // Group messages by session
  
  messages: [{
    sender: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['text', 'symptom_analysis', 'prescription_analysis', 'health_advice', 'emergency'], default: 'text' },
    metadata: { type: mongoose.Schema.Types.Mixed } // Extra data (triage score, medicines list, etc.)
  }],
  
  topic: String, // "Fever symptoms", "Drug interaction check", etc.
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
