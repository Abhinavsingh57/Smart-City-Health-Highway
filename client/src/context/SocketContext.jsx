import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [ambulanceLocations, setAmbulanceLocations] = useState({});
  const [sosAlerts, setSosAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
    }

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', socket.id);
      if (user) {
        socket.emit('user:online', user._id);
      }
    });

    if (socket.connected && user) {
      socket.emit('user:online', user._id);
    }

    socket.on('disconnect', () => {
      setIsConnected(false);
    });


    // Real-time ambulance location updates
    socket.on('ambulance:location:update', (data) => {
      setAmbulanceLocations(prev => ({
        ...prev,
        [data.ambulanceId]: { lat: data.lat, lng: data.lng, status: data.status, timestamp: data.timestamp }
      }));
    });

    // SOS alerts (for admin)
    socket.on('patient:sos:alert', (data) => {
      setSosAlerts(prev => [data, ...prev.slice(0, 9)]);
      if (user?.role === 'admin') {
        toast.error(`🚨 SOS Alert: ${data.patientName} - ${data.condition || 'Emergency'}`, { duration: 8000 });
      }
    });

    // Ambulance dispatched (for patient)
    socket.on('ambulance:assigned', (data) => {
      if (user?.role === 'patient') {
        toast.success(`🚑 Ambulance is on the way! ETA: ${data.estimatedTime}`, { duration: 10000 });
      }
    });

    return () => {
      socket.off('ambulance:location:update');
      socket.off('patient:sos:alert');
      socket.off('ambulance:assigned');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [user]);

  const emit = (event, data) => {
    if (socketRef.current) socketRef.current.emit(event, data);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected, ambulanceLocations, sosAlerts, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
