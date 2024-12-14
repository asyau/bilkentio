import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ProfileSettings from './ProfileSettings';
import '../styles/AdminSidebar.css';

const AdvisorSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
          <NavLink to="/advisor/AdvisorFormRequests" className="nav-item" title="Form Requests">
            <span className="material-icons">description</span>
            {!isCollapsed && <span>Form Requests</span>}
          </NavLink>

          <NavLink to="/advisor/day-selection" className="nav-item" title="Choose Day">
            <span className="material-icons">event</span>
            {!isCollapsed && <span>Choose Day</span>}
          </NavLink>

          <button 
            className="nav-item"
            onClick={() => setIsSettingsOpen(true)}
          >
            <span className="material-icons">settings</span>
            {!isCollapsed && <span>Settings</span>}
          </button>
        </nav>
      </div>
      
      <ProfileSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <div className={`sidebar-placeholder ${isCollapsed ? 'collapsed' : ''}`} />
    </>
  );
};

export default AdvisorSidebar; 