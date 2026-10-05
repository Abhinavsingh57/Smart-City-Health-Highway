import React, { useState, useRef, useEffect } from 'react';
import { triageSymptoms } from '../../api/api';
import { Mic, MicOff, Send, Brain, AlertTriangle, CheckCircle, AlertCircle, Thermometer } from 'lucide-react';
import toast from 'react-hot-toast';

const severityConfig = {
  1: { label: 'Minimal', color: '#10b981', bg: 'rgba(16,185,129,0.1)', action: 'Rest at home, stay hydrated', icon: <CheckCircle size={20} /> },
  2: { label: 'Mild', color: '#10b981', bg: 'rgba(16,185,129,0.1)', action: 'Rest at home, monitor symptoms', icon: <CheckCircle size={20} /> },
  3: { label: 'Mild', color: '#10b981', bg: 'rgba(16,185,129,0.1)', action: 'Rest at home, OTC medication', icon: <CheckCircle size={20} /> },
  4: { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', action: 'Visit OPD within 2-3 days', icon: <AlertCircle size={20} /> },
  5: { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', action: 'Schedule doctor appointment', icon: <AlertCircle size={20} /> },
  6: { label: 'Elevated', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', action: 'Visit doctor today', icon: <AlertCircle size={20} /> },
  7: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', action: 'Visit ER or urgent care', icon: <AlertTriangle size={20} /> },
  8: { label: 'Serious', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', action: 'Go to emergency room immediately', icon: <AlertTriangle size={20} /> },
  9: { label: 'Critical', color: '#dc2626', bg: 'rgba(220,38,38,0.15)', action: '🚑 Call ambulance NOW', icon: <AlertTriangle size={20} /> },
  10: { label: 'Emergency', color: '#dc2626', bg: 'rgba(220,38,38,0.15)', action: '🚑 CALL 108 IMMEDIATELY', icon: <AlertTriangle size={20} /> },
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Voice input setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.onresult = (e) => {
        const t = Array.from(e.results).map(r => r[0].transcript).join('');
        setTranscript(t);
        setSymptoms(t);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) { toast.error('Voice input not supported in this browser'); return; }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setListening(true);
      toast.success('Listening... describe your symptoms');
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) { toast.error('Please describe your symptoms'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await triageSymptoms({ symptoms, urgency: 'medium' });
      setResult(res.data.analysis);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sev = result?.severityScore ? (severityConfig[Math.round(result.severityScore)] || severityConfig[5]) : null;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1>AI Symptom Checker</h1>
          <span className="ai-chip"><Brain size={12} /> Gemini AI</span>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Describe your symptoms and get an AI-powered health assessment</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div className="section-title">📝 Describe Your Symptoms</div>
            <div style={{ position: 'relative' }}>
              <textarea className="form-textarea" placeholder="e.g. I have a headache, fever of 102°F, body aches, and cough for the past 2 days..."
                value={symptoms} onChange={e => setSymptoms(e.target.value)}
                style={{ minHeight: '150px', paddingBottom: '3rem' }} />
              {/* Voice button inside textarea area */}
              <button onClick={toggleListening}
                style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: listening ? 'var(--danger)' : 'rgba(14,165,233,0.15)', color: listening ? 'white' : 'var(--primary)', transition: 'var(--transition)', animation: listening ? 'pulse 1.5s ease-in-out infinite' : 'none' }}>
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>

            {listening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)', marginTop: '0.75rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--danger-light)' }}>Recording... {transcript && `"${transcript.substring(0, 40)}..."`}</span>
                <button onClick={toggleListening} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger-light)', cursor: 'pointer', fontSize: '0.8rem' }}>Stop</button>
              </div>
            )}

            <button className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} onClick={handleAnalyze} disabled={loading || !symptoms.trim()}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Brain size={18} /> Analyze Symptoms</>}
            </button>
          </div>

          {/* Common Symptoms Quick Select */}
          <div className="card">
            <div className="section-title">⚡ Quick Symptom Selector</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Chest pain', 'Shortness of breath', 'Body aches', 'Sore throat', 'Dizziness', 'Abdominal pain', 'Vomiting'].map(s => (
                <button key={s} onClick={() => setSymptoms(prev => prev ? prev + ', ' + s : s)}
                  style={{ padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: symptoms.includes(s) ? 'rgba(14,165,233,0.15)' : 'transparent', color: symptoms.includes(s) ? 'var(--primary-light)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', transition: 'var(--transition)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="var(--danger-light)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--danger-light)', marginBottom: '0.3rem' }}>⚠️ Disclaimer</div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>This AI tool provides general health guidance only — not a medical diagnosis. Always consult a qualified healthcare professional for proper diagnosis and treatment. In emergencies, call 108 immediately.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>AI is analyzing your symptoms...</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Powered by Google Gemini</p>
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.4 }}>🩺</div>
              <p style={{ color: 'var(--text-secondary)' }}>Your AI health assessment will appear here</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Describe your symptoms and click Analyze</p>
            </div>
          )}

          {result && sev && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.5s ease' }}>
              {/* Severity Score */}
              <div className="card" style={{ background: sev.bg, borderColor: sev.color + '44' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: sev.color + '22', border: `3px solid ${sev.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: sev.color, lineHeight: 1 }}>{Math.round(result.severityScore)}</div>
                    <div style={{ fontSize: '0.5rem', color: sev.color, fontWeight: 700 }}>/10</div>
                  </div>
                  <div>
                    <div style={{ color: sev.color, fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{sev.icon} {sev.label} Severity</div>
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>{sev.action}</div>
                  </div>
                </div>
              </div>

              {/* Likely Conditions */}
              {result.likelyConditions?.length > 0 && (
                <div className="card">
                  <div className="section-title">🔍 Possible Conditions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.likelyConditions.map((cond, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontWeight: 600 }}>{typeof cond === 'string' ? cond : cond.name || cond.condition}</div>
                        {cond.probability && <span className="badge badge-primary">{cond.probability}%</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="card">
                  <div className="section-title">💡 Recommendations</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.recommendations.map((rec, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', padding: '0.5rem 0', borderBottom: i < result.recommendations.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <span style={{ color: 'var(--secondary)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                        {typeof rec === 'string' ? rec : rec.action || rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning Signs */}
              {result.warningSignsToWatch?.length > 0 && (
                <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                  <div className="section-title"><AlertTriangle size={18} color="var(--danger)" /> Warning Signs — Seek Help If</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {result.warningSignsToWatch.map((sign, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--danger-light)' }}>
                        <span>⚠️</span> {typeof sign === 'string' ? sign : sign.sign || sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall summary */}
              {result.summary && (
                <div className="card" style={{ background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.2)' }}>
                  <div className="ai-chip" style={{ marginBottom: '0.75rem' }}><Brain size={12} /> AI Summary</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
                </div>
              )}

              {/* Emergency SOS button if critical */}
              {result.severityScore >= 8 && (
                <a href="/patient/ambulance" className="sos-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '0.5rem' }}>
                  🚑 REQUEST EMERGENCY AMBULANCE
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
