import nodemailer from 'nodemailer';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
});

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const FROM = process.env.EMAIL_FROM || 'OMS Portal <noreply@omsportal.com>';

const send = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}:`, err);
    // Don't throw — email failure should not crash the request in dev
    if (process.env.NODE_ENV === 'production') throw err;
  }
};

export const sendVerificationEmail = (to: string, token: string, orgName: string) =>
  send(to, 'Verify your OMS Portal account', `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Welcome to OMS Portal!</h2>
      <p>Hi, thanks for registering <strong>${orgName}</strong>.</p>
      <p>Please verify your email address to activate your account:</p>
      <a href="${CLIENT_URL}/verify-email?token=${token}"
         style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
        Verify Email
      </a>
      <p style="color:#888;font-size:12px;margin-top:24px">This link expires in 24 hours. If you didn't register, ignore this email.</p>
    </div>
  `);

export const sendPasswordResetEmail = (to: string, token: string) =>
  send(to, 'Reset your OMS Portal password', `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${CLIENT_URL}/reset-password?token=${token}"
         style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
        Reset Password
      </a>
      <p style="color:#888;font-size:12px;margin-top:24px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `);
