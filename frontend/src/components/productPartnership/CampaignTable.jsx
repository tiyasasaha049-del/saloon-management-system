import React, { useState } from 'react';
import { Sparkles, Trash2, Edit2, Calendar, Target, TrendingUp, Layers, LayoutGrid, List } from 'lucide-react';
import { PartnershipStatusBadge } from './PartnershipStatusBadge';

export const CampaignTable = ({
  campaigns = [],
  onEdit,
  onDelete,
  currency = '₹',
  loading = false
}) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  if (loading) {
    return (
      <div className="luxe-table-container" style={{ padding: '60px', textAlign: 'center' }}>
        <div className="loader-spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-secondary)' }}>Loading campaigns...</div>
      </div>
    );
  }

  if (campaigns.length === 0) {
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
        <Sparkles size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>No Campaigns Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 460, margin: '0 auto' }}>
          Create co-marketing promotional campaigns with brand partners to drive footfall, retail product sales, and commission.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* View Switcher Controls */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14, gap: 6 }}>
        <button
          className={`btn ${viewMode === 'grid' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          onClick={() => setViewMode('grid')}
          title="Grid View"
        >
          <LayoutGrid size={14} /> Cards
        </button>
        <button
          className={`btn ${viewMode === 'table' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          onClick={() => setViewMode('table')}
          title="Table View"
        >
          <List size={14} /> Table
        </button>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {campaigns.map((c) => {
            const target = Number(c.target_sales || 1);
            const actual = Number(c.actual_sales || 0);
            const progress = Math.min(100, Math.round((actual / target) * 100));

            return (
              <div
                key={c.id}
                className="luxe-card"
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          color: 'var(--gold-primary)',
                          background: 'var(--gold-subtle)',
                          padding: '2px 6px',
                          borderRadius: 4
                        }}
                      >
                        {c.campaign_code || c.id}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: 6, marginBottom: 2 }}>
                        {c.name}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Partner: <strong style={{ color: 'var(--gold-light)' }}>{c.partner_name || 'Brand Partner'}</strong>
                      </div>
                    </div>
                    <PartnershipStatusBadge status={c.status} />
                  </div>

                  {c.description && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '8px 0 12px', lineHeight: 1.4 }}>
                      {c.description}
                    </p>
                  )}

                  {/* Dates & Promo Tag */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} /> {c.start_date} to {c.end_date}
                    </span>
                    {c.promo_code && (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--gold-primary)',
                          background: 'var(--gold-subtle)',
                          padding: '2px 8px',
                          borderRadius: 4
                        }}
                      >
                        Code: {c.promo_code}
                      </span>
                    )}
                    {Number(c.discount || 0) > 0 && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--rose-accent)', fontWeight: 600 }}>
                        {c.discount}% Discount
                      </span>
                    )}
                  </div>

                  {/* Target Sales Progress */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Sales Target Progress</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {currency}{actual.toLocaleString('en-IN')} / {currency}{target.toLocaleString('en-IN')} ({progress}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: progress >= 100 ? 'var(--emerald-accent)' : 'var(--gold-gradient)',
                          borderRadius: 3
                        }}
                      />
                    </div>
                  </div>

                  {/* Marketing Channels */}
                  {Array.isArray(c.marketing_channels) && c.marketing_channels.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                      {c.marketing_channels.map((ch, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 12
                  }}
                >
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Budget: {currency}{Number(c.budget || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {onEdit && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        onClick={() => onEdit(c)}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--ruby-accent)' }}
                        onClick={() => onDelete(c.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="luxe-table-container" style={{ overflowX: 'auto' }}>
          <table className="luxe-table">
            <thead>
              <tr>
                <th>Campaign ID</th>
                <th>Campaign Name</th>
                <th>Partner</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Budget</th>
                <th>Discount</th>
                <th>Target</th>
                <th>Sales</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.82rem' }}>
                      {c.campaign_code || c.id}
                    </span>
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.partner_name || 'Brand Partner'}</td>
                  <td><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.campaign_type}</span></td>
                  <td>{c.start_date}</td>
                  <td>{c.end_date}</td>
                  <td>{currency}{Number(c.budget || 0).toLocaleString('en-IN')}</td>
                  <td>{c.discount ? `${c.discount}%` : '—'}</td>
                  <td>{currency}{Number(c.target_sales || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <strong style={{ color: 'var(--emerald-accent)' }}>
                      {currency}{Number(c.actual_sales || 0).toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td><PartnershipStatusBadge status={c.status} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {onEdit && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          onClick={() => onEdit(c)}
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--ruby-accent)' }}
                          onClick={() => onDelete(c.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
