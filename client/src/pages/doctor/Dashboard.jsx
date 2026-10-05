import React, { useState, useEffect } from 'react';
import { getDoctorDashboard, getDoctorAppointments, updateAppointment } from '../../api/api';
import { Calendar, Users, Clock, CheckCircle, XCircle, Clock3, TrendingUp, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const statusIcons = { pending: <Clock3 size={14} />, confirmed: <CheckCircle size={14} />, completed: <CheckCircle size={14} />, cancelled: <XCircle size={14} /> };
const statusColors = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'danger' };

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  const fetchDashboardData = () => {
    Promise.all([getDoctorDashboard(), getDoctorAppointments({ filter })])
      .then(([dashRes, apptRes]) => {
        setStats(dashRes.data);
        setAppointments(apptRes.data.appointments || []);
      })
      .catch((err) => {
        console.error('Failed to update dashboard real-time:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
    
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [filter]);

  const handleStatusUpdate = async (id, status, notes) => {
    try {
      await updateAppointment(id, { status, notes });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Appointment ${status}`);
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', align: 'center', gap: '1rem' }}>
          <h1>Dr. {user?.name?.split(' ').slice(-1)[0]}'s Dashboard</h1>
          <span className="badge badge-primary">{user?.specialization}</span>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your appointments and patients</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: "Today's Appointments", value: stats?.todayAppointments ?? 0, icon: <Calendar size={22} />, color: 'var(--primary)', bg: 'rgba(14,165,233,0.15)' },
          { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: <Users size={22} />, color: 'var(--secondary)', bg: 'rgba(16,185,129,0.15)' },
          { label: 'Pending', value: stats?.pendingAppointments ?? 0, icon: <Clock size={22} />, color: 'var(--warning)', bg: 'rgba(245,158,11,0.15)' },
          { label: 'Completed This Month', value: stats?.completedThisMonth ?? 0, icon: <TrendingUp size={22} />, color: 'var(--accent)', bg: 'rgba(139,92,246,0.15)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Appointments */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div className="section-title" style={{ marginBottom: 0 }}><Calendar size={18} /> Appointments</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['today', 'week', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize', background: filter === f ? 'var(--primary)' : 'var(--bg-glass-light)', color: filter === f ? 'white' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p>No appointments {filter === 'today' ? 'today' : `this ${filter}`}</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Patient</th><th>Date & Time</th><th>Symptoms</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{appt.patient?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{appt.patient?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} /> {appt.timeSlot}</div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {appt.symptoms || 'Not specified'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${statusColors[appt.status]}`}>
                        {statusIcons[appt.status]} {appt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {appt.status === 'pending' && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleStatusUpdate(appt._id, 'confirmed')}>Confirm</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleStatusUpdate(appt._id, 'cancelled')}>Decline</button>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(appt._id, 'completed')}>
                            <CheckCircle size={13} /> Complete
                          </button>
                        )}
                        {(appt.status === 'completed' || appt.status === 'cancelled') && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
