import React from 'react';
import BaseSidebar from './BaseSidebar';

const GuideSidebar = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/guide/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'My Schedule',
      path: '/guide/schedule',
      icon: 'event'
    },
    {
      title: 'Tour History',
      path: '/guide/history',
      icon: 'history'
    }
  ];

  return <BaseSidebar logo="BilkentIO" menuItems={menuItems} />;
};

export default GuideSidebar; 