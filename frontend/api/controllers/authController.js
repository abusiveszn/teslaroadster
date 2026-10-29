import bcrypt from 'bcryptjs';
import { Users, PendingRegistrations } from '../models/store.js';
import { generateToken } from '../middleware/auth.js';
import {
  sendVerificationEmail,
  verifyCode,
  sendLoginOtpEmail,
  verifyLoginOtpCode,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  getEmailLogs
} from '../utils/emailService.js';

// Store pending registrations until verified with OTP
const pendingRegistrations = new Map();

export const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Users.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

      const pendingData = {
        fullName: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000 // 15 mins
  };

  // Save pending registration in memory and persistent HybridStore for serverless
  pendingRegistrations.set(cleanEmail, pendingData);
  try {
    const existingPending = await PendingRegistrations.findOne({ email: cleanEmail });
    if (existingPending) {
      await PendingRegistrations.findByIdAndUpdate(existingPending._id, pendingData);
    } else {
      await PendingRegistrations.create(pendingData);
    }
  } catch (e) {
    // Non-blocking fallback
  }

  const emailResult = await sendVerificationEmail(cleanEmail, fullName.trim());

  return res.status(200).json({
    message: 'Verification code sent to your email. Please verify with the OTP to complete registration.',
    email: cleanEmail,
    realEmailSent: emailResult.realEmailSent
  });
} catch (err) {
  console.error('Registration error:', err);
  return res.status(500).json({ error: 'Internal server error during registration.' });
}
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await verifyCode(cleanEmail, code);
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    let user;
    let pending = pendingRegistrations.get(cleanEmail);
    if (!pending) {
      try {
        pending = await PendingRegistrations.findOne({ email: cleanEmail });
      } catch (e) { }
    }

    if (pending) {
      // Create user account only now upon verified OTP
      user = await Users.create({
        fullName: pending.fullName,
        email: cleanEmail,
        passwordHash: pending.passwordHash,
        role: 'customer',
        emailVerified: true
      });
      pendingRegistrations.delete(cleanEmail);
      try {
        if (pending._id) {
          await PendingRegistrations.findByIdAndDelete(pending._id);
        } else {
          const stored = await PendingRegistrations.findOne({ email: cleanEmail });
          if (stored) await PendingRegistrations.findByIdAndDelete(stored._id);
        }
      } catch (e) { }
    } else {
      user = await Users.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ error: 'Registration session expired or account not found. Please register again.' });
      }
      user = await Users.findByIdAndUpdate(user._id, { emailVerified: true });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Account verified successfully! Welcome to Tesla Roadster Pre-Sale.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: true
      },
      token
    });
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ error: 'Failed to verify email.' });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    let pending = pendingRegistrations.get(cleanEmail);
    if (!pending) {
      try {
        pending = await PendingRegistrations.findOne({ email: cleanEmail });
      } catch (e) { }
    }
    const existing = await Users.findOne({ email: cleanEmail });

    if (!pending && !existing) {
      return res.status(404).json({ error: 'No pending registration found for this email. Please register again.' });
    }

    const fullName = pending ? pending.fullName : existing.fullName;
    const emailResult = await sendVerificationEmail(cleanEmail, fullName);

    return res.json({
      message: 'A new verification code has been dispatched to your email.',
      realEmailSent: emailResult.realEmailSent
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resend code.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await Users.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Signed in successfully.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    return res.json({
      user: {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        emailVerified: req.user.emailVerified
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const cleanEmail = email.trim().toLowerCase();
    const user = await Users.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ error: 'No account found with this email.' });

    const result = await sendPasswordResetEmail(cleanEmail);
    return res.json({
      message: 'Password reset code sent to your email.',
      realEmailSent: result.realEmailSent
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const valid = verifyPasswordResetCode(cleanEmail, code);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid or expired password reset code.' });
    }

    const user = await Users.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await Users.findByIdAndUpdate(user._id, { passwordHash });

    return res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
};

export const getDemoLogs = async (req, res) => {
  return res.json({ logs: getEmailLogs() });
};

export const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await Users.findOne({ email: cleanEmail });

    if (user && user.role === 'admin') {
      return res.status(400).json({ error: 'Administrator accounts must sign in directly using administrator password.' });
    }

    const fullName = user ? user.fullName : cleanEmail.split('@')[0];

    const emailResult = await sendLoginOtpEmail(cleanEmail, fullName);

    return res.json({
      message: `A 6-digit OTP code has been sent to ${cleanEmail}. Please check your email.`,
      isExistingUser: !!user,
      realEmailSent: emailResult.realEmailSent
    });
  } catch (err) {
    console.error('Send login OTP error:', err);
    return res.status(500).json({ error: 'Failed to send login OTP code.' });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await verifyLoginOtpCode(cleanEmail, code);
    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    let user = await Users.findOne({ email: cleanEmail });
    if (!user) {
      // Auto-register customer if logging in with verified email OTP for the first time
      const rawName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      user = await Users.create({
        fullName: formattedName,
        email: cleanEmail,
        passwordHash: '',
        role: 'customer',
        emailVerified: true
      });
    } else if (!user.emailVerified) {
      user = await Users.findByIdAndUpdate(user._id, { emailVerified: true });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Signed in successfully via Email OTP.',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      },
      token
    });
  } catch (err) {
    console.error('Verify login OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify login OTP.' });
  }
};

