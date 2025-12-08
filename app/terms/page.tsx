import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Network Buddy',
  description: 'Network Buddy Terms of Service - Legal terms and conditions for using our service.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#2c2f33] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#36393f] rounded-lg shadow-sm p-8 border border-[#202225]">
          <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last Updated: December 6, 2025</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 mb-4">
                Welcome to Network Buddy. These Terms of Service ("Terms") govern your access to and use of Network Buddy's website, mobile application, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-300 mb-4">
                If you do not agree to these Terms, you may not access or use the Service. We reserve the right to update and change these Terms by posting updates and changes to the Service. You are advised to check the Terms from time to time for any updates or changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-gray-300 mb-4">
                Network Buddy is a business card scanning and contact management platform that provides:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li>Optical Character Recognition (OCR) to extract information from business card images</li>
                <li>Contact storage and management</li>
                <li>Automated contact enrichment with publicly available professional information</li>
                <li>AI-powered conversation starters and networking insights</li>
                <li>Integration with third-party services for enhanced functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
              <p className="text-gray-300 mb-4">
                To use certain features of the Service, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-gray-300 mb-4">
                You must be at least 13 years old to use the Service. If you are under 18, you represent that you have your parent or guardian's permission to use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
              <p className="text-gray-300 mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Upload, transmit, or distribute malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Collect or harvest information about other users without consent</li>
                <li>Use the Service for spam, phishing, or fraudulent purposes</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Upload content that is offensive, defamatory, or violates intellectual property rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription and Payment</h2>

              <h3 className="text-xl font-semibold text-white mb-3">5.1 Free and Paid Plans</h3>
              <p className="text-gray-300 mb-4">
                Network Buddy offers both free and paid subscription plans. The features available to you depend on your subscription tier. Paid plans may include additional storage, enhanced features, and priority support.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">5.2 Billing</h3>
              <p className="text-gray-300 mb-4">
                Paid subscriptions are billed in advance on a recurring basis (monthly or annually, depending on your plan). You authorize us to charge your payment method for all fees. All fees are non-refundable except as required by law or as explicitly stated in these Terms.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">5.3 Price Changes</h3>
              <p className="text-gray-300 mb-4">
                We reserve the right to change our pricing at any time. If we change the price of your subscription, we will provide you with at least 30 days' notice. Price changes will take effect at the start of your next billing cycle.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">5.4 Cancellation</h3>
              <p className="text-gray-300 mb-4">
                You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period. You will not receive a refund for the current billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>

              <h3 className="text-xl font-semibold text-white mb-3">6.1 Our Rights</h3>
              <p className="text-gray-300 mb-4">
                The Service and its original content, features, and functionality are owned by Network Buddy and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">6.2 Your Rights</h3>
              <p className="text-gray-300 mb-4">
                You retain all rights to the content you upload to the Service, including business card images and contact information. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, process, and display your content solely for the purpose of providing the Service to you.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">6.3 Feedback</h3>
              <p className="text-gray-300 mb-4">
                If you provide us with feedback, suggestions, or ideas about the Service, you grant us the right to use such feedback without compensation or attribution.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Third-Party Services</h2>
              <p className="text-gray-300 mb-4">
                The Service may contain links to third-party websites or services that are not owned or controlled by Network Buddy. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>
              <p className="text-gray-300 mb-4">
                You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by your use of any third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Data and Privacy</h2>
              <p className="text-gray-300 mb-4">
                Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimers and Limitations of Liability</h2>

              <h3 className="text-xl font-semibold text-white mb-3">9.1 Service Disclaimer</h3>
              <p className="text-gray-300 mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-gray-300 mb-4">
                We do not warrant that the Service will be uninterrupted, secure, or error-free, or that any defects will be corrected. OCR accuracy may vary depending on image quality, and we do not guarantee perfect text extraction.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">9.2 Limitation of Liability</h3>
              <p className="text-gray-300 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NETWORK BUDDY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="text-gray-300 mb-4">
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
              <p className="text-gray-300 mb-4">
                You agree to indemnify, defend, and hold harmless Network Buddy, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-300 space-y-2">
                <li>Your access to or use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Content you upload to the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
              <p className="text-gray-300 mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms.
              </p>
              <p className="text-gray-300 mb-4">
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may do so through your account settings or by contacting us.
              </p>
              <p className="text-gray-300 mb-4">
                All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. Dispute Resolution</h2>

              <h3 className="text-xl font-semibold text-white mb-3">12.1 Governing Law</h3>
              <p className="text-gray-300 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">12.2 Arbitration</h3>
              <p className="text-gray-300 mb-4">
                Any dispute arising from or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the Commercial Arbitration Rules of the American Arbitration Association. The arbitration shall take place in New York, NY.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">12.3 Class Action Waiver</h3>
              <p className="text-gray-300 mb-4">
                You agree that any arbitration or proceeding shall be limited to the dispute between you and us individually. To the full extent permitted by law, no arbitration or proceeding shall be joined with any other, and there is no right or authority for any dispute to be arbitrated on a class-action basis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. General Provisions</h2>

              <h3 className="text-xl font-semibold text-white mb-3">13.1 Entire Agreement</h3>
              <p className="text-gray-300 mb-4">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Network Buddy regarding the Service.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">13.2 Severability</h3>
              <p className="text-gray-300 mb-4">
                If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall remain in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">13.3 Waiver</h3>
              <p className="text-gray-300 mb-4">
                No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">13.4 Assignment</h3>
              <p className="text-gray-300 mb-4">
                You may not assign or transfer these Terms or your rights under these Terms without our prior written consent. We may assign our rights under these Terms without restriction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms, please contact us:
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

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">15. Acknowledgment</h2>
              <p className="text-gray-300 mb-4">
                BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
              </p>
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
