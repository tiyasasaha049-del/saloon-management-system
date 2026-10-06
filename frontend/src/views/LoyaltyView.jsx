import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Award,
  Crown,
  Star,
  Gift,
  CheckCircle,
  Plus,
  Users,
  Search,
  Sparkles
} from 'lucide-react';

export const LoyaltyView = () => {
  const {
    loyaltyTiers,
    membershipPlans,
    customers,
    settings,
    globalSearch
  } = useSalon();

  const [activeTab, setActiveTab] = useState('TIERS'); // 'TIERS' | 'PLANS' | 'MEMBERS'

  const filteredMembers = customers.filter(c => {
    return (
      !globalSearch ||
      c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.tier.toLowerCase().includes(globalSearch.toLowerCase())
    );
  });

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Privilege Club & <span className="gold-text-gradient">Loyalty Tiers</span>
          </h2>
          <p>VIP membership packages, spending milestone tiers, loyalty points ledger & rewards</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button
          className={`btn ${activeTab === 'TIERS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('TIERS')}
        >
          <Crown size={14} /> VIP Membership Tiers
        </button>
        <button
          className={`btn ${activeTab === 'PLANS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('PLANS')}
        >
          <Gift size={14} /> Annual Passes & Packages ({membershipPlans.length})
        </button>
        <button
          className={`btn ${activeTab === 'MEMBERS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('MEMBERS')}
        >
          <Users size={14} /> Enrolled Client Ledger
        </button>
      </div>

      {activeTab === 'TIERS' ? (
        /* VIP Tiers Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {loyaltyTiers.map((tier) => (
            <div
              key={tier.id}
              className="luxe-card"
              style={{
                borderTop: `4px solid ${tier.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '1.25rem', color: tier.color }}>{tier.name}</h3>
                  <Award size={20} color={tier.color} />
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  MINIMUM ANNUAL SPEND
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
                  {settings.currency}{tier.minSpend.toLocaleString()}
                </div>

                <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Privilege Discount:</span>
                    <strong style={{ color: 'var(--emerald-accent)' }}>{tier.discountPct}% OFF</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Point Multiplier:</span>
                    <strong style={{ color: 'var(--gold-primary)' }}>{tier.pointMultiplier}x Pts</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Curated Privileges
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.82rem' }}>
                  {tier.benefits.map((b, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CheckCircle size={14} color="var(--gold-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {customers.filter(c => c.tier === tier.name).length} Clients Currently in {tier.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'PLANS' ? (
        /* Membership Packages */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {membershipPlans.map((plan) => (
            <div key={plan.id} className="luxe-card" style={{ border: '1px solid var(--border-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem' }}>{plan.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gold-primary)' }}>
                    Validity: {plan.validityMonths} Months
                  </div>
                </div>
                <span className="badge badge-gold">Annual Club</span>
              </div>

              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                {settings.currency}{plan.price} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ subscription</span>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
                Package Inclusions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {plan.includedServices.map((svc, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                    <Sparkles size={14} color="var(--gold-primary)" />
                    <span>{svc}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Active Members: <strong>{plan.activeSubscribers}</strong>
                </span>
                <button className="btn btn-gold" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
                  Enroll Client
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Enrolled Clients Ledger */
        <div className="luxe-table-container">
          <table className="luxe-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Current Privilege Tier</th>
                <th>Accrued Loyalty Points</th>
                <th>Points Value</th>
                <th>Annual Spend</th>
                <th>Lifetime Visits</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td>
                    <span className={`badge ${m.tier === 'Platinum VIP' ? 'badge-gold' : m.tier === 'Gold' ? 'badge-amber' : 'badge-gray'}`}>
                      {m.tier}
                    </span>
                  </td>
                  <td><strong style={{ color: 'var(--cyan-accent)' }}>{m.loyaltyPoints} Pts</strong></td>
                  <td>{settings.currency}{(m.loyaltyPoints * settings.loyaltyRedeemValue).toFixed(2)}</td>
                  <td style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>
                    {settings.currency}{m.totalSpent}
                  </td>
                  <td>{m.visitsCount} visits</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
