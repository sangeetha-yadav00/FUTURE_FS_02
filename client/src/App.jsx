import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PublicForm from './pages/PublicForm';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<PublicForm />} />
          <Route 
            path="/login" 
            element={token ? <Navigate to="/dashboard" /> : <Login setToken={setToken} />} 
          />
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard token={token} logout={logout} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
