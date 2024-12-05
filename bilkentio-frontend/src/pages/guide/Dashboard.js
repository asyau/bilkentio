import React from 'react';
import GuideSidebar from '../../components/GuideSidebar';

const GuideDashboard = () => {
  return (
    <div className="admin-layout">
      <GuideSidebar />
      <div className="admin-content">
        <h1>Guide Dashboard</h1>
        {/* Add your guide-specific content here */}
      </div>
    </div>
  );
};

export default GuideDashboard; 