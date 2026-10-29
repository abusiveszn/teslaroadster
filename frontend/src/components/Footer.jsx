import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, Lock, ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#050507] border-t border-white/10 text-neutral-400">
      {/* Secondary Hero Banner (Matching Reference Image Panel 8) */}
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-black via-[#0c0c10] to-black py-20">
        <div className="absolute inset-0 z-0 opacity-45 pointer-events-none">
          <img
            src="/images/roadster-banner.jpg"
            alt="Tesla Roadster Night Mountain"
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Drive the Future <br />
              <span className="text-tesla-red">with Tesla Roadster.</span>
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg">
              Innovation. Performance. Exclusivity. Reserve your next-generation electric supercar.
            </p>
          </div>

          <div>
            <Link
              to="/roadster"
              className="btn-tesla-primary text-base px-8 py-3.5 flex items-center gap-2 group shadow-glow-red"
            >
              <span>Reserve Now</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* Logo and badges */}
          <div className="flex flex-wrap items-center gap-6">
            <span className="tracking-[0.4em] font-bold text-white text-base">TESLA</span>
            
            <div className="flex items-center gap-1.5 text-xs text-neutral-300">
              <RotateCcw size={14} className="text-tesla-red" />
              <span>Full Reservation Guarantee</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-300">
              <Lock size={14} className="text-emerald-400" />
              <span>256-Bit Encrypted Checkout</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400">
            <Link to="/" className="hover:text-white transition-colors">About</Link>
            <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link to="/roadster" className="hover:text-white transition-colors">Shop</Link>
            <Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link to="/admin" className="hover:text-tesla-red transition-colors">Admin Access</Link>
          </div>

          {/* Community Socials */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-neutral-500">Join our community</span>
            <div className="flex items-center gap-3">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="X Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-8 text-center md:text-left space-y-2">
          <p className="text-[11px] leading-relaxed text-neutral-500 max-w-4xl mx-auto md:mx-0">
            <strong>Tesla Roadster:</strong> Pre-sale reservation platform. Specifications and production timeline subject to final engineering validation. All reservations receive priority delivery positioning and dedicated vehicle allocation.
          </p>
          <p className="text-[10px] text-neutral-600">
            © 2026 Tesla, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
