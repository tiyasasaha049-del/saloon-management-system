import React, { useState } from 'react';
import { Download, Printer, Filter, BarChart3, TrendingUp, DollarSign, Package, Award, Calendar } from 'lucide-react';

export default function PartnershipReports({ 
  partners = [], 
  partnerProducts = [], 
  campaigns = [], 
  commissions = [],
  payments = []
}) {
  const [activeReportTab, setActiveReportTab] = useState('partner'); // 'partner', 'product', 'campaign', 'commission'
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState('all');

  // Filtered partners
  const displayPartners = selectedPartnerFilter === 'all' 
    ? partners 
    : partners.filter(p => p.id === parseInt(selectedPartnerFilter));

  // Export to CSV helper
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `partnership_report_${activeReportTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeReportTab === 'partner') {
      csvContent += "Partner ID,Brand,Company,Category,Type,Status,Total Products,Sales (INR),Commission Earned (INR)\n";
      partners.forEach(p => {
        csvContent += `"${p.partner_id}","${p.brand_name}","${p.company_name}","${p.product_category}","${p.partnership_type}","${p.status}","${p.total_products || 0}","${p.total_sales || 0}","${p.commission_earned || 0}"\n`;
      });
    } else if (activeReportTab === 'product') {
      csvContent += "Product ID,Product Name,Brand,Category,SKU,Selling Price (INR),Units Sold,Total Sales (INR),Commission Rate,Earned (INR)\n";
      partnerProducts.forEach(pp => {
        const prod = pp.product || {};
        csvContent += `"${prod.product_id || pp.id}","${prod.name || 'Product'}","${pp.brand_name || ''}","${prod.category || ''}","${prod.sku || ''}","${prod.selling_price || 0}","${pp.total_sales_units || 0}","${pp.total_sales_amount || 0}","${pp.custom_commission_rate || 10}%","${(Number(pp.total_sales_amount || 0) * (pp.custom_commission_rate || 10) / 100).toFixed(2)}"\n`;
      });
    } else if (activeReportTab === 'campaign') {
      csvContent += "Campaign ID,Campaign Name,Brand,Type,Start Date,End Date,Budget (INR),Target Sales (INR),Actual Sales (INR),Status\n";
      campaigns.forEach(c => {
        csvContent += `"${c.campaign_id}","${c.campaign_name}","${c.partner_name || ''}","${c.campaign_type}","${c.start_date}","${c.end_date}","${c.budget || 0}","${c.target_sales || 0}","${c.actual_sales || 0}","${c.status}"\n`;
      });
    } else {
      csvContent += "Commission ID,Brand,Sale Amount (INR),Rate (%),Commission (INR),Period,Status,Payment Status\n";
      commissions.forEach(c => {
        csvContent += `"${c.commission_id || c.id}","${c.partner_name || ''}","${c.sale_amount}","${c.commission_rate}%","${c.commission_amount}","${c.period || ''}","${c.status}","${c.payment_status || 'Pending'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="luxe-card" style={{ padding: '1.5rem' }}>
      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Partnership Analytics & Intelligence
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Comprehensive performance audits for brand collaborations, product velocities, campaigns, and commissions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-outline-gold"
            onClick={handleExportCSV}
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Report Sub-Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        {[
          { key: 'partner', label: 'Partner Performance', icon: Award },
          { key: 'product', label: 'Product Performance', icon: Package },
          { key: 'campaign', label: 'Campaign Performance', icon: TrendingUp },
          { key: 'commission', label: 'Commission & Payouts', icon: DollarSign }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveReportTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px 16px 16px 8px',
                border: isActive ? '1.5px solid rgba(56, 189, 248, 0.55)' : '1px solid transparent',
                borderLeft: isActive ? '3px solid #38bdf8' : '1px solid transparent',
                backgroundColor: isActive ? 'linear-gradient(90deg, rgba(14, 52, 92, 0.85) 0%, rgba(10, 36, 68, 0.6) 100%)' : 'transparent',
                color: isActive ? '#38bdf8' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 0 14px rgba(56, 189, 248, 0.25), inset 0 0 8px rgba(56, 189, 248, 0.12)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={15} style={{ color: isActive ? '#38bdf8' : 'currentColor', filter: isActive ? 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))' : 'none' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Partner Performance Tab */}
      {activeReportTab === 'partner' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="luxe-table" style={{ width: '100%', minWidth: '850px' }}>
            <thead>
              <tr>
                <th>Partner ID</th>
                <th>Company / Brand</th>
                <th>Category</th>
                <th>Type</th>
                <th>Linked Products</th>
                <th>Total Sales (INR)</th>
                <th>Commission Rate</th>
                <th>Commission Earned</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayPartners.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--gold-primary)' }}>{p.partner_id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.brand_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.company_name}</div>
                  </td>
                  <td>{p.product_category}</td>
                  <td style={{ fontSize: '0.82rem' }}>{p.partnership_type}</td>
                  <td style={{ fontWeight: 600 }}>{p.total_products || 0}</td>
                  <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>₹{Number(p.total_sales || 0).toLocaleString()}</td>
                  <td>{p.commission_rate}%</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(p.commission_earned || 0).toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: p.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: p.status === 'Active' ? '#10b981' : '#ef4444'
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Performance Tab */}
      {activeReportTab === 'product' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="luxe-table" style={{ width: '100%', minWidth: '850px' }}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Brand Partner</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Selling Price</th>
                <th>Units Sold</th>
                <th>Gross Revenue</th>
                <th>Comm. %</th>
                <th>Salon Commission</th>
              </tr>
            </thead>
            <tbody>
              {partnerProducts.map(pp => {
                const prod = pp.product || {};
                const salesAmt = Number(pp.total_sales_amount || 0);
                const commRate = pp.custom_commission_rate || 10;
                const earned = (salesAmt * commRate) / 100;
                return (
                  <tr key={pp.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prod.name || 'Salon Product'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {prod.product_id || pp.id}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{pp.brand_name || 'Partner Brand'}</td>
                    <td>{prod.category || 'Beauty'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{prod.sku || 'N/A'}</td>
                    <td>₹{Number(prod.selling_price || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{pp.total_sales_units || 0}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{salesAmt.toLocaleString()}</td>
                    <td>{commRate}%</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>₹{earned.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Campaign Performance Tab */}
      {activeReportTab === 'campaign' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="luxe-table" style={{ width: '100%', minWidth: '850px' }}>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Brand Partner</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Budget (INR)</th>
                <th>Target Sales</th>
                <th>Actual Sales</th>
                <th>Achievement %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const target = Number(c.target_sales || 1);
                const actual = Number(c.actual_sales || 0);
                const pct = Math.min(Math.round((actual / target) * 100), 100);
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.campaign_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold-muted)' }}>{c.campaign_id}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.partner_name || 'Brand'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{c.campaign_type}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {c.start_date ? new Date(c.start_date).toLocaleDateString() : ''} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : ''}
                    </td>
                    <td>₹{Number(c.budget || 0).toLocaleString()}</td>
                    <td>₹{target.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>₹{actual.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', height: '6px', borderRadius: '3px', overflow: 'hidden', width: '50px' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 80 ? '#10b981' : 'var(--gold-primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: c.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                        color: c.status === 'Active' ? '#10b981' : 'var(--gold-primary)'
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Commission & Payouts Tab */}
      {activeReportTab === 'commission' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="luxe-table" style={{ width: '100%', minWidth: '850px' }}>
            <thead>
              <tr>
                <th>Commission ID</th>
                <th>Brand Partner</th>
                <th>Gross Eligible Sale</th>
                <th>Commission Rate</th>
                <th>Commission Amount</th>
                <th>Period</th>
                <th>Approval Status</th>
                <th>Disbursement Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--gold-primary)' }}>
                    {c.commission_id || `COM-${c.id}`}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.partner_name || 'Brand'}</td>
                  <td>₹{Number(c.sale_amount || 0).toLocaleString()}</td>
                  <td>{c.commission_rate}%</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(c.commission_amount || 0).toLocaleString()}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.period || 'Current'}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: c.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                      color: c.status === 'Approved' ? '#10b981' : 'var(--gold-primary)'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: c.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: c.payment_status === 'Paid' ? '#10b981' : '#ef4444'
                    }}>
                      {c.payment_status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
