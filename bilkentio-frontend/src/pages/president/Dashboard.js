import React from 'react';
import PresidentSidebar from '../../components/PresidentSidebar';

const PresidentDashboard = () => {
  return (
    <div className="admin-layout">
      <PresidentSidebar />
      <div className="admin-content">
        <h1>President Dashboard</h1>
        {/* Add your president-specific content here */}
      </div>
    </div>
  );
};

export default PresidentDashboard; 