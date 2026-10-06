import React from 'react';
import PartnershipStatusBadge from './PartnershipStatusBadge';
import { CreditCard, Calendar, Hash, ArrowUpRight, DollarSign } from 'lucide-react';

export default function PartnershipPaymentTable({ payments = [], onRecordPayment, onViewDetails }) {
  return (
    <div className="luxe-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            Partnership Payouts & Disbursements
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Audit trail of commission disbursements, bank transfers, and settlements with brand partners
          </p>
        </div>
        {onRecordPayment && (
          <button 
            type="button" 
            className="btn btn-gold" 
            onClick={onRecordPayment}
          >
            <CreditCard size={16} />
            Record Payment
          </button>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="luxe-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Partner</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Method</th>
              <th>Reference / Txn #</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <DollarSign size={36} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                  <div>No payment settlements recorded yet</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Commission payments to brand partners will appear here</div>
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--gold-primary)', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                      {p.payment_id || `PAY-${String(p.id).padStart(4, '0')}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.partner_name || `Partner #${p.partner_id}`}
                    </div>
                    {p.commission_id && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Linked: COM-{p.commission_id}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.98rem' }}>
                      ₹{Number(p.amount || 0).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={13} style={{ color: 'var(--gold-muted)' }} />
                      {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '0.2rem 0.55rem', 
                      borderRadius: '4px', 
                      fontSize: '0.78rem', 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)'
                    }}>
                      {p.payment_method || 'Bank Transfer'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {p.reference_number || '—'}
                    </span>
                  </td>
                  <td>
                    <PartnershipStatusBadge status={p.status || 'Paid'} />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '160px', display: 'inline-block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={p.notes}>
                      {p.notes || '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
