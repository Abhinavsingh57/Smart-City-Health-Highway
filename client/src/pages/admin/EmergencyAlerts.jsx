import React, { useState, useEffect } from 'react';
import { getAlerts, resolveAlert as apiResolveAlert } from '../../api/api';
import { AlertTriangle, MapPin, Phone, Clock, CheckCircle, X, Ambulance } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const priorityColors = { critical: 'danger', high: 'warning', medium: 'primary', low: 'secondary' };

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { socket } = useSocket();

  useEffect(() => {
    getAlerts({ limit: 50, ...(filter !== 'all' && { status: filter }) })
      .then(res => setAlerts(res.data.alerts || []))
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false));

    if (socket) {
      socket.on('new_sos', (data) => {
        setAlerts(prev => [data, ...prev]);
        toast.error(`🚨 SOS Alert: ${data.patient?.name || 'Unknown'}`, { duration: 8000 });
      });
      return () => socket.off('new_sos');
    }
  }, [socket, filter]);

  const resolveAlert = async (id) => {
    try {
      await apiResolveAlert(id, { resolutionNotes: 'Resolved from admin dashboard' });
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, status: 'resolved' } : a));
      toast.success('Alert marked as resolved globally');
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1>Emergency Alerts</h1>
            {activeAlerts.length > 0 && (
              <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', animation: 'pulse 1.5s infinite' }}>
                {activeAlerts.length}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time SOS and emergency alerts from the city</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger-light)' }}>{activeAlerts.length}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>🔴 Active Alerts</div>
        </div>
        <div className="card" style={{ textAlign: 'center', background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-light)' }}>{resolvedAlerts.length}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>✅ Resolved Today</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{alerts.length}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📊 Total Alerts</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['all', 'pending', 'dispatched', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`, background: filter === f ? 'rgba(14,165,233,0.15)' : 'transparent', color: filter === f ? 'var(--primary-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', transition: 'var(--transition)' }}>
            {f}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? <div className="loading-center"><div className="spinner" /></div> : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <p>No emergency alerts</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {alerts.map(alert => (
            <div key={alert._id} className="card" style={{
              borderLeft: `4px solid ${alert.status === 'resolved' ? 'var(--secondary)' : 'var(--danger)'}`,
              background: alert.status !== 'resolved' ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)',
              opacity: alert.status === 'resolved' ? 0.7 : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>{alert.status === 'resolved' ? '✅' : '🚨'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{alert.patient?.name || 'Unknown Patient'}</div>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        <span style={{ textTransform: 'capitalize' }}>{alert.emergencyType || 'medical'} emergency</span>
                        {alert.patient?.phone && <span> · <Phone size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {alert.patient.phone}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge badge-${alert.status === 'resolved' ? 'success' : alert.status === 'dispatched' ? 'warning' : 'danger'}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  {alert.notes && (
                    <div style={{ marginTop: '0.6rem', padding: '0.6rem', background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{alert.notes}"
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {alert.location?.coordinates && (
                      <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {alert.location.coordinates[1]?.toFixed(4)}, {alert.location.coordinates[0]?.toFixed(4)}</span>
                    )}
                    <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {new Date(alert.createdAt).toLocaleString('en-IN')}</span>
                    {alert.ambulance && <span>🚑 Ambulance: {alert.ambulance.vehicleNumber}</span>}
                  </div>
                </div>

                {alert.status !== 'resolved' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => resolveAlert(alert._id)}>
                      <CheckCircle size={14} /> Resolve
                    </button>
                    {alert.location?.coordinates && (
                      <a href={`https://www.google.com/maps?q=${alert.location.coordinates[1]},${alert.location.coordinates[0]}`}
                        target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                        <MapPin size={14} /> View Map
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
