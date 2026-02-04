'use client'

import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Instagram, Twitter, Facebook, Linkedin, AlertCircle, Save, Download, Trash2, ExternalLink, Calendar, BarChart3, Star, Heart, Crown, Lock, Zap, ShoppingBag, Grid } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  // Basic state
  const [platform, setPlatform] = useState('Instagram');
  const [category, setCategory] = useState('promote');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizedCaption, setCustomizedCaption] = useState('');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [savedCaptions, setSavedCaptions] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  // Subscription State
  const [userPlan, setUserPlan] = useState('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Features State
  const [exportWebhook, setExportWebhook] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  // Auth State
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authLoading, setAuthLoading] = useState(false);

  // Subscription Configuration
  const subscriptionLimits = {
    free: {
      categories: ['promote', 'engage', 'educate'],
      platforms: ['Instagram', 'Facebook', 'TikTok'],
      maxFavourites: 10,
      features: ['3 Categories', 'Basic Templates', '3 Platforms']
    },
    pro: {
      categories: ['promote', 'engage', 'educate', 'sell', 'quiet'],
      platforms: ['Instagram', 'Facebook', 'TikTok', 'Twitter/X', 'LinkedIn', 'Etsy'],
      maxFavourites: Infinity,
      features: ['All Categories', 'All Templates', 'All Platforms', 'Template Variations', 'Priority Support']
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

  const categories = [
    { 
      id: 'promote', 
      label: 'Promote', 
      icon: '📣', 
      description: 'Launch posts, product highlights, announcements',
      free: true 
    },
    { 
      id: 'engage', 
      label: 'Engage', 
      icon: '💬', 
      description: 'Questions, polls, conversation starters',
      free: true 
    },
    { 
      id: 'educate', 
      label: 'Educate', 
      icon: '📚', 
      description: 'Tips, how-tos, industry insights',
      free: true 
    },
    { 
      id: 'sell', 
      label: 'Sell', 
      icon: '💰', 
      description: 'Offers, CTAs, urgency posts',
      free: false 
    },
    { 
      id: 'quiet', 
      label: 'Quiet Days', 
      icon: '😌', 
      description: 'Behind-the-scenes, casual updates',
      free: false 
    }
  ];

  // Caption Template Library
  const captionTemplates = {
    promote: {
      Instagram: [
        {
          id: 1,
          template: "🎉 Introducing [YOUR PRODUCT]! \n\nAfter months of work, we're finally ready to share [WHAT IT DOES]. \n\nPerfect for anyone who wants to [BENEFIT].\n\n✨ Available now → [WHERE TO GET IT]",
          blanks: ['YOUR PRODUCT', 'WHAT IT DOES', 'BENEFIT', 'WHERE TO GET IT'],
          style: 'Launch Announcement'
        },
        {
          id: 2,
          template: "New week, new [PRODUCT/SERVICE] 💫\n\n[BRIEF DESCRIPTION IN ONE SENTENCE]\n\nWhy you'll love it:\n→ [BENEFIT 1]\n→ [BENEFIT 2]\n→ [BENEFIT 3]\n\nReady to try it? Link in bio!",
          blanks: ['PRODUCT/SERVICE', 'BRIEF DESCRIPTION', 'BENEFIT 1', 'BENEFIT 2', 'BENEFIT 3'],
          style: 'Feature Highlight'
        },
        {
          id: 3,
          template: "Big news! 🎊\n\nWe just launched [PRODUCT] and it's already [ACHIEVEMENT].\n\n[WHY IT MATTERS TO YOUR AUDIENCE]\n\nGrab yours before [URGENCY REASON]!",
          blanks: ['PRODUCT', 'ACHIEVEMENT', 'WHY IT MATTERS', 'URGENCY REASON'],
          style: 'Product Drop'
        }
      ],
      Facebook: [
        {
          id: 4,
          template: "Exciting news! We've just released [PRODUCT/SERVICE] and we couldn't be more proud.\n\n[WHAT IT DOES] in a way that [UNIQUE BENEFIT].\n\nCheck it out: [LINK]",
          blanks: ['PRODUCT/SERVICE', 'WHAT IT DOES', 'UNIQUE BENEFIT', 'LINK'],
          style: 'Professional Launch'
        },
        {
          id: 5,
          template: "🌟 New addition to our lineup!\n\nIntroducing [PRODUCT NAME] - designed specifically for [TARGET AUDIENCE].\n\n[KEY FEATURE OR BENEFIT]\n\nLearn more → [LINK]",
          blanks: ['PRODUCT NAME', 'TARGET AUDIENCE', 'KEY FEATURE', 'LINK'],
          style: 'Product Intro'
        }
      ],
      TikTok: [
        {
          id: 6,
          template: "POV: You just discovered [PRODUCT] 😍\n\n[ONE SENTENCE HOOK]\n\n#[YourBrand] #[ProductName] #NewRelease",
          blanks: ['PRODUCT', 'HOOK'],
          style: 'Quick Tease'
        }
      ]
    },
    engage: {
      Instagram: [
        {
          id: 10,
          template: "Quick question for you all 🤔\n\n[YOUR QUESTION]?\n\nA) [OPTION A]\nB) [OPTION B]\nC) [OPTION C]\n\nDrop your answer below! 👇",
          blanks: ['YOUR QUESTION', 'OPTION A', 'OPTION B', 'OPTION C'],
          style: 'Poll Question'
        },
        {
          id: 11,
          template: "Let's talk about [TOPIC] 💬\n\nWhat's your honest take on [SPECIFIC QUESTION]?\n\nNo wrong answers - I'm genuinely curious!",
          blanks: ['TOPIC', 'SPECIFIC QUESTION'],
          style: 'Open Discussion'
        },
        {
          id: 12,
          template: "Fill in the blank:\n\nThe best thing about [YOUR INDUSTRY/TOPIC] is __________.\n\nI'll go first: [YOUR ANSWER]\n\nYour turn! 👇",
          blanks: ['YOUR INDUSTRY/TOPIC', 'YOUR ANSWER'],
          style: 'Fill in the Blank'
        }
      ],
      Facebook: [
        {
          id: 13,
          template: "We're curious! 🤔\n\nHow do you currently [RELEVANT ACTIVITY]?\n\nWe'd love to hear your approach - every response helps us serve you better!",
          blanks: ['RELEVANT ACTIVITY'],
          style: 'Community Question'
        }
      ],
      TikTok: [
        {
          id: 14,
          template: "Comment [EMOJI] if you agree:\n\n[RELATABLE STATEMENT]\n\n#relatable #[YourNiche]",
          blanks: ['EMOJI', 'RELATABLE STATEMENT', 'YourNiche'],
          style: 'Comment Bait'
        }
      ]
    },
    educate: {
      Instagram: [
        {
          id: 20,
          template: "Quick tip: [TOPIC] 💡\n\n[TIP IN ONE SENTENCE]\n\nWhy it works:\n[BRIEF EXPLANATION]\n\nTry it out and let me know how it goes!",
          blanks: ['TOPIC', 'TIP', 'EXPLANATION'],
          style: 'Quick Tip'
        },
        {
          id: 21,
          template: "3 things I wish I knew about [TOPIC]:\n\n1️⃣ [LESSON 1]\n2️⃣ [LESSON 2]\n3️⃣ [LESSON 3]\n\nSave this for later! →",
          blanks: ['TOPIC', 'LESSON 1', 'LESSON 2', 'LESSON 3'],
          style: 'Lesson List'
        },
        {
          id: 22,
          template: "Here's something most people get wrong about [TOPIC]:\n\n[COMMON MISTAKE]\n\nHere's what to do instead:\n[CORRECT APPROACH]\n\nMakes sense? 💭",
          blanks: ['TOPIC', 'COMMON MISTAKE', 'CORRECT APPROACH'],
          style: 'Myth Buster'
        }
      ],
      Facebook: [
        {
          id: 23,
          template: "Did you know? 🧠\n\n[INTERESTING FACT ABOUT YOUR INDUSTRY]\n\nThis is why [HOW IT AFFECTS YOUR AUDIENCE].\n\nWant to learn more? [LINK OR CTA]",
          blanks: ['INTERESTING FACT', 'HOW IT AFFECTS AUDIENCE', 'LINK'],
          style: 'Industry Insight'
        }
      ],
      TikTok: [
        {
          id: 24,
          template: "The [TOPIC] hack no one talks about:\n\n[YOUR HACK IN ONE SENTENCE]\n\nYou're welcome 😏\n\n#[YourNiche]Tips #LifeHack",
          blanks: ['TOPIC', 'HACK', 'YourNiche'],
          style: 'Quick Hack'
        }
      ]
    },
    sell: {
      Instagram: [
        {
          id: 30,
          template: "🔥 Flash Sale Alert!\n\nGet [DISCOUNT AMOUNT]% off [PRODUCT] for the next [TIME PERIOD].\n\nWhy grab it now?\n→ [REASON 1]\n→ [REASON 2]\n\nShop now: [LINK]",
          blanks: ['DISCOUNT AMOUNT', 'PRODUCT', 'TIME PERIOD', 'REASON 1', 'REASON 2', 'LINK'],
          style: 'Flash Sale'
        },
        {
          id: 31,
          template: "Still thinking about [PRODUCT]? 🤔\n\nHere's why our customers love it:\n\n💚 [BENEFIT 1]\n💚 [BENEFIT 2]\n💚 [BENEFIT 3]\n\nReady to try it? Link in bio!",
          blanks: ['PRODUCT', 'BENEFIT 1', 'BENEFIT 2', 'BENEFIT 3'],
          style: 'Social Proof'
        }
      ],
      Facebook: [
        {
          id: 32,
          template: "Limited time offer! ⏰\n\n[OFFER DESCRIPTION]\n\nThis deal ends [DATE/TIME].\n\nClaim yours here → [LINK]",
          blanks: ['OFFER DESCRIPTION', 'DATE/TIME', 'LINK'],
          style: 'Urgency Post'
        }
      ],
      TikTok: [
        {
          id: 33,
          template: "POV: You finally tried [PRODUCT] 🤩\n\nGet yours now → [LINK]\n\n#[ProductName] #Deal #ShopNow",
          blanks: ['PRODUCT', 'LINK', 'ProductName'],
          style: 'POV Sale'
        }
      ]
    },
    quiet: {
      Instagram: [
        {
          id: 40,
          template: "Behind the scenes today ☕\n\n[WHAT YOU'RE WORKING ON]\n\n[CASUAL OBSERVATION OR THOUGHT]\n\nWhat are you up to? 💬",
          blanks: ['WHAT YOU\'RE WORKING ON', 'CASUAL OBSERVATION'],
          style: 'Behind the Scenes'
        },
        {
          id: 41,
          template: "Random thought: [YOUR THOUGHT] 💭\n\n[WHY YOU THOUGHT OF IT]\n\nAnyone else feel this way?",
          blanks: ['YOUR THOUGHT', 'WHY YOU THOUGHT OF IT'],
          style: 'Personal Share'
        }
      ],
      Facebook: [
        {
          id: 42,
          template: "Just a little update from us 🌟\n\n[WHAT'S HAPPENING IN YOUR BUSINESS]\n\n[HOW IT MAKES YOU FEEL OR WHAT IT MEANS]\n\nThanks for being here!",
          blanks: ['WHAT\'S HAPPENING', 'HOW IT MAKES YOU FEEL'],
          style: 'Casual Update'
        }
      ],
      TikTok: [
        {
          id: 43,
          template: "Day in the life of [YOUR ROLE] 📸\n\n[QUICK SNAPSHOT OF YOUR DAY]\n\n#DayInTheLife #[YourNiche]",
          blanks: ['YOUR ROLE', 'SNAPSHOT', 'YourNiche'],
          style: 'DITL'
        }
      ]
    }
  };

  const currentPlatform = platforms.find(p => p.name === platform);
  const currentLimits = subscriptionLimits[userPlan] || subscriptionLimits.free;
  const favouriteCount = savedCaptions.filter(c => c.is_favourite).length;

  const canUseCategory = (categoryId) => {
    if (userPlan === 'pro') return true;
    return currentLimits.categories.includes(categoryId);
  };

  const canUsePlatform = (platformName) => {
    if (userPlan === 'pro') return true;
    return currentLimits.platforms.includes(platformName);
  };

  const canAddFavourite = () => {
    if (userPlan === 'pro') return true;
    return favouriteCount < currentLimits.maxFavourites;
  };

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

  const handleAuth = async (email, password, mode) => {
    setAuthLoading(true);
     console.log('🔐 handleAuth called with:', { email, password: password ? '***' : 'EMPTY', mode });
    let result;
    if (mode === 'signup') {
      console.log('📝 Calling signUp...');
      result = await supabase.auth.signUp({ email, password });
    } else {
      console.log('🔑 Calling signInWithPassword...');
      result = await supabase.auth.signInWithPassword({ email, password });
    }
    console.log('📨 Auth result:', result);
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

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    
    let caption = template.template;
    
    if (includeHashtags) {
      const hashtags = `\n\n#${category} #socialmedia #content`;
      caption += hashtags;
    }
    
    setCustomizedCaption(caption);
  };

  const saveCaption = async () => {
    if (!user || !customizedCaption) return;

    const { data, error } = await supabase
      .from('captions')
      .insert([{
        user_id: user.id,
        platform,
        topic: category,
        tone: selectedTemplate?.style || 'template',
        caption: customizedCaption,
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
    
    if (!caption.is_favourite && !canAddFavourite()) {
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

  const deleteCaption = async (id) => {
    if (!confirm('Are you sure you want to delete this caption?')) return;
    
    const { error } = await supabase
      .from('captions')
      .delete()
      .eq('id', id);

    if (!error) {
      setSavedCaptions(prev => prev.filter(c => c.id !== id));
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

  const exportToScheduler = async (caption) => {
    if (!exportWebhook) {
      alert('Please configure your webhook URL in the Export Settings tab');
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = {
        platform: caption.platform,
        content: caption.caption,
        topic: caption.topic,
        tone: caption.tone,
        created_at: caption.created_at,
        char_count: caption.caption.length
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
      ['Date', 'Platform', 'Category', 'Style', 'Caption', 'Character Count', 'Favourite'].join(','),
      ...savedCaptions.map(caption => [
        new Date(caption.created_at).toLocaleDateString(),
        caption.platform,
        caption.topic,
        caption.tone,
        `"${caption.caption.replace(/"/g, '""')}"`,
        caption.caption.length,
        caption.is_favourite ? 'Yes' : 'No'
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
          </div>
        </div>
      </div>
    );
  };

  const UpgradeModal = () => (
    showUpgradeModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Unlock All Templates</h2>
              <p className="text-gray-600">Get access to every category, platform, and template style</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className={`border-2 rounded-lg p-6 ${userPlan === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Free Plan</h3>
                  <div className="text-3xl font-bold text-green-600 mt-2">$0<span className="text-lg text-gray-500">/month</span></div>
                  {userPlan === 'free' && <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 3 categories</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Basic templates</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 3 platforms</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Save 10 favorites</li>
                </ul>
              </div>

              <div className="border-2 border-teal-500 rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm">Recommended</span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Pro Croc</h3>
                  <div className="text-3xl font-bold text-teal-600 mt-2">$9<span className="text-lg text-gray-500">/month</span></div>
                  <p className="text-sm text-gray-500 mt-1">Cancel anytime</p>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All 5 categories</strong></li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All templates</strong></li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All 6 platforms</strong></li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Unlimited favorites</strong></li>
                  <li className="flex items-center gap-2"><Heart size={16} className="text-orange-500" /> <strong>Priority support</strong></li>
                </ul>
                <button 
                  onClick={() => {setUserPlan('pro'); setShowUpgradeModal(false);}}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Upgrade to Pro - $9/month
                </button>
              </div>
            </div>

            <div className="text-center mt-6">
              <button onClick={() => setShowUpgradeModal(false)} className="text-gray-500 text-sm">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

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

  if (showLandingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
        <div className="relative overflow-hidden">
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
                Never wonder<br />
                <span style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>what to post again</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Curated caption templates organized by goal. Pick → Customize → Post. No AI. No thinking. Just done.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button
                  onClick={() => {setAuthMode('signup'); setShowAuthModal(true);}}
                  className="text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}
                >
                  Start For Free
                </button>
                <button
                  onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
                  className="border-2 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-10 transition-all"
                  style={{ borderColor: '#007B40', color: '#007B40' }}
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
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No AI needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">5 categories. Everything you need.</h3>
              <p className="text-xl text-gray-600">Simple templates for every posting goal</p>
            </div>
            
            <div className="grid md:grid-cols-5 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{cat.label}</h4>
                  <p className="text-sm text-gray-600">{cat.description}</p>
                  {!cat.free && (
                    <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Pro</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Post in 30 seconds</h3>
              <p className="text-xl text-gray-600">No creativity required</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-teal-600">1</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Pick Your Goal</h4>
                <p className="text-gray-600">Choose from Promote, Engage, Educate, Sell, or Quiet Days</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-orange-600">2</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Customize Template</h4>
                <p className="text-gray-600">Fill in the blanks with your details - takes 10 seconds</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{color: '#007B40'}}>3</div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">Copy & Post</h4>
                <p className="text-gray-600">Done. No overthinking. No blank screen anxiety.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple pricing</h3>
              <p className="text-xl text-gray-600">Start free, upgrade when ready</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6 text-center">
                <h4 className="text-lg font-bold text-gray-800 mb-2">Free</h4>
                <div className="text-3xl font-bold text-green-600 mb-4">$0<span className="text-lg text-gray-500">/month</span></div>
                <ul className="text-left space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2"><Zap size={14} className="text-green-500" /> 3 categories</li>
                  <li className="flex items-center gap-2"><Zap size={14} className="text-green-500" /> Basic templates</li>
                  <li className="flex items-center gap-2"><Zap size={14} className="text-green-500" /> 3 platforms</li>
                </ul>
                <button
                  onClick={() => {setAuthMode('signup'); setShowAuthModal(true);}}
                  className="w-full border-2 border-green-600 text-green-600 py-2 px-4 rounded-lg font-medium hover:bg-green-50 transition-colors"
                >
                  Start Free
                </button>
              </div>

              <div className="bg-white rounded-lg border-2 border-teal-500 p-6 text-center relative transform scale-105">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">Best Value</span>
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">Pro</h4>
                <div className="text-3xl font-bold text-teal-600 mb-4">$9<span className="text-lg text-gray-500">/month</span></div>
                <ul className="text-left space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2"><Zap size={14} className="text-green-500" /> <strong>All 5 categories</strong></li>
                  <li className="flex items-center gap-2"><Zap size={14} className="text-green-500" /> <strong>All templates</strong></li>
                  <li className="flex items-center gap-2"><Zap size={14} className="text-green-500" /> <strong>All 6 platforms</strong></li>
                </ul>
                <button
                  onClick={() => {setAuthMode('signup'); setShowAuthModal(true);}}
                  className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Get Pro
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="py-20" style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to stop staring at blank screens?</h3>
            <p className="text-xl mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Join creators who always know what to post</p>
            <button
              onClick={() => {setAuthMode('signup'); setShowAuthModal(true);}}
              className="bg-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg"
              style={{ color: '#007B40' }}
            >
              Get Started Free
            </button>
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
                  <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-700">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-lg">Never wonder what to post again</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className={`rounded-lg p-4 ${userPlan === 'pro' ? 'bg-gradient-to-r from-teal-50 to-orange-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {userPlan === 'pro' ? <Crown size={20} className="text-yellow-500" /> : <Grid size={20} className="text-teal-600" />}
                  <span className="font-medium text-gray-800">
                    {userPlan === 'pro' ? 'Pro Croc' : 'Free Plan'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {userPlan === 'pro' ? '5/5' : '3/5'}
                  </div>
                  <div className="text-sm text-gray-600">
                    categories
                  </div>
                </div>
              </div>
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
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${(favouriteCount / currentLimits.maxFavourites) * 100}%`,
                      background: 'linear-gradient(135deg, #EA8953, #007B40)'
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'generator' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Saved ({savedCaptions.length})
              {savedCaptions.filter(c => c.is_favourite).length > 0 && (
                <span className="ml-1 text-orange-500">★{savedCaptions.filter(c => c.is_favourite).length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'export' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'pricing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {userPlan === 'free' ? 'Upgrade' : 'Plan'}
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
                    <h3 className="font-medium text-teal-800 mb-1">🎯 Template-Based System</h3>
                    <p className="text-sm text-teal-700">
                      Pick your goal → Customize blanks → Copy & post. No AI needed!
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What's your goal?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => {
                        const isLocked = !canUseCategory(cat.id);
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              if (isLocked) {
                                setShowUpgradeModal(true);
                              } else {
                                setCategory(cat.id);
                                setSelectedTemplate(null);
                              }
                            }}
                            className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                              category === cat.id && !isLocked
                                ? 'bg-opacity-10 text-gray-800'
                                : isLocked
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={category === cat.id && !isLocked ? { borderColor: '#007B40', backgroundColor: '#007B4010' } : {}}
                          >
                            <div className="text-2xl mb-1">{cat.icon}</div>
                            <div className="font-medium text-sm">{cat.label}</div>
                            {isLocked && <Lock size={12} className="absolute top-2 right-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

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
                                setSelectedTemplate(null);
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose Template</label>
                    {captionTemplates[category]?.[platform]?.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {captionTemplates[category][platform].map((template) => (
                          <button
                            key={template.id}
                            onClick={() => selectTemplate(template)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                              selectedTemplate?.id === template.id
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-teal-600">{template.style}</span>
                              <span className="text-xs text-gray-500">{template.template.length} chars</span>
                            </div>
                            <div className="text-sm text-gray-600 line-clamp-3">
                              {template.template.substring(0, 100)}...
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No templates available for this combination yet
                      </div>
                    )}
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
                      Include hashtags
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Your Caption</h3>
                    {customizedCaption && (
                      <div className="flex items-center gap-2">
                        <currentPlatform.icon size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-600">
                          {customizedCaption.length}/{currentPlatform?.limit}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={customizedCaption}
                      onChange={(e) => setCustomizedCaption(e.target.value)}
                      placeholder="Select a template to get started..."
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    
                    {customizedCaption && (
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => copyToClipboard(customizedCaption)}
                          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Copy to clipboard"
                        >
                          <Copy size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={saveCaption}
                          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Save caption"
                        >
                          <Save size={16} className="text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {customizedCaption && customizedCaption.length > currentPlatform?.limit && (
                    <p className="text-amber-600 text-sm flex items-center gap-1">
                      ⚠️ Caption exceeds {platform} character limit
                    </p>
                  )}

                  {selectedTemplate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">💡 Fill in these blanks:</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        {selectedTemplate.blanks.map((blank, idx) => (
                          <div key={idx}>• {blank}</div>
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
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Saved Captions</h2>
                    <button
                      onClick={exportAllCaptions}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                    >
                      <Download size={16} />
                      Export All CSV
                    </button>
                  </div>
                  
                  <div className="grid gap-4">
                    {savedCaptions.map((caption) => (
                      <div key={caption.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{caption.platform}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{caption.topic}</span>
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
                            <button
                              onClick={() => deleteCaption(caption.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{caption.caption}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{caption.caption.length} characters</span>
                          <button
                            onClick={() => exportToScheduler(caption)}
                            disabled={isExporting}
                            className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                          >
                            <ExternalLink size={12} className="inline mr-1" />
                            Export
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Export Settings</h2>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                <h3 className="font-semibold text-teal-800 mb-3">Social Media Scheduler Integration</h3>
                <p className="text-sm text-teal-700 mb-4">
                  Connect to scheduling tools like Buffer, Hootsuite, or Later using webhook integrations.
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
                <p className="text-gray-600">Get access to all templates and platforms</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className={`border-2 rounded-lg p-6 ${userPlan === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Free Plan</h3>
                    <div className="text-3xl font-bold text-green-600 mt-2">$0<span className="text-lg text-gray-500">/month</span></div>
                    {userPlan === 'free' && <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 3 categories</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Basic templates</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 3 platforms</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Save 10 favorites</li>
                  </ul>
                </div>

                <div className={`border-2 rounded-lg p-6 relative ${userPlan === 'pro' ? 'border-teal-500 bg-teal-50' : 'border-teal-500'}`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm">Recommended</span>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Pro Croc</h3>
                    <div className="text-3xl font-bold text-teal-600 mt-2">$9<span className="text-lg text-gray-500">/month</span></div>
                    {userPlan === 'pro' && <span className="inline-block bg-teal-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All 5 categories</strong></li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All templates</strong></li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All 6 platforms</strong></li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Unlimited favorites</strong></li>
                    <li className="flex items-center gap-2"><Heart size={16} className="text-orange-500" /> <strong>Priority support</strong></li>
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
