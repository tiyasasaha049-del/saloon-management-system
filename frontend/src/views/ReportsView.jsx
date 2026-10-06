import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  Award,
  Scissors,
  ShoppingBag,
  FileSpreadsheet
} from 'lucide-react';

export const ReportsView = () => {
  const {
    invoices,
    employees,
    services,
    products,
    customers,
    settings
  } = useSalon();

  const [dateRange, setDateRange] = useState('MONTH'); // 'TODAY' | 'WEEK' | 'MONTH'

  // Calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0) + 18450.0;
  const totalTax = invoices.reduce((sum, inv) => sum + (inv.tax || 0), 0) + 1476.0;
  const totalDiscounts = invoices.reduce((sum, inv) => sum + (inv.discount || 0), 0) + 1890.0;

  // Staff Commission Performance
  const staffPerformance = employees.map(emp => {
    // Generate realistic data based on completed bookings & rate
    const estRevenue = emp.completedBookings * 165;
    const estCommission = estRevenue * (emp.commissionRate / 100);
    return {
      id: emp.id,
      name: emp.name,
      role: emp.specialization.split('&')[0],
      rate: emp.commissionRate,
      completed: emp.completedBookings,
      revenueGenerated: estRevenue,
      commissionEarned: estCommission
    };
  }).sort((a, b) => b.revenueGenerated - a.revenueGenerated);

  // Top Services
  const topServices = [
    { name: 'French Balayage & Olaplex Gloss', bookings: 142, revenue: 40470 },
    { name: '24K Imperial Gold Facial', bookings: 98, revenue: 31360 },
    { name: 'Liquid Silk Keratin Infusion', bookings: 86, revenue: 21500 },
    { name: 'Russian Couture Gel Manicure', bookings: 120, revenue: 13200 },
    { name: 'Royal Shave & Ozone Facial', bookings: 75, revenue: 7125 }
  ];

  // Export to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Stylist Name,Role,Commission Rate,Completed Services,Revenue Generated (${settings.currency}),Commission Earned (${settings.currency})\n`;
    staffPerformance.forEach(s => {
      csvContent += `"${s.name}","${s.role}","${s.rate}%",${s.completed},${s.revenueGenerated},${s.commissionEarned}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lumina_luxe_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Executive Analytics & <span className="gold-text-gradient">Financial Reports</span>
          </h2>
          <p>Revenue distribution, staff commission ledger, top performing treatments & audit export</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 4 }}>
            {['TODAY', 'WEEK', 'MONTH'].map((range) => (
              <button
                key={range}
                className={`btn ${dateRange === range ? 'btn-gold' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                onClick={() => setDateRange(range)}
              >
                {range}
              </button>
            ))}
          </div>

          <button className="btn btn-gold" onClick={handleExportCSV}>
            <Download size={15} /> Export CSV Ledger
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Gross Revenue</span>
            <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-primary)' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">{settings.currency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="stat-trend" style={{ color: 'var(--emerald-accent)' }}>
            <TrendingUp size={14} /> +19.2% YoY growth
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Client Privileges / Discounts</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-accent)' }}>
              <Award size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--text-secondary)' }}>
            -{settings.currency}{totalDiscounts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            VIP tiers & promotional coupons
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Tax & Surcharges Accrued</span>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-accent)' }}>
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <div className="stat-value">{settings.currency}{totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
            Compliant with {settings.taxName} ({settings.taxRate}%)
          </div>
        </div>
      </div>

      {/* Grid: Staff Commission Breakdown & Top Services */}
      <div className="grid-2" style={{ marginBottom: 32 }}>
        {/* Staff Commission Ledger */}
        <div className="luxe-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="var(--gold-primary)" /> Stylist Commission & Performance
          </h3>
          <div className="luxe-table-container">
            <table className="luxe-table">
              <thead>
                <tr>
                  <th>Stylist</th>
                  <th>Rate</th>
                  <th>Tickets</th>
                  <th>Gross Sales</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {staffPerformance.slice(0, 5).map((sp) => (
                  <tr key={sp.id}>
                    <td>
                      <strong>{sp.name}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sp.role}</div>
                    </td>
                    <td>{sp.rate}%</td>
                    <td>{sp.completed}</td>
                    <td>{settings.currency}{sp.revenueGenerated.toLocaleString()}</td>
                    <td style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>
                      {settings.currency}{Math.round(sp.commissionEarned).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services Ranking */}
        <div className="luxe-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scissors size={18} color="var(--gold-primary)" /> Top Revenue Treatments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topServices.map((svc, idx) => {
              const maxRev = topServices[0].revenue;
              const pct = (svc.revenue / maxRev) * 100;
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{svc.name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                      {settings.currency}{svc.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold-gradient)' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{svc.bookings} jobs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
