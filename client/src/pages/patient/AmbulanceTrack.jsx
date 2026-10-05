import React, { useState, useEffect, useRef } from 'react';
import { sendSOS, getAmbulances } from '../../api/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Phone, Clock, AlertTriangle, CheckCircle, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

// Leaflet map embedded via script tag approach (CDN)
function AmbulanceMap({ userLocation, ambulances, assignedAmbulance }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!userLocation || mapInstanceRef.current) return;
    // Ensure Leaflet is loaded
    const initMap = () => {
      if (!window.L) return;
      const L = window.L;
      const map = L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19
      }).addTo(map);

      // User marker (pulsing)
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:20px;height:20px;background:#0ea5e9;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(14,165,233,0.3);animation:pulse 2s infinite;"></div>`,
        iconSize: [20, 20], iconAnchor: [10, 10]
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map).bindPopup('📍 Your Location');
      mapInstanceRef.current = map;
    };

    if (window.L) initMap();
    else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    ambulances.forEach(amb => {
      if (!amb.currentLocation?.coordinates) return;
      const [lng, lat] = amb.currentLocation.coordinates;
      const color = amb.status === 'available' ? '#10b981' : amb.status === 'dispatched' ? '#f59e0b' : '#ef4444';
      const icon = L.divIcon({
        className: '',
        html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${amb.status === 'available' ? '🚑' : '🚨'}</div>`,
        iconSize: [30, 30], iconAnchor: [15, 15]
      });
      const marker = L.marker([lat, lng], { icon }).addTo(mapInstanceRef.current);
      marker.bindPopup(`<div style="font-family:sans-serif"><b>${amb.vehicleNumber}</b><br/><span style="color:${color}">● ${amb.status}</span><br/>Driver: ${amb.driver?.name || 'N/A'}</div>`);
      markersRef.current.push(marker);
    });
  }, [ambulances]);

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <div ref={mapRef} style={{ height: '400px', background: '#1a2235' }} />
      {!userLocation && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,15,30,0.8)', flexDirection: 'column', gap: '0.75rem' }}>
          <MapPin size={32} color="var(--primary)" />
          <p style={{ color: 'var(--text-secondary)' }}>Enable location to view ambulance map</p>
        </div>
      )}
    </div>
  );
}

export default function AmbulanceTrack() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [sos, setSos] = useState(false);
  const [location, setLocation] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [assigned, setAssigned] = useState(null);
  const [locating, setLocating] = useState(false);
  const [eta, setEta] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    getAmbulances().then(res => setAmbulances(res.data.ambulances || [])).catch(() => {});
    getLocation();

    if (socket) {
      socket.on('ambulance_location_update', ({ ambulanceId, coordinates }) => {
        setAmbulances(prev => prev.map(a => a._id === ambulanceId ? { ...a, currentLocation: { coordinates } } : a));
      });
      socket.on('sos_accepted', (data) => {
        setAssigned(data.ambulance);
        setEta(data.eta);
        toast.success(`🚑 Ambulance dispatched! ETA: ${data.eta} mins`);
      });
    }
    return () => { if (socket) { socket.off('ambulance_location_update'); socket.off('sos_accepted'); } };
  }, [socket]);

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => { toast.error('Location access denied. Enable GPS for ambulance tracking.'); setLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  const handleSOS = async () => {
    if (!location) { toast.error('Location required for SOS. Please enable GPS.'); getLocation(); return; }
    if (window.confirm('⚠️ This will dispatch an emergency ambulance to your location. Continue?')) {
      try {
        const res = await sendSOS({ lat: location.lat, lng: location.lng, conditionDescription: notes, condition: 'other' });
        setSos(true);
        toast.success('🚨 SOS sent! Emergency services alerted.');
        if (socket) socket.emit('patient_sos', { userId: user?._id, location, notes });
      } catch (err) {
        toast.error(err.response?.data?.message || 'SOS failed. Please call 108 directly.');
      }
    }
  };

  const availableCount = ambulances.filter(a => a.status === 'available').length;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1>🚑 Emergency Response</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Real-time ambulance tracking and emergency SOS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Location Status */}
          <div className="card">
            <div className="section-title"><MapPin size={18} /> Your Location</div>
            {location ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary-light)' }}>
                  <CheckCircle size={16} /> <span style={{ fontWeight: 600 }}>Location acquired</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</div>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Location access needed for ambulance dispatch</p>
                <button className="btn btn-primary btn-sm" onClick={getLocation} disabled={locating}>
                  {locating ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Locating...</> : <><Navigation size={14} /> Enable Location</>}
                </button>
              </div>
            )}
          </div>

          {/* Ambulance Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="card" style={{ textAlign: 'center', background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary-light)' }}>{availableCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Available</div>
            </div>
            <div className="card" style={{ textAlign: 'center', background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning-light)' }}>{ambulances.filter(a => a.status === 'dispatched').length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>In Transit</div>
            </div>
          </div>

          {/* Emergency Notes */}
          {!sos && (
            <div className="card">
              <div className="section-title">Emergency Details (Optional)</div>
              <textarea className="form-textarea" placeholder="Describe the emergency situation, medical conditions, or specific instructions..."
                value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: '100px' }} />
            </div>
          )}

          {/* SOS Button */}
          {!sos ? (
            <div style={{ textAlign: 'center' }}>
              <button className="sos-btn" onClick={handleSOS} style={{ width: '100%', padding: '1.5rem', fontSize: '1.4rem' }}>
                🆘 SEND SOS — CALL AMBULANCE
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Phone size={14} /> Or call <strong style={{ color: 'var(--danger-light)' }}>108</strong> directly for emergencies
              </div>
            </div>
          ) : (
            <div className="card" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)', textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🚑</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--secondary-light)', marginBottom: '0.5rem' }}>Emergency Services Alerted!</div>
              {assigned && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ambulance {assigned.vehicleNumber} dispatched</p>}
              {eta && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--warning-light)' }}>
                  <Clock size={16} /> Estimated arrival: <strong>{eta} minutes</strong>
                </div>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setSos(false)} style={{ marginTop: '1rem' }}>Cancel SOS</button>
            </div>
          )}

          {/* Nearest ambulances list */}
          {ambulances.filter(a => a.status === 'available').length > 0 && (
            <div className="card">
              <div className="section-title">🟢 Available Units</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ambulances.filter(a => a.status === 'available').slice(0, 3).map(amb => (
                  <div key={amb._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '1.3rem' }}>🚑</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{amb.vehicleNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{amb.driver?.name || 'Unassigned'}</div>
                    </div>
                    <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Available</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AmbulanceMap userLocation={location} ambulances={ambulances} assignedAmbulance={assigned} />

          {/* Emergency hotlines */}
          <div className="card">
            <div className="section-title">📞 Emergency Contacts</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { label: 'Ambulance', number: '108', color: 'var(--danger)' },
                { label: 'Police', number: '100', color: 'var(--primary)' },
                { label: 'Fire', number: '101', color: 'var(--warning)' },
                { label: 'Women Helpline', number: '1091', color: 'var(--accent)' },
              ].map(c => (
                <a key={c.number} href={`tel:${c.number}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-glass-light)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text-primary)', border: `1px solid ${c.color}22`, transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-glass-light)'}>
                  <Phone size={16} color={c.color} />
                  <div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.label}</div><div style={{ fontWeight: 800, color: c.color }}>{c.number}</div></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
