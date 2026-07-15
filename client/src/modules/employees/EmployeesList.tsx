import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Spinner, EmptyState, ConfirmDialog } from '../../components/UI';
import api from '../../utils/api';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function EmployeesList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/employees/${deleteId}`);
      setDeleteId(null); 
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert('Failed to delete employee');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Employees</h1>
        <div className="flex gap-2">
          <Link to="/employees/new" className="btn-primary">➕ Add Employee</Link>
        </div>
      </div>

      <div className="card">
        {loading ? <Spinner /> : employees.length === 0 ? <EmptyState message="No employees found" /> : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email / Login ID</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td className="font-medium">{emp.name}</td>
                    <td>{emp.email}</td>
                    <td><Badge status={emp.role} /></td>
                    <td>
                      {emp.isActive ? <span className="text-green-600 text-xs font-semibold">Active</span> : <span className="text-red-600 text-xs font-semibold">Inactive</span>}
                    </td>
                    <td>{new Date(emp.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/employees/${emp.id}/edit`} state={{ employee: emp }} className="text-blue-600 hover:underline text-xs">Edit</Link>
                        <button onClick={() => setDeleteId(emp.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && <ConfirmDialog message="Are you sure you want to delete this employee? This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}
