import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import {
  INITIAL_USER,
  ROLES_LIST,
  INITIAL_SETTINGS,
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SERVICE_CATEGORIES,
  INITIAL_SERVICE_TYPES,
  INITIAL_SERVICES,
  INITIAL_APPOINTMENTS,
  INITIAL_HOME_SERVICES,
  INITIAL_BRANCHES,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY_LOGS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_INVOICES,
  INITIAL_REVIEWS,
  INITIAL_COMPLAINTS,
  INITIAL_LOYALTY_TIERS,
  INITIAL_MEMBERSHIP_PLANS,
  INITIAL_OFFERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_DISTRIBUTORS,
  INITIAL_PRODUCT_PARTNERS,
  INITIAL_PARTNERSHIP_REQUESTS,
  INITIAL_PARTNER_PRODUCTS,
  INITIAL_PARTNERSHIP_CAMPAIGNS,
  INITIAL_PARTNERSHIP_COMMISSIONS,
  INITIAL_PARTNERSHIP_PAYMENTS
} from '../data/initialData';

const normalizeOffer = (o) => {
  if (!o) return o;
  const dVal = Number(o.discount_value ?? o.discountValue ?? o.discountPercent ?? 0);
  const rawType = (o.discount_type || o.discountType || 'PERCENTAGE').toUpperCase();
  const dType = rawType.includes('PERCENT') ? 'percent' : 'flat';
  const minSp = Number(o.minimum_spend ?? o.minSpend ?? 0);
  const maxDisc = Number(o.maximum_discount ?? o.maxDiscount ?? 0);
  const uCount = Number(o.used_count ?? o.usedCount ?? o.usageCount ?? 0);
  const uLimit = Number(o.usage_limit ?? o.usageLimit ?? o.maxUsage ?? 0);
  const pLimit = Number(o.per_customer_limit ?? o.perCustomerLimit ?? 1);
  const vUntil = o.valid_until || o.validUntil || o.validTill || '2026-12-31';
  const vFrom = o.valid_from || o.validFrom || '2026-01-01';
  const st = (o.status || 'ACTIVE').toUpperCase();
  const isActive = st === 'ACTIVE';

  return {
    ...o,
    id: o.id,
    title: o.title || o.campaignName || o.campaign_name || 'Special Offer',
    campaignName: o.title || o.campaignName || o.campaign_name || 'Special Offer',
    code: (o.code || '').toUpperCase(),
    description: o.description || '',
    discountType: dType,
    discount_type: rawType,
    discountValue: dVal,
    discount_value: dVal,
    discountPercent: dType === 'percent' ? dVal : 0,
    minSpend: minSp,
    minimum_spend: minSp,
    maxDiscount: maxDisc,
    maximum_discount: maxDisc,
    validFrom: vFrom,
    valid_from: vFrom,
    validUntil: vUntil,
    valid_until: vUntil,
    validTill: vUntil,
    usageCount: uCount,
    usedCount: uCount,
    used_count: uCount,
    maxUsage: uLimit,
    usageLimit: uLimit,
    usage_limit: uLimit,
    perCustomerLimit: pLimit,
    per_customer_limit: pLimit,
    customerEligibility: o.customer_eligibility || o.customerEligibility || 'ALL_CUSTOMERS',
    customer_eligibility: o.customer_eligibility || o.customerEligibility || 'ALL_CUSTOMERS',
    applicableTo: o.applicable_to || o.applicableTo || 'ENTIRE_BILL',
    applicable_to: o.applicable_to || o.applicableTo || 'ENTIRE_BILL',
    applicableTarget: o.applicable_target || o.applicableTarget || '',
    status: st,
    active: isActive
  };
};

const SalonContext = createContext();

export const SalonProvider = ({ children }) => {
  // Navigation & Layout UI state with bidirectional Browser URL Sync
  const getInitialView = () => {
    if (typeof window === 'undefined') return 'dashboard';
    try {
      const pathname = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, '').split('/')[0].toLowerCase();
      const raw = hash || pathname;
      if (raw) {
        if (['homeservice', 'homeservices', 'home-service', 'schedule', 'schedules'].includes(raw)) {
          return 'schedule';
        }
        return raw;
      }
    } catch (e) {
      console.warn('[ROUTING] URL parse error:', e);
    }
    return 'dashboard';
  };

  const [activeView, setActiveViewState] = useState(getInitialView);

  const setActiveView = useCallback((viewId, updateHistory = true) => {
    let cleanId = viewId;
    if (['homeservice', 'homeservices', 'home-service', 'schedule', 'schedules'].includes(cleanId)) {
      cleanId = 'schedule';
    }
    setActiveViewState(cleanId);

    if (updateHistory && typeof window !== 'undefined') {
      try {
        const targetPath = cleanId === 'dashboard' ? '/' : `/${cleanId}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ view: cleanId }, '', targetPath);
        }
      } catch (e) {
        try {
          window.location.hash = cleanId === 'dashboard' ? '' : cleanId;
        } catch (_) {}
      }
    }
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.replace(/^\/+/, '').split('/')[0].toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, '').split('/')[0].toLowerCase();
      const raw = hash || pathname || 'dashboard';
      const resolved = ['homeservice', 'homeservices', 'home-service', 'schedule', 'schedules'].includes(raw) ? 'schedule' : raw;
      setActiveViewState(resolved);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & UI Receipts
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [quickBookingDate, setQuickBookingDate] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isApiOnline, setIsApiOnline] = useState(true);

  // Auth / Role State (synced with AuthContext)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch (e) {
      return INITIAL_USER;
    }
  });

  const [roles] = useState(ROLES_LIST);

  // System Settings - Defaults to 'light' (Bright Theme) on initial startup, persists user's selection
  const [settings, setSettings] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('lumina_theme');
      const savedSettings = localStorage.getItem('lumina_settings');
      let parsed = savedSettings ? JSON.parse(savedSettings) : INITIAL_SETTINGS;
      const initialTheme = savedTheme ? savedTheme : 'light';
      return { ...parsed, theme: initialTheme };
    } catch (e) {
      return { ...INITIAL_SETTINGS, theme: 'light' };
    }
  });

  // Core Entity States (persisted with LocalStorage & synced with Backend)
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch (e) {
      return INITIAL_CUSTOMERS;
    }
  });

  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_employees');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch (e) {
      return INITIAL_EMPLOYEES;
    }
  });

  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);
  const [serviceCategories, setServiceCategories] = useState(INITIAL_SERVICE_CATEGORIES);
  const [serviceTypes, setServiceTypes] = useState(INITIAL_SERVICE_TYPES);

  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_services');
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch (e) {
      return INITIAL_SERVICES;
    }
  });

  const [branches, setBranches] = useState(INITIAL_BRANCHES);

  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_appointments');
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch (e) {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [homeServices, setHomeServices] = useState(INITIAL_HOME_SERVICES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [inventoryLogs, setInventoryLogs] = useState(INITIAL_INVENTORY_LOGS);
  const [purchaseOrders, setPurchaseOrders] = useState(INITIAL_PURCHASE_ORDERS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [loyaltyTiers, setLoyaltyTiers] = useState(INITIAL_LOYALTY_TIERS);
  const [membershipPlans, setMembershipPlans] = useState(INITIAL_MEMBERSHIP_PLANS);
  const [offers, setOffers] = useState(() => INITIAL_OFFERS.map(normalizeOffer));
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [distributors, setDistributors] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_distributors');
      return saved ? JSON.parse(saved) : INITIAL_DISTRIBUTORS;
    } catch (e) {
      return INITIAL_DISTRIBUTORS;
    }
  });

  // Product Partnership & Brand Collaboration States
  const [productPartners, setProductPartners] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_product_partners');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCT_PARTNERS;
    } catch (e) {
      return INITIAL_PRODUCT_PARTNERS;
    }
  });

  const [partnershipRequests, setPartnershipRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_partnership_requests');
      return saved ? JSON.parse(saved) : INITIAL_PARTNERSHIP_REQUESTS;
    } catch (e) {
      return INITIAL_PARTNERSHIP_REQUESTS;
    }
  });

  const [partnerProducts, setPartnerProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_partner_products');
      return saved ? JSON.parse(saved) : INITIAL_PARTNER_PRODUCTS;
    } catch (e) {
      return INITIAL_PARTNER_PRODUCTS;
    }
  });

  const [partnershipCampaigns, setPartnershipCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_partnership_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_PARTNERSHIP_CAMPAIGNS;
    } catch (e) {
      return INITIAL_PARTNERSHIP_CAMPAIGNS;
    }
  });

  const [partnershipCommissions, setPartnershipCommissions] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_partnership_commissions');
      return saved ? JSON.parse(saved) : INITIAL_PARTNERSHIP_COMMISSIONS;
    } catch (e) {
      return INITIAL_PARTNERSHIP_COMMISSIONS;
    }
  });

  const [partnershipPayments, setPartnershipPayments] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_partnership_payments');
      return saved ? JSON.parse(saved) : INITIAL_PARTNERSHIP_PAYMENTS;
    } catch (e) {
      return INITIAL_PARTNERSHIP_PAYMENTS;
    }
  });

  const [partnershipOverview, setPartnershipOverview] = useState(null);

  // Load backend data on mount and merge safely with localStorage
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const health = await apiService.checkHealth();
        if (health && health.status === 'healthy') {
          setIsApiOnline(true);
          const [
            prods, srvs, appts, custs, emps, invs, atts, brs, hms, revs, offrs, notifs, logs
          ] = await Promise.allSettled([
            apiService.getProducts(),
            apiService.getServices(),
            apiService.getAppointments(),
            apiService.getCustomers(),
            apiService.getEmployees(),
            apiService.getInvoices(),
            apiService.getAttendance(),
            apiService.getBranches(),
            apiService.getHomeServices(),
            apiService.getReviews(),
            apiService.getOffers(),
            apiService.getNotifications(),
            apiService.getAuditLogs(),
            apiService.getInventoryTransactions(),
            apiService.getPurchaseOrders()
          ]);

          if (prods.status === 'fulfilled' && prods.value?.length) {
            setProducts(prods.value);
          }

          if (srvs.status === 'fulfilled' && srvs.value?.length) {
            setServices(prev => {
              const normalized = srvs.value.map(s => ({
                ...s,
                durationMinutes: s.durationMinutes || s.duration || 60,
                duration: s.durationMinutes || s.duration || 60,
                price: Number(s.price || 0)
              }));
              const bIds = new Set(normalized.map(s => s.id));
              const merged = [...normalized, ...prev.filter(p => !bIds.has(p.id))];
              localStorage.setItem('lumina_services', JSON.stringify(merged));
              return merged;
            });
          }

          if (emps.status === 'fulfilled' && emps.value?.length) {
            setEmployees(prev => {
              const normalized = emps.value.map(e => ({
                ...e,
                skills: Array.isArray(e.skills) && e.skills.length ? e.skills : (Array.isArray(e.specialties) ? e.specialties : ['Hair Styling']),
                specialties: Array.isArray(e.specialties) && e.specialties.length ? e.specialties : (Array.isArray(e.skills) ? e.skills : ['Hair Styling']),
                salary: Number(e.salary || e.baseSalary || 4000),
                baseSalary: Number(e.baseSalary || e.salary || 4000),
                joiningDate: e.joiningDate || e.joinDate || '2023-01-01',
                joinDate: e.joinDate || e.joiningDate || '2023-01-01'
              }));
              const bIds = new Set(normalized.map(e => e.id));
              const merged = [...normalized, ...prev.filter(p => !bIds.has(p.id))];
              localStorage.setItem('lumina_employees', JSON.stringify(merged));
              return merged;
            });
          }

          if (custs.status === 'fulfilled' && custs.value?.length) {
            setCustomers(prev => {
              const bIds = new Set(custs.value.map(c => c.id));
              const merged = [...custs.value, ...prev.filter(p => !bIds.has(p.id))];
              localStorage.setItem('lumina_customers', JSON.stringify(merged));
              return merged;
            });
          }

          if (appts.status === 'fulfilled' && appts.value?.length) {
            setAppointments(prev => {
              const normalized = appts.value.map(a => ({
                ...a,
                price: Number(a.price ?? a.totalPrice ?? 0),
                totalPrice: Number(a.totalPrice ?? a.price ?? 0),
                serviceNames: Array.isArray(a.serviceNames) && a.serviceNames.length ? a.serviceNames : (a.serviceName ? [a.serviceName] : ['Salon Service']),
                station: a.station || a.chairNumber || 'Chair #1',
                chairNumber: a.chairNumber || a.station || 'Chair #1',
                durationMinutes: a.durationMinutes || a.duration || 30,
                code: a.code || `APT-${a.id?.slice(-4).toUpperCase()}`
              }));
              const bIds = new Set(normalized.map(a => a.id));
              const merged = [...normalized, ...prev.filter(p => !bIds.has(p.id))];
              localStorage.setItem('lumina_appointments', JSON.stringify(merged));
              return merged;
            });
          }

          if (invs.status === 'fulfilled' && invs.value?.length) setInvoices(invs.value);
          if (atts.status === 'fulfilled' && atts.value?.length) setAttendance(atts.value);
          if (brs.status === 'fulfilled' && brs.value?.length) setBranches(brs.value);
          if (hms.status === 'fulfilled' && hms.value?.length) setHomeServices(hms.value);
          if (revs.status === 'fulfilled' && revs.value?.length) setReviews(revs.value);
          if (offrs.status === 'fulfilled' && offrs.value?.length) setOffers(offrs.value.map(normalizeOffer));
          if (notifs.status === 'fulfilled' && notifs.value?.length) setNotifications(notifs.value);
          if (logs.status === 'fulfilled' && logs.value?.length) setAuditLogs(logs.value);
          if (prods.status === 'fulfilled' && Array.isArray(prods.value)) setProducts(prods.value);

          const invLogsRes = arguments?.[0] || null; // promise settlement
          const invLogs = await apiService.getInventoryTransactions().catch(() => null);
          if (invLogs && Array.isArray(invLogs) && invLogs.length) {
            setInventoryLogs(invLogs);
          }
          const poList = await apiService.getPurchaseOrders().catch(() => null);
          if (poList && Array.isArray(poList) && poList.length) {
            setPurchaseOrders(poList);
          }
          const distList = await apiService.getDistributors().catch(() => null);
          if (distList && Array.isArray(distList) && distList.length) {
            setDistributors(distList);
            localStorage.setItem('lumina_distributors', JSON.stringify(distList));
          }

          // Fetch Product Partnership data from backend
          const [partnersList, reqsList, pProdsList, campsList, commsList, paysList, overviewRes] = await Promise.allSettled([
            apiService.getProductPartners(),
            apiService.getPartnershipRequests(),
            apiService.getPartnerProducts(),
            apiService.getPartnershipCampaigns(),
            apiService.getPartnershipCommissions(),
            apiService.getPartnershipPayments(),
            apiService.getPartnershipReportsOverview()
          ]);

          if (partnersList.status === 'fulfilled' && Array.isArray(partnersList.value) && partnersList.value.length) {
            setProductPartners(partnersList.value);
            localStorage.setItem('lumina_product_partners', JSON.stringify(partnersList.value));
          }
          if (reqsList.status === 'fulfilled' && Array.isArray(reqsList.value) && reqsList.value.length) {
            setPartnershipRequests(reqsList.value);
            localStorage.setItem('lumina_partnership_requests', JSON.stringify(reqsList.value));
          }
          if (pProdsList.status === 'fulfilled' && Array.isArray(pProdsList.value) && pProdsList.value.length) {
            setPartnerProducts(pProdsList.value);
            localStorage.setItem('lumina_partner_products', JSON.stringify(pProdsList.value));
          }
          if (campsList.status === 'fulfilled' && Array.isArray(campsList.value) && campsList.value.length) {
            setPartnershipCampaigns(campsList.value);
            localStorage.setItem('lumina_partnership_campaigns', JSON.stringify(campsList.value));
          }
          if (commsList.status === 'fulfilled' && Array.isArray(commsList.value) && commsList.value.length) {
            setPartnershipCommissions(commsList.value);
            localStorage.setItem('lumina_partnership_commissions', JSON.stringify(commsList.value));
          }
          if (paysList.status === 'fulfilled' && Array.isArray(paysList.value) && paysList.value.length) {
            setPartnershipPayments(paysList.value);
            localStorage.setItem('lumina_partnership_payments', JSON.stringify(paysList.value));
          }
          if (overviewRes.status === 'fulfilled' && overviewRes.value) {
            setPartnershipOverview(overviewRes.value);
          }

        } else {
          setIsApiOnline(false);
        }
      } catch (err) {
        console.warn('[SALON CONTEXT] Backend offline, falling back to cached state:', err);
        setIsApiOnline(false);
      }
    };

    fetchBackendData();
  }, []);

  // Theme Syncing (Default = Light / Bright Theme, Switchable to Dark Luxury Theme)
  useEffect(() => {
    const activeTheme = settings?.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.body.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    } else {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    }
    try {
      localStorage.setItem('lumina_theme', activeTheme);
      localStorage.setItem('lumina_settings', JSON.stringify({ ...settings, theme: activeTheme }));
    } catch (e) {}
  }, [settings?.theme]);

  const toggleTheme = () => {
    setSettings(prev => {
      const nextTheme = prev?.theme === 'dark' ? 'light' : 'dark';
      logAudit('TOGGLE_THEME', 'User Preferences', `Switched theme mode to ${nextTheme.toUpperCase()}`);
      try {
        localStorage.setItem('lumina_theme', nextTheme);
      } catch (e) {}
      return { ...prev, theme: nextTheme };
    });
  };

  // Helper Audit Logger
  const logAudit = async (action, module, details) => {
    const newLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toISOString().split('T')[0],
      user: currentUser.name,
      role: currentUser.role,
      action,
      module,
      details,
      ip: '192.168.1.100'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    try {
      if (isApiOnline) {
        await apiService.logAudit({
          user_id: currentUser.id || 'usr-001',
          user_name: currentUser.name,
          role: currentUser.role,
          action,
          module,
          details,
          timestamp: newLog.timestamp
        });
      }
    } catch (e) {
      console.warn('[AUDIT LOG] Remote log sync error:', e);
    }
  };

  const addNotification = async (title, message, type = 'system', priority = 'normal') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      time: 'Just now',
      read: false,
      priority
    };
    setNotifications(prev => [newNotif, ...prev]);
    try {
      if (isApiOnline) {
        await apiService.createNotification(newNotif);
      }
    } catch (e) {
      console.warn('[NOTIF] Remote notification error:', e);
    }
  };

  const switchRole = (newRole) => {
    let mockName = 'Madame Victoria Sterling';
    let mockEmail = 'victoria@luminaluxe.com';

    if (newRole === 'Senior Stylist') {
      mockName = 'Julian Vance';
      mockEmail = 'julian@luminaluxe.com';
    } else if (newRole === 'Receptionist') {
      mockName = 'Sophia Chen';
      mockEmail = 'sophia@luminaluxe.com';
    } else if (newRole === 'Branch Manager') {
      mockName = 'Harrison Wells';
      mockEmail = 'harrison@luminaluxe.com';
    } else if (newRole === 'Customer') {
      mockName = 'Seraphina Vance (VIP)';
      mockEmail = 'seraphina.v@vancemedia.com';
    }

    const updated = { ...currentUser, role: newRole, name: mockName, email: mockEmail };
    setCurrentUser(updated);
    localStorage.setItem('lumina_user', JSON.stringify(updated));
    logAudit('AUTH_ROLE_SWITCH', 'Authentication', `Switched active role session to ${newRole}`);
  };

  // Customer Management
  const addCustomer = (customerData) => {
    const newCust = {
      ...customerData,
      id: customerData.id || `cust-${Date.now()}`,
      gender: customerData.gender || 'Female',
      vipStatus: customerData.vipStatus || 'Standard',
      visitsCount: 1,
      totalSpent: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      notes: customerData.notes || ''
    };
    setCustomers(prev => {
      const updated = [newCust, ...prev];
      localStorage.setItem('lumina_customers', JSON.stringify(updated));
      return updated;
    });
    logAudit('CREATE_CUSTOMER', 'Customer Management', `Added client: ${newCust.name}`);
    addNotification('New Client Enrolled', `${newCust.name} enrolled in client directory.`, 'loyalty');

    if (isApiOnline) {
      apiService.createCustomer(newCust).catch(e => console.warn('[CUSTOMER] API save warning:', e));
    }
    return newCust;
  };

  const updateCustomer = async (id, data) => {
    setCustomers(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...data } : c);
      localStorage.setItem('lumina_customers', JSON.stringify(updated));
      return updated;
    });
    logAudit('UPDATE_CUSTOMER', 'Customer Management', `Updated client ID ${id}`);
    try {
      if (isApiOnline) await apiService.updateCustomer(id, data);
    } catch (e) {
      console.warn('[CUSTOMER] API update warning:', e);
    }
  };

  const deleteCustomer = async (id) => {
    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('lumina_customers', JSON.stringify(updated));
      return updated;
    });
    logAudit('DELETE_CUSTOMER', 'Customer Management', `Removed client ID ${id}`);
    try {
      if (isApiOnline) await apiService.deleteCustomer(id);
    } catch (e) {
      console.warn('[CUSTOMER] API delete warning:', e);
    }
  };

  // Employee Management
  const addEmployee = (empData) => {
    const formattedSkills = Array.isArray(empData.skills)
      ? empData.skills
      : (typeof empData.skills === 'string' && empData.skills ? empData.skills.split(',').map(s => s.trim()) : (empData.specialties || ['Hair Styling']));

    const newEmp = {
      ...empData,
      id: empData.id || `emp-${Date.now()}`,
      status: empData.status || 'Active',
      joinDate: empData.joinDate || empData.joiningDate || new Date().toISOString().split('T')[0],
      joiningDate: empData.joiningDate || empData.joinDate || new Date().toISOString().split('T')[0],
      salary: Number(empData.salary || empData.baseSalary || 4000),
      baseSalary: Number(empData.baseSalary || empData.salary || 4000),
      commission: Number(empData.commission || empData.commissionRate || 18),
      commissionRate: Number(empData.commissionRate || empData.commission || 18),
      specialties: formattedSkills,
      skills: formattedSkills,
      workingHours: empData.workingHours || empData.shift || '10:00 AM - 07:00 PM',
      shift: empData.shift || empData.workingHours || '10:00 AM - 07:00 PM',
      branch: empData.branch || 'Beverly Hills Flagship',
      rating: empData.rating || 4.95,
      completedBookings: empData.completedBookings || 0
    };
    setEmployees(prev => {
      const updated = [newEmp, ...prev];
      localStorage.setItem('lumina_employees', JSON.stringify(updated));
      return updated;
    });
    logAudit('CREATE_EMPLOYEE', 'Employee Management', `Onboarded staff: ${newEmp.name}`);

    if (isApiOnline) {
      apiService.createEmployee(newEmp).catch(e => console.warn('[EMPLOYEE] API save error:', e));
    }
    return newEmp;
  };

  const updateEmployee = async (id, data) => {
    setEmployees(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...data } : e);
      localStorage.setItem('lumina_employees', JSON.stringify(updated));
      return updated;
    });
    logAudit('UPDATE_EMPLOYEE', 'Employee Management', `Updated employee ID ${id}`);
    try {
      if (isApiOnline) await apiService.updateEmployee(id, data);
    } catch (e) {
      console.warn('[EMPLOYEE] API update error:', e);
    }
  };

  const deleteEmployee = async (id) => {
    setEmployees(prev => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem('lumina_employees', JSON.stringify(updated));
      return updated;
    });
    logAudit('DELETE_EMPLOYEE', 'Employee Management', `Removed employee ID ${id}`);
    try {
      if (isApiOnline) await apiService.deleteEmployee(id);
    } catch (e) {
      console.warn('[EMPLOYEE] API delete error:', e);
    }
  };

  // Attendance Management
  const clockInOut = async (employeeId, forcedStatus = null) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const emp = employees.find(e => e.id === employeeId);

    const attRecord = {
      id: `att-${Date.now()}`,
      employeeId,
      employeeName: emp?.name || 'Staff',
      date: dateStr,
      checkIn: timeStr,
      checkOut: '--',
      status: forcedStatus || 'Present',
      workHours: 8.0
    };

    setAttendance(prev => [attRecord, ...prev]);
    logAudit('ATTENDANCE_CLOCK_IN', 'Attendance', `${emp?.name} clocked in at ${timeStr}`);

    try {
      if (isApiOnline) await apiService.createAttendance(attRecord);
    } catch (e) {
      console.warn('[ATTENDANCE] API sync warning:', e);
    }
  };

  const updateAttendanceStatus = (attId, newStatus, newNotes) => {
    setAttendance(prev => prev.map(a => a.id === attId ? { ...a, status: newStatus, notes: newNotes } : a));
    logAudit('UPDATE_ATTENDANCE', 'Attendance', `Updated attendance ${attId} status to ${newStatus}`);
  };

  const markManualAttendance = async (attData) => {
    const newRecord = { ...attData, id: attData.id || `att-${Date.now()}` };
    setAttendance(prev => [newRecord, ...prev]);
    logAudit('MANUAL_ATTENDANCE', 'Attendance', `Logged attendance for ${attData.employeeName}`);
    try {
      if (isApiOnline) await apiService.createAttendance(newRecord);
    } catch (e) {
      console.warn('[ATTENDANCE] Manual entry API warning:', e);
    }
  };

  const addLeaveRequest = (req) => {
    const newReq = { ...req, id: `leave-${Date.now()}`, status: 'Pending' };
    setLeaveRequests(prev => [newReq, ...prev]);
    logAudit('LEAVE_REQUEST', 'Attendance', `Leave requested by ${req.employeeName}`);
  };

  const updateLeaveStatus = (id, status) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    logAudit('LEAVE_STATUS_UPDATE', 'Attendance', `Leave request ${id} set to ${status}`);
  };

  // Services Management
  const addServiceCategory = (catName) => {
    if (!catName || !catName.trim()) return;
    const clean = catName.trim();
    if (!serviceCategories.includes(clean)) {
      setServiceCategories(prev => [...prev, clean]);
      logAudit('CREATE_CATEGORY', 'Service Catalog', `Added category: ${clean}`);
    }
  };

  const updateServiceCategory = (oldName, newName) => {
    if (!newName || !newName.trim()) return;
    const cleanNew = newName.trim();
    setServiceCategories(prev => prev.map(c => c === oldName ? cleanNew : c));
    setServices(prev => {
      const updated = prev.map(s => s.category === oldName ? { ...s, category: cleanNew } : s);
      localStorage.setItem('lumina_services', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteServiceCategory = (catName) => {
    setServiceCategories(prev => prev.filter(c => c !== catName));
  };

  const addServiceType = (typeName) => {
    if (!typeName || !typeName.trim()) return;
    const clean = typeName.trim();
    if (!serviceTypes.includes(clean)) {
      setServiceTypes(prev => [...prev, clean]);
    }
  };

  const updateServiceType = (oldName, newName) => {
    if (!newName || !newName.trim()) return;
    const cleanNew = newName.trim();
    setServiceTypes(prev => prev.map(t => t === oldName ? cleanNew : t));
  };

  const deleteServiceType = (typeName) => {
    setServiceTypes(prev => prev.filter(t => t !== typeName));
  };

  const addService = (srv) => {
    const newSrv = {
      ...srv,
      id: srv.id || `srv-${Date.now()}`,
      duration: Number(srv.durationMinutes || srv.duration || 45),
      durationMinutes: Number(srv.durationMinutes || srv.duration || 45),
      price: Number(srv.price || 0),
      homeServiceEligible: Boolean(srv.homeServiceEligible || (srv.serviceType && srv.serviceType.toLowerCase().includes('home'))),
      serviceType: srv.serviceType || 'In-Salon Suite Only'
    };
    setServices(prev => {
      const updated = [newSrv, ...prev];
      localStorage.setItem('lumina_services', JSON.stringify(updated));
      return updated;
    });
    logAudit('CREATE_SERVICE', 'Service Catalog', `Added service: ${newSrv.name}`);

    if (isApiOnline) {
      apiService.createService(newSrv).catch(e => console.warn('[SERVICE] API save warning:', e));
    }
    return newSrv;
  };

  const updateService = async (id, data) => {
    setServices(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...data } : s);
      localStorage.setItem('lumina_services', JSON.stringify(updated));
      return updated;
    });
    logAudit('UPDATE_SERVICE', 'Service Catalog', `Updated service ID ${id}`);
    try {
      if (isApiOnline) await apiService.updateService(id, data);
    } catch (e) {
      console.warn('[SERVICE] API update warning:', e);
    }
  };

  const deleteService = async (id) => {
    setServices(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('lumina_services', JSON.stringify(updated));
      return updated;
    });
    logAudit('DELETE_SERVICE', 'Service Catalog', `Deleted service ID ${id}`);
    try {
      if (isApiOnline) await apiService.deleteService(id);
    } catch (e) {
      console.warn('[SERVICE] API delete warning:', e);
    }
  };

  // Branches Management
  const addBranch = async (branchData) => {
    const bName = typeof branchData === 'string' ? branchData : branchData?.name;
    if (!bName) return;
    const newBranch = typeof branchData === 'object'
      ? { ...branchData, id: branchData.id || `br-${Date.now()}` }
      : { id: `br-${Date.now()}`, name: bName, code: bName.substring(0, 3).toUpperCase(), address: 'Beverly Hills', city: 'Beverly Hills' };

    setBranches(prev => [...prev, newBranch]);
    logAudit('CREATE_BRANCH', 'Salon Network', `Added branch: ${bName}`);
    try {
      if (isApiOnline) await apiService.createBranch(newBranch);
    } catch (e) {
      console.warn('[BRANCH] API save warning:', e);
    }
    return newBranch;
  };

  const updateBranch = (id, data) => {
    setBranches(prev => prev.map(b => b.id === id || b.name === id ? { ...b, ...(typeof data === 'string' ? { name: data } : data) } : b));
  };

  const deleteBranch = (id) => {
    setBranches(prev => prev.filter(b => b.id !== id && b.name !== id));
  };

  // Appointments Management
  const addAppointment = (aptData) => {
    const srvNames = Array.isArray(aptData.serviceNames) && aptData.serviceNames.length
      ? aptData.serviceNames
      : (aptData.serviceName ? [aptData.serviceName] : ['Salon Service']);

    const newApt = {
      ...aptData,
      id: aptData.id || `apt-${Date.now()}`,
      code: aptData.code || `APT-${String(Date.now()).slice(-4)}`,
      status: aptData.status || 'Confirmed',
      price: Number(aptData.price || aptData.totalPrice || 0),
      totalPrice: Number(aptData.price || aptData.totalPrice || 0),
      serviceNames: srvNames,
      serviceName: srvNames.join(', '),
      station: aptData.station || aptData.chairNumber || 'Chair #1',
      chairNumber: aptData.chairNumber || aptData.station || 'Chair #1',
      durationMinutes: Number(aptData.durationMinutes || aptData.duration || 30),
      duration: Number(aptData.durationMinutes || aptData.duration || 30),
      branch: aptData.branch || 'Beverly Hills Flagship',
      type: aptData.type || (String(aptData.station || '').includes('Home') ? 'Home Service' : 'In-Salon'),
      paymentStatus: aptData.paymentStatus || 'Pending'
    };
    setAppointments(prev => {
      const updated = [newApt, ...prev];
      localStorage.setItem('lumina_appointments', JSON.stringify(updated));
      return updated;
    });
    logAudit('CREATE_APPOINTMENT', 'Appointment Scheduler', `Booked appointment for ${newApt.customerName}`);

    if (isApiOnline) {
      apiService.createAppointment(newApt).catch(e => console.warn('[APPOINTMENT] Backend booking conflict or API warning:', e));
    }
    return newApt;
  };

  const updateAppointmentStatus = async (id, status) => {
    setAppointments(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, status } : a);
      localStorage.setItem('lumina_appointments', JSON.stringify(updated));
      return updated;
    });
    logAudit('UPDATE_APPOINTMENT', 'Appointment Scheduler', `Appointment ${id} set to ${status}`);
    try {
      if (isApiOnline) await apiService.updateAppointment(id, { status });
    } catch (e) {
      console.warn('[APPOINTMENT] Status update warning:', e);
    }
  };

  const updateAppointment = async (id, updatedData) => {
    setAppointments(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updatedData } : a);
      localStorage.setItem('lumina_appointments', JSON.stringify(updated));
      return updated;
    });
    logAudit('UPDATE_APPOINTMENT', 'Appointment Scheduler', `Updated appointment details for ${id}`);
    try {
      if (isApiOnline) await apiService.updateAppointment(id, updatedData);
    } catch (e) {
      console.warn('[APPOINTMENT] Update error/warning:', e);
    }
  };

  const cancelAppointment = async (id) => {
    return updateAppointmentStatus(id, 'Cancelled');
  };

  const rescheduleAppointment = async (id, newDate, newTime, newStylistId = null, newStylistName = null) => {
    setAppointments(prev => {
      const updated = prev.map(a => a.id === id ? {
        ...a,
        date: newDate,
        time: newTime,
        stylistId: newStylistId || a.stylistId,
        stylistName: newStylistName || a.stylistName,
        status: 'Rescheduled'
      } : a);
      localStorage.setItem('lumina_appointments', JSON.stringify(updated));
      return updated;
    });

    logAudit('RESCHEDULE_APPOINTMENT', 'Appointment Scheduler', `Rescheduled appointment ${id} to ${newDate} ${newTime}`);
    try {
      if (isApiOnline) await apiService.updateAppointment(id, { date: newDate, time: newTime, status: 'Rescheduled' });
    } catch (e) {
      console.warn('[APPOINTMENT] Reschedule warning:', e);
    }
  };

  const reassignStylist = async (id, stylistId, stylistName) => {
    setAppointments(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, stylistId, stylistName } : a);
      localStorage.setItem('lumina_appointments', JSON.stringify(updated));
      return updated;
    });
    try {
      if (isApiOnline) await apiService.updateAppointment(id, { stylist_id: stylistId, stylistName });
    } catch (e) {
      console.warn('[APPOINTMENT] Reassign warning:', e);
    }
  };

  const sendAppointmentReminder = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, reminderSent: true } : a));
    logAudit('SEND_REMINDER', 'Appointment Reminders', `Queued notification reminder for appointment ${id}`);
    addNotification('Reminder Queued', `Appointment reminder successfully queued for dispatch.`, 'appointment');
  };

  // Home Service Management
  const updateHomeServiceStatus = (id, status) => {
    setHomeServices(prev => prev.map(h => h.id === id ? { ...h, status } : h));
  };
  const updateHomeService = (id, data) => {
    setHomeServices(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));
  };
  const cancelHomeService = (id) => {
    setHomeServices(prev => prev.map(h => h.id === id ? { ...h, status: 'Cancelled' } : h));
  };

  // Billing and POS
  const createInvoice = async (invoiceData) => {
    const year = new Date().getFullYear();
    const invNo = invoiceData.invoiceNumber || `INV-${year}-${String(invoices.length + 1).padStart(4, '0')}`;
    const newInv = {
      ...invoiceData,
      id: invoiceData.id || `inv-${Date.now()}`,
      invoiceNumber: invNo,
      date: invoiceData.date || new Date().toISOString().split('T')[0],
      status: invoiceData.status || 'Paid'
    };

    if (isApiOnline) {
      const savedInv = await apiService.createInvoice(newInv);
      setInvoices(prev => [savedInv || newInv, ...prev]);
      // Refresh products and inventory logs from backend
      try {
        const [latestProds, latestLogs, latestOffers] = await Promise.all([
          apiService.getProducts(),
          apiService.getInventoryTransactions(),
          apiService.getOffers()
        ]);
        if (latestProds?.length) setProducts(latestProds);
        if (latestLogs?.length) setInventoryLogs(latestLogs);
        if (latestOffers?.length) setOffers(latestOffers.map(normalizeOffer));
      } catch (err) {
        console.warn('[INVOICE] Refresh error:', err);
      }
      logAudit('CHECKOUT_BILL', 'Billing & POS', `Issued ${newInv.invoiceNumber} for ${newInv.customerName}`);
      return savedInv || newInv;
    } else {
      setInvoices(prev => [newInv, ...prev]);
      if (newInv.items) {
        newInv.items.forEach(item => {
          if (item.type === 'Product' || item.type === 'product') {
            setProducts(prev => prev.map(p => p.id === item.id || p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - (item.qty || 1)) } : p));
          }
        });
      }
      logAudit('CHECKOUT_BILL', 'Billing & POS', `Issued ${newInv.invoiceNumber} for ${newInv.customerName}`);
      return newInv;
    }
  };

  // Products & Inventory
  const addProduct = async (prod) => {
    const newProd = {
      ...prod,
      id: prod.id || `prod-${Date.now()}`,
      stock: Number(prod.stock || prod.opening_stock || prod.quantity || 0),
      quantity: Number(prod.stock || prod.opening_stock || prod.quantity || 0),
      minimumStock: Number(prod.minimumStock || prod.minStockAlert || 5),
      minStockAlert: Number(prod.minStockAlert || prod.minimumStock || 5),
      purchasePrice: Number(prod.purchasePrice || 0),
      costPrice: Number(prod.costPrice || prod.purchasePrice || 0),
      sellingPrice: Number(prod.sellingPrice || 0),
      retailPrice: Number(prod.retailPrice || prod.sellingPrice || 0)
    };

    let createdProduct = newProd;
    if (isApiOnline) {
      try {
        createdProduct = await apiService.createProduct(newProd);
        const [latestProds, latestLogs] = await Promise.all([
          apiService.getProducts(),
          apiService.getInventoryTransactions()
        ]);
        if (latestProds?.length) setProducts(latestProds);
        else setProducts(prev => [createdProduct, ...prev]);
        if (latestLogs?.length) setInventoryLogs(latestLogs);
      } catch (e) {
        console.warn('[PRODUCT] API save error:', e);
        setProducts(prev => [newProd, ...prev]);
      }
    } else {
      setProducts(prev => [newProd, ...prev]);
      if (newProd.stock > 0) {
        setInventoryLogs(prev => [
          {
            id: `log-${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            productId: newProd.id,
            productName: newProd.name,
            type: 'OPENING STOCK',
            quantity: newProd.stock,
            loggedBy: currentUser.name,
            reference: 'Initial Stock Setup'
          },
          ...prev
        ]);
      }
    }

    logAudit('CREATE_PRODUCT', 'Product Management', `Added product: ${newProd.name}`);
    return createdProduct;
  };

  const adjustStock = async (adjustmentData) => {
    if (isApiOnline) {
      try {
        const res = await apiService.adjustStock(adjustmentData);
        const [latestProds, latestLogs] = await Promise.all([
          apiService.getProducts(),
          apiService.getInventoryTransactions()
        ]);
        if (latestProds?.length) setProducts(latestProds);
        if (latestLogs?.length) setInventoryLogs(latestLogs);
        return res;
      } catch (e) {
        console.error('[STOCK ADJUSTMENT] API error:', e);
        throw e;
      }
    } else {
      const prod = products.find(p => p.id === adjustmentData.product_id);
      if (!prod) throw new Error('Product not found');
      const qty = Number(adjustmentData.quantity);
      const isOut = adjustmentData.adjustment_type === 'ADJUSTMENT_OUT';
      if (isOut && (prod.stock || 0) < qty) {
        throw new Error(`Insufficient stock. Available: ${prod.stock}, Requested: ${qty}`);
      }
      const newStock = isOut ? (prod.stock - qty) : (prod.stock + qty);
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, stock: newStock } : p));
      setInventoryLogs(prev => [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          productId: prod.id,
          productName: prod.name,
          type: 'STOCK ADJUSTMENT',
          quantity: isOut ? -qty : qty,
          loggedBy: currentUser.name,
          reference: adjustmentData.reason || 'Physical count'
        },
        ...prev
      ]);
    }
  };

  const updateProduct = async (id, data) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    logAudit('UPDATE_PRODUCT', 'Product Management', `Updated product ID ${id}`);
    try {
      if (isApiOnline) await apiService.updateProduct(id, data);
    } catch (e) {
      console.warn('[PRODUCT] API update error:', e);
    }
  };

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    logAudit('DELETE_PRODUCT', 'Product Management', `Deleted product ID ${id}`);
    try {
      if (isApiOnline) await apiService.deleteProduct(id);
    } catch (e) {
      console.warn('[PRODUCT] API delete error:', e);
    }
  };

  const quickRestock = async (productId, amount = 10) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    
    // Use Purchase Order workflow or stock adjustment
    try {
      if (isApiOnline) {
        // Create PO and receive it or adjust stock
        const poRes = await apiService.createPurchaseOrder({
          supplier: target.supplier || "Authorized Distributor",
          expectedDelivery: new Date().toISOString().split('T')[0],
          itemsCount: amount,
          totalCost: (target.purchasePrice || target.costPrice || 20) * amount,
          productId: target.id,
          productName: target.name
        });
        if (poRes?.id) {
          await apiService.receivePurchaseOrder(poRes.id);
        }
        const [latestProds, latestLogs, latestPOs] = await Promise.all([
          apiService.getProducts(),
          apiService.getInventoryTransactions(),
          apiService.getPurchaseOrders()
        ]);
        if (latestProds?.length) setProducts(latestProds);
        if (latestLogs?.length) setInventoryLogs(latestLogs);
        if (latestPOs?.length) setPurchaseOrders(latestPOs);
      } else {
        const updatedStock = (target.stock || 0) + amount;
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: updatedStock } : p));
        setInventoryLogs(prev => [
          {
            id: `log-${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            productId: target.id,
            productName: target.name,
            type: 'RESTOCK IN',
            quantity: amount,
            loggedBy: currentUser.name,
            reference: 'Quick Restock'
          },
          ...prev
        ]);
      }
      logAudit('RESTOCK_PRODUCT', 'Inventory', `Restocked +${amount} for ${target.name}`);
    } catch (e) {
      console.warn('[RESTOCK] Error:', e);
    }
  };

  const createPurchaseOrder = async (poData) => {
    const year = new Date().getFullYear();
    const poCode = poData.code || `PO-${year}-${String(purchaseOrders.length + 95).padStart(3, '0')}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const newPo = {
      ...poData,
      id: poData.id || `po-${Date.now()}`,
      code: poCode,
      orderDate: poData.orderDate || todayStr,
      status: 'ORDERED' // Creating PO must NOT increase stock
    };

    if (isApiOnline) {
      try {
        const savedPo = await apiService.createPurchaseOrder(newPo);
        setPurchaseOrders(prev => [savedPo || newPo, ...prev]);
        return savedPo || newPo;
      } catch (e) {
        console.warn('[PO] Backend save error:', e);
        setPurchaseOrders(prev => [newPo, ...prev]);
        return newPo;
      }
    } else {
      setPurchaseOrders(prev => [newPo, ...prev]);
      return newPo;
    }
  };

  const receivePurchaseOrder = async (poId) => {
    if (isApiOnline) {
      try {
        const res = await apiService.receivePurchaseOrder(poId);
        const [latestProds, latestLogs, latestPOs] = await Promise.all([
          apiService.getProducts(),
          apiService.getInventoryTransactions(),
          apiService.getPurchaseOrders()
        ]);
        if (latestProds?.length) setProducts(latestProds);
        if (latestLogs?.length) setInventoryLogs(latestLogs);
        if (latestPOs?.length) setPurchaseOrders(latestPOs);
        return res;
      } catch (e) {
        console.error('[PO RECEIVE] API error:', e);
        throw e;
      }
    } else {
      const po = purchaseOrders.find(p => p.id === poId);
      if (!po) return;
      setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'RECEIVED' } : p));
      const targetProd = products.find(p => p.id === po.productId || (po.supplier && p.supplier?.includes(po.supplier.split(' ')[0]))) || products[0];
      if (targetProd) {
        const updatedStock = (targetProd.stock || 0) + Number(po.itemsCount || 10);
        setProducts(prev => prev.map(p => p.id === targetProd.id ? { ...p, stock: updatedStock } : p));
        setInventoryLogs(prev => [
          {
            id: `log-${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            productId: targetProd.id,
            productName: targetProd.name,
            type: 'RESTOCK IN',
            quantity: Number(po.itemsCount || 10),
            loggedBy: currentUser.name,
            reference: po.code
          },
          ...prev
        ]);
      }
    }
  };

  // Distributor / Authorized Supplier Management
  const addDistributor = async (distData) => {
    const newDist = {
      id: distData.id || `dist-${Date.now()}`,
      name: distData.name.trim(),
      contactPerson: distData.contactPerson || '',
      phone: distData.phone || '',
      email: distData.email || '',
      address: distData.address || '',
      leadTimeDays: Number(distData.leadTimeDays || 5),
      category: distData.category || 'Hair & Beauty',
      status: distData.status || 'Active',
      notes: distData.notes || '',
      createdAt: new Date().toISOString()
    };

    let serverDist = null;
    if (isApiOnline) {
      try {
        serverDist = await apiService.createDistributor(newDist);
      } catch (err) {
        console.warn('[SALON CONTEXT] Failed to save distributor to backend:', err);
      }
    }

    const created = serverDist || newDist;
    setDistributors(prev => {
      const updated = [...prev, created];
      localStorage.setItem('lumina_distributors', JSON.stringify(updated));
      return updated;
    });

    logAudit('CREATE_DISTRIBUTOR', 'Suppliers', `Added distributor '${created.name}'`);
    return created;
  };

  const updateDistributor = async (id, distData) => {
    let serverDist = null;
    if (isApiOnline) {
      try {
        serverDist = await apiService.updateDistributor(id, distData);
      } catch (err) {
        console.warn('[SALON CONTEXT] Failed to update distributor on backend:', err);
      }
    }

    setDistributors(prev => {
      const updated = prev.map(d => (d.id === id || d.name === id) ? { ...d, ...distData, ...(serverDist || {}) } : d);
      localStorage.setItem('lumina_distributors', JSON.stringify(updated));
      return updated;
    });

    logAudit('UPDATE_DISTRIBUTOR', 'Suppliers', `Updated distributor '${distData.name || id}'`);
    return serverDist || distData;
  };

  const deleteDistributor = async (id) => {
    const target = distributors.find(d => d.id === id || d.name === id);
    const targetId = target ? target.id : id;
    const targetName = target ? target.name : id;

    if (isApiOnline) {
      try {
        await apiService.deleteDistributor(targetId);
      } catch (err) {
        console.warn('[SALON CONTEXT] Failed to delete distributor on backend:', err);
      }
    }

    setDistributors(prev => {
      const updated = prev.filter(d => d.id !== targetId && d.name !== targetName);
      localStorage.setItem('lumina_distributors', JSON.stringify(updated));
      return updated;
    });

    logAudit('DELETE_DISTRIBUTOR', 'Suppliers', `Deleted distributor '${targetName}'`);
  };

  // Reviews and Offers
  const addReview = async (rev) => {
    const newRev = { ...rev, id: `rev-${Date.now()}`, date: new Date().toISOString().split('T')[0] };
    setReviews(prev => [newRev, ...prev]);
    try {
      if (isApiOnline) await apiService.createReview(newRev);
    } catch (e) {
      console.warn('[REVIEW] API save error:', e);
    }
  };

  const addComplaint = (cmp) => {
    const newCmp = { ...cmp, id: `cmp-${Date.now()}`, date: new Date().toISOString().split('T')[0], status: 'Open' };
    setComplaints(prev => [newCmp, ...prev]);
  };

  const resolveComplaint = (id, resolutionNotes) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved', resolutionNotes } : c));
  };

  const refreshOffers = async () => {
    try {
      const data = await apiService.getOffers();
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeOffer);
        setOffers(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('[OFFERS] Refresh error:', err);
    }
    return offers;
  };

  const addOffer = async (offerData) => {
    try {
      const res = await apiService.createOffer(offerData);
      const normalized = normalizeOffer(res);
      setOffers(prev => [normalized, ...prev.filter(o => o.id !== normalized.id)]);
      logAudit('CREATE_COUPON', 'Marketing', `Created coupon: ${normalized.code}`);
      return normalized;
    } catch (err) {
      console.error('[OFFERS] Create error:', err);
      throw err;
    }
  };

  const updateOffer = async (id, data) => {
    try {
      const res = await apiService.updateOffer(id, data);
      const normalized = normalizeOffer(res);
      setOffers(prev => prev.map(o => o.id === id ? normalized : o));
      logAudit('UPDATE_COUPON', 'Marketing', `Updated coupon ID: ${id}`);
      return normalized;
    } catch (err) {
      console.error('[OFFERS] Update error:', err);
      throw err;
    }
  };

  const reactivateOffer = async (id, reactivateData) => {
    try {
      const res = await apiService.reactivateOffer(id, reactivateData);
      const normalized = normalizeOffer(res);
      setOffers(prev => prev.map(o => o.id === id ? normalized : o));
      logAudit('REACTIVATE_COUPON', 'Marketing', `Reactivated coupon: ${normalized.code} until ${reactivateData.valid_until}`);
      return normalized;
    } catch (err) {
      console.error('[OFFERS] Reactivate error:', err);
      throw err;
    }
  };

  const pauseOffer = async (id) => {
    try {
      const res = await apiService.pauseOffer(id);
      const normalized = normalizeOffer(res);
      setOffers(prev => prev.map(o => o.id === id ? normalized : o));
      logAudit('PAUSE_COUPON', 'Marketing', `Paused coupon: ${normalized.code}`);
      return normalized;
    } catch (err) {
      console.error('[OFFERS] Pause error:', err);
      throw err;
    }
  };

  const activateOffer = async (id) => {
    try {
      const res = await apiService.activateOffer(id);
      const normalized = normalizeOffer(res);
      setOffers(prev => prev.map(o => o.id === id ? normalized : o));
      logAudit('ACTIVATE_COUPON', 'Marketing', `Activated coupon: ${normalized.code}`);
      return normalized;
    } catch (err) {
      console.error('[OFFERS] Activate error:', err);
      throw err;
    }
  };

  const deleteOffer = async (id) => {
    try {
      await apiService.deleteOffer(id);
      setOffers(prev => prev.filter(o => o.id !== id));
      logAudit('DELETE_COUPON', 'Marketing', `Deleted or archived coupon ID: ${id}`);
      return true;
    } catch (err) {
      console.error('[OFFERS] Delete error:', err);
      throw err;
    }
  };

  const toggleOfferStatus = async (id) => {
    const target = offers.find(o => o.id === id);
    if (!target) return;
    if (target.active || target.status === 'ACTIVE') {
      return await pauseOffer(id);
    } else {
      return await activateOffer(id);
    }
  };

  const validateCoupon = async (reqData) => {
    return await apiService.validateCoupon(reqData);
  };

  // Safe Selective Storage Reset (P1.14 fix)
  const resetDemoData = () => {
    const keys = [
      'lumina_user', 'lumina_settings', 'lumina_customers', 'lumina_employees',
      'lumina_attendance', 'lumina_leave_requests', 'lumina_services', 'lumina_branches',
      'lumina_appointments', 'lumina_home_services', 'lumina_products', 'lumina_invoices',
      'lumina_reviews', 'lumina_offers', 'lumina_notifications', 'lumina_audit_logs',
      'lumina_payroll_records'
    ];
    keys.forEach(k => localStorage.removeItem(k));

    setCustomers(INITIAL_CUSTOMERS);
    setEmployees(INITIAL_EMPLOYEES);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setServiceCategories(INITIAL_SERVICE_CATEGORIES);
    setServiceTypes(INITIAL_SERVICE_TYPES);
    setServices(INITIAL_SERVICES);
    setAppointments(INITIAL_APPOINTMENTS);
    setHomeServices(INITIAL_HOME_SERVICES);
    setProducts(INITIAL_PRODUCTS);
    setInventoryLogs(INITIAL_INVENTORY_LOGS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setReviews(INITIAL_REVIEWS);
    setComplaints(INITIAL_COMPLAINTS);
    setOffers(INITIAL_OFFERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SETTINGS);
    setCurrentUser(INITIAL_USER);
    logAudit('FACTORY_RESET', 'System Settings', 'Reset salon data state to baseline');
  };

  // Product Partnership Operations
  const loadPartnershipData = async () => {
    try {
      const [partnersList, reqsList, pProdsList, campsList, commsList, paysList, overviewRes] = await Promise.allSettled([
        apiService.getProductPartners(),
        apiService.getPartnershipRequests(),
        apiService.getPartnerProducts(),
        apiService.getPartnershipCampaigns(),
        apiService.getPartnershipCommissions(),
        apiService.getPartnershipPayments(),
        apiService.getPartnershipReportsOverview()
      ]);
      if (partnersList.status === 'fulfilled' && Array.isArray(partnersList.value)) setProductPartners(partnersList.value);
      if (reqsList.status === 'fulfilled' && Array.isArray(reqsList.value)) setPartnershipRequests(reqsList.value);
      if (pProdsList.status === 'fulfilled' && Array.isArray(pProdsList.value)) setPartnerProducts(pProdsList.value);
      if (campsList.status === 'fulfilled' && Array.isArray(campsList.value)) setPartnershipCampaigns(campsList.value);
      if (commsList.status === 'fulfilled' && Array.isArray(commsList.value)) setPartnershipCommissions(commsList.value);
      if (paysList.status === 'fulfilled' && Array.isArray(paysList.value)) setPartnershipPayments(paysList.value);
      if (overviewRes.status === 'fulfilled' && overviewRes.value) setPartnershipOverview(overviewRes.value);
    } catch (e) {
      console.warn('Could not refresh partnership data:', e);
    }
  };

  const addProductPartner = async (partnerData) => {
    try {
      const res = await apiService.createProductPartner(partnerData);
      setProductPartners(prev => [res, ...prev]);
      logAudit('PARTNER_CREATED', 'Product Partnership', `Added brand partner: ${partnerData.brand_name}`);
      return res;
    } catch (e) {
      // Fallback
      const newP = {
        ...partnerData,
        id: partnerData.id || `ptn-${Date.now()}`,
        partner_code: partnerData.partner_code || `PTN-${String(productPartners.length + 1).padStart(3, '0')}`,
        products_count: 0,
        active_campaigns_count: 0,
        total_sales: 0,
        commission_earned: 0,
        pending_commission: 0,
        status: partnerData.status || 'Active'
      };
      setProductPartners(prev => [newP, ...prev]);
      return newP;
    }
  };

  const updateProductPartner = async (id, partnerData) => {
    try {
      const res = await apiService.updateProductPartner(id, partnerData);
      setProductPartners(prev => prev.map(p => p.id === id ? res : p));
      logAudit('PARTNER_UPDATED', 'Product Partnership', `Updated partner: ${partnerData.brand_name || id}`);
      return res;
    } catch (e) {
      setProductPartners(prev => prev.map(p => p.id === id ? { ...p, ...partnerData } : p));
    }
  };

  const deleteProductPartner = async (id) => {
    try {
      await apiService.deleteProductPartner(id);
      setProductPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'Suspended' } : p));
      logAudit('PARTNER_DEACTIVATED', 'Product Partnership', `Deactivated partner ID: ${id}`);
    } catch (e) {
      setProductPartners(prev => prev.map(p => p.id === id ? { ...p, status: 'Suspended' } : p));
    }
  };

  const addPartnershipRequest = async (reqData) => {
    try {
      const res = await apiService.createPartnershipRequest(reqData);
      setPartnershipRequests(prev => [res, ...prev]);
      logAudit('PARTNERSHIP_REQUEST', 'Product Partnership', `Submitted proposal from ${reqData.company_name}`);
      return res;
    } catch (e) {
      const newR = {
        ...reqData,
        id: reqData.id || `req-${Date.now()}`,
        request_code: `REQ-${String(partnershipRequests.length + 1).padStart(3, '0')}`,
        status: 'Pending',
        submitted_date: new Date().toISOString().split('T')[0]
      };
      setPartnershipRequests(prev => [newR, ...prev]);
      return newR;
    }
  };

  const approvePartnershipRequest = async (id) => {
    try {
      const res = await apiService.approvePartnershipRequest(id);
      setPartnershipRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
      if (res.partner) {
        setProductPartners(prev => [res.partner, ...prev.filter(p => p.id !== res.partner.id)]);
      }
      logAudit('PARTNERSHIP_APPROVED', 'Product Partnership', `Approved partnership request ID: ${id}`);
      return res;
    } catch (e) {
      setPartnershipRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    }
  };

  const rejectPartnershipRequest = async (id, notes = '') => {
    try {
      await apiService.rejectPartnershipRequest(id, notes);
      setPartnershipRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected', review_notes: notes } : r));
      logAudit('PARTNERSHIP_REJECTED', 'Product Partnership', `Rejected partnership request ID: ${id}`);
    } catch (e) {
      setPartnershipRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected', review_notes: notes } : r));
    }
  };

  const linkPartnerProduct = async (ppData) => {
    try {
      const res = await apiService.createPartnerProduct(ppData);
      setPartnerProducts(prev => [res, ...prev]);
      logAudit('PARTNER_PRODUCT_LINKED', 'Product Partnership', `Linked product ${ppData.product_name}`);
      loadPartnershipData();
      return res;
    } catch (e) {
      const newPp = {
        ...ppData,
        id: `pprd-${Date.now()}`,
        sales: 0,
        status: 'Active'
      };
      setPartnerProducts(prev => [newPp, ...prev]);
      return newPp;
    }
  };

  const unlinkPartnerProduct = async (id) => {
    try {
      await apiService.deletePartnerProduct(id);
      setPartnerProducts(prev => prev.filter(pp => pp.id !== id));
      logAudit('PARTNER_PRODUCT_UNLINKED', 'Product Partnership', `Unlinked product ID: ${id}`);
      loadPartnershipData();
    } catch (e) {
      setPartnerProducts(prev => prev.filter(pp => pp.id !== id));
    }
  };

  const createPartnershipCampaign = async (campData) => {
    try {
      const res = await apiService.createPartnershipCampaign(campData);
      setPartnershipCampaigns(prev => [res, ...prev]);
      logAudit('CAMPAIGN_CREATED', 'Product Partnership', `Created campaign: ${campData.name}`);
      loadPartnershipData();
      return res;
    } catch (e) {
      const newC = {
        ...campData,
        id: `cmp-${Date.now()}`,
        campaign_code: `CMP-${String(partnershipCampaigns.length + 1).padStart(3, '0')}`,
        status: campData.status || 'Active'
      };
      setPartnershipCampaigns(prev => [newC, ...prev]);
      return newC;
    }
  };

  const updatePartnershipCampaign = async (id, campData) => {
    try {
      const res = await apiService.updatePartnershipCampaign(id, campData);
      setPartnershipCampaigns(prev => prev.map(c => c.id === id ? res : c));
      logAudit('CAMPAIGN_UPDATED', 'Product Partnership', `Updated campaign ID: ${id}`);
      return res;
    } catch (e) {
      setPartnershipCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...campData } : c));
    }
  };

  const deletePartnershipCampaign = async (id) => {
    try {
      await apiService.deletePartnershipCampaign(id);
      setPartnershipCampaigns(prev => prev.filter(c => c.id !== id));
      logAudit('CAMPAIGN_DELETED', 'Product Partnership', `Deleted campaign ID: ${id}`);
    } catch (e) {
      setPartnershipCampaigns(prev => prev.filter(c => c.id !== id));
    }
  };

  const createPartnershipCommission = async (commData) => {
    try {
      const res = await apiService.createPartnershipCommission(commData);
      setPartnershipCommissions(prev => [res, ...prev]);
      loadPartnershipData();
      return res;
    } catch (e) {
      const newCm = {
        ...commData,
        id: `com-${Date.now()}`,
        status: 'Approved',
        payment_status: 'Pending'
      };
      setPartnershipCommissions(prev => [newCm, ...prev]);
      return newCm;
    }
  };

  const approvePartnershipCommission = async (id) => {
    try {
      await apiService.approvePartnershipCommission(id);
      setPartnershipCommissions(prev => prev.map(cm => cm.id === id ? { ...cm, status: 'Approved' } : cm));
      logAudit('COMMISSION_APPROVED', 'Product Partnership', `Approved commission ID: ${id}`);
      loadPartnershipData();
    } catch (e) {
      setPartnershipCommissions(prev => prev.map(cm => cm.id === id ? { ...cm, status: 'Approved' } : cm));
    }
  };

  const payPartnershipCommission = async (id, paymentData) => {
    try {
      const res = await apiService.payPartnershipCommission(id, paymentData);
      setPartnershipCommissions(prev => prev.map(cm => cm.id === id ? { ...cm, status: 'Paid', payment_status: 'Paid' } : cm));
      if (res.payment) {
        setPartnershipPayments(prev => [res.payment, ...prev]);
      }
      logAudit('COMMISSION_PAID', 'Product Partnership', `Paid commission ID: ${id}`);
      loadPartnershipData();
      return res;
    } catch (e) {
      setPartnershipCommissions(prev => prev.map(cm => cm.id === id ? { ...cm, status: 'Paid', payment_status: 'Paid' } : cm));
    }
  };

  const recordPartnershipPayment = async (payData) => {
    try {
      const res = await apiService.createPartnershipPayment(payData);
      setPartnershipPayments(prev => [res, ...prev]);
      logAudit('PAYMENT_RECORDED', 'Product Partnership', `Recorded payment of ₹${payData.amount}`);
      loadPartnershipData();
      return res;
    } catch (e) {
      const newPay = {
        ...payData,
        id: `pay-${Date.now()}`,
        payment_code: `PAY-${String(partnershipPayments.length + 1).padStart(4, '0')}`,
        status: 'Paid'
      };
      setPartnershipPayments(prev => [newPay, ...prev]);
      return newPay;
    }
  };

  return (
    <SalonContext.Provider
      value={{
        activeView,
        setActiveView,
        globalSearch,
        setGlobalSearch,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        isQuickBookingOpen,
        setIsQuickBookingOpen,
        quickBookingDate,
        setQuickBookingDate,
        activeReceipt,
        setActiveReceipt,
        isApiOnline,
        currentUser,
        roles,
        switchRole,
        settings,
        setSettings,
        toggleTheme,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        attendance,
        clockInOut,
        updateAttendanceStatus,
        markManualAttendance,
        leaveRequests,
        addLeaveRequest,
        updateLeaveStatus,
        serviceCategories,
        addServiceCategory,
        updateServiceCategory,
        deleteServiceCategory,
        serviceTypes,
        addServiceType,
        updateServiceType,
        deleteServiceType,
        services,
        addService,
        updateService,
        deleteService,
        branches,
        addBranch,
        updateBranch,
        deleteBranch,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        updateAppointment,
        cancelAppointment,
        rescheduleAppointment,
        reassignStylist,
        sendAppointmentReminder,
        homeServices,
        updateHomeServiceStatus,
        updateHomeService,
        cancelHomeService,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        quickRestock,
        adjustStock,
        inventoryLogs,
        purchaseOrders,
        createPurchaseOrder,
        receivePurchaseOrder,
        distributors,
        addDistributor,
        updateDistributor,
        deleteDistributor,
        invoices,
        createInvoice,
        reviews,
        addReview,
        complaints,
        addComplaint,
        resolveComplaint,
        loyaltyTiers,
        membershipPlans,
        offers,
        refreshOffers,
        addOffer,
        updateOffer,
        reactivateOffer,
        pauseOffer,
        activateOffer,
        deleteOffer,
        toggleOfferStatus,
        validateCoupon,
        notifications,
        addNotification,
        auditLogs,
        logAudit,
        resetDemoData,

        // Product Partnership State & Handlers
        productPartners,
        partnershipRequests,
        partnerProducts,
        partnershipCampaigns,
        partnershipCommissions,
        partnershipPayments,
        partnershipOverview,
        loadPartnershipData,
        addProductPartner,
        updateProductPartner,
        deleteProductPartner,
        addPartnershipRequest,
        approvePartnershipRequest,
        rejectPartnershipRequest,
        linkPartnerProduct,
        unlinkPartnerProduct,
        createPartnershipCampaign,
        updatePartnershipCampaign,
        deletePartnershipCampaign,
        createPartnershipCommission,
        approvePartnershipCommission,
        payPartnershipCommission,
        recordPartnershipPayment
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) throw new Error('useSalon must be used within a SalonProvider');
  return context;
};
