import React, { useState, useEffect } from 'react';
import { getMyPatients, getPatientRecords, addHealthRecord } from '../../api/api';
import { Users, Search, FileText, Plus, X, Pill, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

const typeOptions = ['diagnosis', 'prescription', 'lab_report', 'imaging', 'checkup', 'surgery'];

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({ type: 'diagnosis', title: '', diagnosis: '', description: '', medications: [], notes: '', document: null });
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });

  useEffect(() => {
    getMyPatients()
      .then(res => setPatients(res.data.patients || []))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const selectPatient = async (patient) => {
    setSelected(patient);
    setRecords([]);
    setShowAddRecord(false);
    try {
      const res = await getPatientRecords(patient._id);
      setRecords(res.data.records || []);
    } catch { toast.error('Could not load patient records'); }
  };

  const handleAddMed = () => {
    if (!newMed.name) return;
    setRecordForm(f => ({ ...f, medications: [...f.medications, newMed] }));
    setNewMed({ name: '', dosage: '', frequency: '' });
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('type', recordForm.type);
      formData.append('title', recordForm.title);
      formData.append('diagnosis', recordForm.diagnosis);
      formData.append('description', recordForm.description);
      formData.append('notes', recordForm.notes);
      formData.append('patientId', selected._id);
      formData.append('medications', JSON.stringify(recordForm.medications));
      if (recordForm.document) formData.append('prescriptionImage', recordForm.document);

      const res = await addHealthRecord(formData);
      setRecords(prev => [...prev, res.data.record]);
      setShowAddRecord(false);
      setRecordForm({ type: 'diagnosis', title: '', diagnosis: '', description: '', medications: [], notes: '', document: null });
      toast.success('Health record added!');
    } catch { toast.error('Failed to add record'); }
  };

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.abhaId?.includes(search)
  );

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>My Patients</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View patient profiles and manage health records</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Patient List Sidebar */}
        <div>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="form-input" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>

          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <div className="empty-state-icon">👤</div>
                  <p style={{ fontSize: '0.85rem' }}>No patients found</p>
                </div>
              ) : filtered.map(p => (
                <div key={p._id} onClick={() => selectPatient(p)}
                  className="card" style={{ cursor: 'pointer', padding: '1rem', borderColor: selected?._id === p._id ? 'var(--primary)' : 'var(--border)', background: selected?._id === p._id ? 'rgba(14,165,233,0.07)' : 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                      {p.name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.abhaId ? `ABHA: ${p.abhaId.substring(0, 8)}...` : p.email}</div>
                    </div>
                  </div>
                  {p.chronicConditions?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {p.chronicConditions.slice(0, 2).map(c => (
                        <span key={c} className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {!selected ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>👤</div>
              <p style={{ color: 'var(--text-secondary)' }}>Select a patient to view their profile and records</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Patient Header */}
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(139,92,246,0.1))', borderColor: 'var(--border-active)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, flexShrink: 0 }}>
                    {selected.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{selected.name}</div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                      <span><User size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {selected.gender || 'N/A'}</span>
                      {selected.dateOfBirth && <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {new Date(selected.dateOfBirth).toLocaleDateString('en-IN')}</span>}
                      {selected.bloodGroup && <span>🩸 {selected.bloodGroup}</span>}
                    </div>
                    {selected.abhaId && <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600, marginTop: '0.3rem' }}>ABHA: {selected.abhaId}</div>}
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddRecord(true)}>
                    <Plus size={14} /> Add Record
                  </button>
                </div>
                {selected.allergies?.length > 0 && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger-light)' }}>⚠️ Allergies: {selected.allergies.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Add Record Form */}
              {showAddRecord && (
                <div className="card" style={{ borderColor: 'rgba(14,165,233,0.4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div className="section-title" style={{ marginBottom: 0 }}><Plus size={18} /> New Health Record</div>
                    <button onClick={() => setShowAddRecord(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
                  </div>
                  <form onSubmit={handleSubmitRecord} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Record Type</label>
                        <select className="form-select" value={recordForm.type} onChange={e => setRecordForm(f => ({ ...f, type: e.target.value }))}>
                          {typeOptions.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Title</label>
                        <input type="text" className="form-input" placeholder="e.g. Hypertension Diagnosis" value={recordForm.title}
                          onChange={e => setRecordForm(f => ({ ...f, title: e.target.value }))} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Diagnosis / Finding</label>
                      <input type="text" className="form-input" placeholder="Primary diagnosis or finding" value={recordForm.diagnosis}
                        onChange={e => setRecordForm(f => ({ ...f, diagnosis: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" placeholder="Detailed clinical notes..." value={recordForm.description}
                        onChange={e => setRecordForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: '80px' }} />
                    </div>

                    {/* Medications */}
                    <div className="form-group">
                      <label className="form-label"><Pill size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Medications</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input type="text" className="form-input" placeholder="Drug name" value={newMed.name} onChange={e => setNewMed(m => ({ ...m, name: e.target.value }))} />
                        <input type="text" className="form-input" placeholder="Dosage" value={newMed.dosage} onChange={e => setNewMed(m => ({ ...m, dosage: e.target.value }))} />
                        <input type="text" className="form-input" placeholder="Freq." value={newMed.frequency} onChange={e => setNewMed(m => ({ ...m, frequency: e.target.value }))} />
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddMed}><Plus size={14} /></button>
                      </div>
                      {recordForm.medications.map((m, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.4rem 0.75rem', background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-sm)', marginBottom: '0.3rem', alignItems: 'center' }}>
                          <Pill size={12} color="var(--accent-light)" />
                          <span style={{ flex: 1, fontSize: '0.85rem' }}>{m.name} — {m.dosage} {m.frequency}</span>
                          <button type="button" onClick={() => setRecordForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={12} /></button>
                        </div>
                      ))}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Doctor's Notes</label>
                      <textarea className="form-textarea" placeholder="Additional notes for patient..." value={recordForm.notes}
                        onChange={e => setRecordForm(f => ({ ...f, notes: e.target.value }))} style={{ minHeight: '60px' }} />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label"><FileText size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Attach Document (PDF / Image)</label>
                      <input type="file" className="form-input" accept=".pdf, .jpg, .jpeg, .png" 
                        onChange={e => setRecordForm(f => ({ ...f, document: e.target.files[0] }))} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optional: Upload scan of prescription, lab report, or diagnostic images.</span>
                    </div>

                    <button type="submit" className="btn btn-primary"><FileText size={16} /> Save Health Record</button>
                  </form>
                </div>
              )}

              {/* Records List */}
              <div className="card">
                <div className="section-title"><FileText size={18} /> Health Records ({records.length})</div>
                {records.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <div className="empty-state-icon">📋</div>
                    <p>No records yet. Add the first one above.</p>
                  </div>
                ) : records.map(r => (
                  <div key={r._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(14,165,233,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{(r.type || r.recordType) === 'prescription' ? '💊' : (r.type || r.recordType) === 'lab_report' ? '🧪' : (r.type || r.recordType) === 'imaging' ? '🩻' : '🩺'}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.diagnosis && `Dx: ${r.diagnosis} · `}{new Date(r.date || r.createdAt).toLocaleDateString('en-IN')}</div>
                      {(r.medications || r.prescription)?.length > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>💊 {(r.medications || r.prescription).map(m => m.name || m.medicineName).join(', ')}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
