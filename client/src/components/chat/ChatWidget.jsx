import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import './ChatWidget.css';

export default function ChatWidget() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch users when widget opens
  useEffect(() => {
    if (isOpen && !activeChat) {
      fetchUsers();
    }
  }, [isOpen, activeChat]);

  // Handle incoming socket messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      // If the message is part of the active chat, append it to the open window
      if (
        activeChat &&
        (message.sender._id === activeChat._id || message.receiver._id === activeChat._id)
      ) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      } else if (message.sender._id !== user._id) {
        // Otherwise, show a notification if it's not sent by us
        toast(`New message from ${message.sender.name}`, {
          icon: '💬',
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #3b82f6',
          },
        });
      }
    };

    socket.on('chat:receive', handleReceiveMessage);

    return () => {
      socket.off('chat:receive', handleReceiveMessage);
    };
  }, [socket, activeChat, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get('http://localhost:5000/api/chat/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch chat users:', error);
      toast.error('Could not load chat directory');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(`http://localhost:5000/api/chat/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(res.data.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Could not load message history');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleUserSelect = (selectedUser) => {
    setActiveChat(selectedUser);
    fetchMessages(selectedUser._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const content = newMessage;
      setNewMessage(''); // optimistic clear
      const res = await axios.post(
        'http://localhost:5000/api/chat',
        { receiverId: activeChat._id, content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Update UI manually since the sender socket broadcast may sometimes not be necessary
      setMessages(prev => [...prev, res.data.data]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  if (!user) return null;

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <h3><MessageCircle size={20} /> Messages</h3>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="chat-body">
            {/* View: User Directory */}
            {!activeChat && (
              <div className="chat-directory">
                {loadingUsers ? (
                  <div className="chat-loading">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="chat-loading">No users available to chat.</div>
                ) : (
                  users.map((u) => (
                    <div
                      key={u._id}
                      className="chat-user-item"
                      onClick={() => handleUserSelect(u)}
                    >
                      <div className="chat-user-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="chat-user-info">
                        <span className="chat-user-name">{u.name}</span>
                        <span className="chat-user-role">
                          {u.role} {u.specialization ? `- ${u.specialization}` : ''}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* View: Active Chat */}
            {activeChat && (
              <div className="chat-messages-area">
                <div className="chat-messages-header" onClick={() => setActiveChat(null)}>
                  <ChevronLeft size={18} />
                  <span>Back to Directory - Chatting with {activeChat.name}</span>
                </div>
                
                <div className="chat-messages-list">
                  {loadingMessages ? (
                    <div className="chat-loading">Loading history...</div>
                  ) : messages.length === 0 ? (
                    <div className="chat-loading" style={{ opacity: 0.6, fontSize: '0.9rem' }}>Say hi to {activeChat.name} 👋</div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender === user._id || (msg.sender._id && msg.sender._id === user._id);
                      return (
                        <div key={msg._id || index} className={`chat-message ${isMe ? 'chat-message-sent' : 'chat-message-received'}`}>
                          {msg.content}
                          <span className="chat-message-time">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {!isOpen && (
        <button className="chat-fab" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
