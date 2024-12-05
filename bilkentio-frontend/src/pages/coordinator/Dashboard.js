import React from 'react';
import CoordinatorSidebar from '../../components/CoordinatorSidebar';

const CoordinatorDashboard = () => {
  return (
    <div className="admin-layout">
      <CoordinatorSidebar />
      <div className="admin-content">
        <h1>Coordinator Dashboard</h1>
        {/* Add your coordinator-specific content here */}
      </div>
    </div>
  );
};

export default CoordinatorDashboard; 