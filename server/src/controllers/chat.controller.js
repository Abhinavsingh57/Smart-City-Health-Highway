const Message = require('../models/Message');
const User = require('../models/User');

exports.getChatUsers = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let query = { _id: { $ne: _id }, isActive: true };

    // Doctors see their patients and all admins
    // Patients see their doctors and all admins
    // Admins see everyone
    // For simplicity of this MVP, we will let doctors see all patients and admins,
    // patients see all doctors and admins.
    
    if (role === 'doctor') {
      query.role = { $in: ['patient', 'admin', 'doctor'] };
    } else if (role === 'patient') {
      query.role = { $in: ['doctor', 'admin'] };
    }
    
    const users = await User.find(query).select('name email role avatar specialization');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('getChatUsers err:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    }).sort('createdAt');

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('getMessages err:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role');

    // Emit socket event if io is available
    const io = req.app.get('io');
    if (io) {
      // Broadcast to receiver
      io.to(receiverId.toString()).emit('chat:receive', populatedMessage);
      // Optional: broadcast to sender to confirm across sessions
      io.to(senderId.toString()).emit('chat:receive', populatedMessage);
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('sendMessage err:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};
