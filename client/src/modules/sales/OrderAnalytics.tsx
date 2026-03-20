import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { StatCard, Spinner } from '../../components/UI';
import { formatCurrency, formatDate } from '../../utils/helpers';
import api from '../../utils/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function OrderAnalytics() {
  const [data, setData] = useState<{ totalOrders: number; totalRevenue: number; statusCounts: { status: string; _count: number }[]; recentOrders: { orderNo: string; totalAmount: number; customer: { name: string }; orderDate: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/sales/orders/analytics').then(r => setData(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const pieData = data.statusCounts.map(s => ({ name: s.status, value: s._count }));
  const barData = data.recentOrders.map(o => ({ name: o.orderNo, amount: o.totalAmount }));

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Order Analytics</h1></div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Orders" value={data.totalOrders} icon="📋" color="bg-blue-100" />
        <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon="💰" color="bg-green-100" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Order Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card mt-6">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <div className="table-container">
          <table>
            <thead><tr><th>Order No</th><th>Customer</th><th>Date</th><th>Amount</th></tr></thead>
            <tbody>
              {data.recentOrders.map((o, i) => (
                <tr key={i}><td className="font-medium">{o.orderNo}</td><td>{o.customer.name}</td><td>{formatDate(o.orderDate)}</td><td>{formatCurrency(o.totalAmount)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
