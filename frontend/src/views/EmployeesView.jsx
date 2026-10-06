import React, { useState, useRef, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  DollarSign,
  Percent,
  Clock,
  Home,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Edit2,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  Building,
  Award,
  Filter,
  Eye,
  Upload,
  Camera,
  LayoutGrid,
  List,
  ChevronDown,
  UserCheck,
  CreditCard
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
];

export const EmployeesView = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    branches,
    services,
    settings,
    globalSearch,
    setActiveView
  } = useSalon();

  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL'); // 'ALL' | 'home-eligible' | 'in-salon'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeProfileModal, setActiveProfileModal] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isShiftPickerOpen, setIsShiftPickerOpen] = useState(false);
  const shiftPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shiftPickerRef.current && !shiftPickerRef.current.contains(e.target)) {
        setIsShiftPickerOpen(false);
      }
    };
    if (isShiftPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShiftPickerOpen]);

  const parseShift = (shiftStr) => {
    if (!shiftStr || !shiftStr.includes('-')) {
      return {
        startHour: '10',
        startMin: '00',
        startPeriod: 'AM',
        endHour: '07',
        endMin: '00',
        endPeriod: 'PM'
      };
    }
    const parts = shiftStr.split('-').map(s => s.trim());
    const parsePart = (timePart, defaultH, defaultM, defaultP) => {
      const match = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        return {
          h: match[1].padStart(2, '0'),
          m: match[2],
          p: match[3].toUpperCase()
        };
      }
      return { h: defaultH, m: defaultM, p: defaultP };
    };

    const start = parsePart(parts[0] || '', '10', '00', 'AM');
    const end = parsePart(parts[1] || '', '07', '00', 'PM');

    return {
      startHour: start.h,
      startMin: start.m,
      startPeriod: start.p,
      endHour: end.h,
      endMin: end.m,
      endPeriod: end.p
    };
  };

  const updateShiftTime = (field, value) => {
    const current = parseShift(formData.workingHours);
    const updated = { ...current, [field]: value };
    const newShift = `${updated.startHour}:${updated.startMin} ${updated.startPeriod} - ${updated.endHour}:${updated.endMin} ${updated.endPeriod}`;
    setFormData(prev => ({ ...prev, workingHours: newShift }));
  };

  const SHIFT_PRESETS = [
    { label: 'Morning Shift', time: '09:00 AM - 06:00 PM' },
    { label: 'Standard Day', time: '10:00 AM - 07:00 PM' },
    { label: 'Mid-Day Shift', time: '11:00 AM - 08:00 PM' },
    { label: 'Evening VIP', time: '12:00 PM - 09:00 PM' },
    { label: 'Early Bird', time: '08:00 AM - 04:00 PM' },
    { label: 'Night Shift', time: '02:00 PM - 10:00 PM' }
  ];

  // Form State for Onboarding / Editing Staff
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Female',
    phone: '',
    email: '',
    address: 'Beverly Hills, CA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    joiningDate: new Date().toISOString().split('T')[0],
    designation: 'Senior Master Stylist',
    department: 'Hair & Styling',
    specialization: 'Master Colorist & Balayage Architect',
    skills: 'Balayage, Keratin Smoothing, Hair Botox, Precision Cutting',
    experience: '6 Years',
    salary: 4200,
    commission: 18,
    branch: 'Beverly Hills Flagship',
    workingHours: '10:00 AM - 07:00 PM',
    homeServiceEligible: true,
    status: 'Active'
  });

  const departments = ['ALL', 'Hair & Styling', 'Aesthetics & Spa', 'Nail & Lash Lounge', 'Gentlemen Grooming', 'Front Desk & Operations', 'Bridal & Mobile Dispatch'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const matchesBranch = selectedBranch === 'ALL' || emp.branch === selectedBranch;
    const matchesAvailability =
      selectedAvailability === 'ALL' ||
      (selectedAvailability === 'home-eligible' && emp.homeServiceEligible) ||
      (selectedAvailability === 'in-salon' && !emp.homeServiceEligible);

    const matchesSearch =
      !globalSearch ||
      emp.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      emp.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (emp.designation && emp.designation.toLowerCase().includes(globalSearch.toLowerCase())) ||
      (emp.skills && Array.isArray(emp.skills) && emp.skills.some(s => s.toLowerCase().includes(globalSearch.toLowerCase()))) ||
      (emp.phone && emp.phone.includes(globalSearch));

    return matchesDept && matchesBranch && matchesAvailability && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      gender: 'Female',
      phone: '',
      email: '',
      address: 'Beverly Hills, CA',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      joiningDate: new Date().toISOString().split('T')[0],
      designation: 'Senior Master Stylist',
      department: 'Hair & Styling',
      specialization: 'Master Colorist & Balayage Architect',
      skills: 'Balayage, Keratin Smoothing, Hair Botox, Precision Cutting',
      experience: '6 Years',
      salary: 4200,
      commission: 18,
      branch: branches[0]?.name || 'Beverly Hills Flagship',
      workingHours: '10:00 AM - 07:00 PM',
      homeServiceEligible: true,
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingStaff(emp);
    setFormData({
      name: emp.name || '',
      gender: emp.gender || 'Female',
      phone: emp.phone || '',
      email: emp.email || '',
      address: emp.address || '',
      avatar: emp.avatar || '',
      joiningDate: emp.joiningDate || '',
      designation: emp.designation || emp.role || '',
      department: emp.department || 'Hair & Styling',
      specialization: emp.specialization || '',
      skills: Array.isArray(emp.skills) ? emp.skills.join(', ') : (emp.skills || ''),
      experience: emp.experience || '5 Years',
      salary: emp.salary || emp.baseSalary || 4000,
      commission: emp.commission || emp.commissionRate || 15,
      branch: emp.branch || 'Beverly Hills Flagship',
      workingHours: emp.workingHours || emp.shift || '10:00 AM - 07:00 PM',
      homeServiceEligible: emp.homeServiceEligible ?? true,
      status: emp.status || 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please select a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, avatar: event.target.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedSkills = typeof formData.skills === 'string'
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : formData.skills;

    const payload = {
      ...formData,
      skills: formattedSkills,
      salary: Number(formData.salary),
      baseSalary: Number(formData.salary),
      commission: Number(formData.commission),
      commissionRate: Number(formData.commission),
      role: formData.designation,
      shift: formData.workingHours
    };

    if (editingStaff) {
      updateEmployee(editingStaff.id, payload);
      if (activeProfileModal?.id === editingStaff.id) {
        setActiveProfileModal({ ...activeProfileModal, ...payload });
      }
    } else {
      addEmployee(payload);
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete employee record for ${name}?`)) {
      deleteEmployee(id);
      if (activeProfileModal?.id === id) setActiveProfileModal(null);
    }
  };

  const handleStatusToggle = (empId, newStatus) => {
    updateEmployee(empId, { status: newStatus });
    if (activeProfileModal?.id === empId) {
      setActiveProfileModal(prev => ({ ...prev, status: newStatus }));
    }
  };

  // Matched Services for an employee based on skills
  const getEligibleServicesForStaff = (emp) => {
    if (!emp) return [];
    const empSkills = Array.isArray(emp.skills) ? emp.skills.map(s => s.toLowerCase()) : [];
    return services.filter(srv => {
      if (srv.eligibleStylists && srv.eligibleStylists.includes(emp.id)) return true;
      const srvName = srv.name.toLowerCase();
      const srvCat = srv.category.toLowerCase();
      return empSkills.some(skill => srvName.includes(skill) || srvCat.includes(skill));
    });
  };

  // Total Summary Calculations
  const totalEmployeesCount = employees.length;
  const activeStaffCount = employees.filter(e => e.status === 'Active').length;
  const onBreakStaffCount = employees.filter(e => e.status === 'On Break').length;
  const homeServiceEligibleCount = employees.filter(e => e.homeServiceEligible).length;
  const totalMonthlyPayroll = employees.reduce((sum, e) => sum + (Number(e.salary || e.baseSalary) || 0), 0);
  const totalFilteredPayroll = filteredEmployees.reduce((sum, e) => sum + (Number(e.salary || e.baseSalary) || 0), 0);

  return (
    <div className="view-wrapper">
      {/* Top Integrated Submenu Switcher Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-elevated)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-gold)',
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingRight: 6 }}>
          👤 Employees:
        </div>

        {/* Submenu 1: Employee Management (Active) */}
        <button
          type="button"
          className="btn btn-gold"
          style={{
            padding: '6px 14px',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.35)'
          }}
        >
          <span>👤</span>
          <span>Employee</span>
        </button>

        {/* Submenu 2: Employee Attendance */}
        <button
          type="button"
          onClick={() => setActiveView('attendance')}
          className="btn btn-secondary"
          style={{
            padding: '6px 14px',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>🕒</span>
          <span>Employee Attendance</span>
        </button>

        {/* Submenu 3: Salary Slip of Attendance */}
        <button
          type="button"
          onClick={() => setActiveView('payroll')}
          className="btn btn-secondary"
          style={{
            padding: '6px 14px',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>💳</span>
          <span>Salary Slip of Attendance</span>
        </button>
      </div>

      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Employee <span className="gold-text-gradient">Management</span>
          </h2>
          <p>View all employee details, credentials, department allocations & onboard new personnel</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Switcher: List View / Cards Grid */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 4, border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setViewMode('list')}
            >
              <List size={14} /> List View
            </button>
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={14} /> Cards Grid
            </button>
          </div>

          <button className="btn btn-gold" onClick={handleOpenAdd}>
            <Plus size={16} /> Onboard New Employee
          </button>
        </div>
      </div>

      {/* Total Staff KPI Metrics Scoreboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
        {/* 1. Total Staff */}
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Staff Headcount</span>
            <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-primary)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{totalEmployeesCount} Personnel</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--emerald-accent)', marginTop: 4 }}>
            {activeStaffCount} Active on duty &bull; {onBreakStaffCount} On Break
          </div>
        </div>

        {/* 2. Total Monthly Payroll */}
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Monthly Payroll</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-accent)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="stat-value">{settings.currency}{totalMonthlyPayroll.toLocaleString()}/m</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Base salary allocation across all branches
          </div>
        </div>

        {/* 3. Home Service VIP Fleet */}
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Home Service Fleet</span>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-accent)' }}>
              <Home size={18} />
            </div>
          </div>
          <div className="stat-value">{homeServiceEligibleCount} Stylists</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--cyan-accent)', marginTop: 4 }}>
            Dispatched for mobile VIP concierge
          </div>
        </div>

        {/* 4. Active Branches & Departments */}
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Salon Branches</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber-accent)' }}>
              <Building size={18} />
            </div>
          </div>
          <div className="stat-value">{branches.length} Locations</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Across {departments.length - 1} specialist departments
          </div>
        </div>
      </div>

      {/* Filter Matrix Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap', alignItems: 'center', background: 'var(--bg-card)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        {/* Department Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Dept:</span>
          {departments.map(dept => (
            <button
              key={dept}
              className={`btn ${selectedDept === dept ? 'btn-gold' : 'btn-secondary'}`}
              style={{ fontSize: '0.74rem', padding: '5px 12px' }}
              onClick={() => setSelectedDept(dept)}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>

        <div style={{ height: 20, width: 1, background: 'var(--border-subtle)', margin: '0 6px' }} />

        {/* Branch Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Branch:</span>
          <select
            className="form-select"
            style={{ fontSize: '0.75rem', padding: '4px 10px', minWidth: 160 }}
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="ALL">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Home Service Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Availability:</span>
          <select
            className="form-select"
            style={{ fontSize: '0.75rem', padding: '4px 10px', minWidth: 170 }}
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
          >
            <option value="ALL">All Availabilities</option>
            <option value="home-eligible">Home Service Eligible</option>
            <option value="in-salon">In-Salon Only</option>
          </select>
        </div>

        {/* Total Filtered Badge */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '5px 12px', fontWeight: 600 }}>
            Total: {filteredEmployees.length} of {totalEmployeesCount} Staff
          </span>
        </div>
      </div>

      {/* Employee List View or Cards Grid View */}
      {viewMode === 'list' ? (
        <div className="luxe-table-container" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="luxe-table" style={{ minWidth: 1250, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 200, whiteSpace: 'nowrap' }}>Employee / Staff</th>
                <th style={{ minWidth: 160, whiteSpace: 'nowrap' }}>Role & Department</th>
                <th style={{ minWidth: 170, whiteSpace: 'nowrap' }}>Branch & Allocation</th>
                <th style={{ minWidth: 155, whiteSpace: 'nowrap' }}>Shift & Hours</th>
                <th style={{ minWidth: 180, whiteSpace: 'nowrap' }}>Contact</th>
                <th style={{ minWidth: 200 }}>Skills & Services</th>
                <th style={{ minWidth: 140, whiteSpace: 'nowrap' }}>Compensation</th>
                <th style={{ minWidth: 100, whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: 160, whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No staff members match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const eligibleCount = getEligibleServicesForStaff(emp).length;
                  return (
                    <tr key={emp.id}>
                      {/* 1. Employee / Staff */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid var(--gold-primary)',
                              flexShrink: 0
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                              {emp.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              ID: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{emp.id}</span>
                              {emp.gender && ` • ${emp.gender}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role & Department */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: 'var(--gold-primary)', fontSize: '0.85rem' }}>
                          {emp.designation || emp.role}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {emp.department}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Exp: {emp.experience || '5+ Years'}
                        </div>
                      </td>

                      {/* 3. Branch & Allocation */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          <Building size={12} color="var(--gold-primary)" />
                          <span>{emp.branch || 'Beverly Hills Flagship'}</span>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          {emp.homeServiceEligible ? (
                            <span className="badge badge-gold" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Home size={10} /> Home-Service Eligible
                            </span>
                          ) : (
                            <span className="badge badge-secondary" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              In-Salon Only
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Shift & Hours */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <Clock size={12} color="var(--gold-primary)" />
                          <span>{emp.workingHours || emp.shift || '10:00 AM - 07:00 PM'}</span>
                        </div>
                      </td>

                      {/* 5. Contact */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: '0.78rem' }}>
                          <a href={`tel:${emp.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                            <Phone size={11} color="var(--gold-primary)" /> {emp.phone}
                          </a>
                          <a href={`mailto:${emp.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none' }}>
                            <Mail size={11} color="var(--gold-primary)" /> {emp.email}
                          </a>
                        </div>
                      </td>

                      {/* 6. Skills & Services */}
                      <td style={{ minWidth: 200 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                          {Array.isArray(emp.skills) && emp.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: '0.65rem',
                                color: 'var(--text-secondary)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                          {Array.isArray(emp.skills) && emp.skills.length > 3 && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--gold-primary)', fontWeight: 600, alignSelf: 'center' }}>
                              +{emp.skills.length - 3} more
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{eligibleCount}</strong> Matched Services
                        </div>
                      </td>

                      {/* 7. Compensation */}
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
                          {settings.currency}{emp.salary || emp.baseSalary}/m
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--cyan-accent)', fontWeight: 600 }}>
                          {emp.commission || emp.commissionRate}% Commission
                        </div>
                      </td>

                      {/* 8. Status */}
                      <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <span
                          className={`badge ${
                            emp.status === 'Active'
                              ? 'badge-emerald'
                              : emp.status === 'On Break'
                              ? 'badge-amber'
                              : 'badge-ruby'
                          }`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {emp.status}
                        </span>
                      </td>

                      {/* 9. Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            className="btn btn-gold"
                            style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
                            title="View Dossier & Service Assignment"
                            onClick={() => setActiveProfileModal(emp)}
                          >
                            <Eye size={12} /> Dossier
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: 28, height: 28, flexShrink: 0 }}
                            title="Edit Employee Information"
                            onClick={() => handleOpenEdit(emp)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon"
                            style={{ width: 28, height: 28, color: 'var(--ruby-accent)', flexShrink: 0 }}
                            title="Delete Employee"
                            onClick={() => handleDelete(emp.id, emp.name)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Total Summary Footer Row */}
            <tfoot>
              <tr style={{ background: 'var(--bg-elevated)', borderTop: '2px solid var(--border-subtle)', fontWeight: 600 }}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--gold-primary)', fontWeight: 700 }}>
                  TOTAL: {filteredEmployees.length} Staff
                </td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {departments.length - 1} Departments
                </td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {branches.length} Branches Active
                </td>
                <td colSpan={2} style={{ whiteSpace: 'nowrap', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {filteredEmployees.filter(e => e.status === 'Active').length} Active Staff on Duty
                </td>
                <td style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {filteredEmployees.reduce((sum, emp) => sum + getEligibleServicesForStaff(emp).length, 0)} Total Matched Capabilities
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                    {settings.currency}{totalFilteredPayroll.toLocaleString()}/m
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--cyan-accent)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Base Payroll
                  </div>
                </td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                    {filteredEmployees.filter(e => e.status === 'Active').length} Active
                  </span>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {filteredEmployees.length} Shown
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* Employees Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {filteredEmployees.map((emp) => {
            const eligibleCount = getEligibleServicesForStaff(emp).length;
            return (
              <div key={emp.id} className="luxe-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Top Profile Header */}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>{emp.name}</h3>
                        <span className={`badge ${emp.status === 'Active' ? 'badge-emerald' : emp.status === 'On Break' ? 'badge-amber' : 'badge-ruby'}`} style={{ fontSize: '0.65rem' }}>
                          {emp.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                        {emp.designation || emp.role}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        ID: <strong style={{ color: 'var(--text-secondary)' }}>{emp.id}</strong> &bull; {emp.department}
                      </div>
                    </div>
                  </div>

                  {/* Key Tags (Branch, Home Service, Experience) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <span className="badge badge-gray" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building size={10} color="var(--gold-primary)" /> {emp.branch || 'Beverly Hills Flagship'}
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Award size={10} color="var(--amber-accent)" /> Exp: {emp.experience || '5+ Years'}
                    </span>
                    {emp.homeServiceEligible ? (
                      <span className="badge badge-gold" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Home size={10} /> Home-Service Eligible
                      </span>
                    ) : (
                      <span className="badge badge-secondary" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        In-Salon Only
                      </span>
                    )}
                  </div>

                  {/* Skills Matrix Pill Row */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                      Skills & Service Competencies:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {Array.isArray(emp.skills) && emp.skills.map((skill, idx) => (
                        <span key={idx} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: 4, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Financials & Working Hours Card */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: 'var(--bg-elevated)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SALARY</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
                        {settings.currency}{emp.salary || emp.baseSalary}/m
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>COMMISSION</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--cyan-accent)' }}>
                        {emp.commission || emp.commissionRate}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SERVICES</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                        {eligibleCount} Matched
                      </div>
                    </div>
                  </div>

                  {/* Contact & Hours */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.15)', padding: '8px 10px', borderRadius: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} color="var(--gold-primary)" /> Working Hours: <strong>{emp.workingHours || emp.shift || '10:00 AM - 07:00 PM'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={12} color="var(--gold-primary)" /> {emp.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={12} color="var(--gold-primary)" /> {emp.email}
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="btn btn-gold"
                    style={{ fontSize: '0.74rem', padding: '5px 12px' }}
                    onClick={() => setActiveProfileModal(emp)}
                  >
                    <Eye size={12} /> Dossier & Assignment
                  </button>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ width: 30, height: 30 }}
                      title="Edit Employee Information"
                      onClick={() => handleOpenEdit(emp)}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn btn-secondary btn-icon"
                      style={{ width: 30, height: 30, color: 'var(--ruby-accent)' }}
                      title="Delete Employee"
                      onClick={() => handleDelete(emp.id, emp.name)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMPLOYEE DOSSIER & SKILLS ASSIGNMENT MODAL (1. Employee Information & 2. Skills & Assignment) */}
      {activeProfileModal && (
        <div className="modal-overlay" onClick={() => setActiveProfileModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 780, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={activeProfileModal.avatar}
                  alt=""
                  style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid var(--gold-primary)', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.3rem' }}>{activeProfileModal.name}</h3>
                    <span className={`badge ${activeProfileModal.status === 'Active' ? 'badge-emerald' : 'badge-amber'}`}>
                      {activeProfileModal.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                    {activeProfileModal.designation} &bull; {activeProfileModal.department}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Employee ID: <strong>{activeProfileModal.id}</strong> &bull; Joined: {activeProfileModal.joiningDate || '2022-03-15'}
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setActiveProfileModal(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* SECTION 1: EMPLOYEE INFORMATION OVERVIEW */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Briefcase size={14} /> 1. Comprehensive Employee Profile
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.82rem' }}>
                  <div style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 6 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Gender & Experience</div>
                    <strong>{activeProfileModal.gender || 'Female'} &bull; {activeProfileModal.experience || '6 Years'}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 6 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Base Salary & Commission</div>
                    <strong>{settings.currency}{activeProfileModal.salary || activeProfileModal.baseSalary}/mo &bull; {activeProfileModal.commission || activeProfileModal.commissionRate}%</strong>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 6 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Allocated Branch</div>
                    <strong style={{ color: 'var(--gold-primary)' }}>{activeProfileModal.branch || 'Beverly Hills Flagship'}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 6 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Phone Number</div>
                    <strong>{activeProfileModal.phone}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 6 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Official Email</div>
                    <strong>{activeProfileModal.email}</strong>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 6 }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Working Hours Shift</div>
                    <strong>{activeProfileModal.workingHours || activeProfileModal.shift}</strong>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: 10, borderRadius: 6, marginTop: 10, fontSize: '0.82rem' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Residential Address:</div>
                  <strong>{activeProfileModal.address || 'Beverly Hills, CA'}</strong>
                </div>
              </div>

              {/* SECTION 2: SKILLS & SERVICE ASSIGNMENT MATRIX */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} /> 2. Skills & Assignment Eligibility Engine
                </h4>

                {/* Qualifications & Home Service Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>HOME-SERVICE ASSIGNMENT ELIGIBILITY:</div>
                    {activeProfileModal.homeServiceEligible ? (
                      <div style={{ color: 'var(--emerald-accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} /> Eligible for Mobile Home-Service VIP Dispatch
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                        <XCircle size={16} /> Restricted to On-Premises Salon Suites
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>DUTY STATUS CONTROL:</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['Active', 'On Break', 'On Leave'].map(st => (
                        <button
                          key={st}
                          className={`btn ${activeProfileModal.status === st ? 'btn-gold' : 'btn-secondary'}`}
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          onClick={() => handleStatusToggle(activeProfileModal.id, st)}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Service Match Ledger */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>
                    Auto-Assigned Salon & Spa Services for Booking Matrix ({getEligibleServicesForStaff(activeProfileModal).length} matched):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                    {getEligibleServicesForStaff(activeProfileModal).map(srv => (
                      <div key={srv.id} style={{ background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                        <div>
                          <strong>{srv.name}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{srv.category} &bull; {srv.durationMinutes} mins</div>
                        </div>
                        <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>{settings.currency}{srv.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <button className="btn btn-secondary" onClick={() => handleOpenEdit(activeProfileModal)}>
                  <Edit2 size={14} /> Edit Information
                </button>
                <button className="btn btn-gold" onClick={() => setActiveProfileModal(null)}>
                  Done & Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARD / EDIT EMPLOYEE MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingStaff ? `Edit Employee: ${editingStaff.name}` : 'Onboard New Employee'}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Staff Profile Photo & Avatar Upload Section */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                {/* Image Preview with Camera Badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt="Staff Avatar Preview"
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--gold-primary)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                      background: 'var(--bg-card)'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: 'var(--gold-primary)',
                      color: '#000',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                    }}
                  >
                    <Camera size={12} />
                  </div>
                </div>

                {/* Upload Buttons & URL Input */}
                <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ margin: 0, fontSize: '0.82rem', color: 'var(--gold-primary)', fontWeight: 600 }}>
                      Staff Profile Image / Photo
                    </label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Local File or Image URL
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* File Upload Trigger */}
                    <label
                      className="btn btn-secondary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        borderColor: 'var(--gold-primary)',
                        color: 'var(--gold-primary)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Upload size={13} />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageFileUpload}
                      />
                    </label>

                    {/* URL Input */}
                    <input
                      type="url"
                      className="form-input"
                      placeholder="Paste image URL (https://...)"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      style={{ fontSize: '0.8rem', padding: '6px 10px', flex: 1, minWidth: 160 }}
                    />
                  </div>

                  {/* Preset Avatars Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Quick Presets:</span>
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar: url })}
                        style={{
                          border: formData.avatar === url ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                          borderRadius: '50%',
                          padding: 0,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          width: 24,
                          height: 24,
                          boxShadow: formData.avatar === url ? '0 0 6px var(--gold-primary)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={`Select Avatar Preset ${i + 1}`}
                      >
                        <img src={url} alt={`Preset ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 1: Name & Gender */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Julian Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Phone & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    required
                    placeholder="name@luminaluxe.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Address & Joining Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 4: Department & Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Hair & Styling">Hair & Styling</option>
                    <option value="Aesthetics & Spa">Aesthetics & Spa</option>
                    <option value="Nail & Lash Lounge">Nail & Lash Lounge</option>
                    <option value="Gentlemen Grooming">Gentlemen Grooming</option>
                    <option value="Front Desk & Operations">Front Desk & Operations</option>
                    <option value="Bridal & Mobile Dispatch">Bridal & Mobile Dispatch</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Designation / Role *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Senior Master Colorist"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 5: Branch & Working Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Assigned Branch *</label>
                  <select
                    className="form-select"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                {/* Working Hours Shift with Interactive Time Picker */}
                <div className="form-group" ref={shiftPickerRef} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>Working Hours Shift *</label>
                    <button
                      type="button"
                      onClick={() => setIsShiftPickerOpen(prev => !prev)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gold-primary)',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Clock size={12} /> {isShiftPickerOpen ? 'Close Picker' : 'Pick Time'}
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
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
                        paddingRight: 40,
                        cursor: 'pointer',
                        fontWeight: 600,
                        letterSpacing: '0.03em',
                        borderColor: isShiftPickerOpen ? 'var(--gold-primary)' : undefined,
                        boxShadow: isShiftPickerOpen ? '0 0 0 1px var(--gold-primary)' : undefined
                      }}
                      placeholder="10:00 AM - 07:00 PM"
                      value={formData.workingHours}
                      onClick={() => setIsShiftPickerOpen(true)}
                      onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setIsShiftPickerOpen(prev => !prev)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--gold-primary)'
                      }}
                      title="Open Time Picker"
                    >
                      <ChevronDown
                        size={15}
                        style={{
                          transform: isShiftPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      />
                    </button>
                  </div>

                  {/* Luxury Shift Time Picker Popover */}
                  {isShiftPickerOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        right: 0,
                        width: 360,
                        maxWidth: '92vw',
                        background: 'var(--bg-card)',
                        border: '1.5px solid var(--border-gold)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1500,
                        padding: '16px',
                        animation: 'fadeIn 0.15s ease'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Popover Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 700 }}>
                          <Clock size={15} color="var(--gold-primary)" />
                          <span>Shift Time Picker</span>
                        </div>
                        <span className="badge badge-gold" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                          {formData.workingHours || '10:00 AM - 07:00 PM'}
                        </span>
                      </div>

                      {/* 1. Quick Presets */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                          Shift Presets:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          {SHIFT_PRESETS.map((p) => {
                            const isSelected = formData.workingHours === p.time;
                            return (
                              <button
                                key={p.time}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, workingHours: p.time }))}
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: `1px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border-subtle)'}`,
                                  background: isSelected ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-elevated)',
                                  color: isSelected ? 'var(--gold-primary)' : 'var(--text-primary)',
                                  fontSize: '0.72rem',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}
                              >
                                <span style={{ fontWeight: isSelected ? 700 : 500 }}>{p.label}</span>
                                <span style={{ fontSize: '0.65rem', color: isSelected ? 'var(--gold-primary)' : 'var(--text-muted)' }}>{p.time}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Custom Time Picker: Start Time & End Time */}
                      {(() => {
                        const currentShift = parseShift(formData.workingHours);
                        return (
                          <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: 14 }}>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
                              Custom Shift Hours:
                            </div>

                            {/* Start Time Section */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Shift Start:</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <select
                                  className="form-select"
                                  style={{ padding: '3px 6px', fontSize: '0.82rem', fontWeight: 700, minWidth: 50, textAlign: 'center' }}
                                  value={currentShift.startHour}
                                  onChange={(e) => updateShiftTime('startHour', e.target.value)}
                                >
                                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                                    <option key={h} value={h}>{h}</option>
                                  ))}
                                </select>
                                <span style={{ fontWeight: 800, color: 'var(--gold-primary)' }}>:</span>
                                <select
                                  className="form-select"
                                  style={{ padding: '3px 6px', fontSize: '0.82rem', fontWeight: 700, minWidth: 50, textAlign: 'center' }}
                                  value={currentShift.startMin}
                                  onChange={(e) => updateShiftTime('startMin', e.target.value)}
                                >
                                  {['00','15','30','45'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => updateShiftTime('startPeriod', currentShift.startPeriod === 'AM' ? 'PM' : 'AM')}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: 4,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: '1px solid var(--border-gold)',
                                    background: 'var(--gold-primary)',
                                    color: '#000',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {currentShift.startPeriod}
                                </button>
                              </div>
                            </div>

                            {/* End Time Section */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Shift End:</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <select
                                  className="form-select"
                                  style={{ padding: '3px 6px', fontSize: '0.82rem', fontWeight: 700, minWidth: 50, textAlign: 'center' }}
                                  value={currentShift.endHour}
                                  onChange={(e) => updateShiftTime('endHour', e.target.value)}
                                >
                                  {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                                    <option key={h} value={h}>{h}</option>
                                  ))}
                                </select>
                                <span style={{ fontWeight: 800, color: 'var(--gold-primary)' }}>:</span>
                                <select
                                  className="form-select"
                                  style={{ padding: '3px 6px', fontSize: '0.82rem', fontWeight: 700, minWidth: 50, textAlign: 'center' }}
                                  value={currentShift.endMin}
                                  onChange={(e) => updateShiftTime('endMin', e.target.value)}
                                >
                                  {['00','15','30','45'].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => updateShiftTime('endPeriod', currentShift.endPeriod === 'AM' ? 'PM' : 'AM')}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: 4,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: '1px solid var(--border-gold)',
                                    background: 'var(--gold-primary)',
                                    color: '#000',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {currentShift.endPeriod}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 3. Footer / Confirm Button */}
                      <button
                        type="button"
                        className="btn btn-gold"
                        style={{ width: '100%', padding: '7px 14px', fontSize: '0.82rem', justifyContent: 'center' }}
                        onClick={() => setIsShiftPickerOpen(false)}
                      >
                        <CheckCircle2 size={14} /> Done ({formData.workingHours})
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 6: Salary, Commission & Experience */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Base Salary ({settings.currency}/mo)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.commission}
                    onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 7 Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 7: Skills & Specialization */}
              <div className="form-group">
                <label className="form-label">Skills (Comma-separated for auto-assignment)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Balayage, Keratin, 24K Gold Facial, Hot Towel Shave"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              {/* Row 8: Home Service Availability & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Home Service Availability</label>
                  <select
                    className="form-select"
                    value={formData.homeServiceEligible ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, homeServiceEligible: e.target.value === 'yes' })}
                  >
                    <option value="yes">Eligible for Home Service</option>
                    <option value="no">In-Salon Only</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Duty Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="On Break">On Break</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  {editingStaff ? 'Save Changes' : 'Onboard & Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
