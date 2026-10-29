import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Sparkles, LogOut, ChevronDown, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleHowItWorksClick = (e) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById('how-it-works');
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070709]/85 backdrop-blur-xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Tesla Logo */}
        <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="flex items-center tracking-[0.35em] text-lg font-bold text-white group-hover:text-tesla-red transition-colors">
            TESLA
          </div>
        </Link>

        {/* Center Navigation Links (Admin Panel removed from nav bar) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            to="/roadster"
            className={`text-sm font-medium transition-colors ${
              isActive('/roadster') ? 'text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Roadster
          </Link>
          <Link
            to="/#how-it-works"
            onClick={handleHowItWorksClick}
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            How It Works
          </Link>
          <Link
            to="/faq"
            className={`text-sm font-medium transition-colors ${
              isActive('/faq') || isActive('/faqs') ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            FAQs
          </Link>
          {/* Only customer dashboard is displayed in the nav bar; Admin Panel is removed from nav bar */}
          {isAuthenticated && !isAdmin && (
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-tesla-red font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-neutral-300 hover:text-white px-2.5 sm:px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-tesla-primary text-xs sm:text-sm px-4 sm:px-5 py-2 shadow-glow-red"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-tesla-card hover:bg-tesla-card-hover border border-white/10 px-3 py-1.5 rounded-full transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-tesla-red to-rose-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-neutral-200 hidden sm:inline max-w-[120px] truncate">
                  {user?.fullName?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={16} className="text-neutral-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-tesla-card border border-white/15 rounded-xl shadow-2xl py-2 z-50 text-sm backdrop-blur-xl"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="font-semibold text-white truncate">{user?.fullName}</p>
                    <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-tesla-red">
                      {user?.role === 'admin' ? 'System Admin' : 'Customer'}
                    </span>
                  </div>

                  {user?.role === 'admin' ? (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <LayoutDashboard size={16} /> My Pre-Orders
                    </Link>
                  )}

                  <Link
                    to="/roadster"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Sparkles size={16} /> Configure Roadster
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-400 hover:bg-white/10 transition-colors text-left border-t border-white/10 mt-1"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0e] border-b border-white/10 px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-medium ${
              isActive('/') ? 'text-tesla-red font-semibold' : 'text-neutral-300'
            }`}
          >
            Home
          </Link>
          <Link
            to="/roadster"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-medium ${
              isActive('/roadster') ? 'text-tesla-red font-semibold' : 'text-neutral-300'
            }`}
          >
            Roadster
          </Link>
          <Link
            to="/#how-it-works"
            onClick={handleHowItWorksClick}
            className="block py-2 text-sm font-medium text-neutral-300"
          >
            How It Works
          </Link>
          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-medium ${
              isActive('/faq') || isActive('/faqs') ? 'text-tesla-red font-semibold' : 'text-neutral-300'
            }`}
          >
            FAQs
          </Link>
          {isAuthenticated && !isAdmin && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 text-sm font-medium ${
                isActive('/dashboard') ? 'text-tesla-red font-semibold' : 'text-neutral-300'
              }`}
            >
              Customer Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
