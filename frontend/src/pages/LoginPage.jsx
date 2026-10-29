import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldAlert, Shield, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';
  const isAdminLogin = from === '/admin' || location.search.includes('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#070709] relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-tesla-red/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="tracking-[0.4em] text-2xl font-bold text-white">TESLA</div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isAdminLogin ? 'Administrator Sign In' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-neutral-400">
            {isAdminLogin
              ? 'Authorized administrative personnel access.'
              : 'Sign in to manage your Tesla Roadster pre-orders and configuration.'}
          </p>
        </div>

        {isAdminLogin && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-tesla-red bg-tesla-red/10 border border-tesla-red/20 py-2 px-3 rounded-xl">
            <Shield size={14} />
            <span>Administrator Security Portal</span>
          </div>
        )}

        <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2 animate-fadeIn">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141419] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-tesla-red transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#141419] border border-white/10 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-tesla-red transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-tesla-primary py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2 shadow-glow-red disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {!isAdminLogin && (
            <div className="text-center text-xs text-neutral-400 border-t border-white/10 pt-4">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-tesla-red hover:underline font-semibold">
                Register Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
