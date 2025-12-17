import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Email recipient for contact form submissions
const CONTACT_EMAIL = 'dave@ilift.com';

export async function POST(request: Request) {
  try {
    // Check for API key at runtime
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please contact support directly.' },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Subject mapping for better readability
    const subjectLabels: Record<string, string> = {
      general: 'General Inquiry',
      support: 'Technical Support',
      billing: 'Billing Question',
      feedback: 'Feature Request / Feedback',
      partnership: 'Partnership Opportunity',
      other: 'Other',
    };

    const subjectLabel = subjectLabels[subject] || subject;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Network Buddy <contact@networkbuddy.io>',
      to: [CONTACT_EMAIL],
      replyTo: email,
      subject: `[Network Buddy] ${subjectLabel} from ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d; width: 120px;">
                  <strong>From:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #212529;">
                  ${name}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d;">
                  <strong>Email:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #212529;">
                  <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #6c757d;">
                  <strong>Subject:</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef; color: #212529;">
                  ${subjectLabel}
                </td>
              </tr>
            </table>

            <div style="margin-top: 24px;">
              <p style="color: #6c757d; margin-bottom: 8px;"><strong>Message:</strong></p>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; color: #212529; line-height: 1.6; white-space: pre-wrap;">
${message}
              </div>
            </div>

            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e9ecef; text-align: center;">
              <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
                Reply to ${name}
              </a>
            </div>
          </div>

          <p style="text-align: center; color: #adb5bd; font-size: 12px; margin-top: 20px;">
            This message was sent from the Network Buddy contact form.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
