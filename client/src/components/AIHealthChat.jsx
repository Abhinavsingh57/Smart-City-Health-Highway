import React, { useState, useRef, useEffect } from 'react';
import { aiChat } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, X, Send, Bot, User, Brain, Sparkles, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '0.3rem', padding: '0.75rem', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isAI = msg.sender === 'ai';
  return (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: isAI ? 'flex-start' : 'flex-end', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
      {isAI && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Bot size={14} color="white" />
        </div>
      )}
      <div style={{
        maxWidth: '80%', padding: '0.65rem 0.9rem', borderRadius: isAI ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        background: isAI ? 'var(--bg-card-hover)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-primary)', border: isAI ? '1px solid var(--border)' : 'none',
        whiteSpace: 'pre-wrap'
      }}>
        {msg.content}
        <div style={{ fontSize: '0.65rem', color: isAI ? 'var(--text-muted)' : 'rgba(255,255,255,0.6)', marginTop: '0.25rem', textAlign: 'right' }}>
          {msg.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      {!isAI && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-glass-light)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={14} color="var(--text-secondary)" />
        </div>
      )}
    </div>
  );
}

const QUICK_PROMPTS = {
  patient: ['What are common cold remedies?', 'How do I lower blood pressure?', 'What vaccines do I need?'],
  doctor: ['Drug interaction: Metformin + Ibuprofen?', 'Latest hypertension guidelines', 'Dosage for pediatric amoxicillin'],
  admin: ['Show city health trends', 'Flu outbreak prevention measures', 'How to optimize ambulance dispatch?'],
};

export default function AIHealthChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI health assistant. How can I help you today?`, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  const sendMessage = async (content = input) => {
    if (!content.trim() || loading) return;
    const userMsg = { sender: 'user', content: content.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiChat({ message: content.trim(), sessionId });
      if (!sessionId) setSessionId(res.data.sessionId);
      const aiMsg = { sender: 'ai', content: res.data.response, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiMsg]);
      if (!open) setUnread(u => u + 1);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', content: '⚠️ Sorry, I\'m having trouble connecting. Please try again or call your doctor directly.', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const quickPrompts = QUICK_PROMPTS[user?.role] || QUICK_PROMPTS.patient;

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position: 'fixed', bottom: '2rem', right: '2rem', width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
          boxShadow: '0 8px 32px rgba(14,165,233,0.4)', animation: 'glow 3s ease-in-out infinite',
          transition: 'var(--transition)'
        }}>
          <Bot size={26} color="white" />
          {unread > 0 && (
            <div style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
              {unread}
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', width: 380, height: 540,
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', zIndex: 999,
          animation: 'fadeIn 0.3s ease', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, var(--primary-dark), var(--accent-dark))', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Health AI Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} /> Online · Powered by Gemini
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <span className="ai-chip" style={{ fontSize: '0.65rem' }}><Sparkles size={10} /> AI</span>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)', borderRadius: '4px 14px 14px 14px', padding: '0.5rem 0.75rem' }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 1rem 0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {quickPrompts.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  style={{ padding: '0.3rem 0.7rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-glass-light)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.72rem', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <textarea ref={inputRef} className="form-textarea" placeholder="Ask a health question..." value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{ flex: 1, minHeight: '40px', maxHeight: '100px', resize: 'none', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: !input.trim() || loading ? 0.5 : 1, transition: 'var(--transition)' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
