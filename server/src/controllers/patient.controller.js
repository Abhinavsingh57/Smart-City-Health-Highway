const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const EmergencyAlert = require('../models/EmergencyAlert');

// Get patient appointments
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name specialization hospitalAffiliation avatar rating')
      .sort({ date: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    console.log('[DEBUG] Book Appointment Payload:', req.body);
    const { doctorId, date, timeSlot, type, mode, symptoms } = req.body;
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      console.error('[DEBUG] Doctor not found:', doctorId);
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    const appointment = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      type: type || 'consultation',
      mode: mode || 'in-person',
      symptoms,
      consultationFee: doctor.consultationFee,
      status: 'pending'
    });
    await appointment.save();
    const populated = await appointment.populate('doctor', 'name specialization');
    console.log('[DEBUG] Appointment booked successfully');
    res.status(201).json({ success: true, message: 'Appointment booked!', appointment: populated });
  } catch (error) {
    console.error('[DEBUG] Book Appointment Error:', error);
    res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel appointment' });
  }
};

// Get health records
const getHealthRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find({ patient: req.user._id })
      .populate('doctor', 'name specialization')
      .sort({ visitDate: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch health records' });
  }
};

// Send SOS
const sendSOS = async (req, res) => {
  try {
    console.log('[DEBUG] Send SOS Payload:', req.body);
    const { lat, lng, address, condition, conditionDescription } = req.body;
    const alert = new EmergencyAlert({
      patient: req.user._id,
      patientName: req.user.name,
      patientPhone: req.user.phone,
      abhaId: req.user.abhaId,
      location: { lat, lng, address },
      condition: condition || 'other',
      conditionDescription,
      severity: 'high',
      status: 'pending',
      timeline: [{ event: 'SOS Triggered by patient', timestamp: new Date() }]
    });
    await alert.save();

    // Broadcast via Socket.io
    const io = req.app.get('io');
    io.emit('patient:sos:alert', {
      alertId: alert._id,
      patientId: req.user._id,
      patientName: req.user.name,
      patientPhone: req.user.phone,
      abhaId: req.user.abhaId,
      lat, lng, address,
      condition,
      conditionDescription,
      severity: 'high',
      timestamp: new Date()
    });
    console.log('[DEBUG] SOS saved and broadcasted successfully');
    res.status(201).json({ success: true, message: 'SOS sent! Help is on the way.', alert });
  } catch (error) {
    console.error('[DEBUG] Send SOS Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send SOS' });
  }
};

// Get patient dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const patientId = req.user._id;
    const [totalAppointments, upcomingAppointments, totalRecords, activeAlerts] = await Promise.all([
      Appointment.countDocuments({ patient: patientId }),
      Appointment.countDocuments({ patient: patientId, status: 'confirmed', date: { $gte: new Date() } }),
      HealthRecord.countDocuments({ patient: patientId }),
      EmergencyAlert.countDocuments({ patient: patientId, status: { $nin: ['resolved', 'false_alarm'] } })
    ]);

    const recentRecords = await HealthRecord.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort({ visitDate: -1 }).limit(3);

    const upcomingAppointmentsList = await Appointment.find({ 
      patient: patientId, 
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: new Date() }
    }).populate('doctor', 'name specialization avatar').sort({ date: 1 }).limit(4);

    res.json({ 
      success: true, 
      stats: { totalAppointments, upcomingAppointments, totalRecords, activeAlerts }, 
      recentRecords, 
      upcomingAppointmentsList 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
};

// Get booked slots for a doctor on a specific date
const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!doctorId || !date) return res.json({ success: true, bookedSlots: [] });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');

    const bookedSlots = appointments.map(a => a.timeSlot);
    res.json({ success: true, bookedSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch slots' });
  }
};

module.exports = { getAppointments, bookAppointment, cancelAppointment, getHealthRecords, sendSOS, getDashboardStats, getDoctorSlots };
