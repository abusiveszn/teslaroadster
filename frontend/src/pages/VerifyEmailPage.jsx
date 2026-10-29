import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MailCheck, AlertCircle, ArrowRight, RefreshCw, Inbox } from 'lucide-react';

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(email, code);
      navigate('/roadster', { state: { justVerified: true } });
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code in your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setResending(true);
    setError('');
    try {
      await api.resendVerificationCode(email);
      setResendStatus('A new 6-digit verification code has been sent to your email.');
      setResendCooldown(30);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#070709] relative">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red">
            <MailCheck size={28} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Verify Your Email</h2>
          <p className="text-sm text-neutral-400">
            We sent a 6-digit verification code to <br />
            <span className="text-white font-medium">{email || 'your email'}</span>
          </p>
        </div>

        {/* Email instruction notice */}
        <div className="bg-[#121217] border border-white/10 rounded-xl p-3.5 flex items-center gap-3 text-xs text-neutral-300">
          <Inbox size={18} className="text-tesla-red shrink-0" />
          <span>
            Please check your email inbox (and spam folder) for the 6-digit code. Your account will only be opened once verified.
          </span>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resendStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              {resendStatus}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2 text-center">
                Enter 6-Digit Code from Your Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 bg-[#141419] border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-tesla-red transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full btn-tesla-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-glow-red disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify & Open Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-white/10 pt-4">
            <span>Didn't receive a code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="text-tesla-red hover:underline font-semibold disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
              <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
