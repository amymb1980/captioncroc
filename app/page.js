'use client'

import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Instagram, Twitter, Facebook, Linkedin, AlertCircle, Save, Download, Trash2, ExternalLink, Calendar, BarChart3, Star, Heart, Crown, Lock, Zap, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SocialMediaCaptionGenerator = () => {
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [callToAction, setCallToAction] = useState('');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [humanizeCaption, setHumanizeCaption] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [captionVariations, setCaptionVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [showVariations, setShowVariations] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Subscription & Credits State
  const [userPlan, setUserPlan] = useState('free');
  const [credits, setCredits] = useState(0);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Features State
  const [savedCaptions, setSavedCaptions] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');
  const [exportWebhook, setExportWebhook] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [favouritesFilter, setFavouritesFilter] = useState('all');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showStylingPanel, setShowStylingPanel] = useState(false);
  const [originalCaption, setOriginalCaption] = useState('');
  
  // Authentication State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);

  // Check user authentication status on component mount
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
        loadUserProfile(session.user.id);
        loadUserCaptions(session.user.id);
      }
      
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setShowLandingPage(false);
        setTimeout(() => {
          loadUserProfile(session.user.id);
          loadUserCaptions(session.user.id);
        }, 0);
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

  // Load user profile data
  const loadUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading profile:', error);
      return;
    }

    if (data) {
      setUserPlan(data.plan || 'free');
      setDailyUsage(data.daily_usage || 0);
    } else {
      createUserProfile(userId);
    }
  };

  // Create user profile
  const createUserProfile = async (userId) => {
    const { error } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          email: user?.email,
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
          plan: 'free',
          daily_usage: 0
        }
      ]);

    if (error) {
      console.error('Error creating profile:', error);
    }
  };

  // Load user captions
  const loadUserCaptions = async (userId) => {
    const { data, error } = await supabase
      .from('captions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading captions:', error);
      return;
    }

    setSavedCaptions(data || []);
  };

  // Subscription Configuration
  const subscriptionLimits = {
    free: {
      dailyLimit: 10,
      platforms: ['Instagram', 'Facebook', 'TikTok'],
      tones: ['casual', 'professional', 'humorous', 'inspirational', 'educational', 'conversational', 'formal', 'playful', 'motivational', 'friendly'],
      maxFavourites: 10,
      features: ['Caption Variations', 'Humanizer', 'Character Guides']
    },
    pro: {
      dailyLimit: Infinity,
      platforms: ['Instagram', 'Facebook', 'TikTok', 'Twitter/X', 'LinkedIn', 'Etsy'],
      tones: ['casual', 'professional', 'humorous', 'inspirational', 'educational', 'conversational', 'formal', 'playful', 'motivational', 'friendly', 'edgy', 'witty', 'viral-optimised'],
      maxFavourites: Infinity,
      features: ['Everything in Free', 'Caption Styling', 'All Platforms', 'Premium Tones', 'Instant Tweaking', '24hr Support']
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
    { value: 'educational', label: 'Educational', premium: false },
    { value: 'conversational', label: 'Conversational', premium: false },
    { value: 'formal', label: 'Formal', premium: false },
    { value: 'playful', label: 'Playful', premium: false },
    { value: 'motivational', label: 'Motivational', premium: false },
    { value: 'friendly', label: 'Friendly', premium: false },
    { value: 'edgy', label: 'Edgy', premium: true },
    { value: 'witty', label: 'Witty', premium: true },
    { value: 'viral-optimised', label: 'Viral-Optimised', premium: true }
  ];

  const currentPlatform = platforms.find(p => p.name === platform);
  const currentLimits = subscriptionLimits[userPlan] || subscriptionLimits.free;
  const favouriteCount = savedCaptions.filter(c => c.is_favourite).length;

  const canGenerateCaption = () => {
    if (userPlan === 'pro') return true;
    if (userPlan === 'free' && dailyUsage < currentLimits.dailyLimit) return true;
    return false;
  };

  const canUsePlatform = (platformName) => {
    if (userPlan === 'pro') return true;
    return currentLimits.platforms.includes(platformName);
  };

  const canUseTone = (toneValue) => {
    if (userPlan === 'pro') return true;
    return currentLimits.tones.includes(toneValue);
  };

  const canAddFavourite = () => {
    if (userPlan === 'pro') return true;
    return favouriteCount < currentLimits.maxFavourites;
  };

  // Authentication Functions
  const handleEmailAuth = async (email, password, mode) => {
    setAuthLoading(true);
    
    let result;
    if (mode === 'signup') {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: email.split('@')[0] }
        }
      });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      console.error('Auth error:', result.error);
      alert(result.error.message || 'Authentication failed. Please try again.');
    } else {
      if (mode === 'signup' && result.data.user && !result.data.session) {
        alert('Check your email for the confirmation link!');
      }
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
  };

  // Caption generation and other functions...
  const generateCaption = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic for your post');
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
    
    const variations = [
      generateFallbackCaption('variation1'),
      generateFallbackCaption('variation2'), 
      generateFallbackCaption('variation3')
    ];
    
    setCaptionVariations(variations);
    setGeneratedCaption(variations[0]);
    setSelectedVariation(0);
    setShowVariations(true);
    setOriginalCaption(variations[0]);
    setShowStylingPanel(true);

    if (userPlan === 'free') {
      const newUsage = dailyUsage + 1;
      setDailyUsage(newUsage);

      const { error } = await supabase
        .from('user_profiles')
        .update({ daily_usage: newUsage })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating usage:', error);
      }
    }
    
    setIsGenerating(false);
  };

  const generateFallbackCaption = (variation = 'default') => {
    const baseIntros = {
      variation1: `G'day! Just had to share my thoughts on ${topic}! This ${tone} approach is absolutely bonkers (in the best way). 🐊`,
      variation2: `Crikey! Been diving deep into ${topic} lately and I'm totally hooked! This ${tone} perspective really hits different. 🔥`,
      variation3: `Fair dinkum, ${topic} has been on my radar and I can't get enough! This ${tone} angle is pure gold, no cap. ✨`
    };
    
    const ctas = {
      variation1: callToAction || 'What do you reckon? Drop your thoughts below!',
      variation2: callToAction || 'Anyone else feeling this vibe? Let me know! 👇',
      variation3: callToAction || 'Who else is on this wavelength? Keen to hear your take!'
    };
    
    let baseCaption = baseIntros[variation] || baseIntros.variation1;
    const cta = `\n\n${ctas[variation] || ctas.variation1}`;
    const hashtags = includeHashtags ? `\n\n#${topic.toLowerCase().replace(/\s+/g, '')} #${tone} #socialmedia #snappycaptions` : '';
    
    return baseCaption + cta + hashtags;
  };

  const saveCaption = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!generatedCaption) {
      alert('No caption to save');
      return;
    }

    const { data, error } = await supabase
      .from('captions')
      .insert([
        {
          user_id: user.id,
          platform,
          topic,
          tone,
          caption: generatedCaption,
          is_favourite: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving caption:', error);
      alert('Failed to save caption. Please try again.');
      return;
    }

    setSavedCaptions(prev => [data, ...prev]);
    alert('Caption saved successfully!');
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Caption copied to clipboard!');
    } catch (err) {
      alert('Failed to copy caption');
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img 
              src="/logo.png" 
              alt="CaptionCroc Logo" 
              className="w-16 h-16 opacity-80 animate-pulse"
              style={{ filter: 'drop-shadow(none)' }}
            />
          </div>
          <div className="text-lg text-gray-600">Loading CaptionCroc...</div>
        </div>
      </div>
    );
  }

  const AuthModal = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = () => {
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
      
      if (authMode === 'signup' && password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      
      handleEmailAuth(email, password, authMode);
    };

    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="CaptionCroc Logo" 
                    className="w-8 h-8 opacity-80"
                    style={{ filter: 'drop-shadow(none)' }}
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {authMode === 'login' ? 'Welcome back to ' : 'Join '}
                  <span style={{ color: '#EA8953' }}>Caption</span>
                  <span style={{ color: '#007B40' }}>Croc</span>
                </h2>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

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
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#007B40' }}
                />
              </div>
              
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="••••••••"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#007B40' }}
                  />
                </div>
              )}
              
              <button
                onClick={handleSubmit}
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
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-24 h-24 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="CaptionCroc Logo" 
                  className="w-20 h-20 opacity-80"
                  style={{ filter: 'drop-shadow(none)' }}
                />
              </div>
              <h1 className="text-5xl font-bold">
                <span style={{ color: '#EA8953' }}>Caption</span>
                <span style={{ color: '#007B40' }}>Croc</span>
              </h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Snappy captions<br />
              <span style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>that bite!</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Generate engaging social media captions in seconds with AI. Crikey, you'll never run out of content ideas again!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => {
                  setAuthMode('signup'); 
                  setShowAuthModal(true);
                }}
                className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
              >
                Start Creating Captions Free
              </button>
              <button
                onClick={() => {
                  setAuthMode('login'); 
                  setShowAuthModal(true);
                }}
                className="border-2 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-10 transition-all"
                style={{ borderColor: '#007B40', color: '#007B40' }}
              >
                Sign In
              </button>
            </div>
          </div>
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
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-20 h-20 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="CaptionCroc Logo" 
                  className="w-16 h-16 opacity-80"
                  style={{ filter: 'drop-shadow(none)' }}
                />
              </div>
              <h1 className="text-4xl font-bold">
                <span style={{ color: '#EA8953' }}>Caption</span>
                <span style={{ color: '#007B40' }}>Croc</span>
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">Please sign in to continue</p>
            <button
              onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
              className="text-white px-8 py-3 rounded-lg font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
            >
              Sign In
            </button>
          </div>
        </div>
      ) : (
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
                      <img 
                        src="/logo.png" 
                        alt="CaptionCroc Logo" 
                        className="w-12 h-12 opacity-80"
                        style={{ filter: 'drop-shadow(none)' }}
                      />
                    </div>
                    <h1 className="text-4xl font-bold">
                      <span style={{ color: '#EA8953' }}>Caption</span>
                      <span style={{ color: '#007B40' }}>Croc</span>
                    </h1>
                    {userPlan === 'pro' && <Crown className="text-yellow-500" size={24} />}
                  </div>
                  
                  {user && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800">
                          {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                        </div>
                        <button 
                          onClick={handleLogout}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
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
                        {userPlan === 'pro' ? '∞' : `${dailyUsage}/${currentLimits.dailyLimit}`}
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
                          width: `${(dailyUsage / currentLimits.dailyLimit) * 100}%`,
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
                        {userPlan === 'pro' ? favouriteCount : `${favouriteCount}/${currentLimits.maxFavourites}`}
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
                </button>
              </div>
            </div>

            <div className="p-8">
              {activeTab === 'generator' && (
                <div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-teal-600 mt-0.5" size={20} />
                      <div>
                        <h3 className="font-medium text-teal-800 mb-1">Supabase Connected! 🎉</h3>
                        <p className="text-sm text-teal-700">
                          Fixed React error #460 and lock issues. Your captions are safely stored!
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
                          onChange={(e) => setTone(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                          style={{ '--tw-ring-color': '#007B40' }}
                        >
                          {tones.map(t => (
                            <option key={t.value} value={t.value}>
                              {t.label} {t.premium && userPlan !== 'pro' ? '🔒 Pro' : ''}
                            </option>
                          ))}
                        </select>
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
                        placeholder="Your AI-generated caption will appear here..."
                        className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                      />
                      
                      {generatedCaption && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(generatedCaption)}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            <Copy size={16} className="text-gray-600" />
                            Copy
                          </button>
                          <button
                            onClick={saveCaption}
                            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                          >
                            <Save size={16} className="text-gray-600" />
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
                      <p className="text-gray-600 text-lg">No captions saved yet</p>
                      <p className="text-gray-500">Generate and save captions to see them here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-gray-800">Saved Captions</h2>
                      <div className="grid gap-4">
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
                              <button
                                onClick={() => copyToClipboard(caption.caption)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-2">{caption.topic}</h3>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{caption.caption}</p>
                          </div>
                        ))}
                      </div>
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
