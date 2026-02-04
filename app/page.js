'use client'

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [test, setTest] = useState('Working!');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-teal-600" />
        <h1 className="text-4xl font-bold mb-2">
          <span style={{ color: '#EA8953' }}>Caption</span>
          <span style={{ color: '#007B40' }}>Croc</span>
        </h1>
        <p className="text-xl text-gray-600">{test}</p>
      </div>
    </div>
  );
}
