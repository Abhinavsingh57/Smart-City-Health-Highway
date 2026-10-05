import api from './axios.instance';

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data) => api.put('/auth/profile', data);
export const getDoctors = (params) => api.get('/auth/doctors', { params });

// Patient
export const getPatientDashboard = () => api.get('/patient/dashboard');
export const getPatientAppointments = () => api.get('/patient/appointments');
export const bookAppointment = (data) => api.post('/patient/appointments', data);
export const cancelAppointment = (id) => api.put(`/patient/appointments/${id}/cancel`);
export const getHealthRecords = () => api.get('/patient/health-records');
export const sendSOS = (data) => api.post('/patient/sos', data);
export const getDoctorSlots = (doctorId, params) => api.get(`/patient/doctors/${doctorId}/slots`, { params });

// Doctor
export const getDoctorDashboard = () => api.get('/doctor/dashboard');
export const getDoctorAppointments = (params) => api.get('/doctor/appointments', { params });
export const updateAppointment = (id, data) => api.put(`/doctor/appointments/${id}`, data);
export const getMyPatients = () => api.get('/doctor/patients');
export const getPatientRecords = (patientId) => api.get(`/doctor/patients/${patientId}/records`);
export const addHealthRecord = (data) => api.post('/doctor/health-records', data);

// Admin
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getUsers = (params) => api.get('/admin/users', { params });
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const getAdminAmbulances = () => api.get('/admin/ambulances');
export const addAmbulance = (data) => api.post('/admin/ambulances', data);
export const updateAmbulance = (id, data) => api.put(`/admin/ambulances/${id}`, data);
export const dispatchAmbulance = (data) => api.post('/admin/ambulances/dispatch', data);
export const getAlerts = (params) => api.get('/admin/alerts', { params });
export const resolveAlert = (id, data) => api.put(`/admin/alerts/${id}/resolve`, data);
export const getHeatmapData = () => api.get('/admin/heatmap');

// Ambulance
export const getAmbulances = () => api.get('/ambulance');

// AI
export const triageSymptoms = (data) => api.post('/ai/triage', data);
export const aiChat = (data) => api.post('/ai/chat', data);

export const getSlotRecommendation = (data) => api.post('/ai/slot-recommendation', data);
export const getChatHistory = () => api.get('/ai/chat-history');
