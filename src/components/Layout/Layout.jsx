import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {children}
    </div>
  );
};

export default Layout;
