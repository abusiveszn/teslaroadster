import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Compass, 
  Gauge, 
  ArrowRight, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Award,
  ChevronRight
} from 'lucide-react';

export const HomePage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [heroColor, setHeroColor] = useState('red');

  const heroColors = [
    { id: 'red', name: 'Ultra Deep Red', hex: '#E82127', image: '/images/roadster-red.jpg' },
    { id: 'black', name: 'Solid Midnight Black', hex: '#0a0a0c', image: '/images/roadster-black.jpg' },
    { id: 'white', name: 'Pearl White Multi-Coat', hex: '#f8f9fa', image: '/images/roadster-white.jpg' },
    { id: 'silver', name: 'Quicksilver Metallic', hex: '#8a8d91', image: '/images/roadster-silver.jpg' },
    { id: 'blue', name: 'Deep Blue Metallic', hex: '#0047AB', image: '/images/roadster-blue.jpg' },
  ];

  const currentHeroImg = heroColors.find(c => c.id === heroColor)?.image || '/images/roadster-red.jpg';

  const faqs = [
    {
      q: 'How does the Roadster pre-sale reservation work?',
      a: 'Your pre-sale reservation secures your production build slot and delivery sequence. You can fully customize your Roadster specifications, select exclusive packages, and apply pre-sale promotional benefits.'
    },
    {
      q: 'How does the pre-sale promotional discount work?',
      a: 'Eligible reservation holders can enter their exclusive promotional code during vehicle configuration to unlock early reservation pricing on all Roadster packages.'
    },
    {
      q: 'What payment methods are supported for reservation?',
      a: 'We accept major Bank Cards (Credit/Debit), Bitcoin (BTC), and USDT (Tether) with automated verification.'
    },
    {
      q: 'How can I track my reservation status?',
      a: 'Once your reservation is confirmed, your customer dashboard provides real-time tracking of your production slot, vehicle configuration, and printable reservation agreements.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white overflow-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-12 pb-10 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        {/* Ambient Dark Neon Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-tesla-red/15 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-rose-700/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 my-auto">
          {/* Left Column: Hero Content */}
          <div className="max-w-xl space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-tesla-red animate-pulse" />
              <span>Official Pre-Sale Reservation</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              The Next Era <br />
              of <span className="text-tesla-red">Performance.</span>
            </h1>

            <p className="text-neutral-400 text-lg sm:text-xl font-normal">
              Exclusive Tesla Roadster Pre-Sale <br />
              <span className="text-white font-medium">Special 60% Pre-Order Benefit</span> — Limited Allocation.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/roadster"
                className="btn-tesla-primary text-base px-8 py-3.5 flex items-center gap-3 group shadow-glow-red"
              >
                <span>Reserve Your Roadster</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#specs"
                className="btn-tesla-secondary text-sm px-6 py-3.5 text-neutral-300 hover:text-white"
              >
                Explore Specifications
              </a>
            </div>
          </div>

          {/* Right Column: Hero Roadster Image with Interactive Color Selector */}
          <div className="relative w-full max-w-2xl group space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-b from-white/5 to-transparent">
              <img
                key={currentHeroImg}
                src={currentHeroImg}
                alt="Tesla Roadster"
                className="w-full h-[320px] sm:h-[420px] object-cover object-center transform group-hover:scale-[1.01] transition-all duration-500 animate-fadeIn"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/80 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Color name badge */}
              <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs text-neutral-200">
                {heroColors.find(c => c.id === heroColor)?.name}
              </div>
            </div>

            {/* Quick Hero Color Switcher */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mr-1">Exterior:</span>
              {heroColors.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setHeroColor(col.id)}
                  title={col.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${
                    heroColor === col.id
                      ? 'border-tesla-red ring-2 ring-tesla-red/40 scale-110 shadow-glow-red'
                      : 'border-white/20 hover:border-white/50 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col.hex }}
                >
                  {heroColor === col.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Spec Pills Bar (Matching Reference Image bottom row) */}
        <div id="specs" className="relative z-10 max-w-7xl mx-auto w-full pt-8">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 border-t border-white/10 pt-6">
            {/* 0-60 mph */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-tesla-red">
                <Zap size={20} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">1.9s</div>
                <div className="text-xs text-neutral-400 font-medium">0-60 mph</div>
              </div>
            </div>

            {/* Range */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-tesla-red">
                <Compass size={20} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">620 mi</div>
                <div className="text-xs text-neutral-400 font-medium">Range</div>
              </div>
            </div>

            {/* Power */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-tesla-red">
                <Gauge size={20} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">1,250 hp</div>
                <div className="text-xs text-neutral-400 font-medium">Power</div>
              </div>
            </div>

            {/* Top Speed */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-tesla-red">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">250+ mph</div>
                <div className="text-xs text-neutral-400 font-medium">Top Speed</div>
              </div>
            </div>

            {/* Mouse scroll indicator */}
            <div className="hidden lg:flex ml-auto items-center gap-2 text-xs text-neutral-500">
              <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
                <div className="w-1 h-2 bg-tesla-red rounded-full animate-bounce" />
              </div>
              <span>Scroll to explore</span>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Vehicle Introduction Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-widest uppercase text-tesla-red">Pure Engineering</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Designed to Shatter Every Record.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            As an all-electric supercar, Roadster maximizes the potential of aerodynamic engineering—with record-setting acceleration, range and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-tesla-red/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red">
              <Layers size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Tri-Motor AWD</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Three electric motors—one in the front and two in the rear—deliver all-wheel drive and torque vectoring for unparalleled handling and grip.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-tesla-red/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">620 Miles Highway Range</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              A 200 kWh structural battery pack provides 620 miles of highway range at speed without sacrificing blistering track capability.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-tesla-red/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Removable Glass Roof</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              A lightweight, removable glass roof stores conveniently in the trunk for an open-air convertible sports car driving experience.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Journey */}
      <section id="how-it-works" className="py-20 bg-[#0a0a0d] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest uppercase text-tesla-red">Reservation Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">How Pre-Sale Reservation Works</h2>
            <p className="text-neutral-400 text-sm">Secure your production allocation and build sequence in three streamlined steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 relative">
              <div className="text-4xl font-extrabold text-white/10 font-mono">01</div>
              <h3 className="text-lg font-bold text-white">Configure Your Vehicle</h3>
              <p className="text-sm text-neutral-400">
                Select your exterior paint, wheels, interior materials, and performance package on the vehicle detail page.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 relative border-tesla-red/30">
              <div className="text-4xl font-extrabold text-tesla-red/20 font-mono">02</div>
              <h3 className="text-lg font-bold text-white">Apply Pre-Sale Promo</h3>
              <p className="text-sm text-neutral-400">
                Enter your private promotional code during vehicle configuration to receive exclusive reservation discounts verified instantly before checkout.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 relative">
              <div className="text-4xl font-extrabold text-white/10 font-mono">03</div>
              <h3 className="text-lg font-bold text-white">Secured Payment & Portal</h3>
              <p className="text-sm text-neutral-400">
                Complete your deposit securely, receive immediate reservation confirmation and access your dedicated customer dashboard.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/roadster" className="btn-tesla-primary text-sm px-8 py-3 inline-flex items-center gap-2 shadow-glow-red">
              <span>Reserve Your Roadster</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faqs" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <span className="text-xs font-bold tracking-widest uppercase text-tesla-red">Have Questions?</span>
          <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="glass-card rounded-xl overflow-hidden border border-white/10 transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-neutral-200"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-neutral-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-tesla-red' : ''}`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-sm text-neutral-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center pt-8">
          <Link
            to="/faq"
            className="btn-tesla-secondary text-sm px-6 py-3 inline-flex items-center gap-2 hover:border-tesla-red/40 transition-all group"
          >
            <span>View All Frequently Asked Questions</span>
            <ArrowRight size={16} className="text-tesla-red group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};
