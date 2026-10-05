const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, updateUser, getAmbulances, addAmbulance, updateAmbulance, dispatchAmbulance, getAlerts, resolveAlert, getHeatmapData } = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/ambulances', getAmbulances);
router.post('/ambulances', addAmbulance);
router.put('/ambulances/:id', updateAmbulance);
router.post('/ambulances/dispatch', dispatchAmbulance);
router.get('/alerts', getAlerts);
router.put('/alerts/:id/resolve', resolveAlert);
router.get('/heatmap', getHeatmapData);

module.exports = router;
