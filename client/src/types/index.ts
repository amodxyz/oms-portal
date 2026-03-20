export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PurchaseStatus = 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
export type InspectionStatus = 'PENDING' | 'PASSED' | 'FAILED';
export type DispatchStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'RETURNED';

export interface User { id: string; name: string; email: string; role: Role; tenantId: string; isActive?: boolean; createdAt?: string; }
export interface Category { id: string; name: string; description?: string; _count?: { items: number }; }
export interface Item { id: string; code: string; name: string; description?: string; categoryId: string; category: Category; unit: string; costPrice: number; sellingPrice: number; minStock: number; isActive: boolean; rawMaterial: boolean; createdAt: string; }
export interface StockEntry { id: string; itemId: string; quantity: number; type: 'IN' | 'OUT' | 'ADJUSTMENT'; location?: string; reference?: string; note?: string; createdAt: string; }
export interface StockSummary { id: string; code: string; name: string; category: string; unit: string; stock: number; minStock: number; status: 'LOW' | 'OK'; }
export interface BOM { id: string; name: string; description?: string; items: BOMItem[]; createdAt: string; }
export interface BOMItem { id: string; bomId: string; parentId: string; parent: Item; componentId: string; component: Item; quantity: number; unit: string; }
export interface Customer { id: string; code: string; name: string; email?: string; phone?: string; address?: string; city?: string; country?: string; isActive: boolean; _count?: { orders: number }; createdAt: string; }
export interface OrderItem { id: string; itemId: string; item: Item; quantity: number; unitPrice: number; total: number; }
export interface Order { id: string; orderNo: string; customerId: string; customer: Customer; status: OrderStatus; orderDate: string; dueDate?: string; totalAmount: number; discount: number; tax: number; notes?: string; items: OrderItem[]; invoice?: Invoice; dispatch?: Dispatch; createdAt: string; }
export interface Invoice { id: string; invoiceNo: string; orderId: string; order?: Order; issueDate: string; dueDate: string; amount: number; paid: number; status: string; }
export interface Supplier { id: string; code: string; name: string; email?: string; phone?: string; address?: string; city?: string; country?: string; isActive: boolean; _count?: { purchaseOrders: number }; }
export interface PurchaseItem { id: string; itemId: string; item: Item; quantity: number; unitPrice: number; total: number; received: number; }
export interface PurchaseOrder { id: string; poNo: string; supplierId: string; supplier: Supplier; status: PurchaseStatus; orderDate: string; expectedDate?: string; totalAmount: number; notes?: string; items: PurchaseItem[]; }
export interface ProductionResource { id: string; resourceName: string; resourceType: string; quantity: number; unit: string; }
export interface ProductionOrder { id: string; orderNo: string; productName: string; quantity: number; unit: string; startDate: string; endDate?: string; status: string; priority: string; assignedTo?: string; notes?: string; resources: ProductionResource[]; }
export interface InspectionItem { id: string; parameter: string; expected: string; actual?: string; passed?: boolean; remarks?: string; }
export interface Inspection { id: string; refNo: string; type: string; referenceId?: string; inspector: string; date: string; status: InspectionStatus; notes?: string; items: InspectionItem[]; }
export interface Transporter { id: string; code: string; name: string; phone?: string; email?: string; vehicle?: string; isActive: boolean; _count?: { dispatches: number }; }
export interface Dispatch { id: string; dispatchNo: string; orderId: string; order?: Order; transporterId: string; transporter?: Transporter; status: DispatchStatus; dispatchDate: string; deliveryDate?: string; trackingNo?: string; notes?: string; }
export interface DashboardData { totalOrders: number; totalCustomers: number; totalItems: number; totalSuppliers: number; totalRevenue: number; recentOrders: Order[]; lowStockCount: number; pendingInspections: number; }
export interface PaginatedResponse<T> { items?: T[]; orders?: T[]; total: number; page: number; pages: number; }
