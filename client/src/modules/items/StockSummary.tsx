import React, { useEffect, useState } from 'react';
import { StockSummary } from '../../types';
import { Badge, SearchInput, Spinner, EmptyState } from '../../components/UI';
import { exportToCSV } from '../../utils/helpers';
import api from '../../utils/api';

export default function StockSummaryPage() {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => { api.get('/items/summary').then(r => setSummary(r.data)).finally(() => setLoading(false)); }, []);

  const filtered = summary.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stock Summary</h1>
        <button onClick={() => exportToCSV(filtered.map(s => ({ Code: s.code, Name: s.name, Category: s.category, Unit: s.unit, Stock: s.stock, 'Min Stock': s.minStock, Status: s.status })), 'stock-summary')} className="btn-outline">📥 Export CSV</button>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search items..." />
          <select className="input w-36" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="LOW">Low Stock</option>
            <option value="OK">OK</option>
          </select>
        </div>
        {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Unit</th><th>Current Stock</th><th>Min Stock</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td className="font-mono text-xs">{s.code}</td>
                    <td className="font-medium">{s.name}</td>
                    <td>{s.category}</td>
                    <td>{s.unit}</td>
                    <td className={`font-bold ${s.status === 'LOW' ? 'text-red-600' : 'text-green-600'}`}>{s.stock}</td>
                    <td>{s.minStock}</td>
                    <td><Badge status={s.status} /></td>
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
