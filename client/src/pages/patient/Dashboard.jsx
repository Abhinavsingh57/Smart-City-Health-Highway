import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientDashboard } from '../../api/api';
import { Activity, Calendar, FileText, AlertCircle, Heart, Thermometer, Droplets, Wind } from 'lucide-react';
import toast from 'react-hot-toast';

function ABHACard({ user }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 50%, #10b981 100%)',
      borderRadius: 'var(--radius-xl)', padding: '1.75rem', position: 'relative', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(14,165,233,0.3)'
    }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -30, left: 60, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'relative' }}>
        <div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.15em', fontWeight: 700, opacity: 0.8, marginBottom: '0.2rem' }}>AYUSHMAN BHARAT HEALTH ACCOUNT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}>
            {user?.abhaId?.replace(/(\d{2})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4') || '00-0000-0000-0000'}
          </div>
        </div>
        <div style={{ fontSize: '2.5rem', opacity: 0.9 }}>🏥</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
        <div>
          <div style={{ fontSize: '0.7rem', opacity: 0.75, marginBottom: '0.2rem' }}>ACCOUNT HOLDER</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name || 'Patient Name'}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.1rem' }}>{user?.gender} · {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '--'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>BLOOD GROUP</div>
          <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{user?.bloodGroup || 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}

function VitalCard({ icon, label, value, unit, color, subtext }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '1.2rem' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `rgba(${color},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: `rgb(${color})` }}>
        {icon}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{value} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>{unit}</span></div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{label}</div>
      {subtext && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{subtext}</div>}
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPatientDashboard()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const appointments = data?.upcomingAppointmentsList || [];
  const activeAlertsCount = data?.stats?.activeAlerts || 0;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here's your health overview for today</p>
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(14,165,233,0.15)', color: 'var(--primary-light)' }}><Calendar size={24} /></div>
          <div><div className="stat-value">{data?.stats?.totalAppointments ?? '--'}</div><div className="stat-label">Total Appointments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--secondary-light)' }}><FileText size={24} /></div>
          <div><div className="stat-value">{data?.stats?.totalRecords ?? '--'}</div><div className="stat-label">Health Records</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-light)' }}><Activity size={24} /></div>
          <div><div className="stat-value">{data?.stats?.upcomingAppointments ?? '--'}</div><div className="stat-label">Upcoming</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger-light)' }}><AlertCircle size={24} /></div>
          <div><div className="stat-value">{activeAlertsCount}</div><div className="stat-label">Active Alerts</div></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.5rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ABHA Card */}
          <div>
            <div className="section-title">🪪 ABHA Health ID</div>
            <ABHACard user={user} />
          </div>

          {/* Vitals */}
          <div>
            <div className="section-title"><Heart size={18} color="var(--danger-light)" /> Vitals Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <VitalCard icon={<Heart size={20} />} label="Heart Rate" value={data?.latestVitals?.heartRate || '72'} unit="bpm" color="239,68,68" subtext="Normal" />
              <VitalCard icon={<Thermometer size={20} />} label="Temperature" value={data?.latestVitals?.temperature || '98.6'} unit="°F" color="245,158,11" subtext="Normal" />
              <VitalCard icon={<Droplets size={20} />} label="SpO2" value={data?.latestVitals?.oxygenSaturation || '98'} unit="%" color="14,165,233" subtext="Excellent" />
              <VitalCard icon={<Wind size={20} />} label="BP" value={data?.latestVitals?.bloodPressure || '120/80'} unit="mmHg" color="139,92,246" subtext="Normal" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upcoming Appointments */}
          <div className="card">
            <div className="section-title"><Calendar size={18} /> Upcoming Appointments</div>
            {loading ? <div className="loading-center"><div className="spinner" /></div> :
              appointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <p>No upcoming appointments</p>
                  <a href="/patient/appointments" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', display: 'inline-flex' }}>Book Now</a>
                </div>
              ) : appointments.slice(0, 4).map(appt => (
                <div key={appt._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem', background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-md)', marginBottom: '0.6rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(14,165,233,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 700 }}>{new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{new Date(appt.date).getDate()}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.doctor?.name || 'Dr. N/A'}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{appt.doctor?.specialization || 'General'} · {appt.timeSlot}</div>
                  </div>
                  <span className={`badge badge-${appt.status === 'confirmed' ? 'success' : appt.status === 'pending' ? 'warning' : 'danger'}`}>{appt.status}</span>
                </div>
              ))
            }
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="section-title">⚡ Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { icon: '🧠', label: 'AI Symptom Check', href: '/patient/symptom-checker', color: 'var(--accent)' },
                { icon: '🚑', label: 'Emergency SOS', href: '/patient/ambulance', color: 'var(--danger)' },
                { icon: '📅', label: 'Book Appointment', href: '/patient/appointments', color: 'var(--primary)' },
                { icon: '📋', label: 'Health Records', href: '/patient/health-records', color: 'var(--secondary)' },
              ].map(action => (
                <a key={action.label} href={action.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                  background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-primary)',
                  transition: 'var(--transition)', cursor: 'pointer'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-glass-light)'; }}>
                  <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{action.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Chronic Conditions */}
          {user?.chronicConditions?.length > 0 && (
            <div className="card" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
              <div className="section-title"><AlertCircle size={18} color="var(--warning)" /> Chronic Conditions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user.chronicConditions.map(c => (
                  <span key={c} className="badge badge-warning">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
