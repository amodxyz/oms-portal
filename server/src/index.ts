import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

// ── Startup safety checks ──────────────────────────────
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  console.error('FATAL: REFRESH_TOKEN_SECRET environment variable is not set. Refusing to start.');
  process.exit(1);
}

import authRoutes from './modules/auth/auth.routes';
import itemRoutes from './modules/items/items.routes';
import salesRoutes from './modules/sales/sales.routes';
import purchasingRoutes from './modules/purchasing/purchasing.routes';
import productionRoutes from './modules/production/production.routes';
import qualityRoutes from './modules/quality/quality.routes';
import logisticsRoutes from './modules/logistics/logistics.routes';
import reportRoutes from './modules/reports/reports.routes';
import billingRoutes from './modules/billing/billing.routes';
import superAdminRoutes from './modules/superadmin/superadmin.routes';
import chatbotRoutes from './modules/chatbot/chatbot.routes';
import employeeRoutes from './modules/employees/employees.routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import logger from './utils/logger';
import prisma from './utils/prisma';

const app = express();
// Trust Vercel's reverse proxy for correct IP tracking (fixes express-rate-limit 500 error)
app.set('trust proxy', true);

const PORT = process.env.PORT || 5000;

// ── Security headers ───────────────────────────────────
app.use(helmet());
app.use(cookieParser());

// ── CORS ───────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://oms.digitaladwords.in',
  'https://oms-portal.digitaladwords.in',
  'https://oms-portal-client.vercel.app',
  ...(process.env.CLIENT_URL || '').split(',').map(o => o.trim())
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      // Return false instead of throwing to allow the middleware to handle it gracefully
      cb(null, false);
    }
  },
  credentials: true,
}));

// ── Request logging ────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ── Body parsing ───────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Rate limiting ──────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // Increased from 10 to 30
  message: { message: 'Too many chatbot requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/chatbot', chatbotLimiter);
app.use('/api/', apiLimiter);

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchasing', purchasingRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/employees', employeeRoutes);

// ── Health check (with DB ping) ────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const tenantCount = await prisma.tenant.count();
    res.json({ 
      status: 'OK', 
      db: 'connected', 
      tables: { tenant: 'exists', count: tenantCount },
      timestamp: new Date() 
    });
  } catch (err: any) {
    res.status(503).json({ 
      status: 'ERROR', 
      db: 'connected', 
      error: err.message,
      timestamp: new Date() 
    });
  }
});

// ── 404 + Error handlers ───────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server (skip in serverless/Vercel) ──────────
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Server closed, DB disconnected');
      process.exit(0);
    });
    setTimeout(() => { logger.error('Forced shutdown after timeout'); process.exit(1); }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => { logger.error('Unhandled rejection:', reason); });
process.on('uncaughtException', (err) => { logger.error('Uncaught exception:', err); process.exit(1); });

export default app;
