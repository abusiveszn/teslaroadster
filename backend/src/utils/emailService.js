import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { OtpVerifications } from '../models/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendEnvPath = path.resolve(__dirname, '../../.env');

// In-memory logs and stores for verification/login OTPs
const emailLogs = [];
const verificationCodes = new Map();
const loginCodes = new Map();
const passwordResetCodes = new Map();

/**
 * Creates and returns a Nodemailer transporter if SMTP environment variables are configured.
 * Supports either SMTP_SERVICE (e.g. 'gmail') or standard SMTP host/port.
 */
const createTransporter = () => {
  // Always load latest backend/.env values in case configuration was updated
  dotenv.config({ path: backendEnvPath, override: true });
  dotenv.config({ override: true });

  const service = process.env.SMTP_SERVICE?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  // Strip spaces if user copied a Google 16-character App Password (e.g. 'xxxx yyyy zzzz aaaa')
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (service && user && pass) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // If host is configured without auth (e.g., local mail dev server like MailHog)
  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  return null;
};

/**
 * Modern Tesla-themed HTML email template for OTP delivery
 */
const renderEmailHtml = ({ title, preheader, headline, bodyText, code, validityMinutes = 15 }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #070709;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e5e7eb;
    }
    .wrapper {
      width: 100%;
      background-color: #070709;
      padding: 40px 16px;
    }
    .container {
      max-width: 540px;
      margin: 0 auto;
      background: #101015;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .header {
      padding: 32px 24px;
      text-align: center;
      background: linear-gradient(180deg, #181820 0%, #101015 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.35em;
      color: #ffffff;
      margin-bottom: 8px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(232, 33, 39, 0.15);
      border: 1px solid rgba(232, 33, 39, 0.35);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      color: #ff5258;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .content {
      padding: 36px 32px;
    }
    .headline {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 12px 0;
    }
    .paragraph {
      font-size: 14px;
      line-height: 1.6;
      color: #9ca3af;
      margin: 0 0 24px 0;
    }
    .otp-card {
      background: #16161f;
      border: 1px solid rgba(232, 33, 39, 0.3);
      border-radius: 12px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    .otp-number {
      font-family: 'SF Mono', Consolas, Monaco, 'Courier New', monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 0 20px rgba(232, 33, 39, 0.4);
    }
    .otp-expiry {
      font-size: 12px;
      color: #6b7280;
      margin-top: 10px;
    }
    .notice {
      font-size: 12px;
      line-height: 1.5;
      color: #6b7280;
      border-left: 2px solid rgba(232, 33, 39, 0.5);
      padding-left: 12px;
      margin-top: 24px;
    }
    .footer {
      padding: 24px 32px;
      background: #0b0b0e;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
      font-size: 12px;
      color: #4b5563;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">ROADSTER</div>
        <span class="badge">Security Verification</span>
      </div>
      <div class="content">
        <h1 class="headline">${headline}</h1>
        <p class="paragraph">${bodyText}</p>
        
        <div class="otp-card">
          <div class="otp-label">One-Time Verification Code</div>
          <div class="otp-number">${code}</div>
          <div class="otp-expiry">Expires in ${validityMinutes} minutes</div>
        </div>

        <div class="notice">
          If you did not initiate this request, no action is required. Your account remains secure.
        </div>
      </div>
      <div class="footer">
        Roadster Pre-Sale Reservation Portal<br>
        Automated Security Dispatch &bull; Please do not reply directly to this email.
      </div>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Internal delivery engine: attempts Nodemailer first, falls back gracefully to console/memory
 */
const deliverEmail = async ({ to, subject, html, text, code, type }) => {
  const cleanEmail = to.trim().toLowerCase();
  const emailRecord = {
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    to: cleanEmail,
    subject,
    code,
    type,
    timestamp: new Date().toISOString(),
    content: text,
  };

  emailLogs.unshift(emailRecord);

  const transporter = createTransporter();
  let realEmailSent = false;

  if (transporter) {
    try {
      const from = process.env.SMTP_FROM || `"Roadster Portal" <${process.env.SMTP_USER || 'teslasupporttech@gmail.com'}>`;
      const info = await transporter.sendMail({
        from,
        to: cleanEmail,
        subject,
        text,
        html,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
        },
      });
      console.log(`[Email Service] Live email delivered to ${cleanEmail} (ID: ${info.messageId})`);
      realEmailSent = true;
    } catch (err) {
      console.error(`[Email Service Error] Failed to send live email to ${cleanEmail}:`, err.message);
      console.log(`[Email Service Fallback] OTP for ${cleanEmail} is: ${code}`);
    }
  } else {
    console.log(`[Demo Email Service] Transporter not configured in .env. OTP for ${cleanEmail}: ${code}`);
  }

  return { success: true, code, realEmailSent, preview: emailRecord };
};

/**
 * 1. Registration Verification OTP
 */
export const sendVerificationEmail = async (email, fullName = 'Valued Customer') => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const cleanEmail = email.trim().toLowerCase();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  verificationCodes.set(cleanEmail, {
    code,
    expiresAt,
  });

  try {
    const existing = await OtpVerifications.findOne({ email: cleanEmail, type: 'registration_verify' });
    if (existing) {
      await OtpVerifications.findByIdAndUpdate(existing._id, { code, expiresAt });
    } else {
      await OtpVerifications.create({ email: cleanEmail, code, expiresAt, type: 'registration_verify' });
    }
  } catch (err) {
    // Non-blocking fallback
  }

  const subject = `Your Verification Code: ${code}`;
  const text = `Hello ${fullName},\n\nYour 6-digit verification code is: ${code}\n\nValid for 15 minutes.\n\nIf you did not request this code, please disregard this email.`;
  const html = renderEmailHtml({
    title: 'Verification Code',
    preheader: `Your verification code is ${code}`,
    headline: 'Confirm Your Email Address',
    bodyText: `Hello ${fullName}, use the verification code below to verify your email and complete your reservation account registration.`,
    code,
    validityMinutes: 15,
  });

  return deliverEmail({ to: cleanEmail, subject, html, text, code, type: 'registration_verify' });
};

  export const verifyCode = async (email, code) => {
    const cleanEmail = email.trim().toLowerCase();
    let record = verificationCodes.get(cleanEmail);

    if (!record) {
      try {
        record = await OtpVerifications.findOne({ email: cleanEmail, type: 'registration_verify' });
      } catch (err) { }
    }

    if (!record) {
      return { valid: false, message: 'No verification code found or it has expired.' };
    }
    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(cleanEmail);
      try { if (record._id) await OtpVerifications.findByIdAndDelete(record._id); } catch { }
      return { valid: false, message: 'Verification code has expired. Please request a new one.' };
    }
    if (record.code !== code.trim()) {
      return { valid: false, message: 'Invalid verification code. Please check and try again.' };
    }

    verificationCodes.delete(cleanEmail);
    try { if (record._id) await OtpVerifications.findByIdAndDelete(record._id); } catch { }
    return { valid: true };
  };

  /**
   * 2. Login via Email OTP
   */
  export const sendLoginOtpEmail = async (email, fullName = 'Valued Customer') => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanEmail = email.trim().toLowerCase();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    loginCodes.set(cleanEmail, {
      code,
      expiresAt,
    });

    try {
      const existing = await OtpVerifications.findOne({ email: cleanEmail, type: 'login_otp' });
      if (existing) {
        await OtpVerifications.findByIdAndUpdate(existing._id, { code, expiresAt });
      } else {
        await OtpVerifications.create({ email: cleanEmail, code, expiresAt, type: 'login_otp' });
      }
    } catch (err) { }

    const subject = `Your Sign-In Code: ${code}`;
    const text = `Hello ${fullName},\n\nYour 6-digit one-time sign-in code is: ${code}\n\nValid for 10 minutes.\n\nIf you did not request this code, please disregard this email.`;
    const html = renderEmailHtml({
      title: 'Sign In Code',
      preheader: `Your sign-in code is ${code}`,
      headline: 'Sign In to Your Account',
      bodyText: `Hello ${fullName}, use the one-time passcode below to securely access your Roadster Pre-Sale reservation and configuration portal.`,
      code,
      validityMinutes: 10,
    });

    return deliverEmail({ to: cleanEmail, subject, html, text, code, type: 'login_otp' });
  };

    export const verifyLoginOtpCode = async (email, code) => {
      const cleanEmail = email.trim().toLowerCase();
      let record = loginCodes.get(cleanEmail);

      if (!record) {
        try {
          record = await OtpVerifications.findOne({ email: cleanEmail, type: 'login_otp' });
        } catch (err) { }
      }

      if (!record) {
        return { valid: false, message: 'No login code found or it has expired. Please request a new one.' };
      }
      if (Date.now() > record.expiresAt) {
        loginCodes.delete(cleanEmail);
        try { if (record._id) await OtpVerifications.findByIdAndDelete(record._id); } catch { }
        return { valid: false, message: 'Login code has expired. Please request a new one.' };
      }
      if (record.code !== code.trim()) {
        return { valid: false, message: 'Invalid OTP code. Please check your email and try again.' };
      }

      loginCodes.delete(cleanEmail);
      try { if (record._id) await OtpVerifications.findByIdAndDelete(record._id); } catch { }
      return { valid: true };
    };

    /**
     * 3. Password Reset OTP
     */
    export const sendPasswordResetEmail = async (email) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const cleanEmail = email.trim().toLowerCase();

      passwordResetCodes.set(cleanEmail, {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });

      const subject = `${code} is your Tesla Roadster password reset code`;
      const text = `Your password reset code for Tesla Roadster Pre-Sale is: ${code}\n\nValid for 15 minutes.`;
      const html = renderEmailHtml({
        title: 'Password Reset Code',
        preheader: `Your reset code is ${code}`,
        headline: 'Reset Your Password',
        bodyText: 'We received a request to reset your password. Use the security code below to complete the reset process.',
        code,
        validityMinutes: 15,
      });

      return deliverEmail({ to: cleanEmail, subject, html, text, code, type: 'password_reset' });
    };

    export const verifyPasswordResetCode = (email, code) => {
      const cleanEmail = email.trim().toLowerCase();
      const record = passwordResetCodes.get(cleanEmail);

      if (!record || Date.now() > record.expiresAt || record.code !== code.trim()) {
        return false;
      }
      passwordResetCodes.delete(cleanEmail);
      return true;
    };

    export const getEmailLogs = () => emailLogs.slice(0, 50);
