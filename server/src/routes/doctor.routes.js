const express = require('express');
const router = express.Router();
const { getAppointments, updateAppointment, getMyPatients, getPatientRecords, addHealthRecord, getDashboardStats } = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.use(authenticate, authorize('doctor'));
router.get('/dashboard', getDashboardStats);
router.get('/appointments', getAppointments);
router.put('/appointments/:id', updateAppointment);
router.get('/patients', getMyPatients);
router.get('/patients/:patientId/records', getPatientRecords);
router.post('/health-records', upload.single('prescriptionImage'), addHealthRecord);

module.exports = router;
