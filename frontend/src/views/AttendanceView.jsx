import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Plus,
  Play,
  Square,
  X,
  FileText,
  Filter,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  Eye,
  Award,
  Home,
  Coffee,
  Sun,
  Ban,
  Check,
  UserCheck,
  User,
  FileSpreadsheet
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to parse Month Name & Year string (e.g. "August 2026")
const parseMonthYear = (monthStr) => {
  try {
    const parts = monthStr.split(' ');
    const mName = parts[0];
    const year = parseInt(parts[1], 10) || 2026;
    const monthIdx = MONTH_NAMES.indexOf(mName);
    return { monthIdx: monthIdx !== -1 ? monthIdx : 8, year, mName: mName || 'September' };
  } catch {
    return { monthIdx: 8, year: 2026, mName: 'September' };
  }
};

// Exact Staff Roster matching the reference system & screenshots
const INITIAL_DAILY_ROSTER = [
  {
    id: 'emp-niladri',
    name: 'NILADRI SEKHAR MAJI',
    employeeId: '2025-LHE-IT-34',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'IT & Systems Architecture',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Self',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-piyush',
    name: 'Piyush Raj',
    employeeId: '70Y2vmZ7pdFhtnZgos8D18Y14439rpB1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Styling & Color',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Self',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-omprakash',
    name: 'Om Prakash Rana',
    employeeId: '23sftuMtlEWYYcAEFzZZc44qA3L7UBSCe',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Spa & Wellness',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Self',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-karttikeswar',
    name: 'Karttikeswar Das',
    employeeId: 'eeHfK5c8FEfTSXvoPL9wXFgwPHzQdaLnk',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
    branch: 'Century City Penthouse',
    department: 'Hair Care',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'N/A',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-sidhartha',
    name: 'Sidhartha Mahanta',
    employeeId: 'gT3ahFlweL5128HscKGgqsdYymFULEPV',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Aesthetic Clinic',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Self',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-julian',
    name: 'Julian Vance',
    employeeId: '82Kj9xPq3LmNvRt712Yw90AbCdEf1234',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Master Colorist',
    clockIn: '09:15 AM',
    clockOut: '--',
    hours: '7.5 hrs',
    mode: 'Biometric',
    status: 'Present',
    isLate: false,
    checkedIn: true
  },
  {
    id: 'emp-aria',
    name: 'Aria Montgomery',
    employeeId: '44XzLm91QpRsTu5689Yw12BcDeFg5678',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Spa & Aesthetics',
    clockIn: '08:55 AM',
    clockOut: '--',
    hours: '8.0 hrs',
    mode: 'Self',
    status: 'Present',
    isLate: false,
    checkedIn: true
  },
  {
    id: 'emp-leo',
    name: 'Leo Bennett',
    employeeId: '15MnOp67QrStUv8901WxYzAbCdEf3456',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Precision Styling',
    clockIn: '09:05 AM',
    clockOut: '--',
    hours: '7.8 hrs',
    mode: 'Biometric',
    status: 'Present',
    isLate: false,
    checkedIn: true
  },
  {
    id: 'emp-marcus',
    name: 'Marcus Sterling',
    employeeId: '28TuVw45XyZaBc6789DeFgHiJkLm1234',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Gentlemen Grooming',
    clockIn: '09:00 AM',
    clockOut: '--',
    hours: '8.0 hrs',
    mode: 'Admin',
    status: 'Present',
    isLate: false,
    checkedIn: true
  },
  {
    id: 'emp-chloe',
    name: 'Chloe Dubois',
    employeeId: '91AbCd34EfGhIj7890KlMnOpQrSt9012',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    branch: 'Century City Penthouse',
    department: 'Nail & Lash Lounge',
    clockIn: '10:15 AM',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Self',
    status: 'Absent',
    isLate: true,
    checkedIn: false
  },
  {
    id: 'emp-sophia',
    name: 'Sophia Chen',
    employeeId: '63GhIj90KlMnOp1234QrStUvWxYz7890',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Front Desk Concierge',
    clockIn: '10:25 AM',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Biometric',
    status: 'Absent',
    isLate: true,
    checkedIn: false
  },
  {
    id: 'emp-nina',
    name: 'Nina Patel',
    employeeId: '57DeFg89HiJkLm0123NoPqRsTuVw4567',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    branch: 'Malibu Coastal Sanctuary',
    department: 'Mobile Dispatch',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Self',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-elena',
    name: 'Elena Rostova',
    employeeId: '39JkLm23NoPqRs4567TuVwXyZaBc8901',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=200&q=80',
    branch: 'Century City Penthouse',
    department: 'Skin Therapies',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'N/A',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-dante',
    name: 'Dante Rossi',
    employeeId: '74NoPq56TuVwXy7890ZaBcDeFgHi1234',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80',
    branch: 'Beverly Hills Flagship',
    department: 'Hair Architect',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Self',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-camila',
    name: 'Camila Fernandez',
    employeeId: '18TuVw89ZaBcDe0123FgHiJkLmNo4567',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    branch: 'Malibu Coastal Sanctuary',
    department: 'Bridal & Makeup',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'N/A',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  },
  {
    id: 'emp-zackary',
    name: 'Zackary Taylor',
    employeeId: '92ZaBc12DeFgHi3456JkLmNoPqRs7890',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    branch: 'Century City Penthouse',
    department: 'Operations',
    clockIn: 'N/A',
    clockOut: '--',
    hours: 'N/A',
    mode: 'Self',
    status: 'Absent',
    isLate: false,
    checkedIn: false
  }
];

// Exact September 2026 Calendar Days matching reference image 2
const NILADRI_SEPTEMBER_2026_DAYS = [
  { day: 1, status: 'Absent', in: '', out: '', hours: '', type: 'absent' },
  { day: 2, status: 'Late', in: '10:31 AM', out: '06:23 PM', hours: '5h 14m', type: 'late' },
  { day: 3, status: 'Present', in: '10:12 AM', out: '08:25 PM', hours: '10h 13m', type: 'present' },
  { day: 4, status: 'Present', in: '10:14 AM', out: '08:25 PM', hours: '10h 11m', type: 'present' },
  { day: 5, status: 'Present', in: '10:18 AM', out: '08:27 PM', hours: '10h 11m', type: 'present' },
  { day: 6, status: 'Present', in: '10:14 AM', out: '08:09 PM', hours: '9h 55m', type: 'present' },
  { day: 7, status: 'Present', in: '10:12 AM', out: '08:26 PM', hours: '10h 14m', type: 'present' },
  { day: 8, status: 'Present', in: '10:10 AM', out: '08:55 PM', hours: '10h 45m', type: 'present' },
  { day: 9, status: 'Late', in: '10:22 AM', out: '08:25 PM', hours: '10h 3m', type: 'late' },
  { day: 10, status: 'Absent', in: '', out: '', hours: '', type: 'absent' },
  { day: 11, status: 'Present', in: '10:03 AM', out: '08:21 PM', hours: '10h 21m', type: 'present' },
  { day: 12, status: 'Late', in: '10:30 AM', out: '05:00 PM', hours: '7h 14m', type: 'late' },
  { day: 13, status: 'Absent', in: '', out: '', hours: '', type: 'absent' },
  { day: 14, status: 'Present', in: '09:55 AM', out: '08:21 PM', hours: '10h 12m', type: 'present' },
  { day: 15, status: 'Present', in: '08:55 AM', out: '08:16 PM', hours: '11h 24m', type: 'present' },
  { day: 16, status: 'Present', in: '10:05 AM', out: '08:21 PM', hours: '10h 20m', type: 'present' },
  { day: 17, status: 'Present', in: '10:05 AM', out: '12:35 AM', hours: '24h 21m', type: 'present' },
  { day: 18, status: 'Present', in: '10:05 AM', out: '08:22 PM', hours: '10h 17m', type: 'present' },
  { day: 19, status: 'Present', in: '10:05 AM', out: '10:10 PM', hours: '12h 5m', type: 'present' },
  { day: 20, status: 'Late', in: '10:22 AM', out: '08:00 PM', hours: '9h 38m', type: 'late' },
  { day: 21, status: 'Present', in: '09:08 AM', out: '08:25 PM', hours: '11h 17m', type: 'present' },
  { day: 22, status: 'Present', in: '10:05 AM', out: '08:25 PM', hours: '10h 20m', type: 'present' },
  { day: 23, status: 'Present', in: '10:14 AM', out: '07:50 PM', hours: '9h 54m', type: 'present' },
  { day: 24, status: 'Present', in: '09:55 AM', out: '08:02 PM', hours: '10h 7m', type: 'present' },
  { day: 25, status: 'Present', in: '09:51 AM', out: '08:45 PM', hours: '10h 51m', type: 'present' },
  { day: 26, status: 'Present', in: '10:11 AM', out: '02:00 PM', hours: '3h 49m', type: 'present' },
  { day: 27, status: 'Absent', in: '', out: '', hours: '', type: 'absent' },
  { day: 28, status: 'Absent', in: '', out: '', hours: '', type: 'absent' },
  { day: 29, status: 'Present', in: '09:52 AM', out: '08:25 PM', hours: '10h 33m', type: 'present' },
  { day: 30, status: 'Absent', in: '', out: '', hours: '', type: 'absent' }
];

export const AttendanceView = () => {
  const {
    employees,
    branches,
    leaveRequests,
    addLeaveRequest,
    updateLeaveStatus,
    setActiveView
  } = useSalon();

  // Tab State: 'daily' | 'monthly' | 'terminal' | 'leaves' | 'reports'
  const [activeTab, setActiveTab] = useState('monthly');
  
  // Date State
  const [selectedDate, setSelectedDate] = useState('2026-10-01');
  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  // Filter & Search
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Daily Attendance Roster State
  const [dailyRoster, setDailyRoster] = useState(INITIAL_DAILY_ROSTER);

  // Inspector & Modals
  const [inspectorEmployeeId, setInspectorEmployeeId] = useState('emp-niladri');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState('');
  const [showMatrixTable, setShowMatrixTable] = useState(false);

  // Date Handlers for Daily Tab
  const handlePrevDate = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]} - ${parts[1]} - ${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatDayName = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Thursday, October 1, 2026';
    }
  };

  // Dynamic Month Switcher for Monthly Tab
  const handlePrevMonth = () => {
    const { monthIdx, year } = parseMonthYear(selectedMonth);
    const prevDate = new Date(year, monthIdx - 1, 1);
    const nextM = MONTH_NAMES[prevDate.getMonth()];
    const nextY = prevDate.getFullYear();
    setSelectedMonth(`${nextM} ${nextY}`);
  };

  const handleNextMonth = () => {
    const { monthIdx, year } = parseMonthYear(selectedMonth);
    const nextDate = new Date(year, monthIdx + 1, 1);
    const nextM = MONTH_NAMES[nextDate.getMonth()];
    const nextY = nextDate.getFullYear();
    setSelectedMonth(`${nextM} ${nextY}`);
  };

  // Toggle Check-in for employee in Daily tab
  const handleToggleCheckIn = (id) => {
    setDailyRoster(prev => prev.map(item => {
      if (item.id === id) {
        const nextChecked = !item.checkedIn;
        const nextStatus = nextChecked ? 'Present' : 'Absent';
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setFeedbackToast(
          nextChecked
            ? `✅ ${item.name} checked in successfully at ${nowTime}!`
            : `ℹ️ ${item.name} marked absent.`
        );
        setTimeout(() => setFeedbackToast(''), 3500);

        return {
          ...item,
          checkedIn: nextChecked,
          status: nextStatus,
          clockIn: nextChecked ? (item.clockIn === 'N/A' ? nowTime : item.clockIn) : 'N/A',
          hours: nextChecked ? (item.hours === 'N/A' ? '8.0 hrs' : item.hours) : 'N/A',
          mode: nextChecked ? (item.mode === 'N/A' ? 'Self' : item.mode) : item.mode
        };
      }
      return item;
    }));
  };

  // Quick Status Change in Action column
  const handleStatusChange = (id, newStatus) => {
    setDailyRoster(prev => prev.map(item => {
      if (item.id === id) {
        const isPresent = newStatus === 'Present';
        const isLate = newStatus === 'Late';
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          ...item,
          status: newStatus,
          checkedIn: isPresent || isLate,
          clockIn: (isPresent || isLate) && item.clockIn === 'N/A' ? nowTime : (newStatus === 'Absent' ? 'N/A' : item.clockIn),
          hours: (isPresent || isLate) && item.hours === 'N/A' ? '8.0 hrs' : (newStatus === 'Absent' ? 'N/A' : item.hours),
          isLate: isLate
        };
      }
      return item;
    }));
  };

  // Daily KPI Calculations (15 Total, 4 Present, 11 Absent, 2 Late)
  const totalEmployees = dailyRoster.length;
  const presentCount = dailyRoster.filter(r => r.status === 'Present').length;
  const absentCount = dailyRoster.filter(r => r.status === 'Absent').length;
  const lateCount = dailyRoster.filter(r => r.isLate || r.status === 'Late').length;

  // Filtered Roster for Daily Table
  const filteredDailyRoster = dailyRoster.filter(item => {
    const q = localSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.employeeId.toLowerCase().includes(q) ||
      item.branch.toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'Present') matchesStatus = item.status === 'Present';
    else if (statusFilter === 'Absent') matchesStatus = item.status === 'Absent';
    else if (statusFilter === 'Late') matchesStatus = item.status === 'Late' || item.isLate;
    else if (statusFilter === 'Half Day') matchesStatus = item.status === 'Half Day';
    else if (statusFilter === 'Leave') matchesStatus = item.status === 'Leave';

    return matchesSearch && matchesStatus;
  });

  // Inspected Employee
  const inspectedEmployee = dailyRoster.find(e => e.id === inspectorEmployeeId) || dailyRoster[0];

  // Dynamic Month & Year parsing for Month-Wise Calendar Grid
  const { monthIdx, year } = parseMonthYear(selectedMonth);
  const startDayOfWeek = new Date(year, monthIdx, 1).getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const totalDaysInMonth = new Date(year, monthIdx + 1, 0).getDate(); // 31 for Aug, 30 for Sept, 31 for Oct

  // Month-Wise Calendar Days generator for the selected month & employee
  const getMonthlyCalendarDays = (empId, monthStr) => {
    const { monthIdx: mIdx } = parseMonthYear(monthStr);

    if (empId === 'emp-niladri' && monthStr === 'September 2026') {
      return NILADRI_SEPTEMBER_2026_DAYS;
    }

    // Generate dynamic month-wise days for selected month (August 2026, October 2026, etc.)
    return Array.from({ length: totalDaysInMonth }, (_, i) => {
      const dayNum = i + 1;

      // August 2026 pattern matching user screenshot:
      // Days 1, 10, 13, 27, 28, 30 are Absent
      // Days 2, 9, 12, 20 are Late
      const isAbsent = [1, 10, 13, 27, 28, 30].includes(dayNum);
      const isLate = [2, 9, 12, 20].includes(dayNum);

      if (isAbsent) {
        return { day: dayNum, status: 'Absent', in: '', out: '', hours: '', type: 'absent' };
      }
      if (isLate) {
        return { day: dayNum, status: 'Late', in: '10:25 AM', out: '08:15 PM', hours: '9h 50m', type: 'late' };
      }
      return { day: dayNum, status: 'Present', in: '10:05 AM', out: '08:20 PM', hours: '10h 15m', type: 'present' };
    });
  };

  const monthlyDays = getMonthlyCalendarDays(inspectorEmployeeId, selectedMonth);

  // Dynamic 5 Stats for Selected Month
  const monthlyPresentCount = monthlyDays.filter(d => d.type === 'present' || d.type === 'late').length;
  const monthlyOnTimeCount = monthlyDays.filter(d => d.type === 'present').length;
  const monthlyLateCount = monthlyDays.filter(d => d.type === 'late').length;
  const monthlyAbsentCount = monthlyDays.filter(d => d.type === 'absent').length;

  // Calculate dynamic Total Hours for the selected month
  const calcTotalHours = () => {
    if (selectedMonth === 'September 2026') return '249h 27m';
    if (selectedMonth === 'August 2026') return '256h 15m';
    if (selectedMonth === 'October 2026') return '262h 40m';
    return '250h 00m';
  };
  const monthlyTotalHoursStr = calcTotalHours();

  // Manual Check-in Form State
  const [manualForm, setManualForm] = useState({
    employeeId: dailyRoster[0].id,
    date: selectedDate,
    clockIn: '09:00 AM',
    clockOut: '--',
    mode: 'Self',
    status: 'Present',
    notes: 'Admin manual check-in'
  });

  const handleManualCheckInSubmit = (e) => {
    e.preventDefault();
    setDailyRoster(prev => prev.map(item => {
      if (item.id === manualForm.employeeId) {
        return {
          ...item,
          status: manualForm.status,
          clockIn: manualForm.clockIn,
          clockOut: manualForm.clockOut,
          mode: manualForm.mode,
          hours: manualForm.status === 'Present' ? '8.0 hrs' : (manualForm.status === 'Half Day' ? '4.0 hrs' : 'N/A'),
          checkedIn: manualForm.status === 'Present' || manualForm.status === 'Late'
        };
      }
      return item;
    }));

    const empName = dailyRoster.find(r => r.id === manualForm.employeeId)?.name || 'Staff';
    setFeedbackToast(`✅ Manual check-in recorded for ${empName}!`);
    setTimeout(() => setFeedbackToast(''), 3500);
    setIsManualModalOpen(false);
  };

  // Leave Form State
  const [leaveData, setLeaveData] = useState({
    employeeId: dailyRoster[0].id,
    type: 'Casual',
    startDate: '2026-10-05',
    endDate: '2026-10-06',
    reason: ''
  });

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    const emp = dailyRoster.find(e => e.id === leaveData.employeeId);
    addLeaveRequest({
      ...leaveData,
      employeeName: emp?.name || 'Staff'
    });
    setFeedbackToast(`✅ Leave request submitted for ${emp?.name}!`);
    setTimeout(() => setFeedbackToast(''), 3500);
    setIsLeaveModalOpen(false);
  };

  const handleExportExcel = () => {
    let csv = `Employee,${inspectedEmployee.name},ID,${inspectedEmployee.employeeId},Month,${selectedMonth}\n`;
    csv += `Day,Status,Clock In,Clock Out,Total Hours\n`;
    monthlyDays.forEach(d => {
      csv += `${d.day},${d.status},${d.in || '--'},${d.out || '--'},${d.hours || '--'}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_${inspectedEmployee.name.replace(/\s+/g, '_')}_${selectedMonth.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="view-wrapper">
      {/* Top 3-Submenu Switcher Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-elevated)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-gold)',
          marginBottom: 16,
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
          style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <span>👤</span>
          <span>Employee</span>
        </button>

        {/* Submenu 2: Employee Attendance (Active) */}
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
          <span>🕒</span>
          <span>Employee Attendance</span>
        </button>

        {/* Submenu 3: Salary Slip of Attendance */}
        <button
          type="button"
          onClick={() => setActiveView('payroll')}
          className="btn btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <span>💳</span>
          <span>Salary Slip of Attendance</span>
        </button>
      </div>

      {/* 1. GREEN HERO HEADER BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #00a859 0%, #008744 100%)',
          borderRadius: 14,
          padding: '16px 24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
          boxShadow: '0 6px 20px rgba(0, 168, 89, 0.28)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Calendar size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Employee Attendance
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              Manage daily attendance records
            </p>
          </div>
        </div>

        {/* Pill Switcher: [ 📅 Daily ] | [ 📊 Monthly ] */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.18)',
            padding: '4px 6px',
            borderRadius: 30,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <button
            onClick={() => setActiveTab('daily')}
            style={{
              background: activeTab === 'daily' ? '#ffffff' : 'transparent',
              color: activeTab === 'daily' ? '#00a859' : '#ffffff',
              border: 'none',
              borderRadius: 24,
              padding: '8px 22px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'daily' ? '0 2px 8px rgba(0, 0, 0, 0.18)' : 'none'
            }}
          >
            <Calendar size={14} /> Daily
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            style={{
              background: activeTab === 'monthly' ? '#ffffff' : 'transparent',
              color: activeTab === 'monthly' ? '#00a859' : '#ffffff',
              border: 'none',
              borderRadius: 24,
              padding: '8px 22px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'monthly' ? '0 2px 8px rgba(0, 0, 0, 0.18)' : 'none'
            }}
          >
            <FileText size={14} /> Monthly
          </button>
        </div>
      </div>

      {/* Secondary Workflow Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          className={`btn ${activeTab === 'monthly' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.76rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('monthly')}
        >
          <FileText size={13} /> Monthly Calendar & Inspector
        </button>
        <button
          className={`btn ${activeTab === 'daily' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.76rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('daily')}
        >
          <Calendar size={13} /> Daily Records
        </button>
        <button
          className={`btn ${activeTab === 'terminal' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.76rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('terminal')}
        >
          <Clock size={13} /> Biometric Terminal
        </button>
        <button
          className={`btn ${activeTab === 'leaves' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.76rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('leaves')}
        >
          <UserCheck size={13} /> Leave Requests
        </button>
        <button
          className={`btn ${activeTab === 'reports' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.76rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('reports')}
        >
          <Download size={13} /> Audit Reports
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: 'var(--emerald-accent)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.82rem',
          fontWeight: 600,
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {feedbackToast}
        </div>
      )}

      {/* =========================================================================
          2. MONTHLY TAB: MONTH-WISE EMPLOYEE ATTENDANCE CALENDAR (EXACT MATCH FOR BOTH CROPPED IMAGES)
          ========================================================================= */}
      {activeTab === 'monthly' && (
        <div
          className="luxe-card"
          style={{
            padding: '20px 24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Top Row: Employee Selector & Exact Pill Month Selector (< August 2026 >) & Export Excel */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border-subtle)'
            }}
          >
            {/* Left: Employee Dropdown with User Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 300 }}>
              <User size={18} color="var(--text-secondary)" />
              <select
                className="form-select"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '8px 14px',
                  width: '100%',
                  maxWidth: 460,
                  outline: 'none',
                  cursor: 'pointer'
                }}
                value={inspectorEmployeeId}
                onChange={(e) => setInspectorEmployeeId(e.target.value)}
              >
                {dailyRoster.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} &mdash; {e.employeeId}
                  </option>
                ))}
              </select>
            </div>

            {/* Center/Right: Exact Pill Month Selector Button (< August 2026 >) & Export Excel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Pill Month Selector matching User Image 1: < August 2026 > */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#f4efe6',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: 20,
                  padding: '6px 18px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
                }}
              >
                <button
                  onClick={handlePrevMonth}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px 4px',
                    transition: 'transform 0.1s ease'
                  }}
                  title="Previous Month"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    color: '#032b56',
                    cursor: 'pointer',
                    outline: 'none',
                    fontFamily: 'inherit',
                    padding: '0 4px'
                  }}
                >
                  {MONTH_NAMES.map(mName => (
                    <option key={mName} value={`${mName} ${year}`}>
                      {mName} {year}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleNextMonth}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px 4px',
                    transition: 'transform 0.1s ease'
                  }}
                  title="Next Month"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Export Excel Button */}
              <button
                onClick={handleExportExcel}
                className="btn btn-secondary"
                style={{
                  padding: '7px 16px',
                  fontSize: '0.80rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: 8
                }}
              >
                <Download size={14} /> Export Excel
              </button>
            </div>
          </div>

          {/* 5-Item Dynamic Scoreboard Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              textAlign: 'center',
              borderBottom: '1px solid var(--border-subtle)',
              padding: '14px 0',
              gap: 8
            }}
          >
            {/* 1. PRESENT */}
            <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '4px 8px' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38bdf8' }}>
                {monthlyPresentCount}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                PRESENT
              </div>
            </div>

            {/* 2. ON-TIME */}
            <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '4px 8px' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981' }}>
                {monthlyOnTimeCount}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                ON-TIME
              </div>
            </div>

            {/* 3. LATE */}
            <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '4px 8px' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b' }}>
                {monthlyLateCount}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                LATE
              </div>
            </div>

            {/* 4. ABSENT */}
            <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '4px 8px' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ef4444' }}>
                {monthlyAbsentCount}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                ABSENT
              </div>
            </div>

            {/* 5. TOTAL HOURS */}
            <div style={{ padding: '4px 8px' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981' }}>
                {monthlyTotalHoursStr}
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
                TOTAL HOURS
              </div>
            </div>
          </div>

          {/* 7-Day Header Grid (SUN, MON, TUE, WED, THU, FRI, SAT) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              background: '#f4efe6',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#334155',
              letterSpacing: '0.08em',
              padding: '10px 0',
              marginTop: 12,
              borderRadius: '6px 6px 0 0'
            }}
          >
            <div>SUN</div>
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
          </div>

          {/* Dynamic Month-Wise Calendar Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 2,
              background: 'var(--border-subtle)',
              border: '1px solid var(--border-subtle)',
              borderTop: 'none',
              borderRadius: '0 0 6px 6px',
              overflow: 'hidden'
            }}
          >
            {/* Dynamic Leading Offset Cells (based on startDayOfWeek for selected month) */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => (
              <div key={`lead-${idx}`} style={{ minHeight: 84, background: 'var(--bg-card)' }} />
            ))}

            {/* 1 to totalDaysInMonth Day Cells */}
            {monthlyDays.map((d) => {
              let bgColor = 'var(--bg-card)';
              if (d.type === 'absent') {
                bgColor = 'rgba(239, 68, 68, 0.12)';
              } else if (d.type === 'late') {
                bgColor = 'rgba(245, 158, 11, 0.12)';
              } else if (d.type === 'present') {
                bgColor = 'rgba(16, 185, 129, 0.12)';
              }

              return (
                <div
                  key={d.day}
                  style={{
                    background: bgColor,
                    padding: '8px 6px',
                    minHeight: 84,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Day Number */}
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {d.day}
                  </div>

                  {/* Cell Body */}
                  {d.type === 'absent' ? (
                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
                      Absent
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                      <span>In: {d.in}</span>
                      <span>Out: {d.out}</span>
                      <span style={{ fontWeight: 700, color: d.type === 'late' ? '#f59e0b' : '#10b981', marginTop: 1 }}>
                        {d.hours}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Dynamic Trailing Offset Cells */}
            {Array.from({ length: (7 - ((startDayOfWeek + totalDaysInMonth) % 7)) % 7 }).map((_, idx) => (
              <div key={`trail-${idx}`} style={{ minHeight: 84, background: 'var(--bg-card)' }} />
            ))}
          </div>

          {/* Collapsible All-Staff Monthly Summary Matrix Toggle */}
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={() => setShowMatrixTable(!showMatrixTable)}
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 16px' }}
            >
              {showMatrixTable ? '▲ Hide All-Staff Matrix Table' : '▼ View All-Staff Monthly Matrix Table'}
            </button>
          </div>

          {showMatrixTable && (
            <div style={{ marginTop: 18 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 10px 0' }}>
                All Staff Attendance Summary Matrix ({selectedMonth})
              </h4>
              <div className="luxe-table-container" style={{ overflowX: 'auto', width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                <table className="luxe-table" style={{ width: '100%', minWidth: 900 }}>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th style={{ textAlign: 'center' }}>Working Days</th>
                      <th style={{ textAlign: 'center' }}>Present</th>
                      <th style={{ textAlign: 'center' }}>On-Time</th>
                      <th style={{ textAlign: 'center' }}>Late</th>
                      <th style={{ textAlign: 'center' }}>Absent</th>
                      <th style={{ textAlign: 'center' }}>Total Hours</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRoster.map(r => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.employeeId}</div>
                        </td>
                        <td>{r.department}</td>
                        <td style={{ textAlign: 'center' }}>{totalDaysInMonth} Days</td>
                        <td style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 700 }}>{monthlyPresentCount}</td>
                        <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 700 }}>{monthlyOnTimeCount}</td>
                        <td style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 700 }}>{monthlyLateCount}</td>
                        <td style={{ textAlign: 'center', color: '#ef4444', fontWeight: 700 }}>{monthlyAbsentCount}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{monthlyTotalHoursStr}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                            onClick={() => {
                              setInspectorEmployeeId(r.id);
                              window.scrollTo({ top: 120, behavior: 'smooth' });
                            }}
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          3. DAILY TAB: ATTENDANCE RECORDS
          ========================================================================= */}
      {activeTab === 'daily' && (
        <div>
          {/* DATE SELECTION CARD */}
          <div
            className="luxe-card"
            style={{
              padding: '14px 20px',
              marginBottom: 18,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{
              fontSize: '0.70rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 8
            }}>
              DATE SELECTION
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={handlePrevDate}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  minHeight: 0,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Previous Date"
              >
                <ChevronLeft size={16} />
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                padding: '6px 18px',
                borderRadius: 8
              }}>
                <Calendar size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                  {formatDisplayDate(selectedDate)}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'transparent',
                    width: 20,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  title="Change Date"
                />
              </div>

              <button
                onClick={handleNextDate}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  minHeight: 0,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Next Date"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* 4 STAT CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 22
          }}>
            <div className="luxe-card" style={{
              padding: '18px 22px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  TOTAL EMPLOYEES
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                  {totalEmployees}
                </div>
              </div>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4'
              }}>
                <Users size={22} />
              </div>
            </div>

            <div className="luxe-card" style={{
              padding: '18px 22px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  PRESENT
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#10b981', marginTop: 4 }}>
                  {presentCount}
                </div>
              </div>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="luxe-card" style={{
              padding: '18px 22px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  ABSENT
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ef4444', marginTop: 4 }}>
                  {absentCount}
                </div>
              </div>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444'
              }}>
                <XCircle size={22} />
              </div>
            </div>

            <div className="luxe-card" style={{
              padding: '18px 22px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  LATE ARRIVAL
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#f59e0b', marginTop: 4 }}>
                  {lateCount}
                </div>
              </div>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}>
                <Clock size={22} />
              </div>
            </div>
          </div>

          {/* ATTENDANCE RECORDS TABLE */}
          <div className="luxe-card" style={{ padding: '22px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  Attendance Records
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {formatDayName(selectedDate)}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.80rem', padding: '7px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => window.print()}
                >
                  <Download size={14} /> Export
                </button>

                <button
                  onClick={() => setIsManualModalOpen(true)}
                  style={{
                    background: '#00a859',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 18px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 3px 10px rgba(0, 168, 89, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Plus size={15} /> Manual Check-in
                </button>
              </div>
            </div>

            {/* Search & Filter Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 16
            }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name or ID..."
                  style={{ paddingLeft: 34, fontSize: '0.82rem', height: 38, background: 'var(--bg-elevated)' }}
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={15} color="var(--text-muted)" />
                <select
                  className="form-select"
                  style={{ fontSize: '0.80rem', padding: '6px 14px', height: 38, minWidth: 150, background: 'var(--bg-elevated)' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late Arrival</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>
            </div>

            {/* 9-Column Table */}
            <div className="luxe-table-container" style={{ overflowX: 'auto', width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
              <table className="luxe-table" style={{ width: '100%', minWidth: 1100 }}>
                <thead>
                  <tr>
                    <th style={{ whiteSpace: 'nowrap', width: 220 }}>Name</th>
                    <th style={{ whiteSpace: 'nowrap', width: 220 }}>ID</th>
                    <th style={{ whiteSpace: 'nowrap', width: 130 }}>Check-in</th>
                    <th style={{ whiteSpace: 'nowrap', width: 120 }}>Arrival</th>
                    <th style={{ whiteSpace: 'nowrap', width: 120 }}>Check-out</th>
                    <th style={{ whiteSpace: 'nowrap', width: 100 }}>Hours</th>
                    <th style={{ whiteSpace: 'nowrap', width: 100 }}>Mode</th>
                    <th style={{ whiteSpace: 'nowrap', width: 120 }}>Status</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 130 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDailyRoster.map((record) => {
                    const isCheckedIn = record.checkedIn || record.status === 'Present';

                    return (
                      <tr key={record.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={record.avatar}
                              alt=""
                              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                            />
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                              {record.name}
                            </strong>
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {record.employeeId}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleToggleCheckIn(record.id)}
                            style={{
                              background: isCheckedIn ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                              color: isCheckedIn ? '#10b981' : '#38bdf8',
                              border: `1px solid ${isCheckedIn ? 'rgba(16, 185, 129, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
                              padding: '4px 12px',
                              borderRadius: 6,
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isCheckedIn ? <CheckCircle2 size={12} /> : null}
                            {isCheckedIn ? 'Checked In' : 'Check-in'}
                          </button>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.80rem', color: record.clockIn === 'N/A' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: record.clockIn === 'N/A' ? 400 : 600 }}>
                          {record.clockIn}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                          {record.clockOut}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.80rem', color: record.hours === 'N/A' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: record.hours === 'N/A' ? 400 : 600 }}>
                          {record.hours}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {record.mode}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {record.status === 'Absent' && (
                            <span style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                              Absent
                            </span>
                          )}
                          {record.status === 'Present' && (
                            <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                              Present
                            </span>
                          )}
                          {record.status === 'Late' && (
                            <span style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                              Late
                            </span>
                          )}
                          {record.status === 'Half Day' && (
                            <span style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                              Half Day
                            </span>
                          )}
                          {record.status === 'Leave' && (
                            <span style={{ background: 'rgba(212, 175, 55, 0.12)', color: 'var(--gold-primary)', border: '1px solid rgba(212, 175, 55, 0.25)', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                              Leave
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <select
                            className="form-select"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', width: 'auto', background: 'var(--bg-elevated)' }}
                            value={record.status}
                            onChange={(e) => handleStatusChange(record.id, e.target.value)}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Half Day">Half Day</option>
                            <option value="Leave">Leave</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. BIOMETRIC TERMINAL TAB */}
      {activeTab === 'terminal' && (
        <div className="luxe-card" style={{ background: 'linear-gradient(135deg, rgba(20, 23, 34, 0.95) 0%, rgba(26, 31, 46, 0.95) 100%)', border: '1px solid var(--border-gold)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={20} color="var(--gold-primary)" /> Electronic Biometric Shift Punch Terminal
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                One-click shift punch clock for salon staff, artisans, and aesthetic team
              </p>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', fontWeight: 700, background: 'var(--bg-elevated)', padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-gold)' }}>
              Terminal Time: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {dailyRoster.map((emp) => {
              const isClockedIn = emp.checkedIn;

              return (
                <div
                  key={emp.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${isClockedIn ? 'var(--emerald-accent)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold-primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold-primary)' }}>{emp.department}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{emp.branch}</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', padding: 8, borderRadius: 6, fontSize: '0.75rem', marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Clock In:</span>
                      <strong>{emp.clockIn !== 'N/A' ? emp.clockIn : 'Not punched'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Clock Out:</span>
                      <strong>{emp.clockOut !== '--' ? emp.clockOut : 'Not clocked out'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                      <strong>{emp.status}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={`btn ${isClockedIn ? 'btn-danger' : 'btn-gold'}`}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
                      onClick={() => handleToggleCheckIn(emp.id)}
                    >
                      {isClockedIn ? <Square size={13} /> : <Play size={13} />}
                      {isClockedIn ? 'Clock Out Shift' : 'Clock In (Present)'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. LEAVE REQUESTS TAB */}
      {activeTab === 'leaves' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.2rem' }}>Staff Leave Application & Approval Workflow</h3>
            <button className="btn btn-gold" onClick={() => setIsLeaveModalOpen(true)}>
              <Plus size={15} /> Submit New Leave Request
            </button>
          </div>

          <div className="luxe-table-container" style={{ overflowX: 'auto', width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', background: 'var(--bg-card)' }}>
            <table className="luxe-table" style={{ width: '100%', minWidth: 980 }}>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Employee</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Leave Type</th>
                  <th style={{ whiteSpace: 'nowrap', width: 220 }}>Date Range</th>
                  <th>Reason / Justification</th>
                  <th style={{ whiteSpace: 'nowrap', width: 120 }}>Applied On</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Approval Status</th>
                  <th style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>Authorization Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <strong>{leave.employeeName}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ID: {leave.employeeId}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge badge-cyan">{leave.type} Leave</span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}><strong style={{ color: 'var(--text-primary)' }}>{leave.startDate}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{leave.endDate}</strong></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 260 }}>{leave.reason}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{leave.appliedOn}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={`badge ${leave.status === 'Approved' ? 'badge-emerald' : leave.status === 'Pending' ? 'badge-amber' : 'badge-ruby'}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {leave.status === 'Pending' ? (
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            className="btn btn-gold"
                            style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                            onClick={() => updateLeaveStatus(leave.id, 'Approved')}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                            onClick={() => updateLeaveStatus(leave.id, 'Rejected')}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Decision Recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. AUDIT REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="luxe-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 4 }}>Comprehensive Attendance Audit Report</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Payroll compliant biometric audit log with punch deviations & leave balances
              </p>
            </div>
            <button className="btn btn-gold" onClick={() => window.print()}>
              <Download size={14} /> Print / Export Audit Report
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
            <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL SHIFTS SCHEDULED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: 4 }}>144 Shifts</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--emerald-accent)', marginTop: 2 }}>98.6% Completion Rate</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>APPROVED LEAVE ACCRUALS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cyan-accent)', marginTop: 4 }}>6 Days</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>Paid & Training Leaves</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 8 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AVERAGE PUNCTUALITY</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-accent)', marginTop: 4 }}>96.8%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>Exceeds 95% SLA Benchmark</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL CHECK-IN */}
      {isManualModalOpen && (
        <div className="modal-overlay" onClick={() => setIsManualModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.20rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                Manual Attendance Check-in
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsManualModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualCheckInSubmit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Select Employee *</label>
                <select
                  className="form-select"
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                >
                  {dailyRoster.map(e => (
                    <option key={e.id} value={e.id}>{e.name} &bull; {e.department}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mode</label>
                  <select
                    className="form-select"
                    value={manualForm.mode}
                    onChange={(e) => setManualForm({ ...manualForm, mode: e.target.value })}
                  >
                    <option value="Self">Self</option>
                    <option value="Biometric">Biometric</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Check-in Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={manualForm.clockIn}
                    onChange={(e) => setManualForm({ ...manualForm, clockIn: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Check-out Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={manualForm.clockOut}
                    onChange={(e) => setManualForm({ ...manualForm, clockOut: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Attendance Status *</label>
                <select
                  className="form-select"
                  value={manualForm.status}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                >
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Supervisor Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Verified manual punch"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsManualModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#00a859',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '9px 20px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT LEAVE REQUEST */}
      {isLeaveModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLeaveModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.20rem', margin: 0, fontWeight: 700 }}>Submit Staff Leave Request</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsLeaveModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Select Employee *</label>
                <select
                  className="form-select"
                  value={leaveData.employeeId}
                  onChange={(e) => setLeaveData({ ...leaveData, employeeId: e.target.value })}
                >
                  {dailyRoster.map(e => (
                    <option key={e.id} value={e.id}>{e.name} &bull; {e.department}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select
                  className="form-select"
                  value={leaveData.type}
                  onChange={(e) => setLeaveData({ ...leaveData, type: e.target.value })}
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Paid">Paid Annual Vacation</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">From Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={leaveData.startDate}
                    onChange={(e) => setLeaveData({ ...leaveData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={leaveData.endDate}
                    onChange={(e) => setLeaveData({ ...leaveData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Justification *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="State the reason for taking leave..."
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsLeaveModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
