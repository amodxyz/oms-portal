import React, { useState, useEffect } from 'react';
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
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">O</div>
          <span className="text-white font-semibold">OMS Portal</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} OMS Portal by Digital AdWords. GST-Ready OMS for Indian SMEs.</p>
        <div className="flex gap-6 text-sm">
          <a href="/features" className="hover:text-white transition-colors">OMS Features</a>
          <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 4999,
    yearlyPrice: 49990,
    color: 'border-green-200',
    headerColor: 'bg-green-50',
    textColor: 'text-green-700',
    badge: '',
    desc: 'Suitable For: Small Businesses',
    features: [
      'Up to 3 Users', 'Order Management', 'Customer Management', 'Product Management', 'Invoice Generation', 'Basic Reports', 'Email Support', '2 GB Cloud Storage'
    ],
    ctaText: 'Start Free Trial',
  },
  {
    name: 'Standard',
    monthlyPrice: 7999,
    yearlyPrice: 79990,
    color: 'border-blue-500',
    headerColor: 'bg-blue-600',
    textColor: 'text-white',
    badge: 'Most Popular',
    desc: 'Suitable For: Growing Wholesalers & Distributors',
    features: [
      'Everything in Starter', 'Up to 10 Users', 'Inventory Management', 'Purchase & Sales Orders', 'GST Billing', 'WhatsApp Notifications', 'Advanced Reports', 'Role-Based Access', '10 GB Cloud Storage', 'Priority Support'
    ],
    ctaText: 'Get Started',
  },
  {
    name: 'Professional',
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    color: 'border-purple-200',
    headerColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    badge: '',
    desc: 'Suitable For: Large Retailers & Service Businesses',
    features: [
      'Everything in Standard', 'Up to 25 Users', 'Multi-Warehouse', 'Vendor Management', 'Barcode Support', 'Approval Workflow', 'Dashboard Analytics', 'API Access', 'Custom Reports', '50 GB Storage', 'Phone & WhatsApp Support'
    ],
    ctaText: 'Choose Professional',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Contact Sales',
    yearlyPrice: 'Contact Sales',
    color: 'border-orange-200',
    headerColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    badge: '',
    desc: 'Suitable For: Large Enterprises & Custom Needs',
    features: [
      'Unlimited Users', 'Multi-Company', 'Multi-Branch', 'White Label', 'Custom Integrations', 'Dedicated Server', 'Mobile App', 'AI Automation', 'Dedicated Account Manager', 'SLA Support', 'Training & Onboarding'
    ],
    ctaText: 'Contact Sales',
  },
];

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. There are no long-term lock-in contracts.' },
  { q: 'Is GST included in the pricing shown?', a: 'No, the prices shown are exclusive of 18% GST. A valid GST invoice will be provided for your business.' },
  { q: 'Can I upgrade later?', a: 'Absolutely! You can upgrade from Starter to Standard or Professional as your business grows without any data loss.' },
  { q: 'Is training included?', a: 'We provide free onboarding and setup assistance. The Enterprise plan includes dedicated training sessions for your entire team.' },
  { q: 'Do you provide customer support?', a: 'Yes, all plans include support. Starter includes Email support, Standard gets Priority Support, Professional gets Phone & WhatsApp support, and Enterprise gets a Dedicated Account Manager.' },
  { q: 'Can I migrate data from Excel?', a: 'Yes, we provide free data migration services and Excel upload options for products, customers, and inventory.' },
  { q: 'Do you offer custom pricing?', a: 'Yes, our Enterprise plan is completely customizable based on your unique business needs and integrations.' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // SEO Optimization
  useEffect(() => {
    document.title = 'Affordable Order Management Software Pricing in India | Digital AdWords OMS';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Choose the best Order Management Software plan for your business. Affordable pricing starting at ₹499/month with GST billing, inventory management, reporting, and a 15-day free trial.');

    const scriptId = 'pricing-schema';
    let schemaScript = document.getElementById(scriptId);
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = scriptId;
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "name": "Digital AdWords OMS",
          "description": "Order Management Software for Indian SMEs",
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "499",
            "priceCurrency": "INR",
            "offerCount": "3"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        }
      ]
    });

    return () => {
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* Hero & Toggle */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Redesigned to empower Indian SMEs, manufacturers, wholesalers, and retailers. 
          Choose the plan that fits your business scale.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className={`text-base font-semibold ${!yearly ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
            <button
              onClick={() => setYearly(y => !y)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${yearly ? 'bg-blue-600' : 'bg-gray-300'}`}
              aria-label="Toggle Billing Cycle"
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${yearly ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`text-base font-semibold ${yearly ? 'text-gray-900' : 'text-gray-400'}`}>Yearly</span>
          </div>
          {yearly && <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold shadow-sm animate-pulse">Save 17% (2 Months Free)</span>}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-center">
          {plans.map(p => (
            <div key={p.name} className={`relative bg-white rounded-2xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl flex flex-col h-full ${p.color} ${p.badge === 'Most Popular' ? 'shadow-lg scale-100 xl:scale-105 z-10' : ''}`}>
              {p.badge && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    {p.badge}
                  </span>
                </div>
              )}
              
              <div className={`p-6 rounded-t-xl ${p.headerColor}`}>
                <h3 className={`text-2xl font-bold ${p.textColor}`}>{p.name}</h3>
                <p className="text-sm mt-2 font-medium opacity-90">{p.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  {typeof p.monthlyPrice === 'number' ? (
                    <>
                      <span className="text-4xl font-extrabold text-gray-900">₹{yearly ? p.yearlyPrice : p.monthlyPrice}</span>
                      <span className="text-gray-600 font-medium">/{yearly ? 'yr' : 'mo'}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-extrabold text-gray-900">{p.monthlyPrice}</span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                      <span className="text-blue-500 font-bold text-lg leading-none">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    p.badge === 'Most Popular' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md' 
                      : 'bg-white text-blue-700 border-2 border-blue-100 hover:border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {p.ctaText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Free Trial Banner */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">15-Day Free Trial</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-blue-100 font-medium">
            <span className="flex items-center gap-2">✅ No Credit Card Required</span>
            <span className="flex items-center gap-2">✅ Full Feature Access</span>
            <span className="flex items-center gap-2">✅ Free Setup Assistance</span>
            <span className="flex items-center gap-2">✅ Free Data Migration</span>
            <span className="flex items-center gap-2">✅ Cancel Anytime</span>
          </div>
          <button onClick={() => navigate('/register')} className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:scale-105">
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Compare Plans & Features</h2>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 text-gray-900 border-b-2 border-gray-200">
                  <th className="p-4 font-bold w-1/5">Feature</th>
                  <th className="p-4 font-bold text-center text-green-700">Starter</th>
                  <th className="p-4 font-bold text-center text-blue-700">Standard</th>
                  <th className="p-4 font-bold text-center text-purple-700">Professional</th>
                  <th className="p-4 font-bold text-center text-orange-700">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: 'Users', values: ['3', '10', '25', 'Unlimited'] },
                  { feature: 'Order Management', values: ['✅', '✅', '✅', '✅'] },
                  { feature: 'Inventory', values: ['❌', '✅', '✅', '✅'] },
                  { feature: 'GST Billing', values: ['✅', '✅', '✅', '✅'] },
                  { feature: 'Reports', values: ['Basic', 'Advanced', 'Custom', 'Enterprise'] },
                  { feature: 'API Access', values: ['❌', '❌', '✅', '✅'] },
                  { feature: 'Multi Branch', values: ['❌', '❌', '✅', '✅'] },
                  { feature: 'AI Automation', values: ['❌', '❌', 'Optional', 'Included'] },
                  { feature: 'Support', values: ['Email', 'Priority', 'Phone', 'Dedicated'] },
                ].map((row, i) => (
                  <tr key={row.feature} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="p-4 font-semibold text-gray-700">{row.feature}</td>
                    {row.values.map((val, idx) => (
                      <td key={idx} className="p-4 text-center font-medium text-gray-600">
                        {val === '✅' ? <span className="text-green-500 text-lg font-bold">✓</span> : val === '❌' ? <span className="text-gray-300 text-lg font-bold">−</span> : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add-On Pricing */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Power-Ups & Add-Ons</h2>
          <p className="text-center text-gray-600 mb-12">Customize your plan by adding exactly what you need.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Extra User', price: '₹99/mo', icon: '👤' },
              { name: 'Extra Branch', price: '₹499/mo', icon: '🏢' },
              { name: 'WhatsApp API', price: '₹999/mo', icon: '💬' },
              { name: 'Mobile App', price: '₹999/mo', icon: '📱' },
              { name: 'AI Assistant', price: '₹999/mo', icon: '🤖' },
              { name: 'API Access', price: '₹499/mo', icon: '🔌' },
              { name: 'Extra Storage (50 GB)', price: '₹299/mo', icon: '💾' },
            ].map(addon => (
              <div key={addon.name} className="p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all text-center flex flex-col items-center">
                <span className="text-3xl mb-3">{addon.icon}</span>
                <h4 className="font-bold text-gray-900 mb-1">{addon.name}</h4>
                <p className="text-blue-600 font-bold">{addon.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 text-center">
            {[
              { label: 'Secure Cloud Hosting', icon: '☁️' },
              { label: 'SSL Secured', icon: '🔒' },
              { label: '99.9% Uptime', icon: '⚡' },
              { label: 'GST Ready', icon: '🇮🇳' },
              { label: 'Made for India', icon: '🤝' },
              { label: 'Free Onboarding', icon: '🎓' },
              { label: 'Regular Updates', icon: '🔄' },
            ].map(trust => (
              <div key={trust.label} className="flex flex-col items-center">
                <span className="text-2xl mb-2">{trust.icon}</span>
                <span className="text-xs font-semibold text-gray-400">{trust.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  <span className={`text-blue-500 font-bold transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 border-t border-gray-100 pt-4 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-700 to-blue-900 text-center text-white">
        <h2 className="text-4xl font-extrabold mb-6">Ready to Simplify Your Business Operations?</h2>
        <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
          Manage orders, inventory, billing, and customer relationships with one powerful cloud-based OMS.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigate('/register')} className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl">
            Start Free Trial
          </button>
          <button onClick={() => navigate('/book-demo')} className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all">
            Book a Live Demo
          </button>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 w-full p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <button onClick={() => navigate('/register')} className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-bold shadow-md hover:bg-blue-700">
          Start Free Trial
        </button>
      </div>

      <LandingChatbot />
      <Footer />
    </div>
  );
}
