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
