import React, { useState, useEffect, useRef } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Calendar,
  Clock,
  User,
  Plus,
  X,
  Sparkles,
  MapPin,
  Building,
  CheckCircle2,
  DollarSign,
  Scissors,
  Check,
  Search,
  Phone,
  Mail,
  Home,
  AlertCircle,
  Truck,
  ArrowRight,
  Edit2,
  Trash2,
  ChevronDown,
  Printer,
  CreditCard,
  Receipt,
  Play,
  Pause,
  RefreshCw,
  Award
} from 'lucide-react';

export const QuickBookingModal = () => {
  const {
    isQuickBookingOpen,
    setIsQuickBookingOpen,
    quickBookingDate,
    setQuickBookingDate,
    customers,
    services,
    serviceCategories,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    employees,
    branches,
    addBranch,
    updateBranch,
    deleteBranch,
    addAppointment,
    updateAppointmentStatus,
    addCustomer,
    settings,
    setActiveView
  } = useSalon();

  // Booking Form State
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.name || 'Beverly Hills Flagship');
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const branchDropdownRef = useRef(null);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const timePickerRef = useRef(null);

  // Close custom branch dropdown and time picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target)) {
        setIsBranchDropdownOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(e.target)) {
        setIsTimePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keep selectedBranch synced if branches change or if current branch was deleted
  useEffect(() => {
    if (branches && branches.length > 0) {
      if (!branches.some(b => b.name === selectedBranch)) {
        setSelectedBranch(branches[0].name);
      }
    }
  }, [branches, selectedBranch]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGender, setNewCustGender] = useState('Female');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [customerSearchInput, setCustomerSearchInput] = useState('');

  // Auto-select OFF: starts with 0 services selected
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('ALL');
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedStylistId, setSelectedStylistId] = useState('');
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('02:00 PM');

  const [bookingStatus, setBookingStatus] = useState('Confirmed');
  const [serviceType, setServiceType] = useState('In-Salon'); // 'In-Salon' | 'Home Service'
  const [homeAddress, setHomeAddress] = useState('');
  const [station, setStation] = useState('Chair #1 (Color Master)');
  const [notes, setNotes] = useState('');
  const [showStatusPage, setShowStatusPage] = useState(false);
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);
  const [currentStatusStep, setCurrentStatusStep] = useState(1);
  const [isAutoProgressing, setIsAutoProgressing] = useState(false); // OFF: Manual progression only

  // Automatically sync customer residential address when Customer ID changes
  useEffect(() => {
    if (selectedCustomerId && !isNewCustomer) {
      const client = customers.find(c => c.id === selectedCustomerId);
      if (client?.address) {
        setHomeAddress(client.address);
      }
    }
  }, [selectedCustomerId, customers, isNewCustomer]);

  // Keep customer selected if customers list updates
  useEffect(() => {
    if (!selectedCustomerId && customers && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Keep auto-select OFF whenever modal opens
  useEffect(() => {
    if (isQuickBookingOpen) {
      setSelectedServiceIds([]);
      setServiceSearch('');
      if (quickBookingDate) {
        setBookingDate(quickBookingDate);
      }
    }
  }, [isQuickBookingOpen, quickBookingDate]);

  // Automatic progression is OFF as requested. Workflow status is manually controlled.

  if (!isQuickBookingOpen) return null;

  // Selected services calculations
  const chosenServices = services.filter(s => selectedServiceIds.includes(s.id));
  const serviceSubtotal = chosenServices.reduce((sum, s) => sum + s.price, 0);
  const homeDispatchFee = serviceType === 'Home Service' ? 25 : 0;
  const travelFee = serviceType === 'Home Service' ? Number((6.5 * (settings.travelChargePerKm || 3.5)).toFixed(2)) : 0;
  const totalPrice = serviceSubtotal + homeDispatchFee + travelFee;
  const totalDuration = chosenServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const handleToggleService = (id) => {
    if (selectedServiceIds.includes(id)) {
      setSelectedServiceIds(selectedServiceIds.filter(sid => sid !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleStepClick = (stepNum) => {
    setCurrentStatusStep(stepNum);
    const statusMap = {
      1: 'Confirmed',
      2: confirmedBookingData?.type === 'Home Service' ? 'Staff Assigned' : 'Artisan Assigned',
      3: confirmedBookingData?.type === 'Home Service' ? 'En Route' : 'Checked In',
      4: 'In Service',
      5: 'Completed'
    };
    if (updateAppointmentStatus && confirmedBookingData?.id) {
      updateAppointmentStatus(confirmedBookingData.id, statusMap[stepNum] || 'Confirmed');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedServiceIds || selectedServiceIds.length === 0) {
      alert('Please select at least one treatment / service to proceed with booking.');
      return;
    }

    let client = null;
    if (isNewCustomer) {
      if (!newCustName || !newCustPhone) {
        alert('Please provide name and phone number for the new client.');
        return;
      }
      client = addCustomer({
        name: newCustName,
        phone: newCustPhone,
        gender: newCustGender,
        email: newCustEmail || 'guest@luminaluxe.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        tier: 'Bronze',
        address: newCustAddress || homeAddress || 'Beverly Hills, CA'
      });
    } else {
      client = customers.find(c => c.id === selectedCustomerId) || customers[0] || {
        id: 'cust-walkin',
        name: 'VIP Guest',
        phone: '+1 (555) 019-2834',
        email: 'vipguest@luminaluxe.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        tier: 'Diamond VIP',
        address: 'Beverly Hills Flagship'
      };
    }

    const stylist = selectedStylistId ? (employees.find(e => e.id === selectedStylistId) || null) : null;

    const customerAvatar = client?.avatar || (client?.gender === 'Male'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');

    const created = addAppointment({
      customerId: client?.id,
      customerName: client?.name,
      customerPhone: client?.phone,
      customerEmail: client?.email || newCustEmail || 'guest@luminaluxe.com',
      customerGender: client?.gender || newCustGender || 'Female',
      gender: client?.gender || newCustGender || 'Female',
      customerAvatar: customerAvatar,
      customerTier: client?.tier || client?.membership || 'Diamond VIP',
      customerAddress: client?.address || newCustAddress || homeAddress || 'Client Residence, Beverly Hills',
      customerVisits: client?.visitsCount || 1,
      branch: selectedBranch,
      stylistId: stylist?.id || null,
      stylistName: stylist?.name || 'Any Available Specialist',
      stylistRole: stylist?.role || stylist?.designation || stylist?.title || 'Master Specialist',
      serviceIds: selectedServiceIds,
      serviceNames: chosenServices.map(s => s.name),
      services: chosenServices,
      date: bookingDate,
      time: bookingTime,
      durationMinutes: totalDuration,
      price: totalPrice,
      totalPrice: totalPrice,
      serviceSubtotal: serviceSubtotal,
      homeDispatchFee: homeDispatchFee,
      travelFee: travelFee,
      station: serviceType === 'Home Service' ? `Home Service Dispatch (${homeAddress || 'Client Location'})` : station,
      type: serviceType,
      status: bookingStatus || 'Confirmed',
      address: homeAddress || client?.address || 'Client Address',
      notes: notes || 'Booked via Lumina Luxe Appointment Engine'
    });

    setConfirmedBookingData({
      ...created,
      client,
      customerAvatar,
      chosenServices,
      serviceSubtotal,
      homeDispatchFee,
      travelFee,
      totalPrice
    });
    setCurrentStatusStep(1);
    setIsAutoProgressing(false);
    setShowStatusPage(true);
  };

  const handleClose = () => {
    setShowStatusPage(false);
    setConfirmedBookingData(null);
    setCurrentStatusStep(1);
    setIsAutoProgressing(false);
    setIsQuickBookingOpen(false);
    if (setQuickBookingDate) setQuickBookingDate(null);
  };

  const handleNavigateToView = (viewName) => {
    handleClose();
    if (setActiveView) setActiveView(viewName);
  };

  // Time Picker Parsing and Formatting Utilities
  const parseTime = (timeStr) => {
    const match = (timeStr || '02:00 PM').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const minute = match[2];
      let period = (match[3] || 'PM').toUpperCase();
      if (hour > 12) {
        hour = hour - 12;
        period = 'PM';
      }
      if (hour === 0) hour = 12;
      return { hour: String(hour).padStart(2, '0'), minute, period };
    }
    return { hour: '02', minute: '00', period: 'PM' };
  };

  const convert24to12 = (val24) => {
    if (!val24) return '02:00 PM';
    const parts = val24.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${period}`;
  };

  const convert12to24 = (val12) => {
    const { hour, minute, period } = parseTime(val12);
    let h = parseInt(hour, 10);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${minute}`;
  };

  const updateTimePart = (part, value) => {
    const current = parseTime(bookingTime);
    current[part] = value;
    const formatted = `${current.hour}:${current.minute} ${current.period}`;
    setBookingTime(formatted);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 740, maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <h3 className="serif-heading" style={{ fontSize: '1.35rem' }}>
              {showStatusPage ? 'Appointment Booking Status Page' : 'New Salon & Home Appointment Booking'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              {showStatusPage ? 'Live tracking, workflow status, dispatch notes & payment summary' : 'Multi-service booking &bull; Branch/Stylist assignment &bull; Real-time status update'}
            </p>
          </div>
          <button
            className="btn btn-secondary btn-icon"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* BOOKING COMPLETE LIVE STATUS PAGE */}
        {showStatusPage && confirmedBookingData ? (
          <div style={{ padding: '24px' }}>
            {/* Status Hero Card */}
            <div
              style={{
                background: confirmedBookingData.type === 'Home Service'
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.18) 0%, rgba(20, 23, 34, 0.96) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(20, 23, 34, 0.96) 100%)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '22px 24px',
                marginBottom: 20,
                textAlign: 'center',
                position: 'relative',
                boxShadow: 'var(--shadow-gold)'
              }}
            >
              {/* Status Icon Indicator */}
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  border: '2px solid var(--gold-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)'
                }}
              >
                {confirmedBookingData.type === 'Home Service' ? (
                  <Truck size={28} color="var(--gold-primary)" />
                ) : (
                  <CheckCircle2 size={28} color="var(--emerald-accent)" />
                )}
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span className={`badge ${confirmedBookingData.type === 'Home Service' ? 'badge-gold' : 'badge-emerald'}`} style={{ fontSize: '0.78rem', padding: '4px 14px' }}>
                  {confirmedBookingData.type === 'Home Service' ? 'Home Service Dispatch Confirmed' : 'In-Salon Suite Appointment Confirmed'}
                </span>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                  {confirmedBookingData.customerTier || 'Diamond VIP'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.6rem', marginBottom: 4 }} className="serif-heading">
                {confirmedBookingData.customerName}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                  Booking Ref: {confirmedBookingData.code}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--emerald-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-accent)', display: 'inline-block', boxShadow: '0 0 8px var(--emerald-accent)' }}></span>
                  Appointment Registered
                </span>
              </div>
            </div>

            {/* Customer Status Bar & Workflow Stepper (Auto-Progression: OFF) */}
            <div className="luxe-card" style={{ marginBottom: 20, padding: 20, background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Customer Appointment Workflow & Status Bar
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Stage: <strong style={{ color: 'var(--gold-light)' }}>
                      {currentStatusStep === 1 && 'Confirmed (Slot Locked)'}
                      {currentStatusStep === 2 && (confirmedBookingData.type === 'Home Service' ? 'Staff Assigned' : 'Artisan Assigned')}
                      {currentStatusStep === 3 && (confirmedBookingData.type === 'Home Service' ? 'En Route (Dispatched)' : 'Guest Check-In')}
                      {currentStatusStep === 4 && 'In Service (Treatment Underway)'}
                      {currentStatusStep === 5 && 'Done & Invoiced (Bill Settled)'}
                    </strong> &bull; Auto-Advance: <span style={{ color: 'var(--amber-accent)', fontWeight: 700 }}>OFF (Manual Mode)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '5px 12px', height: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                    disabled={currentStatusStep <= 1}
                    onClick={() => handleStepClick(Math.max(currentStatusStep - 1, 1))}
                  >
                    <span>&larr; Prev Step</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-gold"
                    style={{ fontSize: '0.72rem', padding: '5px 12px', height: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
                    disabled={currentStatusStep >= 5}
                    onClick={() => handleStepClick(Math.min(currentStatusStep + 1, 5))}
                  >
                    <span>Next Step &rarr;</span>
                  </button>
                </div>
              </div>

              {/* Visual Animated Status Bar */}
              <div
                style={{
                  width: '100%',
                  height: 10,
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 9999,
                  overflow: 'hidden',
                  marginBottom: 16,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${currentStatusStep * 20}%`,
                    background: confirmedBookingData.type === 'Home Service'
                      ? 'linear-gradient(90deg, #d4af37 0%, #f59e0b 50%, #10b981 100%)'
                      : 'linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #10b981 100%)',
                    transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0 14px rgba(56, 189, 248, 0.6)',
                    borderRadius: 9999
                  }}
                />
              </div>

              {/* 5-Step Stepper Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, textAlign: 'center', fontSize: '0.72rem' }}>
                {/* STEP 1 */}
                <div
                  onClick={() => handleStepClick(1)}
                  style={{
                    background: currentStatusStep >= 1 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                    padding: '10px 6px',
                    borderRadius: 8,
                    border: currentStatusStep === 1
                      ? '1px solid var(--gold-primary)'
                      : (currentStatusStep > 1 ? '1px solid var(--emerald-accent)' : '1px solid var(--border-subtle)'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: currentStatusStep === 1 ? '0 0 10px rgba(56, 189, 248, 0.25)' : undefined
                  }}
                >
                  <div style={{ color: currentStatusStep > 1 ? 'var(--emerald-accent)' : 'var(--gold-primary)', fontWeight: 800, marginBottom: 2 }}>
                    {currentStatusStep > 1 ? '✓ STEP 1' : 'STEP 1'}
                  </div>
                  <div style={{ fontWeight: 700, color: currentStatusStep >= 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    Confirmed
                  </div>
                  <div style={{ color: currentStatusStep >= 1 ? 'var(--emerald-accent)' : 'var(--text-muted)', fontSize: '0.65rem', marginTop: 2 }}>
                    Slot Locked
                  </div>
                </div>

                {/* STEP 2 */}
                <div
                  onClick={() => handleStepClick(2)}
                  style={{
                    background: currentStatusStep >= 2 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                    padding: '10px 6px',
                    borderRadius: 8,
                    border: currentStatusStep === 2
                      ? '1px solid var(--gold-primary)'
                      : (currentStatusStep > 2 ? '1px solid var(--emerald-accent)' : '1px solid var(--border-subtle)'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: currentStatusStep === 2 ? '0 0 10px rgba(56, 189, 248, 0.25)' : undefined
                  }}
                >
                  <div style={{ color: currentStatusStep > 2 ? 'var(--emerald-accent)' : (currentStatusStep === 2 ? 'var(--gold-primary)' : 'var(--text-muted)'), fontWeight: 800, marginBottom: 2 }}>
                    {currentStatusStep > 2 ? '✓ STEP 2' : 'STEP 2'}
                  </div>
                  <div style={{ fontWeight: 700, color: currentStatusStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    Artisan Assigned
                  </div>
                  <div style={{ color: currentStatusStep >= 2 ? 'var(--gold-light)' : 'var(--text-muted)', fontSize: '0.65rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {confirmedBookingData.stylistName || 'Master Stylist'}
                  </div>
                </div>

                {/* STEP 3 */}
                <div
                  onClick={() => handleStepClick(3)}
                  style={{
                    background: currentStatusStep >= 3 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                    padding: '10px 6px',
                    borderRadius: 8,
                    border: currentStatusStep === 3
                      ? '1px solid var(--gold-primary)'
                      : (currentStatusStep > 3 ? '1px solid var(--emerald-accent)' : '1px solid var(--border-subtle)'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: currentStatusStep === 3 ? '0 0 10px rgba(56, 189, 248, 0.25)' : undefined
                  }}
                >
                  <div style={{ color: currentStatusStep > 3 ? 'var(--emerald-accent)' : (currentStatusStep === 3 ? 'var(--gold-primary)' : 'var(--text-muted)'), fontWeight: 800, marginBottom: 2 }}>
                    {currentStatusStep > 3 ? '✓ STEP 3' : 'STEP 3'}
                  </div>
                  <div style={{ fontWeight: 700, color: currentStatusStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {confirmedBookingData.type === 'Home Service' ? 'En Route' : 'Guest Check-In'}
                  </div>
                  <div style={{ color: currentStatusStep >= 3 ? 'var(--cyan-accent)' : 'var(--text-muted)', fontSize: '0.65rem', marginTop: 2 }}>
                    {confirmedBookingData.type === 'Home Service' ? 'Dispatched' : 'Arrived at Suite'}
                  </div>
                </div>

                {/* STEP 4 */}
                <div
                  onClick={() => handleStepClick(4)}
                  style={{
                    background: currentStatusStep >= 4 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                    padding: '10px 6px',
                    borderRadius: 8,
                    border: currentStatusStep === 4
                      ? '1px solid var(--gold-primary)'
                      : (currentStatusStep > 4 ? '1px solid var(--emerald-accent)' : '1px solid var(--border-subtle)'),
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: currentStatusStep === 4 ? '0 0 10px rgba(56, 189, 248, 0.25)' : undefined
                  }}
                >
                  <div style={{ color: currentStatusStep > 4 ? 'var(--emerald-accent)' : (currentStatusStep === 4 ? 'var(--gold-primary)' : 'var(--text-muted)'), fontWeight: 800, marginBottom: 2 }}>
                    {currentStatusStep > 4 ? '✓ STEP 4' : 'STEP 4'}
                  </div>
                  <div style={{ fontWeight: 700, color: currentStatusStep >= 4 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    In Service
                  </div>
                  <div style={{ color: currentStatusStep >= 4 ? 'var(--rose-accent)' : 'var(--text-muted)', fontSize: '0.65rem', marginTop: 2 }}>
                    Treatment Active
                  </div>
                </div>

                {/* STEP 5 */}
                <div
                  onClick={() => handleStepClick(5)}
                  style={{
                    background: currentStatusStep >= 5 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                    padding: '10px 6px',
                    borderRadius: 8,
                    border: currentStatusStep === 5 ? '1px solid var(--emerald-accent)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: currentStatusStep === 5 ? '0 0 10px rgba(16, 185, 129, 0.35)' : undefined
                  }}
                >
                  <div style={{ color: currentStatusStep >= 5 ? 'var(--emerald-accent)' : 'var(--text-muted)', fontWeight: 800, marginBottom: 2 }}>
                    {currentStatusStep >= 5 ? '✓ STEP 5' : 'STEP 5'}
                  </div>
                  <div style={{ fontWeight: 700, color: currentStatusStep >= 5 ? 'var(--emerald-accent)' : 'var(--text-muted)' }}>
                    Done & Invoiced
                  </div>
                  <div style={{ color: currentStatusStep >= 5 ? 'var(--emerald-accent)' : 'var(--text-muted)', fontSize: '0.65rem', marginTop: 2 }}>
                    Bill Settled
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Dossier: Customer Details & Financial Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Left Column: Customer Details & Appointment Specification */}
              <div className="luxe-card" style={{ padding: 18, background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} /> Client Profile & Details
                  </h4>
                  <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                    {confirmedBookingData.customerTier || 'Diamond VIP'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem' }}>
                  {/* Customer Name Banner (Without Image) */}
                  <div style={{ background: 'var(--bg-elevated)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)' }}>{confirmedBookingData.customerName}</span>
                      <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{confirmedBookingData.customerTier || 'VIP'}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Loyalty Visits: {confirmedBookingData.customerVisits || 1} &bull; Client ID: {confirmedBookingData.customerId || 'Verified'} &bull; Gender: <strong style={{ color: 'var(--cyan-accent)' }}>{confirmedBookingData.customerGender || confirmedBookingData.gender || 'Female'}</strong>
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={13} color="var(--gold-primary)" /> Client Phone:
                    </span>
                    <a href={`tel:${confirmedBookingData.customerPhone}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                      {confirmedBookingData.customerPhone}
                    </a>
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={13} color="var(--gold-primary)" /> Email Address:
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {confirmedBookingData.customerEmail || 'client@luminaluxe.com'}
                    </span>
                  </div>

                  {/* Location / Address */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} color="var(--gold-primary)" /> Address / Estate:
                    </span>
                    <span style={{ textAlign: 'right', maxWidth: '55%', fontWeight: 600, fontSize: '0.78rem' }}>
                      {confirmedBookingData.customerAddress || confirmedBookingData.address || 'Beverly Hills, CA'}
                    </span>
                  </div>

                  {/* Branch */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Building size={13} color="var(--gold-primary)" /> Branch / Salon:
                    </span>
                    <strong>{confirmedBookingData.branch}</strong>
                  </div>

                  {/* Stylist */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Scissors size={13} color="var(--gold-primary)" /> Assigned Stylist:
                    </span>
                    <strong style={{ color: 'var(--gold-primary)' }}>{confirmedBookingData.stylistName}</strong>
                  </div>

                  {/* Date & Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="var(--gold-primary)" /> Date & Slot Time:
                    </span>
                    <strong>{confirmedBookingData.date} &bull; {confirmedBookingData.time}</strong>
                  </div>

                  {/* Allocated Station */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={13} color="var(--gold-primary)" /> Station / Chair:
                    </span>
                    <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--gold-light)' }}>
                      {confirmedBookingData.station}
                    </span>
                  </div>

                  {/* Notes / Special Requests if provided */}
                  {confirmedBookingData.notes && (
                    <div style={{ marginTop: 6, background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 6, border: '1px dashed var(--border-subtle)', fontSize: '0.74rem' }}>
                      <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>Guest Notes: </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{confirmedBookingData.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing Engine Breakdown & Itemized Services */}
              <div className="luxe-card" style={{ padding: 18, background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DollarSign size={14} /> Total & Pricing Details
                  </h4>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                    {confirmedBookingData.durationMinutes} Mins Total
                  </span>
                </div>

                {/* Selected Services Itemized List */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 700 }}>
                    Selected Treatments ({confirmedBookingData.serviceNames?.length || 0}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
                    {(confirmedBookingData.chosenServices && confirmedBookingData.chosenServices.length > 0
                      ? confirmedBookingData.chosenServices
                      : (confirmedBookingData.serviceNames || []).map(name => ({ name, durationMinutes: Math.round(confirmedBookingData.durationMinutes / (confirmedBookingData.serviceNames?.length || 1)), price: confirmedBookingData.price / (confirmedBookingData.serviceNames?.length || 1) }))
                    ).map((srv, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'var(--bg-elevated)',
                          padding: '7px 10px',
                          borderRadius: 6,
                          fontSize: '0.78rem'
                        }}
                      >
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                          <span style={{ fontWeight: 600 }}>{srv.name}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 6 }}>{srv.durationMinutes}m</span>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--gold-light)' }}>
                          {settings.currency}{Number(srv.price || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Surcharges & Subtotal Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Services Subtotal:</span>
                    <span>{settings.currency}{Number(confirmedBookingData.serviceSubtotal || serviceSubtotal || confirmedBookingData.price).toFixed(2)}</span>
                  </div>

                  {confirmedBookingData.type === 'Home Service' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Home Dispatch Concierge Fee:</span>
                        <span>{settings.currency}{Number(confirmedBookingData.homeDispatchFee || homeDispatchFee || 25).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Travel Distance Fee (6.5 km):</span>
                        <span>{settings.currency}{Number(confirmedBookingData.travelFee || travelFee || 22.75).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {/* Prominent Estimated Grand Total */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 10,
                      marginTop: 4,
                      borderTop: '1px solid var(--border-subtle)',
                      background: 'rgba(56, 189, 248, 0.06)',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-gold)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                        Total Booking Amount:
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Includes taxes & concierge fees
                      </div>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--gold-primary)', letterSpacing: '0.02em' }}>
                      {settings.currency}{Number(confirmedBookingData.price || confirmedBookingData.totalPrice || totalPrice).toFixed(2)}
                    </div>
                  </div>

                  {/* Payment Status Card with Direct Settlement Button */}
                  <div style={{ background: 'var(--bg-elevated)', padding: '10px 12px', borderRadius: 8, marginTop: 8, fontSize: '0.76rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Payment Settlement:</span>
                      <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        {confirmedBookingData.paymentStatus || 'Pending Settlement'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-gold"
                      style={{ width: '100%', fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => handleNavigateToView('billing')}
                    >
                      <CreditCard size={13} /> Settle Bill & Checkout in POS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 16, flexWrap: 'wrap', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Printer size={14} /> Print Confirmation
              </button>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {confirmedBookingData.type === 'Home Service' ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleNavigateToView('homeservice')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Truck size={14} /> View in Home Dispatch Console
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleNavigateToView('appointments')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Calendar size={14} /> View in Appointment Ledger
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={handleClose}
                >
                  Done & Close Status Page
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* BOOKING FORM */
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {/* Branch & Initial Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }} className="form-group">
              <div style={{ position: 'relative' }} ref={branchDropdownRef}>
                <label className="form-label">Branch / Salon Location *</label>

                {/* Custom Branch Selector Button / Trigger */}
                <div
                  onClick={() => setIsBranchDropdownOpen(prev => !prev)}
                  className="form-select"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderColor: isBranchDropdownOpen ? 'var(--gold-primary)' : undefined,
                    boxShadow: isBranchDropdownOpen ? '0 0 0 1px var(--gold-primary)' : undefined
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {selectedBranch}
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: 'var(--gold-primary)',
                      transform: isBranchDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </div>

                {/* Custom Branch Dropdown Popover */}
                {isBranchDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      zIndex: 999,
                      background: 'var(--bg-card, #1c1917)',
                      border: '1px solid var(--border-gold, rgba(212, 175, 55, 0.4))',
                      borderRadius: '8px',
                      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Branch Items List (Clean Selector - No edit, delete, or add buttons) */}
                    <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                      {(branches || []).map((b) => {
                        const isSelected = selectedBranch === b.name;

                        return (
                          <div
                            key={b.id || b.name}
                            onClick={() => {
                              setSelectedBranch(b.name);
                              setIsBranchDropdownOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(212, 175, 55, 0.16)' : 'transparent',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.86rem',
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? 'var(--gold-primary)' : 'var(--text-primary)'
                              }}
                            >
                              {b.name}
                            </span>

                            {isSelected && (
                              <Check size={14} color="var(--gold-primary)" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Initial Status</label>
                <select
                  className="form-select"
                  value={bookingStatus}
                  onChange={(e) => setBookingStatus(e.target.value)}
                >
                  <option value="Confirmed">Confirmed</option>
                  {/* <option value="Pending">Pending Approval</option> */}
                  <option value="Checked-In">Checked-In</option>
                  <option value="Assigned">Assigned</option>
                </select>
              </div>
            </div>

            {/* Client Selection */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>Client Profile *</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setIsNewCustomer(!isNewCustomer)}
                >
                  {isNewCustomer ? '← Choose Existing Client' : '+ Register New Client'}
                </button>
              </div>

              {isNewCustomer ? (
                <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-gold)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Full Name *"
                      required
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                    />
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Phone Number *"
                      required
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <select
                      className="form-select"
                      value={newCustGender}
                      onChange={(e) => setNewCustGender(e.target.value)}
                    >
                      <option value="Female">Gender: Female</option>
                      <option value="Male">Gender: Male</option>
                      <option value="Non-Binary">Gender: Non-Binary</option>
                      <option value="Prefer not to say">Gender: Prefer not to say</option>
                    </select>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Email Address"
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Residential Address"
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Quick Search by Customer ID / Name / Phone */}
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type Customer ID (e.g. cust-1) or Name / Phone to auto-select..."
                      value={customerSearchInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomerSearchInput(val);
                        if (val.trim()) {
                          const query = val.trim().toLowerCase();
                          const matched = customers.find(c =>
                            c.id.toLowerCase() === query ||
                            c.id.toLowerCase().includes(query) ||
                            c.phone.toLowerCase().includes(query) ||
                            c.name.toLowerCase().includes(query)
                          );
                          if (matched) {
                            setSelectedCustomerId(matched.id);
                          }
                        }
                      }}
                      style={{ paddingLeft: 34, fontSize: '0.8rem', height: 36, width: '100%' }}
                    />
                  </div>

                  {/* Customer ID & Profile Selector */}
                  <select
                    className="form-select"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.id}] {c.name} &bull; {c.gender || 'Female'} &bull; {c.phone} &bull; {c.membership || c.tier}
                      </option>
                    ))}
                  </select>

                  {/* AUTOMATIC FULL CUSTOMER DETAILS SHOWCASE */}
                  {(() => {
                    const currentClient = customers.find(c => c.id === selectedCustomerId) || customers[0];
                    if (!currentClient) return null;
                    return (
                      <div
                        style={{
                          marginTop: 10,
                          background: 'var(--bg-elevated)',
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-gold)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12
                        }}
                      >
                        {/* Header: ID, Name, Tier, Gender */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-xs)',
                                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.25) 100%)',
                                border: '1.5px solid var(--border-gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--gold-primary)',
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                flexShrink: 0
                              }}
                            >
                              {(currentClient.name || 'VIP').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                  {currentClient.name}
                                </span>
                                <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                  {currentClient.tier || currentClient.membership || 'VIP Client'}
                                </span>
                                <span className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                  {currentClient.gender || 'Female'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span>Customer ID: <strong style={{ color: 'var(--gold-primary)' }}>{currentClient.id}</strong></span>
                                &bull; <span>Total Visits: <strong>{currentClient.visitsCount || 1}</strong></span>
                                &bull; <span>Loyalty Balance: <strong style={{ color: 'var(--emerald-accent)' }}>{currentClient.loyaltyPoints || 0} pts</strong></span>
                                {currentClient.lastVisit && (
                                  <>
                                    &bull; <span>Last Visit: <strong style={{ color: 'var(--text-primary)' }}>{currentClient.lastVisit}</strong></span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Customer Details Grid: Phone, Email, Address, Preferences */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: '0.78rem' }}>
                          <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600 }}>Phone Number</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Phone size={12} color="var(--gold-primary)" />
                              {currentClient.phone}
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <Mail size={12} color="var(--cyan-accent)" />
                              {currentClient.email || 'N/A'}
                            </div>
                          </div>

                          <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600 }}>Residential Address</div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <MapPin size={12} color="var(--ruby-accent)" />
                              {currentClient.address || 'Beverly Hills, CA'}
                            </div>
                          </div>

                          {(currentClient.hairType || currentClient.skinType || currentClient.allergies || currentClient.preferences) && (
                            <div style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600 }}>Client Preferences / Notes</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Sparkles size={11} color="var(--gold-primary)" />
                                {[currentClient.hairType, currentClient.skinType, currentClient.allergies, currentClient.preferences].filter(Boolean).join(' • ')}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Service Mode Selector */}
            <div className="form-group">
              <label className="form-label">Service Booking Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  type="button"
                  className={`btn ${serviceType === 'In-Salon' ? 'btn-gold' : 'btn-secondary'}`}
                  onClick={() => setServiceType('In-Salon')}
                >
                  <Building size={14} /> In-Salon Suite Booking
                </button>
                <button
                  type="button"
                  className={`btn ${serviceType === 'Home Service' ? 'btn-gold' : 'btn-secondary'}`}
                  onClick={() => setServiceType('Home Service')}
                >
                  <Home size={14} /> Home Service / Mobile Concierge
                </button>
              </div>
            </div>

            {serviceType === 'Home Service' && (
              <div className="form-group" style={{ background: 'rgba(212, 175, 55, 0.08)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-gold)' }}>
                <label className="form-label">Client Residential / Estate Address *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 320 Sunset Plaza, Penthouse 4B, West Hollywood"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  required
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', marginTop: 6 }}>
                  * Concierge dispatch fee: {settings.currency}25.00 + Travel Distance Surcharge ({settings.currency}{settings.travelChargePerKm}/km) automatically calculated
                </div>
              </div>
            )}

            {/* Multi-Service Selection with Category Tabs & Search Bar */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Select Services <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(One or multiple)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', background: selectedServiceIds.length > 0 ? 'var(--gold-subtle)' : 'rgba(255,255,255,0.06)', color: selectedServiceIds.length > 0 ? 'var(--gold-primary)' : 'var(--text-muted)', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>
                    {selectedServiceIds.length > 0 ? `${selectedServiceIds.length} Selected (${totalDuration} mins)` : '0 Selected'}
                  </span>
                  {selectedServiceIds.length > 0 && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--ruby-accent)', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                      onClick={() => setSelectedServiceIds([])}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Service Search Bar & Search Button */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search
                    size={14}
                    style={{
                      position: 'absolute',
                      left: 11,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--gold-primary)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{
                      paddingLeft: 34,
                      paddingRight: serviceSearch ? 30 : 12,
                      paddingTop: 7,
                      paddingBottom: 7,
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    placeholder="Search treatments by name, procedure, skills, price..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                  />
                  {serviceSearch && (
                    <button
                      type="button"
                      onClick={() => setServiceSearch('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 3,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-gold"
                  style={{
                    padding: '7px 15px',
                    fontSize: '0.78rem',
                    gap: 6,
                    borderRadius: 'var(--radius-sm)',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => {
                    // Keep focus and confirm search
                  }}
                >
                  <Search size={13} />
                  <span>Search</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  overflowX: 'auto',
                  paddingBottom: 8,
                  marginBottom: 10,
                  alignItems: 'center'
                }}
              >
                {['ALL', ...(serviceCategories || [
                  'Hair Care',
                  'Skin Care',
                  'Makeup',
                  'Nails',
                  'Grooming',
                  'Spa',
                  'Bridal',
                  'Packages'
                ])].map((cat) => {
                  const isSelected = selectedCategoryTab === cat;
                  const catServices = cat === 'ALL' ? services : services.filter(s => s.category === cat);
                  const q = serviceSearch.trim().toLowerCase();
                  const matchCount = q
                    ? catServices.filter(s =>
                        s.name?.toLowerCase().includes(q) ||
                        s.category?.toLowerCase().includes(q) ||
                        s.description?.toLowerCase().includes(q) ||
                        s.id?.toLowerCase().includes(q) ||
                        String(s.price).includes(q) ||
                        String(s.durationMinutes).includes(q)
                      ).length
                    : catServices.length;

                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`btn ${isSelected ? 'btn-gold' : 'btn-secondary'}`}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.74rem',
                        whiteSpace: 'nowrap',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s',
                        opacity: q && matchCount === 0 ? 0.5 : 1
                      }}
                      onClick={() => setSelectedCategoryTab(cat)}
                    >
                      <span>{cat}</span>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          padding: '1px 5px',
                          borderRadius: 10,
                          background: isSelected ? 'rgba(0,0,0,0.25)' : 'rgba(212, 175, 55, 0.15)',
                          color: isSelected ? '#fff' : 'var(--gold-primary)',
                          fontWeight: 700
                        }}
                      >
                        {matchCount}
                      </span>
                    </button>
                  );
                })}

                {/* Add New Category Option at End of List */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.74rem',
                    borderRadius: 'var(--radius-full)',
                    borderColor: 'var(--gold-primary)',
                    color: 'var(--gold-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => {
                    const newCat = window.prompt('Enter new service category name:');
                    if (newCat && newCat.trim()) {
                      addServiceCategory(newCat.trim());
                      setSelectedCategoryTab(newCat.trim());
                    }
                  }}
                >
                  <Plus size={12} /> Add Category
                </button>
              </div>

              {/* Service Cards List */}
              {(() => {
                const q = serviceSearch.trim().toLowerCase();
                const categoryFiltered = selectedCategoryTab === 'ALL'
                  ? services
                  : services.filter(s => s.category === selectedCategoryTab);

                const finalFiltered = q
                  ? categoryFiltered.filter(srv =>
                      srv.name?.toLowerCase().includes(q) ||
                      srv.category?.toLowerCase().includes(q) ||
                      srv.description?.toLowerCase().includes(q) ||
                      srv.id?.toLowerCase().includes(q) ||
                      String(srv.price).includes(q) ||
                      String(srv.durationMinutes).includes(q) ||
                      (Array.isArray(srv.requiredSkills)
                        ? srv.requiredSkills.some(sk => sk.toLowerCase().includes(q))
                        : srv.requiredSkills?.toLowerCase().includes(q))
                    )
                  : categoryFiltered;

                const allMatchesCount = q
                  ? services.filter(srv =>
                      srv.name?.toLowerCase().includes(q) ||
                      srv.category?.toLowerCase().includes(q) ||
                      srv.description?.toLowerCase().includes(q) ||
                      srv.id?.toLowerCase().includes(q) ||
                      String(srv.price).includes(q) ||
                      String(srv.durationMinutes).includes(q)
                    ).length
                  : services.length;

                return (
                  <div
                    style={{
                      maxHeight: 220,
                      overflowY: 'auto',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px',
                      background: 'rgba(0,0,0,0.1)'
                    }}
                  >
                    {finalFiltered.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)' }}>
                        <Search size={22} style={{ color: 'var(--gold-primary)', margin: '0 auto 8px', opacity: 0.6 }} />
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>
                          No services found matching &ldquo;{serviceSearch}&rdquo;
                        </div>
                        {selectedCategoryTab !== 'ALL' && allMatchesCount > 0 ? (
                          <div style={{ marginTop: 8 }}>
                            <span style={{ fontSize: '0.74rem' }}>
                              Found {allMatchesCount} result{allMatchesCount !== 1 ? 's' : ''} in other categories.
                            </span>
                            <div style={{ marginTop: 8 }}>
                              <button
                                type="button"
                                className="btn btn-gold"
                                style={{ padding: '4px 12px', fontSize: '0.72rem' }}
                                onClick={() => setSelectedCategoryTab('ALL')}
                              >
                                Search in ALL Categories
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ marginTop: 8, padding: '4px 12px', fontSize: '0.72rem' }}
                            onClick={() => {
                              setServiceSearch('');
                              setSelectedCategoryTab('ALL');
                            }}
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    ) : (
                      finalFiltered.map((srv) => {
                        const isChecked = selectedServiceIds.includes(srv.id);
                        return (
                          <div
                            key={srv.id}
                            onClick={() => handleToggleService(srv.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-xs)',
                              marginBottom: 4,
                              cursor: 'pointer',
                              background: isChecked ? 'var(--gold-subtle)' : 'var(--bg-elevated)',
                              border: isChecked ? '1px solid var(--gold-primary)' : '1px solid transparent',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                style={{ accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{srv.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  {srv.category} &bull; {srv.durationMinutes} mins
                                </div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.88rem' }}>
                              {settings.currency}{srv.price}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Stylist Preference - Optional & Only Shown When Booking for Existing Client */}
            {!isNewCustomer && (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Employee / Stylist Preference <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Client Preferred Specialist
                  </span>
                </div>
                <select
                  className="form-select"
                  value={selectedStylistId}
                  onChange={(e) => setSelectedStylistId(e.target.value)}
                >
                  <option value="">No Preference (Any Available Specialist / Stylist)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} &bull; {emp.designation || emp.role} ({emp.branch || 'Beverly Hills'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="form-group">
              <div>
                <label className="form-label">Appointment Date *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>
              {/* Slot Time Picker Field */}
              <div ref={timePickerRef} style={{ position: 'relative' }}>
                <label className="form-label">Slot Time *</label>
                <div
                  style={{
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                >
                  <Clock
                    size={15}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--gold-primary)',
                      pointerEvents: 'none'
                    }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{
                      paddingLeft: 36,
                      paddingRight: 32,
                      cursor: 'pointer',
                      fontWeight: 600,
                      letterSpacing: '0.04em'
                    }}
                    placeholder="e.g. 02:00 PM"
                    required
                    value={bookingTime}
                    readOnly
                  />
                  <ChevronDown
                    size={14}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: isTimePickerOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)',
                      color: 'var(--gold-primary)',
                      transition: 'transform 0.2s ease',
                      pointerEvents: 'none'
                    }}
                  />
                </div>

                {/* Luxury Interactive Time Picker Popover */}
                {isTimePickerOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: 320,
                      maxWidth: '92vw',
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--border-gold)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 1200,
                      padding: '16px',
                      animation: 'fadeIn 0.15s ease'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 700 }}>
                        <Clock size={14} color="var(--gold-primary)" />
                        <span>Select Booking Slot</span>
                      </div>
                      <span
                        className="badge badge-gold"
                        style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em' }}
                      >
                        {bookingTime}
                      </span>
                    </div>

                    {/* Interactive Hour : Minute : AM/PM Stepper */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                        background: 'var(--bg-elevated)',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: 14
                      }}
                    >
                      {/* Hour Selector */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', fontWeight: 700 }}>Hour</span>
                        <select
                          className="form-select"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            minWidth: 54,
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                          value={parseTime(bookingTime).hour}
                          onChange={(e) => updateTimePart('hour', e.target.value)}
                        >
                          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: 12 }}>:</span>

                      {/* Minute Selector */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', fontWeight: 700 }}>Min</span>
                        <select
                          className="form-select"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            minWidth: 54,
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                          value={parseTime(bookingTime).minute}
                          onChange={(e) => updateTimePart('minute', e.target.value)}
                        >
                          {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      {/* AM / PM Toggle */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', fontWeight: 700 }}>Period</span>
                        <div
                          style={{
                            display: 'flex',
                            borderRadius: 'var(--radius-xs)',
                            overflow: 'hidden',
                            border: '1px solid var(--border-gold)'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateTimePart('period', 'AM')}
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: 'none',
                              background: parseTime(bookingTime).period === 'AM' ? 'var(--gold-gradient)' : 'transparent',
                              color: parseTime(bookingTime).period === 'AM' ? '#0b0c10' : 'var(--text-secondary)'
                            }}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTimePart('period', 'PM')}
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: 'none',
                              background: parseTime(bookingTime).period === 'PM' ? 'var(--gold-gradient)' : 'transparent',
                              color: parseTime(bookingTime).period === 'PM' ? '#0b0c10' : 'var(--text-secondary)'
                            }}
                          >
                            PM
                          </button>
                        </div>
                      </div>

                      {/* Native Clock Trigger */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', fontWeight: 700 }}>Clock</span>
                        <input
                          type="time"
                          title="Click to use system time picker"
                          value={convert12to24(bookingTime)}
                          onChange={(e) => {
                            if (e.target.value) setBookingTime(convert24to12(e.target.value));
                          }}
                          style={{
                            width: 32,
                            height: 30,
                            padding: 0,
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-card)',
                            cursor: 'pointer',
                            opacity: 0.8
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Appointment Slots Grid */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                        Popular Salon Slots
                      </div>

                      {/* Morning Slots */}
                      <div style={{ fontSize: '0.66rem', color: 'var(--gold-primary)', fontWeight: 600, marginBottom: 4 }}>
                        Morning
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 8 }}>
                        {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'].map((slot) => {
                          const isSlotSelected = bookingTime.trim().toUpperCase() === slot.toUpperCase();
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setBookingTime(slot);
                              }}
                              style={{
                                padding: '5px 2px',
                                fontSize: '0.72rem',
                                fontWeight: isSlotSelected ? 800 : 500,
                                textAlign: 'center',
                                borderRadius: 'var(--radius-xs)',
                                border: isSlotSelected ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                                background: isSlotSelected ? 'var(--gold-gradient)' : 'var(--bg-elevated)',
                                color: isSlotSelected ? '#0b0c10' : 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>

                      {/* Afternoon Slots */}
                      <div style={{ fontSize: '0.66rem', color: 'var(--gold-primary)', fontWeight: 600, marginBottom: 4 }}>
                        Afternoon
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 8 }}>
                        {['12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'].map((slot) => {
                          const isSlotSelected = bookingTime.trim().toUpperCase() === slot.toUpperCase();
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setBookingTime(slot);
                              }}
                              style={{
                                padding: '5px 2px',
                                fontSize: '0.72rem',
                                fontWeight: isSlotSelected ? 800 : 500,
                                textAlign: 'center',
                                borderRadius: 'var(--radius-xs)',
                                border: isSlotSelected ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                                background: isSlotSelected ? 'var(--gold-gradient)' : 'var(--bg-elevated)',
                                color: isSlotSelected ? '#0b0c10' : 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>

                      {/* Evening Slots */}
                      <div style={{ fontSize: '0.66rem', color: 'var(--gold-primary)', fontWeight: 600, marginBottom: 4 }}>
                        Evening
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                        {['04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'].map((slot) => {
                          const isSlotSelected = bookingTime.trim().toUpperCase() === slot.toUpperCase();
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setBookingTime(slot);
                              }}
                              style={{
                                padding: '5px 2px',
                                fontSize: '0.72rem',
                                fontWeight: isSlotSelected ? 800 : 500,
                                textAlign: 'center',
                                borderRadius: 'var(--radius-xs)',
                                border: isSlotSelected ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                                background: isSlotSelected ? 'var(--gold-gradient)' : 'var(--bg-elevated)',
                                color: isSlotSelected ? '#0b0c10' : 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Done / Confirm Slot Button */}
                    <button
                      type="button"
                      className="btn btn-gold"
                      style={{
                        width: '100%',
                        padding: '8px 0',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        gap: 6
                      }}
                      onClick={() => setIsTimePickerOpen(false)}
                    >
                      <Check size={14} /> Confirm Slot Time ({bookingTime})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* In-Salon Station (Only if In-Salon) */}
            {serviceType === 'In-Salon' && (
              <div className="form-group">
                <label className="form-label">Station / Chair Preference</label>
                <select
                  className="form-select"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                >
                  <option value="Chair #1 (Color Master)">Chair #1 (Color Master)</option>
                  <option value="Private Spa Suite 1">Private Spa Suite 1</option>
                  <option value="Nail Lounge Station 2">Nail Lounge Station 2</option>
                  <option value="Gentlemen Suite Chair #2">Gentlemen Suite Chair #2</option>
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Guest Notes / Requests</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Hospitality preferences, chemical sensitivities, or gate codes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Estimated Total Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-elevated)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 20
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Total Estimated Booking Amount:
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                  {settings.currency}{totalPrice.toFixed(2)}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {chosenServices.length} service(s) &bull; {totalDuration} minutes total
              </div>
            </div>

            {/* Submit / Cancel Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                {selectedServiceIds.length === 0 ? (
                  <span style={{ fontSize: '0.74rem', color: 'var(--amber-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={13} /> Select at least 1 treatment above to enable booking
                  </span>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: 'var(--emerald-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> {selectedServiceIds.length} service(s) selected &bull; Total: {settings.currency}{totalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={selectedServiceIds.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <CheckCircle2 size={16} /> Complete Booking & Open Status Page
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
