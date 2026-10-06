import React, { useState, useRef, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Search,
  PlusCircle,
  Bell,
  Sun,
  Moon,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Check,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Sliders,
  X,
  Scissors,
  Settings,
  ChevronRight
} from 'lucide-react';

export const Navbar = () => {
  const {
    globalSearch,
    setGlobalSearch,
    currentUser,
    roles,
    switchRole,
    settings,
    toggleTheme,
    notifications,
    setIsQuickBookingOpen,
    setActiveView,
    activeView,
    resetDemoData,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useSalon();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const notifRef = useRef(null);
  const settingsRef = useRef(null);

  const unreadNotifs = notifications.filter(n => !n.read);
  const isDarkMode = settings?.theme === 'dark';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetData = () => {
    if (window.confirm('Reset all salon data back to showroom default demo records?')) {
      resetDemoData();
      setShowSettingsDropdown(false);
      alert('Showroom data restored successfully!');
    }
  };

  return (
    <header className="app-navbar">
      {/* Top Navbar Row */}
      <div className="navbar-top-row">
        {/* Left Side: Mobile Menu Button + Brand / Search */}
        <div className="navbar-left">
          {/* Mobile Hamburger Menu Toggle */}
          <button
            className="mobile-menu-toggle btn btn-secondary btn-icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Brand Title (shown on mobile / tablet) */}
          <div className="mobile-brand-title" onClick={() => setActiveView('dashboard')}>
            <Scissors size={18} color="var(--gold-primary)" />
            <span className="serif-heading gold-text-gradient">Lumina Luxe</span>
          </div>

          {/* Desktop & Laptop Global Search Box */}
          <div className="search-box-wrapper laptop-search">
            <Search className="search-icon" size={17} />
            <input
              type="text"
              id="global-search-input"
              className="search-input"
              placeholder="Search clients, services, bills..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            {globalSearch && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setGlobalSearch('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Navbar Actions (Laptop & Mobile) */}
        <div className="navbar-actions">
          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            className={`btn btn-secondary btn-icon mobile-search-toggle ${isMobileSearchOpen ? 'active' : ''}`}
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            title="Search"
            aria-label="Toggle Search"
          >
            <Search size={18} />
          </button>

          {/* Role Switcher (Laptop & Desktop) */}
          <div className="role-badge-selector laptop-only" title="Switch user access role">
            <ShieldCheck size={16} color="var(--gold-primary)" />
            <span className="role-label">Role:</span>
            <select
              id="role-switcher-select"
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value)}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="btn-theme-toggle"
            className="btn btn-secondary btn-icon"
            title={isDarkMode ? 'Switch to Bright Theme' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="var(--gold-primary)" />}
          </button>

          {/* Notifications Bell Dropdown */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              id="btn-notifications-toggle"
              className="btn btn-secondary btn-icon"
              style={{ position: 'relative' }}
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowSettingsDropdown(false);
              }}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadNotifs.length > 0 && (
                <span className="notification-badge-pill">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="header-dropdown notifications-dropdown">
                <div className="header-dropdown-title">
                  <span>Notifications ({notifications.length})</span>
                  <button
                    className="dropdown-action-link"
                    onClick={() => {
                      setActiveView('notifications');
                      setShowNotifDropdown(false);
                    }}
                  >
                    View All
                  </button>
                </div>

                <div className="header-dropdown-list custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`dropdown-notif-item ${n.read ? 'read' : 'unread'}`}
                        style={{
                          borderLeft: n.priority === 'high' ? '3px solid var(--ruby-accent)' : '3px solid var(--gold-primary)'
                        }}
                      >
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-desc">{n.message}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick POS Sale Shortcut (Laptop & Desktop) */}
          <button
            id="btn-quick-pos"
            className="btn btn-secondary laptop-only"
            onClick={() => setActiveView('billing')}
            title="Open Point of Sale checkout"
          >
            <CreditCard size={16} color="var(--gold-primary)" />
            <span className="btn-label-full">POS Billing</span>
            <span className="btn-label-compact">POS</span>
          </button>

          {/* Quick Book Appointment Modal Trigger */}
          <button
            id="btn-quick-booking"
            className="btn btn-gold btn-booking-responsive"
            onClick={() => setIsQuickBookingOpen(true)}
            title="Book New Appointment"
          >
            <PlusCircle size={17} />
            <span className="btn-label-full">New Booking</span>
            <span className="btn-label-compact">Book</span>
          </button>

          {/* Header Settings & Controls Dropdown */}
          <div ref={settingsRef} style={{ position: 'relative' }}>
            <button
              id="btn-header-settings"
              className={`btn btn-secondary btn-icon ${activeView === 'settings' ? 'active-gold' : ''}`}
              title="Salon Settings & Configuration"
              aria-label="Settings"
              onClick={() => {
                setShowSettingsDropdown(!showSettingsDropdown);
                setShowNotifDropdown(false);
              }}
            >
              <Sliders size={18} />
            </button>

            {showSettingsDropdown && (
              <div className="header-dropdown settings-dropdown">
                <div className="header-dropdown-title">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sliders size={15} color="var(--gold-primary)" />
                    <span>Header Settings</span>
                  </div>
                  <button
                    className="dropdown-close-btn"
                    onClick={() => setShowSettingsDropdown(false)}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="settings-dropdown-body">
                  {/* Active Role Quick Switch (Visible on all devices, especially useful on mobile) */}
                  <div className="settings-item-group">
                    <label className="settings-label">
                      <ShieldCheck size={14} color="var(--gold-primary)" /> Active Access Role
                    </label>
                    <select
                      className="form-select settings-select"
                      value={currentUser.role}
                      onChange={(e) => switchRole(e.target.value)}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Theme Quick Switch */}
                  <div className="settings-item-row" onClick={toggleTheme} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isDarkMode ? <Moon size={16} color="var(--gold-primary)" /> : <Sun size={16} color="#f59e0b" />}
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>Interface Theme</span>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {isDarkMode ? 'Dark Mode' : 'Bright Theme'}
                    </span>
                  </div>

                  {/* Reset Demo Showroom Records */}
                  <button
                    type="button"
                    className="btn btn-secondary settings-full-btn"
                    onClick={handleResetData}
                    style={{ justifyContent: 'flex-start', gap: 8, fontSize: '0.78rem' }}
                  >
                    <RotateCcw size={14} /> Reset Showroom Demo Data
                  </button>

                  <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

                  {/* Direct Link to Full Salon Settings & Audit Page */}
                  <button
                    type="button"
                    className="btn btn-gold settings-full-btn"
                    onClick={() => {
                      setActiveView('settings');
                      setShowSettingsDropdown(false);
                    }}
                    style={{ justifyContent: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    <Settings size={14} /> Open Full Settings &amp; Audit <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Expandable Search Bar Row */}
      {(isMobileSearchOpen || globalSearch) && (
        <div className="mobile-search-row">
          <div className="search-box-wrapper mobile-search-full">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search clients, services, bills..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              autoFocus
            />
            {globalSearch ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setGlobalSearch('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setIsMobileSearchOpen(false)}
                title="Close search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

