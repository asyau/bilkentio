import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/AdminSidebar.css';
import ProfileSettings from './ProfileSettings';

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo-section">
          {!isCollapsed && <h2>BilkentIO</h2>}
        </div>

        <button
          className={`collapse-btn ${!isCollapsed ? 'is-active' : ''}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="hamburger-icon">
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
        </button>

        <nav className="sidebar-nav">
          <NavLink to="/admin/analytics" className="nav-item" title="Analytics">
            <span className="material-icons">analytics</span>
            {!isCollapsed && <span>Analytics</span>}
          </NavLink>

          <NavLink to="/admin/staff" className="nav-item" title="Staff Management">
            <span className="material-icons">groups</span>
            {!isCollapsed && <span>Staff Management</span>}
          </NavLink>

          <NavLink to="/admin/schools" className="nav-item" title="School Management">
            <span className="material-icons">school</span>
            {!isCollapsed && <span>School Management</span>}
          </NavLink>

          <NavLink to="/form-request" className="nav-item" title="Accept/Reject Forms">
            <span className="material-icons">description</span>
            {!isCollapsed && <span>Accept/Reject Forms</span>}
          </NavLink>

          <NavLink to="/admin/scores" className="nav-item" title="View Puantaj Scores">
            <span className="material-icons">grade</span>
            {!isCollapsed && <span>View Puantaj Scores</span>}
          </NavLink>

          <NavLink to="/admin/tours" className="nav-item" title="Tour Management">
            <span className="material-icons">map</span>
            {!isCollapsed && <span>Tour Management</span>}
          </NavLink>

          <button 
            className="nav-item"
            onClick={() => setIsSettingsOpen(true)}
          >
            <span className="material-icons">settings</span>
            {!isCollapsed && <span>Settings</span>}
          </button>
          <NavLink to="/admin/fairs/invite" className="nav-item" title="Invite to Fair">
            <span className="material-icons">add_circle</span>
            {!isCollapsed && <span>Invite to Fair</span>}
          </NavLink>

          <NavLink to="/admin/fairs/applications" className="nav-item" title="View Applications">
            <span className="material-icons">list_alt</span>
            {!isCollapsed && <span>View Applications</span>}
          </NavLink>
         
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="material-icons">logout</span>
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </div>

      <ProfileSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <div className={`admin-sidebar-placeholder ${isCollapsed ? 'collapsed' : ''}`} />
    </>
  );
};

export default AdminSidebar; 