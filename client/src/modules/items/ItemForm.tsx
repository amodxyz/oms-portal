import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Category } from '../../types';
import { FormField, Spinner } from '../../components/UI';
import api from '../../utils/api';

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '', categoryId: '', unit: 'pcs', costPrice: 0, sellingPrice: 0, minStock: 0, rawMaterial: false });

  useEffect(() => {
    api.get('/items/categories/all').then(r => setCategories(r.data));
    if (id && id !== 'new') {
      setLoading(true);
      api.get(`/items/${id}`).then(r => {
        const { category, stockEntries, ...rest } = r.data;
        setForm({ ...rest, categoryId: category.id });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (id && id !== 'new') await api.put(`/items/${id}`, form);
      else await api.post('/items', form);
      navigate('/items');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error saving item';
      alert(msg);
    } finally { setLoading(false); }
  };

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  if (loading && id !== 'new') return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{id === 'new' ? 'Add Item' : 'Edit Item'}</h1>
      </div>
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Item Code" required><input className="input" value={form.code} onChange={e => set('code', e.target.value)} required /></FormField>
            <FormField label="Item Name" required><input className="input" value={form.name} onChange={e => set('name', e.target.value)} required /></FormField>
          </div>
          <FormField label="Description"><textarea className="input" rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required>
              <select className="input" value={form.categoryId} onChange={e => set('categoryId', e.target.value)} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Unit" required><input className="input" value={form.unit} onChange={e => set('unit', e.target.value)} required /></FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Cost Price"><input className="input" type="number" step="0.01" value={form.costPrice} onChange={e => set('costPrice', parseFloat(e.target.value))} /></FormField>
            <FormField label="Selling Price"><input className="input" type="number" step="0.01" value={form.sellingPrice} onChange={e => set('sellingPrice', parseFloat(e.target.value))} /></FormField>
            <FormField label="Min Stock"><input className="input" type="number" value={form.minStock} onChange={e => set('minStock', parseInt(e.target.value))} /></FormField>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.rawMaterial} onChange={e => set('rawMaterial', e.target.checked)} className="w-4 h-4 rounded" />
            <span className="text-sm font-medium text-gray-700">Raw Material</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Item'}</button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/items')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
