import React from 'react';
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
          <button onClick={() => navigate('/features')} className="text-blue-600 font-medium">Features</button>
          <button onClick={() => navigate('/pricing')} className="hover:text-blue-600 transition-colors">Pricing</button>
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

const modules = [
  {
    icon: '📦',
    title: 'Inventory & Items',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-100 text-blue-600',
    features: [
      'Create and manage products with SKU codes',
      'Category-wise item organisation',
      'Real-time stock tracking with movement history',
      'Low stock alerts and minimum stock thresholds',
      'Bill of Materials (BOM) management',
      'Raw material tracking and consumption',
      'Multi-location stock management',
      'Stock summary and valuation reports',
    ],
  },
  {
    icon: '🛒',
    title: 'Sales & Orders',
    color: 'bg-green-50 border-green-100',
    iconBg: 'bg-green-100 text-green-600',
    features: [
      'Create and manage sales orders',
      'Auto-generate GST invoices (CGST/SGST/IGST)',
      'Customer management with history',
      'Order status tracking (Pending → Delivered)',
      'Discount and tax management',
      'Invoice payment tracking (Paid/Unpaid/Partial)',
      'Order analytics and revenue reports',
      'Bulk order processing',
    ],
  },
  {
    icon: '🚚',
    title: 'Purchasing',
    color: 'bg-orange-50 border-orange-100',
    iconBg: 'bg-orange-100 text-orange-600',
    features: [
      'Supplier management and profiles',
      'Purchase order creation and tracking',
      'PO status management (Draft → Received)',
      'Partial receipt tracking',
      'Supplier-wise purchase history',
      'GST-compliant purchase records',
      'Expected delivery date tracking',
      'Purchase cost analysis',
    ],
  },
  {
    icon: '🏭',
    title: 'Production',
    color: 'bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-100 text-purple-600',
    features: [
      'Production order management',
      'Workflow scheduling and planning',
      'Resource allocation (machines, labour)',
      'Priority-based production queue',
      'Start/end date tracking',
      'Production status monitoring',
      'Assigned operator tracking',
      'Production schedule calendar view',
    ],
  },
  {
    icon: '✅',
    title: 'Quality Control',
    color: 'bg-teal-50 border-teal-100',
    iconBg: 'bg-teal-100 text-teal-600',
    features: [
      'Inspection creation and management',
      'Inbound and outbound QC checks',
      'Parameter-wise inspection items',
      'Pass/Fail tracking per parameter',
      'Inspector assignment',
      'QC reports generation',
      'Reference linking to orders/POs',
      'Inspection history and audit trail',
    ],
  },
  {
    icon: '🚛',
    title: 'Logistics',
    color: 'bg-yellow-50 border-yellow-100',
    iconBg: 'bg-yellow-100 text-yellow-600',
    features: [
      'Transporter management',
      'Dispatch creation linked to orders',
      'Tracking number management',
      'Delivery status tracking',
      'Dispatch date and delivery date',
      'Transporter-wise dispatch history',
      'Live tracking page',
      'Dispatch reports',
    ],
  },
  {
    icon: '📊',
    title: 'Reports & Analytics',
    color: 'bg-indigo-50 border-indigo-100',
    iconBg: 'bg-indigo-100 text-indigo-600',
    features: [
      'Day Book with daily transaction summary',
      'GST liability report (CGST/SGST/IGST)',
      'Inventory valuation report',
      'Stock movement history',
      'Revenue and sales analytics',
      'Order status breakdown',
      'Customer-wise sales report',
      'Export-ready data tables',
    ],
  },
  {
    icon: '🔐',
    title: 'Security & Access',
    color: 'bg-red-50 border-red-100',
    iconBg: 'bg-red-100 text-red-600',
    features: [
      'Role-based access control (Admin/Manager/Staff)',
      'JWT authentication with refresh tokens',
      'Email verification on signup',
      'Password reset via email',
      'Session management across devices',
      'Tenant data isolation (multi-tenancy)',
      'Account suspension controls',
      'Audit-ready activity structure',
    ],
  },
];

export default function FeaturesPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 text-center">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Complete Feature Set
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Everything Your Business Needs
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          8 powerful modules covering every aspect of your operations — from raw materials to customer delivery.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Start Free Trial →
          </button>
          <button onClick={() => navigate('/book-demo')} className="bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all">
            Book a Demo
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-600 py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '8', label: 'Modules' },
            { value: 'GST Ready', label: 'Compliant' },
            { value: 'Multi-tenant', label: 'Architecture' },
            { value: '99.9%', label: 'Uptime' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-white">{s.value}</div>
              <div className="text-blue-200 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto space-y-8">
          {modules.map((mod, i) => (
            <div key={mod.title} className={`rounded-2xl border p-8 ${mod.color}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${mod.iconBg}`}>
                  {mod.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{mod.title}</h2>
                  <p className="text-sm text-gray-500">Module {i + 1} of {modules.length}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {mod.features.map(f => (
                  <div key={f} className="flex items-start gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-white">
                    <span className="text-green-500 mt-0.5 text-sm">✓</span>
                    <span className="text-sm text-gray-700">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GST Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-orange-50 to-yellow-50 border-y border-orange-100">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">GST Compliant</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-8">Built for Indian Tax Laws</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Intra-State', tax: 'CGST 9% + SGST 9%', desc: 'Auto-calculated on all intra-state orders and invoices' },
              { title: 'Inter-State', tax: 'IGST 18%', desc: 'Automatically applied for inter-state transactions' },
              { title: 'Day Book', tax: 'GST Summary', desc: 'Daily GST liability report with CGST/SGST/IGST breakdown' },
            ].map(g => (
              <div key={g.title} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm">
                <div className="text-xs font-semibold text-orange-600 uppercase mb-2">{g.title}</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{g.tax}</div>
                <p className="text-sm text-gray-500">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-800 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
        <p className="text-blue-200 mb-8">Join businesses already managing their operations with OMS Portal.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/register')} className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg">
            Start Free Trial →
          </button>
          <button onClick={() => navigate('/pricing')} className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-400 transition-all border border-blue-400">
            View Pricing
          </button>
        </div>
      </section>

      <LandingChatbot />
      <Footer />
    </div>
  );
}
