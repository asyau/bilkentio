import React from 'react';
import BaseSidebar from './BaseSidebar';

const CoordinatorSidebar = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/coordinator/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'Guide Management',
      path: '/coordinator/guides',
      icon: 'people'
    },
    {
      title: 'Tour Schedule',
      path: '/coordinator/schedule',
      icon: 'event'
    },
    {
      title: 'Form Requests',
      path: '/coordinator/forms',
      icon: 'description'
    }
  ];

  return <BaseSidebar logo="BilkentIO" menuItems={menuItems} />;
};

export default CoordinatorSidebar; 