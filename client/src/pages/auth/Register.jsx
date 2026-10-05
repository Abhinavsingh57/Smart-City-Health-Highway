import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../api/api';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, Calendar, Eye, EyeOff, UserPlus, Stethoscope, Shield } from 'lucide-react';

const roleConfig = {
  patient: { icon: <User size={18} />, label: 'Patient', color: 'var(--primary)', desc: 'Access health records & appointments' },
  doctor: { icon: <Stethoscope size={18} />, label: 'Doctor', color: 'var(--secondary)', desc: 'Manage patients & prescriptions' },
  admin: { icon: <Shield size={18} />, label: 'Admin', color: 'var(--accent)', desc: 'City health management' },
};

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', dateOfBirth: '',
    gender: '', role: 'patient', specialization: '', licenseNumber: ''
  });

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data.token, res.data.user);
      toast.success(`🎉 Welcome to Smart City Health, ${res.data.user.name}!`);
      const role = res.data.user.role;
      if (role === 'doctor') navigate('/doctor/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

      <div style={{ width: '100%', maxWidth: '520px', position: 'relative', animation: 'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏥</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Smart City Health</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', letterSpacing: '0.1em' }}>HIGHWAY • DELHI</div>
              </div>
            </div>
          </Link>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '1.2rem', marginBottom: '0.3rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join the city-wide health network</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {Object.entries(roleConfig).map(([key, cfg]) => (
            <button key={key} type="button" onClick={() => handleChange('role', key)}
              style={{
                padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `1px solid ${form.role === key ? cfg.color : 'var(--border)'}`,
                background: form.role === key ? `rgba(${key === 'patient' ? '14,165,233' : key === 'doctor' ? '16,185,129' : '139,92,246'},0.12)` : 'var(--bg-glass-light)',
                transition: 'var(--transition)', textAlign: 'center'
              }}>
              <div style={{ color: form.role === key ? cfg.color : 'var(--text-muted)', display: 'flex', justifyContent: 'center', marginBottom: '0.3rem' }}>{cfg.icon}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: form.role === key ? cfg.color : 'var(--text-secondary)' }}>{cfg.label}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{cfg.desc}</div>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-name" type="text" className="form-input" placeholder="Dr. Priya Sharma" value={form.name}
                  onChange={e => handleChange('name', e.target.value)} style={{ paddingLeft: '2.5rem' }} required />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-email" type="email" className="form-input" placeholder="your@email.com" value={form.email}
                  onChange={e => handleChange('email', e.target.value)} style={{ paddingLeft: '2.5rem' }} required />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => handleChange('password', e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Phone + Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="tel" className="form-input" placeholder="+91 9876..." value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender} onChange={e => handleChange('gender', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* DOB */}
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="date" className="form-input" value={form.dateOfBirth}
                  onChange={e => handleChange('dateOfBirth', e.target.value)} style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>

            {/* Doctor-only fields */}
            {form.role === 'doctor' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select className="form-select" value={form.specialization} onChange={e => handleChange('specialization', e.target.value)}>
                    <option value="">Select...</option>
                    {['Cardiology','Neurology','Orthopedics','Pediatrics','General Medicine','Dermatology','Psychiatry','Emergency Medicine'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">License No.</label>
                  <input type="text" className="form-input" placeholder="MCI/2024/XXXXX" value={form.licenseNumber}
                    onChange={e => handleChange('licenseNumber', e.target.value)} />
                </div>
              </div>
            )}

            <button id="reg-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
