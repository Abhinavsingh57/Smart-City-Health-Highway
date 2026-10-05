import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIHealthChat from '../components/AIHealthChat';
import { LayoutDashboard, Users, FileSearch, LogOut, Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/patients', icon: Users, label: 'My Patients' },
];

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <aside style={{ width: sidebarOpen ? '260px' : '72px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', flexShrink: 0, position: 'fixed', height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--secondary), #0284c7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>👨‍⚕️</div>
          {sidebarOpen && <div><div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }}>Doctor Portal</div><div style={{ fontSize: '0.7rem', color: 'var(--secondary-light)' }}>Smart Health Highway</div></div>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>{sidebarOpen ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
        {sidebarOpen && (
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Dr. {user?.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--secondary-light)' }}>{user?.specialization || 'General Medicine'}</div>
              </div>
            </div>
          </div>
        )}
        <nav style={{ flex: 1, padding: '0.75rem 0.5rem' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', borderRadius: '10px', marginBottom: '2px', textDecoration: 'none', color: isActive ? 'var(--secondary-light)' : 'var(--text-secondary)', background: isActive ? 'rgba(16,185,129,0.1)' : 'transparent', border: isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent', transition: 'var(--transition)', fontWeight: isActive ? 600 : 400, fontSize: '0.875rem', overflow: 'hidden', whiteSpace: 'nowrap' })}>
              <Icon size={18} style={{ flexShrink: 0 }} />{sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0.9rem', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger-light)', cursor: 'pointer', width: '100%', fontSize: '0.875rem', fontWeight: 600 }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />{sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, marginLeft: sidebarOpen ? '260px' : '72px', transition: 'margin-left 0.3s ease', minHeight: '100vh' }}>
        <Outlet />
      </main>
      <AIHealthChat />
    </div>
  );
}
