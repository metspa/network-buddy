// Google Gemini 2.0 Flash multi-modal OCR service
// Supports business cards, trucks, storefronts, ads, signs, and more
import { GoogleGenerativeAI } from '@google/generative-ai';

export type ImageType = 'business_card' | 'truck' | 'storefront' | 'ad' | 'sign' | 'other';

export type GeminiOCRResult = {
  imageType: ImageType;
  rawText: string;
  confidence: number;
  fields: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;  // REQUIRED for enrichment
    jobTitle: string | null;
    website: string | null;
    address: string | null;
  };
};

/**
 * Clean email by removing OCR artifacts like "Office.", "Email:", etc.
 */
function cleanEmail(email: string | null): string | null {
  if (!email) return null;

  // Trim first
  let cleaned = email.trim();

  // Remove common prefixes that OCR picks up (multiple passes)
  cleaned = cleaned
    .replace(/^Office\.?\s*/i, '') // "Office." or "Office"
    .replace(/^Email:?\s*/i, '') // "Email:" or "Email"
    .replace(/^E-?mail:?\s*/i, '') // "E-mail:" or "Email:"
    .replace(/^E:?\s*/i, '') // "E:" or "E"
    .replace(/^Contact:?\s*/i, '') // "Contact:"
    .replace(/^Info:?\s*/i, '') // "Info:"
    .replace(/^Sales:?\s*/i, '') // "Sales:"
    .replace(/^Support:?\s*/i, '') // "Support:"
    .replace(/^Work:?\s*/i, '') // "Work:"
    .replace(/^Business:?\s*/i, '') // "Business:"
    .trim();

  // Only return if it looks like a valid email
  return cleaned.includes('@') && cleaned.includes('.') ? cleaned : null;
}

/**
 * Clean phone by removing common prefixes
 */
function cleanPhone(phone: string | null): string | null {
  if (!phone) return null;

  // Remove common prefixes
  return phone
    .replace(/^(Phone:|Tel:|T:|Mobile:|M:|Cell:)/i, '')
    .trim();
}

/**
 * Extract text and classify image using Google Gemini 2.0 Flash
 * Cost: ~$0.0011 per image (10x cheaper than GPT-4o)
 * Speed: 1-2 seconds
 */
export async function extractWithGemini(imageBuffer: Buffer): Promise<GeminiOCRResult> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    const prompt = `You are an expert at analyzing images and extracting contact information.

TASK 1: Classify the image type
Determine what type of image this is:
- "business_card": A business card
- "truck": A truck/vehicle with company branding
- "storefront": A store/business front with signage
- "ad": An advertisement or flyer
- "sign": A sign or billboard
- "other": Anything else

TASK 2: Extract all visible text
Extract ALL text you can see in the image.

TASK 3: Parse structured fields
Extract these fields if visible:
- firstName: Person's first name (if any)
- lastName: Person's last name (if any)
- email: Email address
- phone: Phone number (include country code if visible)
- company: Company/business/organization name (REQUIRED - extract even if it's just a logo)
- jobTitle: Job title or position
- website: Website URL
- address: Physical address

Return a JSON object in this EXACT format:
{
  "imageType": "business_card" | "truck" | "storefront" | "ad" | "sign" | "other",
  "rawText": "all visible text preserving line breaks",
  "fields": {
    "firstName": "value or null",
    "lastName": "value or null",
    "email": "value or null",
    "phone": "value or null",
    "company": "value or null",
    "jobTitle": "value or null",
    "website": "value or null",
    "address": "value or null"
  }
}

CRITICAL RULES:
1. ALWAYS try to extract the company name - it's required for enrichment
2. For trucks/storefronts/ads: company name is usually the most prominent text
3. Return null for fields you cannot confidently extract
4. Extract ALL visible text for rawText field
5. Only return the JSON object, no explanation`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    // Parse JSON response
    // Gemini sometimes wraps JSON in markdown code blocks
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;

    const parsed = JSON.parse(jsonText);

    // Validate imageType
    const validImageTypes: ImageType[] = ['business_card', 'truck', 'storefront', 'ad', 'sign', 'other'];
    const imageType: ImageType = validImageTypes.includes(parsed.imageType)
      ? parsed.imageType
      : 'other';

    // Estimate confidence based on:
    // 1. Whether company name was extracted (critical)
    // 2. Number of other fields extracted
    const hasCompany = parsed.fields.company !== null;
    const filledFields = Object.values(parsed.fields).filter(v => v !== null).length;

    let confidence = 40;
    if (hasCompany) confidence += 30; // Company is critical
    confidence += Math.min(filledFields * 5, 30); // Other fields
    confidence = Math.min(confidence, 95);

    return {
      imageType,
      rawText: parsed.rawText || '',
      confidence,
      fields: {
        firstName: parsed.fields.firstName || null,
        lastName: parsed.fields.lastName || null,
        email: cleanEmail(parsed.fields.email),
        phone: cleanPhone(parsed.fields.phone),
        company: parsed.fields.company || null,
        jobTitle: parsed.fields.jobTitle || null,
        website: parsed.fields.website || null,
        address: parsed.fields.address || null,
      },
    };
  } catch (error) {
    console.error('Gemini OCR extraction error:', error);

    // If Gemini fails, throw error so we can fallback to OpenAI
    if (error instanceof Error) {
      throw new Error(`Gemini OCR failed: ${error.message}`);
    }
    throw new Error('Failed to extract text from image with Gemini');
  }
}

/**
 * Validate extracted fields
 */
export function validateGeminiFields(fields: GeminiOCRResult['fields']): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Email validation
  if (fields.email) {
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailRegex.test(fields.email)) {
      warnings.push('Email format may be incorrect');
    }
  }

  // Phone validation (basic)
  if (fields.phone) {
    const phoneRegex = /[\d\+\-\(\)\s\.]{7,}/;
    if (!phoneRegex.test(fields.phone)) {
      warnings.push('Phone format may be incorrect');
    }
  }

  // Website validation
  if (fields.website) {
    const urlRegex = /^(https?:\/\/)?([\w.-]+\.[a-z]{2,})(\/.*)?$/i;
    if (!urlRegex.test(fields.website)) {
      warnings.push('Website URL format may be incorrect');
    }
  }

  // Company name is critical for enrichment
  if (!fields.company || fields.company.trim().length === 0) {
    warnings.push('No company name extracted - enrichment may be limited');
  }

  // At least SOME data should be present
  const hasAnyField = Object.values(fields).some(
    (value) => value !== null && value.toString().trim().length > 0
  );

  if (!hasAnyField) {
    errors.push('No information extracted from image');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Fallback to OpenAI if Gemini fails
 * Import and use the existing OpenAI OCR service
 */
export async function extractWithFallback(imageBuffer: Buffer): Promise<GeminiOCRResult> {
  try {
    // Try Gemini first (cheaper, faster)
    return await extractWithGemini(imageBuffer);
  } catch (geminiError) {
    console.warn('Gemini OCR failed, falling back to OpenAI:', geminiError);

    // Fallback to OpenAI
    const { extractBusinessCardText } = await import('./ocr');
    const ocrResult = await extractBusinessCardText(imageBuffer);

    // Clean the email field (remove "Office.", "Email:", etc.)
    const cleanedEmail = cleanEmail(ocrResult.fields.email);

    // Convert OpenAI result to Gemini format
    return {
      imageType: 'business_card', // OpenAI only handles business cards
      rawText: ocrResult.rawText,
      confidence: ocrResult.confidence,
      fields: {
        ...ocrResult.fields,
        email: cleanedEmail,
        website: null,
        address: null,
      },
    };
  }
}
