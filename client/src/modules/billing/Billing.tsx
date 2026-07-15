import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard, Spinner, Badge, Modal, FormField, EmptyState, ConfirmDialog } from '../../components/UI';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../utils/api';

// ── Types ──────────────────────────────────────────────
interface Plan {
  id: string; name: string; description?: string; price: number;
  billingCycle: string; features: string[]; isActive: boolean;
  _count?: { subscriptions: number };
}
interface BillingRecord {
  id: string; invoiceNo: string; amount: number; tax: number; total: number;
  status: string; dueDate: string; paidDate?: string; paymentMethod?: string;
  notes?: string; createdAt: string;
  subscription: { id: string; plan: Plan };
}
interface Subscription {
  id: string; planId: string; plan: Plan; status: string;
  startDate: string; endDate?: string; autoRenew: boolean;
  billingRecords?: BillingRecord[];
}
interface Summary {
  totalRevenue: number; unpaidCount: number; activeSubscriptions: number;
  recentRecords: BillingRecord[];
}

// ── Overview ───────────────────────────────────────────
export function BillingOverview() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/billing/summary').then(r => setSummary(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!summary) return null;

  const chartData = summary.recentRecords.map(r => ({
    name: r.invoiceNo.replace('BILL-', ''),
    amount: r.total,
    status: r.status,
  }));

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Billing Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={formatCurrency(summary.totalRevenue)} icon="💰" color="bg-green-100" />
        <StatCard label="Active Subscriptions" value={summary.activeSubscriptions} icon="✅" color="bg-blue-100" />
        <StatCard label="Unpaid Invoices" value={summary.unpaidCount} icon="⚠️" color={summary.unpaidCount > 0 ? 'bg-red-100' : 'bg-gray-100'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold mb-4">Recent Billing Activity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2 text-sm">
            {[
              { label: 'View All Plans', href: '/billing/plans', icon: '📋' },
              { label: 'Manage Subscriptions', href: '/billing/subscriptions', icon: '🔄' },
              { label: 'Billing Records', href: '/billing/records', icon: '🧾' },
            ].map(a => (
              <a key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                <span>{a.icon}</span>{a.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Recent Invoices</h2>
        {summary.recentRecords.length === 0 ? <EmptyState message="No billing records yet" /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Invoice No</th><th>Plan</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {summary.recentRecords.map(r => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-medium">{r.invoiceNo}</td>
                    <td>{r.subscription.plan.name}</td>
                    <td className="font-medium">{formatCurrency(r.total)}</td>
                    <td>{formatDate(r.dueDate)}</td>
                    <td><Badge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Plans ──────────────────────────────────────────────
export function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribePlanId, setSubscribePlanId] = useState<string | null>(null);

  const fetch = () => api.get('/billing/plans').then(r => setPlans(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleSubscribe = async () => {
    if (!subscribePlanId) return;
    try {
      await api.post('/billing/subscriptions', { planId: subscribePlanId, autoRenew: true });
      window.location.href = '/billing/subscriptions';
    } catch (e) {
      console.error(e);
    }
  };

  const cycleLabel = (c: string) => c === 'YEARLY' ? '/yr' : '/mo';
  const activePlans = plans.filter(p => p.isActive);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Available SaaS Plans</h1>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePlans.map(plan => (
            <div key={plan.id} className="card border-2 border-blue-100 flex flex-col hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.description && <p className="text-sm text-gray-500 mt-1">{plan.description}</p>}
                </div>
              </div>

              <div className="my-4">
                <span className="text-4xl font-bold text-blue-600">{formatCurrency(plan.price)}</span>
                <span className="text-gray-400 font-medium">{cycleLabel(plan.billingCycle)}</span>
              </div>

              <ul className="space-y-3 flex-1 mb-6 mt-4">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold">✓</span><span>{f}</span>
                  </li>
                ))}
              </ul>

              <button className="btn-primary w-full py-3 text-sm font-semibold" onClick={() => setSubscribePlanId(plan.id)}>
                Subscribe / Buy
              </button>
            </div>
          ))}
          {activePlans.length === 0 && <div className="col-span-3"><EmptyState message="No SaaS plans available at the moment." /></div>}
        </div>
      )}

      {subscribePlanId && (
        <ConfirmDialog
          message={`Are you sure you want to subscribe to ${plans.find(p => p.id === subscribePlanId)?.name}? An invoice will be generated for payment.`}
          onConfirm={handleSubscribe}
          onCancel={() => setSubscribePlanId(null)}
        />
      )}
    </div>
  );
}

// ── Subscriptions ──────────────────────────────────────
export function Subscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/billing/subscriptions');
    setSubs(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCancel = async () => {
    if (!cancelId) return;
    await api.delete(`/billing/subscriptions/${cancelId}`);
    setCancelId(null); fetch();
  };

  const statusColor = (s: string) => s === 'ACTIVE' ? 'badge-green' : s === 'CANCELLED' ? 'badge-red' : 'badge-yellow';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Subscriptions</h1>
      </div>

      <div className="card">
        {loading ? <Spinner /> : subs.length === 0 ? <EmptyState message="You have no active subscriptions" /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Plan</th><th>Price</th><th>Cycle</th><th>Start Date</th><th>End Date</th><th>Auto Renew</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {subs.map(sub => (
                  <tr key={sub.id}>
                    <td className="font-medium text-blue-700">{sub.plan.name}</td>
                    <td className="font-semibold">{formatCurrency(sub.plan.price)}</td>
                    <td><span className="badge badge-blue">{sub.plan.billingCycle}</span></td>
                    <td>{formatDate(sub.startDate)}</td>
                    <td>{sub.endDate ? formatDate(sub.endDate) : '—'}</td>
                    <td>
                      <span className={`badge ${sub.autoRenew ? 'badge-green' : 'badge-gray'}`}>
                        {sub.autoRenew ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td><span className={`badge ${statusColor(sub.status)}`}>{sub.status}</span></td>
                    <td>
                      {sub.status === 'ACTIVE' && (
                        <button onClick={() => setCancelId(sub.id)} className="text-red-600 hover:underline text-xs font-medium">Cancel Plan</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {cancelId && <ConfirmDialog message="Cancel this subscription? This cannot be undone." onConfirm={handleCancel} onCancel={() => setCancelId(null)} />}
    </div>
  );
}

// ── Billing Records ────────────────────────────────────
export function BillingRecords() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [payModal, setPayModal] = useState<BillingRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get(`/billing/records${status ? `?status=${status}` : ''}`);
    setRecords(data); setLoading(false);
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal) return;
    await api.put(`/billing/records/${payModal.id}/pay`, { paymentMethod });
    setPayModal(null); fetch();
  };

  const totalUnpaid = records.filter(r => r.status === 'UNPAID').reduce((s, r) => s + r.total, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Billing Records</h1>
        <select className="input w-36" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {totalUnpaid > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-700">Outstanding Balance</p>
              <p className="text-sm text-red-600">You have unpaid invoices totalling {formatCurrency(totalUnpaid)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? <Spinner /> : records.length === 0 ? <EmptyState message="No billing records found" /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Invoice No</th><th>Plan</th><th>Taxable Amt</th><th>CGST 9%</th><th>SGST 9%</th><th>Total</th><th>Due Date</th><th>Paid Date</th><th>Method</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="font-mono text-xs font-medium">{r.invoiceNo}</td>
                    <td>{r.subscription.plan.name}</td>
                    <td>{formatCurrency(r.amount)}</td>
                    <td className="text-orange-600">{formatCurrency(+(r.amount * 0.09).toFixed(2))}</td>
                    <td className="text-orange-600">{formatCurrency(+(r.amount * 0.09).toFixed(2))}</td>
                    <td className="font-bold">{formatCurrency(r.total)}</td>
                    <td className={new Date(r.dueDate) < new Date() && r.status === 'UNPAID' ? 'text-red-600 font-medium' : ''}>{formatDate(r.dueDate)}</td>
                    <td>{r.paidDate ? formatDate(r.paidDate) : '—'}</td>
                    <td>{r.paymentMethod ? <span className="badge badge-gray">{r.paymentMethod.replace('_', ' ')}</span> : '—'}</td>
                    <td><Badge status={r.status} /></td>
                    <td>
                      {r.status === 'UNPAID' && (
                        <button onClick={() => setPayModal(r)} className="btn-success text-xs py-1 px-2">💳 Pay</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {payModal && (
        <Modal title={`Pay Invoice — ${payModal.invoiceNo}`} onClose={() => setPayModal(null)}>
          <form onSubmit={handlePay}>
            <div className="modal-body space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-medium">{payModal.subscription.plan.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span>{formatCurrency(payModal.amount)}</span></div>
                <div className="flex justify-between text-orange-600"><span className="text-gray-500">CGST (9%)</span><span>{formatCurrency(+(payModal.amount * 0.09).toFixed(2))}</span></div>
                <div className="flex justify-between text-orange-600"><span className="text-gray-500">SGST (9%)</span><span>{formatCurrency(+(payModal.amount * 0.09).toFixed(2))}</span></div>
                <div className="flex justify-between text-orange-500 text-xs"><span>Total GST (18%)</span><span>{formatCurrency(payModal.tax)}</span></div>
                <div className="flex justify-between font-bold border-t pt-2"><span>Total Due</span><span className="text-blue-600">{formatCurrency(payModal.total)}</span></div>
              </div>
              <FormField label="Payment Method">
                <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="CASH">Cash</option>
                </select>
              </FormField>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setPayModal(null)}>Cancel</button>
              <button type="submit" className="btn-success">Confirm Payment</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
