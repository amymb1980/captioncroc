'use client'

import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Instagram, Twitter, Facebook, Linkedin, AlertCircle, Save, Download, Trash2, ExternalLink, Calendar, BarChart3, Star, Heart, Crown, Lock, Zap, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Home() {
  // Basic state
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [callToAction, setCallToAction] = useState('');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [humanizeCaption, setHumanizeCaption] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [captionVariations, setCaptionVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [originalCaption, setOriginalCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedCaptions, setSavedCaptions] = useState([]);
  const [activeTab, setActiveTab] = useState('generator');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showStylingPanel, setShowStylingPanel] = useState(false);
  const [showVariations, setShowVariations] = useState(false);
  
  // Subscription & Credits State
  const [userPlan, setUserPlan] = useState('free'); // 'free', 'pro', 'credits'
  const [aiCredits, setAiCredits] = useState(5); // AI credits remaining
  const [monthlyUsage, setMonthlyUsage] = useState(0); // AI captions used this month
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
    aiCredits: 5, // One-time AI credits for new users
    templateCaptions: 'unlimited', // Template-based fallbacks
    platforms: ['Instagram', 'Facebook', 'TikTok'],
    tones: ['casual', 'professional', 'humorous', 'inspirational', 'educational', 'conversational', 'formal', 'playful', 'motivational', 'friendly'],
    maxFavourites: 10,
    features: ['AI Taste Test', 'Template Captions', 'Character Guides']
  },
  pro: {
    aiCredits: 500, // 500 AI captions per month
    monthlyLimit: true, // Resets monthly
    platforms: ['Instagram', 'Facebook', 'TikTok', 'Twitter/X', 'LinkedIn', 'Etsy'],
    tones: ['casual', 'professional', 'humorous', 'inspirational', 'educational', 'conversational', 'formal', 'playful', 'motivational', 'friendly', 'edgy', 'witty', 'viral-optimised'],
    maxFavourites: Infinity,
    features: ['500 AI captions/month', 'Caption Styling', 'All Platforms', 'Premium Tones', 'Instant Tweaking', '24hr Support']
  },
  credits: {
    aiCredits: 50, // 50 AI credits purchased
    platforms: ['Instagram', 'Facebook', 'TikTok'],
    tones: ['casual', 'professional', 'humorous', 'inspirational', 'educational', 'conversational', 'formal', 'playful', 'motivational', 'friendly'],
    maxFavourites: 10,
    features: ['No Subscription', 'AI Credits', 'Free Platforms Only']
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

  const canUsePlatform = (platformName) => {
    if (userPlan === 'pro') return true;
    return currentLimits.platforms.includes(platformName);
  };

  const canUseTone = (toneValue) => {
    if (userPlan === 'pro') return true;
    return currentLimits.tones.includes(toneValue);
  };

  const canGenerateCaption = () => {
  if (userPlan === 'pro') {
    return monthlyUsage < currentLimits.aiCredits; // Check monthly limit
  }
  if (userPlan === 'credits' && aiCredits > 0) return true;
  if (userPlan === 'free' && aiCredits > 0) return true;
  return false;
};
    
const canUseAI = () => {
  if (userPlan === 'pro') {
    return monthlyUsage < currentLimits.aiCredits; // Check monthly limit
  }
  if (userPlan === 'credits' && aiCredits > 0) return true;
  if (userPlan === 'free' && aiCredits > 0) return true;
  return false;
};

  

  const canAddFavourite = () => {
    if (userPlan === 'pro') return true;
    return favouriteCount < currentLimits.maxFavourites;
  };

  const humanizeText = (text) => {
    // Simple humanization - replace some patterns to make it less AI-obvious
    return text
      .replace(/\. This /g, '. This really ')
      .replace(/\. The /g, '. The amazing ')
      .replace(/I'm /g, "I'm genuinely ")
      .replace(/It's /g, "It's honestly ")
      .replace(/Amazing/g, 'Incredible')
      .replace(/Great/g, 'Fantastic');
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
        loadUserProfile(session.user.id);

        setTimeout(() => {
          loadCaptions(session.user.id);
          loadUserProfile(session.user.id);  // ADD THIS LINE
      }, 0);
        //setTimeout(() => loadCaptions(session.user.id), 0);
      } else {
        setUser(null);
        setShowLandingPage(true);
        setSavedCaptions([]);
        setUserPlan('free');
        setAiCredits(5);
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

  const loadUserProfile = async (userId) => {
  console.log('🔍 Loading profile for user:', userId);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('ai_credits, plan, monthly_usage, usage_reset_date')
    .eq('id', userId)
    .single();

  console.log('🔍 Profile data:', data, 'Error:', error);

  if (!error && data) {
    console.log('✅ Setting credits to:', data.ai_credits, 'plan to:', data.plan);
    setAiCredits(data.ai_credits);
    setUserPlan(data.plan);
    
    // Check if we need to reset monthly usage
    const resetDate = new Date(data.usage_reset_date);
    const now = new Date();
    const daysDiff = (now - resetDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff >= 30) {
      // Reset monthly usage if it's been 30+ days
      setMonthlyUsage(0);
      updateMonthlyUsage(0, true); // Reset in database
    } else {
      setMonthlyUsage(data.monthly_usage || 0);
    }
  } else {
    console.log('⚠️ Creating new profile...');
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert([{
        id: userId,
        ai_credits: 5,
        plan: 'free',
        monthly_usage: 0,
        usage_reset_date: new Date().toISOString()
      }]);
    
    if (!insertError) {
      setAiCredits(5);
      setUserPlan('free');
      setMonthlyUsage(0);
    }
  }
};

  const updateMonthlyUsage = async (newUsage, isReset = false) => {
  if (!user) return;
  
  const updateData = { monthly_usage: newUsage };
  if (isReset) {
    updateData.usage_reset_date = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', user.id);
    
  if (!error) {
    setMonthlyUsage(newUsage);
  }
};


  const updateUserCredits = async (newCredits) => {
    console.log('🔥 updateUserCredits called with:', newCredits);
    if (!user) return;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ ai_credits: newCredits })
      .eq('id', user.id);
      
    if (!error) {
      console.error('❌ Database update failed:', error);
      setAiCredits(newCredits);
    }
  };

  const updateUserPlan = async (newPlan) => {
    if (!user) return;
    
    let newCredits = aiCredits;
    if (newPlan === 'credits') {
      newCredits = aiCredits + 50;
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        plan: newPlan,
        ai_credits: newCredits
      })
      .eq('id', user.id);
      
    if (!error) {
      setUserPlan(newPlan);
      setAiCredits(newCredits);
    }
  };
  const selectVariation = (index) => {
    setSelectedVariation(index);
    setGeneratedCaption(captionVariations[index]);
    setOriginalCaption(captionVariations[index]);
  };

  const StylingPanel = () => {
  if (userPlan !== 'pro' || !generatedCaption) return null;

  const styles = [
    { id: 'minimalist', name: 'Minimalist', desc: 'Clean, emoji-free', icon: '🎯' },
    { id: 'emoji-heavy', name: 'Emoji Heavy', desc: 'Extra emojis', icon: '😍' },
    { id: 'professional', name: 'Professional', desc: 'Business tone', icon: '💼' },
    { id: 'listicle', name: 'Listicle', desc: 'Numbered points', icon: '📝' },
    { id: 'story', name: 'Storytelling', desc: 'Narrative style', icon: '📖' },
    { id: 'question', name: 'Question Hook', desc: 'Engaging questions', icon: '❓' },
    { id: 'urgent', name: 'Urgent', desc: 'Action-focused', icon: '🚨' },
    { id: 'casual', name: 'Casual', desc: 'Relaxed tone', icon: '😊' }
  ];

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-orange-50 border border-teal-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="text-yellow-500" size={16} />
        <h4 className="font-semibold text-gray-800">Pro Styling Options</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => applyCaptionStyle(style.id)}
            className="p-2 text-left border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-white transition-colors bg-white/50"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{style.icon}</span>
              <span className="font-medium text-sm text-gray-800">{style.name}</span>
            </div>
            <div className="text-xs text-gray-600">{style.desc}</div>
          </button>
        ))}
      </div>
      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
        💡 Tip: Apply styling after selecting your preferred variation
      </div>
    </div>
  );
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
    
    try {
      let variations = [];
      let isAIGenerated = false;

      // Check if we can use AI or should use templates
      if (canUseAI()) {
        try {
          // Try AI generation first
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
          console.log('API Response:', data);

          if (data.success && data.variations) {
            variations = data.variations;
            isAIGenerated = true;
            
            // Deduct AI credit
           /* if (userPlan === 'free' || userPlan === 'credits') {
              updateUserCredits(aiCredits - 1);
            }*/
          if (userPlan === 'free' || userPlan === 'credits') {
            updateUserCredits(aiCredits - 1);
          } else if (userPlan === 'pro') {
          // For Pro users, track monthly usage instead
            updateMonthlyUsage(monthlyUsage + 1);
          
            
          } else {
            throw new Error('AI generation failed');
          }
        } catch (error) {
          console.error('AI generation failed, using templates:', error);
          // Fall back to templates if AI fails
          variations = [
            generateTemplateCaption('variation1'),
            generateTemplateCaption('variation2'),
            generateTemplateCaption('variation3')
          ];
        }
      } else {
        // Use template-based captions (unlimited for free users)
        variations = [
          generateTemplateCaption('variation1'),
          generateTemplateCaption('variation2'),
          generateTemplateCaption('variation3')
        ];
      }
      
      setCaptionVariations(variations);
      setGeneratedCaption(variations[0]);
      setSelectedVariation(0);
      setShowVariations(true);
      setOriginalCaption(variations[0]);
      setShowStylingPanel(true);

      // Show appropriate message
      if (isAIGenerated) {
        if (userPlan === 'free' && aiCredits <= 1) {
          alert(`🤖 AI caption generated! You have ${aiCredits - 1} AI credits left. Upgrade for unlimited AI!`);
        }
      } else if (userPlan === 'free' && aiCredits === 0) {
        alert('🎨 Using template caption! Your AI credits are used up. Upgrade for unlimited AI captions!');
        setShowUpgradeModal(true);
      }
      
    } catch (error) {
      console.error('Caption generation error:', error);
      
      // Final fallback to simple templates
      const fallbackVariations = [
        generateTemplateCaption('variation1'),
        generateTemplateCaption('variation2'),
        generateTemplateCaption('variation3')
      ];
      
      setCaptionVariations(fallbackVariations);
      setGeneratedCaption(fallbackVariations[0]);
      setSelectedVariation(0);
      setShowVariations(true);
      setOriginalCaption(fallbackVariations[0]);
      setShowStylingPanel(true);
      
      alert('Using template captions - please check your connection');
    }
    
    setIsGenerating(false);
  };

  const generateTemplateCaption = (variation = 'default') => {
    const templates = {
      variation1: [
        `Just discovered something amazing about ${topic}! This ${tone} approach is absolutely brilliant. ✨`,
        `Can't stop thinking about ${topic}! This ${tone} perspective really resonates with me. 🔥`,
        `Had to share my thoughts on ${topic}! This ${tone} angle is exactly what we need. 💡`
      ],
      variation2: [
        `${topic} has been on my mind lately and I'm totally fascinated! The ${tone} approach is game-changing. 🚀`,
        `Been exploring ${topic} and I'm completely hooked! This ${tone} take is pure inspiration. ⭐`,
        `Deep dive into ${topic} today and wow! This ${tone} perspective is eye-opening. 🎯`
      ],
      variation3: [
        `Quick thoughts on ${topic}: this ${tone} approach is absolutely phenomenal. Amazing insights! 💫`,
        `${topic} update: loving this ${tone} direction! So much potential here. Exciting times! 🌟`,
        `Fresh take on ${topic} that's got me excited! This ${tone} strategy is brilliant. Can't wait to see more! 🎉`
      ]
    };
    
    const selectedTemplates = templates[variation] || templates.variation1;
    const randomTemplate = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
    
    const cta = callToAction || '\n\nWhat do you think? Share your thoughts below! 👇';
    const hashtags = includeHashtags ? `\n\n#${topic.toLowerCase().replace(/\s+/g, '')} #${tone} #content` : '';
    
    return humanizeCaption ? humanizeText(randomTemplate + cta + hashtags) : randomTemplate + cta + hashtags;
  };

const applyCaptionStyle = (styleType) => {
  if (!originalCaption) return;
  
  let styledCaption = originalCaption;
  
  // Split the caption into parts (main content, CTA, hashtags)
  const parts = originalCaption.split('\n\n');
  const mainContent = parts[0] || '';
  const cta = parts[1] || 'What do you think?';
  const hashtags = parts[2] || '';
  
  switch (styleType) {
    case 'minimalist':
      styledCaption = originalCaption.replace(/[🎉🎊✨🔥💯⭐🐊👇💫🌟🎯🚀⭐]/g, '').replace(/\n\n+/g, '\n\n').trim();
      break;
      
    case 'emoji-heavy':
      styledCaption = originalCaption.replace(/\./g, '. ✨').replace(/!/g, '! 🔥').replace(/\?/g, '? 💭');
      break;
      
    case 'professional':
      styledCaption = originalCaption
        .replace(/[🎉🎊✨🔥💯🐊👇💫🌟🎯🚀⭐]/g, '')
        .replace(/amazing/g, 'impressive')
        .replace(/brilliant/g, 'effective')
        .replace(/What do you think\?/g, 'I welcome your thoughts on this.')
        .replace(/Share your thoughts below!/g, 'Please share your insights.');
      break;
      
    case 'listicle':
      styledCaption = `Here's what you need to know:\n\n1. ${mainContent}\n2. This approach delivers real results\n3. Perfect for getting started\n\n${cta}\n\n${hashtags}`;
      break;
      
    case 'story':
      styledCaption = `📖 Here's my story...\n\nLast week, I discovered something amazing about ${topic}. ${mainContent}\n\nIt was one of those "aha!" moments that made me realize how much this could impact my work. 💡\n\n${cta}\n\n${hashtags}`;
      break;
      
    case 'question':
      styledCaption = `🤔 Ever wondered about ${topic}?\n\n${mainContent}\n\nThe answer might surprise you! 🤯\n\nWhat's your take on this? Let me know below! 👇\n\n${hashtags}`;
      break;
      
    case 'urgent':
      styledCaption = `🚨 URGENT: This changes everything about ${topic}!\n\n⏰ Time-sensitive insight: ${mainContent}\n\n🔥 Don't wait - this opportunity won't last forever!\n\nACT NOW - what's your reaction? 👇\n\n${hashtags}`;
      break;
      
    case 'casual':
      styledCaption = `Hey there! 👋\n\nSo I was just thinking about ${topic} and honestly? ${mainContent}\n\nLike, seriously - this stuff is pretty cool when you think about it! 😊\n\nWhat do you reckon? Am I onto something here? 😅\n\n${hashtags}`;
      break;
      
    default:
      styledCaption = originalCaption;
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
      ['Date', 'Platform', 'Topic', 'Tone', 'Caption', 'Character Count', 'Favourite'].join(','),
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Plan</h2>
              <p className="text-gray-600">Unlock unlimited snappy captions and styling magic!</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className={`border-2 rounded-lg p-6 ${userPlan === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Free Plan</h3>
                  <div className="text-3xl font-bold text-green-600 mt-2">$0<span className="text-lg text-gray-500">/month</span></div>
                  {userPlan === 'free' && <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 5 AI captions (one-time)</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Unlimited templates</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 3 platforms</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 10 tone options</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Save 10 favourites</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Caption variations</li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-teal-500 rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>
                </div>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Pro Croc</h3>
                  <div className="text-3xl font-bold text-teal-600 mt-2">$9<span className="text-lg text-gray-500">/month</span></div>
                  <p className="text-sm text-gray-500 mt-1">Cancel anytime • 24hr support</p>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Unlimited captions</strong></li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>All 6 platforms</strong> + character guides</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>13 tone options</strong> (including Premium)</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>8 styling options</strong></li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> <strong>Unlimited favourites</strong></li>
                  <li className="flex items-center gap-2"><Heart size={16} className="text-orange-500" /> <strong>24hr human support</strong></li>
                </ul>
                <button 
                  onClick={() => {updateUserPlan('pro'); setShowUpgradeModal(false);}}
                  className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Upgrade to Pro Croc - $9/month
                </button>
              </div>

              {/* Credit Pack */}
              <div className={`border-2 rounded-lg p-6 ${userPlan === 'credits' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Credit Pack</h3>
                  <div className="text-3xl font-bold text-orange-600 mt-2">$5<span className="text-lg text-gray-500"> one-time</span></div>
                  <p className="text-sm text-gray-500 mt-1">No subscription required</p>
                </div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 50 caption credits</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Free platforms only</li>
                  <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Standard tones</li>
                  <li className="flex items-center gap-2"><Lock size={16} className="text-gray-400" /> Limited to 10 favorites</li>
                  <li className="flex items-center gap-2"><Lock size={16} className="text-gray-400" /> No styling options</li>
                </ul>
                <button 
                  onClick={() => {updateUserPlan('credits'); setShowUpgradeModal(false);}}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Buy Credit Pack - $5
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

  if (showLandingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
            <div className="text-center">
              {/* Logo & Brand */}
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
                  <span>5 AI credits free</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Support */}
        <div className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Works with all your favorite platforms</h3>
              <p className="text-xl text-gray-600">Optimized captions for every social media platform</p>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center justify-items-center mb-12">
              <div className="flex flex-col items-center gap-2">
                <Instagram className="text-pink-500" size={40} />
                <span className="text-sm font-medium text-gray-700">Instagram</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Free</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Facebook className="text-blue-600" size={40} />
                <span className="text-sm font-medium text-gray-700">Facebook</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Free</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="text-purple-500" size={40} />
                <span className="text-sm font-medium text-gray-700">TikTok</span>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Free</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Twitter className="text-blue-400" size={40} />
                <span className="text-sm font-medium text-gray-700">Twitter/X</span>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Pro</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Linkedin className="text-blue-700" size={40} />
                <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Pro</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ShoppingBag className="text-orange-500" size={40} />
                <span className="text-sm font-medium text-gray-700">Etsy</span>
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Pro</span>
              </div>
            </div>

            {/* Platform Features */}
            <div className="bg-gray-50 rounded-xl p-8">
              <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">Platform-Specific Optimization</h4>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Instagram className="text-pink-500" size={24} />
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2">Instagram Ready</h5>
                  <p className="text-sm text-gray-600">Optimal character count, hashtag suggestions, and engagement-focused formatting</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Linkedin className="text-blue-700" size={24} />
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2">LinkedIn Professional</h5>
                  <p className="text-sm text-gray-600">Business-focused tone, thought leadership style, and professional formatting</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="text-purple-500" size={24} />
                  </div>
                  <h5 className="font-semibold text-gray-800 mb-2">TikTok Viral</h5>
                  <p className="text-sm text-gray-600">Trend-aware content, hook-focused openings, and viral-optimized language</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="bg-gradient-to-br from-teal-50 to-orange-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Loved by content creators worldwide</h3>
              <p className="text-xl text-gray-600">Join thousands who never run out of caption ideas</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">10,000+</div>
                <div className="text-gray-600">Captions Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">500+</div>
                <div className="text-gray-600">Happy Creators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">6</div>
                <div className="text-gray-600">Social Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 mb-2">24hr</div>
                <div className="text-gray-600">Support Response</div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"CaptionCroc saves me hours every week. The AI really gets my brand voice!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">SH</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Sarah H.</div>
                    <div className="text-sm text-gray-500">Instagram Influencer</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"The styling options are brilliant. I can adapt any caption for different platforms instantly."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">MJ</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Mike J.</div>
                    <div className="text-sm text-gray-500">Marketing Manager</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"Finally, captions that don't sound like a robot wrote them. The humanizer feature is magic!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">AL</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Alex L.</div>
                    <div className="text-sm text-gray-500">Small Business Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-20" style={{ background: 'linear-gradient(135deg, #EA8953, #007B40)' }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to create snappy captions?</h3>
            <p className="text-xl mb-8" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Join thousands of creators who never run out of bite-sized content ideas</p>
            <button
              onClick={() => {
                setAuthMode('signup'); 
                setShowAuthModal(true);
              }}
              className="bg-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg"
              style={{ color: '#007B40' }}
            >
              Start Creating Free Captions
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
            <p className="text-gray-600 text-lg">Snappy captions that bite!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className={`rounded-lg p-4 ${userPlan === 'pro' ? 'bg-gradient-to-r from-teal-50 to-orange-50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {userPlan === 'pro' ? <Crown size={20} className="text-yellow-500" /> : <BarChart3 size={20} className="text-teal-600" />}
                  <span className="font-medium text-gray-800">
                    {userPlan === 'pro' ? 'Pro Croc' : userPlan === 'credits' ? 'Credit Pack' : 'Free Plan'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {userPlan === 'pro' ? '∞' : aiCredits}
                  </div>
                  <div className="text-sm text-gray-600">
                    {userPlan === 'pro' ? 'unlimited AI' : 'AI credits left'}
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
              Generator
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Saved Captions ({savedCaptions.length})
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

        <div className="p-8">
          {activeTab === 'generator' && (
            <div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-green-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-green-800 mb-1">🎯 AI Taste Test Model Active! 🎉</h3>
                    <p className="text-sm text-green-700">
                      New users get 5 AI credits to experience premium quality. After that, enjoy unlimited template captions!
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
                        {userPlan === 'free' && aiCredits === 0 ? 'AI Credits Used - Template Mode' : userPlan === 'credits' ? 'No Credits Left' : 'Upgrade Required'}
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
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-gray-800">Generated Caption</h3>
    {showVariations && captionVariations.length > 1 && (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Variation:</span>
        <div className="flex gap-1">
          {captionVariations.map((_, index) => (
            <button
              key={index}
              onClick={() => selectVariation(index)}
            // onClick={() => {
           //   setSelectedVariation(index);
            //  setGeneratedCaption(captionVariations[index]);
           //   }}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedVariation === index
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
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
      {showVariations && captionVariations.length > 1 && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>•</span>
          <span>{captionVariations.length} variations generated</span>
        </div>
      )}
    </div>
  )}
  <StylingPanel />
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
                            <button
                              onClick={() => deleteCaption(caption.id)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <h3 className="font-medium text-gray-800 mb-2">{caption.topic}</h3>
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': '#007B40' }}
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
                <div className={`border-2 rounded-lg p-6 ${userPlan === 'free' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Free Plan</h3>
                    <div className="text-3xl font-bold text-green-600 mt-2">$0<span className="text-lg text-gray-500">/month</span></div>
                    {userPlan === 'free' && <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 5 AI captions (one-time)</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Unlimited template captions</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> {currentLimits.platforms.length} platforms ({currentLimits.platforms.slice(0,2).join(', ')}, etc.)</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> {currentLimits.tones.length} tone options</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Save up to {currentLimits.maxFavourites} favourites</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Caption variations & humanizer</li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div className={`border-2 rounded-lg p-6 relative ${userPlan === 'pro' ? 'border-teal-500 bg-teal-50' : 'border-teal-500'}`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Pro Croc</h3>
                    <div className="text-3xl font-bold text-teal-600 mt-2">$9<span className="text-lg text-gray-500">/month</span></div>
                    {userPlan === 'pro' && <span className="inline-block bg-teal-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Unlimited caption generation</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 8 caption styling options</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> All 6 platforms (including LinkedIn, Etsy)</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Premium tones (Edgy, Witty, Viral)</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Unlimited favorites</li>
                    <li className="flex items-center gap-2"><Heart size={16} className="text-orange-500" /> Priority support</li>
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
                    <div className="text-3xl font-bold text-orange-600 mt-2">$5<span className="text-lg text-gray-500"> one-time</span></div>
                    {userPlan === 'credits' && <span className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm mt-2">Current Plan</span>}
                  </div>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> 50 caption credits</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> No subscription required</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Free platforms only</li>
                    <li className="flex items-center gap-2"><Zap size={16} className="text-green-500" /> Standard tones</li>
                    <li className="flex items-center gap-2"><Lock size={16} className="text-gray-400" /> Limited to 10 favorites</li>
                  </ul>
                  <button 
                    onClick={() => {setUserPlan('credits'); setAiCredits(prev => prev + 50);}}
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

      <UpgradeModal />
      <AuthModal />
    </div>
  );
}
