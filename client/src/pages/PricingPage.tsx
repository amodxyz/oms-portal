import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingChatbot from '../components/LandingChatbot';

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
          <button onClick={() => navigate('/pricing')} className="text-blue-600 font-medium">Pricing</button>
          <button onClick={() => navigate('/book-demo')} className="hover:text-blue-600 transition-colors">Book Demo</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">Sign In</button>
          <button onClick={() => navigate('/register')} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Get Started</button>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">O</div>
          <span className="text-white font-semibold">OMS Portal</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} OMS Portal. Built for Indian businesses.</p>
        <div className="flex gap-6 text-sm">
          <button onClick={() => navigate('/features')} className="hover:text-white transition-colors">Features</button>
          <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">Pricing</button>
          <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button>
        </div>
      </div>
    </footer>
  );
};

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 23,
    color: 'border-gray-200',
    badge: '',
    desc: 'Perfect for small businesses just getting started.',
    features: [
      { text: '5 Users', included: true },
      { text: '1,000 Orders/month', included: true },
      { text: 'Inventory Management', included: true },
      { text: 'Basic GST Invoices', included: true },
      { text: 'Customer Management', included: true },
      { text: 'Basic Reports', included: true },
      { text: 'Email Support', included: true },
      { text: 'Advanced Analytics', included: false },
      { text: 'Production Module', included: false },
      { text: 'API Access', included: false },
      { text: 'Dedicated Support', included: false },
    ],
  },
  {
    name: 'Professional',
    monthlyPrice: 79,
    yearlyPrice: 63,
    color: 'border-blue-500',
    badge: 'Most Popular',
    desc: 'For growing businesses that need more power.',
    features: [
      { text: '25 Users', included: true },
      { text: '10,000 Orders/month', included: true },
      { text: 'Inventory Management', included: true },
      { text: 'Full GST Compliance', included: true },
      { text: 'Customer Management', included: true },
      { text: 'Advanced Reports & Analytics', included: true },
      { text: 'Priority Email Support', included: true },
      { text: 'Production Module', included: true },
      { text: 'Quality Control', included: true },
      { text: 'API Access', included: false },
      { text: 'Dedicated Support', included: false },
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: 199,
    yearlyPrice: 159,
    color: 'border-purple-500',
    badge: 'Best Value',
    desc: 'For large operations with no limits.',
    features: [
      { text: 'Unlimited Users', included: true },
      { text: 'Unlimited Orders', included: true },
      { text: 'Inventory Management', included: true },
      { text: 'Full GST Compliance', included: true },
      { text: 'Customer Management', included: true },
      { text: 'Custom Reports', included: true },
      { text: 'Dedicated Support', included: true },
      { text: 'Production Module', included: true },
      { text: 'Quality Control', included: true },
      { text: 'API Access', included: true },
      { text: 'White-label Option', included: true },
    ],
  },
];

const faqs = [
  { q: 'Is there a free trial?', a: 'Yes — you can register and use OMS Portal free for 14 days. No credit card required.' },
  { q: 'Can I change my plan later?', a: 'Absolutely. You can upgrade or downgrade your plan at any time from the billing section.' },
  { q: 'Is GST included in the pricing?', a: 'The prices shown are exclusive of GST. 18% GST will be added at checkout as per Indian tax laws.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, Net Banking, Credit/Debit cards, and Razorpay.' },
  { q: 'Is my data secure?', a: 'Yes. All data is encrypted, stored on secure PostgreSQL servers, and fully isolated per organisation.' },
  { q: 'Can multiple users access the same account?', a: 'Yes. Each plan includes a set number of users with role-based access (Admin, Manager, Staff).' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 text-center">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Simple Pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Transparent, No Surprises
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          All plans include GST compliance, inventory management, and full support. Pay monthly or save 20% annually.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className={`text-sm font-medium ${!yearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setYearly(y => !y)}
            className={`relative w-12 h-6 rounded-full transition-colors ${yearly ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${yearly ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium ${yearly ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
          {yearly && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Save 20%</span>}
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(p => (
            <div key={p.name} className={`relative rounded-2xl border-2 ${p.color} p-8 flex flex-col ${p.badge === 'Most Popular' ? 'shadow-xl scale-105' : ''}`}>
              {p.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${p.badge === 'Most Popular' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                  {p.badge}
                </span>
              )}
              <div className="text-lg font-bold text-gray-900 mb-1">{p.name}</div>
              <p className="text-sm text-gray-500 mb-4">{p.desc}</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-extrabold text-gray-900">₹{yearly ? p.yearlyPrice : p.monthlyPrice}</span>
                <span className="text-gray-400 mb-1">/mo</span>
              </div>
              {yearly && <p className="text-xs text-green-600 font-medium mb-4">Billed ₹{p.yearlyPrice * 12}/year</p>}
              <ul className="space-y-2 flex-1 mb-8 mt-4">
                {p.features.map(f => (
                  <li key={f.text} className="flex items-center gap-2 text-sm">
                    {f.included
                      ? <span className="text-green-500 font-bold">✓</span>
                      : <span className="text-gray-300 font-bold">✗</span>}
                    <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/register')}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${p.badge === 'Most Popular' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* All plans include */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">All Plans Include</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🔒', title: 'Secure & Encrypted', desc: 'Data encrypted at rest and in transit' },
              { icon: '☁️', title: 'Cloud Hosted', desc: 'No installation, access from anywhere' },
              { icon: '🔄', title: 'Auto Backups', desc: 'Daily automated database backups' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Works on all devices and browsers' },
              { icon: '🇮🇳', title: 'GST Compliant', desc: 'CGST, SGST, IGST auto-calculation' },
              { icon: '👥', title: 'Multi-user', desc: 'Role-based access for your team' },
              { icon: '📧', title: 'Email Alerts', desc: 'Verification and password reset emails' },
              { icon: '🤖', title: 'AI Assistant', desc: 'Built-in chatbot for quick help' },
            ].map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-left">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{f.title}</div>
                <div className="text-xs text-gray-500">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 border-t border-gray-100 pt-3">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-800 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
        <p className="text-blue-200 mb-8">Book a free demo and we'll walk you through everything.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/book-demo')} className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg">
            Book a Demo →
          </button>
          <button onClick={() => navigate('/register')} className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-400 transition-all border border-blue-400">
            Start Free Trial
          </button>
        </div>
      </section>

      <LandingChatbot />
      <Footer />
    </div>
  );
}
