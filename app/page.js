'use client'

import React, { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('CaptionCroc Loading...');
  const [supabase, setSupabase] = useState(null);

  // Test basic functionality first
  const testBasics = () => {
    setMessage('Basic React is working!');
    console.log('React test successful');
  };

  // Test Supabase dynamic import
  const testSupabase = async () => {
    setMessage('Loading Supabase...');
    try {
      // Dynamic import to avoid server-side issues
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseClient = createClient(
        "https://dvpxrybauvofgxurvtai.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cHhyeWJhdXZvZmd4dXJ2dGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzY3NjQsImV4cCI6MjA1MjI1Mjc2NH0.E9x6KslOwWxXd8IBeWpWdR8QAE2uMdSW6LOxzmlet6E"
      );
      
      setSupabase(supabaseClient);
      console.log('Supabase loaded:', supabaseClient);
      setMessage('Supabase loaded successfully!');
      
    } catch (err) {
      console.log('Supabase load error:', err);
      setMessage('Supabase failed to load: ' + err.message);
    }
  };

  // Test simple Supabase query
  const testSupabaseQuery = async () => {
    if (!supabase) {
      setMessage('Load Supabase first!');
      return;
    }
    
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
          Load Supabase
        </button>

        <button 
          onClick={testSupabaseQuery}
          style={{ 
            padding: '10px 20px', 
            background: supabase ? '#EA8953' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: supabase ? 'pointer' : 'not-allowed'
          }}
        >
          Test Query
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Debug Steps:</h3>
        <ol>
          <li>✅ Basic React component loads</li>
          <li>🔄 Dynamic Supabase import</li>
          <li>🔄 Test Supabase query</li>
          <li>🔄 Add authentication (after)</li>
          <li>🔄 Add full features (final)</li>
        </ol>
      </div>
    </div>
  );
}
