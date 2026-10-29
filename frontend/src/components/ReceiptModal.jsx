import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldAlert } from 'lucide-react';

export const ReceiptModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0e13] border border-white/15 rounded-2xl shadow-2xl p-6 sm:p-8 text-neutral-200 my-8">
        {/* Close and Print Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-tesla-red">Official Receipt</span>
            <span className="text-xs text-neutral-400">| Customer Reservation Record</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white transition-colors cursor-pointer"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="py-6 space-y-6 printable-area">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-2xl font-bold tracking-[0.3em] text-white">TESLA</div>
              <p className="text-xs text-neutral-400 mt-1">Roadster Pre-Sale Allocation Department</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <CheckCircle size={12} /> Payment Verified
              </span>
              <p className="text-xs text-neutral-400 mt-1">Receipt Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Official Confirmation Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-300">
            <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-400" />
            <p>
              <strong>CONFIRMED RESERVATION:</strong> This document confirms your production sequence allocation, vehicle specifications, and pre-sale deposit receipt.
            </p>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-white/[0.03] p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-neutral-500 block">Order Reference</span>
              <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Payment Method</span>
              <span className="text-neutral-200">{order.paymentMethod || 'Credit / Debit Card'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Customer Name</span>
              <span className="text-white font-medium">{order.customerName || 'John Doe'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Customer Email</span>
              <span className="text-neutral-200">{order.customerEmail || 'youremail@example.com'}</span>
            </div>
          </div>

          {/* Vehicle Configuration Summary */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-400">Reserved Vehicle Configuration</h4>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h5 className="font-semibold text-white text-base">{order.vehicleName || 'Tesla Roadster'}</h5>
                <p className="text-xs text-neutral-400">
                  {typeof order.selectedConfiguration === 'object'
                    ? `${order.selectedConfiguration?.color || 'Ultra Deep Red'} · ${order.selectedConfiguration?.wheel || '21" Turbofan Carbon'} · ${order.selectedConfiguration?.package || 'Base Roadster'}`
                    : order.selectedConfiguration}
                </p>
                <div className="flex gap-3 text-[11px] text-neutral-400 mt-2">
                  <span>⚡ 1.9s 0-60 mph</span>
                  <span>•</span>
                  <span>📍 620 mi Range</span>
                  <span>•</span>
                  <span>⏱ 1,250 hp</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-neutral-300 font-mono">
                  ${(order.originalPrice || 200000).toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Base Vehicle Price</span>
              <span className="font-mono">${(order.originalPrice || 200000).toLocaleString()} USD</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-tesla-red font-medium">
                <span>Promotional Pre-Sale Benefit {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span className="font-mono">-${(order.discountAmount || 0).toLocaleString()} USD</span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-base border-t border-white/10 pt-3">
              <span>Total Reservation Deposit Paid</span>
              <span className="text-tesla-red font-mono">${(order.finalPrice || 80000).toLocaleString()} USD</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-white/5 text-[10px] text-neutral-500">
            Reservation ID: {order._id} · Priority Sequence Allocated · Tesla, Inc.
          </div>
        </div>
      </div>
    </div>
  );
};
