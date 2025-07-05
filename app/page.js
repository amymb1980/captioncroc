'use client'

import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Instagram, Twitter, Facebook, Linkedin, AlertCircle, Save, Calendar, BarChart3, Star, Heart, Crown, Lock, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SocialMediaCaptionGenerator = () => {
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State
  const [userPlan, setUserPlan] = useState('free');
  const [dailyUsage, setDailyUsage] = useState(0);
  const [savedCaptions, setSavedCaptions] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  // Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);

  // Auth check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking user:', error);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        setShowLandingPage(false);
        loadUserData(session.user.id);
      }
      
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setShowLandingPage(false);
        setTimeout(() => loadUserData(session.user.id), 0);
      } else {
        setUser(null);
        setShowLandingPage(true);
        setSavedCaptions([]);
        setUserPlan('free');
        setDailyUsage(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    // Load captions
    const { data, error } = await supabase
      .from('captions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      setSavedCaptions(data || []);
    }
  };

  const platforms = [
    { name: 'Instagram', limit: 2200, icon: Instagram },
    { name: 'Facebook', limit: 8000, icon: Facebook },
    { name: 'TikTok', limit: 2200, icon: Sparkles },
    { name: 'Twitter/X', limit: 280, icon: Twitter },
    { name: 'LinkedIn', limit: 3000, icon: Linkedin }
  ];

  const tones = [
    { value: 'casual', label: 'Casual' },
    { value: 'professional', label: 'Professional' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'inspirational', label: 'Inspirational' }
  ];

  const currentPlatform = platforms.find(p => p.name === platform);

  // Auth functions
  const handleEmailAuth = async (email, password, mode) => {
    setAuthLoading(true);
    
    let result;
    if (mode === 'signup') {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      alert(result.error.message || 'Authentication failed');
    } else {
      setShowAuthModal(false);
    }
    
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const generateCaption = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsGenerating(true);
    
    // Simple fallback caption
    const caption = `🎉 Just discovered something amazing about ${topic}! This ${tone} approach is absolutely game-changing. 

Who else is excited about this? Drop your thoughts below! 👇

#${topic.toLowerCase().replace(/\s+/g, '')} #${tone} #socialmedia`;
    
    setGeneratedCaption(caption);
    
    // Update usage
    const newUsage = dailyUsage + 1;
    setDailyUsage(newUsage);
    
    setIsGenerating(false);
  };

  const saveCaption = async () => {
    if (!user || !generatedCaption) {
      alert('Please generate a caption first');
      return;
    }

    const { data, error } = await supabase
      .from('captions')
      .insert([{
        user_id: user.id,
        platform,
        topic,
        tone,
        caption: generatedCaption,
        is_favourite: false
      }])
      .select()
      .single();

    if (error) {
      alert('Failed to save caption');
      return;
    }

    setSavedCaptions(prev => [data, ...prev]);
    alert('Caption saved!');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      alert('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading CaptionCroc...</div>
        </div>
      </div>
    );
  }

  const AuthModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>
          
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            
            <button
              onClick={() => handleEmailAuth(email, password, authMode)}
              disabled={authLoading}
              className="w-full text-white py-3 px-4 rounded-lg font-medium"
              style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
            >
              {authLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-sm text-blue-600"
            >
              {authMode === 'login' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
            </button>
          </div>
          
          <button
            onClick={() => setShowAuthModal(false)}
            className="mt-4 text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-bold mb-4">
          <span style={{ color: '#EA8953' }}>Caption</span>
          <span style={{ color: '#007B40' }}>Croc</span>
        </h1>
        
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Snappy captions that bite!
        </h2>
        
        <p className="text-xl text-gray-600 mb-8">
          Generate engaging social media captions in seconds with AI.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => {setAuthMode('signup'); setShowAuthModal(true);}}
            className="text-white px-8 py-4 rounded-lg text-lg font-semibold"
            style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
          >
            Start Free
          </button>
          <button
            onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
            className="border-2 px-8 py-4 rounded-lg text-lg font-semibold"
            style={{ borderColor: '#007B40', color: '#007B40' }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showLandingPage ? (
        <LandingPage />
      ) : !user ? (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              <span style={{ color: '#EA8953' }}>Caption</span>
              <span style={{ color: '#007B40' }}>Croc</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">Please sign in to continue</p>
            <button
              onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
              className="text-white px-8 py-3 rounded-lg font-semibold"
              style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
            >
              Sign In
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-teal-50 to-orange-50 min-h-screen">
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowLandingPage(true)}
                  className="text-sm font-medium text-blue-600"
                >
                  ← Back to Home
                </button>
                
                <h1 className="text-3xl font-bold">
                  <span style={{ color: '#EA8953' }}>Caption</span>
                  <span style={{ color: '#007B40' }}>Croc</span>
                </h1>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-800">
                    {user.email?.split('@')[0]}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-xs text-gray-500"
                  >
                    Sign out
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">Daily Usage</span>
                    <span className="text-2xl font-bold text-gray-800">{dailyUsage}/10</span>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">Saved</span>
                    <span className="text-2xl font-bold text-gray-800">{savedCaptions.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('generator')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    activeTab === 'generator' ? 'bg-white text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Generator
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                    activeTab === 'saved' ? 'bg-white text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Saved ({savedCaptions.length})
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'generator' && (
                <div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-teal-600 mt-0.5" size={20} />
                      <div>
                        <h3 className="font-medium text-teal-800 mb-1">Supabase Connected! 🎉</h3>
                        <p className="text-sm text-teal-700">Fixed React errors. Ready for AI integration!</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                        <select
                          value={platform}
                          onChange={(e) => setPlatform(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          {platforms.map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g., productivity tips, weekend vibes"
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                        <select
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        >
                          {tones.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={generateCaption}
                        disabled={isGenerating || !topic.trim()}
                        className="w-full text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Generate Caption
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Generated Caption</h3>
                      <textarea
                        value={generatedCaption}
                        readOnly
                        placeholder="Your caption will appear here..."
                        className="w-full h-48 p-4 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                      />
                      
                      {generatedCaption && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(generatedCaption)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            <Copy size={16} />
                            Copy
                          </button>
                          <button
                            onClick={saveCaption}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            <Save size={16} />
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'saved' && (
                <div>
                  {savedCaptions.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No captions saved yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-800">Saved Captions</h2>
                      {savedCaptions.map((caption) => (
                        <div key={caption.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-500">
                              {caption.platform} • {caption.tone} • {new Date(caption.created_at).toLocaleDateString()}
                            </div>
                            <button
                              onClick={() => copyToClipboard(caption.caption)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                          <h3 className="font-medium text-gray-800 mb-2">{caption.topic}</h3>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{caption.caption}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal />
    </>
  );
};

export default function Home() {
  return <SocialMediaCaptionGenerator />
}
