import { Response } from 'express';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendInvoiceEmail } from '../../utils/email';

const generateInvoiceNo = (tenantId: string) => `INV-${tenantId.slice(-4).toUpperCase()}-${Date.now()}`;

// Determine IGST vs CGST+SGST: if supplier state != customer state => IGST
const getGstType = (tenantState?: string | null, customerState?: string | null) => {
  if (!tenantState || !customerState) return 'CGST_SGST';
  return tenantState.trim().toLowerCase() !== customerState.trim().toLowerCase() ? 'IGST' : 'CGST_SGST';
};

type GstItem = { taxableAmount: number; gstRate: number };

const computeGst = (items: GstItem[], discount: number, gstType: string) => {
  const subtotal = items.reduce((s, i) => s + i.taxableAmount, 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  // Compute GST per item rate group
  const totalGst = items.reduce((s, i) => {
    const itemTaxable = i.taxableAmount * (taxableAmount / (subtotal || 1));
    return s + itemTaxable * (i.gstRate / 100);
  }, 0);
  const cgst = gstType === 'CGST_SGST' ? totalGst / 2 : 0;
  const sgst = gstType === 'CGST_SGST' ? totalGst / 2 : 0;
  const igst = gstType === 'IGST' ? totalGst : 0;
  return { taxableAmount, cgst, sgst, igst, totalGst };
};

const buildInvoiceHTML = (inv: Record<string, unknown>, forPrint = false) => {
  const order = inv.order as Record<string, unknown>;
  const customer = order?.customer as Record<string, unknown>;
  const items = (order?.items as Record<string, unknown>[]) || [];
  const tenant = inv.tenant as Record<string, unknown>;
  const gstType = inv.gstType as string;

  const rows = items.map((it, idx) => {
    const item = it.item as Record<string, unknown>;
    const taxable = Number(it.total);
    const rate = Number(item?.gstRate ?? 18);
    const gstAmt = taxable * (rate / 100);
    const cgstAmt = gstType === 'CGST_SGST' ? gstAmt / 2 : 0;
    const sgstAmt = gstType === 'CGST_SGST' ? gstAmt / 2 : 0;
    const igstAmt = gstType === 'IGST' ? gstAmt : 0;
    return `<tr>
      <td>${idx + 1}</td>
      <td>${item?.name || ''}<br><span style="color:#64748b;font-size:11px">HSN: ${item?.hsnCode || 'N/A'}</span></td>
      <td>${it.quantity} ${item?.unit || ''}</td>
      <td>₹${Number(it.unitPrice).toFixed(2)}</td>
      <td>₹${taxable.toFixed(2)}</td>
      <td>${rate}%</td>
      ${gstType === 'CGST_SGST'
        ? `<td>₹${cgstAmt.toFixed(2)}</td><td>₹${sgstAmt.toFixed(2)}</td>`
        : `<td colspan="2">₹${igstAmt.toFixed(2)}</td>`}
      <td>₹${(taxable + gstAmt).toFixed(2)}</td>
    </tr>`;
  }).join('');

  const taxableAmount = Number(inv.taxableAmount);
  const cgst = Number(inv.cgst);
  const sgst = Number(inv.sgst);
  const igst = Number(inv.igst);
  const totalGst = Number(inv.totalGst);
  const discount = Number(order?.discount ?? 0);
  const grandTotal = Number(inv.amount);
  const amountDue = grandTotal - Number(inv.paid);

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tax Invoice ${inv.invoiceNo}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;margin:0;padding:24px;color:#111;font-size:12px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2563eb;padding-bottom:16px;margin-bottom:16px}
  .company{font-size:18px;font-weight:bold;color:#2563eb}
  .title{font-size:16px;font-weight:bold;text-align:right}
  .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:bold;
    background:${inv.status === 'PAID' ? '#dcfce7' : inv.status === 'PARTIAL' ? '#fef9c3' : '#fee2e2'};
    color:${inv.status === 'PAID' ? '#166534' : inv.status === 'PARTIAL' ? '#854d0e' : '#991b1b'}}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
  .box{border:1px solid #e2e8f0;border-radius:6px;padding:12px}
  .box h3{margin:0 0 6px;font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
  .box p{margin:2px 0;font-size:12px}
  table{width:100%;border-collapse:collapse;margin:12px 0;font-size:11px}
  th{background:#1e40af;color:#fff;text-align:left;padding:7px 8px;font-size:10px}
  td{padding:6px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}
  tr:nth-child(even) td{background:#f8fafc}
  .totals{margin-left:auto;width:280px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden}
  .totals tr td{border:none;padding:5px 12px}
  .totals tr:last-child td{background:#1e40af;color:#fff;font-weight:bold;font-size:13px;padding:8px 12px}
  .gst-summary{margin:12px 0;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden}
  .gst-summary th{background:#f1f5f9;color:#374151;font-size:10px}
  .gst-summary td{font-size:11px}
  .footer{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:10px;color:#64748b}
  @media print{body{padding:12px}@page{margin:10mm}}
</style>
${forPrint ? '<script>window.onload=()=>window.print()</script>' : ''}
</head><body>
<div class="header">
  <div>
    <div class="company">${tenant?.name || 'OMS Portal'}</div>
    <p style="margin:2px 0;color:#64748b">${tenant?.address || ''}</p>
    ${tenant?.state ? `<p style="margin:2px 0;color:#64748b">State: ${tenant.state}</p>` : ''}
    ${tenant?.gstin ? `<p style="margin:4px 0"><strong>GSTIN:</strong> ${tenant.gstin}</p>` : ''}
  </div>
  <div style="text-align:right">
    <div class="title">TAX INVOICE</div>
    <div style="color:#64748b;margin:4px 0">${inv.invoiceNo}</div>
    <div><span class="badge">${inv.status}</span></div>
  </div>
</div>

<div class="grid2">
  <div class="box">
    <h3>Bill To</h3>
    <p><strong>${customer?.name || ''}</strong></p>
    ${customer?.gstin ? `<p>GSTIN: <strong>${customer.gstin}</strong></p>` : ''}
    ${customer?.address ? `<p>${customer.address}</p>` : ''}
    ${customer?.city ? `<p>${customer.city}${customer?.state ? ', ' + customer.state : ''}</p>` : ''}
    ${customer?.phone ? `<p>📞 ${customer.phone}</p>` : ''}
    ${customer?.email ? `<p>✉ ${customer.email}</p>` : ''}
  </div>
  <div class="box">
    <h3>Invoice Details</h3>
    <p>Invoice No: <strong>${inv.invoiceNo}</strong></p>
    <p>Order No: <strong>${order?.orderNo || ''}</strong></p>
    <p>Issue Date: <strong>${new Date(inv.issueDate as string).toLocaleDateString('en-IN')}</strong></p>
    <p>Due Date: <strong>${new Date(inv.dueDate as string).toLocaleDateString('en-IN')}</strong></p>
    ${inv.placeOfSupply ? `<p>Place of Supply: <strong>${inv.placeOfSupply}</strong></p>` : ''}
    <p>GST Type: <strong>${gstType === 'IGST' ? 'IGST (Inter-state)' : 'CGST + SGST (Intra-state)'}</strong></p>
  </div>
</div>

<table>
  <thead><tr>
    <th>#</th><th>Item / HSN</th><th>Qty</th><th>Rate</th><th>Taxable</th><th>GST%</th>
    ${gstType === 'CGST_SGST' ? '<th>CGST</th><th>SGST</th>' : '<th colspan="2">IGST</th>'}
    <th>Total</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>

<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:8px">
  <div style="flex:1">
    <p style="font-size:10px;color:#64748b;margin:0 0 4px"><strong>GST Summary</strong></p>
    <table class="gst-summary" style="width:auto;min-width:300px">
      <thead><tr>
        <th style="padding:6px 10px">HSN Code</th>
        <th style="padding:6px 10px">Taxable Amt</th>
        <th style="padding:6px 10px">GST Rate</th>
        ${gstType === 'CGST_SGST' ? '<th style="padding:6px 10px">CGST</th><th style="padding:6px 10px">SGST</th>' : '<th colspan="2" style="padding:6px 10px">IGST</th>'}
      </tr></thead>
      <tbody>
        ${items.map(it => {
          const item = it.item as Record<string, unknown>;
          const taxable = Number(it.total);
          const rate = Number(item?.gstRate ?? 18);
          const gstAmt = taxable * (rate / 100);
          return `<tr>
            <td style="padding:5px 10px">${item?.hsnCode || 'N/A'}</td>
            <td style="padding:5px 10px">₹${taxable.toFixed(2)}</td>
            <td style="padding:5px 10px">${rate}%</td>
            ${gstType === 'CGST_SGST'
              ? `<td style="padding:5px 10px">₹${(gstAmt/2).toFixed(2)}</td><td style="padding:5px 10px">₹${(gstAmt/2).toFixed(2)}</td>`
              : `<td colspan="2" style="padding:5px 10px">₹${gstAmt.toFixed(2)}</td>`}
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  <table class="totals">
    <tr><td>Taxable Amount</td><td style="text-align:right">₹${taxableAmount.toFixed(2)}</td></tr>
    ${discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-₹${discount.toFixed(2)}</td></tr>` : ''}
    ${gstType === 'CGST_SGST' ? `
    <tr><td>CGST</td><td style="text-align:right">₹${cgst.toFixed(2)}</td></tr>
    <tr><td>SGST</td><td style="text-align:right">₹${sgst.toFixed(2)}</td></tr>` : `
    <tr><td>IGST</td><td style="text-align:right">₹${igst.toFixed(2)}</td></tr>`}
    <tr><td>Total GST</td><td style="text-align:right">₹${totalGst.toFixed(2)}</td></tr>
    <tr><td colspan="2" style="border-top:1px solid #e2e8f0"></td></tr>
    <tr><td><strong>Grand Total</strong></td><td style="text-align:right"><strong>₹${grandTotal.toFixed(2)}</strong></td></tr>
    ${Number(inv.paid) > 0 ? `<tr><td>Paid</td><td style="text-align:right">₹${Number(inv.paid).toFixed(2)}</td></tr>` : ''}
    <tr><td>Amount Due</td><td style="text-align:right">₹${amountDue.toFixed(2)}</td></tr>
  </table>
</div>

${inv.notes ? `<p style="margin-top:16px;color:#64748b;font-size:11px"><strong>Notes:</strong> ${inv.notes}</p>` : ''}
<div class="footer">
  <div>This is a computer generated invoice.</div>
  <div>Thank you for your business!</div>
</div>
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
  try {
    const { orderId, dueDate, notes, customerGstin, placeOfSupply } = req.body;
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId: req.user!.tenantId },
      include: { customer: true, items: { include: { item: true } }, tenant: true },
    });
    if (!order) return res.status(400).json({ message: 'Order not found' });

    const tenant = order.tenant as unknown as Record<string, unknown>;
    const customer = order.customer as unknown as Record<string, unknown>;
    const gstType = getGstType(tenant?.state as string, placeOfSupply || customer?.state as string);

    const gstItems: GstItem[] = order.items.map(i => ({
      taxableAmount: i.total,
      gstRate: (i.item as unknown as Record<string, unknown>)?.gstRate as number ?? 18,
    }));
    const { taxableAmount, cgst, sgst, igst, totalGst } = computeGst(gstItems, order.discount, gstType);
    const grandTotal = taxableAmount + totalGst;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: generateInvoiceNo(req.user!.tenantId),
        orderId,
        dueDate: new Date(dueDate),
        taxableAmount,
        cgst,
        sgst,
        igst,
        totalGst,
        amount: grandTotal,
        gstType,
        placeOfSupply: placeOfSupply || (customer?.state as string) || null,
        customerGstin: customerGstin || (customer?.gstin as string) || null,
        notes: notes || null,
      },
      include: { order: { include: { customer: true } } },
    });
    res.status(201).json(invoice);
  } catch (err: unknown) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Error creating invoice' });
  }
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
    const data = { ...invoice, tenant: (invoice.order as unknown as Record<string, unknown>).tenant };
    res.setHeader('Content-Type', 'text/html');
    res.send(buildInvoiceHTML(data as unknown as Record<string, unknown>, true));
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
      const msg = encodeURIComponent(
        `Hi ${customer?.name}, your Tax Invoice *${invoice.invoiceNo}* is ready.\nTaxable: ₹${Number(invoice.taxableAmount).toFixed(2)}\nGST (${invoice.gstType}): ₹${Number(invoice.totalGst).toFixed(2)}\nTotal: ₹${Number(invoice.amount).toFixed(2)}\nDue: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}\nStatus: ${invoice.status}`
      );
      return res.json({ url: `https://wa.me/${phone}?text=${msg}` });
    }

    const email = customer?.email as string;
    if (!email) return res.status(400).json({ message: 'Customer has no email address' });
    const data = { ...invoice, tenant: order.tenant };
    const html = buildInvoiceHTML(data as unknown as Record<string, unknown>, false);
    await sendInvoiceEmail(email, invoice.invoiceNo, customer?.name as string, Number(invoice.amount) - Number(invoice.paid), html);
    res.json({ message: `Invoice sent to ${email}` });
  } catch (err: unknown) {
    res.status(500).json({ message: err instanceof Error ? err.message : 'Error sending invoice' });
  }
};
