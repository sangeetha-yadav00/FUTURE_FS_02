import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';

const PublicForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/leads', formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass" style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Message Sent!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Thank you for reaching out. Our team will get back to you shortly.</p>
          <button onClick={() => setSubmitted(false)} style={{ marginTop: '2.5rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>Send another message</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '600px', width: '100%' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get in Touch</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Have a project in mind? Let's build something great together.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem' }}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe" 
            />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com" 
            />
          </div>
          <div className="input-group">
            <label>How can we help?</label>
            <textarea 
              rows="4" 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Tell us about your project..." 
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>Admin Login</a>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicForm;
