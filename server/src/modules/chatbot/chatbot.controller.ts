import { Request, Response } from 'express';
import prisma from '../../utils/prisma';

const GEMINI_KEY = 'AIzaSyCfL6BRHLsk7PscxoorxvXbSp_bICxOPsc';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

// Convert OpenAI-style messages to Gemini format
const toGemini = (messages: { role: string; content: string }[]) =>
  messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

const callAI = async (system: string, messages: { role: string; content: string }[]) => {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: toGemini(messages),
    }),
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text as string;
};

const SYSTEM_PUBLIC = `You are a helpful sales assistant for OMS Portal — a GST-ready Order Management System built for Indian businesses.

Features: inventory management, sales orders, GST invoices (CGST/SGST/IGST), purchase orders, production scheduling, quality control, logistics & dispatch, analytics reports, multi-tenant SaaS with role-based access.

Pricing:
- Starter: ₹29/mo — 5 users, 1,000 orders/mo
- Professional: ₹79/mo — 25 users, 10,000 orders/mo, GST reports
- Enterprise: ₹199/mo — unlimited users & orders, API access

Answer questions about features, pricing, GST compliance, and onboarding. Be concise and friendly.`;

export const publicChat = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };
  if (!messages?.length) return res.status(400).json({ message: 'messages array is required' });

  try {
    const reply = await callAI(SYSTEM_PUBLIC, messages);
    res.json({ reply });
  } catch (e: any) {
    res.status(502).json({ message: e.message });
  }
};

export const chat = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };
  const tenantId = (req as any).user.tenantId;
  if (!messages?.length) return res.status(400).json({ message: 'messages array is required' });

  const [orderCount, pendingOrders, itemCount, customerCount, revenue] = await Promise.all([
    prisma.order.count({ where: { tenantId } }),
    prisma.order.count({ where: { tenantId, status: 'PENDING' } }),
    prisma.item.count({ where: { tenantId } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.order.aggregate({ where: { tenantId, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
  ]);

  const system = `You are an OMS assistant. Help users manage their business operations.

Current business snapshot:
- Total Orders: ${orderCount} (${pendingOrders} pending)
- Total Items/Products: ${itemCount}
- Total Customers: ${customerCount}
- Total Revenue (delivered orders): ₹${(revenue._sum.totalAmount || 0).toLocaleString('en-IN')}

Help with: orders, inventory, customers, suppliers, production, quality, logistics, invoices, reports.
Be concise. Use Indian business context (₹, GST) where relevant.`;

  try {
    const reply = await callAI(system, messages);
    res.json({ reply });
  } catch (e: any) {
    res.status(502).json({ message: e.message });
  }
};
