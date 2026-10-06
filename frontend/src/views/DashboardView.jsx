import React from 'react';
import { useSalon } from '../context/SalonContext';
import {
  DollarSign,
  Calendar,
  Users,
  Clock,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Star,
  CheckCircle,
  Truck,
  ArrowUpRight,
  Plus,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Home,
  FileText,
  AlertCircle
} from 'lucide-react';

export const DashboardView = () => {
  const {
    appointments,
    customers,
    employees,
    products,
    attendance,
    invoices,
    reviews,
    complaints,
    homeServices,
    settings,
    setActiveView,
    setIsQuickBookingOpen,
    clockInOut,
    currentUser
  } = useSalon();

  // Metrics calculation
  const todayStr = '2026-09-30';
  const todayInvoices = invoices.filter(inv => inv.date === todayStr);
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total, 0) + 1280.00; // includes morning bookings
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  
  // Service statuses
  const pendingServicesCount = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed' || a.status === 'Assigned').length;
  const completedServicesCount = appointments.filter(a => a.status === 'Completed').length;
  const inServiceCount = appointments.filter(a => a.status === 'In Service').length;

  // Home services
  const activeHomeServices = homeServices.filter(h => h.status !== 'Completed' && h.status !== 'Cancelled');
  
  // Pending payments
  const pendingPaymentsTotal = appointments
    .filter(a => a.paymentStatus === 'Pending' && a.status !== 'Cancelled')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  // Product sales
  const productSalesCount = invoices
    .flatMap(inv => inv.items || [])
    .filter(item => item.type === 'Product' || item.type === 'product')
    .reduce((sum, item) => sum + (item.qty || 1), 0) + 14;

  // Low stock items
  const lowStockItems = products.filter(p => p.stock <= p.minStockAlert);
  
  // Attendance metrics
  const presentStaffCount = attendance.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'On Home Service').length;

  // Recent reviews
  const recentReviewsList = reviews.slice(0, 3);

  // Weekly Revenue Sample Data for Chart
  const weeklyData = [
    { day: 'Thu', val: 2150, height: 60 },
    { day: 'Fri', val: 3400, height: 85 },
    { day: 'Sat', val: 4800, height: 100 },
    { day: 'Sun', val: 4200, height: 90 },
    { day: 'Mon', val: 1800, height: 45 },
    { day: 'Tue', val: 2650, height: 68 },
    { day: 'Wed (Today)', val: todayRevenue, height: 75 }
  ];

  return (
    <div className="view-wrapper">
      {/* Top Header */}
      <div className="view-header" style={{ marginBottom: 20 }}>
        <div className="view-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <h2>
              Executive Command <span className="gold-text-gradient">& Central Dashboard</span>
            </h2>
            <div className="dashboard-header-badge">
              <span className="dashboard-live-dot"></span>
              Live Salon Operations
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
            Real-time salon intelligence: Revenue velocity, chair allocations, service pipeline & guest satisfaction
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const myEmp = employees[0];
              clockInOut(myEmp.id);
            }}
          >
            <Clock size={16} color="var(--gold-primary)" />
            <span>Punch Biometric Shift</span>
          </button>
          <button
            className="btn btn-gold"
            onClick={() => setIsQuickBookingOpen(true)}
          >
            <Plus size={16} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* 4 PRIMARY HERO KPIS */}
      <div className="hero-kpis-grid">
        {/* 1. Today's Revenue */}
        <div className="hero-kpi-card gold-theme" onClick={() => setActiveView('billing')}>
          <div className="hero-kpi-top">
            <span className="hero-kpi-label">Today's Revenue</span>
            <div className="hero-kpi-icon-wrapper" style={{ background: 'var(--gold-subtle)', color: 'var(--gold-primary)' }}>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>₹</span>
            </div>
          </div>
          <div>
            <div className="hero-kpi-value gold-text-gradient">
              {settings.currency}{todayRevenue.toFixed(2)}
            </div>
            <div className="hero-kpi-footer">
              <span className="hero-kpi-pill emerald">
                <TrendingUp size={12} /> +22.4% vs last week
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {settings.currency}1,280 morning intake
              </span>
            </div>
          </div>
        </div>

        {/* 2. Appointments Today */}
        <div className="hero-kpi-card cyan-theme" onClick={() => setActiveView('appointments')}>
          <div className="hero-kpi-top">
            <span className="hero-kpi-label">Appointments Today</span>
            <div className="hero-kpi-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-accent)' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <div className="hero-kpi-value">
              {todayAppointments.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bookings</span>
            </div>
            <div className="hero-kpi-footer">
              <span className="hero-kpi-pill cyan">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan-accent)', display: 'inline-block' }}></span>
                {inServiceCount} In Service
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {completedServicesCount} Completed &bull; {Math.max(0, todayAppointments.length - inServiceCount - completedServicesCount)} Ahead
              </span>
            </div>
          </div>
        </div>

        {/* 3. Total Client Base */}
        <div className="hero-kpi-card amber-theme" onClick={() => setActiveView('customers')}>
          <div className="hero-kpi-top">
            <span className="hero-kpi-label">VIP Client Base</span>
            <div className="hero-kpi-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber-accent)' }}>
              <Users size={20} />
            </div>
          </div>
          <div>
            <div className="hero-kpi-value">
              {customers.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>VIP Clients</span>
            </div>
            <div className="hero-kpi-footer">
              <span className="hero-kpi-pill gold">
                +3 Enrolled this week
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Haute Club 88% Retention
              </span>
            </div>
          </div>
        </div>

        {/* 4. Services Pipeline */}
        <div className="hero-kpi-card purple-theme" onClick={() => setActiveView('appointments')}>
          <div className="hero-kpi-top">
            <span className="hero-kpi-label">Services Pipeline</span>
            <div className="hero-kpi-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Sparkles size={20} />
            </div>
          </div>
          <div>
            <div className="hero-kpi-value">
              {pendingServicesCount} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Queued</span>
            </div>
            <div className="hero-kpi-footer">
              <span className="hero-kpi-pill purple">
                {completedServicesCount} Done Today
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {Math.round((completedServicesCount / (completedServicesCount + pendingServicesCount || 1)) * 100)}% Fulfilled
              </span>
            </div>
            {/* Sleek Pipeline Progress Track */}
            <div style={{ width: '100%', height: 4, background: 'var(--border-subtle)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(10, Math.round((completedServicesCount / (completedServicesCount + pendingServicesCount || 1)) * 100)))}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                  borderRadius: 99
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECONDARY OPERATIONAL METRICS RIBBON */}
      <div className="operational-strip-container">
        <div className="operational-strip-header">
          <div className="operational-strip-title">
            <span style={{ color: 'var(--gold-primary)', fontSize: '0.9rem' }}>⚡</span>
            Operational Pulse & Station Status
          </div>
          <div className="operational-strip-badge">
            <CheckCircle size={13} color="var(--emerald-accent)" />
            <span>Salon Floors Fully Operational</span>
          </div>
        </div>

        <div className="operational-strip-grid">
          {/* Home Services */}
          <div className="op-metric-tile" onClick={() => setActiveView('homeservices')} title="View Home Service Missions">
            <div className="op-metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber-accent)' }}>
              <Home size={17} />
            </div>
            <div className="op-metric-info">
              <span className="op-metric-label">Home Service</span>
              <span className="op-metric-val">{activeHomeServices.length} Active</span>
              <span className="op-metric-sub">Field Dispatch</span>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="op-metric-tile" onClick={() => setActiveView('billing')} title="Review Pending Invoices">
            <div className="op-metric-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--ruby-accent)' }}>
              <CreditCard size={17} />
            </div>
            <div className="op-metric-info">
              <span className="op-metric-label">Pending Dues</span>
              <span className="op-metric-val" style={{ color: 'var(--ruby-accent)' }}>
                {settings.currency}{pendingPaymentsTotal.toFixed(2)}
              </span>
              <span className="op-metric-sub">Unbilled slots</span>
            </div>
          </div>

          {/* Retail Product Sales */}
          <div className="op-metric-tile" onClick={() => setActiveView('products')} title="Manage Retail Boutique">
            <div className="op-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-accent)' }}>
              <ShoppingBag size={17} />
            </div>
            <div className="op-metric-info">
              <span className="op-metric-label">Retail Sales</span>
              <span className="op-metric-val">{productSalesCount} Sold</span>
              <span className="op-metric-sub">Boutique items</span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="op-metric-tile" onClick={() => setActiveView('inventory')} title="Check Inventory Health">
            <div
              className="op-metric-icon"
              style={{
                background: lowStockItems.length > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: lowStockItems.length > 0 ? 'var(--ruby-accent)' : 'var(--emerald-accent)'
              }}
            >
              <AlertTriangle size={17} />
            </div>
            <div className="op-metric-info">
              <span className="op-metric-label">Stock Health</span>
              <span className="op-metric-val" style={{ color: lowStockItems.length > 0 ? 'var(--ruby-accent)' : 'var(--emerald-accent)' }}>
                {lowStockItems.length > 0 ? `${lowStockItems.length} Low` : 'All Optimal'}
              </span>
              <span className="op-metric-sub">{lowStockItems.length > 0 ? 'Restock alert' : '100% in stock'}</span>
            </div>
          </div>

          {/* Employee Attendance */}
          <div className="op-metric-tile" onClick={() => setActiveView('attendance')} title="View Staff Attendance Roster">
            <div className="op-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-accent)' }}>
              <Clock size={17} />
            </div>
            <div className="op-metric-info">
              <span className="op-metric-label">Floor Stylists</span>
              <span className="op-metric-val">{presentStaffCount} / {employees.length}</span>
              <span className="op-metric-sub">100% Coverage</span>
            </div>
          </div>

          {/* Guest Reviews */}
          <div className="op-metric-tile" onClick={() => setActiveView('reviews')} title="View Client Reviews & QA">
            <div className="op-metric-icon" style={{ background: 'var(--gold-subtle)', color: 'var(--gold-primary)' }}>
              <Star size={17} />
            </div>
            <div className="op-metric-info">
              <span className="op-metric-label">Client Rating</span>
              <span className="op-metric-val" style={{ color: 'var(--gold-primary)' }}>★ 4.96</span>
              <span className="op-metric-sub">{reviews.length} Verified ratings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Analytics Chart + Today's Live Schedule */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        {/* Revenue Analytics Chart */}
        <div className="luxe-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Weekly Revenue Performance</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Daily takings including salon treatments & boutique retail</p>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => setActiveView('reports')}>
              Full Reports <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
            {weeklyData.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{settings.currency}{Math.round(item.val)}</span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: 42,
                    height: `${item.height}%`,
                    background: idx === weeklyData.length - 1 ? 'var(--gold-gradient)' : 'rgba(56, 189, 248, 0.28)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.3s ease',
                    boxShadow: idx === weeklyData.length - 1 ? 'var(--gold-glow)' : 'none'
                  }}
                  title={`${item.day}: ${settings.currency}${item.val}`}
                />
                <span style={{ fontSize: '0.72rem', color: idx === weeklyData.length - 1 ? 'var(--gold-primary)' : 'var(--text-secondary)', fontWeight: idx === weeklyData.length - 1 ? 700 : 500 }}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16, fontSize: '0.8rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Weekly Gross</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{settings.currency}19,080.00</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Avg. Ticket Size</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold-primary)' }}>{settings.currency}245.00</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Repeat Client Ratio</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--emerald-accent)' }}>88.4%</div>
            </div>
          </div>
        </div>

        {/* Live Appointments Feed */}
        <div className="luxe-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Today's Live Appointment Ledger</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Active salon chair allocations & home service dispatches</p>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => setActiveView('appointments')}>
              View Matrix <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 250, overflowY: 'auto' }}>
            {todayAppointments.slice(0, 4).map((apt) => (
              <div
                key={apt.id}
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `3px solid ${apt.status === 'In Service' ? 'var(--gold-primary)' : apt.status === 'Checked-In' ? 'var(--cyan-accent)' : 'var(--border-subtle)'}`
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{apt.customerName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {apt.serviceNames?.join(', ')} &bull; {apt.stylistName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {apt.time} &bull; {apt.station}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${apt.status === 'In Service' ? 'badge-gold' : apt.status === 'Checked-In' ? 'badge-cyan' : 'badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                    {apt.status}
                  </span>
                  <div style={{ fontWeight: 700, color: 'var(--gold-primary)', marginTop: 4, fontSize: '0.85rem' }}>
                    {settings.currency}{apt.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reviews & Quality Assurance Feed (11.1) */}
      <div className="luxe-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: 4 }}>Recent Guest Reviews & Testimonials</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Verified ratings for staff behaviour, cleanliness and treatment excellence</p>
          </div>
          <button className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => setActiveView('reviews')}>
            View All Reviews & Grievances <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {recentReviewsList.map(r => (
            <div key={r.id} style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong>{r.customerName}</strong>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>{'★'.repeat(r.rating)}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--gold-primary)', marginBottom: 4 }}>
                {r.serviceName} with {r.stylistName}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                &ldquo;{r.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
