'use client'

import React, { useState } from 'react';
import { Copy, Sparkles, Instagram, Twitter, Facebook, Linkedin, AlertCircle, Save, Download, Trash2, ExternalLink, Calendar, BarChart3, Star, Heart, Crown, Lock, Zap, ShoppingBag } from 'lucide-react';

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
  const [userPlan, setUserPlan] = useState('free'); // 'free', 'pro', 'credits'
  const [credits, setCredits] = useState(0); // For one-time credit pack
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authLoading, setAuthLoading] = useState(false);

  // Subscription Configuration
  const subscriptionLimits = {
    free: {
      dailyLimit: 10, // More generous free plan
      platforms: ['Instagram', 'Facebook', 'TikTok'],
      tones: ['casual', 'professional', 'humorous', 'inspirational', 'educational', 'conversational', 'formal', 'playful', 'motivational', 'friendly'],
      maxFavourites: 10, // More generous
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
  const favouriteCount = savedCaptions.filter(c => c.isFavourite).length;

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

  const resetToOriginal = () => {
    if (originalCaption) {
      setGeneratedCaption(originalCaption);
    }
  };

  const applyCaptionStyle = (styleType) => {
    if (!originalCaption) return;
    
    let styledCaption = originalCaption;
    
    switch (styleType) {
      case 'minimalist':
        styledCaption = originalCaption
          .replace(/[🎉🎊✨🔥💯⭐]/g, '')
          .replace(/\n\n+/g, '\n\n')
          .trim();
        break;
        
      case 'emoji-heavy':
        const sentences = originalCaption.split('.');
        styledCaption = sentences.map(sentence => {
          if (sentence.trim()) {
            const emojis = ['✨', '🎯', '💫', '🌟', '🔥', '💪', '🚀'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            return sentence.trim() + ' ' + randomEmoji;
          }
          return sentence;
        }).join('. ');
        break;
        
      case 'spaced-out':
        styledCaption = originalCaption
          .replace(/\. /g, '.\n\n')
          .replace(/! /g, '!\n\n')
          .replace(/\? /g, '?\n\n');
        break;
        
      case 'professional':
        styledCaption = originalCaption
          .replace(/[🎉🎊✨🔥💯]/g, '')
          .replace(/\n+/g, '\n\n')
          .replace(/!+/g, '.')
          .trim();
        break;
        
      case 'listicle':
        const points = originalCaption.split(/[.!]/).filter(p => p.trim().length > 10);
        if (points.length >= 2) {
          styledCaption = points.map((point, index) => 
            `${index + 1}. ${point.trim()}`
          ).join('\n\n') + '\n\n' + (originalCaption.includes('#') ? 
            originalCaption.substring(originalCaption.lastIndexOf('#')) : '');
        }
        break;
        
      case 'question-hook':
        const questions = [
          'Want to know the secret? 👀',
          'Ever wonder why this works? 🤔',
          'Ready for a game-changer? 🎯',
          'What if I told you... 💡'
        ];
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        styledCaption = randomQuestion + '\n\n' + originalCaption;
        break;
        
      case 'story-format':
        const parts = originalCaption.split(/[.!]/).filter(p => p.trim().length > 5);
        if (parts.length >= 3) {
          styledCaption = `📖 Here's what happened:\n\n` +
            `${parts[0].trim()}...\n\n` +
            `${parts.slice(1, -1).join('. ')}.\n\n` +
            `✨ The result? ${parts[parts.length - 1].trim()}.` +
            (originalCaption.includes('#') ? '\n\n' + originalCaption.substring(originalCaption.lastIndexOf('#')) : '');
        }
        break;
        
      case 'all-caps':
        styledCaption = originalCaption.replace(
          /\b(amazing|incredible|must|never|always|best|worst|secret|urgent|now|today)\b/gi,
          (match) => match.toUpperCase()
        );
        break;
        
      default:
        styledCaption = originalCaption;
    }
    
    setGeneratedCaption(styledCaption);
  };

  // Authentication Functions
  const handleEmailAuth = async (email, password, mode) => {
    setAuthLoading(true);
    
    try {
      // For demo purposes, create a mock user
      const mockUser = {
        id: Date.now(),
        email: email,
        name: email.split('@')[0],
        plan: 'free',
        avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=008080&color=fff`
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setUserPlan('free');
      setShowAuthModal(false);
      setShowLandingPage(false);
      
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed. Please try again.');
    }
    
    setAuthLoading(false);
  };

  const handleOAuthLogin = async (provider) => {
    setAuthLoading(true);
    
    try {
      const mockUser = {
        id: Date.now(),
        email: `user@${provider.toLowerCase()}.com`,
        name: `${provider} User`,
        plan: 'free',
        avatar: `https://ui-avatars.com/api/?name=${provider}+User&background=008080&color=fff`,
        provider: provider.toLowerCase()
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setUserPlan('free');
      setShowAuthModal(false);
      setShowLandingPage(false);
      
    } catch (error) {
      console.error('OAuth error:', error);
      alert('OAuth login failed. Please try again.');
    }
    
    setAuthLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUserPlan('free');
    setSavedCaptions([]);
    setDailyUsage(0);
    setCredits(0);
    setShowLandingPage(true);
  };

  const generateCaption = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic for your post');
      return;
    }

    if (!isAuthenticated) {
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
      // Generate 3 variations for better user experience
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
    } catch (err) {
      setError('Failed to generate caption. Please try again.');
    }
    
    // Deduct usage (no more credits system!)
    if (userPlan === 'free') {
      setDailyUsage(prev => prev + 1);
    }
    // Pro users get unlimited, no deduction needed
    
    setIsGenerating(false);
  };

  const humanizeText = (text) => {
    if (!humanizeCaption) return text;
    
    // Humanizing strategies
    const humanizers = {
      // Replace AI-common phrases with more natural ones
      'absolutely bonkers': Math.random() > 0.5 ? 'pretty wild' : 'seriously good',
      'totally hooked': Math.random() > 0.5 ? 'obsessed' : 'really into it',
      'pure gold': Math.random() > 0.5 ? 'amazing' : 'so good',
      'no cap': Math.random() > 0.5 ? 'for real' : 'seriously',
      'hits different': Math.random() > 0.5 ? 'just works' : 'feels right',
      
      // Add natural hesitations and personal touches
      'G\'day! Just had to share': Math.random() > 0.5 ? 'Hey! So I\'ve been thinking about' : 'Okay, real talk about',
      'Crikey! Been diving deep': Math.random() > 0.5 ? 'Been looking into' : 'So I\'ve been exploring',
      'Fair dinkum,': Math.random() > 0.5 ? 'Honestly,' : 'Not gonna lie,',
      
      // Make CTAs more conversational
      'What do you reckon?': Math.random() > 0.5 ? 'What\'s your take?' : 'Anyone else feel this way?',
      'Drop your thoughts below!': Math.random() > 0.5 ? 'Let me know what you think!' : 'Would love to hear from you!',
      'Let me know! 👇': Math.random() > 0.5 ? 'Tell me below!' : 'Comment if you agree!'
    };

    let humanizedText = text;

    // Apply humanizing replacements
    Object.keys(humanizers).forEach(phrase => {
      if (humanizedText.includes(phrase)) {
        humanizedText = humanizedText.replace(phrase, humanizers[phrase]);
      }
    });

    // Add natural imperfections (occasional typos that are then "corrected")
    if (Math.random() > 0.8) {
      const naturalPhrases = [
        'tbh', 'ngl', 'def', 'prob', 'rn'
      ];
      const expandedPhrases = [
        'to be honest', 'not gonna lie', 'definitely', 'probably', 'right now'
      ];
      
      const randomIndex = Math.floor(Math.random() * naturalPhrases.length);
      if (Math.random() > 0.5) {
        humanizedText = humanizedText.replace(expandedPhrases[randomIndex], naturalPhrases[randomIndex]);
      }
    }

    // Add more conversational connectors
    humanizedText = humanizedText.replace(/\. This/g, '. So this');
    humanizedText = humanizedText.replace(/^This/, 'So this');
    
    // Remove some exclamation marks to be less "enthusiastic AI"
    if (Math.random() > 0.6) {
      humanizedText = humanizedText.replace(/!([^!])/g, '.$1');
    }

    return humanizedText;
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
    
    let finalCaption = baseCaption + cta + hashtags;
    
    // Apply humanization if enabled
    finalCaption = humanizeText(finalCaption);
    
    return finalCaption;
  };

  const saveCaption = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!generatedCaption) {
      alert('No caption to save');
      return;
    }

    const newCaption = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      platform,
      topic,
      tone,
      caption: generatedCaption,
      charCount: generatedCaption.length,
      isFavourite: false
    };

    setSavedCaptions(prev => [newCaption, ...prev]);
    alert('Caption saved successfully!');
  };

  const toggleFavourite = (id) => {
    const caption = savedCaptions.find(c => c.id === id);
    
    if (!caption.isFavourite && !canAddFavourite()) {
      setShowUpgradeModal(true);
      return;
    }

    setSavedCaptions(prev => 
      prev.map(caption => 
        caption.id === id 
          ? { ...caption, isFavourite: !caption.isFavourite }
          : caption
      )
    );
  };

  const deleteCaption = (id) => {
    setSavedCaptions(prev => prev.filter(caption => caption.id !== id));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Caption copied to clipboard!');
    } catch (err) {
      alert('Failed to copy caption');
    }
  };

  const exportToScheduler = async (caption) => {
    if (!exportWebhook) {
      alert('Please configure your webhook URL in the Export tab');
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = {
        platform: caption.platform,
        content: caption.caption,
        topic: caption.topic,
        tone: caption.tone,
        created_at: `${caption.date} ${caption.time}`,
        char_count: caption.charCount
      };

      const response = await fetch(exportWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        alert('Caption exported to scheduler successfully!');
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      alert('Failed to export caption. Please check your webhook URL.');
    }

    setIsExporting(false);
  };

  const exportAllCaptions = () => {
    const csvContent = [
      ['Date', 'Platform', 'Topic', 'Tone', 'Caption', 'Character Count', 'Favourite'].join(','),
      ...savedCaptions.map(caption => [
        caption.date,
        caption.platform,
        caption.topic,
        caption.tone,
        `"${caption.caption.replace(/"/g, '""')}"`,
        caption.charCount,
        caption.isFavourite ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social_media_captions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🐊</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {authMode === 'login' ? 'Welcome back' : 'Join CaptionCroc'}
                </h2>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="your@email.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-700 hover:to-orange-600 disabled:opacity-50 transition-all"
              >
                {authLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'
                }
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

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center">
            {/* Logo & Brand */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">🐊</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">CaptionCroc</h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Snappy captions<br />
              <span className="bg-gradient-to-r from-teal-600 to-orange-500 bg-clip-text text-transparent">that bite!</span>
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
                className="bg-gradient-to-r from-teal-600 to-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-teal-700 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Creating Captions Free
              </button>
              <button
                onClick={() => {
                  setAuthMode('login'); 
                  setShowAuthModal(true);
                }}
                className="border-2 border-teal-600 text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-teal-50 transition-all"
              >
                Sign In
              </button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>3 captions daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to create amazing captions</h3>
            <p className="text-xl text-gray-600">Powerful AI tools designed for social media success</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-teal-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Snap Generator</h4>
              <p className="text-gray-600">Create bite-sized captions that pack a punch with advanced AI that gets your Aussie vibe</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="text-orange-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Snap Styling Magic</h4>
              <p className="text-gray-600">Transform any caption into 8 different styles - from Instagram snappy to LinkedIn professional</p>
              <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium mt-2">Pro Feature</span>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-orange-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="text-teal-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Save Favorites</h4>
              <p className="text-gray-600">Organize your best captions and build a library of high-performing content for easy reuse</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-teal-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="text-orange-600" size={32} />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Export & Schedule</h4>
              <p className="text-gray-600">Connect to Buffer, Hootsuite, and other schedulers for seamless content planning workflow</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Support */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Works with all your favorite platforms</h3>
            <p className="text-xl text-gray-600">Optimized captions for every social media platform</p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center">
            <div className="flex flex-col items-center gap-2">
              <Instagram className="text-pink-500" size={40} />
              <span className="text-sm font-medium text-gray-700">Instagram</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Facebook className="text-blue-600" size={40} />
              <span className="text-sm font-medium text-gray-700">Facebook</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Twitter className="text-blue-400" size={40} />
              <span className="text-sm font-medium text-gray-700">Twitter/X</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Linkedin className="text-blue-700" size={40} />
              <span className="text-sm font-medium text-gray-700">LinkedIn</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="text-purple-500" size={40} />
              <span className="text-sm font-medium text-gray-700">TikTok</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShoppingBag className="text-orange-500" size={40} />
              <span className="text-sm font-medium text-gray-700">Etsy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-teal-600 to-orange-500 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to create snappy captions?</h3>
          <p className="text-xl text-teal-100 mb-8">Join thousands of creators who never run out of bite-sized content ideas</p>
          <button
            onClick={() => {
              setAuthMode('signup'); 
              setShowAuthModal(true);
            }}
            className="bg-white text-teal-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg"
          >
            Start Creating Free Captions
          </button>
        </div>
      </div>
    </div>
  );

  const UpgradeModal = () => (
    showUpgradeModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🐊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Upgrade?</h2>
              <p className="text-gray-600">Unlock unlimited snappy captions and styling magic!</p>
            </div>

            {/* Pro Plan Only */}
            <div className="border-2 border-teal-500 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Pro Croc</h3>
                <div className="text-3xl font-bold text-teal-600 mt-2">$9<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-sm text-gray-500 mt-1">Cancel anytime • 24hr support</p>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Unlimited captions</strong> (vs 10/day free)</li>
                <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>8 styling options</strong> (Instagram, LinkedIn, viral formats)</li>
                <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All 6 platforms</strong> + character guides</li>
                <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Premium tones</strong> (Edgy, Witty, Viral-optimised)</li>
                <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Unlimited favourites</strong> + instant tweaking</li>
                <li className="flex items-center gap-2"><Heart size={16} className="text-orange-500" /> <strong>24hr human support</strong> (not a bot!)</li>
              </ul>
              <button 
                onClick={() => {setUserPlan('pro'); setShowUpgradeModal(false);}}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Upgrade to Pro Croc - $9/month
              </button>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Maybe later - continue with free plan
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <>
      {showLandingPage ? (
        <LandingPage />
      ) : !isAuthenticated ? (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🐊</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">CaptionCroc</h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">Please sign in to continue</p>
            <button
              onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
              className="bg-gradient-to-r from-teal-600 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-orange-600 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-teal-50 to-orange-50 min-h-screen">
          {/* Main App Content */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-8 border-b border-gray-200">
              <div className="text-center mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setShowLandingPage(true)}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
                  >
                    ← Back to Home
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">🐊</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">CaptionCroc</h1>
                    {userPlan === 'pro' && <Crown className="text-yellow-500" size={24} />}
                  </div>
                  
                  {/* User Menu */}
                  {isAuthenticated && user ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => window.open('mailto:support@captioncroc.com', '_blank')}
                        className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600 transition-colors flex items-center gap-1"
                        title="Need help? We reply within 24 hours!"
                      >
                        <Heart size={12} />
                        Help
                      </button>
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800">{user.name}</div>
                        <button 
                          onClick={handleLogout}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-lg">Snappy captions that bite!</p>
              </div>

              {/* Plan Status & Usage */}
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
                        className="bg-gradient-to-r from-teal-500 to-orange-400 h-2 rounded-full transition-all"
                        style={{ width: `${(dailyUsage / currentLimits.dailyLimit) * 100}%` }}
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
                  {userPlan !== 'pro' && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full transition-all"
                        style={{ width: `${(favouriteCount / currentLimits.maxFavourites) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
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
                  {savedCaptions.filter(c => c.isFavourite).length > 0 && (
                    <span className="ml-1 text-orange-500">★{savedCaptions.filter(c => c.isFavourite).length}</span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'export' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Export Settings
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

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'generator' && (
                <div>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-teal-600 mt-0.5" size={20} />
                      <div>
                        <h3 className="font-medium text-teal-800 mb-1">Demo Mode</h3>
                        <p className="text-sm text-teal-700">
                          This is a demo version. In production, connect to your AI backend for real snappy caption generation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Input Form */}
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
                                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                                    : isLocked
                                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
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
                          <br />
                          <span className="text-teal-600 font-medium">
                            💡 {platform === 'Instagram' && 'Tip: Keep captions under 125 chars for better engagement'}
                            {platform === 'TikTok' && 'Tip: Short & snappy works best - under 100 chars'}
                            {platform === 'Facebook' && 'Tip: 40-80 characters get the most engagement'}
                            {platform === 'Twitter/X' && 'Tip: Leave room for retweets - aim for 240 chars'}
                            {platform === 'LinkedIn' && 'Tip: First 140 characters are crucial - hook them early'}
                            {platform === 'Etsy' && 'Tip: Include keywords but keep it conversational'}
                          </span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Topic *</label>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g., sustainable fashion, productivity tips, weekend vibes"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          {tones.map(t => (
                            <option 
                              key={t.value} 
                              value={t.value}
                              disabled={!canUseTone(t.value)}
                            >
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action (Optional)</label>
                        <input
                          type="text"
                          value={callToAction}
                          onChange={(e) => setCallToAction(e.target.value)}
                          placeholder="e.g., Check out our website, Share your thoughts, Like if you agree"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="humanize"
                          checked={humanizeCaption}
                          onChange={(e) => setHumanizeCaption(e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <label htmlFor="humanize" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <Heart size={14} className="text-orange-500" />
                          Humanize captions (less AI-obvious)
                        </label>
                      </div>

                      {humanizeCaption && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart size={16} className="text-orange-500" />
                            <span className="text-sm font-medium text-orange-800">Humanize Mode Active</span>
                          </div>
                          <p className="text-xs text-orange-700">
                            Your captions will use more natural language, conversational phrases, and fewer "AI-obvious" expressions to sound more authentic.
                          </p>
                        </div>
                      )}

                      <button
                        onClick={generateCaption}
                        disabled={isGenerating || !topic.trim() || !canGenerateCaption()}
                        className="w-full bg-gradient-to-r from-teal-600 to-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:from-teal-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Generating with AI...
                          </>
                        ) : !canGenerateCaption() ? (
                          <>
                            <Lock size={16} />
                            {userPlan === 'free' ? 'Daily Limit Reached' : 'No Credits Left'}
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
                            {!isAuthenticated 
                              ? 'Sign in to start generating snappy captions!'
                              : `You've used ${dailyUsage}/${currentLimits.dailyLimit} captions today. Upgrade to Pro Croc for unlimited access!`
                            }
                          </p>
                          <button 
                            onClick={() => !isAuthenticated ? setShowAuthModal(true) : setShowUpgradeModal(true)}
                            className="mt-2 text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors"
                          >
                            {!isAuthenticated ? 'Sign In' : 'Upgrade to Pro Croc'}
                          </button>
                        </div>
                      )}

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}
                    </div>

                    {/* Generated Caption */}
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
                      
                      <div>
                        <textarea
                          value={generatedCaption}
                          readOnly
                          placeholder="Your AI-generated caption will appear here..."
                          className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-gray-50 resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                              onClick={generateCaption}
                              className="flex items-center gap-2 px-3 py-2 bg-white border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm"
                              title="Tweak this caption"
                            >
                              <Zap size={16} className="text-orange-600" />
                              Tweak
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
                      </div>

                      {generatedCaption && generatedCaption.length > currentPlatform?.limit && (
                        <p className="text-amber-600 text-sm flex items-center gap-1">
                          ⚠️ Caption exceeds {platform} character limit
                        </p>
                      )}

                      {generatedCaption && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2">AI-Generated Caption Preview</h4>
                          <div className="text-sm text-green-700 whitespace-pre-wrap">
                            {generatedCaption}
                          </div>
                        </div>
                      )}

                      {/* Caption Variations Selector */}
                      {showVariations && captionVariations.length > 0 && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap className="text-teal-600" size={16} />
                            <h4 className="font-medium text-gray-800">Choose Your Favorite (3 Variations)</h4>
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
                                  {variation.substring(0, 120)}...
                                </div>
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            💡 Pick the variation that best matches your vibe, then style it further below!
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
                              onClick={resetToOriginal}
                              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
                                className="mt-3 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                              >
                                Upgrade to Pro - $9.99/month
                              </button>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            {['minimalist', 'emoji-heavy', 'spaced-out', 'professional', 'listicle', 'question-hook', 'story-format', 'all-caps'].map((style) => (
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
                                  {style === 'spaced-out' && 'Instagram style'}
                                  {style === 'professional' && 'LinkedIn ready'}
                                  {style === 'listicle' && 'Numbered points'}
                                  {style === 'question-hook' && 'Engaging opener'}
                                  {style === 'story-format' && 'Narrative arc'}
                                  {style === 'all-caps' && 'KEY words caps'}
                                </div>
                              </button>
                            ))}
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">💡 Pro Tip:</div>
                            <div className="text-xs text-gray-500">
                              {userPlan === 'pro' 
                                ? 'Try different styles to see what works best for your audience. Each platform has different preferences!'
                                : 'Pro users can transform any caption into 8 different styles optimized for different platforms!'
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'saved' && (
                <div>
                  <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No captions saved yet</p>
                    <p className="text-gray-500">Generate and save captions to see them here</p>
                  </div>
                </div>
              )}

              {activeTab === 'export' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Export Settings</h2>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                    <h3 className="font-semibold text-teal-800 mb-3">Social Media Scheduler Integration</h3>
                    <p className="text-sm text-teal-700 mb-4">
                      Connect your caption generator to scheduling tools like Buffer, Hootsuite, or Later using webhook integrations via Make.com or Zapier.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <input
                          type="url"
                          value={exportWebhook}
                          onChange={(e) => setExportWebhook(e.target.value)}
                          placeholder="https://hooks.zapier.com/hooks/catch/..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
                    <p className="text-gray-600">Unlock more features and remove limits</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Free Plan */}
                    <div className={`border-2 rounded-lg p-6 ${userPlan === 'free' ? 'border-teal-500 bg-teal-50' : 'border-gray-200'}`}>
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Free Plan</h3>
                        <div className="text-3xl font-bold text-green-600 mt-2">$0<span className="text-lg text-gray-500">/month</span></div>
                        {userPlan === 'free' && <span className="inline-block bg-teal-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                      </div>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 3 captions per day</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 3 platforms (Instagram, Facebook, TikTok)</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Standard tones</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Save up to 5 favourites</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Recent captions list</li>
                      </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className={`border-2 rounded-lg p-6 relative ${userPlan === 'pro' ? 'border-teal-500 bg-teal-50' : 'border-teal-500'}`}>
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm">Popular</span>
                      </div>
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Pro Plan</h3>
                        <div className="text-3xl font-bold text-teal-600 mt-2">$9.99<span className="text-lg text-gray-500">/month</span></div>
                        {userPlan === 'pro' && <span className="inline-block bg-teal-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                      </div>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Unlimited caption generation</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 8 caption styling options</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> All 6 platforms (including LinkedIn, Etsy)</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Premium tones (Edgy, Witty, Viral)</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Unlimited favorites</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Priority support</li>
                      </ul>
                      {userPlan !== 'pro' && (
                        <button 
                          onClick={() => setUserPlan('pro')}
                          className="w-full mt-6 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          Upgrade to Pro
                        </button>
                      )}
                    </div>

                    {/* Credit Pack */}
                    <div className={`border-2 rounded-lg p-6 ${userPlan === 'credits' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Credit Pack</h3>
                        <div className="text-3xl font-bold text-orange-600 mt-2">$4.99<span className="text-lg text-gray-500"> one-time</span></div>
                        {userPlan === 'credits' && <span className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                      </div>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 10 caption credits</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> No subscription required</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Free platforms only</li>
                        <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Standard tones</li>
                        <li className="flex items-center gap-2"><Lock size={16} className="text-gray-400" /> Limited to 5 favorites</li>
                      </ul>
                      <button 
                        onClick={() => {setUserPlan('credits'); setCredits(prev => prev + 10);}}
                        className="w-full mt-6 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        {userPlan === 'credits' ? 'Buy More Credits' : 'Buy Credits'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <UpgradeModal />
      <AuthModal />
    </>
  );
};

export default function Home() {
  return <SocialMediaCaptionGenerator />
}
