import React from 'react';
import { Eye, Edit2, Power, ExternalLink, Building2, Package, Sparkles } from 'lucide-react';
import { PartnershipStatusBadge } from './PartnershipStatusBadge';

export const PartnerTable = ({
  partners = [],
  onViewDetails,
  onEdit,
  onEditPartner,
  onAddPartner,
  onToggleStatus,
  currency = '₹',
  loading = false
}) => {
  const handleEdit = onEdit || onEditPartner;
  if (loading) {
    return (
      <div className="luxe-table-container" style={{ padding: '60px', textAlign: 'center' }}>
        <div className="loader-spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading brand partners...</div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div
        className="luxe-card"
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>No Brand Partners Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 460, margin: '0 auto' }}>
          No collaborating brands match your active filters. Onboard a new beauty or product partner to start tracking joint promotions and sales commissions.
        </p>
      </div>
    );
  }

  return (
    <div className="luxe-table-container" style={{ overflowX: 'auto' }}>
      <table className="luxe-table">
        <thead>
          <tr>
            <th>Partner ID</th>
            <th>Company / Brand</th>
            <th>Contact Person</th>
            <th>Category</th>
            <th>Partnership Type</th>
            <th>Duration</th>
            <th>Products</th>
            <th>Total Sales</th>
            <th>Commission</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => {
            const isActive = partner.status === 'Active';
            return (
              <tr key={partner.id}>
                <td>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'var(--gold-primary)',
                      fontSize: '0.82rem',
                      background: 'var(--gold-subtle)',
                      padding: '2px 6px',
                      borderRadius: 4
                    }}
                  >
                    {partner.partner_code || partner.id}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.brand_name}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          objectFit: 'cover',
                          border: '1px solid var(--border-subtle)'
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: 'var(--gold-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      >
                        {partner.brand_name?.[0] || 'P'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                        {partner.brand_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {partner.company_name}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    {partner.contact_person || '—'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {partner.email || partner.phone || ''}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {partner.category || 'Beauty Care'}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      padding: '3px 8px',
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {partner.partnership_type || 'Product Supply'}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {partner.start_date || '—'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    to {partner.end_date || 'Open'}
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    {partner.products_count || 0} Products
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--emerald-accent)', fontSize: '0.88rem' }}>
                    {currency}{Number(partner.total_sales || 0).toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.88rem' }}>
                    {partner.commission_rate}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Earned: {currency}{Number(partner.commission_earned || 0).toLocaleString('en-IN')}
                  </div>
                </td>
                <td>
                  <PartnershipStatusBadge status={partner.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                      onClick={() => onViewDetails(partner)}
                      title="View Partner Details & Tabs"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                      onClick={() => handleEdit && handleEdit(partner)}
                      title="Edit Partner Profile"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className={`btn ${isActive ? 'btn-secondary' : 'btn-gold'}`}
                      style={{
                        padding: '5px 8px',
                        fontSize: '0.75rem',
                        color: isActive ? 'var(--ruby-accent)' : 'inherit'
                      }}
                      onClick={() => onToggleStatus(partner)}
                      title={isActive ? 'Deactivate / Suspend Partner' : 'Activate Partner'}
                    >
                      <Power size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
