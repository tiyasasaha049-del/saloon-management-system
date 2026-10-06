import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  DollarSign,
  UserCheck,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Edit2,
  Plus,
  Search,
  Filter,
  Download,
  Building,
  Check,
  X,
  TrendingUp,
  Percent,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wallet
} from 'lucide-react';

export const SalaryPayrollView = () => {
  const {
    employees,
    updateEmployee,
    branches,
    settings,
    setActiveView,
    appointments,
    attendance,
    currentUser,
    logAudit,
    addNotification
  } = useSalon();

  // Selected period
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Payroll Records State (synced with localStorage)
  const [payrollState, setPayrollState] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_payroll_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save changes to localStorage
  const savePayrollState = (newState) => {
    setPayrollState(newState);
    try {
      localStorage.setItem('lumina_payroll_records', JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save payroll:', e);
    }
  };

  // Modals
  const [editingStaffSalary, setEditingStaffSalary] = useState(null);
  const [salaryFormData, setSalaryFormData] = useState({
    baseSalary: 4000,
    commissionRate: 15,
    bonus: 0,
    deductions: 0,
    paymentMethod: 'Direct Bank Transfer',
    bankAccount: 'HDFC •••• 5821',
    upiId: '',
    paymentNotes: ''
  });

  const [activePayslipStaff, setActivePayslipStaff] = useState(null);
  const [isBulkPayConfirmOpen, setIsBulkPayConfirmOpen] = useState(false);

  // Departments list
  const departments = [
    'ALL',
    'Hair & Styling',
    'Aesthetics & Spa',
    'Nail & Lash Lounge',
    'Gentlemen Grooming',
    'Front Desk & Operations',
    'Bridal & Mobile Dispatch'
  ];

  // Helper to compute salary items for an employee
  const getStaffPayrollData = (emp) => {
    const override = payrollState[emp.id] || {};

    const baseSalary = Number(emp.baseSalary || emp.salary || 4000);
    const commissionRate = Number(emp.commissionRate || emp.commission || 15);
    
    // Estimate commissions from stylist's appointments
    const empBookings = appointments?.filter(a => a.stylistId === emp.id) || [];
    const completedRevenue = empBookings
      .filter(a => a.status === 'Completed' || a.status === 'Done')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    
    // Fallback if appointments just started: proportional to completedBookings count
    const estimatedCommissions = completedRevenue > 0
      ? Number(((completedRevenue * commissionRate) / 100).toFixed(2))
      : Number((((emp.completedBookings || 8) * 85 * commissionRate) / 100).toFixed(2));

    const bonus = Number(override.bonus ?? (emp.id === 'emp-1' ? 350 : emp.id === 'emp-2' ? 250 : 150));
    const deductions = Number(override.deductions ?? (emp.id === 'emp-3' ? 120 : 0));
    const netPayable = Math.max(0, baseSalary + estimatedCommissions + bonus - deductions);

    const paymentStatus = override.paymentStatus || (emp.id === 'emp-1' ? 'Paid' : 'Pending');
    const paymentMethod = override.paymentMethod || 'Direct Bank Transfer';
    const bankAccount = override.bankAccount || (emp.id === 'emp-1' ? 'Chase •••• 8921' : 'Bank of America •••• 3412');
    const upiId = override.upiId || `${emp.name.toLowerCase().replace(/\s+/g, '')}@axisbank`;
    const paidAt = override.paidAt || (paymentStatus === 'Paid' ? '2026-10-01 10:30 AM' : null);

    // Attendance metrics calculated from logs
    const empAttendance = attendance?.filter(a => a.employeeId === emp.id) || [];
    const loggedPresent = empAttendance.filter(a => a.status === 'Present' || a.status === 'On Home Service' || a.status === 'Late').length;
    const loggedLate = empAttendance.filter(a => a.status === 'Late').length;
    const loggedHours = empAttendance.reduce((sum, a) => sum + (Number(a.totalHours) || 0), 0);

    const totalWorkingDays = 26;
    const presentDays = override.presentDays ?? (loggedPresent > 0 ? loggedPresent : (emp.id === 'emp-3' ? 24 : 26));
    const lateDays = override.lateDays ?? (loggedLate > 0 ? loggedLate : (emp.id === 'emp-2' ? 2 : 1));
    const leaveDays = override.leaveDays ?? (emp.id === 'emp-3' ? 2 : 0);
    const hoursWorked = override.hoursWorked ?? (loggedHours > 0 ? loggedHours : (presentDays * 8));
    const attendancePercentage = Math.round((presentDays / totalWorkingDays) * 100);

    return {
      baseSalary,
      commissionRate,
      estimatedCommissions,
      bonus,
      deductions,
      netPayable,
      paymentStatus,
      paymentMethod,
      bankAccount,
      upiId,
      paidAt,
      completedServicesCount: empBookings.length || emp.completedBookings || 12,
      totalWorkingDays,
      presentDays,
      lateDays,
      leaveDays,
      hoursWorked,
      attendancePercentage
    };
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const data = getStaffPayrollData(emp);
    const matchesBranch = selectedBranch === 'ALL' || emp.branch === selectedBranch;
    const matchesDept = selectedDepartment === 'ALL' || emp.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'ALL' || data.paymentStatus === selectedStatus;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      (emp.designation && emp.designation.toLowerCase().includes(q));

    return matchesBranch && matchesDept && matchesStatus && matchesSearch;
  });

  // KPI Calculations across all staff
  const totalBaseSalary = employees.reduce((sum, e) => sum + getStaffPayrollData(e).baseSalary, 0);
  const totalCommissions = employees.reduce((sum, e) => sum + getStaffPayrollData(e).estimatedCommissions, 0);
  const totalNetPayroll = employees.reduce((sum, e) => sum + getStaffPayrollData(e).netPayable, 0);
  const paidCount = employees.filter(e => getStaffPayrollData(e).paymentStatus === 'Paid').length;
  const pendingCount = employees.length - paidCount;

  // Toggle single payment status
  const handleTogglePaymentStatus = (emp) => {
    const current = getStaffPayrollData(emp);
    const newStatus = current.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    const nowStr = new Date().toLocaleString();

    savePayrollState({
      ...payrollState,
      [emp.id]: {
        ...(payrollState[emp.id] || {}),
        paymentStatus: newStatus,
        paidAt: newStatus === 'Paid' ? nowStr : null
      }
    });

    if (logAudit) {
      logAudit('PAYROLL_STATUS', 'Salary Management', `Marked ${emp.name} salary as ${newStatus} for ${selectedMonth}`);
    }
    if (addNotification && newStatus === 'Paid') {
      addNotification('Salary Disbursed', `Salary payment of ${settings.currency}${current.netPayable.toFixed(2)} disbursed to ${emp.name}.`, 'staff');
    }
  };

  // Open Edit Salary Modal
  const handleOpenEditSalary = (emp) => {
    const data = getStaffPayrollData(emp);
    setEditingStaffSalary(emp);
    setSalaryFormData({
      baseSalary: data.baseSalary,
      commissionRate: data.commissionRate,
      bonus: data.bonus,
      deductions: data.deductions,
      paymentMethod: data.paymentMethod,
      bankAccount: data.bankAccount,
      upiId: data.upiId,
      paymentNotes: payrollState[emp.id]?.paymentNotes || ''
    });
  };

  // Save Salary Settings
  const handleSaveSalarySettings = (e) => {
    e.preventDefault();
    if (!editingStaffSalary) return;

    const baseSal = Number(salaryFormData.baseSalary) || 0;
    const commRate = Number(salaryFormData.commissionRate) || 0;

    // Update in context/employee master
    updateEmployee(editingStaffSalary.id, {
      baseSalary: baseSal,
      salary: baseSal,
      commissionRate: commRate,
      commission: commRate
    });

    // Save payroll state override
    savePayrollState({
      ...payrollState,
      [editingStaffSalary.id]: {
        ...(payrollState[editingStaffSalary.id] || {}),
        bonus: Number(salaryFormData.bonus) || 0,
        deductions: Number(salaryFormData.deductions) || 0,
        paymentMethod: salaryFormData.paymentMethod,
        bankAccount: salaryFormData.bankAccount,
        upiId: salaryFormData.upiId,
        paymentNotes: salaryFormData.paymentNotes
      }
    });

    if (logAudit) {
      logAudit('UPDATE_SALARY_STRUCTURE', 'Salary Management', `Adjusted compensation structure for ${editingStaffSalary.name}`);
    }

    setEditingStaffSalary(null);
  };

  // Disburse all pending payroll
  const handleDisburseAll = () => {
    const updated = { ...payrollState };
    const nowStr = new Date().toLocaleString();

    employees.forEach(e => {
      updated[e.id] = {
        ...(updated[e.id] || {}),
        paymentStatus: 'Paid',
        paidAt: nowStr
      };
    });

    savePayrollState(updated);
    setIsBulkPayConfirmOpen(false);

    if (logAudit) {
      logAudit('BULK_PAYROLL_DISBURSE', 'Salary Management', `Disbursed complete monthly payroll of ${settings.currency}${totalNetPayroll.toFixed(2)} to all staff`);
    }
    if (addNotification) {
      addNotification('Monthly Payroll Disbursed', `All ${employees.length} staff salaries have been marked as paid for ${selectedMonth}.`, 'system');
    }
  };

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

        {/* Submenu 1: Employee Management */}
        <button
          type="button"
          onClick={() => setActiveView('employees')}
          className="btn btn-secondary"
          style={{
            padding: '6px 14px',
            fontSize: '0.78rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
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

        {/* Submenu 3: Salary Slip of Attendance (Current Active) */}
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
          <span>💳</span>
          <span>Salary Slip of Attendance</span>
        </button>
      </div>

      {/* View Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Salary Slip of <span className="gold-text-gradient">Attendance & Payroll</span>
          </h2>
          <p>Attendance-based compensation, service commissions, performance bonuses, deduction audits & official printable payslips</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
            style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Printer size={14} /> Print Payroll
          </button>

          <button
            type="button"
            className="btn btn-gold"
            onClick={() => setIsBulkPayConfirmOpen(true)}
            style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <CheckCircle2 size={14} /> Disburse All Pending Salaries
          </button>
        </div>
      </div>

      {/* 4 Top KPI Scoreboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {/* Card 1: Total Base Salaries */}
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">TOTAL BASE SALARIES</div>
              <div className="stat-value" style={{ fontSize: '1.45rem', marginTop: 4 }}>
                {settings.currency}{totalBaseSalary.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Monthly base allocation ({employees.length} staff)
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-primary)' }}>
              <Building size={18} />
            </div>
          </div>
        </div>

        {/* Card 2: Total Commissions Earned */}
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">TREATMENT COMMISSIONS</div>
              <div className="stat-value" style={{ fontSize: '1.45rem', marginTop: 4, color: 'var(--cyan-accent)' }}>
                {settings.currency}{totalCommissions.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Performance tiered payouts (15% - 20%)
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-accent)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
        </div>

        {/* Card 3: Total Net Payroll Due */}
        <div className="stat-card" style={{ padding: '16px 20px', border: '1px solid var(--border-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">NET PAYROLL BUDGET</div>
              <div className="stat-value" style={{ fontSize: '1.45rem', marginTop: 4, color: 'var(--gold-primary)' }}>
                {settings.currency}{totalNetPayroll.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--emerald-accent)', marginTop: 4, fontWeight: 600 }}>
                Base + Commissions + Bonuses - Deductions
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--gold-gradient)', color: '#000' }}>
              <DollarSign size={18} />
            </div>
          </div>
        </div>

        {/* Card 4: Disbursement Progression */}
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '100%' }}>
              <div className="stat-label">DISBURSEMENT STATUS</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <span className="stat-value" style={{ fontSize: '1.45rem', color: paidCount === employees.length ? 'var(--emerald-accent)' : 'var(--amber-accent)' }}>
                  {paidCount} / {employees.length}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Staff Paid</span>
              </div>
              
              {/* Progress bar */}
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${employees.length > 0 ? (paidCount / employees.length) * 100 : 0}%`,
                    background: 'var(--gold-primary)',
                    borderRadius: 3,
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-accent)', marginLeft: 12 }}>
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Control Bar */}
      <div className="luxe-card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          {/* Left: Period & Dropdown Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Month Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="var(--gold-primary)" />
              <select
                className="form-select"
                style={{ padding: '6px 12px', fontSize: '0.8rem', width: 150 }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="October 2026">October 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Building size={14} color="var(--text-muted)" />
              <select
                className="form-select"
                style={{ padding: '6px 12px', fontSize: '0.8rem', width: 170 }}
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="ALL">All Salon Branches</option>
                {branches.map(b => (
                  <option key={b.id || b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.8rem', width: 170 }}
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'ALL' ? 'All Departments' : d}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '0.8rem', width: 140 }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Right: Search Input */}
          <div style={{ position: 'relative', width: 220 }}>
            <Search
              size={13}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 30, fontSize: '0.8rem', padding: '6px 10px 6px 30px' }}
              placeholder="Search staff or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Salary & Payroll Ledger Table */}
      <div className="luxe-table-container">
        <table className="luxe-table" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>EMPLOYEE / ARTISAN</th>
              <th style={{ whiteSpace: 'nowrap' }}>DEPARTMENT & BRANCH</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ATTENDANCE</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>BASE SALARY</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>COMMISSIONS</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>BONUS / TIPS</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>DEDUCTIONS</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>NET PAYABLE</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>PAYMENT STATUS</th>
              <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                  No employee salary records match the selected filters.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const payroll = getStaffPayrollData(emp);
                const isPaid = payroll.paymentStatus === 'Paid';

                return (
                  <tr key={emp.id}>
                    {/* 1. Employee Photo & Details */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1.5px solid var(--gold-primary)',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {emp.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ID: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{emp.id}</span> • {emp.designation}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Department & Branch */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {emp.department}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Building size={11} /> {emp.branch}
                      </div>
                    </td>

                    {/* 3. Attendance Stats */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                        {payroll.presentDays} / {payroll.totalWorkingDays} Days
                      </div>
                      <div style={{ fontSize: '0.68rem', color: payroll.attendancePercentage >= 95 ? 'var(--emerald-accent)' : 'var(--amber-accent)', fontWeight: 600 }}>
                        {payroll.attendancePercentage}% Logged • {payroll.hoursWorked} hrs
                      </div>
                    </td>

                    {/* 4. Base Salary */}
                    <td style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.86rem' }}>
                      {settings.currency}{payroll.baseSalary.toLocaleString()}
                    </td>

                    {/* 5. Commissions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--cyan-accent)', fontSize: '0.86rem' }}>
                        +{settings.currency}{payroll.estimatedCommissions.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {payroll.commissionRate}% tier • {payroll.completedServicesCount} services
                      </div>
                    </td>

                    {/* 6. Bonus */}
                    <td style={{ textAlign: 'right' }}>
                      {payroll.bonus > 0 ? (
                        <span style={{ color: 'var(--emerald-accent)', fontWeight: 600, fontSize: '0.84rem' }}>
                          +{settings.currency}{payroll.bonus.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>

                    {/* 7. Deductions */}
                    <td style={{ textAlign: 'right' }}>
                      {payroll.deductions > 0 ? (
                        <span style={{ color: 'var(--ruby-accent)', fontWeight: 600, fontSize: '0.84rem' }}>
                          -{settings.currency}{payroll.deductions.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>

                    {/* 8. Net Payable */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.98rem' }}>
                        {settings.currency}{payroll.netPayable.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                        Via {payroll.paymentMethod.split(' ')[0]}
                      </div>
                    </td>

                    {/* 9. Payment Status Badge */}
                    <td style={{ textAlign: 'center' }}>
                      {isPaid ? (
                        <div>
                          <span
                            className="badge badge-emerald"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.72rem',
                              padding: '3px 8px'
                            }}
                          >
                            <CheckCircle2 size={12} /> Paid
                          </span>
                          {payroll.paidAt && (
                            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {payroll.paidAt}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span
                          className="badge badge-amber"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.72rem',
                            padding: '3px 8px'
                          }}
                        >
                          <Clock size={12} /> Pending Payout
                        </span>
                      )}
                    </td>

                    {/* 10. Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {/* Toggle Pay / Mark Paid */}
                        <button
                          type="button"
                          className={isPaid ? "btn btn-secondary" : "btn btn-gold"}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            whiteSpace: 'nowrap'
                          }}
                          onClick={() => handleTogglePaymentStatus(emp)}
                          title={isPaid ? "Click to revert to Pending" : "Disburse and Mark Paid"}
                        >
                          <CreditCard size={11} />
                          <span>{isPaid ? 'Revert' : 'Pay Now'}</span>
                        </button>

                        {/* View Salary Slip */}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            color: 'var(--gold-primary)',
                            borderColor: 'var(--border-gold)',
                            fontWeight: 600,
                            whiteSpace: 'nowrap'
                          }}
                          onClick={() => setActivePayslipStaff(emp)}
                          title="Generate Attendance Salary Slip"
                        >
                          <FileText size={11} />
                          <span>Salary Slip</span>
                        </button>

                        {/* Edit Structure */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          style={{ width: 28, height: 28 }}
                          onClick={() => handleOpenEditSalary(emp)}
                          title="Edit Compensation & Account"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Summary Footer */}
          {filteredEmployees.length > 0 && (
            <tfoot>
              <tr style={{ background: 'var(--bg-elevated)', borderTop: '2px solid var(--border-gold)', fontWeight: 700 }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ color: 'var(--gold-primary)', fontSize: '0.85rem' }}>TOTAL SUMMARY</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {filteredEmployees.length} filtered staff
                  </div>
                </td>
                <td>—</td>
                <td style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--emerald-accent)' }}>
                  Avg 96% Logged
                </td>
                <td style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                  {settings.currency}{filteredEmployees.reduce((sum, e) => sum + getStaffPayrollData(e).baseSalary, 0).toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--cyan-accent)', fontSize: '0.9rem' }}>
                  +{settings.currency}{filteredEmployees.reduce((sum, e) => sum + getStaffPayrollData(e).estimatedCommissions, 0).toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--emerald-accent)', fontSize: '0.88rem' }}>
                  +{settings.currency}{filteredEmployees.reduce((sum, e) => sum + getStaffPayrollData(e).bonus, 0).toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--ruby-accent)', fontSize: '0.88rem' }}>
                  -{settings.currency}{filteredEmployees.reduce((sum, e) => sum + getStaffPayrollData(e).deductions, 0).toFixed(2)}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--gold-primary)', fontSize: '1.05rem', fontWeight: 800 }}>
                  {settings.currency}{filteredEmployees.reduce((sum, e) => sum + getStaffPayrollData(e).netPayable, 0).toFixed(2)}
                </td>
                <td style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                  {filteredEmployees.filter(e => getStaffPayrollData(e).paymentStatus === 'Paid').length} Paid / {filteredEmployees.filter(e => getStaffPayrollData(e).paymentStatus !== 'Paid').length} Due
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Audit Locked</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* ========================================================
          MODAL 1: EDIT STAFF SALARY & COMPENSATION
         ======================================================== */}
      {editingStaffSalary && (
        <div className="modal-overlay" onClick={() => setEditingStaffSalary(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={editingStaffSalary.avatar}
                  alt={editingStaffSalary.name}
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold-primary)' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Configure Salary: {editingStaffSalary.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {editingStaffSalary.designation} • {editingStaffSalary.department}
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingStaffSalary(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSalarySettings} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Base Monthly Salary ({settings.currency}) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={salaryFormData.baseSalary}
                    onChange={(e) => setSalaryFormData({ ...salaryFormData, baseSalary: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Commission Rate (%) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min={0}
                    max={100}
                    value={salaryFormData.commissionRate}
                    onChange={(e) => setSalaryFormData({ ...salaryFormData, commissionRate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Monthly Bonus / Tips ({settings.currency})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salaryFormData.bonus}
                    onChange={(e) => setSalaryFormData({ ...salaryFormData, bonus: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deductions / Advance ({settings.currency})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salaryFormData.deductions}
                    onChange={(e) => setSalaryFormData({ ...salaryFormData, deductions: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Disbursement Payment Method</label>
                <select
                  className="form-select"
                  value={salaryFormData.paymentMethod}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, paymentMethod: e.target.value })}
                >
                  <option value="Direct Bank Transfer">Direct Bank Transfer (NEFT/RTGS/ACH)</option>
                  <option value="UPI / Digital Wallet">UPI / Instant Digital Wallet</option>
                  <option value="Cash Settlement">Cash Over-the-Counter</option>
                  <option value="Company Cheque">Company Crossed Cheque</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Bank Account Number / Masked</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="HDFC •••• 9821"
                    value={salaryFormData.bankAccount}
                    onChange={(e) => setSalaryFormData({ ...salaryFormData, bankAccount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">UPI ID / Handle</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="stylist@upi"
                    value={salaryFormData.upiId}
                    onChange={(e) => setSalaryFormData({ ...salaryFormData, upiId: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Managerial Settlement Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Approved monthly performance bonus for VIP client retention..."
                  value={salaryFormData.paymentNotes}
                  onChange={(e) => setSalaryFormData({ ...salaryFormData, paymentNotes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingStaffSalary(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} /> Save Salary Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: OFFICIAL LUXURY PAYSLIP VOUCHER
         ======================================================== */}
      {activePayslipStaff && (() => {
        const pay = getStaffPayrollData(activePayslipStaff);

        return (
          <div className="modal-overlay" onClick={() => setActivePayslipStaff(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620, maxHeight: '92vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color="var(--gold-primary)" />
                  <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Official Attendance Salary Slip Voucher</h3>
                </div>
                <button className="btn btn-secondary btn-icon" onClick={() => setActivePayslipStaff(null)}>
                  <X size={18} />
                </button>
              </div>

              {/* Printable Payslip Body */}
              <div style={{ padding: '24px', background: 'var(--bg-card)' }}>
                {/* Brand Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--gold-primary)', paddingBottom: 14, marginBottom: 18 }}>
                  <div>
                    <h2 className="serif-heading gold-text-gradient" style={{ fontSize: '1.4rem', margin: 0 }}>
                      LUMINA LUXE
                    </h2>
                    <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Haute Coiffure & Luxury Spa
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {activePayslipStaff.branch} • Authorized Salon Enterprise
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>CONFIDENTIAL ATTENDANCE PAYSLIP</span>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 4 }}>
                      Period: {selectedMonth}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Voucher Ref: PAY-{activePayslipStaff.id.toUpperCase()}-202610
                    </div>
                  </div>
                </div>

                {/* Staff Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14, background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 8, marginBottom: 14, fontSize: '0.8rem' }}>
                  <div>
                    <div>Employee: <strong>{activePayslipStaff.name}</strong></div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Designation: <span style={{ color: 'var(--text-primary)' }}>{activePayslipStaff.designation}</span></div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Employee ID: <strong>{activePayslipStaff.id}</strong></div>
                  </div>
                  <div>
                    <div>Department: <strong>{activePayslipStaff.department}</strong></div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Payment Mode: <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{pay.paymentMethod}</span></div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>Account / UPI: <span>{pay.bankAccount || pay.upiId}</span></div>
                  </div>
                </div>

                {/* Attendance Summary Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 10,
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 18,
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>TOTAL WORKING DAYS</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{pay.totalWorkingDays} Days (Month)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DAYS PRESENT / ON DUTY</div>
                    <div style={{ fontWeight: 700, color: 'var(--emerald-accent)', marginTop: 2 }}>
                      {pay.presentDays} Days ({pay.attendancePercentage}%)
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>HOURS & OVERTIME</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                      {pay.hoursWorked} hrs • {pay.lateDays} Late
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>LEAVES / ABSENCE</div>
                    <div style={{ fontWeight: 700, color: pay.leaveDays > 0 ? 'var(--ruby-accent)' : 'var(--text-primary)', marginTop: 2 }}>
                      {pay.leaveDays} Leaves Taken
                    </div>
                  </div>
                </div>

                {/* Breakdown Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: 18 }}>
                  <thead>
                    <tr style={{ background: 'rgba(212, 175, 55, 0.1)', borderBottom: '1px solid var(--border-gold)' }}>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--gold-primary)' }}>EARNINGS & REWARDS</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--gold-primary)' }}>AMOUNT</th>
                      <th style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--ruby-accent)', borderLeft: '1px solid var(--border-subtle)' }}>DEDUCTIONS</th>
                      <th style={{ textAlign: 'right', padding: '8px 10px', color: 'var(--ruby-accent)' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 10px' }}>Base Monthly Salary</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{settings.currency}{pay.baseSalary.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', borderLeft: '1px solid var(--border-subtle)' }}>Statutory Tax / TDS</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{settings.currency}{(pay.deductions * 0.4).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 10px' }}>
                        Service Commission ({pay.commissionRate}%)
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{pay.completedServicesCount} treatments rendered</div>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{settings.currency}{pay.estimatedCommissions.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', borderLeft: '1px solid var(--border-subtle)' }}>Leave / Advance Recovery</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{settings.currency}{(pay.deductions * 0.6).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 10px' }}>Performance Bonus & Tips</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{settings.currency}{pay.bonus.toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', borderLeft: '1px solid var(--border-subtle)' }}>Other Adjustments</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{settings.currency}0.00</td>
                    </tr>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.02)', fontWeight: 700 }}>
                      <td style={{ padding: '8px 10px' }}>Total Gross Earnings</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--emerald-accent)' }}>
                        {settings.currency}{(pay.baseSalary + pay.estimatedCommissions + pay.bonus).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 10px', borderLeft: '1px solid var(--border-subtle)' }}>Total Deductions</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--ruby-accent)' }}>
                        {settings.currency}{pay.deductions.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Net Pay Callout */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gold-subtle)', border: '1.5px solid var(--gold-primary)', borderRadius: 8, padding: '12px 18px', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                      NET SALARY PAYABLE
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Disbursed to: {pay.bankAccount || pay.upiId}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                      {settings.currency}{pay.netPayable.toFixed(2)}
                    </div>
                    <span className={pay.paymentStatus === 'Paid' ? "badge badge-emerald" : "badge badge-amber"} style={{ fontSize: '0.65rem' }}>
                      {pay.paymentStatus === 'Paid' ? '✓ Disbursed & Settled' : 'Payment Scheduled'}
                    </span>
                  </div>
                </div>

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 30, paddingTop: 10, borderTop: '1px dashed var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div>
                    <div style={{ width: 140, borderBottom: '1px solid var(--text-muted)', marginBottom: 4 }} />
                    Employee Signature
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ width: 140, borderBottom: '1px solid var(--gold-primary)', marginBottom: 4, marginLeft: 'auto' }} />
                    <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>Lumina Luxe Salon Finance</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={() => setActivePayslipStaff(null)}
                  style={{ fontSize: '0.8rem' }}
                >
                  Close Payslip
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          MODAL 3: BULK DISBURSE CONFIRMATION
         ======================================================== */}
      {isBulkPayConfirmOpen && (
        <div className="modal-overlay" onClick={() => setIsBulkPayConfirmOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Wallet size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Disburse All Staff Salaries?</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You are about to approve and mark all <strong>{employees.length} employees</strong> as <strong>Paid</strong> for the <strong>{selectedMonth}</strong> billing cycle.
              </p>

              <div style={{ background: 'var(--bg-elevated)', padding: '12px', borderRadius: 8, margin: '16px 0', border: '1px solid var(--border-gold)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL NET PAYOUT</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: 2 }}>
                  {settings.currency}{totalNetPayroll.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsBulkPayConfirmOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-gold"
                onClick={handleDisburseAll}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={14} /> Confirm & Mark All Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
