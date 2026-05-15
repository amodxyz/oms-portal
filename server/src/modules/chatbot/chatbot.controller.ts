import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import logger from '../../utils/logger';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY = process.env.GROQ_API_KEY!;
const MODEL = 'llama-3.3-70b-versatile'; // Upgraded from 8b for better reasoning

const callAI = async (messages: { role: string; content: string }[]) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
      signal: controller.signal,
      body: JSON.stringify({ 
        model: MODEL, 
        messages,
        temperature: 0.7,
        max_tokens: 1024
      }),
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const errorData = await res.json() as any;
      throw new Error(errorData.error?.message || `Groq API error: ${res.status}`);
    }

    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content as string;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error('AI request timed out');
    throw error;
  }
};

const SYSTEM_PUBLIC = `You are "OMS Expert", a high-end business consultant and sales assistant for OMS Portal — India's premier GST-ready Order Management System.

CORE MISSION:
Help Indian SMEs and manufacturers automate their operations, ensure 100% GST compliance, and scale efficiently.

PRODUCT KNOWLEDGE:
- **Sales & Invoicing**: Manage orders, generate GST-compliant tax invoices, proforma invoices, and delivery challans. Support for CGST, SGST, IGST, and HSN codes.
- **Inventory & Warehouse**: Real-time stock tracking across locations, low-stock alerts, stock transfers, and valuation (FIFO/Weighted Average).
- **Production & Manufacturing**: Bill of Materials (BOM), production scheduling, work orders, and raw material requirement planning.
- **Purchasing**: Vendor management, Purchase Orders (PO), and goods receipt notes (GRN).
- **Logistics**: Dispatch planning, tracking, and delivery status updates.
- **Finance & Reports**: Day Book, GST liability reports, sales analytics, and profit/loss insights.

PRICING (Affordable for SMEs):
- **Starter (₹29/mo)**: Best for micro-businesses. 5 users, 1,000 orders/mo, Core OMS modules.
- **Professional (₹79/mo)**: Best for growing SMEs. 25 users, 10,000 orders/mo, GST Reports, Production module.
- **Enterprise (₹199/mo)**: Full power. Unlimited users/orders, API access, Priority support.

TONE:
Professional, expert, and encouraging. Use Indian business context (₹, GST, SMEs). 

GUIDELINES:
1. If asked about features, explain the benefit to the business owner (e.g., "save 10 hours a week on billing").
2. Always encourage the user to "Start a 14-day Free Trial" or "Book a Demo" if they seem interested.
3. Be concise but thorough. Use bullet points for readability.`;

export const publicChat = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };
  if (!messages?.length) return res.status(400).json({ message: 'messages array is required' });

  try {
    const reply = await callAI([{ role: 'system', content: SYSTEM_PUBLIC }, ...messages]);
    res.json({ reply });
  } catch (e: any) {
    logger.error(`Public Chat Error: ${e.message}`, { stack: e.stack });
    res.status(502).json({ message: 'AI service temporarily unavailable. Please try again.' });
  }
};

export const chat = async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };
  const tenantId = (req as any).user.tenantId;
  const userName = (req as any).user.name;

  if (!messages?.length) return res.status(400).json({ message: 'messages array is required' });
  if (!GROQ_KEY) return res.status(503).json({ message: 'AI service is not configured.' });

  const [orderCount, pendingOrders, itemCount, customerCount, revenue] = await Promise.all([
    prisma.order.count({ where: { tenantId } }),
    prisma.order.count({ where: { tenantId, status: 'PENDING' } }),
    prisma.item.count({ where: { tenantId } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.order.aggregate({ where: { tenantId, status: 'DELIVERED' }, _sum: { totalAmount: true } }),
  ]);

  const system = `You are the "OMS Business Intelligence Assistant". You are talking to ${userName}.
Your goal is to help them manage their business using the real-time data provided below.

CURRENT BUSINESS SNAPSHOT (Tenant ID: ${tenantId}):
- Total Orders: ${orderCount}
- Critical Attention: ${pendingOrders} PENDING orders need fulfillment.
- Catalog Size: ${itemCount} items in inventory.
- Customer Base: ${customerCount} active customers.
- Total Revenue (Delivered): ₹${(revenue._sum.totalAmount || 0).toLocaleString('en-IN')}

CAPABILITIES:
- Answer questions about their specific data (orders, revenue, etc.).
- Give advice on inventory management (e.g., "You have ${itemCount} items, consider setting low-stock alerts").
- Explain how to use modules (Production, Quality, Logistics).
- Troubleshooting and workflow optimization.

TONE:
Analytical, proactive, and helpful. Act like a high-level operations manager.
Use the data provided to give specific answers. For example, instead of saying "You have orders," say "You have ${pendingOrders} pending orders that need your attention."`;

  try {
    const reply = await callAI([{ role: 'system', content: system }, ...messages]);
    res.json({ reply });
  } catch (e: any) {
    logger.error(`BI Chat Error [Tenant: ${tenantId}]: ${e.message}`, { stack: e.stack });
    res.status(502).json({ message: 'Failed to generate BI insights. Please try again later.' });
  }
};
