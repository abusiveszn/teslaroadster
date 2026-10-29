import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Check, Download, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReceiptModal } from '../components/ReceiptModal';

export const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const order = state.order || {
    _id: 'ord_demo_confirmed',
    orderNumber: '#TRD-20261025-001',
    customerEmail: 'youremail@example.com',
    customerName: 'Valued Customer',
    finalPrice: 80000,
    originalPrice: 200000,
    discountAmount: 120000,
    vehicleName: 'Tesla Roadster',
    selectedConfiguration: {
      color: 'Ultra Deep Red',
      wheel: '21" Turbofan Carbon Wheels',
      package: 'Base Roadster Supercar'
    },
    paymentMethod: 'Credit / Debit Card',
    createdAt: new Date().toISOString()
  };

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    // Fire celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E82127', '#22C55E', '#FFFFFF']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#070709] relative">
      {/* Ambient Green Glowing Backdrop (Matching Panel 5) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-emerald-500/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Main Success Card (Matching Panel 5) */}
        <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/10 text-center space-y-6">
          {/* Big Green Circle with Checkmark */}
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-green">
            <Check size={40} className="stroke-[3]" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Payment Successful!
            </h1>
            <p className="text-sm text-neutral-400">
              Your Tesla Roadster pre-order has been confirmed.
            </p>
          </div>

          {/* Order Details Card (Matching Panel 5) */}
          <div className="bg-[#121217] border border-white/10 rounded-xl p-5 text-left text-xs space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Order Number</span>
              <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Email</span>
              <span className="text-neutral-200 truncate max-w-[200px]">{order.customerEmail}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Amount Paid</span>
              <span className="font-mono font-bold text-white text-sm">
                ${(order.finalPrice || 80000).toLocaleString()}
              </span>
            </div>

            {(order.proofOfPayment || state.proofOfPayment) && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Proof of Payment</span>
                <span className="text-emerald-400 font-semibold truncate max-w-[200px]">
                  ✓ Attached {(order.proofOfPayment?.fileName || state.proofOfPayment?.fileName) ? `(${(order.proofOfPayment?.fileName || state.proofOfPayment?.fileName)})` : ''}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons (Matching Panel 5) */}
          <div className="space-y-3 pt-2">
            <Link
              to="/dashboard"
              className="w-full btn-tesla-primary py-3.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-glow-red"
            >
              <span>View My Dashboard</span>
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={() => setIsReceiptOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-xs text-neutral-400 hover:text-white py-2 transition-colors"
            >
              <Download size={14} />
              <span>Download Receipt</span>
            </button>
          </div>

          {/* Notice */}
          <p className="text-[10px] text-neutral-500 text-center leading-tight pt-2 border-t border-white/5">
            * Official reservation reference. A confirmation copy and receipt have been dispatched to your email.
          </p>
        </div>
      </div>

      {/* Download / Print Receipt Modal */}
      <ReceiptModal
        order={order}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};
