import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Item, Category } from '../../types';
import { Badge, SearchInput, Spinner, EmptyState, ConfirmDialog, Pagination } from '../../components/UI';
import { formatCurrency, exportToCSV } from '../../utils/helpers';
import api from '../../utils/api';

export default function ItemsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);
    const { data } = await api.get(`/items?${params}`);
    setItems(data.items); setPages(data.pages);
    setLoading(false);
  }, [search, categoryId, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { api.get('/items/categories/all').then(r => setCategories(r.data)); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await api.delete(`/items/${deleteId}`);
    setDeleteId(null); fetchItems();
  };

  const handleExport = () => exportToCSV(items.map(i => ({ Code: i.code, Name: i.name, Category: i.category.name, Unit: i.unit, 'Cost Price': i.costPrice, 'Selling Price': i.sellingPrice, 'Min Stock': i.minStock })), 'items');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Items</h1>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-outline">📥 Export CSV</button>
          <Link to="/items/new" className="btn-primary">➕ Add Item</Link>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4 flex-wrap">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search items..." />
          <select className="input w-48" value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? <Spinner /> : items.length === 0 ? <EmptyState /> : (
          <>
            <div className="table-container">
              <table>
                <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Unit</th><th>Cost Price</th><th>Selling Price</th><th>Min Stock</th><th>Type</th><th>Actions</th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td className="font-mono text-xs">{item.code}</td>
                      <td><Link to={`/items/${item.id}`} className="text-blue-600 hover:underline font-medium">{item.name}</Link></td>
                      <td>{item.category.name}</td>
                      <td>{item.unit}</td>
                      <td>{formatCurrency(item.costPrice)}</td>
                      <td>{formatCurrency(item.sellingPrice)}</td>
                      <td>{item.minStock}</td>
                      <td>{item.rawMaterial ? <Badge status="RAW" /> : <Badge status="FINISHED" />}</td>
                      <td>
                        <div className="flex gap-2">
                          <Link to={`/items/${item.id}/edit`} className="text-blue-600 hover:underline text-xs">Edit</Link>
                          <button onClick={() => setDeleteId(item.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} onChange={setPage} />
          </>
        )}
      </div>

      {deleteId && <ConfirmDialog message="Deactivate this item?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
