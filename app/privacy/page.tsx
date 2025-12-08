import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Network Buddy',
  description: 'Network Buddy Privacy Policy - Learn how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#2c2f33] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#36393f] rounded-lg shadow-sm p-8 border border-[#202225]">
          <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last Updated: December 6, 2025</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-gray-300 mb-4">
                Welcome to Network Buddy. We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our business card scanning and contact management application.
              </p>
              <p className="text-gray-300 mb-4">
                By using Network Buddy, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-white mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
                <li><strong>Business Card Data:</strong> Images of business cards you scan and the extracted information (names, phone numbers, email addresses, companies, job titles)</li>
                <li><strong>Contact Information:</strong> Additional notes, tags, and information you add to your contacts</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through Stripe (we do not store your credit card information)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the app, and interaction patterns</li>
                <li><strong>Location Data:</strong> Approximate location based on IP address (we do not collect precise GPS location)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li><strong>OAuth Providers:</strong> When you sign in with Google or Apple, we receive your name and email address</li>
                <li><strong>Contact Enrichment:</strong> We may retrieve publicly available information about your contacts from LinkedIn, company databases, and news sources to enhance contact profiles</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-300 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li>Provide, operate, and maintain our business card scanning and contact management services</li>
                <li>Process and extract text from business card images using optical character recognition (OCR)</li>
                <li>Enrich contact profiles with publicly available professional information</li>
                <li>Generate AI-powered conversation starters and insights about your contacts</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send you technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Analyze usage patterns to improve our service and develop new features</li>
                <li>Detect, prevent, and address technical issues and fraudulent activity</li>
                <li>Comply with legal obligations and enforce our Terms of Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. How We Share Your Information</h2>
              <p className="text-gray-300 mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>

              <h3 className="text-xl font-semibold text-white mb-3">4.1 Service Providers</h3>
              <p className="text-gray-300 mb-4">We work with third-party service providers to help us operate our business:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li><strong>Supabase:</strong> Database hosting and authentication services</li>
                <li><strong>OpenAI:</strong> AI-powered OCR and text analysis</li>
                <li><strong>Vercel:</strong> Application hosting and deployment</li>
                <li><strong>Stripe:</strong> Payment processing (PCI-DSS compliant)</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">4.2 Legal Requirements</h3>
              <p className="text-gray-300 mb-4">We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or government agency).</p>

              <h3 className="text-xl font-semibold text-white mb-3">4.3 Business Transfers</h3>
              <p className="text-gray-300 mb-4">If we are involved in a merger, acquisition, or asset sale, your information may be transferred. We will provide notice before your information is transferred and becomes subject to a different Privacy Policy.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="text-gray-300 mb-4">
                We implement appropriate technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li>Encryption of data in transit using SSL/TLS</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Row-Level Security (RLS) policies in our database to ensure users can only access their own data</li>
                <li>Regular security assessments and updates</li>
                <li>Restricted access to personal information to authorized personnel only</li>
              </ul>
              <p className="text-gray-300 mb-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
              <p className="text-gray-300 mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal, regulatory, or legitimate business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights and Choices</h2>
              <p className="text-gray-300 mb-4">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li><strong>Access:</strong> You can access and review your information through your account settings</li>
                <li><strong>Correction:</strong> You can update or correct your information at any time</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and associated data</li>
                <li><strong>Data Portability:</strong> You can export your contact data in a structured format</li>
                <li><strong>Opt-Out:</strong> You can opt out of marketing communications at any time</li>
                <li><strong>Revoke Consent:</strong> You can revoke consent for data processing where we rely on consent as the legal basis</li>
              </ul>
              <p className="text-gray-300 mb-4">
                To exercise these rights, please contact us at <a href="mailto:dave@ilift.com" className="text-blue-400 hover:underline">dave@ilift.com</a> or through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
              <p className="text-gray-300 mb-4">
                Network Buddy is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information from our systems.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. International Data Transfers</h2>
              <p className="text-gray-300 mb-4">
                Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using Network Buddy, you consent to the transfer of your information to the United States and other countries where our service providers operate.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. California Privacy Rights</h2>
              <p className="text-gray-300 mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information held by businesses</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes are effective when posted on this page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-[#2c2f33] p-4 rounded-lg border border-[#202225]">
                <p className="text-gray-300 mb-2"><strong>Network Buddy</strong></p>
                <p className="text-gray-300 mb-2">David Gakshtey</p>
                <p className="text-gray-300 mb-2">1739 Bard Lane</p>
                <p className="text-gray-300 mb-2">East Meadow, NY 11554</p>
                <p className="text-gray-300 mb-2">Email: <a href="mailto:dave@ilift.com" className="text-blue-400 hover:underline">dave@ilift.com</a></p>
                <p className="text-gray-300">Phone: <a href="tel:855-905-3407" className="text-blue-400 hover:underline">855-905-3407</a></p>
              </div>
            </section>
          </div>

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
