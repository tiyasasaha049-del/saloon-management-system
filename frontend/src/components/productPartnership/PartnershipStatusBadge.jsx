import React from 'react';

export const PartnershipStatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  let badgeClass = 'badge-secondary';
  let dotColor = 'var(--text-muted)';

  switch (normalized) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'PAID':
    case 'COMPLETED':
      badgeClass = 'badge-emerald';
      dotColor = 'var(--emerald-accent)';
      break;
    case 'PENDING':
    case 'UNDER REVIEW':
    case 'SCHEDULED':
    case 'CALCULATED':
    case 'PROCESSING':
      badgeClass = 'badge-amber';
      dotColor = 'var(--amber-accent)';
      break;
    case 'EXPIRED':
    case 'SUSPENDED':
    case 'REJECTED':
    case 'CANCELLED':
    case 'FAILED':
      badgeClass = 'badge-ruby';
      dotColor = 'var(--ruby-accent)';
      break;
    case 'DRAFT':
    case 'INACTIVE':
    case 'DISCONTINUED':
    default:
      badgeClass = 'badge-secondary';
      dotColor = 'var(--text-muted)';
      break;
  }

  return (
    <span
      className={`badge ${badgeClass}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.3px',
        textTransform: 'capitalize'
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: dotColor
        }}
      />
      {status || 'Unknown'}
    </span>
  );
};

export default PartnershipStatusBadge;
