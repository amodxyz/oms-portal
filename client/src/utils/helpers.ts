export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

export const GST_RATE = 0.18; // 18% GST (CGST 9% + SGST 9%)
export const CGST_RATE = 0.09;
export const SGST_RATE = 0.09;

export const calcGST = (amount: number) => ({
  cgst: +(amount * CGST_RATE).toFixed(2),
  sgst: +(amount * SGST_RATE).toFixed(2),
  igst: +(amount * GST_RATE).toFixed(2),
  total: +(amount * (1 + GST_RATE)).toFixed(2),
});

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (date: string | Date) =>
  new Date(date).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow', CONFIRMED: 'badge-blue', PROCESSING: 'badge-purple',
  SHIPPED: 'badge-blue', DELIVERED: 'badge-green', CANCELLED: 'badge-red',
  DRAFT: 'badge-gray', SENT: 'badge-blue', RECEIVED: 'badge-green',
  PASSED: 'badge-green', FAILED: 'badge-red', IN_TRANSIT: 'badge-blue',
  RETURNED: 'badge-red', PLANNED: 'badge-yellow', IN_PROGRESS: 'badge-blue',
  COMPLETED: 'badge-green', UNPAID: 'badge-red', PAID: 'badge-green', PARTIAL: 'badge-yellow',
  LOW: 'badge-red', OK: 'badge-green',
};

export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
};
