import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem { label: string; path?: string; icon: string; children?: { label: string; path: string; icon: string }[]; }

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  {
    label: 'Items', icon: '📦',
    children: [
      { label: 'All Items', path: '/items', icon: '📋' },
      { label: 'Add Item', path: '/items/new', icon: '➕' },
      { label: 'Stock Management', path: '/items/stock', icon: '🏭' },
      { label: 'Stock Summary', path: '/items/stock-summary', icon: '📈' },
      { label: 'Categories', path: '/items/categories', icon: '🏷️' },
      { label: 'BOM Management', path: '/items/bom', icon: '🔧' },
      { label: 'Raw Materials', path: '/items/raw-materials', icon: '⚙️' },
    ],
  },
  {
    label: 'Sales', icon: '💰',
    children: [
      { label: 'Sales Orders', path: '/sales/orders', icon: '📋' },
      { label: 'New Order', path: '/sales/orders/new', icon: '➕' },
      { label: 'Invoices', path: '/sales/invoices', icon: '🧾' },
      { label: 'Customers', path: '/sales/customers', icon: '👥' },
      { label: 'Add Customer', path: '/sales/customers/new', icon: '➕' },
      { label: 'Order Analytics', path: '/sales/analytics', icon: '📊' },
    ],
  },
  {
    label: 'Purchasing', icon: '🛒',
    children: [
      { label: 'Suppliers', path: '/purchasing/suppliers', icon: '🏢' },
      { label: 'Purchase Orders', path: '/purchasing/orders', icon: '📋' },
      { label: 'New Purchase Order', path: '/purchasing/orders/new', icon: '➕' },
    ],
  },
  {
    label: 'Production', icon: '🏗️',
    children: [
      { label: 'Production Orders', path: '/production', icon: '📋' },
      { label: 'New Production Order', path: '/production/new', icon: '➕' },
      { label: 'Schedule', path: '/production/schedule', icon: '📅' },
    ],
  },
  {
    label: 'Quality Control', icon: '✅',
    children: [
      { label: 'Inspections', path: '/quality/inspections', icon: '🔍' },
      { label: 'QC Reports', path: '/quality/reports', icon: '📊' },
    ],
  },
  {
    label: 'Logistics', icon: '🚚',
    children: [
      { label: 'Transporters', path: '/logistics/transporters', icon: '🚛' },
      { label: 'Dispatches', path: '/logistics/dispatches', icon: '📦' },
      { label: 'Tracking', path: '/logistics/tracking', icon: '📍' },
    ],
  },
  {
    label: 'Reports', icon: '📑',
    children: [
      { label: 'Inventory Report', path: '/reports/inventory', icon: '📦' },
      { label: 'Day Book', path: '/reports/daybook', icon: '📅' },
    ],
  },
  { label: 'Verifications', path: '/verifications', icon: '🔐' },
  { label: 'Integrations', path: '/integrations', icon: '🔗' },
  {
    label: 'Billing & Plan', icon: '💳',
    children: [
      { label: 'Overview', path: '/billing', icon: '📊' },
      { label: 'Plans', path: '/billing/plans', icon: '📋' },
      { label: 'Subscriptions', path: '/billing/subscriptions', icon: '🔄' },
      { label: 'Billing Records', path: '/billing/records', icon: '🧾' },
    ],
  },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

const NavGroup = ({ item }: { item: NavItem }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="sidebar-link w-full justify-between">
        <span className="flex items-center gap-3"><span>{item.icon}</span>{item.label}</span>
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-0.5">
          {item.children!.map(child => (
            <NavLink key={child.path} to={child.path} className={({ isActive }) => `sidebar-link text-xs py-2 ${isActive ? 'active' : ''}`}>
              <span>{child.icon}</span>{child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-sidebar flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <h1 className="text-white font-bold text-xl">⚡ OMS Portal</h1>
        <p className="text-gray-400 text-xs mt-1">Order Management System</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto min-h-0">
        {navItems.map(item =>
          item.children ? <NavGroup key={item.label} item={item} /> :
          <NavLink key={item.path} to={item.path!} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span>{item.icon}</span>{item.label}
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-gray-400 text-xs">{user?.role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/profile')} className="flex-1 text-xs text-gray-400 hover:text-white py-1.5 rounded-lg hover:bg-white/10 transition-colors">👤 Profile</button>
          <button onClick={handleLogout} className="flex-1 text-xs text-red-400 hover:text-red-300 py-1.5 rounded-lg hover:bg-white/10 transition-colors">🚪 Logout</button>
        </div>
      </div>
    </aside>
  );
}
