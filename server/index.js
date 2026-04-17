const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to protect routes
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// --- AUTH ENDPOINTS ---

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '1d' });
  res.json({ token, user: { email: user.email } });
});

// --- LEAD ENDPOINTS ---

// Public: Submit a lead
app.post('/api/leads', (req, res) => {
  const { name, email, source, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and Email are required' });

  try {
    const info = db.prepare(
      'INSERT INTO leads (name, email, source, notes) VALUES (?, ?, ?, ?)'
    ).run(name, email, source || 'Website Form', notes || '');
    res.status(201).json({ id: info.lastInsertRowid, message: 'Lead captured successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Get all leads
app.get('/api/leads', authenticate, (req, res) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
  res.json(leads);
});

// Protected: Update lead status/notes
app.patch('/api/leads/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const stmt = db.prepare('UPDATE leads SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?');
    const result = stmt.run(status, notes, id);
    if (result.changes === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected: Dashboard Stats
app.get('/api/stats', authenticate, (req, res) => {
  try {
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
    const newLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = \'New\'').get().count;
    const converted = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = \'Converted\'').get().count;
    
    res.json({ totalLeads, newLeads, converted });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

// Initial Seed (for demo)
const seedAdmin = () => {
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (count === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run('admin@crm.com', hashedPassword);
        console.log('Admin user created: admin@crm.com / admin123');
    }
};
seedAdmin();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
