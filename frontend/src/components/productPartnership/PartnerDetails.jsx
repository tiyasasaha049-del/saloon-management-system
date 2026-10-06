import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Package,
  Sparkles,
  DollarSign,
  CreditCard,
  FileText,
  Activity,
  Calendar,
  Phone,
  Mail,
  Globe,
  MapPin,
  TrendingUp,
  Tag,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { PartnershipStatusBadge } from './PartnershipStatusBadge';
import { apiService } from '../../services/api';

export const PartnerDetails = ({
  partner,
  partnerId,
  partnerProducts = [],
  campaigns = [],
  commissions = [],
  payments = [],
  onClose,
  onEdit,
  currency = '₹'
}) => {
  const effectivePartnerId = partner?.id || partnerId;
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(!partner);
  const [partnerData, setPartnerData] = useState(() => {
    if (partner) {
      return {
        ...partner,
        products: partnerProducts.length > 0 ? partnerProducts : (partner.products || []),
        campaigns: campaigns.length > 0 ? campaigns : (partner.campaigns || []),
        commissions: commissions.length > 0 ? commissions : (partner.commissions || []),
        payments: payments.length > 0 ? payments : (partner.payments || []),
        documents: partner.documents || [],
        activity_logs: partner.activity_logs || []
      };
    }
    return null;
  });

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      if (!partner) setLoading(true);
      try {
        const data = await apiService.getProductPartnerDetails(effectivePartnerId);
        if (isMounted) setPartnerData(data);
      } catch (err) {
        console.warn('Could not load partner details from backend, falling back:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    if (effectivePartnerId) loadDetails();
    return () => { isMounted = false; };
  }, [effectivePartnerId, partner]);

  if (!effectivePartnerId) return null;

  const tabs = [
    { id: 'Overview', label: 'Overview', icon: Building2 },
    { id: 'Products', label: `Products (${partnerData?.products?.length || 0})`, icon: Package },
    { id: 'Campaigns', label: `Campaigns (${partnerData?.campaigns?.length || 0})`, icon: Sparkles },
    { id: 'Commission', label: `Commission (${partnerData?.commissions?.length || 0})`, icon: DollarSign },
    { id: 'Payments', label: `Payments (${partnerData?.payments?.length || 0})`, icon: CreditCard },
    { id: 'Documents', label: `Documents (${partnerData?.documents?.length || 0})`, icon: FileText },
    { id: 'Activity', label: `Activity (${partnerData?.activity_logs?.length || 0})`, icon: Activity }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content luxe-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 950,
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            background: 'var(--bg-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {partnerData?.logo_url ? (
              <img
                src={partnerData.logo_url}
                alt={partnerData.brand_name}
                style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
              />
            ) : (
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 10,
                  background: 'var(--gold-subtle)',
                  color: 'var(--gold-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.4rem'
                }}
              >
                {partnerData?.brand_name?.[0] || 'P'}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
                  {partnerData?.brand_name || 'Partner Profile'}
                </h2>
                <PartnershipStatusBadge status={partnerData?.status} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {partnerData?.company_name} • <span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)' }}>{partnerData?.partner_code}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onEdit && (
              <button
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => {
                  onClose();
                  onEdit(partnerData);
                }}
              >
                Edit Partner
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: '10px 24px 0',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            overflowX: 'auto'
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: '8px 16px 16px 8px',
                  border: isActive ? '1.5px solid rgba(56, 189, 248, 0.55)' : '1px solid transparent',
                  borderLeft: isActive ? '3px solid #38bdf8' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(90deg, rgba(14, 52, 92, 0.85) 0%, rgba(10, 36, 68, 0.6) 100%)' : 'transparent',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 14px rgba(56, 189, 248, 0.25), inset 0 0 8px rgba(56, 189, 248, 0.12)' : 'none'
                }}
              >
                <Icon size={15} style={{ color: isActive ? '#38bdf8' : 'currentColor', filter: isActive ? 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))' : 'none' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="loader-spinner" style={{ margin: '0 auto 16px' }} />
              <div style={{ color: 'var(--text-secondary)' }}>Loading partner details...</div>
            </div>
          ) : !partnerData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Partner data could not be retrieved.
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'Overview' && (
                <div>
                  {/* Top Stats Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, marginBottom: 24 }}>
                    <div className="luxe-card" style={{ padding: '14px 16px', background: 'var(--bg-elevated)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Partner Sales</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--emerald-accent)', marginTop: 4 }}>
                        {currency}{Number(partnerData.total_sales || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="luxe-card" style={{ padding: '14px 16px', background: 'var(--bg-elevated)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Commission Earned</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--gold-primary)', marginTop: 4 }}>
                        {currency}{Number(partnerData.commission_earned || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="luxe-card" style={{ padding: '14px 16px', background: 'var(--bg-elevated)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Settlement</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--amber-accent)', marginTop: 4 }}>
                        {currency}{Number(partnerData.pending_commission || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="luxe-card" style={{ padding: '14px 16px', background: 'var(--bg-elevated)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Commission Term</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                        {partnerData.commission_rate}% {partnerData.commission_type}
                      </div>
                    </div>
                  </div>

                  {/* Information Grids */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
                    {/* Company & Contact Info */}
                    <div className="luxe-card" style={{ padding: '18px 20px', background: 'var(--bg-elevated)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', marginBottom: 14 }}>
                        Company & Contact Info
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.84rem' }}>
                        <div><strong>Legal Entity:</strong> {partnerData.company_name}</div>
                        <div><strong>Contact Person:</strong> {partnerData.contact_person || '—'}</div>
                        <div><strong>Phone:</strong> {partnerData.phone || '—'}</div>
                        <div><strong>Email:</strong> {partnerData.email || '—'}</div>
                        <div><strong>GST / Tax ID:</strong> {partnerData.tax_id || '—'}</div>
                        <div><strong>Address:</strong> {partnerData.address ? `${partnerData.address}, ${partnerData.city}, ${partnerData.state}` : '—'}</div>
                        <div><strong>Website:</strong> {partnerData.website ? <a href={partnerData.website} target="_blank" rel="noreferrer" style={{ color: 'var(--gold-primary)' }}>{partnerData.website}</a> : '—'}</div>
                      </div>
                    </div>

                    {/* Partnership Agreement Info */}
                    <div className="luxe-card" style={{ padding: '18px 20px', background: 'var(--bg-elevated)' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', marginBottom: 14 }}>
                        Partnership Terms & Agreement
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.84rem' }}>
                        <div><strong>Category:</strong> {partnerData.category}</div>
                        <div><strong>Partnership Type:</strong> {partnerData.partnership_type}</div>
                        <div><strong>Contract Duration:</strong> {partnerData.start_date || '—'} to {partnerData.end_date || 'Open'}</div>
                        <div><strong>Commission Rate:</strong> {partnerData.commission_rate}% ({partnerData.commission_type})</div>
                        <div><strong>Revenue Share:</strong> {partnerData.revenue_share}%</div>
                        <div><strong>Payment Terms:</strong> {partnerData.payment_terms}</div>
                        <div><strong>Status:</strong> <PartnershipStatusBadge status={partnerData.status} /></div>
                      </div>
                    </div>
                  </div>

                  {/* Description & Notes */}
                  {partnerData.description && (
                    <div className="luxe-card" style={{ marginTop: 20, padding: '16px 20px', background: 'var(--bg-elevated)' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Collaboration Scope & Description:
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                        {partnerData.description}
                      </p>
                    </div>
                  )}

                  {partnerData.notes && (
                    <div className="luxe-card" style={{ marginTop: 14, padding: '16px 20px', background: 'var(--bg-elevated)' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Internal Salon Notes:
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                        {partnerData.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRODUCTS */}
              {activeTab === 'Products' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14 }}>
                    Linked Partner Products ({partnerData.products?.length || 0})
                  </h4>
                  {(!partnerData.products || partnerData.products.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No products linked to this partner yet.
                    </div>
                  ) : (
                    <div className="luxe-table-container">
                      <table className="luxe-table">
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th>SKU</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Cost Price</th>
                            <th>Retail Price</th>
                            <th>Commission</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partnerData.products.map((p) => (
                            <tr key={p.id}>
                              <td><strong>{p.product_name}</strong></td>
                              <td><span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)' }}>{p.sku || '—'}</span></td>
                              <td>{p.category}</td>
                              <td><span style={{ fontWeight: 600 }}>{p.stock}</span> units</td>
                              <td>{currency}{p.purchase_price}</td>
                              <td><strong>{currency}{p.selling_price}</strong></td>
                              <td><span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{p.commission_rate}%</span></td>
                              <td><PartnershipStatusBadge status={p.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CAMPAIGNS */}
              {activeTab === 'Campaigns' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14 }}>
                    Joint Marketing Campaigns ({partnerData.campaigns?.length || 0})
                  </h4>
                  {(!partnerData.campaigns || partnerData.campaigns.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No active or scheduled campaigns for this partner.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                      {partnerData.campaigns.map((c) => (
                        <div key={c.id} className="luxe-card" style={{ padding: '16px', background: 'var(--bg-elevated)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{c.name}</div>
                            <PartnershipStatusBadge status={c.status} />
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                            {c.campaign_type} • <span style={{ fontFamily: 'monospace' }}>{c.campaign_code}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div>Dates: {c.start_date} to {c.end_date}</div>
                            {c.promo_code && <div>Promo Code: <strong style={{ color: 'var(--gold-primary)' }}>{c.promo_code}</strong></div>}
                            <div>Discount: {c.discount}% | Target: {currency}{Number(c.target_sales).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: COMMISSION */}
              {activeTab === 'Commission' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14 }}>
                    Commission Ledger ({partnerData.commissions?.length || 0})
                  </h4>
                  {(!partnerData.commissions || partnerData.commissions.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No commissions calculated yet.
                    </div>
                  ) : (
                    <div className="luxe-table-container">
                      <table className="luxe-table">
                        <thead>
                          <tr>
                            <th>Invoice / Ref</th>
                            <th>Period</th>
                            <th>Sale Amount</th>
                            <th>Commission Rate</th>
                            <th>Commission Amount</th>
                            <th>Status</th>
                            <th>Payout Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partnerData.commissions.map((cm) => (
                            <tr key={cm.id}>
                              <td><span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)' }}>{cm.invoice_number || cm.id}</span></td>
                              <td>{cm.period}</td>
                              <td>{currency}{Number(cm.sale_amount).toLocaleString('en-IN')}</td>
                              <td>{cm.commission_rate}%</td>
                              <td><strong style={{ color: 'var(--emerald-accent)' }}>{currency}{Number(cm.commission_amount).toLocaleString('en-IN')}</strong></td>
                              <td><PartnershipStatusBadge status={cm.status} /></td>
                              <td><PartnershipStatusBadge status={cm.payment_status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PAYMENTS */}
              {activeTab === 'Payments' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14 }}>
                    Payout Disbursements ({partnerData.payments?.length || 0})
                  </h4>
                  {(!partnerData.payments || partnerData.payments.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No payment disbursements recorded yet.
                    </div>
                  ) : (
                    <div className="luxe-table-container">
                      <table className="luxe-table">
                        <thead>
                          <tr>
                            <th>Payment Code</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Reference #</th>
                            <th>Status</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partnerData.payments.map((py) => (
                            <tr key={py.id}>
                              <td><span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)' }}>{py.payment_code}</span></td>
                              <td>{py.payment_date}</td>
                              <td><strong style={{ color: 'var(--emerald-accent)' }}>{currency}{Number(py.amount).toLocaleString('en-IN')}</strong></td>
                              <td>{py.payment_method}</td>
                              <td><span style={{ fontFamily: 'monospace' }}>{py.reference_number || '—'}</span></td>
                              <td><PartnershipStatusBadge status={py.status} /></td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{py.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {activeTab === 'Documents' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14 }}>
                    Agreements & Legal Documents ({partnerData.documents?.length || 0})
                  </h4>
                  {(!partnerData.documents || partnerData.documents.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No contracts uploaded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {partnerData.documents.map((d) => (
                        <div
                          key={d.id}
                          className="luxe-card"
                          style={{
                            padding: '14px 18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--bg-elevated)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FileText size={22} color="var(--gold-primary)" />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                {d.document_name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {d.document_type} • Uploaded {d.upload_date || '—'}
                              </div>
                            </div>
                          </div>
                          {d.file_url && (
                            <a
                              href={d.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary"
                              style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                            >
                              View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: ACTIVITY */}
              {activeTab === 'Activity' && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 14 }}>
                    Partnership Audit Trail ({partnerData.activity_logs?.length || 0})
                  </h4>
                  {(!partnerData.activity_logs || partnerData.activity_logs.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No activity recorded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {partnerData.activity_logs.map((a) => (
                        <div
                          key={a.id}
                          className="luxe-card"
                          style={{
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--bg-elevated)',
                            fontSize: '0.82rem'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--gold-primary)', marginRight: 8 }}>
                              {a.action}:
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>{a.details}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            by {a.user_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
