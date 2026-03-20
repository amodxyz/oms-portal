import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '📦', title: 'Inventory & Items', desc: 'Manage stock, categories, BOM, and raw materials in real-time.' },
  { icon: '🛒', title: 'Sales & Orders', desc: 'Create orders, generate GST invoices, and track customers.' },
  { icon: '🏭', title: 'Production', desc: 'Schedule workflows, allocate resources, and monitor progress.' },
  { icon: '🚚', title: 'Purchasing', desc: 'Manage suppliers and purchase orders with GST compliance.' },
  { icon: '✅', title: 'Quality Control', desc: 'Run inspections and generate QC reports effortlessly.' },
  { icon: '📊', title: 'Reports & Analytics', desc: 'Day book, inventory reports, GST liability summaries.' },
  { icon: '🚛', title: 'Logistics', desc: 'Track dispatches, manage transporters, and live tracking.' },
  { icon: '💳', title: 'Billing & Plans', desc: 'Subscription management with CGST/SGST breakdown.' },
];

const plans = [
  { name: 'Starter', price: '₹29', period: '/mo', color: 'border-gray-200', badge: '', features: ['5 Users', '1,000 Orders/mo', 'Basic Reports', 'Email Support'] },
  { name: 'Professional', price: '₹79', period: '/mo', color: 'border-blue-500', badge: 'Most Popular', features: ['25 Users', '10,000 Orders/mo', 'Advanced Analytics', 'GST Reports', 'Priority Support'] },
  { name: 'Enterprise', price: '₹199', period: '/mo', color: 'border-purple-500', badge: 'Best Value', features: ['Unlimited Users', 'Unlimited Orders', 'Custom Reports', 'API Access', 'Dedicated Support'] },
];

const stats = [
  { value: 'GST Ready', label: 'Compliant' },
  { value: 'Multi-tenant', label: 'Architecture' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">O</div>
            <span className="font-bold text-gray-900 text-lg">OMS Portal</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
            GST-Ready Order Management
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Run Your Business<br />
            <span className="text-blue-600">Smarter & Faster</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            A complete Order Management System with GST compliance, inventory tracking, production scheduling, and real-time analytics — built for Indian businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300">
              Get Started →
            </button>
            <button onClick={() => navigate('/login')} className="bg-white text-gray-700 px-8 py-4 rounded-xl text-base font-semibold border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all">
              Sign In
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">No credit card required</p>
        </div>

        {/* Hero visual */}
        <div className="max-w-5xl mx-auto mt-16 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-gray-400">OMS Portal — Dashboard</span>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: '1,284', color: 'bg-blue-50 text-blue-700', icon: '🛒' },
              { label: 'Revenue', value: '₹24.6L', color: 'bg-green-50 text-green-700', icon: '💰' },
              { label: 'GST Payable', value: '₹3.2L', color: 'bg-orange-50 text-orange-700', icon: '📋' },
              { label: 'Stock Items', value: '342', color: 'bg-purple-50 text-purple-700', icon: '📦' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-xl p-4`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs opacity-70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 grid grid-cols-3 gap-3">
            {['Pending Orders: 23', 'Low Stock Alerts: 5', 'Invoices Due: 8'].map(t => (
              <div key={t} className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 text-center">{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-white">{s.value}</div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">One platform to manage your entire business operations — from procurement to delivery.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GST Highlight */}
      <section className="py-16 px-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-y border-orange-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">GST Compliant</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-4">Built for Indian Tax Laws</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              {['CGST 9% + SGST 9% for intra-state transactions', 'IGST 18% for inter-state transactions', 'Auto GST calculation on all orders & invoices', 'GST liability summary in Day Book reports', 'GST-ready billing with CGST/SGST breakdown'].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
            <div className="text-sm font-semibold text-gray-700 mb-4">GST Invoice Summary</div>
            {[
              { label: 'Subtotal', value: '₹1,00,000' },
              { label: 'CGST (9%)', value: '₹9,000' },
              { label: 'SGST (9%)', value: '₹9,000' },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-sm py-2 border-b border-gray-50">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-medium text-gray-800">{r.value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm py-3 font-bold text-gray-900">
              <span>Total</span>
              <span className="text-blue-600">₹1,18,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Simple, Transparent Pricing</h2>
            <p className="text-gray-500">All plans include GST compliance, inventory management, and 24/7 support.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map(p => (
              <div key={p.name} className={`relative rounded-2xl border-2 ${p.color} p-8 flex flex-col ${p.badge === 'Most Popular' ? 'shadow-xl scale-105' : ''}`}>
                {p.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${p.badge === 'Most Popular' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                    {p.badge}
                  </span>
                )}
                <div className="text-lg font-bold text-gray-900 mb-1">{p.name}</div>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
                  <span className="text-gray-400 mb-1">{p.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/register')} className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${p.badge === 'Most Popular' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to streamline your operations?</h2>
          <p className="text-blue-200 mb-8">Manage orders, inventory, and GST compliance with OMS Portal — built for Indian businesses.</p>
          <button onClick={() => navigate('/register')} className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-base hover:bg-blue-50 transition-all shadow-lg">
            Get Started →
          </button>
          <p className="text-blue-300 text-xs mt-4">Create your organisation in seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">O</div>
            <span className="text-white font-semibold">OMS Portal</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} OMS Portal. Built for Indian businesses.</p>
          <div className="flex gap-6 text-sm">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
