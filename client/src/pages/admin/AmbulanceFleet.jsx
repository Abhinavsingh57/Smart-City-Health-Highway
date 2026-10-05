import React, { useState, useEffect } from 'react';
import { getAdminAmbulances, addAmbulance, updateAmbulance, dispatchAmbulance } from '../../api/api';
import { Truck, Plus, X, MapPin, Phone, User, CheckCircle, Activity, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = { available: 'success', dispatched: 'warning', maintenance: 'danger', offline: 'primary' };
const statusEmoji = { available: '🟢', dispatched: '🟡', maintenance: '🔴', offline: '⚫' };

export default function AmbulanceFleet() {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ vehicleNumber: '', type: 'BLS', driver: { name: '', phone: '' }, equipment: [] });

  const equipmentOptions = ['Defibrillator', 'Ventilator', 'ECG Monitor', 'IV Set', 'Oxygen Cylinder', 'Stretcher', 'CPR Kit', 'BP Monitor'];

  useEffect(() => {
    getAdminAmbulances()
      .then(res => setAmbulances(res.data.ambulances || []))
      .catch(() => toast.error('Failed to load fleet'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await addAmbulance(form);
      setAmbulances(prev => [...prev, res.data.ambulance]);
      setShowAdd(false);
      setForm({ vehicleNumber: '', type: 'BLS', driver: { name: '', phone: '' }, equipment: [] });
      toast.success('Ambulance added to fleet!');
    } catch { toast.error('Failed to add ambulance'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAmbulance(id, { status });
      setAmbulances(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const toggleEquipment = (eq) => {
    setForm(f => ({
      ...f, equipment: f.equipment.includes(eq) ? f.equipment.filter(e => e !== eq) : [...f.equipment, eq]
    }));
  };

  const filtered = filter === 'all' ? ambulances : ambulances.filter(a => a.status === filter);

  const stats = {
    total: ambulances.length,
    available: ambulances.filter(a => a.status === 'available').length,
    dispatched: ambulances.filter(a => a.status === 'dispatched').length,
    maintenance: ambulances.filter(a => a.status === 'maintenance').length,
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Ambulance Fleet</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and dispatch the city emergency vehicle fleet</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={18} /> Add Ambulance</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Fleet', value: stats.total, color: 'var(--primary)', emoji: '🚑' },
          { label: 'Available', value: stats.available, color: 'var(--secondary)', emoji: '🟢' },
          { label: 'Dispatched', value: stats.dispatched, color: 'var(--warning)', emoji: '🟡' },
          { label: 'Maintenance', value: stats.maintenance, color: 'var(--danger)', emoji: '🔴' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.emoji}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {['all', 'available', 'dispatched', 'maintenance', 'offline'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`, background: filter === f ? 'rgba(14,165,233,0.15)' : 'transparent', color: filter === f ? 'var(--primary-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', transition: 'var(--transition)' }}>
            {statusEmoji[f] || '🚑'} {f}
          </button>
        ))}
      </div>

      {/* Fleet Grid */}
      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div className="grid-3">
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-state-icon">🚑</div>
              <p>No ambulances in this category</p>
            </div>
          ) : filtered.map(amb => (
            <div key={amb._id} className="card" style={{ borderTop: `3px solid ${amb.status === 'available' ? 'var(--secondary)' : amb.status === 'dispatched' ? 'var(--warning)' : 'var(--danger)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{amb.vehicleNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{amb.type || 'BLS'} Ambulance</div>
                </div>
                <span className={`badge badge-${statusColors[amb.status] || 'primary'}`}>{statusEmoji[amb.status]} {amb.status}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <User size={14} color="var(--primary-light)" /> {amb.driver?.name || 'Unassigned'}
                </div>
                {amb.driver?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Phone size={14} color="var(--secondary-light)" /> {amb.driver.phone}
                  </div>
                )}
                {amb.currentLocation?.coordinates && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} color="var(--accent-light)" />
                    {amb.currentLocation.coordinates[1]?.toFixed(4)}, {amb.currentLocation.coordinates[0]?.toFixed(4)}
                  </div>
                )}
              </div>

              {amb.equipment?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                  {amb.equipment.slice(0, 3).map(eq => (
                    <span key={eq} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--bg-glass-light)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{eq}</span>
                  ))}
                  {amb.equipment.length > 3 && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{amb.equipment.length - 3} more</span>}
                </div>
              )}

              {/* Status actions */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {amb.status !== 'available' && (
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleStatusUpdate(amb._id, 'available')}>
                    <CheckCircle size={12} /> Available
                  </button>
                )}
                {amb.status !== 'maintenance' && (
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleStatusUpdate(amb._id, 'maintenance')}>
                    <Activity size={12} /> Maintenance
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Ambulance Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)' }}>Add Ambulance</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Vehicle Number *</label>
                  <input type="text" className="form-input" placeholder="DL-1C-A-1234" value={form.vehicleNumber}
                    onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="BLS">BLS (Basic)</option>
                    <option value="ALS">ALS (Advanced)</option>
                    <option value="ICU">Mobile ICU</option>
                    <option value="Neonatal">Neonatal</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Driver Name *</label>
                  <input type="text" className="form-input" placeholder="Ramesh Kumar" value={form.driver.name}
                    onChange={e => setForm(f => ({ ...f, driver: { ...f.driver, name: e.target.value } }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Driver Phone</label>
                  <input type="tel" className="form-input" placeholder="+91 98765..." value={form.driver.phone}
                    onChange={e => setForm(f => ({ ...f, driver: { ...f.driver, phone: e.target.value } }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Equipment</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {equipmentOptions.map(eq => (
                    <button key={eq} type="button" onClick={() => toggleEquipment(eq)}
                      style={{ padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: `1px solid ${form.equipment.includes(eq) ? 'var(--primary)' : 'var(--border)'}`, background: form.equipment.includes(eq) ? 'rgba(14,165,233,0.15)' : 'transparent', color: form.equipment.includes(eq) ? 'var(--primary-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', transition: 'var(--transition)' }}>
                      {eq}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '0.5rem' }}>
                <Truck size={16} /> Add to Fleet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
