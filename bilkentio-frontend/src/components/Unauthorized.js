import React from 'react';

const Unauthorized = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '24px',
      color: '#dc3545',
      textAlign: 'center',
      padding: '0 20px'
    }}>
      Unauthorized: You don't have permission to access this page
    </div>
  );
};

export default Unauthorized; 