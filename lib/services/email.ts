/**
 * Email Service using Resend
 *
 * Handles transactional emails for Network Buddy
 */

import { Resend } from 'resend';

// Initialize Resend client lazily to avoid issues during build
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured');
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = 'Network Buddy <hello@networkbuddy.io>';

/**
 * Send upgrade reminder email when user hits their scan limit
 */
export async function sendScanLimitEmail(
  userEmail: string,
  userName: string | null
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.error('Cannot send email: Resend not configured');
    return false;
  }

  const displayName = userName || 'there';
  const pricingUrl = 'https://networkbuddy.io/pricing';

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: "You've used all your free scans - Upgrade to continue",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f23;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0;">Network Buddy</h1>
              <p style="color: #a78bfa; font-size: 14px; margin: 0;">Your AI-Powered Contact Manager</p>
            </div>

            <!-- Main Card -->
            <div style="background: linear-gradient(135deg, #1e1e3f 0%, #2d1f4e 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(167, 139, 250, 0.2);">

              <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">
                Hey ${displayName}! 👋
              </h2>

              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                You've been busy networking! You've scanned all <strong style="color: #a78bfa;">5 free business cards</strong> in your plan.
              </p>

              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                To keep capturing contacts and getting AI-powered insights about your network, upgrade to Pro and unlock:
              </p>

              <!-- Features List -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="color: #22c55e; font-size: 18px; margin-right: 12px;">✓</span>
                  <span style="color: #ffffff; font-size: 15px;"><strong>Unlimited scans</strong> - Never hit a limit again</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="color: #22c55e; font-size: 18px; margin-right: 12px;">✓</span>
                  <span style="color: #ffffff; font-size: 15px;"><strong>Premium enrichment</strong> - Get deeper contact insights</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <span style="color: #22c55e; font-size: 18px; margin-right: 12px;">✓</span>
                  <span style="color: #ffffff; font-size: 15px;"><strong>Priority support</strong> - We're here when you need us</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="color: #22c55e; font-size: 18px; margin-right: 12px;">✓</span>
                  <span style="color: #ffffff; font-size: 15px;"><strong>Export to CRM</strong> - Sync with your favorite tools</span>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${pricingUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; padding: 16px 48px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
                  Upgrade to Pro
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
                Starting at just <strong style="color: #a78bfa;">$9/month</strong> for 10 scans
              </p>

            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">
                Need credits instead? You can also <a href="${pricingUrl}" style="color: #a78bfa; text-decoration: none;">buy individual credits</a>
              </p>
              <p style="color: #4b5563; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Network Buddy. All rights reserved.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send scan limit email:', error);
      return false;
    }

    console.log('✅ Scan limit email sent to:', userEmail, 'messageId:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending scan limit email:', error);
    return false;
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string | null
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.error('Cannot send email: Resend not configured');
    return false;
  }

  const displayName = userName || 'there';

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [userEmail],
      subject: "Welcome to Network Buddy! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f23;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0;">Welcome to Network Buddy!</h1>
              <p style="color: #a78bfa; font-size: 14px; margin: 0;">Your AI-Powered Contact Manager</p>
            </div>

            <div style="background: linear-gradient(135deg, #1e1e3f 0%, #2d1f4e 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(167, 139, 250, 0.2);">

              <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">
                Hey ${displayName}! 👋
              </h2>

              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Thanks for joining Network Buddy! You're all set to start scanning business cards and building meaningful connections.
              </p>

              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                You have <strong style="color: #22c55e;">5 free scans</strong> to get started. Each scan gives you:
              </p>

              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <div style="margin-bottom: 12px;">
                  <span style="color: #a78bfa; font-size: 18px;">📷</span>
                  <span style="color: #ffffff; font-size: 15px; margin-left: 12px;">Instant card scanning with OCR</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="color: #a78bfa; font-size: 18px;">🤖</span>
                  <span style="color: #ffffff; font-size: 15px; margin-left: 12px;">AI-powered contact enrichment</span>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="color: #a78bfa; font-size: 18px;">🔍</span>
                  <span style="color: #ffffff; font-size: 15px; margin-left: 12px;">LinkedIn & social profile discovery</span>
                </div>
                <div>
                  <span style="color: #a78bfa; font-size: 18px;">💼</span>
                  <span style="color: #ffffff; font-size: 15px; margin-left: 12px;">Company insights & decision-maker info</span>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="https://networkbuddy.io/scan"
                   style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; padding: 16px 48px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Scan Your First Card
                </a>
              </div>

            </div>

            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #4b5563; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} Network Buddy. All rights reserved.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }

    console.log('✅ Welcome email sent to:', userEmail, 'messageId:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}
