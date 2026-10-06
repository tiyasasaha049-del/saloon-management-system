import React from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Package,
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const PartnershipStats = ({
  stats,
  totalPartners = 0,
  activePartners = 0,
  pendingRequests = 0,
  partnerProductsCount = 0,
  activeCampaigns = 0,
  totalSales = 0,
  commissionEarned = 0,
  pendingCommission = 0,
  currency = '₹'
}) => {
  // If a unified stats or partnershipOverview object was passed, extract values
  const effectiveTotalPartners = stats?.total_partners ?? stats?.totalPartners ?? totalPartners;
  const effectiveActivePartners = stats?.active_partners ?? stats?.activePartners ?? activePartners;
  const effectivePendingRequests = stats?.pending_requests ?? stats?.pendingRequests ?? pendingRequests;
  const effectiveProductsCount = stats?.partner_products_count ?? stats?.partnerProductsCount ?? partnerProductsCount;
  const effectiveActiveCampaigns = stats?.active_campaigns ?? stats?.activeCampaigns ?? activeCampaigns;
  const effectiveTotalSales = stats?.total_sales ?? stats?.totalSales ?? totalSales;
  const effectiveCommissionEarned = stats?.commission_earned ?? stats?.commissionEarned ?? commissionEarned;
  const effectivePendingCommission = stats?.pending_commission ?? stats?.pendingCommission ?? pendingCommission;
  const cards = [
    {
      label: 'Total Partners',
      value: effectiveTotalPartners,
      icon: Building2,
      subtext: `${effectiveActivePartners} currently active`,
      color: 'var(--gold-primary)',
      bg: 'rgba(56, 189, 248, 0.08)'
    },
    {
      label: 'Active Partnerships',
      value: effectiveActivePartners,
      icon: CheckCircle2,
      subtext: 'Operational collaborations',
      color: 'var(--emerald-accent)',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      label: 'Pending Requests',
      value: effectivePendingRequests,
      icon: Clock,
      subtext: 'Awaiting admin review',
      color: 'var(--amber-accent)',
      bg: 'rgba(245, 158, 11, 0.08)'
    },
    {
      label: 'Partner Products',
      value: effectiveProductsCount,
      icon: Package,
      subtext: 'Linked retail & backbar',
      color: 'var(--gold-light)',
      bg: 'rgba(125, 211, 252, 0.08)'
    },
    {
      label: 'Active Campaigns',
      value: effectiveActiveCampaigns,
      icon: Sparkles,
      subtext: 'Joint co-promotions',
      color: 'var(--rose-accent)',
      bg: 'rgba(244, 63, 94, 0.08)'
    },
    {
      label: 'Total Partner Sales',
      value: `${currency}${Number(effectiveTotalSales).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      subtext: 'Gross merchandise revenue',
      color: 'var(--emerald-accent)',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      label: 'Commission Earned',
      value: `${currency}${Number(effectiveCommissionEarned).toLocaleString('en-IN')}`,
      icon: DollarSign,
      subtext: 'Calculated salon revenue',
      color: 'var(--gold-primary)',
      bg: 'rgba(56, 189, 248, 0.08)'
    },
    {
      label: 'Pending Commission',
      value: `${currency}${Number(effectivePendingCommission).toLocaleString('en-IN')}`,
      icon: AlertCircle,
      subtext: 'Unsettled payout balance',
      color: 'var(--amber-accent)',
      bg: 'rgba(245, 158, 11, 0.08)'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="luxe-card"
            style={{
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0
              }}
            >
              <Icon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 4
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: 4,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
