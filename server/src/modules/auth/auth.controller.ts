import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../utils/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../utils/email';

// ── Token helpers ──────────────────────────────────────
const signAccess = (payload: { id: string; role: string; email: string; tenantId: string }) => {
  const opts: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'] };
  return jwt.sign(payload, process.env.JWT_SECRET!, opts);
};

const signRefresh = (userId: string) => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
  const opts: SignOptions = { expiresIn: days * 24 * 60 * 60 };
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET!, opts);
};

const randomToken = () => crypto.randomBytes(32).toString('hex');

const setRefreshCookie = (res: Response, token: string) => {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: days * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
};

// ── Register ───────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  const { orgName, email, password, phone, gstin } = req.body;
  const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 50) + '-' + Date.now();

  const existing = await prisma.tenant.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: 'An organisation with this email already exists' });

  const tenant = await prisma.tenant.create({ data: { name: orgName, slug, email, phone, gstin } });
  const hashed = await bcrypt.hash(password, 12);
  const verifyToken = randomToken();
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await prisma.user.create({
    data: { tenantId: tenant.id, name: 'Admin', email, password: hashed, role: 'ADMIN', verifyToken, verifyTokenExpiry },
  });

  await sendVerificationEmail(email, verifyToken, orgName);

  const accessToken = signAccess({ id: user.id, role: user.role, email: user.email, tenantId: tenant.id });
  const refreshToken = signRefresh(user.id);
  const expiresAt = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  setRefreshCookie(res, refreshToken);
  res.status(201).json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: tenant.id, emailVerified: false },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    message: 'Registration successful. Please check your email to verify your account.',
  });
};

// ── Login ──────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findFirst({ where: { email }, include: { tenant: true } });
  if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  if (!user.tenant.isActive) return res.status(403).json({ message: 'Organisation account is suspended' });

  const accessToken = signAccess({ id: user.id, role: user.role, email: user.email, tenantId: user.tenantId });
  const refreshToken = signRefresh(user.id);
  const expiresAt = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  setRefreshCookie(res, refreshToken);
  res.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId, emailVerified: user.emailVerified },
    tenant: { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug },
  });
};

// ── Refresh access token ───────────────────────────────
export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  let payload: { id: string };
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string };
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token }, include: { user: { include: { tenant: true } } } });
  if (!stored || stored.expiresAt < new Date()) {
    await prisma.refreshToken.deleteMany({ where: { token } });
    return res.status(401).json({ message: 'Refresh token expired, please login again' });
  }

  const { user } = stored;
  if (!user.isActive || !user.tenant.isActive) return res.status(403).json({ message: 'Account suspended' });

  // Rotate refresh token
  await prisma.refreshToken.delete({ where: { token } });
  const newRefresh = signRefresh(user.id);
  const expiresAt = new Date(Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: newRefresh, userId: user.id, expiresAt } });

  setRefreshCookie(res, newRefresh);
  const accessToken = signAccess({ id: user.id, role: user.role, email: user.email, tenantId: user.tenantId });
  res.json({ accessToken });
};

// ── Logout ─────────────────────────────────────────────
export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) await prisma.refreshToken.deleteMany({ where: { token } });
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out' });
};

// ── Logout all devices ─────────────────────────────────
export const logoutAll = async (req: AuthRequest, res: Response) => {
  await prisma.refreshToken.deleteMany({ where: { userId: req.user!.id } });
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out from all devices' });
};

// ── Verify email ───────────────────────────────────────
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  const user = await prisma.user.findFirst({ where: { verifyToken: token, verifyTokenExpiry: { gt: new Date() } } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, verifyToken: null, verifyTokenExpiry: null } });
  res.json({ message: 'Email verified successfully. You can now login.' });
};

// ── Resend verification email ──────────────────────────
export const resendVerification = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { tenant: true } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

  const verifyToken = randomToken();
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.user.update({ where: { id: user.id }, data: { verifyToken, verifyTokenExpiry } });
  await sendVerificationEmail(user.email, verifyToken, user.tenant.name);
  res.json({ message: 'Verification email sent' });
};

// ── Forgot password ────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findFirst({ where: { email } });
  // Always return 200 to prevent email enumeration
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent' });

  const resetToken = randomToken();
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.user.update({ where: { id: user.id }, data: { resetToken, resetTokenExpiry } });
  await sendPasswordResetEmail(email, resetToken);
  res.json({ message: 'If that email exists, a reset link has been sent' });
};

// ── Reset password ─────────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

  const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpiry: { gt: new Date() } } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset link' });

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed, resetToken: null, resetTokenExpiry: null } });
  // Invalidate all refresh tokens on password reset
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
  res.json({ message: 'Password reset successful. Please login with your new password.' });
};

// ── Profile ────────────────────────────────────────────
export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true, tenant: { select: { id: true, name: true, slug: true, email: true, phone: true, address: true, state: true, gstin: true } } },
  });
  res.json(user);
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name, password } = req.body;
  const data: Record<string, string> = {};
  if (name) data.name = name;
  if (password) data.password = await bcrypt.hash(password, 12);
  const user = await prisma.user.update({ where: { id: req.user!.id }, data, select: { id: true, name: true, email: true, role: true } });
  res.json(user);
};

// ── Users (admin) ──────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    where: { tenantId: req.user!.tenantId },
    select: { id: true, name: true, email: true, role: true, isActive: true, emailVerified: true, createdAt: true },
  });
  res.json(users);
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 12);
  const verifyToken = randomToken();
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  try {
    const user = await prisma.user.create({
      data: { tenantId: req.user!.tenantId, name, email, password: hashed, role, verifyToken, verifyTokenExpiry },
      select: { id: true, name: true, email: true, role: true },
    });
    const tenant = await prisma.tenant.findUnique({ where: { id: req.user!.tenantId } });
    await sendVerificationEmail(email, verifyToken, tenant?.name || 'OMS Portal');
    res.status(201).json(user);
  } catch {
    res.status(400).json({ message: 'Email already exists in this organisation' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const { name, role, isActive } = req.body;
  const target = await prisma.user.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
  if (!target) return res.status(404).json({ message: 'User not found' });
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { name, role, isActive },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  res.json(user);
};

// ── Tenant ─────────────────────────────────────────────
export const getTenant = async (req: AuthRequest, res: Response) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: req.user!.tenantId } });
  if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
  res.json(tenant);
};

export const updateTenant = async (req: AuthRequest, res: Response) => {
  const { name, phone, address, state, gstin } = req.body;
  const tenant = await prisma.tenant.update({ where: { id: req.user!.tenantId }, data: { name, phone, address, state, gstin } });
  res.json(tenant);
};
