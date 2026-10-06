import React, { useState, useEffect } from 'react';
import { X, Building2, Upload, FileText, CheckCircle2 } from 'lucide-react';

const PARTNERSHIP_TYPES = [
  'Product Supply',
  'Product Promotion',
  'Brand Promotion',
  'Retail Partnership',
  'Exclusive Partnership',
  'Co-Marketing',
  'Affiliate / Commission',
  'Event Collaboration'
];

const CATEGORIES = [
  'Hair Care & Color',
  'Skin Care & Spa',
  'Nail Care & Extensions',
  'Aromatherapy & Wellness',
  'Hair Styling Technology',
  'Organic & Ayurvedic',
  'Makeup & Cosmetics'
];

const PAYMENT_TERMS_LIST = [
  'Net 15 Days',
  'Net 30 Days',
  'Net 45 Days',
  'Immediate Upon Sale',
  'Bi-Weekly Payout'
];

export const PartnerForm = ({
  isOpen,
  onClose,
  onSave,
  initialData = null
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    partner_code: '',
    company_name: '',
    brand_name: '',
    contact_person: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    tax_id: '',
    category: 'Hair Care & Color',
    partnership_type: 'Product Promotion',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    commission_type: 'Percentage',
    commission_rate: 10.0,
    revenue_share: 0.0,
    payment_terms: 'Net 30 Days',
    status: 'Active',
    description: '',
    notes: '',
    logo_url: '',
    contract_url: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        partner_code: initialData.partner_code || '',
        company_name: initialData.company_name || '',
        brand_name: initialData.brand_name || '',
        contact_person: initialData.contact_person || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        website: initialData.website || '',
        address: initialData.address || '',
        city: initialData.city || 'Mumbai',
        state: initialData.state || 'Maharashtra',
        country: initialData.country || 'India',
        tax_id: initialData.tax_id || '',
        category: initialData.category || 'Hair Care & Color',
        partnership_type: initialData.partnership_type || 'Product Promotion',
        start_date: initialData.start_date || new Date().toISOString().split('T')[0],
        end_date: initialData.end_date || '',
        commission_type: initialData.commission_type || 'Percentage',
        commission_rate: initialData.commission_rate !== undefined ? initialData.commission_rate : 10.0,
        revenue_share: initialData.revenue_share !== undefined ? initialData.revenue_share : 0.0,
        payment_terms: initialData.payment_terms || 'Net 30 Days',
        status: initialData.status || 'Active',
        description: initialData.description || '',
        notes: initialData.notes || '',
        logo_url: initialData.logo_url || '',
        contract_url: initialData.contract_url || ''
      });
    } else {
      setFormData({
        partner_code: '',
        company_name: '',
        brand_name: '',
        contact_person: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        tax_id: '',
        category: 'Hair Care & Color',
        partnership_type: 'Product Promotion',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        commission_type: 'Percentage',
        commission_rate: 10.0,
        revenue_share: 0.0,
        payment_terms: 'Net 30 Days',
        status: 'Active',
        description: '',
        notes: '',
        logo_url: '',
        contract_url: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.company_name.trim()) newErrors.company_name = 'Company Name is required';
    if (!formData.brand_name.trim()) newErrors.brand_name = 'Brand Name is required';
    if (!formData.contact_person.trim()) newErrors.contact_person = 'Contact Person is required';
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (Number(formData.commission_rate) < 0 || Number(formData.commission_rate) > 100) {
      newErrors.commission_rate = 'Commission rate must be between 0% and 100%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        commission_rate: Number(formData.commission_rate || 0),
        revenue_share: Number(formData.revenue_share || 0)
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error saving partner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content luxe-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 780,
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px 32px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              {isEditing ? `Edit Partner: ${formData.brand_name}` : 'Onboard New Product Partner & Brand'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Configure company identity, commercial commission terms, and product collaboration details.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Partner Information */}
          <div style={{ marginBottom: 24 }}>
            <h4
              style={{
                fontSize: '0.85rem',
                color: 'var(--gold-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 6,
                marginBottom: 14
              }}
            >
              1. Partner & Company Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="form-label">Partner Code / ID</label>
                <input
                  type="text"
                  placeholder="e.g. PTN-006 (Auto-generated if empty)"
                  value={formData.partner_code}
                  onChange={(e) => setFormData({ ...formData, partner_code: e.target.value })}
                  className="form-control"
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="form-label">Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. L'Oréal Professionnel"
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  className="form-control"
                />
                {errors.brand_name && <span style={{ color: 'var(--ruby-accent)', fontSize: '0.72rem' }}>{errors.brand_name}</span>}
              </div>
              <div>
                <label className="form-label">Company Legal Name *</label>
                <input
                  type="text"
                  placeholder="e.g. L'Oréal Luxe India Pvt Ltd"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="form-control"
                />
                {errors.company_name && <span style={{ color: 'var(--ruby-accent)', fontSize: '0.72rem' }}>{errors.company_name}</span>}
              </div>
              <div>
                <label className="form-label">Contact Person *</label>
                <input
                  type="text"
                  placeholder="e.g. Vikram Malhotra"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="form-control"
                />
                {errors.contact_person && <span style={{ color: 'var(--ruby-accent)', fontSize: '0.72rem' }}>{errors.contact_person}</span>}
              </div>
              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98201 54321"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">Official Email</label>
                <input
                  type="email"
                  placeholder="partnerships@brand.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-control"
                />
                {errors.email && <span style={{ color: 'var(--ruby-accent)', fontSize: '0.72rem' }}>{errors.email}</span>}
              </div>
              <div>
                <label className="form-label">Website</label>
                <input
                  type="url"
                  placeholder="https://brand.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">GST / Tax Number</label>
                <input
                  type="text"
                  placeholder="e.g. 27AABCL1234F1Z8"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  className="form-control"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Corporate Address</label>
                <input
                  type="text"
                  placeholder="Street address, business park, or headquarters"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Business & Commercial Terms */}
          <div style={{ marginBottom: 24 }}>
            <h4
              style={{
                fontSize: '0.85rem',
                color: 'var(--gold-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 6,
                marginBottom: 14
              }}
            >
              2. Business & Commercial Terms
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="form-label">Product Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-control"
                >
                  {CATEGORIES.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Partnership Type</label>
                <select
                  value={formData.partnership_type}
                  onChange={(e) => setFormData({ ...formData, partnership_type: e.target.value })}
                  className="form-control"
                >
                  {PARTNERSHIP_TYPES.map((pt, i) => (
                    <option key={i} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">End Date (Contract Expiry)</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">Commission Type</label>
                <select
                  value={formData.commission_type}
                  onChange={(e) => setFormData({ ...formData, commission_type: e.target.value })}
                  className="form-control"
                >
                  <option value="Percentage">Percentage of Product Sales</option>
                  <option value="Fixed">Fixed Amount per Unit</option>
                  <option value="Tiered">Tiered Volume Rebate</option>
                </select>
              </div>
              <div>
                <label className="form-label">Commission Rate (%) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                  className="form-control"
                />
                {errors.commission_rate && <span style={{ color: 'var(--ruby-accent)', fontSize: '0.72rem' }}>{errors.commission_rate}</span>}
              </div>
              <div>
                <label className="form-label">Revenue Share (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={formData.revenue_share}
                  onChange={(e) => setFormData({ ...formData, revenue_share: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">Payment Terms</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="form-control"
                >
                  {PAYMENT_TERMS_LIST.map((term, i) => (
                    <option key={i} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Additional Information & Status */}
          <div style={{ marginBottom: 24 }}>
            <h4
              style={{
                fontSize: '0.85rem',
                color: 'var(--gold-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: 6,
                marginBottom: 14
              }}
            >
              3. Branding, Agreements & Status
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="form-label">Brand Logo Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">Agreement / Contract URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/contract.pdf"
                  value={formData.contract_url}
                  onChange={(e) => setFormData({ ...formData, contract_url: e.target.value })}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label">Partnership Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="form-control"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Expired">Expired</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Collaboration Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of mutual deliverables, salon backbar usage, take-home retail displays, or co-branded campaigns..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Internal Salon Notes</label>
                <textarea
                  rows={2}
                  placeholder="Internal manager comments, special pricing tiers, or key contact extensions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: 16
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gold"
              disabled={submitting}
              style={{ minWidth: 140 }}
            >
              {submitting ? 'Saving Partner...' : isEditing ? 'Update Partner' : 'Save Partner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
