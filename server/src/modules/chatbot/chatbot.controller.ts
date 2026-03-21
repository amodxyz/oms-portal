import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

const OLLAMA_API = 'https://api.ollama.ai/api/chat';
const OLLAMA_KEY = '2fd0e3eb578a480b9ae8a304bb6c8fff.X0wvpoZPTkqX1KXYxFMLK-2e';
const MODEL = 'llama3';

const SYSTEM_PUBLIC = `You are a helpful sales assistant for OMS Portal — a GST-ready Order Management System built for Indian businesses.

Features: inventory management, sales orders, GST invoices (CGST/SGST/IGST), purchase orders, production scheduling, quality control, logistics & dispatch, analytics reports, multi-tenant SaaS with role-based access.

Pricing:
- Starter: ₹29/mo — 5 users, 1,000 orders/mo
- Professional: ₹79/mo — 25 users, 10,000 orders/mo, GST reports
- Enterprise: ₹199/mo — unlimited users & orders, API access

Answer questions about features, pricing, GST compliance, and onboarding. Be concise and friendly.`;

export const publicChat = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };

  if (!messages?.length) {
    return res.status(400).json({ message: 'messages array is required' });
  }

  const response = await fetch(OLLAMA_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OLLAMA_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: SYSTEM_PUBLIC }, ...messages],
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(502).json({ message: 'AI service error', detail: err });
  }

  const data = await response.json() as any;
  res.json({ reply: data.message?.content || data.choices?.[0]?.message?.content || 'No response from AI' });
};

export const chat = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };
  const tenantId = (req as any).user.tenantId;

  if (!messages?.length) {
    return res.status(400).json({ message: 'messages array is required' });
  }

  const [orderCount, pendingOrders, itemCount, customerCount, revenue] = await Promise.all([
    prisma.order.count({ where: { tenantId } }),
    prisma.order.count({ where: { tenantId, status: 'PENDING' } }),
    prisma.item.count({ where: { tenantId } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.order.aggregate({ where: { tenantId, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
  ]);

  const systemPrompt = `You are an OMS (Order Management System) assistant. Help users manage their business operations.

Current business snapshot:
- Total Orders: ${orderCount} (${pendingOrders} pending)
- Total Items/Products: ${itemCount}
- Total Customers: ${customerCount}
- Total Revenue (delivered orders): ₹${(revenue._sum.totalAmount || 0).toLocaleString('en-IN')}

You can help with: orders, inventory, customers, suppliers, production, quality, logistics, invoices, and reports.
Be concise and helpful. Use Indian business context (₹, GST) where relevant.`;

  const response = await fetch(OLLAMA_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OLLAMA_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(502).json({ message: 'AI service error', detail: err });
  }

  const data = await response.json() as any;
  const reply = data.message?.content || data.choices?.[0]?.message?.content || 'No response from AI';

  res.json({ reply });
};
