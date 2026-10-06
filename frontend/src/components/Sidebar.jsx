import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  LayoutDashboard,
  Calendar,
  Truck,
  CreditCard,
  Users,
  UserCheck,
  Clock,
  Sparkles,
  Package,
  Boxes,
  MessageSquare,
  Award,
  Tag,
  Bell,
  BarChart3,
  Sliders,
  Scissors,
  ChevronDown,
  ChevronRight,
  DollarSign,
  X,
  Handshake,
  Building2,
  Inbox,
  Megaphone
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Main Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'appointments', label: 'Appointments', icon: Calendar, badgeKey: 'appointmentsToday' },
      { id: 'schedule', label: 'Schedule Management', icon: Truck, badgeKey: 'activeHomeServices' },
      { id: 'billing', label: 'Billing & POS', icon: CreditCard }
    ]
  },
  {
    title: 'Operations & Staff',
    items: [
      { id: 'customers', label: 'Customers', icon: Users },
      {
        id: 'employees',
        label: 'Employee Management',
        icon: UserCheck,
        subItems: [
          { id: 'employees', label: 'Staff Directory', icon: UserCheck },
          { id: 'attendance', label: 'Employee Attendance', icon: Clock },
          { id: 'payroll', label: 'Payroll & Salary Slips', icon: DollarSign }
        ]
      },
      { id: 'services', label: 'Service Management', icon: Sparkles }
    ]
  },
  {
    title: 'Product Management',
    items: [
      { id: 'products', label: 'Products', icon: Package },
      { id: 'inventory', label: 'Inventory', icon: Boxes, badgeKey: 'lowStockCount' },
      {
        id: 'product-partnership',
        label: 'Product Partnership',
        icon: Handshake,
        subItems: [
          { id: 'product-partnership-brands', label: 'Brand Collaboration', icon: Building2 },
          { id: 'product-partnership-requests', label: 'Partnership Requests', icon: Inbox },
          { id: 'product-partnership-products', label: 'Partner Products', icon: Package },
          { id: 'product-partnership-campaigns', label: 'Campaigns', icon: Megaphone },
          { id: 'product-partnership-commission', label: 'Commission', icon: DollarSign },
          { id: 'product-partnership-payments', label: 'Partnership Payments', icon: CreditCard },
          { id: 'product-partnership-reports', label: 'Partnership Reports', icon: BarChart3 }
        ]
      }
    ]
  },
  {
    title: 'Loyalty & Marketing',
    items: [
      { id: 'reviews', label: 'Reviews & Feedback', icon: MessageSquare },
      { id: 'loyalty', label: 'Loyalty & VIP Club', icon: Award },
      { id: 'offers', label: 'Offers & Coupons', icon: Tag }
    ]
  },
  {
    title: 'Analytics & Admin',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell, badgeKey: 'unreadNotifs' },
      { id: 'reports', label: 'Business Reports', icon: BarChart3 },
      { id: 'settings', label: 'Settings & Audit', icon: Sliders }
    ]
  }
];

export const Sidebar = () => {
  const {
    activeView,
    setActiveView,
    appointments,
    homeServices,
    products,
    notifications,
    currentUser,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useSalon();

  // Submenu States (Open by default)
  const [openSubmenus, setOpenSubmenus] = useState({
    employees: true,
    'product-partnership': true
  });

  const toggleSubmenu = (menuId) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  // Keep submenu open if any child view is active
  useEffect(() => {
    if (['employees', 'employees-directory', 'attendance', 'employees-attendance', 'payroll', 'salary', 'employees-payroll'].includes(activeView)) {
      setOpenSubmenus(prev => ({ ...prev, employees: true }));
    }
    if (activeView && activeView.startsWith('product-partnership')) {
      setOpenSubmenus(prev => ({ ...prev, 'product-partnership': true }));
    }
  }, [activeView]);

  const handleSelectView = (viewId) => {
    setActiveView(viewId);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  // Compute live badges
  const todayStr = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled').length;
  const activeHomeServices = homeServices.filter(h => h.status !== 'Completed').length;
  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const getBadgeValue = (key) => {
    switch (key) {
      case 'appointmentsToday': return appointmentsToday > 0 ? appointmentsToday : null;
      case 'activeHomeServices': return activeHomeServices > 0 ? activeHomeServices : null;
      case 'lowStockCount': return lowStockCount > 0 ? `${lowStockCount} low` : null;
      case 'unreadNotifs': return unreadNotifs > 0 ? unreadNotifs : null;
      default: return null;
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-icon-wrapper">
            <Scissors size={22} />
          </div>
          <div className="brand-info">
            <h1 className="serif-heading gold-text-gradient">LUMINA LUXE</h1>
            <p>Haute Coiffure & Spa</p>
          </div>
          {/* Mobile Close Button */}
          <button
            className="mobile-sidebar-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close sidebar navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav">
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx} className="nav-group">
              <div className="nav-section-title">{group.title}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const hasSub = Array.isArray(item.subItems) && item.subItems.length > 0;
                const isSubActive = hasSub && item.subItems.some(sub =>
                  activeView === sub.id ||
                  (sub.id === 'employees' && activeView === 'employees-directory') ||
                  (sub.id === 'attendance' && activeView === 'employees-attendance') ||
                  (sub.id === 'payroll' && (activeView === 'employees-payroll' || activeView === 'salary')) ||
                  (sub.id === 'product-partnership' && activeView === 'product-partnership')
                );
                const isScheduleActive = (item.id === 'schedule' || item.id === 'homeservice') && ['schedule', 'schedules', 'homeservice', 'homeservices', 'home-service'].includes(activeView);
                const isActive = activeView === item.id || isScheduleActive || isSubActive;
                const badge = item.badgeKey ? getBadgeValue(item.badgeKey) : null;
                const isOpen = hasSub && !!openSubmenus[item.id];

                if (hasSub) {
                  return (
                    <div key={item.id} className="nav-parent-wrapper">
                      <button
                        id={`nav-${item.id}`}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          if (!isOpen) {
                            toggleSubmenu(item.id);
                          }
                          handleSelectView(item.id);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Icon size={18} color={isActive ? 'var(--gold-primary)' : 'currentColor'} />
                          <span>{item.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {badge && <span className="nav-badge">{badge}</span>}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubmenu(item.id);
                            }}
                            className="submenu-toggle-btn"
                            title={isOpen ? "Collapse Submenu" : "Expand Submenu"}
                          >
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                        </div>
                      </button>

                      {/* Render Refined Submenu Items */}
                      {isOpen && (
                        <div className="nav-submenu">
                          {item.subItems.map((sub) => {
                            const SubIcon = sub.icon;
                            const isCurrentSubActive =
                              activeView === sub.id ||
                              (sub.id === 'employees' && activeView === 'employees-directory') ||
                              (sub.id === 'attendance' && activeView === 'employees-attendance') ||
                              (sub.id === 'payroll' && (activeView === 'employees-payroll' || activeView === 'salary')) ||
                              (sub.id === 'product-partnership' && activeView === 'product-partnership');

                            return (
                              <button
                                key={sub.id}
                                id={`nav-sub-${sub.id}`}
                                className={`nav-subitem ${isCurrentSubActive ? 'active' : ''}`}
                                onClick={() => {
                                  handleSelectView(sub.id);
                                }}
                              >
                                <SubIcon size={15} color={isCurrentSubActive ? 'var(--gold-primary)' : 'var(--text-muted)'} />
                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectView(item.id)}
                  >
                    <Icon size={18} color={isActive ? 'var(--gold-primary)' : 'currentColor'} />
                    <span>{item.label}</span>
                    {badge && <span className="nav-badge">{badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer Profile */}
        <div className="sidebar-footer">
          <div className="user-quick-profile">
            <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar" />
            <div className="user-details">
              <div className="user-name">
                {currentUser.name}
              </div>
              <div className="user-role">
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
