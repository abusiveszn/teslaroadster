import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  LayoutDashboard, 
  Car, 
  CreditCard, 
  User, 
  Bell, 
  LogOut, 
  CheckCircle, 
  FileText, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Mail,
  Calendar,
  Sparkles,
  Eye,
  X,
  FileCheck,
  MessageSquare,
  Send,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';

export const CustomerDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [selectedCustomerProof, setSelectedCustomerProof] = useState(null);

  // Order Conversation (Chat with Tesla Support) State
  const [selectedChatOrder, setSelectedChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const openOrderChat = async (ord) => {
    setSelectedChatOrder(ord);
    setNewChatMessage('');
    setLoadingMessages(true);
    try {
      const res = await api.getOrderMessages(ord._id);
      setChatMessages(res?.messages || ord.messages || []);
    } catch (err) {
      console.error('Error fetching order messages:', err);
      setChatMessages(ord.messages || []);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Poll for new messages while chat is open
  useEffect(() => {
    if (!selectedChatOrder) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.getOrderMessages(selectedChatOrder._id);
        if (res?.messages) {
          setChatMessages(res.messages);
          setOrders(prev => prev.map(o => o._id === selectedChatOrder._id ? { ...o, messages: res.messages } : o));
        }
      } catch {}
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedChatOrder]);

  const handleSendCustomerMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newChatMessage.trim() || !selectedChatOrder || sendingMessage) return;
    const text = newChatMessage.trim();
    setSendingMessage(true);
    try {
      const res = await api.sendOrderMessage(selectedChatOrder._id, text);
      if (res?.messages) {
        setChatMessages(res.messages);
        setOrders(prev => prev.map(o => o._id === selectedChatOrder._id ? { ...o, messages: res.messages } : o));
      }
      setNewChatMessage('');
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const totalPaid = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (Number(o.finalPrice) || 0), 0);

  const customerName = user?.fullName || user?.email?.split('@')[0] || 'Customer';
  const customerFirstName = customerName.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col md:flex-row">
      {/* Left Sidebar */}
      <aside className="w-full md:w-64 bg-[#0a0a0e] border-r border-white/10 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          {/* Brand Logo in Sidebar */}
          <div className="flex items-center gap-2">
            <span className="tracking-[0.35em] text-lg font-bold text-white">TESLA</span>
            <span className="text-[10px] bg-white/10 text-neutral-400 px-1.5 py-0.5 rounded font-semibold uppercase">
              Portal
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'orders'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Car size={18} />
                <span>My Pre-Orders</span>
              </div>
              {orders.length > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'payments'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard size={18} />
              <span>Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'account'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={18} />
              <span>My Account</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === 'notifications'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </button>
          </nav>
        </div>

        {/* Log Out at bottom of sidebar */}
        <div className="pt-6 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {/* Top Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome, {customerFirstName}!
            </h1>
            <p className="text-sm text-neutral-400">
              Manage your personal Tesla Roadster configuration and reservations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 transition-colors"
            >
              <Bell size={18} />
            </button>

            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-tesla-red to-rose-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {customerFirstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* 4 Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* 1. My Pre-Orders */}
              <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">My Pre-Orders</span>
                  <div className="w-10 h-10 rounded-xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red">
                    <Car size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white font-mono">{orders.length}</div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mt-2 transition-colors font-medium"
                  >
                    <span>View Details</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* 2. Total Paid */}
              <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Paid</span>
                  <div className="w-10 h-10 rounded-xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red">
                    <CreditCard size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    ${totalPaid.toLocaleString()}
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mt-2 transition-colors font-medium"
                  >
                    <span>Payment History</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* 3. Notifications */}
              <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Notifications</span>
                  <div className="w-10 h-10 rounded-xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red">
                    <Bell size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white font-mono">0</div>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mt-2 transition-colors font-medium"
                  >
                    <span>View Inbox</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* 4. My Account */}
              <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Account Status</span>
                  <div className="w-10 h-10 rounded-xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red">
                    <User size={20} />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-white truncate">{customerName}</div>
                  <span className="text-xs text-emerald-400 font-medium block">Verified Customer</span>
                  <button
                    onClick={() => setActiveTab('account')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mt-2 transition-colors font-medium"
                  >
                    <span>Account Settings</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Banner (Prompting new user to configure vehicle) */}
            {orders.length === 0 && (
              <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 bg-gradient-to-r from-tesla-red/15 via-transparent to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tesla-red/20 border border-tesla-red/30 text-xs font-semibold text-tesla-red">
                    <Sparkles size={14} />
                    <span>Reservation Open</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Configure Your Tesla Roadster</h3>
                  <p className="text-sm text-neutral-300 max-w-xl">
                    Choose your custom exterior paint, aero or track wheels, bespoke supercar interior, and SpaceX cold-gas thruster package.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/roadster')}
                  className="btn-tesla-primary text-sm px-6 py-3 font-semibold inline-flex items-center gap-2 shadow-glow-red shrink-0"
                >
                  <span>Start Configuration</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Recent Activity Section */}
            <section className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Recent Activity</h2>
                {orders.length > 0 && (
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-neutral-400 hover:text-white font-medium flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-neutral-500">
                    <Car size={24} />
                  </div>
                  <div className="text-sm font-semibold text-neutral-300">No Pre-Orders or Transactions Recorded</div>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Your account is clean and verified. Once you configure and place a pre-order, your records and digital receipts will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div
                      key={ord._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <CheckCircle size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {ord.paymentStatus === 'paid' ? 'Payment Confirmed' : 'Pre-Order Initiated'}
                          </h4>
                          <p className="text-xs text-neutral-400">
                            {new Date(ord.createdAt).toLocaleDateString()} · ${ord.finalPrice?.toLocaleString()} USD · <span className="font-mono text-neutral-300">{ord.orderNumber}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => openOrderChat(ord)}
                          className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Message Tesla Support"
                        >
                          <MessageSquare size={13} className="text-tesla-red" />
                          <span>Chat</span>
                          {ord.messages && ord.messages.length > 0 && (
                            <span className="bg-tesla-red text-white text-[9px] font-bold rounded-full px-1.5 py-0.2">
                              {ord.messages.length}
                            </span>
                          )}
                        </button>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {ord.orderStatus === 'confirmed' ? 'Completed' : 'Pending'}
                        </span>
                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="p-1.5 text-neutral-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors"
                          title="Download / View Receipt"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: ALL PRE-ORDERS */}
        {activeTab === 'orders' && (
          <section className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">All Pre-Orders</h2>
              <button
                onClick={() => navigate('/roadster')}
                className="btn-tesla-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5"
              >
                <span>New Reservation</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-neutral-500">
                  <Car size={24} />
                </div>
                <div className="text-sm font-semibold text-neutral-300">No Pre-Orders Recorded</div>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  You have not placed any Roadster reservations yet. Click below to customize and reserve your vehicle.
                </p>
                <button
                  onClick={() => navigate('/roadster')}
                  className="btn-tesla-secondary text-xs px-4 py-2 mt-2 text-white inline-flex items-center gap-1"
                >
                  Configure Roadster
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="pb-3">Order Number</th>
                      <th className="pb-3">Vehicle</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment Proof</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((o) => (
                      <tr key={o._id} className="text-neutral-300">
                        <td className="py-3 font-mono font-bold text-white">{o.orderNumber}</td>
                        <td className="py-3">{o.vehicleName}</td>
                        <td className="py-3">
                          <span className="text-[11px] text-neutral-300 font-medium">
                            {o.paymentMethod || 'Direct Payment'}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-tesla-red font-semibold">
                          ${o.finalPrice?.toLocaleString()}
                        </td>
                        <td className="py-3">
                          {o.proofOfPayment ? (
                            <button
                              type="button"
                              onClick={() => setSelectedCustomerProof(o.proofOfPayment)}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye size={12} /> View Proof
                            </button>
                          ) : o.txHash ? (
                            <span className="font-mono text-[10px] text-amber-400" title={o.txHash}>
                              Tx: {o.txHash.slice(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openOrderChat(o)}
                              className="btn-tesla-secondary px-2.5 py-1 text-xs inline-flex items-center gap-1.5 text-white cursor-pointer"
                              title="Message Tesla Support"
                            >
                              <MessageSquare size={12} className="text-tesla-red" />
                              <span>Support</span>
                              {o.messages && o.messages.length > 0 && (
                                <span className="bg-tesla-red text-white text-[9px] font-bold rounded-full px-1.5 py-0.2">
                                  {o.messages.length}
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptOrder(o)}
                              className="btn-tesla-secondary px-2.5 py-1 text-xs inline-flex items-center gap-1 text-white cursor-pointer"
                            >
                              <FileText size={12} /> Receipt
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: PAYMENTS */}
        {activeTab === 'payments' && (
          <section className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white">Payment Transactions</h2>

            {orders.filter((o) => o.paymentStatus === 'paid').length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-neutral-500">
                  <CreditCard size={24} />
                </div>
                <div className="text-sm font-semibold text-neutral-300">No Payment History</div>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  You haven't made any reservation deposits or payments yet. Once you complete checkout, your payment confirmation will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="pb-3">Order Number</th>
                      <th className="pb-3">Payment Method</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders
                      .filter((o) => o.paymentStatus === 'paid')
                      .map((o) => (
                        <tr key={o._id} className="text-neutral-300">
                          <td className="py-3 font-mono font-bold text-white">{o.orderNumber}</td>
                          <td className="py-3">{o.paymentMethod || 'Credit / Debit Card'}</td>
                          <td className="py-3 text-neutral-400">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 font-mono text-emerald-400 font-semibold">
                            ${o.finalPrice?.toLocaleString()} USD
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* TAB 4: MY ACCOUNT */}
        {activeTab === 'account' && (
          <section className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <h2 className="text-lg font-bold text-white">Account Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Full Name</span>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <User size={16} className="text-neutral-400" />
                  <span>{customerName}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Email Address</span>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Mail size={16} className="text-neutral-400" />
                  <span>{user?.email || 'N/A'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Account Status</span>
                <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>Verified Customer</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Role</span>
                <div className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                  {user?.role || 'customer'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <section className="glass-card p-6 sm:p-7 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-lg font-bold text-white">Notifications</h2>
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center text-neutral-500">
                <Bell size={24} />
              </div>
              <div className="text-sm font-semibold text-neutral-300">No New Notifications</div>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                You're all caught up! Updates regarding your pre-orders and pre-sale announcements will be delivered here.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Receipt Modal Trigger */}
      <ReceiptModal
        order={selectedReceiptOrder}
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
      />

      {/* Proof of Payment Viewer Modal */}
      {selectedCustomerProof && (
        <div 
          onClick={() => setSelectedCustomerProof(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#121217] border border-white/15 rounded-2xl p-5 space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck size={16} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white truncate max-w-[280px]">
                  {selectedCustomerProof.fileName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerProof(null)}
                className="p-1 text-neutral-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto rounded-xl border border-white/10 bg-black/40 p-2 flex items-center justify-center">
              {selectedCustomerProof.fileType?.startsWith('image/') ? (
                <img
                  src={selectedCustomerProof.fileData}
                  alt="Proof of payment"
                  className="max-h-[55vh] max-w-full object-contain rounded-lg"
                />
              ) : (
                <div className="py-10 text-center space-y-2 text-neutral-300">
                  <FileText size={40} className="mx-auto text-emerald-400" />
                  <p className="text-xs">{selectedCustomerProof.fileName}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-400">
              <span>{selectedCustomerProof.fileSize}</span>
              <button
                type="button"
                onClick={() => setSelectedCustomerProof(null)}
                className="btn-tesla-secondary text-xs px-3.5 py-1.5 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOMER ORDER CONVERSATION MODAL                         */}
      {/* ======================================================== */}
      {selectedChatOrder && (
        <div 
          onClick={() => setSelectedChatOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121217] border border-white/15 rounded-2xl shadow-2xl flex flex-col h-[650px] max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#15151c]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tesla-red/10 border border-tesla-red/20 flex items-center justify-center text-tesla-red shrink-0">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Tesla Support Chat · {selectedChatOrder.orderNumber}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Live Specialist
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Vehicle: <span className="text-white font-medium">{selectedChatOrder.vehicleName}</span> · Official Order Support Thread
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openOrderChat(selectedChatOrder)}
                  className="p-1.5 text-neutral-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors cursor-pointer"
                  title="Refresh Conversation"
                >
                  <RefreshCw size={14} className={loadingMessages ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChatOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#0a0a0d]">
              {loadingMessages && chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-2">
                  <RefreshCw size={24} className="animate-spin text-tesla-red" />
                  <span className="text-xs">Connecting to support specialist...</span>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-2 text-neutral-400">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 mb-1">
                    <MessageCircle size={24} />
                  </div>
                  <p className="text-sm font-semibold text-white">Direct Specialist Communication</p>
                  <p className="text-xs max-w-sm text-neutral-400">
                    Need assistance with your vehicle allocation, payment confirmation, or delivery details? Send a message directly to Tesla Support below.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isAdminMsg = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isAdminMsg ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1 px-1">
                        <span className={`font-semibold ${isAdminMsg ? 'text-tesla-red' : 'text-blue-400'}`}>
                          {isAdminMsg ? 'Tesla Support Team' : 'You'}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isAdminMsg
                            ? 'bg-gradient-to-br from-tesla-red/20 to-tesla-red/5 border border-tesla-red/30 text-white rounded-bl-sm'
                            : 'bg-[#181820] border border-white/10 text-neutral-200 rounded-br-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap select-text">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick response suggestions for buyer */}
            <div className="px-5 py-2 bg-[#121217] border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-neutral-500 shrink-0 font-medium">Quick Prompts:</span>
              <button
                type="button"
                onClick={() => setNewChatMessage('Hi, I just submitted my proof of payment. Could you please confirm receipt?')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 shrink-0 transition-colors cursor-pointer"
              >
                Confirm Payment Receipt
              </button>
              <button
                type="button"
                onClick={() => setNewChatMessage('What is the estimated delivery timeframe for my Roadster reservation?')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 shrink-0 transition-colors cursor-pointer"
              >
                Delivery Timeline
              </button>
              <button
                type="button"
                onClick={() => setNewChatMessage('Can I modify my exterior wheel or interior options before final production?')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 shrink-0 transition-colors cursor-pointer"
              >
                Configuration Change
              </button>
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendCustomerMessage} className="p-4 bg-[#141419] border-t border-white/10 flex items-center gap-3">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Ask Tesla Support a question regarding your order..."
                className="flex-1 px-4 py-2.5 bg-[#1b1b22] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-tesla-red"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newChatMessage.trim()}
                className="btn-tesla-primary text-xs px-4 py-2.5 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {sendingMessage ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
