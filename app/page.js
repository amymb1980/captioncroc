'use client'

import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Instagram, Twitter, Facebook, Linkedin, AlertCircle, Save, Calendar, BarChart3, Star, Crown, Lock, Zap, Heart, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [originalCaption, setOriginalCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedCaptions, setSavedCaptions] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showStylingPanel, setShowStylingPanel] = useState(false);
  
  // Pro Plan State
  const [userPlan, setUserPlan] = useState('free');
  const [dailyUsage, setDailyUsage] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error:', error);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        setUser(session.user);
        setShowLandingPage(false);
        loadCaptions(session.user.id);
      }
      
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setShowLandingPage(false);
        setTimeout(() => loadCaptions(session.user.id), 0);
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

  const loadCaptions = async (userId) => {
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
    { name: 'Instagram', limit: 2200, icon: Instagram, free: true },
    { name: 'Facebook', limit: 8000, icon: Facebook, free: true },
    { name: 'TikTok', limit: 2200, icon: Sparkles, free: true },
    { name: 'Twitter/X', limit: 280, icon: Twitter, free: false },
    { name: 'LinkedIn', limit: 3000, icon: Linkedin, free: false },
    { name: 'Etsy', limit: 160, icon: ShoppingBag, free: false }
  ];

  const tones = [
    { value: 'casual', label: 'Casual', premium: false },
    { value: 'professional', label: 'Professional', premium: false },
    { value: 'humorous', label: 'Humorous', premium: false },
    { value: 'inspirational', label: 'Inspirational', premium: false },
    { value: 'edgy', label: 'Edgy', premium: true },
    { value: 'witty', label: 'Witty', premium: true },
    { value: 'viral-optimised', label: 'Viral-Optimised', premium: true }
  ];

  const currentPlatform = platforms.find(p => p.name === platform);
  const favouriteCount = savedCaptions.filter(c => c.is_favourite).length;

  const canUsePlatform = (platformName) => {
    if (userPlan === 'pro') return true;
    const platformObj = platforms.find(p => p.name === platformName);
    return platformObj?.free;
  };

  const canUseTone = (toneValue) => {
    if (userPlan === 'pro') return true;
    const toneObj = tones.find(t => t.value === toneValue);
    return !toneObj?.premium;
  };

  const canGenerateCaption = () => {
    if (userPlan === 'pro') return true;
    return dailyUsage < 10;
  };

  const handleAuth = async (email, password, mode) => {
    setAuthLoading(true);
    
    let result;
    if (mode === 'signup') {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      alert(result.error.message);
    } else {
      setShowAuthModal(false);
    }
    
    setAuthLoading(false);
  };

  const handleOAuthLogin = async (provider) => {
    setAuthLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider.toLowerCase(),
      options: { redirectTo: window.location.origin }
    });

    if (error) {
      console.error('OAuth error:', error);
      alert('OAuth login failed. Please try again.');
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

    if (!canGenerateCaption()) {
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      // Call our OpenAI API route
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          tone,
          platform,
          includeHashtags
        }),
      });

      const data = await response.json();

      if (data.success && data.variations) {
        // Use real AI-generated variations
        setCaptionVariations(data.variations);
        setGeneratedCaption(data.variations[0]);
        setSelectedVariation(0);
        setShowVariations(true);
        setOriginalCaption(data.variations[0]);
        setShowStylingPanel(true);
      } else {
        // Fall back to our fallback captions if AI fails
        const fallbackVariations = data.fallback || [
          generateFallbackCaption('variation1'),
          generateFallbackCaption('variation2'), 
          generateFallbackCaption('variation3')
        ];
        
        setCaptionVariations(fallbackVariations);
        setGeneratedCaption(fallbackVariations[0]);
        setSelectedVariation(0);
        setShowVariations(true);
        setOriginalCaption(fallbackVariations[0]);
        setShowStylingPanel(true);
        
        // Show user that we used fallback
        alert('Used backup caption generator - AI service temporarily unavailable');
      }

      // Update daily usage
      if (userPlan === 'free') {
        setDailyUsage(prev => prev + 1);
      }
      
    } catch (error) {
      console.error('Caption generation error:', error);
      
      // Use fallback captions if everything fails
      const fallbackVariations = [
        generateFallbackCaption('variation1'),
        generateFallbackCaption('variation2'), 
        generateFallbackCaption('variation3')
      ];
      
      setCaptionVariations(fallbackVariations);
      setGeneratedCaption(fallbackVariations[0]);
      setSelectedVariation(0);
      setShowVariations(true);
      setOriginalCaption(fallbackVariations[0]);
      setShowStylingPanel(true);
      
      alert('Using backup caption generator - please check your connection');
    }
    
    setIsGenerating(false);
  };

  const applyCaptionStyle = (styleType) => {
    if (!originalCaption) return;
    
    let styledCaption = originalCaption;
    
    switch (styleType) {
      case 'minimalist':
        styledCaption = originalCaption.replace(/[🎉🎊✨🔥💯⭐🐊👇]/g, '').replace(/\n\n+/g, '\n\n').trim();
        break;
      case 'emoji-heavy':
        styledCaption = originalCaption.replace(/\./g, '. ✨').replace(/!/g, '! 🔥');
        break;
      case 'professional':
        styledCaption = originalCaption.replace(/[🎉🎊✨🔥💯🐊👇]/g, '').replace(/G'day!/g, 'Hello,').replace(/bonkers/g, 'effective');
        break;
      case 'listicle':
        const parts = originalCaption.split('\n\n');
        styledCaption = `Here's what you need to know:\n\n1. ${parts[0]}\n2. ${parts[1] || 'More insights coming!'}\n\n${parts[2] || ''}`;
        break;
    }
    
    setGeneratedCaption(styledCaption);
  };

  const saveCaption = async () => {
    if (!user || !generatedCaption) return;

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

    if (!error) {
      setSavedCaptions(prev => [data, ...prev]);
      alert('Caption saved!');
    }
  };

  const toggleFavourite = async (id) => {
    const caption = savedCaptions.find(c => c.id === id);
    if (!caption.is_favourite && favouriteCount >= 10 && userPlan === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    const newStatus = !caption.is_favourite;
    const { error } = await supabase
      .from('captions')
      .update({ is_favourite: newStatus })
      .eq('id', id);

    if (!error) {
      setSavedCaptions(prev => 
        prev.map(c => c.id === id ? { ...c, is_favourite: newStatus } : c)
      );
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied!');
    } catch (err) {
      alert('Failed to copy');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img src="/logo.png" alt="CaptionCroc Logo" className="w-16 h-16 opacity-80 animate-pulse" />
          </div>
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
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src="/logo.png" alt="CaptionCroc Logo" className="w-8 h-8 opacity-80" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {authMode === 'login' ? 'Welcome back to ' : 'Join '}
                  <span style={{ color: '#EA8953' }}>Caption</span>
                  <span style={{ color: '#007B40' }}>Croc</span>
                </h2>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthLogin('Google')}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span className="font-medium text-gray-700">Continue with Google</span>
              </button>
              
              <button
                onClick={() => handleOAuthLogin('Facebook')}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                <span className="font-medium text-gray-700">Continue with Facebook</span>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Email/Password Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth(email, password, authMode)}
                  placeholder="your@email.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#007B40' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth(email, password, authMode)}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#007B40' }}
                />
              </div>
              
              <button
                onClick={() => handleAuth(email, password, authMode)}
                disabled={authLoading}
                className="w-full text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50 transition-all"
                style={{ background: authLoading ? '#9CA3AF' : 'linear-gradient(135deg, #EA8953, #007B40)' }}
              >
                {authLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm font-medium hover:opacity-80 transition-colors"
                style={{ color: '#007B40' }}
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            {authMode === 'signup' && (
              <p className="text-xs text-gray-500 text-center mt-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const UpgradeModal = () => (
    showUpgradeModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Upgrade?</h2>
            <p className="text-gray-600">Unlock unlimited snappy captions and styling magic!</p>
          </div>

          <div className="border-2 border-teal-500 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Pro Croc</h3>
              <div className="text-3xl font-bold text-teal-600 mt-2">$9<span className="text-lg text-gray-500">/month</span></div>
            </div>
            <ul className="space-y-2 text-sm mb-6">
              <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Unlimited captions</strong></li>
              <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>8 styling options</strong></li>
              <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All 6 platforms</strong></li>
              <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Premium tones</strong></li>
              <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Unlimited favourites</strong></li>
            </ul>
            <button 
              onClick={() => {setUserPlan('pro'); setShowUpgradeModal(false);}}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700"
            >
              Upgrade to Pro Croc - $9/month
            </button>
          </div>

          <div className="text-center">
            <button onClick={() => setShowUpgradeModal(false)} className="text-gray-500 text-sm">
              Maybe later - continue with free plan
            </button>
          </div>
        </div>
      </div>
    )
  );

  if (showLandingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-24 flex items-center justify-center">
                <img src="/logo.png" alt="CaptionCroc Logo" className="w-20 h-20 opacity-80" />
              </div>
              <h1 className="text-5xl font-bold">
                <span style={{ color: '#EA8953' }}>Caption</span>
                <span style={{ color: '#007B40' }}>Croc</span>
              </h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Snappy captions<br />
              <span style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>that bite!</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Generate engaging social media captions in seconds with AI. Crikey, you'll never run out of content ideas again!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => {setAuthMode('signup'); setShowAuthModal(true);}}
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
              >
                Start Creating Captions Free
              </button>
              <button
                onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
                className="border-2 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-10 transition-all"
                style={{ borderColor: '#007B40', color: '#007B40' }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-20 h-20 flex items-center justify-center">
              <img src="/logo.png" alt="CaptionCroc Logo" className="w-16 h-16 opacity-80" />
            </div>
            <h1 className="text-4xl font-bold">
              <span style={{ color: '#EA8953' }}>Caption</span>
              <span style={{ color: '#007B40' }}>Croc</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">Please sign in to continue</p>
          <button
            onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
            className="text-white px-8 py-3 rounded-lg font-semibold"
            style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
          >
            Sign In
          </button>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-teal-50 to-orange-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-8 border-b border-gray-200">
          <div className="text-center mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowLandingPage(true)}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: '#007B40' }}
              >
                ← Back to Home
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src="/logo.png" alt="CaptionCroc Logo" className="w-12 h-12 opacity-80" />
                </div>
                <h1 className="text-4xl font-bold">
                  <span style={{ color: '#EA8953' }}>Caption</span>
                  <span style={{ color: '#007B40' }}>Croc</span>
                </h1>
                {userPlan === 'pro' && <Crown className="text-yellow-500" size={24} />}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">
                    {user.email?.split('@')[0]}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action (Optional)</label>
                    <input
                      type="text"
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      placeholder="e.g., Check out our website, Share your thoughts, Like if you agree"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#007B40' }}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hashtags"
                      checked={includeHashtags}
                      onChange={(e) => setIncludeHashtags(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="hashtags" className="text-sm font-medium text-gray-700">
                      Include hashtags (3-5 relevant tags)
                    </label>
                  </div>

                  <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-700">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg">Snappy captions that bite!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className={`rounded-lg p-4 ${userPlan === 'pro' ? 'bg-gradient-to-r from-teal-50 to-orange-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {userPlan === 'pro' ? <Crown size={20} className="text-yellow-500" /> : <BarChart3 size={20} className="text-teal-600" />}
                  <span className="font-medium text-gray-800">
                    {userPlan === 'pro' ? 'Pro Croc' : 'Free Plan'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {userPlan === 'pro' ? '∞' : `${dailyUsage}/10`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {userPlan === 'pro' ? 'unlimited' : 'daily usage'}
                  </div>
                </div>
              </div>
              {userPlan !== 'pro' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(dailyUsage / 10) * 100}%`,
                      background: 'linear-gradient(135deg, #EA8953, #007B40)'
                    }}
                  ></div>
                </div>
              )}
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={20} className="text-orange-500" />
                  <span className="font-medium text-gray-800">Favourites</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {userPlan === 'pro' ? favouriteCount : `${favouriteCount}/10`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {userPlan === 'pro' ? 'unlimited' : 'saved favourites'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'generator' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Generator
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Saved Captions ({savedCaptions.length})
              {favouriteCount > 0 && <span className="ml-1 text-orange-500">★{favouriteCount}</span>}
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'pricing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {userPlan === 'free' ? 'Upgrade' : 'Pricing'}
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'generator' && (
            <div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-green-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-green-800 mb-1">🤖 Real AI Integration Active! 🎉</h3>
                    <p className="text-sm text-green-700">
                      Now powered by OpenAI GPT for authentic, engaging captions with Australian flair!
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <div className="grid grid-cols-2 gap-2">
                      {platforms.map((p) => {
                        const Icon = p.icon;
                        const isLocked = !canUsePlatform(p.name);
                        return (
                          <button
                            key={p.name}
                            onClick={() => {
                              if (isLocked) {
                                setShowUpgradeModal(true);
                              } else {
                                setPlatform(p.name);
                              }
                            }}
                            className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 relative ${
                              platform === p.name && !isLocked
                                ? 'bg-opacity-10 text-gray-800'
                                : isLocked
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={platform === p.name && !isLocked ? { borderColor: '#007B40', backgroundColor: '#007B4010' } : {}}
                          >
                            <Icon size={16} />
                            <span className="text-sm font-medium">{p.name}</span>
                            {isLocked && <Lock size={12} className="absolute top-1 right-1" />}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Character limit: {currentPlatform?.limit} characters
                      {userPlan === 'free' && ' • Pro plan unlocks all platforms'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., sustainable fashion, productivity tips, weekend vibes"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#007B40' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => {
                        const selectedTone = e.target.value;
                        if (!canUseTone(selectedTone)) {
                          setShowUpgradeModal(true);
                          return;
                        }
                        setTone(selectedTone);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#007B40' }}
                    >
                      {tones.map(t => (
                        <option key={t.value} value={t.value} disabled={!canUseTone(t.value)}>
                          {t.label} {t.premium && userPlan !== 'pro' ? '🔒 Pro' : ''}
                        </option>
                      ))}
                    </select>
                    {userPlan !== 'pro' && (
                      <p className="text-xs text-gray-500 mt-1">
                        🔒 Premium tones (Edgy, Witty, Viral-Optimised) available in Pro plan
                      </p>
                    )}
                  </div>

                  <button
                    onClick={generateCaption}
                    disabled={isGenerating || !topic.trim() || !canGenerateCaption()}
                    className="w-full text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    style={{ background: isGenerating || !topic.trim() || !canGenerateCaption() ? '#9CA3AF' : 'linear-gradient(135deg, #EA8953, #007B40)' }}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Generating with AI...
                      </>
                    ) : !canGenerateCaption() ? (
                      <>
                        <Lock size={16} />
                        Daily Limit Reached
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate Caption
                      </>
                    )}
                  </button>

                  {!canGenerateCaption() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-amber-700 text-sm">
                        You've used {dailyUsage}/10 captions today. Upgrade to Pro Croc for unlimited access!
                      </p>
                      <button 
                        onClick={() => setShowUpgradeModal(true)}
                        className="mt-2 text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700"
                      >
                        Upgrade to Pro Croc
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Generated Caption</h3>
                    {generatedCaption && (
                      <div className="flex items-center gap-2">
                        <currentPlatform.icon size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-600">
                          {generatedCaption.length}/{currentPlatform?.limit}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <textarea
                    value={generatedCaption}
                    readOnly
                    placeholder="Your AI-generated caption will appear here..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                  />
                  
                  {generatedCaption && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => copyToClipboard(generatedCaption)}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        title="Copy to clipboard"
                      >
                        <Copy size={16} className="text-gray-600" />
                        Copy
                      </button>
                      <button
                        onClick={saveCaption}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        title="Save caption"
                      >
                        <Save size={16} className="text-gray-600" />
                        Save
                      </button>
                      <button
                        onClick={() => setShowStylingPanel(!showStylingPanel)}
                        className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm ${showStylingPanel ? 'bg-teal-50 border-teal-300' : ''}`}
                        title="Style caption"
                      >
                        <Sparkles size={16} className={showStylingPanel ? 'text-teal-600' : 'text-gray-600'} />
                        Style
                      </button>
                    </div>
                  )}

                  {/* Caption Variations Selector */}
                  {showVariations && captionVariations.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="text-teal-600" size={16} />
                        <h4 className="font-medium text-gray-800">AI Generated Variations</h4>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          Powered by OpenAI
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {captionVariations.map((variation, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedVariation(index);
                              setGeneratedCaption(variation);
                              setOriginalCaption(variation);
                            }}
                            className={`p-3 text-left rounded-lg border-2 transition-all ${
                              selectedVariation === index
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-800">
                                Variation {index + 1}
                                {selectedVariation === index && <span className="ml-2 text-teal-600">✓ Selected</span>}
                              </span>
                              <span className="text-xs text-gray-500">{variation.length} chars</span>
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-3">
                              {variation.length > 120 ? variation.substring(0, 120) + '...' : variation}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        🤖 Choose your favourite AI-generated variation, then style it further below!
                      </p>
                    </div>
                  )}

                  {/* Caption Styling Panel */}
                  {showStylingPanel && generatedCaption && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✨</span>
                          </div>
                          Style Your Caption
                          {userPlan !== 'pro' && (
                            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">Pro Feature</span>
                          )}
                        </h4>
                        <button
                          onClick={() => setGeneratedCaption(originalCaption)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Reset to Original
                        </button>
                      </div>
                      
                      {userPlan !== 'pro' && (
                        <div className="bg-gradient-to-r from-teal-50 to-orange-50 border border-teal-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-3">
                            <Crown className="text-teal-600" size={20} />
                            <div>
                              <h5 className="font-medium text-teal-800">Unlock 8 Caption Styles</h5>
                              <p className="text-sm text-teal-700">Transform your captions for Instagram, LinkedIn, TikTok and more with Pro styling options.</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="mt-3 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
                          >
                            Upgrade to Pro - $9/month
                          </button>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['minimalist', 'emoji-heavy', 'professional', 'listicle'].map((style) => (
                          <button
                            key={style}
                            onClick={() => userPlan === 'pro' ? applyCaptionStyle(style) : setShowUpgradeModal(true)}
                            className={`p-3 border rounded-lg text-left transition-all ${
                              userPlan === 'pro' 
                                ? 'border-gray-200 hover:border-teal-300 hover:bg-teal-50' 
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-75'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-sm text-gray-800 capitalize">{style.replace('-', ' ')}</div>
                              {userPlan !== 'pro' && <Lock size={12} className="text-gray-400" />}
                            </div>
                            <div className="text-xs text-gray-500">
                              {style === 'minimalist' && 'Clean & simple'}
                              {style === 'emoji-heavy' && 'Fun & expressive ✨'}
                              {style === 'professional' && 'LinkedIn ready'}
                              {style === 'listicle' && 'Numbered points'}
                            </div>
                          </button>
                        ))}
                      </div>
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
                  <p className="text-gray-600 text-lg">No captions saved yet</p>
                  <p className="text-gray-500">Generate and save captions to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">Saved Captions</h2>
                  {savedCaptions.map((caption) => (
                    <div key={caption.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{caption.platform}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{caption.tone}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{new Date(caption.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFavourite(caption.id)}
                            className={`p-1 rounded ${caption.is_favourite ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
                          >
                            <Star size={16} fill={caption.is_favourite ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => copyToClipboard(caption.caption)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-800 mb-2">{caption.topic}</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{caption.caption}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{caption.caption.length} characters</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Unlock more features and remove limits</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className={`border-2 rounded-lg p-6 ${userPlan === 'free' ? 'bg-opacity-10' : 'border-gray-200'}`}
                     style={userPlan === 'free' ? { borderColor: '#007B40', backgroundColor: '#007B4010' } : {}}>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Free Plan</h3>
                    <div className="text-3xl font-bold text-green-600 mt-2">$0<span className="text-lg text-gray-500">/month</span></div>
                    {userPlan === 'free' && <span className="inline-block text-white px-3 py-1 rounded-full text-sm mt-2" style={{ background: '#007B40' }}>Current Plan</span>}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 10 captions per day</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 3 platforms (Instagram, Facebook, TikTok)</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Standard tones</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Save up to 10 favourites</li>
                  </ul>
                </div>

                <div className={`border-2 rounded-lg p-6 relative ${userPlan === 'pro' ? 'bg-opacity-10' : 'border-2'}`}
                     style={userPlan === 'pro' ? { borderColor: '#007B40', backgroundColor: '#007B4010' } : { borderColor: '#007B40' }}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="text-white px-3 py-1 rounded-full text-sm" style={{ background: '#007B40' }}>Popular</span>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Pro Plan</h3>
                    <div className="text-3xl font-bold text-teal-600 mt-2">$9<span className="text-lg text-gray-500">/month</span></div>
                    {userPlan === 'pro' && <span className="inline-block text-white px-3 py-1 rounded-full text-sm mt-2" style={{ background: '#007B40' }}>Current Plan</span>}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Unlimited caption generation</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 8 caption styling options</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> All 6 platforms (including LinkedIn, Etsy)</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Premium tones (Edgy, Witty, Viral)</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Unlimited favourites</li>
                  </ul>
                  {userPlan !== 'pro' && (
                    <button 
                      onClick={() => setUserPlan('pro')}
                      className="w-full mt-6 text-white py-2 px-4 rounded-lg hover:opacity-90"
                      style={{ background: '#007B40' }}
                    >
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <UpgradeModal />
      <AuthModal />
    </div>
  );
}
