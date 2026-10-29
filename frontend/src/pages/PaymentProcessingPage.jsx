import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ProofOfPaymentUpload } from '../components/ProofOfPaymentUpload';
import { 
  Loader2, 
  ShieldAlert, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  Lock,
  ArrowRight,
  FileCheck
} from 'lucide-react';

export const PaymentProcessingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};
  const order = state.order;
  const paymentSession = state.paymentSession;
  const provider = state.provider || 'Credit / Debit Card';

  const [proofOfPayment, setProofOfPayment] = useState(order?.proofOfPayment || state?.proofOfPayment || null);
  const [txHash, setTxHash] = useState(order?.txHash || state?.txHash || '');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!order) {
      navigate('/roadster');
    }
  }, [order, navigate]);

  const handleSimulate = async (outcome) => {
    setProcessing(true);
    setError('');
    setFailed(false);

    try {
      const res = await api.simulatePayment({
        orderId: order._id,
        providerReference: paymentSession?.providerReference,
        outcome,
        provider,
        proofOfPayment,
        txHash,
      });

      if (outcome === 'success' && res.verified) {
        // Successful verified simulated payment
        setTimeout(() => {
          navigate('/confirmation', {
            state: {
              order: res.order || order,
              payment: res.payment,
              amountPaid: order.finalPrice,
              orderNumber: order.orderNumber,
              customerEmail: order.customerEmail,
              vehicleName: order.vehicleName,
              selectedConfiguration: order.selectedConfiguration,
              proofOfPayment,
              txHash,
            }
          });
        }, 800);
      } else if (outcome === 'cancel') {
        navigate('/checkout');
      }
    } catch (err) {
      console.error('Simulation response error:', err);
      setFailed(true);
      setError(err.message || 'Payment simulation failed. Transaction declined.');
    } finally {
      setProcessing(false);
    }
  };

  if (!order) return null;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#070709] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-tesla-red/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="tracking-[0.4em] text-xl font-bold text-white">TESLA</div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Secure Payment Authorization</h2>
          <p className="text-sm text-neutral-400">
            Order Reference: <span className="font-mono text-white font-semibold">{order.orderNumber}</span>
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 space-y-6">
          {/* Order Summary Snapshot */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-400">
              <span>Vehicle</span>
              <span className="text-white font-medium">{order.vehicleName}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Configuration</span>
              <span className="text-white">
                {typeof order.selectedConfiguration === 'object'
                  ? `${order.selectedConfiguration?.color || 'Ultra Deep Red'} · ${order.selectedConfiguration?.package || 'Base'}`
                  : order.selectedConfiguration}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Payment Gateway</span>
              <span className="text-neutral-200 font-mono">{provider}</span>
            </div>
            {state.cryptoAmount && (
              <div className="flex justify-between text-neutral-400">
                <span>Crypto Amount</span>
                <span className="text-amber-400 font-mono font-bold">{state.cryptoAmount}</span>
              </div>
            )}
            {state.cryptoAddress && (
              <div className="flex justify-between text-neutral-400">
                <span>Deposit Address</span>
                <span className="text-neutral-300 font-mono text-[10px] truncate max-w-[200px]" title={state.cryptoAddress}>
                  {state.cryptoAddress}
                </span>
              </div>
            )}
            {proofOfPayment && (
              <div className="flex justify-between text-neutral-400">
                <span>Proof of Payment</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <FileCheck size={13} /> {proofOfPayment.fileName || 'Attached'}
                </span>
              </div>
            )}
            {txHash && (
              <div className="flex justify-between text-neutral-400">
                <span>Tx Reference</span>
                <span className="text-amber-400 font-mono text-[11px] truncate max-w-[200px]" title={txHash}>
                  {txHash}
                </span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
              <span>Amount Due</span>
              <span className="font-mono text-tesla-red">${order.finalPrice?.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Crypto Proof of Payment Upload component */}
          {(provider.includes('Bitcoin') || provider.includes('USDT') || provider.includes('BTC')) && (
            <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl">
              <ProofOfPaymentUpload
                proof={proofOfPayment}
                onProofChange={setProofOfPayment}
                txHash={txHash}
                onTxHashChange={setTxHash}
                label="Proof of Payment"
                sublabel="Attach transfer screenshot or transaction hash for fast clearance"
              />
            </div>
          )}

          {/* Error Message when failure occurs */}
          {failed && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <XCircle size={16} />
                <span>Transaction Declined</span>
              </div>
              <p className="text-neutral-300">{error}</p>
              <button
                onClick={() => setFailed(false)}
                className="btn-tesla-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 text-white mt-2"
              >
                <RotateCcw size={12} /> Retry Transaction
              </button>
            </div>
          )}

          {/* Gateway Authorization Controls */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider text-center">
              Authorize Payment Transaction
            </div>
            <p className="text-[11px] text-neutral-400 text-center">
              Click below to complete transaction verification and confirm your reservation.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleSimulate('success')}
                disabled={processing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-glow-green transition-all disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Authorize Payment & Confirm Reservation</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleSimulate('failure')}
                disabled={processing}
                className="w-full bg-white/5 hover:bg-rose-900/30 border border-rose-500/30 text-rose-300 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all disabled:opacity-50"
              >
                <XCircle size={15} />
                <span>Simulate Gateway Error / Decline</span>
              </button>

              <button
                onClick={() => handleSimulate('cancel')}
                disabled={processing}
                className="w-full bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white py-2 px-4 rounded-xl text-xs transition-colors"
              >
                Cancel and return to checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
