import React, { useState } from 'react';
import PartnershipStatusBadge from './PartnershipStatusBadge';
import { Inbox, CheckCircle, XCircle, HelpCircle, Eye, Calendar, Mail, Phone, Building } from 'lucide-react';

export default function PartnershipRequestsTable({ requests = [], onApprove, onReject, onRequestInfo }) {
  const [selectedReq, setSelectedReq] = useState(null);

  return (
    <div className="luxe-card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            Inbound Brand Collaboration Proposals
          </h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Review, vet, and approve partnership requests submitted by luxury cosmetic and haircare brands
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="luxe-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Company & Brand</th>
              <th>Contact Person</th>
              <th>Category</th>
              <th>Requested Type</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Inbox size={36} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                  <div>No partnership proposals currently pending review</div>
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--gold-primary)', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                      {r.request_id || `REQ-${String(r.id).padStart(4, '0')}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.company_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gold-muted)' }}>{r.brand_name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{r.contact_person}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.product_category}</span>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      color: 'var(--gold-primary)'
                    }}>
                      {r.requested_partnership_type || 'Brand Promotion'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} />
                      {r.submitted_date ? new Date(r.submitted_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <PartnershipStatusBadge status={r.status} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedReq(r)}
                        title="View Proposal Details"
                        style={{
                          background: 'none',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          padding: '0.35rem 0.6rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        <Eye size={13} /> View
                      </button>

                      {r.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onApprove && onApprove(r.id)}
                            title="Approve Partnership"
                            style={{
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '6px',
                              padding: '0.35rem 0.6rem',
                              color: '#10b981',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject && onReject(r.id)}
                            title="Reject Proposal"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              padding: '0.35rem 0.6rem',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.75rem'
                            }}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Proposal Details Modal */}
      {selectedReq && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="luxe-card" style={{ width: '100%', maxWidth: '560px', padding: '1.75rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontFamily: 'monospace' }}>
                  {selectedReq.request_id}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                  {selectedReq.company_name} - {selectedReq.brand_name}
                </h3>
              </div>
              <PartnershipStatusBadge status={selectedReq.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.78rem' }}>CONTACT PERSON:</strong>
                {selectedReq.contact_person}
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.78rem' }}>EMAIL:</strong>
                {selectedReq.email}
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.78rem' }}>PHONE:</strong>
                {selectedReq.phone || 'N/A'}
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.78rem' }}>PARTNERSHIP TYPE:</strong>
                {selectedReq.requested_partnership_type}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gold-primary)', marginBottom: '0.35rem' }}>
                PROPOSAL & COLLABORATION SUMMARY
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {selectedReq.proposal || 'No additional proposal description submitted.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              {selectedReq.status === 'Pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onReject && onReject(selectedReq.id);
                      setSelectedReq(null);
                    }}
                    style={{
                      padding: '0.55rem 1.2rem',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Reject Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onApprove && onApprove(selectedReq.id);
                      setSelectedReq(null);
                    }}
                    className="btn-gold"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <CheckCircle size={15} /> Approve & Onboard Partner
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
