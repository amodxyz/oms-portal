import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import BookDemoPage from './pages/BookDemoPage';
import { Profile, Settings, Verifications, Integrations } from './pages/Misc';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

// Items
import ItemsList from './modules/items/ItemsList';
import ItemForm from './modules/items/ItemForm';
import StockManagement from './modules/items/StockManagement';
import StockSummaryPage from './modules/items/StockSummary';
import Categories from './modules/items/Categories';
import BOMManagement from './modules/items/BOMManagement';
import RawMaterials from './modules/items/RawMaterials';

// Sales
import OrdersList from './modules/sales/OrdersList';
import NewOrder from './modules/sales/NewOrder';
import OrderDetail from './modules/sales/OrderDetail';
import { CustomersList, CustomerForm } from './modules/sales/Customers';
import Invoices from './modules/sales/Invoices';
import OrderAnalytics from './modules/sales/OrderAnalytics';

// Purchasing
import { SuppliersList } from './modules/purchasing/Suppliers';
import { PurchaseOrdersList, NewPurchaseOrder } from './modules/purchasing/PurchaseOrders';

// Production
import { ProductionList, NewProductionOrder, ProductionSchedule } from './modules/production/Production';

// Quality
import { InspectionsList, QCReports } from './modules/quality/Quality';

// Logistics
import { TransportersList, DispatchesList, TrackingPage } from './modules/logistics/Logistics';

// Reports
import { InventoryReport, DayBook } from './modules/reports/Reports';
import { BillingOverview, Plans, Subscriptions, BillingRecords } from './modules/billing/Billing';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/book-demo" element={<BookDemoPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/superadmin/login" element={<SuperAdminLogin />} />
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="/superadmin" element={<Navigate to="/superadmin/login" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/items" element={<ProtectedRoute><ItemsList /></ProtectedRoute>} />
      <Route path="/items/new" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />
      <Route path="/items/stock" element={<ProtectedRoute><StockManagement /></ProtectedRoute>} />
      <Route path="/items/stock-summary" element={<ProtectedRoute><StockSummaryPage /></ProtectedRoute>} />
      <Route path="/items/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/items/bom" element={<ProtectedRoute><BOMManagement /></ProtectedRoute>} />
      <Route path="/items/raw-materials" element={<ProtectedRoute><RawMaterials /></ProtectedRoute>} />
      <Route path="/items/:id" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />
      <Route path="/items/:id/edit" element={<ProtectedRoute><ItemForm /></ProtectedRoute>} />

      <Route path="/sales/orders" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
      <Route path="/sales/orders/new" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />
      <Route path="/sales/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
      <Route path="/sales/customers" element={<ProtectedRoute><CustomersList /></ProtectedRoute>} />
      <Route path="/sales/customers/new" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
      <Route path="/sales/customers/:id/edit" element={<ProtectedRoute><CustomerForm /></ProtectedRoute>} />
      <Route path="/sales/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
      <Route path="/sales/analytics" element={<ProtectedRoute><OrderAnalytics /></ProtectedRoute>} />

      <Route path="/purchasing/suppliers" element={<ProtectedRoute><SuppliersList /></ProtectedRoute>} />
      <Route path="/purchasing/orders" element={<ProtectedRoute><PurchaseOrdersList /></ProtectedRoute>} />
      <Route path="/purchasing/orders/new" element={<ProtectedRoute><NewPurchaseOrder /></ProtectedRoute>} />

      <Route path="/production" element={<ProtectedRoute><ProductionList /></ProtectedRoute>} />
      <Route path="/production/new" element={<ProtectedRoute><NewProductionOrder /></ProtectedRoute>} />
      <Route path="/production/schedule" element={<ProtectedRoute><ProductionSchedule /></ProtectedRoute>} />

      <Route path="/quality/inspections" element={<ProtectedRoute><InspectionsList /></ProtectedRoute>} />
      <Route path="/quality/reports" element={<ProtectedRoute><QCReports /></ProtectedRoute>} />

      <Route path="/logistics/transporters" element={<ProtectedRoute><TransportersList /></ProtectedRoute>} />
      <Route path="/logistics/dispatches" element={<ProtectedRoute><DispatchesList /></ProtectedRoute>} />
      <Route path="/logistics/tracking" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />

      <Route path="/reports/inventory" element={<ProtectedRoute><InventoryReport /></ProtectedRoute>} />
      <Route path="/reports/daybook" element={<ProtectedRoute><DayBook /></ProtectedRoute>} />

      <Route path="/verifications" element={<ProtectedRoute><Verifications /></ProtectedRoute>} />
      <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><BillingOverview /></ProtectedRoute>} />
      <Route path="/billing/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
      <Route path="/billing/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
      <Route path="/billing/records" element={<ProtectedRoute><BillingRecords /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
