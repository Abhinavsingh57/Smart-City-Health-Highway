require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctor.routes');
const adminRoutes = require('./routes/admin.routes');
const ambulanceRoutes = require('./routes/ambulance.routes');
const aiRoutes = require('./routes/ai.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ambulance', ambulanceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart City Health Highway API is running', timestamp: new Date() });
});

// Socket.io real-time ambulance tracking
const connectedAmbulances = new Map();
const connectedPatients = new Map();

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User online for direct messaging
  socket.on('user:online', (userId) => {
    socket.join(userId.toString());
    console.log(`User ${userId} joined their personal room`);
  });

  // Ambulance driver connects and starts broadcasting location
  socket.on('ambulance:register', (data) => {
    const { ambulanceId, driverName, vehicleNumber } = data;
    connectedAmbulances.set(ambulanceId, { socketId: socket.id, ...data });
    socket.join(`ambulance:${ambulanceId}`);
    console.log(`Ambulance registered: ${vehicleNumber}`);
    io.emit('ambulance:list', Array.from(connectedAmbulances.entries()));
  });

  // Ambulance broadcasts live location
  socket.on('ambulance:location', (data) => {
    const { ambulanceId, lat, lng, speed, status } = data;
    if (connectedAmbulances.has(ambulanceId)) {
      connectedAmbulances.get(ambulanceId).location = { lat, lng, speed, status, timestamp: new Date() };
    }
    // Broadcast to all connected clients
    io.emit('ambulance:location:update', { ambulanceId, lat, lng, speed, status, timestamp: new Date() });
  });

  // Patient sends SOS
  socket.on('patient:sos', (data) => {
    const { patientId, patientName, lat, lng, condition } = data;
    connectedPatients.set(patientId, { socketId: socket.id, ...data });
    console.log(`SOS received from patient: ${patientName}`);
    // Notify all admins and ambulances
    io.emit('patient:sos:alert', { patientId, patientName, lat, lng, condition, timestamp: new Date() });
  });

  // Admin dispatches ambulance
  socket.on('admin:dispatch', (data) => {
    const { ambulanceId, patientId, destination } = data;
    const ambulance = connectedAmbulances.get(ambulanceId);
    if (ambulance) {
      io.to(ambulance.socketId).emit('ambulance:dispatched', { patientId, destination });
      const patient = connectedPatients.get(patientId);
      if (patient) {
        io.to(patient.socketId).emit('ambulance:assigned', { ambulanceId, estimatedTime: '8-12 mins' });
      }
    }
  });

  // Chat message
  socket.on('chat:message', (data) => {
    io.emit('chat:message:broadcast', data);
  });

  socket.on('disconnect', () => {
    // Remove from active maps
    for (const [id, amb] of connectedAmbulances.entries()) {
      if (amb.socketId === socket.id) {
        connectedAmbulances.delete(id);
        io.emit('ambulance:list', Array.from(connectedAmbulances.entries()));
        break;
      }
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// MongoDB connection + server start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Smart City Health Highway Server running on port ${PORT}`);
      console.log(`🌐 API: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
