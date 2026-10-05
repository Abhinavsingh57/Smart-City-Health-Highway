import React, { useState, useEffect } from 'react';
import { getUsers, updateUser } from '../../api/api';
import { Users, Search, CheckCircle, XCircle, Shield, Stethoscope, User, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const roleConfig = {
  patient: { icon: <User size={14} />, color: 'var(--primary)', badge: 'badge-primary' },
  doctor: { icon: <Stethoscope size={14} />, color: 'var(--secondary)', badge: 'badge-success' },
  admin: { icon: <Shield size={14} />, color: 'var(--accent)', badge: 'badge-accent' },
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  useEffect(() => {
    setLoading(true);
    const params = { page, limit, ...(roleFilter !== 'all' && { role: roleFilter }), ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }), ...(search && { search }) };
    getUsers(params)
      .then(res => { setUsers(res.data.users || []); setTotal(res.data.total || 0); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, roleFilter, statusFilter, search]);

  const handleToggle = async (id, field, value) => {
    try {
      await updateUser(id, { [field]: value });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, [field]: value } : u));
      toast.success('User updated');
    } catch { toast.error('Update failed'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>User Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage patients, doctors, and administrators</p>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Users', value: total, icon: <Users size={22} />, color: 'var(--primary)' },
          { label: 'Doctors', value: users.filter(u => u.role === 'doctor').length, icon: <Stethoscope size={22} />, color: 'var(--secondary)' },
          { label: 'Patients', value: users.filter(u => u.role === 'patient').length, icon: <User size={22} />, color: 'var(--accent)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" className="form-input" placeholder="Search users..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: '2.5rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          {['all', 'patient', 'doctor', 'admin'].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              style={{ padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', border: `1px solid ${roleFilter === r ? 'var(--primary)' : 'var(--border)'}`, background: roleFilter === r ? 'rgba(14,165,233,0.15)' : 'transparent', color: roleFilter === r ? 'var(--primary-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize', transition: 'var(--transition)' }}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['all', 'active', 'inactive'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{ padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', border: `1px solid ${statusFilter === s ? 'var(--secondary)' : 'var(--border)'}`, background: statusFilter === s ? 'rgba(16,185,129,0.12)' : 'transparent', color: statusFilter === s ? 'var(--secondary-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize', transition: 'var(--transition)' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-container">
            <table>
              <thead><tr>
                <th>User</th><th>Role</th><th>ABHA ID</th><th>Joined</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state"><div className="empty-state-icon">👤</div><p>No users found</p></div>
                  </td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>{u.name?.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${roleConfig[u.role]?.badge || 'badge-primary'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        {roleConfig[u.role]?.icon} {u.role}
                        {u.role === 'doctor' && u.specialization && <span style={{ opacity: 0.7 }}>· {u.specialization}</span>}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {u.abhaId ? u.abhaId.substring(0, 10) + '...' : '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                        {u.isActive !== false ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className={`btn btn-sm ${u.isActive !== false ? 'btn-ghost' : 'btn-secondary'}`}
                          onClick={() => handleToggle(u._id, 'isActive', !u.isActive)}
                          style={{ fontSize: '0.75rem' }}>
                          {u.isActive !== false ? <><XCircle size={12} /> Deactivate</> : <><CheckCircle size={12} /> Activate</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
