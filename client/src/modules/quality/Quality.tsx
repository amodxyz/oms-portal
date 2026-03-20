import React, { useEffect, useState, useCallback } from 'react';
import { Inspection } from '../../types';
import { Badge, Spinner, EmptyState, FormField, Modal } from '../../components/UI';
import { formatDate, exportToCSV } from '../../utils/helpers';
import api from '../../utils/api';

export function InspectionsList() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'INCOMING', inspector: '', date: new Date().toISOString().split('T')[0], notes: '', items: [{ parameter: '', expected: '', actual: '', remarks: '' }] });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get(`/quality/inspections${status ? `?status=${status}` : ''}`);
    setInspections(data); setLoading(false);
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { parameter: '', expected: '', actual: '', remarks: '' }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i: number, k: string, v: string) => setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/quality/inspections', form);
    setShowModal(false); fetch();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await api.put(`/quality/inspections/${id}`, { status: newStatus });
    fetch();
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inspections</h1>
        <div className="flex gap-2">
          <select className="input w-36" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            {['PENDING', 'PASSED', 'FAILED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowModal(true)}>➕ New Inspection</button>
        </div>
      </div>
      <div className="card">
        {loading ? <Spinner /> : inspections.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Ref No</th><th>Type</th><th>Inspector</th><th>Date</th><th>Items</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {inspections.map(ins => (
                  <tr key={ins.id}>
                    <td className="font-medium">{ins.refNo}</td>
                    <td>{ins.type}</td>
                    <td>{ins.inspector}</td>
                    <td>{formatDate(ins.date)}</td>
                    <td>{ins.items.length}</td>
                    <td><Badge status={ins.status} /></td>
                    <td>
                      <select className="input text-xs py-1 w-28" value={ins.status} onChange={e => updateStatus(ins.id, e.target.value)}>
                        {['PENDING', 'PASSED', 'FAILED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="New Inspection" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField label="Type">
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {['INCOMING', 'IN_PROCESS', 'FINAL', 'OUTGOING'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Inspector" required><input className="input" value={form.inspector} onChange={e => setForm(f => ({ ...f, inspector: e.target.value }))} required /></FormField>
                <FormField label="Date"><input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></FormField>
              </div>
              <FormField label="Notes"><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></FormField>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="label mb-0">Inspection Items</label><button type="button" className="btn-outline text-xs py-1" onClick={addItem}>+ Add</button></div>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                    <input className="input" placeholder="Parameter" value={item.parameter} onChange={e => updateItem(i, 'parameter', e.target.value)} required />
                    <input className="input" placeholder="Expected" value={item.expected} onChange={e => updateItem(i, 'expected', e.target.value)} required />
                    <input className="input" placeholder="Actual" value={item.actual} onChange={e => updateItem(i, 'actual', e.target.value)} />
                    <div className="flex gap-1">
                      <input className="input" placeholder="Remarks" value={item.remarks} onChange={e => updateItem(i, 'remarks', e.target.value)} />
                      {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 px-2">×</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Create Inspection</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export function QCReports() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/quality/inspections').then(r => setInspections(r.data)).finally(() => setLoading(false)); }, []);

  const stats = { total: inspections.length, passed: inspections.filter(i => i.status === 'PASSED').length, failed: inspections.filter(i => i.status === 'FAILED').length, pending: inspections.filter(i => i.status === 'PENDING').length };
  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  const handleExport = () => exportToCSV(inspections.map(i => ({ 'Ref No': i.refNo, Type: i.type, Inspector: i.inspector, Date: formatDate(i.date), Status: i.status, Items: i.items.length })), 'qc-report');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">QC Reports</h1>
        <button onClick={handleExport} className="btn-outline">📥 Export CSV</button>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ label: 'Total', value: stats.total, color: 'bg-blue-100' }, { label: 'Passed', value: stats.passed, color: 'bg-green-100' }, { label: 'Failed', value: stats.failed, color: 'bg-red-100' }, { label: 'Pass Rate', value: `${passRate}%`, color: 'bg-purple-100' }].map(s => (
          <div key={s.label} className={`card-sm ${s.color} text-center`}><p className="text-sm text-gray-600">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
        ))}
      </div>
      <div className="card">
        {loading ? <Spinner /> : inspections.length === 0 ? <EmptyState /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Ref No</th><th>Type</th><th>Inspector</th><th>Date</th><th>Parameters</th><th>Status</th></tr></thead>
              <tbody>
                {inspections.map(ins => (
                  <tr key={ins.id}>
                    <td className="font-medium">{ins.refNo}</td>
                    <td>{ins.type}</td>
                    <td>{ins.inspector}</td>
                    <td>{formatDate(ins.date)}</td>
                    <td>{ins.items.length} items</td>
                    <td><Badge status={ins.status} /></td>
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
