import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle,
  Copy,
  Scissors,
  X,
  Search,
  RefreshCw,
  Eye,
  Edit3,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const OffersView = () => {
  const {
    offers,
    addOffer,
    updateOffer,
    reactivateOffer,
    pauseOffer,
    activateOffer,
    deleteOffer,
    refreshOffers,
    settings
  } = useSalon();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Active item selections
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterEligibility, setFilterEligibility] = useState('ALL');

  // Form State for Create
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percent',
    discountValue: 15,
    minSpend: 1000,
    maxDiscount: 500,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '2026-12-31',
    maxUsage: 100,
    perCustomerLimit: 1,
    customerEligibility: 'ALL_CUSTOMERS',
    applicableTo: 'ENTIRE_BILL',
    applicableTarget: '',
    status: 'ACTIVE',
    notes: ''
  });

  // Form State for Reactivate
  const [reactivateData, setReactivateData] = useState({
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '2026-12-31',
    usageLimit: 100
  });

  // Form State for Edit
  const [editFormData, setEditFormData] = useState({});

  // Helper for generating readable unique coupon codes
  const generateUniqueCode = (customPrefix = '') => {
    const prefixes = ['WELCOME', 'DIWALI', 'VIP', 'FESTIVE', 'GLAM', 'BEAUTY', 'SPECIAL', 'NEWUSER'];
    const p = customPrefix || prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = [10, 15, 20, 25, 30, 50][Math.floor(Math.random() * 6)];
    let candidate = `${p}${num}`;
    const exists = offers.some(o => (o.code || '').toUpperCase() === candidate.toUpperCase());
    if (!exists) return candidate;
    return `${p}${num}_${Math.floor(100 + Math.random() * 900)}`;
  };

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Safe formatting helpers - NEVER prints undefined/null/NaN
  const formatDiscount = (o) => {
    const val = o.discountValue ?? o.discount_value ?? o.discountPercent;
    if (val === undefined || val === null || val === '') return 'Not Set';
    const num = Number(val);
    if (isNaN(num)) return 'Not Set';
    const type = (o.discountType || o.discount_type || 'PERCENTAGE').toLowerCase();
    if (type.includes('percent')) return `${num}%`;
    return `${settings.currency || '₹'}${num.toLocaleString('en-IN')}`;
  };

  const formatMinSpend = (o) => {
    const val = o.minSpend ?? o.minimum_spend;
    if (val === undefined || val === null || val === '' || Number(val) <= 0) return 'No Minimum';
    const num = Number(val);
    if (isNaN(num) || num <= 0) return 'No Minimum';
    return `${settings.currency || '₹'}${num.toLocaleString('en-IN')}`;
  };

  const formatMaxCap = (o) => {
    const val = o.maxDiscount ?? o.maximum_discount;
    if (val === undefined || val === null || val === '' || Number(val) <= 0) return 'No Cap';
    const num = Number(val);
    if (isNaN(num) || num <= 0) return 'No Cap';
    return `${settings.currency || '₹'}${num.toLocaleString('en-IN')}`;
  };

  const getUsageStats = (o) => {
    const used = Number(o.usageCount ?? o.usedCount ?? o.used_count ?? 0);
    const limit = Number(o.maxUsage ?? o.usageLimit ?? o.usage_limit ?? 0);
    const safeUsed = isNaN(used) ? 0 : used;
    const safeLimit = isNaN(limit) ? 0 : limit;
    const label = safeLimit > 0 ? `${safeUsed} / ${safeLimit} claimed` : `${safeUsed} / Unlimited claimed`;
    const pct = safeLimit > 0 ? Math.min(100, Math.round((safeUsed / safeLimit) * 100)) : (safeUsed > 0 ? 100 : 0);
    return { used: safeUsed, limit: safeLimit, label, pct };
  };

  const formatValidThrough = (o) => {
    const v = o.validUntil || o.validTill || o.valid_until;
    return v || 'No Expiry';
  };

  const getOfferStatus = (o) => {
    const raw = (o.status || '').toUpperCase();
    if (raw === 'PAUSED') return 'PAUSED';
    if (raw === 'DRAFT') return 'DRAFT';
    if (raw === 'ARCHIVED') return 'ARCHIVED';

    const used = Number(o.usageCount ?? o.usedCount ?? o.used_count ?? 0);
    const limit = Number(o.maxUsage ?? o.usageLimit ?? o.usage_limit ?? 0);
    if (limit > 0 && used >= limit) return 'DEPLETED';

    const today = new Date().toISOString().split('T')[0];
    const validFrom = o.validFrom || o.valid_from;
    if (validFrom && today < validFrom) return 'SCHEDULED';

    const validUntil = o.validUntil || o.validTill || o.valid_until;
    if (validUntil && today > validUntil) return 'EXPIRED';

    return 'ACTIVE';
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-emerald">ACTIVE</span>;
      case 'PAUSED':
        return <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.3)' }}>PAUSED</span>;
      case 'EXPIRED':
        return <span className="badge badge-gray">EXPIRED</span>;
      case 'SCHEDULED':
        return <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>SCHEDULED</span>;
      case 'DEPLETED':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>DEPLETED</span>;
      case 'DRAFT':
        return <span className="badge badge-gray">DRAFT</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  // Actions
  const handleOpenAddModal = () => {
    setFormError('');
    setFormData({
      code: generateUniqueCode(),
      title: '',
      description: '',
      discountType: 'percent',
      discountValue: 15,
      minSpend: 1000,
      maxDiscount: 500,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '2026-12-31',
      maxUsage: 100,
      perCustomerLimit: 1,
      customerEligibility: 'ALL_CUSTOMERS',
      applicableTo: 'ENTIRE_BILL',
      applicableTarget: '',
      status: 'ACTIVE',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanCode = formData.code.toUpperCase().trim();
    if (!cleanCode) {
      setFormError('Coupon code is required.');
      return;
    }

    if (offers.some(o => (o.code || '').toUpperCase() === cleanCode)) {
      setFormError(`Coupon code '${cleanCode}' already exists. Please generate or choose another.`);
      return;
    }

    if (formData.validFrom && formData.validUntil && formData.validUntil < formData.validFrom) {
      setFormError('Valid Until date must be on or after Valid From date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addOffer({
        code: cleanCode,
        title: formData.title.trim() || `${cleanCode} Promo`,
        description: formData.description.trim(),
        discount_type: formData.discountType === 'percent' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
        discount_value: Number(formData.discountValue),
        minimum_spend: Number(formData.minSpend || 0),
        maximum_discount: Number(formData.maxDiscount || 0),
        valid_from: formData.validFrom,
        valid_until: formData.validUntil,
        usage_limit: Number(formData.maxUsage || 0),
        per_customer_limit: Number(formData.perCustomerLimit || 1),
        customer_eligibility: formData.customerEligibility,
        applicable_to: formData.applicableTo,
        applicable_target: formData.applicableTarget.trim(),
        status: formData.status,
        notes: formData.notes.trim()
      });
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error creating coupon code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReactivate = (offer) => {
    setSelectedOffer(offer);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setReactivateData({
      validFrom: today,
      validUntil: nextMonth,
      usageLimit: Number(offer.maxUsage || offer.usageLimit || 100) + 50
    });
    setFormError('');
    setIsReactivateModalOpen(true);
  };

  const handleReactivateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffer) return;
    if (reactivateData.validUntil < reactivateData.validFrom) {
      setFormError('New Valid Until date must be on or after Valid From date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reactivateOffer(selectedOffer.id, {
        valid_from: reactivateData.validFrom,
        valid_until: reactivateData.validUntil,
        usage_limit: Number(reactivateData.usageLimit || 0)
      });
      setIsReactivateModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Error reactivating coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = async (id) => {
    try {
      await pauseOffer(id);
    } catch (err) {
      alert(err.message || 'Error pausing coupon');
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateOffer(id);
    } catch (err) {
      alert(err.message || 'Error activating coupon');
    }
  };

  const handleOpenDetails = (offer) => {
    setSelectedOffer(offer);
    setIsDetailsModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setSelectedOffer(offer);
    setEditFormData({
      title: offer.title || '',
      description: offer.description || '',
      minSpend: offer.minSpend ?? offer.minimum_spend ?? 0,
      maxDiscount: offer.maxDiscount ?? offer.maximum_discount ?? 0,
      validFrom: offer.validFrom || offer.valid_from || '',
      validUntil: offer.validUntil || offer.validTill || offer.valid_until || '',
      maxUsage: offer.maxUsage ?? offer.usageLimit ?? 100,
      perCustomerLimit: offer.perCustomerLimit ?? offer.per_customer_limit ?? 1,
      customerEligibility: offer.customerEligibility || offer.customer_eligibility || 'ALL_CUSTOMERS',
      applicableTo: offer.applicableTo || offer.applicable_to || 'ENTIRE_BILL',
      applicableTarget: offer.applicableTarget || offer.applicable_target || '',
      status: offer.status || 'ACTIVE',
      notes: offer.notes || ''
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOffer) return;
    if (editFormData.validFrom && editFormData.validUntil && editFormData.validUntil < editFormData.validFrom) {
      setFormError('Valid Until date must be on or after Valid From date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOffer(selectedOffer.id, {
        title: editFormData.title,
        description: editFormData.description,
        minimum_spend: Number(editFormData.minSpend || 0),
        maximum_discount: Number(editFormData.maxDiscount || 0),
        valid_from: editFormData.validFrom,
        valid_until: editFormData.validUntil,
        usage_limit: Number(editFormData.maxUsage || 0),
        per_customer_limit: Number(editFormData.perCustomerLimit || 1),
        customer_eligibility: editFormData.customerEligibility,
        applicable_to: editFormData.applicableTo,
        applicable_target: editFormData.applicableTarget,
        status: editFormData.status,
        notes: editFormData.notes
      });
      setIsEditModalOpen(false);
      if (isDetailsModalOpen) {
        setIsDetailsModalOpen(false);
      }
    } catch (err) {
      setFormError(err.message || 'Error updating coupon rules.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Cards
  const filteredOffers = offers.filter((o) => {
    const st = getOfferStatus(o);
    const dType = (o.discountType || o.discount_type || 'PERCENTAGE').toUpperCase();
    const elig = (o.customerEligibility || o.customer_eligibility || 'ALL_CUSTOMERS').toUpperCase();

    // Search matches code or title
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = (o.code || '').toLowerCase().includes(q);
      const titleMatch = (o.title || '').toLowerCase().includes(q);
      const descMatch = (o.description || '').toLowerCase().includes(q);
      if (!codeMatch && !titleMatch && !descMatch) return false;
    }

    // Status filter
    if (filterStatus !== 'ALL' && st !== filterStatus) return false;

    // Type filter
    if (filterType !== 'ALL') {
      if (filterType === 'PERCENTAGE' && !dType.includes('PERCENT')) return false;
      if (filterType === 'FIXED_AMOUNT' && dType.includes('PERCENT')) return false;
    }

    // Eligibility filter
    if (filterEligibility !== 'ALL' && elig !== filterEligibility) return false;

    return true;
  });

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Campaigns, Offers & <span className="gold-text-gradient">Promo Vouchers</span>
          </h2>
          <p>Seasonal marketing campaigns, percentage discounts, minimum cart spend rules and usage tracking</p>
        </div>

        <button className="btn btn-gold" onClick={handleOpenAddModal}>
          <Plus size={16} /> Create Coupon Code
        </button>
      </div>

      {/* Search and Filters Bar (Preserving dark theme) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
          background: 'var(--bg-card)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 34, fontSize: '0.82rem' }}
            placeholder="Search campaigns or coupon code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ fontSize: '0.8rem', padding: '6px 12px', minWidth: 120 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="DEPLETED">Depleted</option>
          </select>

          <select
            className="form-select"
            style={{ fontSize: '0.8rem', padding: '6px 12px', minWidth: 120 }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED_AMOUNT">Fixed Amount ({settings.currency})</option>
          </select>

          <select
            className="form-select"
            style={{ fontSize: '0.8rem', padding: '6px 12px', minWidth: 130 }}
            value={filterEligibility}
            onChange={(e) => setFilterEligibility(e.target.value)}
          >
            <option value="ALL">All Eligibility</option>
            <option value="ALL_CUSTOMERS">All Customers</option>
            <option value="NEW_CUSTOMERS">New Customers</option>
            <option value="EXISTING_CUSTOMERS">Existing Customers</option>
            <option value="VIP_CUSTOMERS">VIP Customers</option>
            <option value="LOYALTY_MEMBERS">Loyalty Members</option>
          </select>

          {(searchQuery || filterStatus !== 'ALL' || filterType !== 'ALL' || filterEligibility !== 'ALL') && (
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
                setFilterType('ALL');
                setFilterEligibility('ALL');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Offers Cards Grid (Preserving existing layout and dark aesthetic) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {filteredOffers.length === 0 ? (
          <div
            className="luxe-card"
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 24px',
              color: 'var(--text-muted)'
            }}
          >
            <Tag size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 6 }}>No campaigns found</h3>
            <p style={{ fontSize: '0.85rem' }}>No offers match the current filters. Adjust your search or create a new coupon code.</p>
          </div>
        ) : (
          filteredOffers.map((offer) => {
            const status = getOfferStatus(offer);
            const isInactive = status === 'EXPIRED' || status === 'DEPLETED' || status === 'PAUSED' || status === 'DRAFT';
            const usage = getUsageStats(offer);

            return (
              <div
                key={offer.id}
                className="luxe-card"
                style={{
                  opacity: status === 'ACTIVE' ? 1 : 0.75,
                  border: status === 'ACTIVE' ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Header with status pill and quick view */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ cursor: 'pointer', flex: 1, paddingRight: 8 }} onClick={() => handleOpenDetails(offer)}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{offer.title || offer.campaignName || 'Promo Campaign'}</span>
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {offer.description || 'Promotional coupon code'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {renderStatusBadge(status)}
                    </div>
                  </div>

                  {/* Coupon Code Pill */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-elevated)',
                      border: '1.5px dashed var(--gold-primary)',
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 16
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={18} color="var(--gold-primary)" />
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.15rem', letterSpacing: '0.08em', color: 'var(--gold-primary)' }}>
                        {offer.code}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.72rem', padding: '4px 10px', minWidth: 84 }}
                      onClick={() => handleCopy(offer.code)}
                      title="Copy coupon code"
                    >
                      {copiedCode === offer.code ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>

                  {/* Terms & Rules (DISCOUNT, MIN SPEND, MAX CAP) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: 'var(--bg-input)', padding: 10, borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '0.78rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: '0.05em' }}>DISCOUNT</div>
                      <strong style={{ color: 'var(--emerald-accent)' }}>
                        {formatDiscount(offer)}
                      </strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: '0.05em' }}>MIN SPEND</div>
                      <strong>{formatMinSpend(offer)}</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', letterSpacing: '0.05em' }}>MAX CAP</div>
                      <strong>{formatMaxCap(offer)}</strong>
                    </div>
                  </div>

                  {/* Progress & Expiry */}
                  <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>Redemptions:</span>
                      <strong>{usage.label}</strong>
                    </div>
                    <div style={{ width: '100%', height: 6, background: 'var(--bg-elevated)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${usage.pct}%`,
                          height: '100%',
                          background: 'var(--gold-gradient)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Valid through: {formatValidThrough(offer)}</span>
                      <span
                        style={{ color: 'var(--gold-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleOpenDetails(offer)}
                      >
                        Rules & Details
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Control footer */}
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status Control</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {status === 'EXPIRED' || status === 'DEPLETED' ? (
                      <button
                        type="button"
                        className="btn btn-gold"
                        style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                        onClick={() => handleOpenReactivate(offer)}
                      >
                        Reactivate
                      </button>
                    ) : status === 'PAUSED' ? (
                      <button
                        type="button"
                        className="btn btn-gold"
                        style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                        onClick={() => handleActivate(offer.id)}
                      >
                        Activate
                      </button>
                    ) : status === 'SCHEDULED' || status === 'DRAFT' ? (
                      <button
                        type="button"
                        className="btn btn-gold"
                        style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                        onClick={() => handleActivate(offer.id)}
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '4px 12px' }}
                        onClick={() => handlePause(offer.id)}
                      >
                        Pause Campaign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE COUPON MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Create Promo Campaign Code</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '24px' }}>
              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 16, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 4, fontSize: '0.82rem' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ margin: 0 }}>Coupon Code *</label>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => setFormData(prev => ({ ...prev, code: generateUniqueCode() }))}
                    >
                      + Generate Code
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. WELCOME15"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Campaign Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Autumn Glamour Festival"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 15% off for all VIP & seasonal reservations"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Discount Type *</label>
                  <select
                    className="form-select"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Fixed Amount ({settings.currency})</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    className="form-input"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min Spend ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-input"
                    placeholder="0 for No Min"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Max Cap ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-input"
                    placeholder="0 for No Cap"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Usage Limit</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="0 for Unlimited"
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Per Customer Limit</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.perCustomerLimit}
                    onChange={(e) => setFormData({ ...formData, perCustomerLimit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Valid From *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valid Until *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Customer Eligibility</label>
                  <select
                    className="form-select"
                    value={formData.customerEligibility}
                    onChange={(e) => setFormData({ ...formData, customerEligibility: e.target.value })}
                  >
                    <option value="ALL_CUSTOMERS">All Customers</option>
                    <option value="NEW_CUSTOMERS">New Customers Only</option>
                    <option value="EXISTING_CUSTOMERS">Existing Customers Only</option>
                    <option value="VIP_CUSTOMERS">VIP Customers Only</option>
                    <option value="LOYALTY_MEMBERS">Loyalty Members Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Applicable To</label>
                  <select
                    className="form-select"
                    value={formData.applicableTo}
                    onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value })}
                  >
                    <option value="ENTIRE_BILL">Entire Bill</option>
                    <option value="SERVICES_ONLY">Services Only</option>
                    <option value="PRODUCTS_ONLY">Products Only</option>
                    <option value="SPECIFIC_SERVICE">Specific Service</option>
                    <option value="SPECIFIC_PRODUCT">Specific Product</option>
                    <option value="SPECIFIC_CATEGORY">Specific Category</option>
                  </select>
                </div>
              </div>

              {['SPECIFIC_SERVICE', 'SPECIFIC_PRODUCT', 'SPECIFIC_CATEGORY'].includes(formData.applicableTo) && (
                <div className="form-group">
                  <label className="form-label">Target Name / Category Keyword *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Hair Spa, Shampoo, Hair Care"
                    value={formData.applicableTarget}
                    onChange={(e) => setFormData({ ...formData, applicableTarget: e.target.value })}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Active (Live in POS)</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Notes</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Optional administrative notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REACTIVATE COUPON MODAL */}
      {isReactivateModalOpen && selectedOffer && (
        <div className="modal-overlay" onClick={() => setIsReactivateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 2 }}>Reactivate Coupon</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                  {selectedOffer.code} — {selectedOffer.title}
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsReactivateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReactivateSubmit} style={{ padding: '24px' }}>
              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 16, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 4, fontSize: '0.82rem' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                To make this campaign usable in POS Billing again, please specify valid dates and adjust the usage limit if it was previously depleted.
              </p>

              <div className="form-group">
                <label className="form-label">New Valid From *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={reactivateData.validFrom}
                  onChange={(e) => setReactivateData({ ...reactivateData, validFrom: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Valid Until *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={reactivateData.validUntil}
                  onChange={(e) => setReactivateData({ ...reactivateData, validUntil: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Usage Limit (Claims)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 150"
                  value={reactivateData.usageLimit}
                  onChange={(e) => setReactivateData({ ...reactivateData, usageLimit: e.target.value })}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Currently redeemed: {selectedOffer.usedCount ?? selectedOffer.usageCount ?? 0} claims
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsReactivateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? 'Reactivating...' : 'Confirm Reactivation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAMPAIGN DETAILS MODAL */}
      {isDetailsModalOpen && selectedOffer && (
        <div className="modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>{selectedOffer.title}</h3>
                <span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                  {selectedOffer.code}
                </span>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsDetailsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status</span>
                <div>{renderStatusBadge(getOfferStatus(selectedOffer))}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Description</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textAlign: 'right', maxWidth: 280 }}>
                  {selectedOffer.description || 'No description'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, background: 'var(--bg-input)', padding: 12, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>DISCOUNT</div>
                  <strong style={{ color: 'var(--emerald-accent)', fontSize: '0.92rem' }}>{formatDiscount(selectedOffer)}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>MIN SPEND</div>
                  <strong style={{ fontSize: '0.92rem' }}>{formatMinSpend(selectedOffer)}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>MAX CAP</div>
                  <strong style={{ fontSize: '0.92rem' }}>{formatMaxCap(selectedOffer)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Validity Period</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {selectedOffer.validFrom || selectedOffer.valid_from || 'Always'} to {formatValidThrough(selectedOffer)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Redemptions</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {getUsageStats(selectedOffer).label}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Per-Customer Limit</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {selectedOffer.perCustomerLimit ?? selectedOffer.per_customer_limit ?? 1} use per client
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Customer Eligibility</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {(selectedOffer.customerEligibility || selectedOffer.customer_eligibility || 'ALL_CUSTOMERS').replace(/_/g, ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Applicable Items</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {(selectedOffer.applicableTo || selectedOffer.applicable_to || 'ENTIRE_BILL').replace(/_/g, ' ')}
                  {selectedOffer.applicableTarget ? ` (${selectedOffer.applicableTarget})` : ''}
                </span>
              </div>

              {selectedOffer.notes && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Internal Notes</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{selectedOffer.notes}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleOpenEdit(selectedOffer);
                  }}
                >
                  <Edit3 size={14} /> Edit Campaign Rules
                </button>
                <button type="button" className="btn btn-gold" onClick={() => setIsDetailsModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CAMPAIGN MODAL */}
      {isEditModalOpen && selectedOffer && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Edit Campaign Rules</h3>
                <span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)', fontWeight: 800 }}>
                  {selectedOffer.code}
                </span>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '24px' }}>
              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 16, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 4, fontSize: '0.82rem' }}>
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Campaign Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Min Spend ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-input"
                    value={editFormData.minSpend}
                    onChange={(e) => setEditFormData({ ...editFormData, minSpend: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Cap ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-input"
                    value={editFormData.maxDiscount}
                    onChange={(e) => setEditFormData({ ...editFormData, maxDiscount: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Valid From</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editFormData.validFrom}
                    onChange={(e) => setEditFormData({ ...editFormData, validFrom: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Valid Until</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editFormData.validUntil}
                    onChange={(e) => setEditFormData({ ...editFormData, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Total Usage Limit</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={editFormData.maxUsage}
                    onChange={(e) => setEditFormData({ ...editFormData, maxUsage: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Per Customer Limit</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={editFormData.perCustomerLimit}
                    onChange={(e) => setEditFormData({ ...editFormData, perCustomerLimit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Customer Eligibility</label>
                  <select
                    className="form-select"
                    value={editFormData.customerEligibility}
                    onChange={(e) => setEditFormData({ ...editFormData, customerEligibility: e.target.value })}
                  >
                    <option value="ALL_CUSTOMERS">All Customers</option>
                    <option value="NEW_CUSTOMERS">New Customers Only</option>
                    <option value="EXISTING_CUSTOMERS">Existing Customers Only</option>
                    <option value="VIP_CUSTOMERS">VIP Customers Only</option>
                    <option value="LOYALTY_MEMBERS">Loyalty Members Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Rules'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
