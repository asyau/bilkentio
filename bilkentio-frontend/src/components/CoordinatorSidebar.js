import React from 'react';
import BaseSidebar from './BaseSidebar';

const CoordinatorSidebar = () => {
  const menuItems = [
    
    
    {
      title: 'Analytics',
      path: '/coordinator/analytics',
      icon: 'analytics'
    },
    {
      title: 'Form Requests',
      path: '/coordinator/form-requests',
      icon: 'description'
    },
    {
      title: 'Staff Management',
      path: '/coordinator/staff',
      icon: 'groups'
    },
    {
      title: 'Tour Management',
      path: '/coordinator/tours',
      icon: 'map'
    },
    {
      title: 'View Puantaj Scores',
      path: '/coordinator/scores',
      icon: 'grade'
    },
    

  ];

  return <BaseSidebar logo="BilkentIO" menuItems={menuItems} />;
};

export default CoordinatorSidebar; 