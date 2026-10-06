import React, { useState, useMemo } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Plus,
  Filter,
  CheckCircle,
  Play,
  XCircle,
  CreditCard,
  Truck,
  MapPin,
  Sparkles,
  Scissors,
  Send,
  UserCheck,
  RotateCcw,
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCheck,
  Building2,
  FileText,
  UserX,
  PhoneCall,
  Eye,
  Star,
  Award,
  Phone,
  Mail,
  ShieldAlert,
  Receipt,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AppointmentsView = () => {
  const {
    appointments,
    homeServices,
    updateAppointmentStatus,
    rescheduleAppointment,
    reassignStylist,
    sendAppointmentReminder,
    employees,
    services,
    branches,
    customers,
    settings,
    setIsQuickBookingOpen,
    setActiveView,
    globalSearch,
    createInvoice
  } = useSalon();

  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('ALL'); // 'ALL' | 'IN_SALON' | 'HOME_SERVICE'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stylistFilter, setStylistFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar' | 'timeline'
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  
  // Modals / Dialog states
  const [selectedCustomerApt, setSelectedCustomerApt] = useState(null);
  const [rescheduleModalApt, setRescheduleModalApt] = useState(null);
  const [newDateVal, setNewDateVal] = useState('');
  const [newTimeVal, setNewTimeVal] = useState('02:00 PM');
  const [newStylistVal, setNewStylistVal] = useState('');

  const [reassignModalApt, setReassignModalApt] = useState(null);
  const [targetStylistId, setTargetStylistId] = useState('');

  // Service details modal and row expansion states
  const [selectedServiceDetailsApt, setSelectedServiceDetailsApt] = useState(null);
  const [expandedServiceAptIds, setExpandedServiceAptIds] = useState(new Set());

  const toggleExpandService = (aptId) => {
    setExpandedServiceAptIds(prev => {
      const next = new Set(prev);
      if (next.has(aptId)) {
        next.delete(aptId);
      } else {
        next.add(aptId);
      }
      return next;
    });
  };

  const getServiceBreakdown = (apt) => {
    if (!apt || !apt.serviceNames) return [];
    return apt.serviceNames.map((srvName, index) => {
      const matched = services?.find(s => s.name?.toLowerCase() === srvName?.toLowerCase())
        || (apt.serviceIds && apt.serviceIds[index] ? services?.find(s => s.id === apt.serviceIds[index]) : null);
      
      const count = apt.serviceNames.length || 1;
      const calculatedDuration = matched?.durationMinutes || Math.round((apt.durationMinutes || 60) / count);
      const calculatedPrice = matched?.price || Math.round((apt.price || 0) / count);

      return {
        id: matched?.id || `srv-breakdown-${index}`,
        name: srvName,
        category: matched?.category || 'Salon Service',
        durationMinutes: calculatedDuration,
        price: calculatedPrice,
        description: matched?.description || 'Curated luxury salon treatment using bespoke organic formulations.',
        homeServiceEligible: matched?.homeServiceEligible ?? (apt.type === 'Home Service'),
        popular: matched?.popular || false,
        tax: matched?.tax || 18,
        image: matched?.image
      };
    });
  };

  const formatMins = (mins) => {
    if (!mins) return '0 mins';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${mins} mins (${h}h ${m}m)`;
    if (h > 0) return `${mins} mins (${h}h)`;
    return `${mins} mins`;
  };

  // Calendar month state
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState('2026-09');

  const ALL_STATUSES = [
    'ALL',
    'Pending',
    'Confirmed',
    'Checked-In',
    'Assigned',
    'In Service',
    'Completed',
    'Cancelled',
    'Rescheduled',
    'No Show'
  ];

  const isHomeService = (apt) => {
    if (!apt) return false;
    const typeStr = String(apt.type || apt.serviceType || '').toLowerCase();
    const stationStr = String(apt.station || '').toLowerCase();
    const notesStr = String(apt.notes || '').toLowerCase();
    return typeStr.includes('home') ||
      stationStr.includes('home') ||
      stationStr.includes('mobile') ||
      notesStr.includes('home service') ||
      Boolean(apt.homeDispatchFee || apt.travelFee);
  };

  // Merge appointments with any homeServices dispatches
  const combinedAppointments = useMemo(() => {
    const list = [...appointments];
    const existingAptIds = new Set(appointments.map(a => a.id));

    (homeServices || []).forEach(hs => {
      const targetId = hs.appointmentId || hs.id;
      if (!existingAptIds.has(targetId) && !existingAptIds.has(hs.id)) {
        list.push({
          id: targetId,
          code: `APT-${String(targetId).slice(-4).toUpperCase()}`,
          customerId: hs.customerId || 'cust-hs',
          customerName: hs.customerName,
          customerPhone: hs.phone,
          customerEmail: hs.email || 'concierge@luminaluxe.com',
          branch: 'Beverly Hills Flagship',
          stylistId: hs.assignedStaffId || 'emp-6',
          stylistName: hs.assignedStaffName || 'Nina Patel',
          serviceIds: ['srv-hs'],
          serviceNames: [hs.services || 'VIP Mobile Glamour Suite'],
          date: hs.date || '2026-10-02',
          time: hs.scheduledTime?.includes(',') ? hs.scheduledTime.split(',')[1].trim() : (hs.scheduledTime || '10:00 AM'),
          durationMinutes: 90,
          price: hs.price || hs.totalPrice || 285,
          totalPrice: hs.price || hs.totalPrice || 285,
          station: `Home Service Dispatch (${hs.address || 'Client Residence'})`,
          type: 'Home Service',
          status: hs.status || 'Confirmed',
          paymentStatus: hs.status === 'Completed' ? 'Paid' : 'Pending',
          reminderSent: false,
          notes: `Home Service: ${hs.address || ''}`,
          distanceKm: hs.distanceKm,
          travelFee: hs.travelFee,
          address: hs.address
        });
      }
    });

    return list;
  }, [appointments, homeServices]);

  const totalAllCount = combinedAppointments.length;
  const totalInSalonCount = combinedAppointments.filter(a => !isHomeService(a)).length;
  const totalHomeServiceCount = combinedAppointments.filter(a => isHomeService(a)).length;

  const categoryBaseAppointments = useMemo(() => {
    if (serviceCategoryFilter === 'IN_SALON') {
      return combinedAppointments.filter(a => !isHomeService(a));
    }
    if (serviceCategoryFilter === 'HOME_SERVICE') {
      return combinedAppointments.filter(a => isHomeService(a));
    }
    return combinedAppointments;
  }, [combinedAppointments, serviceCategoryFilter]);

  // Filtered list
  const filteredAppointments = useMemo(() => {
    return categoryBaseAppointments.filter((apt) => {
      const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
      const matchesStylist = stylistFilter === 'ALL' || apt.stylistId === stylistFilter;
      const matchesBranch = branchFilter === 'ALL' || (apt.branch || 'Beverly Hills Flagship') === branchFilter;
      const matchesDate = !selectedDateFilter || apt.date === selectedDateFilter;
      const matchesSearch =
        !globalSearch ||
        apt.customerName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        apt.code?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        apt.stylistName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
        apt.serviceNames?.some(s => s.toLowerCase().includes(globalSearch.toLowerCase()));
      return matchesStatus && matchesStylist && matchesBranch && matchesDate && matchesSearch;
    });
  }, [categoryBaseAppointments, statusFilter, stylistFilter, branchFilter, selectedDateFilter, globalSearch]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-amber"><Clock size={11} /> Pending</span>;
      case 'Confirmed':
        return <span className="badge badge-cyan"><CheckCircle size={11} /> Confirmed</span>;
      case 'Checked-In':
        return <span className="badge badge-emerald" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}><UserCheck size={11} /> Checked-In</span>;
      case 'Assigned':
        return <span className="badge badge-cyan" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}><User size={11} /> Assigned</span>;
      case 'In Service':
      case 'In Progress':
        return <span className="badge badge-gold"><Play size={11} /> In Service</span>;
      case 'Completed':
        return <span className="badge badge-emerald"><CheckCheck size={11} /> Completed</span>;
      case 'Cancelled':
        return <span className="badge badge-ruby"><XCircle size={11} /> Cancelled</span>;
      case 'Rescheduled':
        return <span className="badge badge-amber" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}><RotateCcw size={11} /> Rescheduled</span>;
      case 'No Show':
        return <span className="badge badge-ruby" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#f43f5e' }}><UserX size={11} /> No Show</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  // Action handlers
  const handleCheckIn = (id) => {
    updateAppointmentStatus(id, 'Checked-In');
  };

  const handleStartService = (id) => {
    updateAppointmentStatus(id, 'In Service');
  };

  const handleCompleteAndBill = (apt) => {
    // Generate invoice and go to billing
    createInvoice({
      customerId: apt.customerId,
      customerName: apt.customerName,
      customerPhone: apt.customerPhone,
      appointmentId: apt.id,
      items: (apt.serviceNames || []).map((srvName, idx) => ({
        id: `inv-item-${idx}`,
        name: srvName,
        type: 'Service',
        price: apt.price / (apt.serviceNames.length || 1),
        qty: 1,
        stylistId: apt.stylistId,
        stylistName: apt.stylistName
      })),
      subtotal: apt.price,
      discount: 0,
      tax: apt.price * (settings.taxRate / 100),
      total: apt.price * (1 + settings.taxRate / 100),
      paymentMethod: 'Credit Card (Stripe)'
    });
    updateAppointmentStatus(apt.id, 'Completed');
    setActiveView('billing');
  };

  const handleCancel = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      updateAppointmentStatus(id, 'Cancelled');
    }
  };

  const handleMarkNoShow = (id) => {
    if (window.confirm('Mark this customer as No Show?')) {
      updateAppointmentStatus(id, 'No Show');
    }
  };

  const openRescheduleModal = (apt) => {
    setRescheduleModalApt(apt);
    setNewDateVal(apt.date);
    setNewTimeVal(apt.time);
    setNewStylistVal(apt.stylistId);
  };

  const submitReschedule = () => {
    if (!rescheduleModalApt) return;
    const stylist = employees.find(e => e.id === newStylistVal);
    rescheduleAppointment(
      rescheduleModalApt.id,
      newDateVal,
      newTimeVal,
      stylist?.id,
      stylist?.name
    );
    setRescheduleModalApt(null);
  };

  const openReassignModal = (apt) => {
    setReassignModalApt(apt);
    setTargetStylistId(apt.stylistId);
  };

  const submitReassign = () => {
    if (!reassignModalApt) return;
    const stylist = employees.find(e => e.id === targetStylistId);
    if (stylist) {
      reassignStylist(reassignModalApt.id, stylist.id, stylist.name, stylist.station);
    }
    setReassignModalApt(null);
  };

  return (
    <div className="view-wrapper">
      {/* View Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Salon & Concierge <span className="gold-text-gradient">Appointments</span>
          </h2>
          <p>End-to-end appointment lifecycle: booking, status orchestration, calendar matrix & POS checkout</p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {/* View Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setViewMode('list')}
            >
              <List size={14} /> List Ledger
            </button>
            <button
              className={`btn ${viewMode === 'calendar' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays size={14} /> Calendar Matrix
            </button>
            <button
              className={`btn ${viewMode === 'timeline' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => setViewMode('timeline')}
            >
              <Scissors size={14} /> Chair Timeline
            </button>
          </div>

          <button className="btn btn-gold" onClick={() => setIsQuickBookingOpen(true)}>
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      {/* Primary Channel Filter Tabs: All Customer, In-Salon Service, Home Service */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            background: 'var(--bg-card)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-gold)',
            boxShadow: 'var(--shadow-sm)',
            gap: 6
          }}
        >
          {/* 1. All Customer Button */}
          <button
            type="button"
            className={`btn ${serviceCategoryFilter === 'ALL' ? 'btn-gold' : 'btn-secondary'}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: serviceCategoryFilter === 'ALL' ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none'
            }}
            onClick={() => setServiceCategoryFilter('ALL')}
          >
            <Users size={15} />
            <span>All Customer</span>
            <span
              style={{
                background: serviceCategoryFilter === 'ALL' ? 'rgba(7, 12, 24, 0.45)' : 'var(--bg-elevated)',
                color: serviceCategoryFilter === 'ALL' ? '#070c18' : 'var(--gold-primary)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {totalAllCount}
            </span>
          </button>

          {/* 2. In-Salon Service Button */}
          <button
            type="button"
            className={`btn ${serviceCategoryFilter === 'IN_SALON' ? 'btn-gold' : 'btn-secondary'}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: serviceCategoryFilter === 'IN_SALON' ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none'
            }}
            onClick={() => setServiceCategoryFilter('IN_SALON')}
          >
            <Scissors size={15} />
            <span>In-Salon Service</span>
            <span
              style={{
                background: serviceCategoryFilter === 'IN_SALON' ? 'rgba(7, 12, 24, 0.45)' : 'var(--bg-elevated)',
                color: serviceCategoryFilter === 'IN_SALON' ? '#070c18' : 'var(--gold-primary)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {totalInSalonCount}
            </span>
          </button>

          {/* 3. Home Service Button */}
          <button
            type="button"
            className={`btn ${serviceCategoryFilter === 'HOME_SERVICE' ? 'btn-gold' : 'btn-secondary'}`}
            style={{
              padding: '7px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-xs)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              boxShadow: serviceCategoryFilter === 'HOME_SERVICE' ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none'
            }}
            onClick={() => setServiceCategoryFilter('HOME_SERVICE')}
          >
            <Truck size={15} />
            <span>Home Service</span>
            <span
              style={{
                background: serviceCategoryFilter === 'HOME_SERVICE' ? 'rgba(7, 12, 24, 0.45)' : 'var(--bg-elevated)',
                color: serviceCategoryFilter === 'HOME_SERVICE' ? '#070c18' : 'var(--gold-primary)',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: '10px'
              }}
            >
              {totalHomeServiceCount}
            </span>
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Channel Filter:</span>
          <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '3px 10px' }}>
            {serviceCategoryFilter === 'ALL' && 'All Customer Bookings'}
            {serviceCategoryFilter === 'IN_SALON' && 'In-Salon Appointments Only'}
            {serviceCategoryFilter === 'HOME_SERVICE' && 'Home Service Dispatches Only'}
          </span>
        </div>
      </div>

      {/* Status Counters Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 12,
          marginBottom: 20
        }}
      >
        {[
          { label: 'Total', count: categoryBaseAppointments.length, status: 'ALL', color: 'var(--text-primary)' },
          { label: 'Pending', count: categoryBaseAppointments.filter(a => a.status === 'Pending').length, status: 'Pending', color: 'var(--amber-accent)' },
          { label: 'Confirmed', count: categoryBaseAppointments.filter(a => a.status === 'Confirmed').length, status: 'Confirmed', color: 'var(--cyan-accent)' },
          { label: 'Checked-In', count: categoryBaseAppointments.filter(a => a.status === 'Checked-In').length, status: 'Checked-In', color: 'var(--emerald-accent)' },
          { label: 'In Service', count: categoryBaseAppointments.filter(a => a.status === 'In Service' || a.status === 'In Progress').length, status: 'In Service', color: 'var(--gold-primary)' },
          { label: 'Completed', count: categoryBaseAppointments.filter(a => a.status === 'Completed').length, status: 'Completed', color: '#10b981' },
          { label: 'Rescheduled', count: categoryBaseAppointments.filter(a => a.status === 'Rescheduled').length, status: 'Rescheduled', color: '#f59e0b' },
          { label: 'No Show', count: categoryBaseAppointments.filter(a => a.status === 'No Show').length, status: 'No Show', color: 'var(--ruby-accent)' }
        ].map((item) => (
          <div
            key={item.label}
            onClick={() => setStatusFilter(item.status)}
            style={{
              background: statusFilter === item.status ? 'rgba(212, 175, 55, 0.12)' : 'var(--bg-card)',
              border: statusFilter === item.status ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color, marginTop: 2 }}>
              {item.count}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Ribbon */}
      <div
        className="luxe-card"
        style={{
          padding: '16px 20px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Filter size={15} color="var(--gold-primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: 4 }}>Status:</span>
          {ALL_STATUSES.map((st) => (
            <button
              key={st}
              className={`btn ${statusFilter === st ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '0.74rem' }}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Branch Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building2 size={14} color="var(--gold-primary)" />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="ALL">All Branches</option>
              {(branches || [
                { id: 'br-1', name: 'Beverly Hills Flagship' },
                { id: 'br-2', name: 'Manhattan Haute Studio' },
                { id: 'br-3', name: 'Miami Beach Luxe Spa' }
              ]).map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Stylist Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={14} color="var(--gold-primary)" />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
              value={stylistFilter}
              onChange={(e) => setStylistFilter(e.target.value)}
            >
              <option value="ALL">All Stylists</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarIcon size={14} color="var(--gold-primary)" />
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8rem' }}
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
            />
            {selectedDateFilter && (
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                onClick={() => setSelectedDateFilter('')}
                title="Clear date filter"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: LIST LEDGER */}
      {viewMode === 'list' && (
        <div className="luxe-table-container" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="luxe-table" style={{ minWidth: 1000, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 190, whiteSpace: 'nowrap' }}>Customer & Booking ID</th>
                <th style={{ minWidth: 185, whiteSpace: 'nowrap' }}>Phone & Email</th>
                <th style={{ minWidth: 260 }}>Service Type</th>
                <th style={{ minWidth: 110, whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: 125, whiteSpace: 'nowrap' }}>Date & Time</th>
                <th style={{ minWidth: 95, whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No appointments matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const cust = customers.find(c => c.id === apt.customerId || c.name === apt.customerName);
                  const custEmail = cust?.email || `${apt.customerName.toLowerCase().replace(/\s+/g, '.')}@luxuryclient.com`;
                  return (
                    <tr key={apt.id}>
                      {/* 1. Customer Name & ID (Without Image) */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {apt.customerName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: '0.74rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                              {apt.code}
                            </span>
                            {isHomeService(apt) ? (
                              <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '1px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <Truck size={9} /> Home Service
                              </span>
                            ) : (
                              <span className="badge badge-cyan" style={{ fontSize: '0.62rem', padding: '1px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                <Scissors size={9} /> In-Salon
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Phone & Email (Together) */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <a
                            href={`tel:${apt.customerPhone}`}
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={12} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
                            <span>{apt.customerPhone}</span>
                          </a>
                          <a
                            href={`mailto:${custEmail}`}
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              textDecoration: 'none'
                            }}
                          >
                            <Mail size={12} color="var(--cyan-accent)" style={{ flexShrink: 0 }} />
                            <span style={{ maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {custEmail}
                            </span>
                          </a>
                        </div>
                      </td>

                      {/* 4. Service Type */}
                      <td style={{ minWidth: 260 }}>
                        {(() => {
                          const srvList = apt.serviceNames || [];
                          const primaryService = srvList[0] || 'Standard Salon Service';
                          const hasMultiple = srvList.length > 1;
                          const isExpanded = expandedServiceAptIds.has(apt.id);

                          return (
                            <div>
                              {/* Primary Service Name & "+X more" Pill Button */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.86rem', lineHeight: 1.3 }}>
                                  {primaryService}
                                </span>
                                
                                {hasMultiple && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedServiceDetailsApt(apt);
                                    }}
                                    className="badge-gold"
                                    style={{
                                      border: '1px solid var(--border-gold)',
                                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22), rgba(212, 175, 55, 0.08))',
                                      color: 'var(--gold-primary)',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 3,
                                      whiteSpace: 'nowrap',
                                      transition: 'all 0.2s ease',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.18)'
                                    }}
                                    title={`Click to show total details for all ${srvList.length} services`}
                                  >
                                    <span>+{srvList.length - 1} more</span>
                                    <ChevronRight size={11} />
                                  </button>
                                )}
                              </div>

                              {/* Inline Expanded Services if toggled */}
                              {hasMultiple && isExpanded && (
                                <div
                                  style={{
                                    marginTop: 6,
                                    padding: '6px 10px',
                                    background: 'var(--bg-elevated)',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-subtle)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 5
                                  }}
                                >
                                  {srvList.slice(1).map((sName, sIdx) => {
                                    const matchSrv = services?.find(s => s.name?.toLowerCase() === sName?.toLowerCase());
                                    return (
                                      <div
                                        key={sIdx}
                                        style={{
                                          fontSize: '0.76rem',
                                          color: 'var(--text-secondary)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: 6
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                                          <span style={{ color: 'var(--gold-primary)', fontSize: '0.7rem' }}>&bull;</span>
                                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sName}</span>
                                        </div>
                                        {matchSrv?.durationMinutes && (
                                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {matchSrv.durationMinutes}m
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Subtitle: Branch, Duration, and Show More / Total Details buttons */}
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ whiteSpace: 'nowrap' }}>{apt.branch || 'Beverly Hills Flagship'} &bull; {apt.durationMinutes} mins</span>

                                {hasMultiple && (
                                  <>
                                    <span style={{ opacity: 0.4 }}>|</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpandService(apt.id);
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        color: isExpanded ? 'var(--gold-primary)' : 'var(--text-secondary)',
                                        fontSize: '0.71rem',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        textDecoration: 'underline',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {isExpanded ? (
                                        <><span>Show Less</span> <ChevronUp size={11} /></>
                                      ) : (
                                        <><span>Show More</span> <ChevronDown size={11} /></>
                                      )}
                                    </button>
                                  </>
                                )}

                                <span style={{ opacity: 0.4 }}>|</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedServiceDetailsApt(apt);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    color: 'var(--gold-primary)',
                                    fontSize: '0.71rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    textDecoration: 'underline',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Click to view total details of booked services"
                                >
                                  <Sparkles size={10} />
                                  <span>Total Details</span>
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* 6. Status */}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        {getStatusBadge(apt.status)}
                      </td>

                      {/* 7. Date & Time */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {apt.time}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {apt.date}
                        </div>
                      </td>

                      {/* 8. Actions (Only View Button) */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.78rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            borderColor: 'var(--gold-primary)',
                            color: 'var(--gold-primary)',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-xs)',
                            whiteSpace: 'nowrap'
                          }}
                          onClick={() => setSelectedCustomerApt(apt)}
                          title="View Total Customer & Appointment Details"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: CALENDAR MONTH / MATRIX */}
      {viewMode === 'calendar' && (
        <div className="luxe-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CalendarDays size={20} color="var(--gold-primary)" />
              <h3 style={{ fontSize: '1.2rem' }}>Appointment Calendar Schedule</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Month:</span>
              <input
                type="month"
                className="form-input"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                value={currentCalendarMonth}
                onChange={(e) => setCurrentCalendarMonth(e.target.value)}
              />
            </div>
          </div>

          {/* Calendar Grid Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} style={{ textAlign: 'center', padding: '8px 0', fontWeight: 700, fontSize: '0.8rem', color: 'var(--gold-primary)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xs)' }}>
                {day}
              </div>
            ))}

            {/* Generated calendar days for current period */}
            {Array.from({ length: 30 }, (_, i) => {
              const dayNum = i + 1;
              const dateKey = `2026-09-${String(dayNum).padStart(2, '0')}`;
              const dayApts = categoryBaseAppointments.filter(a => a.date === dateKey);
              const isToday = dateKey === '2026-09-30';

              return (
                <div
                  key={dateKey}
                  onClick={() => {
                    setSelectedDateFilter(dateKey);
                    setViewMode('list');
                  }}
                  style={{
                    minHeight: 110,
                    background: isToday ? 'rgba(212, 175, 55, 0.08)' : 'var(--bg-card)',
                    border: isToday ? '1.5px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isToday ? 'var(--gold-primary)' : 'var(--text-primary)' }}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: '0.62rem', background: 'var(--gold-primary)', color: '#000', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                        TODAY
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'hidden' }}>
                    {dayApts.slice(0, 2).map(apt => (
                      <div
                        key={apt.id}
                        style={{
                          fontSize: '0.68rem',
                          background: 'var(--bg-elevated)',
                          padding: '3px 6px',
                          borderRadius: 4,
                          borderLeft: '2px solid var(--gold-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        <strong>{apt.time}</strong> {apt.customerName.split(' ')[0]}
                      </div>
                    ))}
                    {dayApts.length > 2 && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--gold-primary)', fontWeight: 600, textAlign: 'center' }}>
                        +{dayApts.length - 2} more
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                    {dayApts.length} booking{dayApts.length !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: CHAIR TIMELINE */}
      {viewMode === 'timeline' && (
        <div className="luxe-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.15rem' }}>Station & Chair Gantt View (Today - 2026-09-30)</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 600 }}>Beverly Hills Flagship Suite Matrix</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Chair #1 (Color Master)', 'Chair #2 (Couture Cuts)', 'Private Spa Suite 1', 'Nail Lounge Station 2', 'Gentlemen Suite Chair #2'].map((stationName) => {
              const stationApts = categoryBaseAppointments.filter(a => a.station === stationName && a.date === '2026-09-30');
              return (
                <div key={stationName} style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-gold)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{stationName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stationApts.length} Scheduled Service(s)</span>
                  </div>
                  {stationApts.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                      Station vacant & open for walk-in or express booking
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                      {stationApts.map(a => (
                        <div
                          key={a.id}
                          style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-gold)',
                            borderRadius: 'var(--radius-xs)',
                            padding: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>{a.customerName}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', fontWeight: 700 }}>{a.time}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {a.serviceNames?.[0] || 'Salon Service'}
                            </span>
                            {a.serviceNames && a.serviceNames.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setSelectedServiceDetailsApt(a)}
                                style={{
                                  background: 'rgba(212, 175, 55, 0.15)',
                                  border: '1px solid var(--border-gold)',
                                  color: 'var(--gold-primary)',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0
                                }}
                                title="Click to view total service details"
                              >
                                +{a.serviceNames.length - 1} more
                              </button>
                            )}
                          </div>
                          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Stylist: {a.stylistName}</span>
                            {getStatusBadge(a.status)}
                          </div>
                          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                            {a.status !== 'Completed' && (
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.7rem', width: '100%' }}
                                onClick={() => openRescheduleModal(a)}
                              >
                                Move Slot
                              </button>
                            )}
                            <button
                              className="btn btn-gold"
                              style={{ padding: '4px 8px', fontSize: '0.7rem', width: '100%' }}
                              onClick={() => handleCompleteAndBill(a)}
                            >
                              Bill
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: RESCHEDULE APPOINTMENT */}
      {rescheduleModalApt && (
        <div className="modal-overlay" onClick={() => setRescheduleModalApt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 className="serif-heading" style={{ fontSize: '1.25rem' }}>Reschedule Appointment</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rescheduleModalApt.customerName} &bull; {rescheduleModalApt.code}</p>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setRescheduleModalApt(null)}>
                <XCircle size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">New Appointment Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={newDateVal}
                  onChange={(e) => setNewDateVal(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Time Slot</label>
                <select
                  className="form-select"
                  value={newTimeVal}
                  onChange={(e) => setNewTimeVal(e.target.value)}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="01:30 PM">01:30 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:30 PM">06:30 PM</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Staff Specialist</label>
                <select
                  className="form-select"
                  value={newStylistVal}
                  onChange={(e) => setNewStylistVal(e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setRescheduleModalApt(null)}>
                  Cancel
                </button>
                <button className="btn btn-gold" onClick={submitReschedule}>
                  Confirm Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: STAFF REASSIGNMENT */}
      {reassignModalApt && (
        <div className="modal-overlay" onClick={() => setReassignModalApt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 className="serif-heading" style={{ fontSize: '1.25rem' }}>Staff Assignment</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Assign specialist to {reassignModalApt.customerName}</p>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setReassignModalApt(null)}>
                <XCircle size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">Select Specialist</label>
                <select
                  className="form-select"
                  value={targetStylistId}
                  onChange={(e) => setTargetStylistId(e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} &bull; {emp.specialization.split('&')[0]}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setReassignModalApt(null)}>
                  Cancel
                </button>
                <button className="btn btn-gold" onClick={submitReassign}>
                  Assign Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: COMPREHENSIVE CUSTOMER & APPOINTMENT DOSSIER WITH ACTION CONTROLS */}
      {selectedCustomerApt && (() => {
        const cust = customers.find(c => c.id === selectedCustomerApt.customerId || c.name === selectedCustomerApt.customerName) || {
          name: selectedCustomerApt.customerName,
          phone: selectedCustomerApt.customerPhone,
          email: `${selectedCustomerApt.customerName.toLowerCase().replace(/\s+/g, '.')}@vipguest.com`,
          address: selectedCustomerApt.address || 'Beverly Hills, CA',
          gender: 'Female',
          tier: 'Gold',
          membership: 'Luxe VIP Elite Pass',
          status: 'Active',
          loyaltyPoints: 750,
          totalSpent: 2850,
          visitsCount: 9,
          hairType: 'Fine / Highlighted',
          skinType: 'Combination / Sensitive',
          allergies: 'None recorded',
          preferences: 'Complimentary iced matcha tea',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };

        return (
          <div className="modal-overlay" onClick={() => setSelectedCustomerApt(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 760, maxHeight: '92vh', overflowY: 'auto' }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h3 style={{ fontSize: '1.3rem' }}>{cust?.name || selectedCustomerApt.customerName}</h3>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      <Star size={10} /> {cust?.tier || selectedCustomerApt.customerTier || 'Gold VIP'}
                    </span>
                    {getStatusBadge(selectedCustomerApt.status)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Booking Code: <strong style={{ color: 'var(--gold-primary)' }}>{selectedCustomerApt.code}</strong> &bull; Member: <strong>{cust?.membership || 'Standard Guest'}</strong>
                  </div>
                </div>
                <button className="btn btn-secondary btn-icon" onClick={() => setSelectedCustomerApt(null)}>
                  <X size={18} />
                </button>
              </div>

              {/* Action Buttons Toolbar: Remind, Check-In, Start, Bill/Invoice, Reschedule, Cancel */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 24px',
                  background: 'rgba(212, 175, 55, 0.08)',
                  borderBottom: '1px solid var(--border-gold)',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick Action Controls:
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* 1. Remind Button */}
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 600,
                      borderColor: selectedCustomerApt.reminderSent ? 'var(--emerald-accent)' : 'var(--border-subtle)'
                    }}
                    onClick={() => {
                      sendAppointmentReminder(selectedCustomerApt.id);
                      setSelectedCustomerApt(prev => ({ ...prev, reminderSent: true }));
                    }}
                    title="Send SMS / Email Booking Reminder"
                  >
                    <Send size={13} color={selectedCustomerApt.reminderSent ? 'var(--emerald-accent)' : 'var(--text-secondary)'} />
                    <span>{selectedCustomerApt.reminderSent ? 'Reminded' : 'Remind'}</span>
                  </button>

                  {/* 2. Check-In Button */}
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      borderColor: 'var(--emerald-accent)',
                      color: 'var(--emerald-accent)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    onClick={() => {
                      handleCheckIn(selectedCustomerApt.id);
                      setSelectedCustomerApt(prev => ({
                        ...prev,
                        status: 'Checked-In',
                        checkedInAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }));
                    }}
                    title="Check-In Client upon Arrival"
                  >
                    <UserCheck size={13} />
                    <span>Check In</span>
                  </button>


                  {/* 4. Bill / Invoice Button */}
                  <button
                    className="btn btn-gold"
                    style={{
                      padding: '7px 15px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    onClick={() => {
                      const apt = selectedCustomerApt;
                      setSelectedCustomerApt(null);
                      handleCompleteAndBill(apt);
                    }}
                    title="Generate Invoice & Proceed to POS Checkout"
                  >
                    <CreditCard size={13} />
                    <span>Bill / Invoice</span>
                  </button>

                  {/* 5. Reschedule Button */}
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 600
                    }}
                    onClick={() => {
                      const apt = selectedCustomerApt;
                      setSelectedCustomerApt(null);
                      openRescheduleModal(apt);
                    }}
                    title="Reschedule Appointment Date / Time"
                  >
                    <RotateCcw size={13} />
                    <span>Reschedule</span>
                  </button>

                  {/* 6. Cancel Button */}
                  <button
                    className="btn btn-danger"
                    style={{
                      padding: '7px 12px',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 600
                    }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to cancel appointment ${selectedCustomerApt.code}?`)) {
                        handleCancel(selectedCustomerApt.id);
                        setSelectedCustomerApt(prev => ({ ...prev, status: 'Cancelled' }));
                      }
                    }}
                    title="Cancel this appointment"
                  >
                    <XCircle size={13} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Section 1: Customer Profile & Demographics */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                    1. Customer Profile & Contact Details
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.82rem' }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>PHONE NUMBER</div>
                      <strong style={{ color: 'var(--gold-primary)' }}>{cust.phone}</strong>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>EMAIL ADDRESS</div>
                      <strong>{cust.email || 'jules@luxurygroup.com'}</strong>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>LOYALTY POINTS & VISITS</div>
                      <strong>{cust.loyaltyPoints || 750} pts &bull; {cust.visitsCount || 9} Visits</strong>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6, marginTop: 10, fontSize: '0.82rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>RESIDENTIAL ADDRESS:</div>
                    <strong>{cust.address || selectedCustomerApt.address || '742 Evergreen Terrace, Pasadena, CA'}</strong>
                  </div>
                </div>

                {/* Section 2: Biometrics & Hospitality Preferences */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                    2. Hair / Skin Biometrics & Preferences
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.82rem' }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>HAIR PROFILE & TEXTURE:</div>
                      <strong>{cust.hairType || 'Thick, Brunette, Balayage Treated'}</strong>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>SKIN PROFILE & ALLERGIES:</div>
                      <strong>{cust.skinType || 'Combination / Sensitive'} &bull; <span style={{ color: 'var(--ruby-accent)' }}>{cust.allergies || 'None'}</span></strong>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 6, marginTop: 8, fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Hospitality Note: </span>
                    <span>{cust.preferences || 'Sparkling San Pellegrino with lemon & quiet service'}</span>
                  </div>
                </div>

                {/* Section 3: Active Appointment Specifications */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                    3. Appointment & Service Specifications
                  </h4>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 8, padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: '0.82rem', marginBottom: 12 }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>DATE & TIME SLOT</div>
                        <strong>{selectedCustomerApt.date} at {selectedCustomerApt.time}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>ASSIGNED SPECIALIST</div>
                        <strong style={{ color: 'var(--gold-primary)' }}>{selectedCustomerApt.stylistName}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>BRANCH / STATION</div>
                        <strong>{selectedCustomerApt.branch} ({selectedCustomerApt.station})</strong>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 4 }}>BOOKED SERVICES ({selectedCustomerApt.durationMinutes} MINS):</div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {selectedCustomerApt.serviceNames?.join(' + ')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Amount: </span>
                        <strong style={{ fontSize: '1.15rem', color: 'var(--gold-primary)' }}>{settings.currency}{Number(selectedCustomerApt.price).toFixed(2)}</strong>
                      </div>
                      <span className={`badge ${selectedCustomerApt.paymentStatus === 'Paid' ? 'badge-emerald' : 'badge-amber'}`}>
                        Payment: {selectedCustomerApt.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Notes */}
                {selectedCustomerApt.notes && (
                  <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>Special Appointment Notes:</strong> {selectedCustomerApt.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          SERVICE TOTAL DETAILS MODAL (Pop-up on clicking +X more or Total Details)
         ======================================================== */}
      {selectedServiceDetailsApt && (() => {
        const apt = selectedServiceDetailsApt;
        const breakdown = getServiceBreakdown(apt);
        const subtotal = breakdown.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const finalPrice = Number(apt.price) || subtotal;

        return (
          <div
            className="modal-overlay"
            onClick={() => setSelectedServiceDetailsApt(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 5, 8, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: 20
            }}
          >
            <div
              className="luxe-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 720,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-lg)',
                padding: 0,
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.1) 0%, rgba(15, 17, 26, 0.4) 100%)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: 'rgba(212, 175, 55, 0.15)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--gold-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Scissors size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                      Service Total Details
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>Booking: <strong style={{ color: 'var(--text-primary)' }}>{apt.code}</strong></span>
                      <span>&bull;</span>
                      <span>Customer: <strong style={{ color: 'var(--text-primary)' }}>{apt.customerName}</strong></span>
                      <span>&bull;</span>
                      <span>Slot: <strong style={{ color: 'var(--cyan-accent)' }}>{apt.date} at {apt.time}</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${apt.type === 'Home Service' ? 'badge-amber' : 'badge-gold'}`}>
                    {apt.type === 'Home Service' ? <><Truck size={12} /> Home Service</> : <><Sparkles size={12} /> In-Salon Suite</>}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedServiceDetailsApt(null)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 4-Column KPI Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>TOTAL SERVICES</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                      {breakdown.length} {breakdown.length === 1 ? 'Service' : 'Services'}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>TOTAL DURATION</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cyan-accent)', marginTop: 4 }}>
                      {formatMins(apt.durationMinutes)}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>TOTAL PACKAGE AMOUNT</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-primary)', marginTop: 4 }}>
                      {settings.currency}{finalPrice.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>ASSIGNED SPECIALIST</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {apt.stylistName || 'Master Stylist'}
                    </div>
                  </div>
                </div>

                {/* Itemized Services Breakdown List */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Itemized Service Breakdown ({breakdown.length} {breakdown.length === 1 ? 'Service' : 'Services'})
                    </h4>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Total Scheduled: {apt.durationMinutes} minutes
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {breakdown.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 8,
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: 'rgba(212, 175, 55, 0.15)',
                              border: '1px solid var(--border-gold)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: 'var(--gold-primary)',
                              flexShrink: 0
                            }}
                          >
                            #{idx + 1}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                {item.name}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  color: 'var(--text-secondary)'
                                }}
                              >
                                {item.category}
                              </span>
                              {item.homeServiceEligible ? (
                                <span style={{ fontSize: '0.68rem', color: 'var(--emerald-accent)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <Truck size={10} /> Home Service Eligible
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                  In-Salon Only
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                              {item.description}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
                            {settings.currency}{Number(item.price).toFixed(2)}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--cyan-accent)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                            <Clock size={12} />
                            <span>{item.durationMinutes} mins</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location, Station & Notes Card */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(15, 17, 26, 0.6))',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 8,
                    padding: '16px 20px'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: '0.82rem', marginBottom: 12 }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>SALON BRANCH</div>
                      <strong style={{ color: 'var(--text-primary)' }}>{apt.branch || 'Beverly Hills Flagship'}</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>SERVICE STATION / SUITE</div>
                      <strong style={{ color: 'var(--text-primary)' }}>{apt.station || 'Main Styling Suite'}</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>PAYMENT STATUS</div>
                      <span className={`badge ${apt.paymentStatus === 'Paid' ? 'badge-emerald' : 'badge-amber'}`} style={{ marginTop: 2 }}>
                        {apt.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {apt.notes && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, marginTop: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--gold-primary)' }}>Special Notes:</strong> {apt.notes}
                    </div>
                  )}

                  {/* Financial & Duration Summary */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-gold)',
                      paddingTop: 12,
                      marginTop: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Combined Package Duration: <strong style={{ color: 'var(--text-primary)' }}>{formatMins(apt.durationMinutes)}</strong>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        Coordinated under Specialist: <span style={{ color: 'var(--gold-primary)' }}>{apt.stylistName}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GRAND TOTAL SERVICE AMOUNT</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                        {settings.currency}{finalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                      const targetApt = selectedServiceDetailsApt;
                      setSelectedServiceDetailsApt(null);
                      setSelectedCustomerApt(targetApt);
                    }}
                  >
                    <Eye size={14} /> View VIP Client Dossier
                  </button>

                  <button
                    type="button"
                    className="btn btn-gold"
                    style={{ fontSize: '0.82rem', padding: '8px 26px', fontWeight: 600 }}
                    onClick={() => setSelectedServiceDetailsApt(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
