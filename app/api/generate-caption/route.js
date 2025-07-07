import { NextResponse } from 'next/server';

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

    // For now, let's just test if the route works without OpenAI
    const testCaption = `G'day! Just had to share my thoughts on ${topic}! This ${tone} approach is absolutely brilliant for ${platform}. 🐊

What do you reckon? Drop your thoughts below! 👇

${includeHashtags ? `#${topic.toLowerCase().replace(/\s+/g, '')} #${tone} #socialmedia` : ''}`;

    return NextResponse.json({
      success: true,
      variations: [testCaption, testCaption, testCaption],
      message: "API route working! (OpenAI integration coming next)"
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'API route failed',
      fallback: [`Test fallback caption about ${topic || 'your topic'}`]
    }, { status: 500 });
  }
}

// Also handle GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: "CaptionCroc API route is working! Use POST to generate captions." 
  });
}
