import { NextRequest, NextResponse } from 'next/server';
import { processAIChatQuery } from '@/lib/ai-assistant';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`ai_chat:${ip}`, { limit: 40, windowMs: 60000 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'AI Assistant rate limit reached. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const query = body.query || body.message;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Please provide a valid query message' }, { status: 400 });
    }

    const result = await processAIChatQuery(query);

    return NextResponse.json({
      success: true,
      message: result.message,
      suggestedItems: result.suggestedItems,
    });
  } catch (error) {
    console.error('Error processing AI chat query:', error);
    return NextResponse.json(
      { error: 'Failed to process AI assistant query.' },
      { status: 500 }
    );
  }
}
