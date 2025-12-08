import Link from 'next/link'

export const metadata = {
  title: 'Support - Network Buddy',
  description: 'Get help with Network Buddy - FAQs, troubleshooting, and contact information.',
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#2c2f33] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#36393f] rounded-lg shadow-sm p-8 border border-[#202225]">
          <h1 className="text-3xl font-bold text-white mb-6">Support Center</h1>
          <p className="text-gray-300 mb-8">
            Need help with Network Buddy? Find answers to common questions or get in touch with our support team.
          </p>

          {/* Contact Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <div className="bg-[#2c2f33] p-6 rounded-lg border border-[#202225]">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Email Support</h3>
                  <p className="text-gray-300 mb-2">For general inquiries and support:</p>
                  <a href="mailto:dave@ilift.com" className="text-blue-400 hover:underline">
                    dave@ilift.com
                  </a>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Phone Support</h3>
                  <p className="text-gray-300 mb-2">Available Monday-Friday, 9am-5pm EST:</p>
                  <a href="tel:855-905-3407" className="text-blue-400 hover:underline">
                    855-905-3407
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">How do I scan a business card?</h3>
                <p className="text-gray-300">
                  From your dashboard, click the "+" button and select "Scan Business Card". Point your camera at the card,
                  and our AI will automatically extract the contact information. You can review and edit the details before saving.
                </p>
              </div>

              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">What is contact enrichment?</h3>
                <p className="text-gray-300">
                  Contact enrichment automatically finds additional information about your contacts from public sources like
                  LinkedIn, company websites, and news articles. This includes job titles, company details, and professional background.
                </p>
              </div>

              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">How many scans do I get for free?</h3>
                <p className="text-gray-300">
                  Free accounts include 5 business card scans per month. Upgrade to Growth (25 scans/month) or Pro (unlimited scans)
                  for more capacity.
                </p>
              </div>

              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">How do I upgrade my subscription?</h3>
                <p className="text-gray-300">
                  Visit our pricing page and select your preferred plan. You can upgrade at any time, and your new features
                  will be available immediately. Payments are processed securely through Stripe.
                </p>
              </div>

              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">Can I export my contacts?</h3>
                <p className="text-gray-300">
                  Yes! You can export your contacts in CSV format from the Settings page. This makes it easy to backup your
                  data or import contacts into other applications.
                </p>
              </div>

              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">Is my data secure?</h3>
                <p className="text-gray-300">
                  Yes, we take security seriously. All data is encrypted in transit and at rest. We use row-level security
                  to ensure you can only access your own data. Read our{' '}
                  <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link> for more details.
                </p>
              </div>

              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">How do I delete my account?</h3>
                <p className="text-gray-300">
                  You can delete your account from the Settings page. This will permanently remove all your data including
                  contacts, scanned images, and account information. Please note this action cannot be undone.
                </p>
              </div>
            </div>
          </section>

          {/* Troubleshooting Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">Troubleshooting</h2>
            <div className="space-y-4">
              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">Camera not working?</h3>
                <ul className="text-gray-300 list-disc pl-5 space-y-1">
                  <li>Make sure you've granted camera permissions in your browser/device settings</li>
                  <li>Try refreshing the page</li>
                  <li>Check if another app is using the camera</li>
                  <li>Try using a different browser (Chrome works best)</li>
                </ul>
              </div>

              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">OCR not extracting text correctly?</h3>
                <ul className="text-gray-300 list-disc pl-5 space-y-1">
                  <li>Ensure good lighting when taking the photo</li>
                  <li>Hold the camera steady and make sure the card is in focus</li>
                  <li>Position the card flat with all text visible</li>
                  <li>Avoid glare and shadows on the card</li>
                </ul>
              </div>

              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <h3 className="text-lg font-medium text-white mb-2">Login issues?</h3>
                <ul className="text-gray-300 list-disc pl-5 space-y-1">
                  <li>Clear your browser cookies and cache</li>
                  <li>Make sure you're using the correct email address</li>
                  <li>Try the "Forgot Password" option to reset your password</li>
                  <li>If using Google/Apple login, ensure third-party cookies are enabled</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Quick Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Quick Links</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/privacy"
                className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225] hover:border-blue-500 transition-colors"
              >
                <h3 className="text-lg font-medium text-white mb-1">Privacy Policy</h3>
                <p className="text-gray-400 text-sm">How we protect your data</p>
              </Link>
              <Link
                href="/terms"
                className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225] hover:border-blue-500 transition-colors"
              >
                <h3 className="text-lg font-medium text-white mb-1">Terms of Service</h3>
                <p className="text-gray-400 text-sm">Our service agreement</p>
              </Link>
              <Link
                href="/#pricing"
                className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225] hover:border-blue-500 transition-colors"
              >
                <h3 className="text-lg font-medium text-white mb-1">Pricing</h3>
                <p className="text-gray-400 text-sm">View our plans</p>
              </Link>
            </div>
          </section>

          <div className="mt-8 pt-8 border-t border-[#202225]">
            <Link href="/" className="text-blue-400 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
