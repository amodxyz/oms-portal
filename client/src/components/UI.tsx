import React, { ReactNode } from 'react';
import { statusColors } from '../utils/helpers';

// Badge
export const Badge = ({ status }: { status: string }) => (
  <span className={statusColors[status] || 'badge-gray'}>{status.replace(/_/g, ' ')}</span>
);

// Modal
export const Modal = ({ title, onClose, children, size = 'md' }: { title: string; onClose: () => void; children: ReactNode; size?: 'md' | 'lg' }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className={size === 'lg' ? 'modal-lg' : 'modal'}>
      <div className="modal-header">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>
      {children}
    </div>
  </div>
);

// Confirm Dialog
export const ConfirmDialog = ({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="modal-overlay">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <h3 className="text-lg font-semibold mb-2">Confirm Action</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  </div>
);

// Search Input
export const SearchInput = ({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
    <input className="input pl-9 w-64" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

// Loading Spinner
export const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Empty State
export const EmptyState = ({ message = 'No data found' }: { message?: string }) => (
  <div className="text-center py-12 text-gray-400">
    <div className="text-5xl mb-3">📭</div>
    <p>{message}</p>
  </div>
);

// Stat Card
export const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// Form Field
export const FormField = ({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) => (
  <div>
    <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {children}
  </div>
);

// Pagination
export const Pagination = ({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) => (
  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
    <span>Page {page} of {pages}</span>
    <div className="flex gap-2">
      <button className="btn-outline py-1 px-3" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <button className="btn-outline py-1 px-3" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  </div>
);
