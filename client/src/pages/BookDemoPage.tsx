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
          <button onClick={() => navigate('/pricing')} className="hover:text-blue-600 transition-colors">Pricing</button>
          <button onClick={() => navigate('/book-demo')} className="text-blue-600 font-medium">Book Demo</button>
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

const BASE_URL = process.env.REACT_APP_API_URL || 'https://oms-portal-backend.vercel.app/api';

export default function BookDemoPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', size: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch(`${BASE_URL}/chatbot/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Demo request from: ${form.name}, ${form.email}, ${form.phone}, Company: ${form.company}, Size: ${form.size}, Message: ${form.message}`,
          }],
        }),
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

            {/* Left — Info */}
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                Free Demo
              </span>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                See OMS Portal<br />in Action
              </h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Book a free 30-minute demo with our team. We'll walk you through the platform, answer your questions, and help you get started.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  { icon: '⏱️', title: '30-minute session', desc: 'A focused walkthrough of all key features' },
                  { icon: '🎯', title: 'Tailored to your business', desc: 'We focus on what matters most to you' },
                  { icon: '💬', title: 'Live Q&A', desc: 'Ask anything about features, pricing, or setup' },
                  { icon: '🚀', title: 'Get started same day', desc: 'We\'ll help you set up your account on the call' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="text-sm font-semibold text-gray-700 mb-4">What we'll cover:</div>
                <ul className="space-y-2">
                  {[
                    'Inventory & stock management',
                    'GST invoice generation',
                    'Order & customer management',
                    'Production & quality control',
                    'Reports & analytics',
                    'User roles & permissions',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-blue-500">→</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
                  <p className="text-gray-500 mb-6">Thanks {form.name}! We'll reach out to <strong>{form.email}</strong> within 24 hours to schedule your demo.</p>
                  <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                    Start Free Trial Now →
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Book Your Free Demo</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          required
                          value={form.name}
                          onChange={e => set('name', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          required
                          value={form.phone}
                          onChange={e => set('phone', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Work Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
                      <input
                        required
                        value={form.company}
                        onChange={e => set('company', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Company Size</label>
                      <select
                        value={form.size}
                        onChange={e => set('size', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select size</option>
                        <option>1–10 employees</option>
                        <option>11–50 employees</option>
                        <option>51–200 employees</option>
                        <option>200+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">What are you looking to solve?</label>
                      <textarea
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Tell us about your current challenges..."
                      />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
                    >
                      {loading ? 'Submitting...' : 'Book My Free Demo →'}
                    </button>
                    <p className="text-xs text-gray-400 text-center">We'll respond within 24 hours. No spam, ever.</p>
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
