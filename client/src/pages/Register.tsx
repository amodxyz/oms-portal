import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ orgName: '', email: '', password: '', phone: '', gstin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orgName || !form.email || !form.password) return setError('Organisation name, email and password are required');
    setLoading(true); setError('');
    try {
      const result = await register(form.orgName, form.email, form.password, form.phone, form.gstin);
      navigate('/dashboard', { state: { notice: result.message } });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">O</div>
          <h1 className="text-2xl font-bold text-gray-900">Create your Organisation</h1>
          <p className="text-gray-500 text-sm mt-1">Set up your OMS workspace in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Organisation Name <span className="text-red-500">*</span></label>
            <input className="input" placeholder="e.g. Acme Manufacturing" value={form.orgName} onChange={set('orgName')} required />
          </div>
          <div>
            <label className="label">Admin Email <span className="text-red-500">*</span></label>
            <input className="input" type="email" placeholder="admin@yourcompany.com" value={form.email} onChange={set('email')} required />
          </div>
          <div>
            <label className="label">Password <span className="text-red-500">*</span></label>
            <input className="input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label">GSTIN</label>
              <input className="input" placeholder="27AAPFU0939F1ZV" value={form.gstin} onChange={set('gstin')} />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? 'Creating workspace...' : 'Create Organisation →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-3">
          By registering, you agree to our{' '}
          <Link to="/terms" className="text-blue-500 hover:underline">Terms of Use</Link>{' '}and{' '}
          <Link to="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
