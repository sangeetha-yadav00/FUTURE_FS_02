import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Calendar, BarChart2, Plus, LogOut, CheckCircle, Clock, PhoneForwarded } from 'lucide-react';

const Dashboard = ({ token, logout }) => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ totalLeads: 0, newLeads: 0, converted: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const [leadsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/leads', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setLeads(leadsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) logout();
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/leads/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'new': return <span className="badge badge-new">New</span>;
      case 'contacted': return <span className="badge badge-contacted">Contacted</span>;
      case 'converted': return <span className="badge badge-converted">Converted</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Lead Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Admin</p>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>

      {/* Stats Section */}
      <div className="dashboard-grid">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass stats-card">
          <div className="stats-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
            <BarChart2 />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.totalLeads}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Leads</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass stats-card">
          <div className="stats-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Clock />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.newLeads}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>New Requests</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass stats-card">
          <div className="stats-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.converted}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Converted</p>
          </div>
        </motion.div>
      </div>

      {/* Leads Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        className="glass" 
        style={{ marginTop: '3rem', padding: '1.5rem', overflowX: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Recent Leads</h3>
          <button style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }} onClick={fetchLeads}>Refresh</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode='popLayout'>
              {leads.map((lead) => (
                <motion.tr 
                  layout
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                        {lead.name[0]}
                      </div>
                      {lead.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-primary)' }}>{lead.email}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{lead.source}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(lead.status)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} />
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => updateStatus(lead.id, 'Contacted')}
                        style={{ padding: '0.4rem', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}
                      >
                        <PhoneForwarded size={14} />
                      </button>
                      <button 
                        onClick={() => updateStatus(lead.id, 'Converted')}
                        style={{ padding: '0.4rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                      >
                        <CheckCircle size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {leads.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No leads found yet. Promote your contact form!
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
