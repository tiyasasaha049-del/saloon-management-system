// LUMINA LUXE ENTERPRISE FRONTEND API SERVICE

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const getAuthToken = () => {
  return localStorage.getItem('lumina_jwt_token') || '';
};

const request = async (endpoint, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.status === 401) {
      // Optional auto-logout or token expiry notification
      console.warn('[API SERVICE] Unauthorized or token expired');
    }

    if (!response.ok) {
      let errorDetail = 'API request failed';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorDetail;
      } catch (e) {
        errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout (${timeoutMs}ms) for ${endpoint}`);
    }
    throw error;
  }
};

export const apiService = {
  // Health & Readiness
  checkHealth: async () => {
    try {
      return await request('/health', { method: 'GET' }, 3000);
    } catch (e) {
      return { status: 'offline' };
    }
  },

  // Auth APIs
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  getUsers: () => request('/users', { method: 'GET' }),
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),

  // Branches API
  getBranches: () => request('/branches', { method: 'GET' }),
  createBranch: (branchData) => request('/branches', { method: 'POST', body: JSON.stringify(branchData) }),

  // Products API
  getProducts: (search = '', category = '') => request(`/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`, { method: 'GET' }),
  createProduct: (productData) => request('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id, productData) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Services API
  getServices: () => request('/services', { method: 'GET' }),
  createService: (serviceData) => request('/services', { method: 'POST', body: JSON.stringify(serviceData) }),
  updateService: (id, serviceData) => request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(serviceData) }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  // Customers API
  getCustomers: (search = '') => request(`/customers?search=${encodeURIComponent(search)}`, { method: 'GET' }),
  createCustomer: (customerData) => request('/customers', { method: 'POST', body: JSON.stringify(customerData) }),
  updateCustomer: (id, customerData) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(customerData) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Employees API
  getEmployees: () => request('/employees', { method: 'GET' }),
  createEmployee: (employeeData) => request('/employees', { method: 'POST', body: JSON.stringify(employeeData) }),
  updateEmployee: (id, employeeData) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(employeeData) }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),

  // Appointments API
  getAppointments: (date = '', statusFilter = '') => request(`/appointments?date=${encodeURIComponent(date)}&status_filter=${encodeURIComponent(statusFilter)}`, { method: 'GET' }),
  createAppointment: (appointmentData) => request('/appointments', { method: 'POST', body: JSON.stringify(appointmentData) }),
  updateAppointment: (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),

  // Attendance API
  getAttendance: (date = '') => request(`/attendance?date=${encodeURIComponent(date)}`, { method: 'GET' }),
  createAttendance: (attendanceData) => request('/attendance', { method: 'POST', body: JSON.stringify(attendanceData) }),

  // Payroll API
  getPayroll: () => request('/payroll', { method: 'GET' }),
  createPayroll: (payrollData) => request('/payroll', { method: 'POST', body: JSON.stringify(payrollData) }),

  // Invoices / POS Billing API
  getInvoices: () => request('/invoices', { method: 'GET' }),
  createInvoice: (invoiceData) => request('/invoices', { method: 'POST', body: JSON.stringify(invoiceData) }),

  // Home Services API
  getHomeServices: () => request('/home-services', { method: 'GET' }),
  createHomeService: (data) => request('/home-services', { method: 'POST', body: JSON.stringify(data) }),

  // Reviews API
  getReviews: () => request('/reviews', { method: 'GET' }),
  createReview: (reviewData) => request('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),

  // Offers & Promo Coupons API
  getOffers: () => request('/offers', { method: 'GET' }),
  createOffer: (offerData) => request('/offers', { method: 'POST', body: JSON.stringify(offerData) }),
  updateOffer: (id, offerData) => request(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(offerData) }),
  reactivateOffer: (id, data) => request(`/offers/${id}/reactivate`, { method: 'POST', body: JSON.stringify(data) }),
  pauseOffer: (id) => request(`/offers/${id}/pause`, { method: 'POST' }),
  activateOffer: (id) => request(`/offers/${id}/activate`, { method: 'POST' }),
  deleteOffer: (id) => request(`/offers/${id}`, { method: 'DELETE' }),
  validateCoupon: (couponReq) => request('/coupons/validate', { method: 'POST', body: JSON.stringify(couponReq) }),
  getCouponAnalytics: () => request('/coupons/analytics', { method: 'GET' }),
  getCouponRedemptions: (couponId = '') => request(`/coupons/redemptions${couponId ? `?coupon_id=${couponId}` : ''}`, { method: 'GET' }),

  // Notifications API
  getNotifications: () => request('/notifications', { method: 'GET' }),
  createNotification: (data) => request('/notifications', { method: 'POST', body: JSON.stringify(data) }),

  // Audit Logs API
  getAuditLogs: () => request('/audit-logs', { method: 'GET' }),
  logAudit: (auditData) => request('/audit-logs', { method: 'POST', body: JSON.stringify(auditData) }),

  // Inventory & Stock Control API
  getInventoryTransactions: () => request('/inventory/transactions', { method: 'GET' }),
  adjustStock: (adjustmentData) => request('/inventory/adjust', { method: 'POST', body: JSON.stringify(adjustmentData) }),

  // Purchase Orders API
  getPurchaseOrders: () => request('/purchase-orders', { method: 'GET' }),
  createPurchaseOrder: (poData) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(poData) }),
  receivePurchaseOrder: (poId) => request(`/purchase-orders/${poId}/receive`, { method: 'POST' }),

  // Authorized Distributors / Suppliers API
  getDistributors: () => request('/distributors', { method: 'GET' }),
  createDistributor: (distData) => request('/distributors', { method: 'POST', body: JSON.stringify(distData) }),
  updateDistributor: (id, distData) => request(`/distributors/${id}`, { method: 'PUT', body: JSON.stringify(distData) }),
  deleteDistributor: (id) => request(`/distributors/${id}`, { method: 'DELETE' }),

  // Settings API
  getSettings: () => request('/settings', { method: 'GET' }),
  saveSetting: (key, value) => request('/settings', { method: 'POST', body: JSON.stringify({ key, value }) }),

  // Product Partnership & Brand Collaboration API
  getProductPartners: (search = '', category = '', status = '', partnershipType = '') =>
    request(`/product-partners?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&status=${encodeURIComponent(status)}&partnership_type=${encodeURIComponent(partnershipType)}`, { method: 'GET' }),
  getProductPartnerDetails: (id) => request(`/product-partners/${id}`, { method: 'GET' }),
  createProductPartner: (partnerData) => request('/product-partners', { method: 'POST', body: JSON.stringify(partnerData) }),
  updateProductPartner: (id, partnerData) => request(`/product-partners/${id}`, { method: 'PUT', body: JSON.stringify(partnerData) }),
  deleteProductPartner: (id) => request(`/product-partners/${id}`, { method: 'DELETE' }),

  // Partnership Requests API
  getPartnershipRequests: (status = '', search = '') =>
    request(`/partnership-requests?status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`, { method: 'GET' }),
  createPartnershipRequest: (reqData) => request('/partnership-requests', { method: 'POST', body: JSON.stringify(reqData) }),
  approvePartnershipRequest: (id) => request(`/partnership-requests/${id}/approve`, { method: 'POST' }),
  rejectPartnershipRequest: (id, notes = '') => request(`/partnership-requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ notes }) }),

  // Partner Products API
  getPartnerProducts: (partnerId = '', category = '', search = '') =>
    request(`/partner-products?partner_id=${encodeURIComponent(partnerId)}&category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`, { method: 'GET' }),
  createPartnerProduct: (data) => request('/partner-products', { method: 'POST', body: JSON.stringify(data) }),
  deletePartnerProduct: (id) => request(`/partner-products/${id}`, { method: 'DELETE' }),

  // Partnership Campaigns API
  getPartnershipCampaigns: (partnerId = '', status = '', search = '') =>
    request(`/partnership-campaigns?partner_id=${encodeURIComponent(partnerId)}&status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}`, { method: 'GET' }),
  createPartnershipCampaign: (campData) => request('/partnership-campaigns', { method: 'POST', body: JSON.stringify(campData) }),
  updatePartnershipCampaign: (id, campData) => request(`/partnership-campaigns/${id}`, { method: 'PUT', body: JSON.stringify(campData) }),
  deletePartnershipCampaign: (id) => request(`/partnership-campaigns/${id}`, { method: 'DELETE' }),

  // Partnership Commissions API
  getPartnershipCommissions: (partnerId = '', status = '', period = '') =>
    request(`/partnership-commissions?partner_id=${encodeURIComponent(partnerId)}&status=${encodeURIComponent(status)}&period=${encodeURIComponent(period)}`, { method: 'GET' }),
  createPartnershipCommission: (commData) => request('/partnership-commissions', { method: 'POST', body: JSON.stringify(commData) }),
  approvePartnershipCommission: (id) => request(`/partnership-commissions/${id}/approve`, { method: 'POST' }),
  payPartnershipCommission: (id, paymentData) => request(`/partnership-commissions/${id}/pay`, { method: 'POST', body: JSON.stringify(paymentData) }),

  // Partnership Payments API
  getPartnershipPayments: (partnerId = '') =>
    request(`/partnership-payments?partner_id=${encodeURIComponent(partnerId)}`, { method: 'GET' }),
  createPartnershipPayment: (payData) => request('/partnership-payments', { method: 'POST', body: JSON.stringify(payData) }),

  // Partnership Reports API
  getPartnershipReportsOverview: () => request('/partnership-reports/overview', { method: 'GET' }),
  getPartnerPerformanceReport: () => request('/partnership-reports/partner-performance', { method: 'GET' }),
  getProductPerformanceReport: () => request('/partnership-reports/product-performance', { method: 'GET' }),
  getCampaignPerformanceReport: () => request('/partnership-reports/campaign-performance', { method: 'GET' }),
  getCommissionReport: () => request('/partnership-reports/commission-report', { method: 'GET' })
};


