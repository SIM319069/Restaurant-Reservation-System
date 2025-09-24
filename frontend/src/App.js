import React from 'react';
import './index.css';

function App() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#f97316' }}>🍽️ Restaurant Reservation System</h1>
      <p>System is running successfully!</p>
      <div style={{ marginTop: '20px' }}>
        <button style={{ 
          backgroundColor: '#f97316', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;