import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { VehiclePage } from './pages/VehiclePage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentProcessingPage } from './pages/PaymentProcessingPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { FAQPage } from './pages/FAQPage';
import { TawkWidget } from './components/TawkWidget';

// Layout wrapper to control header/footer visibility on dashboard views
const AppLayout = () => {
  const location = useLocation();
  const isDashboardView = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-100 flex flex-col font-sans selection:bg-tesla-red selection:text-white">
      {/* Dynamic Tawk.to Live Chat Widget */}
      <TawkWidget />

      {/* Global Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/roadster" element={<VehiclePage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-processing" element={<PaymentProcessingPage />} />
          <Route path="/confirmation" element={<OrderConfirmationPage />} />
          <Route path="/dashboard" element={<CustomerDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </main>

      {/* Footer on public pages */}
      {!isDashboardView && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
