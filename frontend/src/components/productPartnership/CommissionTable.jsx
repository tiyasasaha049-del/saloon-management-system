import React from 'react';
import { DollarSign, CheckCircle2, CreditCard, Clock, FileText } from 'lucide-react';
import { PartnershipStatusBadge } from './PartnershipStatusBadge';

export const CommissionTable = ({
  commissions = [],
  onApprove,
  onPay,
  currency = '₹',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="luxe-table-container" style={{ padding: '60px', textAlign: 'center' }}>
        <div className="loader-spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-secondary)' }}>Loading commission ledgers...</div>
      </div>
    );
  }

  if (commissions.length === 0) {
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
        <DollarSign size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>No Commission Records Found</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 460, margin: '0 auto' }}>
          When partner products are sold in the salon or customer invoices are generated, commissions are calculated automatically according to agreed brand terms.
        </p>
      </div>
    );
  }

  return (
    <div className="luxe-table-container" style={{ overflowX: 'auto' }}>
      <table className="luxe-table">
        <thead>
          <tr>
            <th>Commission ID</th>
            <th>Partner</th>
            <th>Product / Service</th>
            <th>Campaign</th>
            <th>Sale Amount</th>
            <th>Commission %</th>
            <th>Commission Amount</th>
            <th>Period</th>
            <th>Approval Status</th>
            <th>Payout Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((cm) => {
            const isCalculated = cm.status === 'Calculated' || cm.status === 'Pending';
            const isApproved = cm.status === 'Approved' && cm.payment_status !== 'Paid';
            const isPaid = cm.payment_status === 'Paid' || cm.status === 'Paid';

            return (
              <tr key={cm.id}>
                <td>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'var(--gold-primary)',
                      fontSize: '0.82rem'
                    }}
                  >
                    {cm.id}
                  </span>
                  {cm.invoice_number && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Inv: {cm.invoice_number}
                    </div>
                  )}
                </td>
                <td>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    {cm.partner_name || 'Brand Partner'}
                  </strong>
                </td>
                <td>
                  <span style={{ fontSize: '0.84rem' }}>
                    {cm.product_name || 'All Eligible Products'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {cm.campaign_name || 'Standard Retail'}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>
                    {currency}{Number(cm.sale_amount || 0).toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
                    {cm.commission_rate}%
                  </span>
                </td>
                <td>
                  <strong style={{ color: 'var(--emerald-accent)', fontSize: '0.92rem' }}>
                    {currency}{Number(cm.commission_amount || 0).toLocaleString('en-IN')}
                  </strong>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {cm.period}
                  </span>
                </td>
                <td>
                  <PartnershipStatusBadge status={cm.status} />
                </td>
                <td>
                  <PartnershipStatusBadge status={cm.payment_status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    {isCalculated && onApprove && (
                      <button
                        className="btn btn-gold"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => onApprove(cm.id)}
                        title="Approve Commission Calculation"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                    )}
                    {isApproved && onPay && (
                      <button
                        className="btn btn-emerald"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          background: 'var(--emerald-accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 'var(--radius-xs)'
                        }}
                        onClick={() => onPay(cm)}
                        title="Disburse Payout & Record Transaction"
                      >
                        <CreditCard size={13} /> Pay Now
                      </button>
                    )}
                    {isPaid && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--emerald-accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} /> Settled
                      </span>
                    )}
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
