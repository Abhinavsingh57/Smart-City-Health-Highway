import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIHealthChat from '../components/AIHealthChat';
import {
  LayoutDashboard, Calendar, FileText, Stethoscope,
  Ambulance, LogOut, Menu, X, Bell, User, ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patient/health-records', icon: FileText, label: 'Health Records' },
  { to: '/patient/symptom-checker', icon: Stethoscope, label: 'AI Symptom Check' },
  { to: '/patient/ambulance', icon: Ambulance, label: '🚑 Emergency' },
];

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const { isConnected, sosAlerts } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🏥</div>
          {sidebarOpen && <div><div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Smart City</div><div style={{ fontSize: '0.7rem', color: 'var(--primary-light)' }}>Health Highway</div></div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* User info */}
        {sidebarOpen && (
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)' }}>ABHA: {user?.abhaId?.substring(0, 9)}...</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', borderRadius: '10px', marginBottom: '2px',
              textDecoration: 'none', color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
              background: isActive ? 'rgba(14,165,233,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(14,165,233,0.2)' : '1px solid transparent',
              transition: 'var(--transition)', fontWeight: isActive ? 600 : 400, fontSize: '0.875rem',
              overflow: 'hidden', whiteSpace: 'nowrap'
            })}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid var(--border)' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.9rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: isConnected ? 'var(--secondary-light)' : 'var(--text-muted)' }}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isConnected ? 'Live Connected' : 'Connecting...'}
            </div>
          )}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger-light)',
            cursor: 'pointer', width: '100%', fontSize: '0.875rem', fontWeight: 600
          }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: sidebarOpen ? '260px' : '72px', transition: 'margin-left 0.3s ease', minHeight: '100vh', overflowX: 'hidden' }}>
        <Outlet />
      </main>

      {/* AI Chat Widget */}
      <AIHealthChat />
    </div>
  );
}
