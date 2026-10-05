import React, { useState } from 'react';
import { analyzePrescription } from '../../api/api';
import { Upload, Brain, AlertTriangle, CheckCircle, Pill, X, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrescriptionAnalyzer() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const samplePrescription = `Tab. Amoxicillin 500mg - 1 tablet TDS x 7 days
Tab. Ibuprofen 400mg - 1 tablet BD after meals x 5 days  
Syp. Paracetamol 125mg/5ml - 10ml QID
Cap. Omeprazole 20mg - 1 capsule OD before breakfast
Tab. Metformin 1000mg - 1 tablet BD with meals`;

  const handleAnalyze = async () => {
    if (!text.trim()) { toast.error('Please enter prescription text'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzePrescription({ prescriptionText: text });
      setResult(res.data.analysis);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (ev) => setText(ev.target.result);
      reader.readAsText(file);
    } else {
      toast.error('Please drop a text file (.txt). For PDFs/images, paste the text content.');
    }
  };

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1>AI Prescription Analyzer</h1>
          <span className="ai-chip"><Sparkles size={12} /> Gemini AI</span>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Analyze prescriptions for drug interactions, dosage verification, and clinical insights</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div className="section-title">📋 Prescription Input</div>
            {/* Drag & Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)',
                padding: '1.5rem', textAlign: 'center', marginBottom: '1rem', cursor: 'pointer',
                background: dragOver ? 'rgba(14,165,233,0.05)' : 'transparent', transition: 'var(--transition)'
              }}
              onClick={() => document.getElementById('file-upload').click()}>
              <input id="file-upload" type="file" accept=".txt" style={{ display: 'none' }} onChange={handleFileDrop} />
              <Upload size={24} color={dragOver ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Drop .txt file here or <span style={{ color: 'var(--primary)' }}>click to upload</span></p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Or paste prescription text below</p>
            </div>

            <textarea className="form-textarea" placeholder="Paste prescription text here...&#10;&#10;e.g.&#10;Tab. Amoxicillin 500mg - 1 tablet TDS x 7 days&#10;Tab. Ibuprofen 400mg - 1 tablet BD after meals..."
              value={text} onChange={e => setText(e.target.value)} style={{ minHeight: '200px' }} />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setText(samplePrescription)} style={{ flex: 1 }}>
                <FileText size={14} /> Load Sample
              </button>
              {text && <button className="btn btn-ghost btn-sm" onClick={() => { setText(''); setResult(null); }}><X size={14} /></button>}
            </div>

            <button className="btn btn-primary btn-full" style={{ marginTop: '0.75rem' }} onClick={handleAnalyze} disabled={loading || !text.trim()}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Analyzing...</> : <><Brain size={18} /> Analyze Prescription</>}
            </button>
          </div>

          {/* Info */}
          <div className="card" style={{ background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.2)' }}>
            <div className="ai-chip" style={{ marginBottom: '0.75rem' }}><Brain size={12} /> What this AI does</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Identifies all medications and dosages', 'Checks for drug-drug interactions', 'Verifies dosing is within safe ranges', 'Flags duplicate therapeutic classes', 'Provides clinical summary'].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={14} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '0.1rem' }} /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧬</div>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Analyzing prescription with AI...</p>
            </div>
          )}

          {!loading && !result && (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🔬</div>
              <p style={{ color: 'var(--text-secondary)' }}>Analysis results will appear here</p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.5s ease' }}>
              {/* Safety Status */}
              <div className="card" style={{ background: result.drugInteractions?.length > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)', borderColor: result.drugInteractions?.length > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {result.drugInteractions?.length > 0 ? <AlertTriangle size={32} color="var(--danger)" /> : <CheckCircle size={32} color="var(--secondary)" />}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: result.drugInteractions?.length > 0 ? 'var(--danger-light)' : 'var(--secondary-light)' }}>
                      {result.drugInteractions?.length > 0 ? '⚠️ Interactions Detected' : '✅ Prescription Safe'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {result.drugInteractions?.length > 0 ? `${result.drugInteractions.length} interaction(s) found` : 'No significant drug interactions found'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Medications Extracted */}
              {(result.medications || result.extractedMedications)?.length > 0 && (
                <div className="card">
                  <div className="section-title"><Pill size={18} /> Medications ({(result.medications || result.extractedMedications).length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(result.medications || result.extractedMedications).map((med, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-md)', alignItems: 'flex-start' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Pill size={16} color="var(--accent-light)" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{typeof med === 'string' ? med : med.name}</div>
                          {typeof med !== 'string' && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                              {med.dosage && `${med.dosage}`}{med.frequency && ` · ${med.frequency}`}{med.duration && ` · ${med.duration}`}
                            </div>
                          )}
                          {med.purpose && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>For: {med.purpose}</div>}
                        </div>
                        {med.safetyRating && <span className={`badge badge-${med.safetyRating === 'safe' ? 'success' : 'warning'}`}>{med.safetyRating}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drug Interactions */}
              {result.drugInteractions?.length > 0 && (
                <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                  <div className="section-title"><AlertTriangle size={18} color="var(--danger)" /> Drug Interactions</div>
                  {result.drugInteractions.map((inter, i) => (
                    <div key={i} style={{ padding: '0.75rem', marginBottom: '0.5rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--danger)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--danger-light)', fontSize: '0.9rem' }}>
                        {typeof inter === 'string' ? inter : `${inter.drug1} ↔ ${inter.drug2}`}
                      </div>
                      {inter.severity && <span className={`badge badge-danger`} style={{ marginTop: '0.3rem' }}>{inter.severity}</span>}
                      {inter.description && <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>{inter.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Clinical Summary */}
              {result.summary && (
                <div className="card" style={{ borderColor: 'rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.05)' }}>
                  <div className="ai-chip" style={{ marginBottom: '0.75rem' }}><Brain size={12} /> Clinical Summary</div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div className="card">
                  <div className="section-title"><CheckCircle size={18} color="var(--secondary)" /> Recommendations</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.recommendations.map((r, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>→</span>
                        {typeof r === 'string' ? r : r.recommendation || r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
