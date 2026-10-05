const express = require('express');
const router = express.Router();
const { getAppointments, bookAppointment, cancelAppointment, getHealthRecords, sendSOS, getDashboardStats, getDoctorSlots } = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('patient'));
router.get('/dashboard', getDashboardStats);
router.get('/appointments', getAppointments);
router.post('/appointments', bookAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);
router.get('/health-records', getHealthRecords);
router.post('/sos', sendSOS);
router.get('/doctors/:doctorId/slots', getDoctorSlots);

module.exports = router;
