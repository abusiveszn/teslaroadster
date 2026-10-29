const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => localStorage.getItem('tesla_demo_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('tesla_demo_token', token);
  else localStorage.removeItem('tesla_demo_token');
};

const getHeaders = (includeAuth = true, customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Safe HTTP request helper:
 * Parses text first before attempting JSON parsing.
 * Prevents "Unexpected end of JSON input" errors when responses are empty,
 * when non-JSON status pages are returned, or when connections drop.
 */
const request = async (endpoint, options = {}, includeAuth = true) => {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = getHeaders(includeAuth, options.headers || {});

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkError) {
    throw new Error(`Network connection error: ${networkError.message || 'Unable to reach server'}`);
  }

  const rawText = await response.text();
  let data = null;

  if (rawText && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: rawText };
    }
  }

  if (!response.ok) {
    let message = data?.error;
    if (!message && data?.message && typeof data.message === 'string' && !data.message.trim().startsWith('<')) {
      message = data.message;
    }
    if (!message) {
      if (response.status === 405) {
        message = 'Method Not Allowed (405): Serverless API route was not reached. Please verify API routing configuration.';
      } else {
        message = `Request failed with status ${response.status}: ${response.statusText || 'Unknown Error'}`;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data ?? {};
};

export const api = {
  // Auth endpoints
  register: (data) =>
    request(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false
    ),

  login: (credentials) =>
    request(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      false
    ),

  sendLoginOtp: (email) =>
    request(
      '/auth/send-login-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      false
    ),

  verifyLoginOtp: (email, code) =>
    request(
      '/auth/verify-login-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, code }),
      },
      false
    ),

  verifyEmail: (data) =>
    request(
      '/auth/verify-email',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      false
    ),

  resendVerificationCode: (email) =>
    request(
      '/auth/resend-code',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
      false
    ),

  getMe: () =>
    request(
      '/auth/me',
      {
        method: 'GET',
      },
      true
    ),

  getDemoLogs: () =>
    request(
      '/auth/demo-email-logs',
      {
        method: 'GET',
      },
      false
    ),

  // Vehicle endpoints
  getVehicles: () =>
    request(
      '/vehicles',
      {
        method: 'GET',
      },
      false
    ),

  getVehicleById: (id) =>
    request(
      `/vehicles/${id}`,
      {
        method: 'GET',
      },
      false
    ),

  // Coupon endpoints
  validateCoupon: (code, vehicleId, packageId) =>
    request(
      '/coupons/validate',
      {
        method: 'POST',
        body: JSON.stringify({ code, vehicleId, packageId }),
      },
      false
    ),

  // Order endpoints
  createOrder: (orderData) =>
    request(
      '/orders',
      {
        method: 'POST',
        body: JSON.stringify(orderData),
      },
      true
    ),

  getMyOrders: () =>
    request(
      '/orders/my-orders',
      {
        method: 'GET',
      },
      true
    ),

  getOrderById: (id) =>
    request(
      `/orders/${id}`,
      {
        method: 'GET',
      },
      true
    ),

  // Payment endpoints
  initializePayment: (data) =>
    request(
      '/payments/initialize',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    ),

  simulatePayment: (data) =>
    request(
      '/payments/simulate',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    ),

  getPaymentStatus: (reference) =>
    request(
      `/payments/${reference}/status`,
      {
        method: 'GET',
      },
      true
    ),

  // Admin endpoints
  getAdminOverview: () =>
    request(
      '/admin/overview',
      {
        method: 'GET',
      },
      true
    ),

  getAdminOrders: (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const endpoint = query ? `/admin/orders?${query}` : '/admin/orders';
    return request(
      endpoint,
      {
        method: 'GET',
      },
      true
    );
  },

  getAdminCustomers: () =>
    request(
      '/admin/customers',
      {
        method: 'GET',
      },
      true
    ),

  getAdminCoupons: () =>
    request(
      '/admin/coupons',
      {
        method: 'GET',
      },
      true
    ),

  createAdminCoupon: (data) =>
    request(
      '/admin/coupons',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      true
    ),

  updateAdminCoupon: (id, data) =>
    request(
      `/admin/coupons/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      true
    ),

  deleteAdminCoupon: (id) =>
    request(
      `/admin/coupons/${id}`,
      {
        method: 'DELETE',
      },
      true
    ),

  updateAdminOrder: (id, data) =>
    request(
      `/admin/orders/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      true
    ),

  deleteAdminOrder: (id) =>
    request(
      `/admin/orders/${id}`,
      {
        method: 'DELETE',
      },
      true
    ),

  getAdminPayments: () =>
    request(
      '/admin/payments',
      {
        method: 'GET',
      },
      true
    ),

  getAdminReports: () =>
    request(
      '/admin/reports',
      {
        method: 'GET',
      },
      true
    ),

  getReports: () =>
    request(
      '/admin/reports',
      {
        method: 'GET',
      },
      true
    ),

  // Crypto addresses & public settings
  getSettings: () =>
    request(
      '/settings',
      {
        method: 'GET',
      },
      false
    ),

  // Admin settings management
  getAdminSettings: () =>
    request(
      '/admin/settings',
      {
        method: 'GET',
      },
      true
    ),

  updateAdminSettings: (data) =>
    request(
      '/admin/settings',
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      true
    ),

  // Order chat / conversation
  getOrderMessages: (orderId) =>
    request(
      `/orders/${orderId}/messages`,
      {
        method: 'GET',
      },
      true
    ),

  sendOrderMessage: (orderId, message) =>
    request(
      `/orders/${orderId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      },
      true
    ),
};
