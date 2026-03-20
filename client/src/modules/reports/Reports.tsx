import React, { useEffect, useState } from 'react';
import { Spinner, EmptyState } from '../../components/UI';
import { formatCurrency, formatDate, exportToCSV, CGST_RATE, SGST_RATE } from '../../utils/helpers';
import api from '../../utils/api';

interface InventoryItem { id: string; code: string; name: string; category: string; unit: string; stock: number; minStock: number; costPrice: number; sellingPrice: number; stockValue: number; status: string; }

export function InventoryReport() {
  const [report, setReport] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/reports/inventory').then(r => { setReport(r.data.report); setGeneratedAt(r.data.generatedAt); }).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? report.filter(r => r.status === filter) : report;
  const totalValue = filtered.reduce((s, r) => s + r.stockValue, 0);
  const totalGST = filtered.reduce((s, r) => s + r.stockValue * (CGST_RATE + SGST_RATE), 0);

  const handleExport = () => exportToCSV(filtered.map(r => ({
    Code: r.code, Name: r.name, Category: r.category, Unit: r.unit,
    Stock: r.stock, 'Min Stock': r.minStock,
    'Cost Price (₹)': r.costPrice, 'Stock Value (₹)': r.stockValue,
    'GST 18% (₹)': +(r.stockValue * 0.18).toFixed(2),
    Status: r.status,
  })), 'inventory-report');

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Inventory Report</h1>{generatedAt && <p className="text-sm text-gray-500">Generated: {formatDate(generatedAt)}</p>}</div>
        <div className="flex gap-2">
          <select className="input w-36" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Items</option>
            <option value="LOW">Low Stock</option>
            <option value="OK">OK</option>
          </select>
          <button onClick={handleExport} className="btn-outline">📥 Export CSV</button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card-sm text-center"><p className="text-sm text-gray-500">Total Items</p><p className="text-2xl font-bold">{filtered.length}</p></div>
        <div className="card-sm text-center"><p className="text-sm text-gray-500">Stock Value</p><p className="text-xl font-bold text-green-600">{formatCurrency(totalValue)}</p></div>
        <div className="card-sm text-center"><p className="text-sm text-gray-500">GST on Stock (18%)</p><p className="text-xl font-bold text-orange-600">{formatCurrency(totalGST)}</p></div>
        <div className="card-sm text-center"><p className="text-sm text-gray-500">Low Stock Items</p><p className="text-2xl font-bold text-red-600">{filtered.filter(r => r.status === 'LOW').length}</p></div>
      </div>
      <div className="card">
        {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Code</th><th>Name</th><th>Category</th><th>Unit</th>
                  <th>Stock</th><th>Min Stock</th><th>Cost Price</th>
                  <th>Stock Value</th><th>CGST 9%</th><th>SGST 9%</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const cgst = +(r.stockValue * CGST_RATE).toFixed(2);
                  const sgst = +(r.stockValue * SGST_RATE).toFixed(2);
                  return (
                    <tr key={r.id}>
                      <td className="font-mono text-xs">{r.code}</td>
                      <td className="font-medium">{r.name}</td>
                      <td>{r.category}</td>
                      <td>{r.unit}</td>
                      <td className={`font-bold ${r.status === 'LOW' ? 'text-red-600' : 'text-green-600'}`}>{r.stock}</td>
                      <td>{r.minStock}</td>
                      <td>{formatCurrency(r.costPrice)}</td>
                      <td className="font-medium">{formatCurrency(r.stockValue)}</td>
                      <td className="text-orange-600">{formatCurrency(cgst)}</td>
                      <td className="text-orange-600">{formatCurrency(sgst)}</td>
                      <td><span className={`badge ${r.status === 'LOW' ? 'badge-red' : 'badge-green'}`}>{r.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function DayBook() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<{
    orders: { orderNo: string; customer: { name: string }; totalAmount: number; tax: number; status: string }[];
    purchaseOrders: { poNo: string; supplier: { name: string }; totalAmount: number; status: string }[];
    summary: { totalSales: number; totalPurchases: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = () => { setLoading(true); api.get(`/reports/daybook?date=${date}`).then(r => setData(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { fetch(); }, [date]);

  const handleExport = () => {
    if (!data) return;
    exportToCSV([
      ...data.orders.map(o => ({ Type: 'Sale', Reference: o.orderNo, Party: o.customer.name, 'Taxable (₹)': o.totalAmount - o.tax, 'GST (₹)': o.tax, 'Total (₹)': o.totalAmount, Status: o.status })),
      ...data.purchaseOrders.map(p => ({ Type: 'Purchase', Reference: p.poNo, Party: p.supplier.name, 'Taxable (₹)': p.totalAmount, 'GST (₹)': +(p.totalAmount * 0.18).toFixed(2), 'Total (₹)': +(p.totalAmount * 1.18).toFixed(2), Status: p.status })),
    ], `daybook-${date}`);
  };

  const totalGSTCollected = data?.orders.reduce((s, o) => s + (o.tax || 0), 0) || 0;
  const totalGSTPaid = data?.purchaseOrders.reduce((s, p) => s + +(p.totalAmount * 0.18).toFixed(2), 0) || 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Day Book</h1>
        <div className="flex gap-2">
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <button onClick={handleExport} className="btn-outline">📥 Export</button>
        </div>
      </div>

      {loading ? <Spinner /> : data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card text-center"><p className="text-sm text-gray-500">Total Sales</p><p className="text-xl font-bold text-green-600">{formatCurrency(data.summary.totalSales)}</p></div>
            <div className="card text-center"><p className="text-sm text-gray-500">Total Purchases</p><p className="text-xl font-bold text-red-600">{formatCurrency(data.summary.totalPurchases)}</p></div>
            <div className="card text-center"><p className="text-sm text-gray-500">GST Collected</p><p className="text-xl font-bold text-orange-600">{formatCurrency(totalGSTCollected)}</p></div>
            <div className="card text-center"><p className="text-sm text-gray-500">GST Paid (Input)</p><p className="text-xl font-bold text-orange-400">{formatCurrency(totalGSTPaid)}</p></div>
          </div>

          {/* GST Liability Summary */}
          <div className="card mb-6 bg-orange-50 border border-orange-100">
            <h2 className="font-semibold mb-3 text-orange-700">GST Liability Summary</h2>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div><p className="text-gray-500">Output GST (Collected)</p><p className="text-lg font-bold text-orange-600">{formatCurrency(totalGSTCollected)}</p></div>
              <div><p className="text-gray-500">Input GST (Paid)</p><p className="text-lg font-bold text-orange-400">{formatCurrency(totalGSTPaid)}</p></div>
              <div><p className="text-gray-500">Net GST Payable</p><p className={`text-lg font-bold ${totalGSTCollected - totalGSTPaid >= 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(Math.abs(totalGSTCollected - totalGSTPaid))}<span className="text-xs ml-1">{totalGSTCollected - totalGSTPaid >= 0 ? '(Payable)' : '(Refund)'}</span></p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-semibold mb-4">Sales Orders ({data.orders.length})</h2>
              {data.orders.length === 0 ? <EmptyState message="No sales today" /> : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Order No</th><th>Customer</th><th>Taxable</th><th>GST</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {data.orders.map((o, i) => (
                        <tr key={i}>
                          <td className="font-medium">{o.orderNo}</td>
                          <td>{o.customer.name}</td>
                          <td>{formatCurrency(o.totalAmount - (o.tax || 0))}</td>
                          <td className="text-orange-600">{formatCurrency(o.tax || 0)}</td>
                          <td className="font-medium">{formatCurrency(o.totalAmount)}</td>
                          <td><span className="badge badge-blue">{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="card">
              <h2 className="font-semibold mb-4">Purchase Orders ({data.purchaseOrders.length})</h2>
              {data.purchaseOrders.length === 0 ? <EmptyState message="No purchases today" /> : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>PO No</th><th>Supplier</th><th>Taxable</th><th>GST (18%)</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {data.purchaseOrders.map((p, i) => {
                        const gst = +(p.totalAmount * 0.18).toFixed(2);
                        return (
                          <tr key={i}>
                            <td className="font-medium">{p.poNo}</td>
                            <td>{p.supplier.name}</td>
                            <td>{formatCurrency(p.totalAmount)}</td>
                            <td className="text-orange-600">{formatCurrency(gst)}</td>
                            <td className="font-medium">{formatCurrency(p.totalAmount + gst)}</td>
                            <td><span className="badge badge-yellow">{p.status}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
