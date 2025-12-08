// OpenAI Vision OCR service for business card text extraction
import OpenAI from 'openai';

export type OCRResult = {
  rawText: string;
  confidence: number;
  fields: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    jobTitle: string | null;
  };
};

/**
 * Extract text from business card image using OpenAI Vision API
 */
export async function extractBusinessCardText(imageBuffer: Buffer): Promise<OCRResult> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    const imageDataUrl = `data:image/jpeg;base64,${base64Image}`;

    // Use OpenAI Vision to extract and parse business card in one step
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a business card OCR expert. Extract all text from this business card image and parse it into structured fields.

Return a JSON object with these fields:
{
  "rawText": "all text visible on the card, preserving line breaks",
  "fields": {
    "firstName": "person's first name or null",
    "lastName": "person's last name or null",
    "email": "email address or null",
    "phone": "phone number with country code if visible or null",
    "company": "company/organization name or null",
    "jobTitle": "job title/position or null"
  }
}

Rules:
- Extract ALL visible text for rawText
- firstName and lastName should be the person's name (not company name)
- Include country code in phone if visible (e.g., +1)
- Return null for any field you cannot confidently extract
- Only return the JSON object, no explanation`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('No response from OpenAI Vision');
    }

    const parsed = JSON.parse(content);

    // Estimate confidence based on number of fields extracted
    const filledFields = Object.values(parsed.fields).filter(v => v !== null).length;
    const confidence = Math.min(50 + (filledFields * 10), 95);

    return {
      rawText: parsed.rawText || '',
      confidence,
      fields: {
        firstName: parsed.fields.firstName || null,
        lastName: parsed.fields.lastName || null,
        email: parsed.fields.email || null,
        phone: parsed.fields.phone || null,
        company: parsed.fields.company || null,
        jobTitle: parsed.fields.jobTitle || null,
      },
    };
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw error instanceof Error ? error : new Error('Failed to extract text from image');
  }
}


/**
 * Validate extracted fields
 */
export function validateOCRFields(fields: OCRResult['fields']): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Email validation
  if (fields.email) {
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailRegex.test(fields.email)) {
      errors.push('Invalid email format');
    }
  }

  // Phone validation (basic)
  if (fields.phone) {
    const phoneRegex = /[\d\+\-\(\)\s\.]{7,}/;
    if (!phoneRegex.test(fields.phone)) {
      errors.push('Invalid phone format');
    }
  }

  // At least one field should be present
  const hasAnyField = Object.values(fields).some((value) => value !== null && value.trim().length > 0);

  if (!hasAnyField) {
    errors.push('No contact information extracted');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
