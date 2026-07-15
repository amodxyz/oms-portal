import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { Spinner } from '../../components/UI';

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const existingEmployee = location.state?.employee;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: existingEmployee?.name || '',
    email: existingEmployee?.email || '',
    password: '',
    role: existingEmployee?.role || 'STAFF',
    isActive: existingEmployee !== undefined ? existingEmployee.isActive : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        // Edit mode - password is optional
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;
        await api.put(`/employees/${id}`, payload);
      } else {
        // Add mode
        if (!formData.password) {
            alert("Password is required for new employees");
            setLoading(false);
            return;
        }
        await api.post('/employees', formData);
      }
      navigate('/employees');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">{id ? 'Edit Employee' : 'Add Employee'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            className="input"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Email (Login ID)</label>
          <input
            type="email"
            className="input"
            required
            disabled={!!id} // Usually don't allow changing email to avoid conflicts, or handle it carefully
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
          {!!id && <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>}
        </div>

        <div>
          <label className="label">Password {id && '(Leave blank to keep current)'}</label>
          <input
            type="text"
            className="input"
            required={!id}
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div>
          <label className="label">Role</label>
          <select
            className="input"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="STAFF">Staff</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {!!id && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm font-medium">Account Active</label>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={() => navigate('/employees')} className="btn-outline flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner /> : 'Save Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}
