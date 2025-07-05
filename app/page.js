'use client'

import React, { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('CaptionCroc Loading...');

  // Test basic functionality first
  const testBasics = () => {
    setMessage('Basic React is working!');
    console.log('React test successful');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#EA8953' }}>Caption<span style={{ color: '#007B40' }}>Croc</span></h1>
        <p>{message}</p>
      </div>
      
      <button 
        onClick={testBasics}
        style={{ 
          padding: '10px 20px', 
          background: 'linear-gradient(135deg, #EA8953, #007B40)',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Basic React
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Debug Steps:</h3>
        <ol>
          <li>✅ Basic React component loads</li>
          <li>🔄 Test Supabase connection (next)</li>
          <li>🔄 Add authentication (after)</li>
          <li>🔄 Add full features (final)</li>
        </ol>
      </div>
    </div>
  );
}
