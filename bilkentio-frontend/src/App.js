// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/styles.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CRUD from './pages/crud';
import StaffManagement from './pages/StaffManagement';
import Unauthorized from './components/Unauthorized';
import AdminAnalytics from './pages/AdminAnalytics';
import FormRequests from './pages/FormRequests';
import PuantajScores from './pages/PuantajScores';
import Counselor from './pages/Counselor';
import Individual from './pages/individual';

import PresidentDashboard from './pages/president/Dashboard';
import CoordinatorDashboard from './pages/coordinator/Dashboard';
import AdvisorDashboard from './pages/advisor/Dashboard';
import GuideDashboard from './pages/guide/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Role-specific Routes */}
        <Route path="/president/*" element={<PresidentDashboard />} />
        <Route path="/coordinator/*" element={<CoordinatorDashboard />} />
        <Route path="/advisor/*" element={<AdvisorDashboard />} />
        <Route path="/guide/*" element={<GuideDashboard />} />
        <Route path="/counselor/*" element={<Counselor />} />
        <Route path="/individual/*" element={<Individual />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/staff" element={<StaffManagement />} />
        <Route path="/admin/scores" element={<PuantajScores />} />

        {/* Legacy Routes - Keep if still needed */}
        <Route path="/crud" element={<CRUD />} />
        <Route path="/form-request" element={<FormRequests />} />
      </Routes>
    </Router>
  );
}

export default App;
