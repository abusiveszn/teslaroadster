import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Zap, 
  Compass, 
  Gauge, 
  Tag, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export const VehiclePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configuration state
  const [activeImageIndex, setActiveImageIndex] = useState(0); // Default to exterior color view
  const [selectedColor, setSelectedColor] = useState('red');
  const [selectedWheel, setSelectedWheel] = useState('aero');
  const [selectedInterior, setSelectedInterior] = useState('carbon-black');
  const [selectedPackage, setSelectedPackage] = useState('standard');

  // Coupon & Price State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');

  // Initial fetch
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const res = await api.getVehicles();
        if (res.vehicles && res.vehicles.length > 0) {
          setVehicle(res.vehicles[0]);
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleData();
  }, []);

  const validateCouponDirect = async (code, vId, pkgId) => {
    if (!code) return;
    setCouponValidating(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(code, vId || vehicle?._id, pkgId || selectedPackage);
      setAppliedCoupon(res);
      setCouponSuccessMsg(res.message || `✓ ${res.coupon.discountValue}% Discount Applied!`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.message || 'Invalid discount coupon code.');
      setCouponSuccessMsg('');
    } finally {
      setCouponValidating(false);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    validateCouponDirect(couponCode, vehicle?._id, selectedPackage);
  };

  // Re-calculate when package changes
  const handlePackageChange = (pkgId) => {
    setSelectedPackage(pkgId);
    if (appliedCoupon && couponCode) {
      validateCouponDirect(couponCode, vehicle?._id, pkgId);
    }
  };

  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId);
    setActiveImageIndex(0); // Immediately display selected color on main stage
  };

  // Determine current active vehicle package price
  const currentPackageObj = vehicle?.configurations?.packages?.find(p => p.id === selectedPackage);
  const basePrice = currentPackageObj ? currentPackageObj.price : (vehicle?.illustrativePrice || 200000);
  
  // Wheel delta
  const currentWheelObj = vehicle?.configurations?.wheels?.find(w => w.id === selectedWheel);
  const wheelDelta = currentWheelObj?.priceDelta || 0;

  // Interior delta
  const currentInteriorObj = vehicle?.configurations?.interiors?.find(i => i.id === selectedInterior);
  const interiorDelta = currentInteriorObj?.priceDelta || 0;

  const originalPrice = basePrice + wheelDelta + interiorDelta;

  // Final price calculation
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.calculation?.discountAmount || Math.round(originalPrice * 0.6))
    : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  // Complete color-matched showcase gallery for each color option
  const colorShowcaseMap = {
    red: [
      { src: '/images/roadster-red.jpg', label: 'Ultra Deep Red Front 3/4' },
      { src: '/images/roadster-rear.jpg', label: 'Ultra Deep Red Rear 3/4' },
      { src: '/images/roadster-interior.jpg', label: 'Cockpit & Steering Yoke' },
      { src: '/images/roadster-banner.jpg', label: 'Aero Dynamics & Light Bar' },
    ],
    black: [
      { src: '/images/roadster-black.jpg', label: 'Solid Midnight Black Front 3/4' },
      { src: '/images/roadster-black-rear.jpg', label: 'Solid Midnight Black Rear 3/4' },
      { src: '/images/roadster-interior.jpg', label: 'Cockpit & Steering Yoke' },
      { src: '/images/roadster-black-banner.jpg', label: 'Aero Dynamics & Night Light Bar' },
    ],
    white: [
      { src: '/images/roadster-white.jpg', label: 'Pearl White Multi-Coat Front 3/4' },
      { src: '/images/roadster-white-rear.jpg', label: 'Pearl White Rear 3/4' },
      { src: '/images/roadster-interior.jpg', label: 'Cockpit & Steering Yoke' },
      { src: '/images/roadster-white-banner.jpg', label: 'Alpine Road Dynamics & Light Bar' },
    ],
    silver: [
      { src: '/images/roadster-silver.jpg', label: 'Quicksilver Metallic Front 3/4' },
      { src: '/images/roadster-silver-rear.jpg', label: 'Quicksilver Metallic Rear 3/4' },
      { src: '/images/roadster-interior.jpg', label: 'Cockpit & Steering Yoke' },
      { src: '/images/roadster-silver-banner.jpg', label: 'Quicksilver Aero & Profile' },
    ],
    blue: [
      { src: '/images/roadster-blue.jpg', label: 'Deep Blue Metallic Front 3/4' },
      { src: '/images/roadster-blue-rear.jpg', label: 'Deep Blue Metallic Rear 3/4' },
      { src: '/images/roadster-interior.jpg', label: 'Cockpit & Steering Yoke' },
      { src: '/images/roadster-blue-banner.jpg', label: 'Mountain Highway Dynamics' },
    ],
  };

  const selectedColorObj = vehicle?.configurations?.colors?.find(c => c.id === selectedColor);
  const images = colorShowcaseMap[selectedColor] || colorShowcaseMap.red;

  const handleContinueToCheckout = () => {
    const configurationPayload = {
      colorId: selectedColor,
      color: selectedColorObj?.name || 'Ultra Deep Red',
      wheelId: selectedWheel,
      wheel: currentWheelObj?.name || '21" Turbofan Carbon Wheels',
      interiorId: selectedInterior,
      interior: currentInteriorObj?.name || 'Black Sport Alcantara & Carbon',
      packageId: selectedPackage,
      package: currentPackageObj?.name || 'Base Roadster Supercar',
    };

    navigate('/checkout', {
      state: {
        vehicleId: vehicle?._id,
        vehicleName: vehicle?.name || 'Tesla Roadster',
        selectedConfiguration: configurationPayload,
        originalPrice,
        discountAmount,
        finalPrice,
        couponCode: appliedCoupon ? couponCode : null,
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tesla-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-400">
            <span>Official Vehicle Specification</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Tesla Roadster
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 font-medium">
            Unmatched Speed. Unstoppable Innovation.
          </p>
        </div>

        {/* Main Grid: Vehicle View (Left) and Pricing / Coupon (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 8 cols - Vehicle Gallery & Specs */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Car Display Container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e0e13] shadow-2xl group">
              <img
                key={images[activeImageIndex].src}
                src={images[activeImageIndex].src}
                alt={images[activeImageIndex].label}
                className="w-full h-[320px] sm:h-[450px] object-cover object-center transform transition-all duration-500 group-hover:scale-[1.01] animate-fadeIn"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-50 pointer-events-none" />

              {/* View Label Pill & Active Color Indicator */}
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs text-neutral-300">
                  {images[activeImageIndex].label}
                </div>
                {activeImageIndex !== 2 && selectedColorObj && (
                  <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-xs text-neutral-300">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: selectedColorObj.hex }} />
                    <span className="text-[11px] font-medium">{selectedColorObj.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all h-20 ${
                    activeImageIndex === idx
                      ? 'border-tesla-red shadow-glow-red scale-[1.02]'
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Spec Bar Below Vehicle */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center divide-x divide-white/10">
                {/* 0-60 mph */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-tesla-red text-sm font-semibold">
                    <Zap size={16} /> <span>1.9s</span>
                  </div>
                  <div className="text-xs text-neutral-400 font-medium">0-60 mph</div>
                </div>

                {/* Range */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-tesla-red text-sm font-semibold">
                    <Compass size={16} /> <span>620 mi</span>
                  </div>
                  <div className="text-xs text-neutral-400 font-medium">Range</div>
                </div>

                {/* Power */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-tesla-red text-sm font-semibold">
                    <Gauge size={16} /> <span>1,250 hp</span>
                  </div>
                  <div className="text-xs text-neutral-400 font-medium">Power</div>
                </div>
              </div>
            </div>

            {/* Customization Options Accordions */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-tesla-red" />
                <span>Vehicle Configuration</span>
              </h3>

              {/* Exterior Color */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Exterior Color</span>
                  <span className="text-xs text-tesla-red font-medium">{selectedColorObj?.name}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {vehicle?.configurations?.colors?.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => handleColorSelect(col.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        selectedColor === col.id
                          ? 'border-tesla-red bg-tesla-red/10 shadow-glow-red scale-[1.02]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-white/20 shadow-inner shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span className="text-xs font-medium truncate text-neutral-200">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Performance Packages */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Powertrain & Package</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {vehicle?.configurations?.packages?.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePackageChange(pkg.id)}
                      className={`p-4 rounded-xl border text-left space-y-1.5 transition-all ${
                        selectedPackage === pkg.id
                          ? 'border-tesla-red bg-tesla-red/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white">{pkg.name}</div>
                      <div className="text-sm font-mono text-tesla-red font-bold">${pkg.price.toLocaleString()}</div>
                      <div className="text-[11px] text-neutral-400 line-clamp-2">{pkg.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wheels */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Wheels</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicle?.configurations?.wheels?.map((wh) => (
                    <button
                      key={wh.id}
                      onClick={() => setSelectedWheel(wh.id)}
                      className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                        selectedWheel === wh.id
                          ? 'border-tesla-red bg-tesla-red/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs font-medium text-neutral-200">{wh.name}</span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {wh.priceDelta ? `+$${wh.priceDelta.toLocaleString()}` : 'Included'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 4 cols - Pricing, Coupon & Continue (Matching Panel 3 exactly!) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="glass-card p-6 sm:p-7 rounded-2xl border border-white/15 shadow-2xl space-y-6">
              {/* Original Price & Pre-Sale Price */}
              <div className="space-y-2 pb-6 border-b border-white/10">
                {appliedCoupon ? (
                  <>
                    <div className="flex items-center justify-between text-neutral-400 text-sm">
                      <span>Original Price</span>
                      <span className="line-through font-mono">${originalPrice.toLocaleString()}</span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-xs text-neutral-400 block font-medium">Pre-Sale Price</span>
                        <span className="text-3xl sm:text-4xl font-extrabold text-tesla-red font-mono tracking-tight">
                          ${finalPrice.toLocaleString()}
                        </span>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-tesla-red text-white text-xs font-bold tracking-wide shadow-glow-red uppercase">
                        {appliedCoupon.calculation?.percentageOff || 60}% OFF
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-xs text-neutral-400 block font-medium">Main Price</span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                        ${originalPrice.toLocaleString()}
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-semibold tracking-wide uppercase">
                      Standard Price
                    </span>
                  </div>
                )}
              </div>

              {/* Coupon Section (Matching Panel 3) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-neutral-300">
                    Enter Discount Coupon Code
                  </label>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setCouponSuccessMsg('');
                        setCouponError('');
                      }}
                      className="text-[11px] text-neutral-400 hover:text-white underline transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        if (couponError) setCouponError('');
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-2.5 bg-[#141419] border border-white/10 rounded-xl text-sm font-mono uppercase tracking-wider text-white placeholder-neutral-500 focus:outline-none focus:border-tesla-red transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={couponValidating}
                      className="btn-tesla-secondary px-4 py-2.5 text-xs font-semibold whitespace-nowrap"
                    >
                      {couponValidating ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                </form>

                {/* Coupon Feedback Message */}
                {couponSuccessMsg && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
                    <CheckCircle size={14} className="shrink-0" />
                    <span>{couponSuccessMsg}</span>
                  </div>
                )}

                {couponError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium pt-1">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="space-y-2 pt-4 border-t border-white/10 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-200">${originalPrice.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-tesla-red font-semibold">
                    <span>Discount Amount</span>
                    <span className="font-mono">-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/5">
                  <span>Estimated Total</span>
                  <span className="font-mono text-tesla-red text-base">${finalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Continue to Pre-Order Button */}
              <button
                onClick={handleContinueToCheckout}
                className="w-full btn-tesla-primary py-3.5 text-base font-semibold flex items-center justify-center gap-2 shadow-glow-red group"
              >
                <span>Continue to Pre-Order</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[10px] text-neutral-500 text-center leading-tight">
                * Priority reservation allocation. Configuration locked upon deposit receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
