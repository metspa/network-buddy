// API endpoint for OCR processing - supports business cards, trucks, storefronts, ads, signs
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractWithFallback } from '@/lib/services/gemini-ocr';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text using Gemini (with OpenAI fallback)
    // Supports: business cards, trucks, storefronts, ads, signs
    const result = await extractWithFallback(buffer);

    return NextResponse.json({
      imageType: result.imageType, // NEW: business_card | truck | storefront | ad | sign | other
      rawText: result.rawText,
      confidence: result.confidence,
      fields: result.fields, // Includes website and address now
    });
  } catch (error) {
    console.error('OCR API error:', error);

    // Return more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('GOOGLE_GEMINI_API_KEY') || error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json(
          { error: 'OCR service not configured. Please contact administrator.' },
          { status: 500 }
        );
      }
      if (error.message.includes('No text') || error.message.includes('No response') || error.message.includes('No information')) {
        return NextResponse.json(
          { error: 'Could not extract text from image. Please ensure the image is clear and contains visible text.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
