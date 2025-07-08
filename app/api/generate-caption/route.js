import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Create the prompt for OpenAI
    const prompt = `Generate 3 different social media captions for ${platform} about "${topic}" with a ${tone} tone. 
    
Requirements:
- Platform: ${platform}
- Topic: ${topic}
- Tone: ${tone}
- ${includeHashtags ? 'Include 3-5 relevant hashtags' : 'No hashtags needed'}
- Keep within platform character limits
- Make each variation distinctly different
- Use engaging, authentic language
- Include call-to-action when appropriate

Return exactly 3 variations, each separated by "---VARIATION---"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative social media caption writer who creates engaging, authentic content. Always provide exactly 3 distinct variations separated by '---VARIATION---'."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    // Split the response into variations
    const variations = content
      .split('---VARIATION---')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    // Ensure we have at least 3 variations
    while (variations.length < 3) {
      variations.push(variations[0] || `Great post about ${topic}! ${includeHashtags ? `#${topic.toLowerCase().replace(/\s+/g, '')}` : ''}`);
    }

    return NextResponse.json({
      success: true,
      variations: variations.slice(0, 3), // Take only first 3
      message: "Generated with OpenAI!"
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Fallback captions if OpenAI fails
    const fallbackVariations = [
      `Excited to share my thoughts on ${topic}! This ${tone} approach really resonates with me. ${includeHashtags ? `#${topic.toLowerCase().replace(/\s+/g, '')} #${tone}` : ''}`,
      `Just discovered something amazing about ${topic}! The ${tone} perspective is eye-opening. ${includeHashtags ? `#${topic.toLowerCase().replace(/\s+/g, '')} #content` : ''}`,
      `Can't stop thinking about ${topic}! This ${tone} take is exactly what we need. ${includeHashtags ? `#${topic.toLowerCase().replace(/\s+/g, '')} #insights` : ''}`
    ];

    return NextResponse.json({
      success: true,
      variations: fallbackVariations,
      message: "Using fallback captions - OpenAI temporarily unavailable",
      error: error.message
    });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "CaptionCroc API route is working! Use POST to generate captions.",
    openai_configured: !!process.env.OPENAI_API_KEY
  });
}
