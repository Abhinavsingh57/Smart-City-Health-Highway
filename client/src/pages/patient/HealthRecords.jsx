import React, { useState, useEffect } from 'react';
import { getHealthRecords } from '../../api/api';
import { FileText, Download, Calendar, User, Activity, Pill, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const typeColors = { diagnosis: 'primary', prescription: 'accent', lab_report: 'success', imaging: 'warning', surgery: 'danger', checkup: 'secondary' };
const typeIcons = { diagnosis: '🩺', prescription: '💊', lab_report: '🧪', imaging: '🩻', surgery: '🔪', checkup: '✅' };

export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getHealthRecords()
      .then(res => setRecords(res.data.records || []))
      .catch(() => toast.error('Failed to load health records'))
      .finally(() => setLoading(false));
  }, []);

  const types = ['all', ...new Set(records.map(r => r.type).filter(Boolean))];
  const filtered = filter === 'all' ? records : records.filter(r => r.type === filter);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>Health Records</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your complete medical history in one place</p>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Records', value: records.length, icon: <FileText size={22} />, color: 'var(--primary)' },
          { label: 'Prescriptions', value: records.filter(r => r.type === 'prescription').length, icon: <Pill size={22} />, color: 'var(--accent)' },
          { label: 'Lab Reports', value: records.filter(r => r.type === 'lab_report').length, icon: <Activity size={22} />, color: 'var(--secondary)' },
          { label: 'Diagnoses', value: records.filter(r => r.type === 'diagnosis').length, icon: <AlertCircle size={22} />, color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', border: `1px solid ${filter === t ? 'var(--primary)' : 'var(--border)'}`, background: filter === t ? 'rgba(14,165,233,0.15)' : 'transparent', color: filter === t ? 'var(--primary-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', transition: 'var(--transition)' }}>
            {t === 'all' ? '📋 All' : `${typeIcons[t] || '📄'} ${t.replace('_', ' ')}`}
          </button>
        ))}
      </div>

      {/* Records List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No health records found</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Your doctor will add records after consultations</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          {/* Records Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(record => (
              <div key={record._id} className="card" onClick={() => setSelected(selected?._id === record._id ? null : record)}
                style={{ cursor: 'pointer', borderColor: selected?._id === record._id ? 'var(--primary)' : 'var(--border)', background: selected?._id === record._id ? 'rgba(14,165,233,0.05)' : 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-md)', background: `rgba(${typeColors[record.type] === 'primary' ? '14,165,233' : typeColors[record.type] === 'accent' ? '139,92,246' : '16,185,129'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                    {typeIcons[record.type] || '📄'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.title || record.description?.substring(0, 40) || 'Health Record'}</span>
                      <span className={`badge badge-${typeColors[record.type] || 'primary'}`} style={{ flexShrink: 0 }}>{record.type?.replace('_', ' ')}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span><User size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Dr. {record.doctor?.name || 'N/A'}</span>
                      <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {record.date ? new Date(record.date).toLocaleDateString('en-IN') : '--'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="card" style={{ position: 'sticky', top: '1rem', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', align: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>{typeIcons[selected.type] || '📄'}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{selected.title || 'Health Record'}</div>
                    <span className={`badge badge-${typeColors[selected.type] || 'primary'}`} style={{ marginTop: '0.2rem' }}>{selected.type?.replace('_', ' ')}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
              </div>

              <hr className="divider" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>DOCTOR</div><div style={{ fontWeight: 600 }}>Dr. {selected.doctor?.name || 'N/A'}</div></div>
                <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>DATE</div><div style={{ fontWeight: 600 }}>{selected.date ? new Date(selected.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '--'}</div></div>
                {selected.description && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>DESCRIPTION</div><div style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{selected.description}</div></div>}
                {selected.diagnosis && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>DIAGNOSIS</div><div style={{ fontWeight: 600, color: 'var(--warning-light)' }}>{selected.diagnosis}</div></div>}
                {selected.medications?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>MEDICATIONS</div>
                    {selected.medications.map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                        <Pill size={14} color="var(--accent-light)" />
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> — {m.dosage || ''} {m.frequency || ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selected.notes && <div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>NOTES</div><div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{selected.notes}</div></div>}
              </div>
              {selected.fileUrl && (
                <a href={`http://localhost:5000/uploads/${selected.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-full" style={{ marginTop: '1.25rem' }}>
                  <Download size={16} /> Download File
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
