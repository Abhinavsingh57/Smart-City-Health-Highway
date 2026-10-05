import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🚀', title: 'AI Symptom Triage', desc: 'Describe symptoms via text or voice. Get instant AI severity scoring (1-10) and recommended actions.' },
  { icon: '🚑', title: 'Real-Time Ambulance Tracking', desc: 'Live GPS ambulance tracking on Delhi map. One-tap SOS with predictive dispatch.' },
  { icon: '🗺️', title: 'Disease Heatmap', desc: 'AI-powered city-wide disease outbreak detection and visualization for Delhi.' },
  { icon: '🪪', title: 'Digital ABHA ID', desc: 'Auto-generated Ayushman Bharat Health Account ID on registration. Carry your health identity digitally.' },
  { icon: '🎙️', title: 'Voice Health Assistant', desc: 'Speak your symptoms out loud. Our AI transcribes and analyzes in real-time.' },
  { icon: '📅', title: 'Smart Appointment Booking', desc: 'AI recommends optimal appointment slots based on urgency and symptom analysis.' },
  { icon: '💬', title: 'Role-Aware AI Chatbot', desc: 'Context-aware AI for patients (health advice), doctors (clinical reference), and admins (system insights).' },
];

const stats = [
  { value: '50,000+', label: 'Patients Served', icon: '👥' },
  { value: '200+', label: 'Doctors Registered', icon: '👨‍⚕️' },
  { value: '48', label: 'Ambulances Active', icon: '🚑' },
  { value: '< 8 min', label: 'Avg Emergency Response', icon: '⚡' },
];

const roles = [
  {
    role: 'Patient',
    icon: '🏥',
    color: 'var(--primary)',
    glow: 'var(--primary-glow)',
    features: ['Digital ABHA Health ID', 'AI Symptom Checker with Voice', 'Appointment Booking', 'Real-Time Ambulance SOS', 'Complete Health Records', 'AI Health Chatbot'],
    link: '/register'
  },
  {
    role: 'Doctor',
    icon: '👨‍⚕️',
    color: 'var(--secondary)',
    glow: 'rgba(16,185,129,0.3)',
    features: ['Patient Queue Management', 'Drug Interaction Checker', 'Digital Health Records', 'Clinical AI Assistant', 'Appointment Management'],
    link: '/register'
  },
  {
    role: 'Admin',
    icon: '⚙️',
    color: 'var(--accent)',
    glow: 'rgba(139,92,246,0.3)',
    features: ['City Health Dashboard', 'Disease Outbreak Heatmap', 'Ambulance Fleet Control', 'Emergency SOS Dispatch', 'User Management', 'AI System Insights'],
    link: '/login'
  },
];

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => setActiveFeature(f => (f + 1) % features.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 2rem', display: 'flex', alignItems: 'center', height: '70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏥</div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem' }}>Smart City Health Highway</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--primary-light)', letterSpacing: '0.1em' }}>DELHI • AI-POWERED HEALTHCARE</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost" id="nav-login" style={{ fontSize: '0.85rem' }}>Login</Link>
          <Link to="/register" className="btn btn-primary" id="nav-register" style={{ fontSize: '0.85rem' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '70px', position: 'relative', overflow: 'hidden' }}>
        {/* Background effects */}
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite reverse' }} />
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', textAlign: 'center' }}>
          {/* Badge */}
          <div className="ai-chip" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <span>✨</span> AI-Powered Smart Healthcare for Delhi
          </div>
          
          {/* Main heading */}
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            <span className="gradient-text">Smart City</span><br />
            <span style={{ color: 'var(--text-primary)' }}>Health Highway</span>
          </h1>
          
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.3rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            India's most advanced AI healthcare platform. Real-time ambulance tracking, ABHA digital ID, AI symptom analysis, and comprehensive health management — all in one place.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-register">
              🚀 Get Your ABHA Health ID
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg" id="hero-login">
              Sign In to Portal →
            </Link>
          </div>

          {/* Animated feature highlight */}
          <div style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '1.5rem 2rem', maxWidth: '500px', margin: '0 auto', minHeight: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem', animation: 'float 2s ease-in-out infinite' }}>{features[activeFeature].icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-light)', marginBottom: '0.3rem' }}>{features[activeFeature].title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{features[activeFeature].desc}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary-light)' }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="ai-chip" style={{ marginBottom: '1rem', display: 'inline-flex' }}>🤖 Powered by Google Gemini AI</div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Unique AI Features</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '500px', margin: '0.5rem auto 0' }}>Features you won't find in any other healthcare platform</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem', cursor: 'default' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section style={{ padding: '6rem 2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '3rem' }}>Choose Your Portal</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {roles.map((r, i) => (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', transition: 'var(--transition)', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 40px ${r.glow}`; e.currentTarget.style.borderColor = r.color; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{r.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: r.color }}>{r.role} Portal</h3>
                <ul style={{ listStyle: 'none', marginBottom: '1.5rem' }}>
                  {r.features.map((f, j) => (
                    <li key={j} style={{ padding: '0.4rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: r.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to={r.link} className="btn btn-full" style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)`, color: 'white', border: 'none' }} id={`role-${r.role.toLowerCase()}`}>
                  Access {r.role} Portal →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem' }}>Your Health, <span className="gradient-text">Intelligently</span> Managed</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>Join 50,000+ Delhi residents on the Smart City Health Highway</p>
          <Link to="/register" className="btn btn-primary btn-lg" id="cta-register" style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}>
            🏥 Register Now — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2024 Smart City Health Highway | Delhi Government Initiative | Powered by AI</p>
        <p style={{ marginTop: '0.5rem' }}>Emergency: <strong style={{ color: 'var(--danger-light)' }}>108</strong> | Health Helpline: <strong style={{ color: 'var(--primary-light)' }}>1800-XXX-XXXX</strong></p>
      </footer>
    </div>
  );
}
