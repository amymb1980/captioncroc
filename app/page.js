'use client'

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [message, setMessage] = useState('CaptionCroc Loading...');

  // Test basic functionality first
  const testBasics = () => {
    setMessage('Basic React is working!');
    console.log('React test successful');
  };

  // Test Supabase import
  const testSupabase = () => {
    console.log('Supabase object:', supabase);
    setMessage('Supabase imported successfully!');
  };

  // Test simple Supabase query
  const testSupabaseQuery = async () => {
    setMessage('Testing Supabase query...');
    try {
      const { data, error } = await supabase.from('user_profiles').select('count');
      console.log('Query result:', { data, error });
      setMessage(`Query result: ${error ? 'Error: ' + error.message : 'Success!'}`);
    } catch (err) {
      console.log('Query error:', err);
      setMessage('Query failed: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#EA8953' }}>Caption<span style={{ color: '#007B40' }}>Croc</span></h1>
        <p>{message}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
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
          Test React
        </button>

        <button 
          onClick={testSupabase}
          style={{ 
            padding: '10px 20px', 
            background: '#007B40',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Supabase Import
        </button>

        <button 
          onClick={testSupabaseQuery}
          style={{ 
            padding: '10px 20px', 
            background: '#EA8953',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Supabase Query
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Debug Steps:</h3>
        <ol>
          <li>✅ Basic React component loads</li>
          <li>🔄 Test Supabase import</li>
          <li>🔄 Test Supabase query</li>
          <li>🔄 Add authentication (after)</li>
          <li>🔄 Add full features (final)</li>
        </ol>
      </div>
    </div>
  );
}
