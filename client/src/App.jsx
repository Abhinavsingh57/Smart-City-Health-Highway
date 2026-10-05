import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ChatWidget from './components/chat/ChatWidget';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient Pages
import PatientLayout from './layouts/PatientLayout';
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientHealthRecords from './pages/patient/HealthRecords';
import SymptomChecker from './pages/patient/SymptomChecker';
import AmbulanceTrack from './pages/patient/AmbulanceTrack';

// Doctor Pages
import DoctorLayout from './layouts/DoctorLayout';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AmbulanceFleet from './pages/admin/AmbulanceFleet';
import UserManagement from './pages/admin/UserManagement';
import EmergencyAlerts from './pages/admin/EmergencyAlerts';

// Route Guards
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (user) {
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Patient Routes */}
      <Route path="/patient" element={<PrivateRoute roles={['patient']}><PatientLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="health-records" element={<PatientHealthRecords />} />
        <Route path="symptom-checker" element={<SymptomChecker />} />
        <Route path="ambulance" element={<AmbulanceTrack />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={<PrivateRoute roles={['doctor']}><DoctorLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="ambulances" element={<AmbulanceFleet />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="alerts" element={<EmergencyAlerts />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#111827', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' },
              duration: 4000
            }}
          />
          <AppRoutes />
          <ChatWidget />
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
