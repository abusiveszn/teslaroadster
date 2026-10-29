import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Car,
  Clock,
  ArrowRight,
  MessageSquare,
  FileText,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';

export const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // Open first question by default
  const [feedbackState, setFeedbackState] = useState({});

  const categories = [
    { id: 'all', label: 'All Questions', icon: HelpCircle },
    { id: 'reservation', label: 'Reservation & Ordering', icon: Car },
    { id: 'pricing', label: 'Pricing & Promo Codes', icon: Sparkles },
    { id: 'specs', label: 'Performance & Specs', icon: Zap },
    { id: 'payments', label: 'Payments & Verification', icon: CreditCard },
    { id: 'delivery', label: 'Production & Delivery', icon: Clock },
  ];

  const faqs = [
    // Reservation & Ordering
    {
      category: 'reservation',
      question: 'How does the Tesla Roadster pre-sale reservation work?',
      answer: `Your pre-sale reservation secures your official production build sequence and vehicle allocation slot for the next-generation Tesla Roadster. 
      Once you submit your configuration and complete the initial deposit, you receive an instant confirmation along with a unique reservation ID and access to your dedicated Customer Portal where you can review your configuration, download printable reservation documents, and track your order status in real time.`
    },
    {
      category: 'reservation',
      question: 'Is my reservation deposit fully refundable?',
      answer: `Yes, all early pre-sale reservations are subject to our comprehensive customer guarantee. You may modify your vehicle preferences or request a full cancellation of your reservation deposit prior to the final production freeze window. Our customer concierge team processes cancellation requests within 3 to 5 business days.`
    },
    {
      category: 'reservation',
      question: 'Can I change my vehicle specifications after placing the order?',
      answer: `Absolutely. You can update your exterior paint choice, wheel aerodynamic package, interior upholstery, and optional SpaceX Thruster Package directly through your Customer Dashboard or by contacting your allocated Tesla delivery advisor before manufacturing begins.`
    },
    {
      category: 'reservation',
      question: 'How will I track my production slot and delivery status?',
      answer: `Each confirmed reservation holder is granted access to the Tesla Customer Portal. Your dashboard provides a live visual status bar tracking reservation approval, payment verification, VIN allocation, production scheduling, and estimated delivery window.`
    },

    // Pricing & Promo Codes
    {
      category: 'pricing',
      question: 'How does the 60% pre-sale promotional benefit work?',
      answer: `Qualified early reservation holders who receive an authorized promotional coupon code can apply it during vehicle configuration on the Roadster detail page. Upon validation, the promotional discount is immediately deducted from the total vehicle purchase price and reflected on your deposit breakdown before final checkout.`
    },
    {
      category: 'pricing',
      question: 'Can promotional codes be transferred or shared?',
      answer: `Promotional coupon codes are tied to individual pre-sale campaign allocations. Each code has specific usage limits, expiry timestamps, and tier allowances. Once verified and redeemed during a successful checkout, the code is locked to that reservation order.`
    },
    {
      category: 'pricing',
      question: 'Are taxes, registration, and destination charges included in the reservation price?',
      answer: `The reservation deposit secures your vehicle purchase price. Local sales taxes, import tariffs (for international deliveries), registration fees, and final destination handling will be calculated and finalized prior to vehicle delivery based on your registered jurisdiction.`
    },
    {
      category: 'pricing',
      question: 'Does placing a reservation protect me against future price increases?',
      answer: `Yes. Placing an early pre-sale reservation locks in your baseline vehicle configuration price and promotional discount terms, shielding your order against future price adjustments or inflation prior to launch.`
    },

    // Performance & Specifications
    {
      category: 'specs',
      question: 'What are the performance specifications of the Tesla Roadster?',
      answer: `The Tesla Roadster is engineered to set all-time records for acceleration, range, and aerodynamic efficiency:
      • Acceleration 0-60 mph: 1.9 seconds (standard) / under 1.1 seconds with the SpaceX Package
      • Top Speed: In excess of 250+ mph (400+ km/h)
      • Wheel Torque: 10,000 Nm
      • Highway Range: Up to 620 miles (1,000 km) on a single charge
      • Drivetrain: Tri-Motor All-Wheel Drive with independent torque vectoring`
    },
    {
      category: 'specs',
      question: 'What is the optional SpaceX Thruster Package?',
      answer: `The optional SpaceX Package incorporates miniature cold gas thrusters developed in collaboration with SpaceX rocket engineering. Arranged seamlessly around the vehicle, these thrusters dramatically improve track cornering, deceleration braking, and launch acceleration off the line.`
    },
    {
      category: 'specs',
      question: 'Does the Roadster feature a convertible or removable roof?',
      answer: `Yes. The Roadster features a lightweight, structural glass roof that is easily removable and stores neatly within the rear cargo compartment, offering a pure open-air convertible driving experience without compromising structural rigidity.`
    },
    {
      category: 'specs',
      question: 'What seating configuration is available?',
      answer: `The Roadster features a 2+2 seating layout, providing comfortable seating for the driver and front passenger alongside two secondary rear passenger seats.`
    },

    // Payments & Verification
    {
      category: 'payments',
      question: 'Which payment methods are accepted for reservations?',
      answer: `We support multiple secured payment channels:
      • Credit / Debit Cards: Major global cards with 3D-Secure 256-bit bank encryption.
      • Cryptocurrency (Bitcoin BTC & USDT Tether): Instant automated blockchain address generation with real-time exchange conversion.
      • Bank Wire Transfer: Available for institutional allocations and private pre-orders upon concierge request.`
    },
    {
      category: 'payments',
      question: 'How does automated cryptocurrency payment verification work?',
      answer: `When you select Bitcoin or USDT (TRC-20/ERC-20) during checkout, a designated deposit address and exact crypto amount are generated. Once your transaction is broadcast on the blockchain, you can input your transaction hash (TXID) or upload a proof of payment screenshot in your dashboard for immediate concierge verification.`
    },
    {
      category: 'payments',
      question: 'What should I do if my payment verification is pending?',
      answer: `Card transactions are verified instantaneously. Cryptocurrency transactions require standard network block confirmations (typically 10-30 minutes). You can check your verification status anytime in your Customer Dashboard or submit an updated transaction hash using the built-in Proof of Payment upload module.`
    },
    {
      category: 'payments',
      question: 'How is payment data kept secure?',
      answer: `All transaction data is transmitted using bank-grade 256-bit SSL encryption. We adhere to PCI-DSS Level 1 compliance standards and do not store sensitive raw card numbers or private cryptographic keys on our servers.`
    },

    // Production & Delivery
    {
      category: 'delivery',
      question: 'When is vehicle production and customer delivery scheduled?',
      answer: `Production is coordinated following final engineering homologation. Early reservation holders receive priority sequential delivery based on their reservation date and order timestamp. Regular production updates and milestone notices are sent directly to your registered email address.`
    },
    {
      category: 'delivery',
      question: 'Can international customers reserve the Tesla Roadster?',
      answer: `Yes. The pre-sale reservation program is open to international customers worldwide. Left-hand drive and right-hand drive configurations will be produced for their respective markets, with global fulfillment through certified Tesla Service Centers.`
    },
    {
      category: 'delivery',
      question: 'What warranty is included with the Tesla Roadster?',
      answer: `Every Tesla Roadster includes comprehensive warranty coverage:
      • Basic Vehicle Limited Warranty: 4 years or 50,000 miles (whichever comes first)
      • Battery and Drive Unit Limited Warranty: 8 years or 150,000 miles with a minimum 70% battery retention guarantee.`
    }
  ];

  // Filter FAQs based on search and selected category
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const handleOpenLiveChat = () => {
    if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      window.Tawk_API.maximize();
    } else {
      // Smooth scroll to bottom contact info or trigger prompt
      const contactEl = document.getElementById('contact-concierge');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleFeedback = (index, isHelpful) => {
    setFeedbackState((prev) => ({
      ...prev,
      [index]: isHelpful ? 'helpful' : 'not_helpful'
    }));
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white">
      {/* Cinematic Top Ambient Glow */}
      <div className="relative pt-16 pb-16 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-tesla-red/15 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-rose-700/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-tesla-red animate-pulse" />
            <span className="font-medium tracking-wide">TESLA RESERVATION CONCIERGE & SUPPORT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Frequently Asked <span className="text-tesla-red">Questions</span>
          </h1>

          <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Everything you need to know about reserving the next-generation Tesla Roadster, applying pre-sale promotional codes, and securing your build sequence.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <div className="relative group">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-tesla-red transition-colors"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions (e.g. deposit, promo code, top speed, refund, crypto)..."
                className="w-full bg-[#121217]/90 border border-white/15 rounded-2xl pl-12 pr-10 py-4 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-tesla-red/60 focus:ring-2 focus:ring-tesla-red/20 shadow-2xl transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-neutral-400 mt-2 text-left px-2">
                Found <span className="text-white font-semibold">{filteredFaqs.length}</span> question{filteredFaqs.length === 1 ? '' : 's'} matching "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? faqs.length 
              : faqs.filter(f => f.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenFaqIndex(0);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-tesla-red text-white border-tesla-red shadow-glow-red font-semibold'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Icon size={16} className={isSelected ? 'text-white' : 'text-neutral-400'} />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-neutral-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main FAQ Accordion List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredFaqs.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center space-y-4 my-8">
            <HelpCircle size={44} className="mx-auto text-neutral-500" />
            <h3 className="text-lg font-bold text-white">No matching questions found</h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              We couldn't find any questions matching your query. Try searching with different keywords or browse all categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn-tesla-secondary text-xs px-5 py-2.5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              const feedback = feedbackState[index];

              return (
                <div
                  key={index}
                  className={`glass-card rounded-2xl overflow-hidden border transition-all duration-200 ${
                    isOpen ? 'border-tesla-red/40 bg-[#121217]/95 shadow-lg ring-1 ring-tesla-red/20' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/5 text-tesla-red border border-white/5">
                          {categories.find(c => c.id === faq.category)?.label || 'General'}
                        </span>
                      </div>
                      <span className="text-base sm:text-lg font-semibold text-white group-hover:text-neutral-200 transition-colors block">
                        {faq.question}
                      </span>
                    </div>

                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                      isOpen 
                        ? 'bg-tesla-red/20 border-tesla-red/40 text-tesla-red' 
                        : 'bg-white/5 border-white/10 text-neutral-400 group-hover:text-white'
                    }`}>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-tesla-red' : ''}`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base text-neutral-300 leading-relaxed border-t border-white/5 animate-fadeIn">
                      <div className="whitespace-pre-line text-neutral-300">
                        {faq.answer}
                      </div>

                      {/* Helpful Feedback Interaction */}
                      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
                        <span>Was this answer helpful?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFeedback(index, true)}
                            disabled={!!feedback}
                            className={`px-3 py-1 rounded-md border text-xs font-medium transition-all ${
                              feedback === 'helpful'
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300'
                            }`}
                          >
                            ✓ Yes
                          </button>
                          <button
                            onClick={() => handleFeedback(index, false)}
                            disabled={!!feedback}
                            className={`px-3 py-1 rounded-md border text-xs font-medium transition-all ${
                              feedback === 'not_helpful'
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300'
                            }`}
                          >
                            ✕ No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Value Trust Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-10">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <ShieldCheck size={24} className="text-tesla-red shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Full Reservation Guarantee</h4>
              <p className="text-xs text-neutral-400 mt-1">Priority production slot placement with dedicated build sequence validation.</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <CreditCard size={24} className="text-tesla-red shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">256-Bit Encrypted Payments</h4>
              <p className="text-xs text-neutral-400 mt-1">Secure bank cards, Bitcoin and USDT multi-network automated verification.</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <MessageSquare size={24} className="text-tesla-red shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Dedicated Concierge</h4>
              <p className="text-xs text-neutral-400 mt-1">Direct live chat and order support for all reservation configuration queries.</p>
            </div>
          </div>
        </div>

        {/* Still Have Questions CTA Banner */}
        <div id="contact-concierge" className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-[#121217] via-[#1a1a24] to-[#121217] p-8 sm:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-tesla-red/10 blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold tracking-wider uppercase text-tesla-red">Need Personal Assistance?</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Still have questions about your Roadster?
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Our specialized reservation concierge team is available to assist you with vehicle specifications, promotional discounts, and payment inquiries.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={handleOpenLiveChat}
                className="w-full sm:w-auto btn-tesla-secondary text-sm px-5 py-3 flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Live Chat Support</span>
              </button>

              <Link
                to="/roadster"
                className="w-full sm:w-auto btn-tesla-primary text-sm px-6 py-3 flex items-center justify-center gap-2 shadow-glow-red"
              >
                <span>Reserve Roadster</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
