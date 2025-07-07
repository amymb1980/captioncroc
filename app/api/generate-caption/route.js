import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { topic, tone, platform, includeHashtags } = await request.json();

    // Validate required fields
    if (!topic || !tone || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, tone, or platform' },
        { status: 400 }
      );
    }

    // Get platform-specific character limits and style
    const platformGuide = getPlatformGuide(platform);
    
    // Create prompt for OpenAI
    const prompt = createCaptionPrompt(topic, tone, platform, includeHashtags, platformGuide);

    // Generate captions using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert social media caption writer with Australian flair. Write engaging, authentic captions that sound natural and avoid AI-obvious phrases. Use UK English spelling (colour, favourite, optimised). Include appropriate Australian expressions when they fit naturally."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8, // Add some creativity
    });

    const generatedText = completion.choices[0].message.content;
    
    // Split into 3 variations (assuming AI returns them separated)
    const variations = parseVariations(generatedText);

    return NextResponse.json({
      success: true,
      variations: variations,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      }
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Return a fallback response if OpenAI fails
    return NextResponse.json({
      success: false,
      error: 'Failed to generate caption',
      fallback: getFallbackCaption(topic, tone, platform, includeHashtags)
    }, { status: 500 });
  }
}

function getPlatformGuide(platform) {
  const guides = {
    'Instagram': {
      limit: 2200,
      style: 'Visual storytelling, use emojis, engaging hooks, encourage interaction',
      tips: 'First 125 characters are most important for engagement'
    },
    'Facebook': {
      limit: 8000,
      style: 'Conversational, community-focused, longer form acceptable',
      tips: '40-80 characters get best engagement for short posts'
    },
    'TikTok': {
      limit: 2200,
      style: 'Trendy, energetic, use trending phrases, call-to-action focused',
      tips: 'Keep it short and punchy, under 100 characters ideal'
    },
    'Twitter/X': {
      limit: 280,
      style: 'Concise, witty, thread-worthy, news/trending topics',
      tips: 'Leave room for retweets, around 240 characters max'
    },
    'LinkedIn': {
      limit: 3000,
      style: 'Professional, value-driven, industry insights, thought leadership',
      tips: 'First 140 characters crucial, professional tone'
    },
    'Etsy': {
      limit: 160,
      style: 'Product-focused, keyword-rich, craft/handmade appeal',
      tips: 'Include relevant keywords, very short and descriptive'
    }
  };
  
  return guides[platform] || guides['Instagram'];
}

function createCaptionPrompt(topic, tone, platform, includeHashtags, platformGuide) {
  return `Create 3 different social media captions for ${platform} about "${topic}" with a ${tone} tone.

Platform Guidelines:
- Character limit: ${platformGuide.limit}
- Style: ${platformGuide.style}
- Tip: ${platformGuide.tips}

Requirements:
- Use UK English spelling (colour, favourite, optimised, etc.)
- ${includeHashtags ? 'Include 3-5 relevant hashtags' : 'No hashtags'}
- Make each variation distinctly different in approach
- Sound natural and authentic, avoid AI-obvious phrases
- Include appropriate Australian expressions where natural (G'day, crikey, fair dinkum, etc.)
- Keep within character limits
- Make them engaging and actionable

Please format your response as:
VARIATION 1:
[caption text]

VARIATION 2:
[caption text]

VARIATION 3:
[caption text]`;
}

function parseVariations(text) {
  // Split the response into variations
  const variations = [];
  const parts = text.split(/VARIATION \d+:/i);
  
  // Remove empty first element and clean up
  for (let i = 1; i < parts.length && i <= 3; i++) {
    const variation = parts[i].trim();
    if (variation) {
      variations.push(variation);
    }
  }
  
  // If parsing failed, return the whole text as one variation
  if (variations.length === 0) {
    variations.push(text.trim());
  }
  
  // Ensure we always have 3 variations
  while (variations.length < 3) {
    variations.push(variations[0]); // Duplicate first if needed
  }
  
  return variations.slice(0, 3); // Limit to 3
}

function getFallbackCaption(topic, tone, platform, includeHashtags) {
  const fallbacks = [
    `G'day! Just had to share my thoughts on ${topic}! This ${tone} approach is absolutely brilliant. 🐊`,
    `Crikey! Been exploring ${topic} lately and I'm totally hooked! This ${tone} perspective really hits different. 🔥`,
    `Fair dinkum, ${topic} has been on my radar and I can't get enough! This ${tone} angle is pure gold. ✨`
  ];
  
  const hashtags = includeHashtags ? `\n\n#${topic.toLowerCase().replace(/\s+/g, '')} #${tone} #socialmedia #snappycaptions` : '';
  
  return fallbacks.map(caption => caption + '\n\nWhat do you reckon? Drop your thoughts below! 👇' + hashtags);
}
