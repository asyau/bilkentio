import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';
import ProfileSettings from './ProfileSettings';

const BaseSidebar = ({ logo, menuItems }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    console.log("Logging out...");
    window.location.href = '/login';
  };

  return (
    <>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="logo-section">
          {!isCollapsed && <h2>{logo}</h2>}
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
          {menuItems.map((item, index) => (
            <NavLink 
              key={index}
              to={item.path} 
              className="nav-item" 
              title={item.title}
            >
              <span className="material-icons">{item.icon}</span>
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          ))}

          <button 
            className="nav-item"
            onClick={() => setIsSettingsOpen(true)}
          >
            <span className="material-icons">settings</span>
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button className="logout-btn" onClick={handleLogout}>
            <span className="material-icons">logout</span>
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </nav>
      </div>
      <div className={`sidebar-placeholder ${isCollapsed ? 'collapsed' : ''}`} />
      <ProfileSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default BaseSidebar; 