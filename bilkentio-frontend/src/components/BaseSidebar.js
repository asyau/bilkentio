import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const BaseSidebar = ({ logo, menuItems }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        </nav>
      </div>
      <div className={`sidebar-placeholder ${isCollapsed ? 'collapsed' : ''}`} />
    </>
  );
};

export default BaseSidebar; 