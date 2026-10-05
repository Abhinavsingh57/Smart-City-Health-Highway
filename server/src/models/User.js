const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin', 'ambulance_driver'], default: 'patient' },
  
  // ABHA ID - Generated on patient registration
  abhaId: { type: String, unique: true, sparse: true },
  abhaQRCode: { type: String }, // Base64 QR code image
  
  // Profile
  avatar: { type: String, default: '' },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  address: {
    street: String,
    city: { type: String, default: 'Delhi' },
    state: { type: String, default: 'Delhi' },
    pincode: String
  },

  // Patient specific
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  allergies: [String],
  chronicConditions: [String],
  currentMedications: [String],
  insuranceId: String,
  
  // Doctor specific
  specialization: String,
  qualification: [String],
  licenseNumber: String,
  experience: Number,
  consultationFee: Number,
  hospitalAffiliation: String,
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  rating: { type: Number, default: 4.5 },
  totalPatients: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  
  // Ambulance Driver specific
  vehicleNumber: String,
  vehicleType: String,
  currentLocation: {
    lat: Number,
    lng: Number
  },
  isOnDuty: { type: Boolean, default: false },
  
  // System
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
