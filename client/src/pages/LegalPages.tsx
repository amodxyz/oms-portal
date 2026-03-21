import React from 'react';
import { useNavigate } from 'react-router-dom';
import LandingChatbot from '../components/LandingChatbot';

const COMPANY = 'OMS Portal';
const COMPANY_EMAIL = 'support@digitaladwords.online';
const COMPANY_ADDRESS = 'India';
const EFFECTIVE_DATE = 'January 1, 2025';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur border-b border-gray-100 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">O</div>
          <span className="font-bold text-gray-900 text-lg">OMS Portal</span>
        </button>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <button onClick={() => navigate('/features')} className="hover:text-blue-600 transition-colors">Features</button>
          <button onClick={() => navigate('/pricing')} className="hover:text-blue-600 transition-colors">Pricing</button>
          <button onClick={() => navigate('/book-demo')} className="hover:text-blue-600 transition-colors">Book Demo</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-blue-600 font-medium">Sign In</button>
          <button onClick={() => navigate('/register')} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Get Started</button>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">O</div>
              <span className="text-white font-semibold">OMS Portal</span>
            </div>
            <p className="text-xs text-gray-500">GST-ready Order Management System built for Indian businesses.</p>
          </div>
          <div>
            <div className="text-white text-sm font-semibold mb-3">Product</div>
            <div className="space-y-2 text-sm">
              <button onClick={() => navigate('/features')} className="block hover:text-white transition-colors">Features</button>
              <button onClick={() => navigate('/pricing')} className="block hover:text-white transition-colors">Pricing</button>
              <button onClick={() => navigate('/book-demo')} className="block hover:text-white transition-colors">Book Demo</button>
            </div>
          </div>
          <div>
            <div className="text-white text-sm font-semibold mb-3">Account</div>
            <div className="space-y-2 text-sm">
              <button onClick={() => navigate('/login')} className="block hover:text-white transition-colors">Sign In</button>
              <button onClick={() => navigate('/register')} className="block hover:text-white transition-colors">Register</button>
              <button onClick={() => navigate('/forgot-password')} className="block hover:text-white transition-colors">Reset Password</button>
            </div>
          </div>
          <div>
            <div className="text-white text-sm font-semibold mb-3">Legal</div>
            <div className="space-y-2 text-sm">
              <button onClick={() => navigate('/privacy-policy')} className="block hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => navigate('/terms')} className="block hover:text-white transition-colors">Terms of Use</button>
              <button onClick={() => navigate('/refund-policy')} className="block hover:text-white transition-colors">Refund Policy</button>
              <button onClick={() => navigate('/cookie-policy')} className="block hover:text-white transition-colors">Cookie Policy</button>
              <button onClick={() => navigate('/contact')} className="block hover:text-white transition-colors">Contact Us</button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} OMS Portal. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <button onClick={() => navigate('/privacy-policy')} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms</button>
            <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LegalLayout = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-white font-sans">
    <Navbar />
    <div className="pt-24 pb-8 px-6 bg-gray-50 border-b border-gray-100">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
    <div className="py-12 px-6">
      <div className="max-w-3xl mx-auto prose prose-gray prose-sm">
        {children}
      </div>
    </div>
    <LandingChatbot />
    <Footer />
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
    <div className="text-sm text-gray-600 space-y-3 leading-relaxed">{children}</div>
  </div>
);

// ── Privacy Policy ─────────────────────────────────────
export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" subtitle={`Effective date: ${EFFECTIVE_DATE} · Last updated: ${EFFECTIVE_DATE}`}>
      <Section title="1. Introduction">
        <p>{COMPANY} ("we", "our", "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
      </Section>
      <Section title="2. Information We Collect">
        <p><strong>Account Information:</strong> Name, email address, phone number, organisation name, and GSTIN when you register.</p>
        <p><strong>Business Data:</strong> Orders, inventory, customers, suppliers, invoices, and other data you enter into the platform.</p>
        <p><strong>Usage Data:</strong> IP address, browser type, pages visited, and actions taken within the platform for security and analytics.</p>
        <p><strong>Payment Information:</strong> Billing details processed securely through our payment gateway. We do not store card numbers.</p>
      </Section>
      <Section title="3. How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide, operate, and maintain the OMS Portal service</li>
          <li>Process transactions and send billing-related communications</li>
          <li>Send email verification and password reset emails</li>
          <li>Respond to support requests and inquiries</li>
          <li>Improve our platform and develop new features</li>
          <li>Comply with legal obligations under Indian law</li>
        </ul>
      </Section>
      <Section title="4. Data Isolation & Multi-Tenancy">
        <p>Each organisation's data is fully isolated. Your business data is never shared with or accessible by other organisations on the platform. All data is scoped to your tenant ID.</p>
      </Section>
      <Section title="5. Data Storage & Security">
        <p>Your data is stored on secure PostgreSQL servers hosted on Neon (US East region). We use industry-standard encryption (TLS/SSL) for all data in transit. Passwords are hashed using bcrypt with a cost factor of 12.</p>
        <p>We implement JWT-based authentication with short-lived access tokens (15 minutes) and rotating refresh tokens stored in httpOnly cookies.</p>
      </Section>
      <Section title="6. Data Sharing">
        <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Service providers:</strong> Hosting, email delivery, and payment processing partners under strict confidentiality agreements</li>
          <li><strong>Legal requirements:</strong> When required by Indian law, court order, or government authority</li>
        </ul>
      </Section>
      <Section title="7. Cookies">
        <p>We use httpOnly cookies for refresh token storage (authentication only). We do not use advertising or tracking cookies. See our Cookie Policy for details.</p>
      </Section>
      <Section title="8. Your Rights">
        <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at <strong>{COMPANY_EMAIL}</strong>. We will respond within 30 days.</p>
      </Section>
      <Section title="9. Data Retention">
        <p>We retain your data for as long as your account is active. Upon account deletion, your data is permanently removed within 30 days, except where retention is required by law.</p>
      </Section>
      <Section title="10. Children's Privacy">
        <p>OMS Portal is not intended for use by individuals under 18 years of age. We do not knowingly collect data from minors.</p>
      </Section>
      <Section title="11. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform.</p>
      </Section>
      <Section title="12. Contact Us">
        <p>For privacy-related questions, contact us at:<br /><strong>{COMPANY_EMAIL}</strong><br />{COMPANY_ADDRESS}</p>
      </Section>
    </LegalLayout>
  );
}

// ── Terms of Use ───────────────────────────────────────
export function TermsOfUse() {
  return (
    <LegalLayout title="Terms of Use" subtitle={`Effective date: ${EFFECTIVE_DATE} · Please read these terms carefully before using OMS Portal.`}>
      <Section title="1. Acceptance of Terms">
        <p>By accessing or using OMS Portal, you agree to be bound by these Terms of Use. If you do not agree, do not use the platform.</p>
      </Section>
      <Section title="2. Description of Service">
        <p>OMS Portal is a cloud-based, multi-tenant Order Management System (SaaS) that provides tools for inventory management, sales orders, GST invoicing, purchasing, production, quality control, logistics, and reporting for Indian businesses.</p>
      </Section>
      <Section title="3. Account Registration">
        <ul className="list-disc pl-5 space-y-1">
          <li>You must provide accurate and complete information during registration</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You must notify us immediately of any unauthorised access to your account</li>
          <li>One organisation per registration. Creating multiple accounts to circumvent plan limits is prohibited</li>
        </ul>
      </Section>
      <Section title="4. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the platform for any unlawful purpose or in violation of Indian law</li>
          <li>Attempt to gain unauthorised access to other tenants' data</li>
          <li>Reverse engineer, decompile, or attempt to extract the source code</li>
          <li>Use automated scripts to scrape or overload the platform</li>
          <li>Upload malicious code, viruses, or harmful content</li>
          <li>Resell or sublicense access to the platform without written permission</li>
        </ul>
      </Section>
      <Section title="5. Subscription & Payment">
        <ul className="list-disc pl-5 space-y-1">
          <li>Subscriptions are billed monthly or annually as selected</li>
          <li>All prices are in Indian Rupees (₹) and exclusive of GST (18%)</li>
          <li>Payments are processed securely through our payment gateway</li>
          <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
          <li>We reserve the right to change pricing with 30 days' notice</li>
        </ul>
      </Section>
      <Section title="6. Data Ownership">
        <p>You retain full ownership of all data you enter into OMS Portal. We do not claim any rights over your business data. You may export your data at any time.</p>
      </Section>
      <Section title="7. Service Availability">
        <p>We target 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance. We are not liable for losses due to downtime.</p>
      </Section>
      <Section title="8. Termination">
        <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or fail to pay subscription fees. You may cancel your account at any time from the billing section.</p>
      </Section>
      <Section title="9. Limitation of Liability">
        <p>To the maximum extent permitted by Indian law, OMS Portal shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you in the 3 months preceding the claim.</p>
      </Section>
      <Section title="10. Governing Law">
        <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
      </Section>
      <Section title="11. Changes to Terms">
        <p>We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
      </Section>
      <Section title="12. Contact">
        <p>For questions about these Terms, contact us at <strong>{COMPANY_EMAIL}</strong>.</p>
      </Section>
    </LegalLayout>
  );
}

// ── Refund Policy ──────────────────────────────────────
export function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" subtitle={`Effective date: ${EFFECTIVE_DATE} · Applies to all OMS Portal subscriptions.`}>
      <Section title="1. Free Trial">
        <p>OMS Portal offers a 14-day free trial with no credit card required. You can explore all features before committing to a paid plan.</p>
      </Section>
      <Section title="2. Monthly Subscriptions">
        <p>Monthly subscriptions are non-refundable once the billing cycle has started. You may cancel at any time and your access will continue until the end of the current billing period.</p>
      </Section>
      <Section title="3. Annual Subscriptions">
        <p>Annual subscriptions are eligible for a full refund within <strong>7 days</strong> of the initial purchase if you are not satisfied. After 7 days, annual subscriptions are non-refundable but you may cancel to prevent auto-renewal.</p>
      </Section>
      <Section title="4. Eligibility for Refund">
        <p>Refunds may be considered in the following cases:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Duplicate payment due to a technical error</li>
          <li>Annual subscription cancelled within 7 days of purchase</li>
          <li>Service was unavailable for more than 72 consecutive hours due to our fault</li>
        </ul>
      </Section>
      <Section title="5. Non-Refundable Cases">
        <ul className="list-disc pl-5 space-y-1">
          <li>Change of mind after the 7-day window for annual plans</li>
          <li>Monthly subscription fees already charged</li>
          <li>Accounts terminated for violation of Terms of Use</li>
          <li>Partial month usage</li>
        </ul>
      </Section>
      <Section title="6. How to Request a Refund">
        <p>Email us at <strong>{COMPANY_EMAIL}</strong> with subject "Refund Request" and include your registered email, organisation name, and reason for the refund. We will process eligible refunds within <strong>7–10 business days</strong>.</p>
      </Section>
      <Section title="7. GST on Refunds">
        <p>Refunds will be processed for the base amount. GST (18%) collected will be refunded as per applicable Indian tax regulations.</p>
      </Section>
      <Section title="8. Contact">
        <p>For refund queries: <strong>{COMPANY_EMAIL}</strong></p>
      </Section>
    </LegalLayout>
  );
}

// ── Cookie Policy ──────────────────────────────────────
export function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy" subtitle={`Effective date: ${EFFECTIVE_DATE} · How OMS Portal uses cookies.`}>
      <Section title="1. What Are Cookies">
        <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and maintain your session.</p>
      </Section>
      <Section title="2. Cookies We Use">
        <p>OMS Portal uses a minimal set of cookies:</p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Cookie</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Type</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Purpose</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-3 py-2 font-mono">refreshToken</td>
                <td className="px-3 py-2">Essential</td>
                <td className="px-3 py-2">Keeps you logged in securely (httpOnly, not accessible by JavaScript)</td>
                <td className="px-3 py-2">30 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="3. What We Don't Use">
        <p>We do not use:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Advertising or tracking cookies</li>
          <li>Third-party analytics cookies (e.g. Google Analytics)</li>
          <li>Social media tracking pixels</li>
          <li>Any cookies that track you across other websites</li>
        </ul>
      </Section>
      <Section title="4. localStorage">
        <p>We store your access token in <code className="bg-gray-100 px-1 rounded">localStorage</code> for authentication purposes. This is not a cookie but serves a similar function. It is cleared when you log out.</p>
      </Section>
      <Section title="5. Managing Cookies">
        <p>You can control cookies through your browser settings. Disabling the authentication cookie will require you to log in on every visit. Most browsers allow you to block or delete cookies via Settings → Privacy.</p>
      </Section>
      <Section title="6. Changes">
        <p>We may update this Cookie Policy as our platform evolves. Changes will be posted on this page.</p>
      </Section>
      <Section title="7. Contact">
        <p>Questions about cookies? Email us at <strong>{COMPANY_EMAIL}</strong>.</p>
      </Section>
    </LegalLayout>
  );
}

// ── Contact Us ─────────────────────────────────────────
export function ContactUs() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const BASE_URL = process.env.REACT_APP_API_URL || 'https://oms-portal-backend.vercel.app/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/chatbot/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: `Contact form: ${form.name}, ${form.email}, Subject: ${form.subject}, Message: ${form.message}` }] }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Get in Touch</span>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Contact Us</h1>
            <p className="text-gray-500 max-w-xl mx-auto">Have a question, feedback, or need help? We're here for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-6">
              {[
                { icon: '📧', title: 'Email Support', value: COMPANY_EMAIL, desc: 'We respond within 24 hours' },
                { icon: '💬', title: 'Live Chat', value: 'Use the chatbot', desc: 'Available on every page' },
                { icon: '📅', title: 'Book a Demo', value: 'Schedule a call', desc: 'Free 30-min walkthrough', action: () => navigate('/book-demo') },
              ].map(c => (
                <div key={c.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{c.title}</div>
                  {c.action
                    ? <button onClick={c.action} className="text-blue-600 text-sm font-medium hover:underline">{c.value}</button>
                    : <div className="text-blue-600 text-sm font-medium">{c.value}</div>}
                  <div className="text-xs text-gray-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✅</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                  <p className="text-gray-500">Thanks {form.name}! We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your name" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                        <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@company.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Subject *</label>
                      <select required value={form.subject} onChange={e => set('subject', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">Select a topic</option>
                        <option>General Inquiry</option>
                        <option>Technical Support</option>
                        <option>Billing & Payments</option>
                        <option>Feature Request</option>
                        <option>Bug Report</option>
                        <option>Partnership</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
                      <textarea required value={form.message} onChange={e => set('message', e.target.value)} rows={5} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe your question or issue in detail..." />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-60">
                      {loading ? 'Sending...' : 'Send Message →'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <LandingChatbot />
      <Footer />
    </div>
  );
}
