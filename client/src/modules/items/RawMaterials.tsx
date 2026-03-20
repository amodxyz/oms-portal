import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../../types';
import { Spinner, EmptyState } from '../../components/UI';
import { formatCurrency } from '../../utils/helpers';
import api from '../../utils/api';

export default function RawMaterials() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/items/raw-materials').then(r => setItems(r.data)).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Raw Materials</h1>
        <Link to="/items/new" className="btn-primary">➕ Add Raw Material</Link>
      </div>
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <EmptyState message="No raw materials found" /> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Unit</th><th>Cost Price</th><th>Min Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="font-mono text-xs">{item.code}</td>
                    <td><Link to={`/items/${item.id}`} className="text-blue-600 hover:underline font-medium">{item.name}</Link></td>
                    <td>{item.category.name}</td>
                    <td>{item.unit}</td>
                    <td>{formatCurrency(item.costPrice)}</td>
                    <td>{item.minStock}</td>
                    <td><Link to={`/items/${item.id}/edit`} className="text-blue-600 hover:underline text-xs">Edit</Link></td>
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
