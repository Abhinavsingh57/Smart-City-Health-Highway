const { analyzeSymptoms, healthChatbot, recommendAppointmentSlot } = require('../services/ai.service');
const ChatMessage = require('../models/ChatMessage');
const { v4: uuidv4 } = require('uuid');

// Symptom Triage
const triageSymptoms = async (req, res) => {
  try {
    const { symptoms, urgency } = req.body;
    const { dateOfBirth, gender, chronicConditions } = req.user;
    const age = dateOfBirth ? Math.floor((new Date() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    const result = await analyzeSymptoms(symptoms, age, gender, chronicConditions || []);
    res.json({ success: true, analysis: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI analysis failed. Please try again.' });
  }
};

// AI Health Chat
const chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const sid = sessionId || uuidv4();

    // Get conversation history
    let session = await ChatMessage.findOne({ user: req.user._id, sessionId: sid });
    const history = session ? session.messages : [];

    // Get AI response
    const aiResponse = await healthChatbot(message, req.user.role, history, req.user.name);

    // Save to DB
    if (!session) {
      session = new ChatMessage({ user: req.user._id, role: req.user.role, sessionId: sid, messages: [] });
    }
    session.messages.push({ sender: 'user', content: message });
    session.messages.push({ sender: 'ai', content: aiResponse });
    // Keep only last 20 messages per session
    if (session.messages.length > 20) session.messages = session.messages.slice(-20);
    await session.save();

    res.json({ success: true, response: aiResponse, sessionId: sid });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Chat failed. Please try again.' });
  }
};

// Recommend Appointment Slot
const getSlotRecommendation = async (req, res) => {
  try {
    const { symptoms, urgency, doctorId } = req.body;
    const recommendation = await recommendAppointmentSlot(doctorId, symptoms, urgency);
    res.json({ success: true, recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Slot recommendation failed' });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const sessions = await ChatMessage.find({ user: req.user._id, isActive: true })
      .sort({ updatedAt: -1 }).limit(10);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
  }
};

module.exports = { triageSymptoms, chat, getSlotRecommendation, getChatHistory };
