import React, { useState, useEffect } from 'react';
import { getPatientAppointments, bookAppointment, cancelAppointment, getDoctors, getSlotRecommendation, getDoctorSlots } from '../../api/api';
import { Calendar, Clock, Search, Plus, X, Sparkles, User, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = { pending: 'warning', confirmed: 'success', completed: 'primary', cancelled: 'danger' };

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRec, setAiRec] = useState(null);
  const [form, setForm] = useState({ doctor: '', date: '', timeSlot: '', symptoms: '', urgency: 'low', notes: '' });
  const [bookedSlots, setBookedSlots] = useState([]);

  const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

  useEffect(() => {
    Promise.all([getPatientAppointments(), getDoctors()])
      .then(([apptRes, docRes]) => {
        setAppointments(apptRes.data.appointments || []);
        setDoctors(docRes.data.doctors || []);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.doctor && form.date) {
      getDoctorSlots(form.doctor, { date: form.date })
        .then(res => setBookedSlots(res.data.bookedSlots || []))
        .catch(() => setBookedSlots([]));
    } else {
      setBookedSlots([]);
    }
  }, [form.doctor, form.date]);

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.doctor) { toast.error('Please select a doctor from the dropdown list'); return; }
    if (!form.date) { toast.error('Please select a date'); return; }
    if (!form.timeSlot) { toast.error('Please select a time slot'); return; }
    try {
      const payload = { ...form, doctorId: form.doctor };
      const res = await bookAppointment(payload);
      setAppointments(prev => [...prev, res.data.appointment]);
      setShowModal(false);
      setForm({ doctor: '', date: '', timeSlot: '', symptoms: '', urgency: 'low', notes: '' });
      setAiRec(null);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
      toast.success('Appointment cancelled');
    } catch { toast.error('Failed to cancel'); }
  };

  const getAiRecommendation = async () => {
    if (!form.symptoms || !form.doctor) { toast.error('Select a doctor and describe symptoms first'); return; }
    setAiLoading(true);
    try {
      const res = await getSlotRecommendation({ symptoms: form.symptoms, urgency: form.urgency, doctorId: form.doctor });
      setAiRec(res.data.recommendation);
    } catch { toast.error('AI recommendation unavailable'); }
    finally { setAiLoading(false); }
  };

  const now = new Date();
  const upcoming = appointments.filter(a => a.status !== 'cancelled' && new Date(a.date) >= now);
  const past = appointments.filter(a => a.status === 'cancelled' || new Date(a.date) < now);

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>My Appointments</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and book your healthcare appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Book Appointment</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        {[['upcoming', `Upcoming (${upcoming.length})`], ['past', `Past (${past.length})`]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', background: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? 'white' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(activeTab === 'upcoming' ? upcoming : past).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>{activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}</p>
            </div>
          ) : (
            (activeTab === 'upcoming' ? upcoming : past).map(appt => (
              <div key={appt._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', background: 'rgba(14,165,233,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--primary-light)', fontWeight: 700 }}>{new Date(appt.date).toLocaleDateString('en-IN', { month: 'short' }).toUpperCase()}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>{new Date(appt.date).getDate()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>Dr. {appt.doctor?.name || 'N/A'}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    <span>{appt.doctor?.specialization || 'General Medicine'}</span>
                    <span style={{ margin: '0 0.5rem' }}>·</span>
                    <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {appt.timeSlot}
                  </div>
                  {appt.symptoms && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>"{appt.symptoms}"</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge badge-${statusColors[appt.status] || 'primary'}`}>{appt.status}</span>
                  {appt.status === 'pending' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(appt._id)}><X size={14} /> Cancel</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Book Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>Book Appointment</h2>
              <button onClick={() => { setShowModal(false); setAiRec(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Doctor Selection */}
              <div className="form-group">
                <label className="form-label">Select Doctor *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <select className="form-select" value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value }))} required style={{ paddingLeft: '2.5rem' }}>
                    <option value="">-- Choose a Doctor --</option>
                    {doctors.map(doc => (
                      <option key={doc._id} value={doc._id}>Dr. {doc.name} ({doc.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={form.date} min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Slot *</label>
                  <select className="form-select" value={form.timeSlot} onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))} required>
                    <option value="">Select a slot</option>
                    {slots.filter(s => !bookedSlots.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div className="form-group">
                <label className="form-label">Symptoms / Reason</label>
                <textarea className="form-textarea" placeholder="Describe your symptoms..." value={form.symptoms}
                  onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} style={{ minHeight: '80px' }} />
              </div>

              {/* Urgency */}
              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['low', 'medium', 'high'].map(u => (
                    <button key={u} type="button" onClick={() => setForm(f => ({ ...f, urgency: u }))}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize', border: `1px solid ${form.urgency === u ? (u === 'high' ? 'var(--danger)' : u === 'medium' ? 'var(--warning)' : 'var(--secondary)') : 'var(--border)'}`, background: form.urgency === u ? (u === 'high' ? 'rgba(239,68,68,0.15)' : u === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)') : 'transparent', color: form.urgency === u ? (u === 'high' ? 'var(--danger-light)' : u === 'medium' ? 'var(--warning-light)' : 'var(--secondary-light)') : 'var(--text-secondary)' }}>
                      {u === 'low' ? '🟢' : u === 'medium' ? '🟡' : '🔴'} {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Recommendation */}
              <button type="button" className="btn btn-ghost" onClick={getAiRecommendation} disabled={aiLoading}>
                <Sparkles size={16} color="var(--accent-light)" /> {aiLoading ? 'Getting AI suggestion...' : 'Get AI Slot Recommendation'}
              </button>

              {aiRec && (
                <div style={{ padding: '1rem', background: 'rgba(139,92,246,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <div className="ai-chip" style={{ marginBottom: '0.5rem' }}><Sparkles size={12} /> AI Recommendation</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{typeof aiRec === 'string' ? aiRec : aiRec.recommendation || JSON.stringify(aiRec)}</p>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full">
                <Calendar size={18} /> Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
