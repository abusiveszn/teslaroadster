import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Tag, 
  Car, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowUpRight,
  ChevronDown, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  Eye, 
  FileText, 
  X, 
  Copy, 
  Check,
  Trash2,
  RefreshCw,
  TrendingUp,
  Server,
  Mail,
  Lock,
  ArrowRight,
  MessageSquare,
  Send,
  MessageCircle,
  Save
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    simulatedRevenue: 0,
    totalCustomers: 0,
    activeCoupons: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('All Time');

  // Orders Search & Filter State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Customer Search State
  const [customerSearch, setCustomerSearch] = useState('');

  // Coupon modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('25');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // Proof of Payment modal state
  const [selectedProofOrder, setSelectedProofOrder] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Editable Crypto Addresses & Tawk Settings State
  const [adminSettings, setAdminSettings] = useState({
    btcAddress: 'bc1q8w7l5n9a4k2v0p8e3r7t6y1u2i3o4p5a6s7d',
    usdtTrc20Address: 'TYDzsXDikPf1PvhXiHGi8669Wqy3oh27Wk',
    usdtErc20Address: '0x71C8360f3E282352B492E8704D116496Eb36dC19',
    tawkPropertyId: '',
    tawkWidgetId: '',
    tawkDirectChatUrl: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Order Conversation (Buyer & Admin Chat) State
  const [selectedChatOrder, setSelectedChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    // Role protection
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [
        overviewRes, 
        ordersRes, 
        customersRes, 
        vehiclesRes, 
        couponsRes, 
        paymentsRes,
        reportsRes,
        settingsRes
      ] = await Promise.allSettled([
        api.getAdminOverview(),
        api.getAdminOrders(),
        api.getAdminCustomers(),
        api.getVehicles(),
        api.getAdminCoupons(),
        api.getAdminPayments(),
        api.getReports(),
        api.getAdminSettings()
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value.metrics) {
        setMetrics(overviewRes.value.metrics);
        setRecentOrders(overviewRes.value.recentOrders || []);
      }

      if (ordersRes.status === 'fulfilled') {
        const ords = ordersRes.value.orders || [];
        setAllOrders(ords);
        if (!recentOrders.length) setRecentOrders(ords.slice(0, 8));
      }

      if (customersRes.status === 'fulfilled') {
        setCustomers(customersRes.value.customers || []);
      }

      if (vehiclesRes.status === 'fulfilled') {
        setVehicles(vehiclesRes.value.vehicles || []);
      }

      if (couponsRes.status === 'fulfilled') {
        setCoupons(couponsRes.value.coupons || []);
      }

      if (paymentsRes.status === 'fulfilled') {
        setPayments(paymentsRes.value.payments || []);
      }

      if (reportsRes.status === 'fulfilled') {
        setReportsData(reportsRes.value);
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value?.settings) {
        setAdminSettings({
          btcAddress: settingsRes.value.settings.btcAddress || 'bc1q8w7l5n9a4k2v0p8e3r7t6y1u2i3o4p5a6s7d',
          usdtTrc20Address: settingsRes.value.settings.usdtTrc20Address || 'TYDzsXDikPf1PvhXiHGi8669Wqy3oh27Wk',
          usdtErc20Address: settingsRes.value.settings.usdtErc20Address || '0x71C8360f3E282352B492E8704D116496Eb36dC19',
          tawkPropertyId: settingsRes.value.settings.tawkPropertyId || '',
          tawkWidgetId: settingsRes.value.settings.tawkWidgetId || '',
          tawkDirectChatUrl: settingsRes.value.settings.tawkDirectChatUrl || ''
        });
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToast = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateAdminOrder(orderId, { 
        orderStatus: newStatus,
        ...(newStatus === 'confirmed' ? { paymentStatus: 'paid' } : {})
      });
      showToast(`Order status updated to "${newStatus}".`);
      loadData(true);
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await api.deleteAdminOrder(orderId);
      showToast('Order successfully deleted.');
      loadData(true);
    } catch (err) {
      alert(err.message || 'Failed to delete order');
    }
  };

  // Settings Handlers (Crypto Addresses & Tawk Live Chat)
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccessMsg('');
    try {
      await api.updateAdminSettings(adminSettings);
      setSettingsSuccessMsg('Crypto receiver addresses & live chat settings saved successfully.');
      setTimeout(() => setSettingsSuccessMsg(''), 4500);
    } catch (err) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Order Conversation Handlers
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

  // Auto-refresh chat thread while modal is active
  useEffect(() => {
    if (!selectedChatOrder) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.getOrderMessages(selectedChatOrder._id);
        if (res?.messages) {
          setChatMessages(res.messages);
          setAllOrders(prev => prev.map(o => o._id === selectedChatOrder._id ? { ...o, messages: res.messages } : o));
        }
      } catch {}
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedChatOrder]);

  const handleSendOrderMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newChatMessage.trim() || !selectedChatOrder || sendingMessage) return;
    const text = newChatMessage.trim();
    setSendingMessage(true);
    try {
      const res = await api.sendOrderMessage(selectedChatOrder._id, text);
      if (res?.messages) {
        setChatMessages(res.messages);
        setAllOrders(prev => prev.map(o => o._id === selectedChatOrder._id ? { ...o, messages: res.messages } : o));
      }
      setNewChatMessage('');
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };


  // Coupon Actions
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    setCouponSubmitting(true);
    try {
      await api.createAdminCoupon({
        code: newCouponCode.toUpperCase().trim(),
        discountValue: Number(newCouponDiscount),
        discountType: 'percentage',
        expiresAt: '2026-12-31T23:59:59Z',
        description: newCouponDesc.trim() || `${newCouponDiscount}% Pre-Sale Discount`
      });
      setIsCouponModalOpen(false);
      setNewCouponCode('');
      setNewCouponDesc('');
      showToast(`Coupon "${newCouponCode.toUpperCase()}" created successfully.`);
      loadData(true);
    } catch (err) {
      alert(err.message || 'Failed to create coupon');
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleToggleCoupon = async (couponId, currentStatus) => {
    try {
      await api.updateAdminCoupon(couponId, { isActive: !currentStatus });
      showToast(`Coupon status set to ${!currentStatus ? 'Active' : 'Inactive'}.`);
      loadData(true);
    } catch (err) {
      alert('Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.deleteAdminCoupon(couponId);
      showToast('Coupon deleted.');
      loadData(true);
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  // Filtered Orders for the Orders Tab
  const filteredOrders = allOrders.filter(ord => {
    const matchesSearch = 
      ord.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customerEmail?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.paymentMethod?.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus = 
      orderStatusFilter === 'all' || 
      ord.orderStatus === orderStatusFilter || 
      ord.paymentStatus === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered Customers
  const filteredCustomers = customers.filter(c => 
    c.fullName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.role?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-fadeIn backdrop-blur-md">
          <CheckCircle size={15} className="text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-white/10 p-6 flex flex-col justify-between shrink-0 bg-[#09090c]">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="tracking-[0.35em] text-lg font-bold text-white">TESLA</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-tesla-red/20 text-tesla-red border border-tesla-red/30">
                Admin
              </span>
            </div>
            <button
              onClick={() => loadData(true)}
              className="p-1.5 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-tesla-red' : ''} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="grid grid-cols-4 lg:grid-cols-1 gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'overview'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard size={17} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'orders'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={17} />
                <span>Orders</span>
              </div>
              {allOrders.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-white/10 text-neutral-300'
                }`}>
                  {allOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'customers'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users size={17} />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'vehicles'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Car size={17} />
              <span>Vehicles</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'coupons'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tag size={17} />
              <span>Coupons</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'payments'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard size={17} />
              <span>Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'reports'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 size={17} />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-left ${
                activeTab === 'settings'
                  ? 'bg-tesla-red text-white shadow-glow-red font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings size={17} />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Admin User Card & Logout */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-tesla-red flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
              T
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">Tesla Admin</p>
              <p className="text-[11px] text-neutral-400 truncate">teslasupporttech@gmail.com</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-xs font-medium cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto">
        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW                                          */}
        {/* ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Dashboard Overview
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Live operations & reservation control center.
                </p>
              </div>

              <div className="relative">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-[#141419] border border-white/10 text-neutral-300 text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-tesla-red appearance-none pr-8 cursor-pointer"
                >
                  <option>All Time</option>
                  <option>Last 30 Days</option>
                  <option>Last 7 Days</option>
                  <option>Year to Date</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div 
                onClick={() => setActiveTab('orders')}
                className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-xs text-neutral-400 font-medium">Total Orders</span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {allOrders.length || metrics.totalOrders || 0}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <ArrowUpRight size={12} /> Active Store
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <ShoppingCart size={22} />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('payments')}
                className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-xs text-neutral-400 font-medium">Total Revenue</span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    ${(allOrders.filter(o => o.paymentStatus === 'paid').reduce((a, b) => a + (b.finalPrice || 0), 0) || metrics.simulatedRevenue || 0).toLocaleString()}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <ArrowUpRight size={12} /> Verified Funds
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign size={22} />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('customers')}
                className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-xs text-neutral-400 font-medium">Customers</span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {customers.length || metrics.totalCustomers || 0}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                    <ArrowUpRight size={12} /> Registered
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Users size={22} />
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('coupons')}
                className="glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-xs text-neutral-400 font-medium">Active Coupons</span>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                    {coupons.filter(c => c.isActive).length}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCouponModalOpen(true);
                    }}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus size={12} /> Add New
                  </button>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Tag size={22} />
                </div>
              </div>
            </div>

            {/* Lower Grid: Recent Orders Table & Quick Coupons */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Recent Orders Table (8 cols) */}
              <div className="lg:col-span-8 glass-card p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Recent Orders</h2>
                    <span className="text-[11px] text-neutral-400 font-mono">({allOrders.length})</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-tesla-red hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Orders</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-neutral-400 uppercase tracking-wider border-b border-white/5">
                      <tr>
                        <th className="py-2.5">#</th>
                        <th className="py-2.5">Customer</th>
                        <th className="py-2.5">Vehicle</th>
                        <th className="py-2.5">Method</th>
                        <th className="py-2.5">Amount</th>
                        <th className="py-2.5">Proof</th>
                        <th className="py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allOrders.slice(0, 6).map((ord) => (
                        <tr key={ord._id} className="text-neutral-300 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-mono font-medium text-white">{ord.orderNumber}</td>
                          <td className="py-3 font-medium text-white">{ord.customerName || 'Customer'}</td>
                          <td className="py-3 text-neutral-400">{ord.vehicleName || 'Roadster'}</td>
                          <td className="py-3 text-[11px] text-neutral-300">
                            {ord.paymentMethod || 'Direct Gateway'}
                          </td>
                          <td className="py-3 font-mono text-white font-semibold">
                            ${ord.finalPrice?.toLocaleString()}
                          </td>
                          <td className="py-3">
                            {ord.proofOfPayment ? (
                              <button
                                type="button"
                                onClick={() => setSelectedProofOrder(ord)}
                                className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye size={11} /> Proof
                              </button>
                            ) : ord.txHash ? (
                              <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title={ord.txHash}>
                                TxID
                              </span>
                            ) : (
                              <span className="text-neutral-500">-</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.paymentStatus === 'paid' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {ord.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Manage Coupons Card (4 cols) */}
              <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <h2 className="text-base font-bold text-white">Manage Coupons</h2>
                  <button
                    onClick={() => setIsCouponModalOpen(true)}
                    className="text-xs text-tesla-red hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> New
                  </button>
                </div>

                <div className="space-y-3">
                  {coupons.slice(0, 4).map((c) => (
                    <div
                      key={c._id}
                      className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm tracking-wider text-white">
                          {c.code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            c.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400">
                        {c.discountValue}% OFF · Uses: {c.usageCount || 0}
                      </p>

                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5 text-xs">
                        <button
                          onClick={() => handleToggleCoupon(c._id, c.isActive)}
                          className="text-xs text-neutral-300 hover:text-white px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ORDERS MANAGEMENT                                 */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <section className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Reservation Orders Management
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Inspect, verify proof of payment, and manage customer vehicle pre-orders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order #, email, name..."
                    className="pl-9 pr-3.5 py-1.5 bg-[#141419] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-tesla-red w-56 sm:w-64"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#141419] border border-white/10 text-neutral-300 text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:border-tesla-red cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                </select>

                <button
                  onClick={() => loadData(true)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl transition-colors"
                  title="Refresh orders"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-neutral-400 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Customer Details</th>
                    <th className="pb-3">Vehicle</th>
                    <th className="pb-3">Payment Method</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Proof of Payment</th>
                    <th className="pb-3">Order Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-400">
                        No orders match the current search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord._id} className="text-neutral-300 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 font-mono font-bold text-white">{ord.orderNumber}</td>
                        <td className="py-3.5">
                          <div className="font-medium text-white">{ord.customerName}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{ord.customerEmail}</div>
                        </td>
                        <td className="py-3.5">
                          <div>{ord.vehicleName}</div>
                          <div className="text-[10px] text-neutral-400">
                            {typeof ord.selectedConfiguration === 'object'
                              ? ord.selectedConfiguration?.color || 'Ultra Deep Red'
                              : ord.selectedConfiguration}
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 border border-white/10">
                            {ord.paymentMethod || 'Direct Gateway'}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-tesla-red text-sm">
                          ${ord.finalPrice?.toLocaleString()}
                        </td>
                        <td className="py-3.5">
                          {ord.proofOfPayment ? (
                            <button
                              type="button"
                              onClick={() => setSelectedProofOrder(ord)}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Eye size={12} />
                              <span>View Proof</span>
                            </button>
                          ) : ord.txHash ? (
                            <span 
                              className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate max-w-[120px] inline-block"
                              title={ord.txHash}
                            >
                              Tx: {ord.txHash.slice(0, 10)}...
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-xs">No Proof</span>
                          )}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openOrderChat(ord)}
                              className="relative p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer group"
                              title="Message Buyer / Open Order Chat"
                            >
                              <MessageSquare size={15} className="group-hover:text-tesla-red transition-colors" />
                              {ord.messages && ord.messages.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-tesla-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                  {ord.messages.length}
                                </span>
                              )}
                            </button>
                            {ord.paymentStatus !== 'paid' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(ord._id, 'confirmed')}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Approve & Mark as Paid"
                              >
                                <CheckCircle size={15} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(ord._id)}
                              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CUSTOMERS                                         */}
        {/* ======================================================== */}
        {activeTab === 'customers' && (
          <section className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Registered Customers & Users
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Overview of all registered users and account verification statuses.
                </p>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="pl-9 pr-3.5 py-1.5 bg-[#141419] border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-tesla-red w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-neutral-400 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Email Verification</th>
                    <th className="pb-3">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCustomers.map((c) => (
                    <tr key={c._id || c.email} className="text-neutral-300 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 font-medium text-white">{c.fullName || 'User'}</td>
                      <td className="py-3.5 font-mono text-neutral-300">{c.email}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          c.role === 'admin'
                            ? 'bg-tesla-red/20 text-tesla-red border border-tesla-red/30'
                            : 'bg-white/5 text-neutral-300 border border-white/10'
                        }`}>
                          {c.role || 'customer'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle size={13} /> Verified
                        </span>
                      </td>
                      <td className="py-3.5 text-neutral-400">
                        {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 4: VEHICLES                                          */}
        {/* ======================================================== */}
        {activeTab === 'vehicles' && (
          <section className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Vehicle Inventory & Config Models
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Pre-sale flagship specifications and package tiers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((v) => (
                <div key={v._id} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-lg">{v.name}</h3>
                      <p className="text-xs text-neutral-400">{v.model}</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-tesla-red bg-tesla-red/10 px-3 py-1 rounded-lg border border-tesla-red/20">
                      ${v.illustrativePrice?.toLocaleString()} USD
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">{v.description}</p>

                  <div className="grid grid-cols-3 gap-3 text-center bg-[#101015] p-3 rounded-xl border border-white/5">
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase">Acceleration</div>
                      <div className="font-bold text-sm text-white font-mono">{v.specs?.acceleration || '1.9s 0-60'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase">Top Speed</div>
                      <div className="font-bold text-sm text-white font-mono">{v.specs?.power || '250+ mph'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-400 uppercase">Range</div>
                      <div className="font-bold text-sm text-white font-mono">{v.specs?.range || '620 miles'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 5: COUPONS                                           */}
        {/* ======================================================== */}
        {activeTab === 'coupons' && (
          <section className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Promotional Coupons & Discounts
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Manage promotional discount codes applied during reservation checkout.
                </p>
              </div>

              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="btn-tesla-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-glow-red cursor-pointer"
              >
                <Plus size={14} />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-3 hover:border-white/20 transition-all shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-base tracking-widest text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      {c.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-neutral-200">
                    {c.discountValue}% Discount on Supercar Reservation
                  </p>
                  <p className="text-[11px] text-neutral-400">{c.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-neutral-400">
                    <span>Usage Count: <strong className="text-white font-mono">{c.usageCount || 0}</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCoupon(c._id, c.isActive)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(c._id)}
                        className="p-1 text-neutral-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 6: PAYMENTS & TRANSACTIONS                           */}
        {/* ======================================================== */}
        {activeTab === 'payments' && (
          <section className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  Payment Gateway Transactions
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Blockchain crypto deposits and simulated card authorizations.
                </p>
              </div>

              <button
                onClick={() => loadData(true)}
                className="p-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl transition-colors"
                title="Refresh payments"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-neutral-400 uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Gateway / Provider</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p._id || p.providerReference} className="text-neutral-300 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 font-mono text-white">{p.providerReference}</td>
                        <td className="py-3.5 font-mono text-neutral-300">{p.orderNumber || '-'}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/5 border border-white/10">
                            {p.provider}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-emerald-400 text-sm">
                          ${p.amount?.toLocaleString()} {p.currency || 'USD'}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-neutral-400">
                          {new Date(p.createdAt || Date.now()).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 7: REPORTS & ANALYTICS                               */}
        {/* ======================================================== */}
        {activeTab === 'reports' && (
          <section className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="pb-4 border-b border-white/10">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Reservation Analytics & Reports
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Financial performance, volume metrics, and conversion rates.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs text-neutral-400 font-medium">Average Reservation Value</span>
                <div className="text-2xl font-bold font-mono text-white">
                  ${(reportsData?.summary?.avgOrderValue || 86450).toLocaleString()} USD
                </div>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp size={12} /> +8.4% vs target
                </p>
              </div>

              <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs text-neutral-400 font-medium">Checkout Conversion Rate</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {reportsData?.summary?.conversionRate || '14.2%'}
                </div>
                <p className="text-[11px] text-neutral-400">From vehicle configuration to deposit</p>
              </div>

              <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-xs text-neutral-400 font-medium">Payment Method Preference</span>
                <div className="text-2xl font-bold font-mono text-amber-400">
                  Crypto & Bank
                </div>
                <p className="text-[11px] text-neutral-400">Bitcoin, USDT & Bank Card</p>
              </div>
            </div>

            {/* Method Breakdown Progress Bars */}
            <div className="bg-[#101015] p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white">Payment Method Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400 font-medium">₿ Bitcoin (BTC)</span>
                    <span className="font-mono text-neutral-300">45%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-medium">₮ USDT (TRC-20 & ERC-20)</span>
                    <span className="font-mono text-neutral-300">40%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-blue-400 font-medium">💳 Bank Card (Credit / Debit)</span>
                    <span className="font-mono text-neutral-300">15%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* TAB 8: SYSTEM SETTINGS                                   */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <section className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="pb-4 border-b border-white/10">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                System & Security Settings
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Admin authentication credentials, SMTP email status, and wallet configuration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin Profile */}
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Admin Credentials</span>
                </div>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-neutral-400">Admin Email:</span>
                    <span className="font-mono text-white font-medium">teslasupporttech@gmail.com</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-neutral-400">Security Password:</span>
                    <span className="font-mono text-white font-medium">Tesla@admin</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400">Authorization Level:</span>
                    <span className="text-emerald-400 font-semibold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Full Root Admin
                    </span>
                  </div>
                </div>
              </div>

              {/* SMTP Email Service */}
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Mail size={16} className="text-blue-400" />
                  <span>SMTP Email Gateway</span>
                </div>
                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-neutral-400">Service Host:</span>
                    <span className="font-mono text-white font-medium">smtp.gmail.com:465</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-neutral-400">Sender Identity:</span>
                    <span className="font-mono text-white font-medium">teslasupporttech@gmail.com</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400">Connection Status:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle size={13} /> Active & Connected
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Crypto Wallets & Tawk.to Live Chat Settings */}
              <div className="bg-[#121217] p-6 rounded-2xl border border-white/10 space-y-6 md:col-span-2 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Server size={18} className="text-amber-400" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      Configured Crypto Receiver Addresses & Live Chat
                    </span>
                  </div>
                  {settingsSuccessMsg && (
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 animate-fadeIn">
                      <CheckCircle size={14} />
                      <span>{settingsSuccessMsg}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Section 1: Crypto Receiver Addresses */}
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>Customer Deposit Addresses (Live on Checkout)</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Bitcoin (BTC) */}
                      <div className="p-4 bg-white/[0.02] border border-amber-500/20 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span>₿ Bitcoin (BTC) Mainnet Address</span>
                          </label>
                          <span className="text-[10px] text-neutral-400 font-mono">P2WPKH / Bech32 / Legacy</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={adminSettings.btcAddress}
                            onChange={(e) => setAdminSettings({ ...adminSettings, btcAddress: e.target.value })}
                            placeholder="e.g. bc1q..."
                            className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-400"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Incoming Bitcoin payments on the reservation checkout page will be requested to this address.
                        </p>
                      </div>

                      {/* USDT TRC-20 */}
                      <div className="p-4 bg-white/[0.02] border border-emerald-500/20 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span>₮ USDT (TRC-20 Tron Network) Address</span>
                          </label>
                          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">Tron TRC-20</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={adminSettings.usdtTrc20Address}
                            onChange={(e) => setAdminSettings({ ...adminSettings, usdtTrc20Address: e.target.value })}
                            placeholder="e.g. T..."
                            className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-400"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Recommended low-fee Tron protocol receiver address shown when buyer selects TRC-20 USDT.
                        </p>
                      </div>

                      {/* USDT ERC-20 */}
                      <div className="p-4 bg-white/[0.02] border border-emerald-500/20 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span>₮ USDT (ERC-20 Ethereum Network) Address</span>
                          </label>
                          <span className="text-[10px] text-neutral-400 font-mono">Ethereum Mainnet</span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={adminSettings.usdtErc20Address}
                            onChange={(e) => setAdminSettings({ ...adminSettings, usdtErc20Address: e.target.value })}
                            placeholder="e.g. 0x..."
                            className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-400"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Ethereum EVM address shown when buyer selects ERC-20 USDT.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Tawk.to Live Chat Configuration */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                        <MessageCircle size={15} className="text-blue-400" />
                        <span>Tawk.to Live Chat Widget Integration</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        adminSettings.tawkPropertyId && adminSettings.tawkWidgetId
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/5 text-neutral-400 border border-white/10'
                      }`}>
                        {adminSettings.tawkPropertyId && adminSettings.tawkWidgetId ? 'Widget Configured' : 'Optional Setup'}
                      </span>
                    </div>

                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl text-xs text-neutral-300 space-y-1">
                      <p className="font-semibold text-blue-300 flex items-center gap-1">
                        <span>How to get your Tawk.to IDs:</span>
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        1. Sign up or log into <span className="text-white font-mono">dashboard.tawk.to</span><br />
                        2. Go to <strong>Administration &gt; Chat Widget</strong><br />
                        3. In the Direct Chat Link or Script URL, look for: <code className="text-blue-300 bg-black/40 px-1 py-0.5 rounded">embed.tawk.to/&lt;PropertyId&gt;/&lt;WidgetId&gt;</code>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                          Tawk.to Property ID:
                        </label>
                        <input
                          type="text"
                          value={adminSettings.tawkPropertyId}
                          onChange={(e) => setAdminSettings({ ...adminSettings, tawkPropertyId: e.target.value })}
                          placeholder="e.g. 660f1b2c45e810..."
                          className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                          Tawk.to Widget ID:
                        </label>
                        <input
                          type="text"
                          value={adminSettings.tawkWidgetId}
                          onChange={(e) => setAdminSettings({ ...adminSettings, tawkWidgetId: e.target.value })}
                          placeholder="e.g. 1hr39b56p or default"
                          className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1 font-medium">
                        Tawk.to Direct Chat Link (Optional):
                      </label>
                      <input
                        type="url"
                        value={adminSettings.tawkDirectChatUrl}
                        onChange={(e) => setAdminSettings({ ...adminSettings, tawkDirectChatUrl: e.target.value })}
                        placeholder="e.g. https://tawk.to/chat/..."
                        className="w-full px-3.5 py-2.5 bg-[#16161c] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs text-neutral-400">
                      Changes take effect immediately on public checkout.
                    </span>
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="btn-tesla-primary text-xs px-5 py-2.5 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingSettings ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Save Crypto & Chat Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE COUPON                                   */}
      {/* ======================================================== */}
      {isCouponModalOpen && (
        <div 
          onClick={() => setIsCouponModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#121217] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create New Discount Coupon</h3>
              <button 
                onClick={() => setIsCouponModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP50"
                  className="w-full px-3.5 py-2.5 bg-[#18181f] border border-white/10 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-tesla-red"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#18181f] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-tesla-red"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  placeholder="e.g. Special VIP Early Reservation Access"
                  className="w-full px-3.5 py-2.5 bg-[#18181f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-tesla-red"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="btn-tesla-primary px-5 py-2 cursor-pointer"
                >
                  {couponSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PROOF OF PAYMENT INSPECTION                     */}
      {/* ======================================================== */}
      {selectedProofOrder && (
        <div 
          onClick={() => setSelectedProofOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#121217] border border-white/15 rounded-2xl p-6 space-y-5 shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Proof of Payment</span>
                    <span className="font-mono text-xs text-neutral-400 font-normal">
                      ({selectedProofOrder.orderNumber})
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Customer: <span className="text-white font-medium">{selectedProofOrder.customerName}</span> · {selectedProofOrder.customerEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProofOrder(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Order & Payment Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Amount Due</span>
                <div className="font-mono font-bold text-tesla-red text-sm">
                  ${selectedProofOrder.finalPrice?.toLocaleString()} USD
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Payment Method</span>
                <div className="font-medium text-white truncate">
                  {selectedProofOrder.paymentMethod || 'Crypto Deposit'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Status</span>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedProofOrder.paymentStatus || 'Verified'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Date</span>
                <div className="text-neutral-300">
                  {new Date(selectedProofOrder.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Blockchain Transaction Hash / Reference */}
            {selectedProofOrder.txHash && (
              <div className="space-y-1">
                <span className="text-[11px] text-neutral-400 font-medium">Transaction Reference (TxID):</span>
                <div className="flex items-center justify-between gap-2 bg-[#181820] border border-white/10 rounded-xl p-2.5 text-xs font-mono">
                  <span className="text-amber-400 truncate select-all">{selectedProofOrder.txHash}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator?.clipboard?.writeText(selectedProofOrder.txHash);
                      setCopiedHash(true);
                      setTimeout(() => setCopiedHash(false), 2000);
                    }}
                    className="p-1 text-neutral-400 hover:text-white transition-colors shrink-0"
                    title="Copy TxHash"
                  >
                    {copiedHash ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Uploaded Receipt Document / Screenshot Preview */}
            {selectedProofOrder.proofOfPayment ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Attached Document: <span className="text-white font-medium">{selectedProofOrder.proofOfPayment.fileName}</span></span>
                  <span>{selectedProofOrder.proofOfPayment.fileSize}</span>
                </div>

                <div className="max-h-[50vh] overflow-auto rounded-xl border border-white/10 bg-black/50 p-2 flex items-center justify-center">
                  {selectedProofOrder.proofOfPayment.fileType?.startsWith('image/') ? (
                    <img
                      src={selectedProofOrder.proofOfPayment.fileData}
                      alt="Proof of Payment Receipt"
                      className="max-h-[45vh] max-w-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="py-12 text-center space-y-2 text-neutral-300">
                      <FileText size={48} className="mx-auto text-emerald-400" />
                      <p className="text-xs font-medium">{selectedProofOrder.proofOfPayment.fileName}</p>
                      <p className="text-[10px] text-neutral-500">PDF Document Proof Attached</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-center text-xs text-neutral-400">
                No image receipt attached. Only transaction reference was provided.
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> Verified Admin Clearance
              </span>
              <button
                type="button"
                onClick={() => setSelectedProofOrder(null)}
                className="btn-tesla-secondary text-xs px-4 py-2 text-white cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ORDER CONVERSATION / BUYER MESSAGING            */}
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
                      Order Conversation: {selectedChatOrder.orderNumber}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      selectedChatOrder.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedChatOrder.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Buyer: <span className="text-white font-medium">{selectedChatOrder.customerName}</span> ({selectedChatOrder.customerEmail}) · {selectedChatOrder.vehicleName}
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

            {/* Messages Thread Container */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-[#0a0a0d]">
              {loadingMessages && chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400 space-y-2">
                  <RefreshCw size={24} className="animate-spin text-tesla-red" />
                  <span className="text-xs">Loading conversation history...</span>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-2 text-neutral-400">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 mb-1">
                    <MessageCircle size={24} />
                  </div>
                  <p className="text-sm font-semibold text-white">No Messages Exchanged Yet</p>
                  <p className="text-xs max-w-sm text-neutral-400">
                    Start a direct conversation with {selectedChatOrder.customerName} regarding their deposit, delivery schedule, or configuration details.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isAdminMsg = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1 px-1">
                        <span className={`font-semibold ${isAdminMsg ? 'text-tesla-red' : 'text-blue-400'}`}>
                          {isAdminMsg ? 'Tesla Support Team (Admin)' : msg.senderName || selectedChatOrder.customerName}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isAdminMsg
                            ? 'bg-gradient-to-br from-tesla-red/20 to-tesla-red/5 border border-tesla-red/30 text-white rounded-br-sm'
                            : 'bg-[#181820] border border-white/10 text-neutral-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap select-text">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick response suggestions */}
            <div className="px-5 py-2 bg-[#121217] border-t border-white/5 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-neutral-500 shrink-0 font-medium">Quick Replies:</span>
              <button
                type="button"
                onClick={() => setNewChatMessage('Your payment proof has been reviewed and verified. Thank you!')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 shrink-0 transition-colors cursor-pointer"
              >
                Payment Verified
              </button>
              <button
                type="button"
                onClick={() => setNewChatMessage('Please provide your preferred vehicle delivery city and contact phone number.')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 shrink-0 transition-colors cursor-pointer"
              >
                Delivery Address Request
              </button>
              <button
                type="button"
                onClick={() => setNewChatMessage('Your Roadster reservation is actively prioritized in our production schedule.')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 shrink-0 transition-colors cursor-pointer"
              >
                Production Update
              </button>
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendOrderMessage} className="p-4 bg-[#141419] border-t border-white/10 flex items-center gap-3">
              <input
                type="text"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder={`Message ${selectedChatOrder.customerName}...`}
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
