const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');

// Get doctor's appointments
const getAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;
    const query = { doctor: req.user._id };
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }
    const appointments = await Appointment.find(query)
      .populate('patient', 'name phone abhaId bloodGroup chronicConditions allergies dateOfBirth gender avatar')
      .sort({ date: 1, timeSlot: 1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
};

// Update appointment status
const updateAppointment = async (req, res) => {
  try {
    const { status, diagnosis, notes, prescription, followUpDate } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      { status, diagnosis, notes, followUpDate },
      { new: true }
    ).populate('patient', 'name phone abhaId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Create health record if completing appointment
    if (status === 'completed' && diagnosis) {
      const record = new HealthRecord({
        patient: appointment.patient._id,
        doctor: req.user._id,
        appointment: appointment._id,
        visitDate: appointment.date,
        visitType: 'OPD',
        chiefComplaint: appointment.symptoms,
        diagnosis: [diagnosis],
        notes,
        prescription: prescription ? prescription.split(',').map(p => ({
          medicineName: p.trim(),
          dosage: 'As prescribed',
          frequency: 'As prescribed',
          duration: 'As prescribed'
        })) : [],
        followUpRequired: !!followUpDate,
        followUpDate
      });
      await record.save();
    }
    res.json({ success: true, message: 'Appointment updated', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
};

// Get patient list (unique patients of this doctor)
const getMyPatients = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id, status: 'completed' })
      .distinct('patient');
    const patients = await User.find({ _id: { $in: appointments } })
      .select('name phone abhaId bloodGroup chronicConditions allergies dateOfBirth gender avatar createdAt');
    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch patients' });
  }
};

// Get patient health records
const getPatientRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find({ patient: req.params.patientId, doctor: req.user._id })
      .sort({ visitDate: -1 });
    const patient = await User.findById(req.params.patientId).select('-password');
    res.json({ success: true, patient, records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch patient records' });
  }
};

// Add health record (prescription etc)
const addHealthRecord = async (req, res) => {
  try {
    const { patient, patientId, appointmentId, vitals, chiefComplaint, diagnosis, prescription, notes, labReports, type, title, description } = req.body;
    let { medications } = req.body;
    
    // Parse medications if sent as JSON string via FormData
    if (typeof medications === 'string') {
      try { medications = JSON.parse(medications); } catch (e) { medications = []; }
    }

    const record = new HealthRecord({
      patient: patient || patientId,
      doctor: req.user._id,
      appointment: appointmentId,
      visitDate: new Date(),
      visitType: 'OPD',
      title,
      recordType: type,
      description,
      vitals,
      chiefComplaint,
      diagnosis: Array.isArray(diagnosis) ? diagnosis : (diagnosis ? [diagnosis] : []),
      prescription: medications ? medications.map(m => ({
        medicineName: m.name || m.medicineName,
        dosage: m.dosage,
        frequency: m.frequency
      })) : (prescription || []),
      notes,
      labReports: labReports || [],
      fileUrl: req.file ? req.file.filename : undefined
    });
    await record.save();
    res.status(201).json({ success: true, message: 'Health record added', record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add health record' });
  }
};

// Doctor dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayAppointments, totalPatients, pendingAppointments, completedThisMonth] = await Promise.all([
      Appointment.countDocuments({ doctor: doctorId, date: { $gte: today, $lt: tomorrow } }),
      Appointment.distinct('patient', { doctor: doctorId, status: 'completed' }).then(p => p.length),
      Appointment.countDocuments({ doctor: doctorId, status: 'pending' }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed', date: { $gte: startOfMonth } })
    ]);

    const upcomingAppointments = await Appointment.find({ 
      doctor: doctorId, 
      status: { $in: ['pending', 'confirmed'] },
      date: { $gte: today }
    }).populate('patient', 'name phone abhaId bloodGroup avatar gender').sort({ date: 1 }).limit(5);

    res.json({ success: true, todayAppointments, totalPatients, pendingAppointments, completedThisMonth, upcomingAppointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
};

module.exports = { getAppointments, updateAppointment, getMyPatients, getPatientRecords, addHealthRecord, getDashboardStats };
