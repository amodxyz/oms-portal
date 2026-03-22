import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendInvoiceEmail } from '../../utils/email';

const generateInvoiceNo = () => `INV-${Date.now()}`;

const buildInvoiceHTML = (inv: Record<string, unknown>, forPrint = false) => {
  const order = inv.order as Record<string, unknown>;
  const customer = order?.customer as Record<string, unknown>;
  const items = (order?.items as Record<string, unknown>[]) || [];
  const tenant = inv.tenant as Record<string, unknown>;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${inv.invoiceNo}</title>
<style>
  body{font-family:Arial,sans-serif;margin:0;padding:32px;color:#111;font-size:13px}
  .header{display:flex;justify-content:space-between;margin-bottom:32px}
  .logo{font-size:22px;font-weight:bold;color:#2563eb}
  .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:bold;
    background:${inv.status === 'PAID' ? '#dcfce7' : inv.status === 'PARTIAL' ? '#fef9c3' : '#fee2e2'};
    color:${inv.status === 'PAID' ? '#166534' : inv.status === 'PARTIAL' ? '#854d0e' : '#991b1b'}}
  table{width:100%;border-collapse:collapse;margin:24px 0}
  th{background:#f1f5f9;text-align:left;padding:8px 12px;font-size:12px}
  td{padding:8px 12px;border-bottom:1px solid #e2e8f0}
  .total-row td{font-weight:bold;border-top:2px solid #e2e8f0;border-bottom:none}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
  .info-box h3{margin:0 0 8px;font-size:12px;color:#64748b;text-transform:uppercase}
  .info-box p{margin:2px 0}
  @media print{body{padding:16px}.no-print{display:none}}
</style>
${forPrint ? '<script>window.onload=()=>window.print()</script>' : ''}
</head><body>
<div class="header">
  <div><div class="logo">${tenant?.name || 'OMS Portal'}</div><p style="color:#64748b;margin:4px 0">${tenant?.address || ''}</p></div>
  <div style="text-align:right">
    <div style="font-size:20px;font-weight:bold">INVOICE</div>
    <div style="color:#64748b">${inv.invoiceNo}</div>
    <div style="margin-top:8px"><span class="badge">${inv.status}</span></div>
  </div>
</div>
<div class="info-grid">
  <div class="info-box"><h3>Bill To</h3><p><strong>${customer?.name || ''}</strong></p><p>${customer?.email || ''}</p><p>${customer?.phone || ''}</p><p>${customer?.address || ''}</p></div>
  <div class="info-box"><h3>Invoice Details</h3><p>Invoice No: <strong>${inv.invoiceNo}</strong></p><p>Order No: <strong>${(order as Record<string,unknown>)?.orderNo || ''}</strong></p><p>Issue Date: <strong>${new Date(inv.issueDate as string).toLocaleDateString()}</strong></p><p>Due Date: <strong>${new Date(inv.dueDate as string).toLocaleDateString()}</strong></p></div>
</div>
<table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>
${items.map((it, idx) => { const item = it.item as Record<string,unknown>; return `<tr><td>${idx+1}</td><td>${item?.name || ''}</td><td>${it.quantity} ${item?.unit || ''}</td><td>₹${Number(it.unitPrice).toFixed(2)}</td><td>₹${Number(it.total).toFixed(2)}</td></tr>`; }).join('')}
</tbody><tfoot>
  <tr><td colspan="4" style="text-align:right;padding:8px 12px">Subtotal</td><td style="padding:8px 12px">₹${Number(inv.amount).toFixed(2)}</td></tr>
  ${Number(order?.tax) > 0 ? `<tr><td colspan="4" style="text-align:right;padding:8px 12px">Tax</td><td style="padding:8px 12px">₹${Number(order?.tax).toFixed(2)}</td></tr>` : ''}
  ${Number(order?.discount) > 0 ? `<tr><td colspan="4" style="text-align:right;padding:8px 12px">Discount</td><td style="padding:8px 12px">-₹${Number(order?.discount).toFixed(2)}</td></tr>` : ''}
  <tr class="total-row"><td colspan="4" style="text-align:right;padding:8px 12px">Amount Due</td><td style="padding:8px 12px">₹${(Number(inv.amount) - Number(inv.paid)).toFixed(2)}</td></tr>
</tfoot></table>
${(inv.notes as string) ? `<p style="color:#64748b;font-size:12px">Notes: ${inv.notes}</p>` : ''}
<p style="color:#94a3b8;font-size:11px;margin-top:32px;text-align:center">Thank you for your business!</p>
</body></html>`;
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { order: { tenantId: req.user!.tenantId } };
  if (status) where.status = status;
  const invoices = await prisma.invoice.findMany({ where, include: { order: { include: { customer: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(invoices);
};

export const getInvoice = async (req: AuthRequest, res: Response) => {
  const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, order: { tenantId: req.user!.tenantId } }, include: { order: { include: { customer: true, items: { include: { item: true } } } } } });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  const { orderId, dueDate } = req.body;
  const order = await prisma.order.findFirst({ where: { id: orderId, tenantId: req.user!.tenantId } });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const invoice = await prisma.invoice.create({ data: { invoiceNo: generateInvoiceNo(), orderId, dueDate, amount: order.totalAmount }, include: { order: { include: { customer: true } } } });
  res.status(201).json(invoice);
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  const { paid, status } = req.body;
  const invoice = await prisma.invoice.update({ where: { id: req.params.id }, data: { paid, status } });
  res.json(invoice);
};

export const downloadInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, order: { tenantId: req.user!.tenantId } },
      include: { order: { include: { customer: true, items: { include: { item: true } }, tenant: true } } },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const data = { ...invoice, tenant: (invoice.order as unknown as Record<string,unknown>).tenant };
    const html = buildInvoiceHTML(data as unknown as Record<string, unknown>, true);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err: unknown) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Error generating invoice' });
  }
};

export const sendInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { channel } = req.body;
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, order: { tenantId: req.user!.tenantId } },
      include: { order: { include: { customer: true, items: { include: { item: true } }, tenant: true } } },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const order = invoice.order as unknown as Record<string, unknown>;
    const customer = order?.customer as Record<string, unknown>;

    if (channel === 'whatsapp') {
      const phone = (customer?.phone as string || '').replace(/\D/g, '');
      if (!phone) return res.status(400).json({ message: 'Customer has no phone number' });
      const msg = encodeURIComponent(`Hi ${customer?.name}, your invoice *${invoice.invoiceNo}* for ₹${Number(invoice.amount).toFixed(2)} is ready. Due: ${new Date(invoice.dueDate).toLocaleDateString()}. Status: ${invoice.status}`);
      return res.json({ url: `https://wa.me/${phone}?text=${msg}` });
    }

    const email = customer?.email as string;
    if (!email) return res.status(400).json({ message: 'Customer has no email address' });
    const data = { ...invoice, tenant: order.tenant };
    const invoiceHtml = buildInvoiceHTML(data as unknown as Record<string, unknown>, false);
    await sendInvoiceEmail(email, invoice.invoiceNo, customer?.name as string, Number(invoice.amount) - Number(invoice.paid), invoiceHtml);
    res.json({ message: `Invoice sent to ${email}` });
  } catch (err: unknown) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Error sending invoice' });
  }
};
