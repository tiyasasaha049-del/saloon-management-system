import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckSquare, Square } from 'lucide-react';

const CAMPAIGN_TYPES = [
  'Product Promotion',
  'Festival Campaign',
  'New Product Launch',
  'Social Media Campaign',
  'Salon Promotion',
  'Customer Offer',
  'Bundle Promotion',
  'Event'
];

const MARKETING_CHANNELS_LIST = [
  'Website',
  'Salon',
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Email',
  'SMS',
  'In-Salon Display'
];

export const CampaignForm = ({
  isOpen,
  onClose,
  onSave,
  partners = [],
  partnerProducts = [],
  initialData = null,
  currency = '₹'
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    partner_id: partners[0]?.id || '',
    campaign_type: 'Product Promotion',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: '',
    discount: 10,
    promo_code: '',
    target_sales: 100000,
    budget: 20000,
    salon_contribution: 8000,
    partner_contribution: 12000,
    marketing_channels: ['Website', 'Salon', 'Instagram'],
    product_ids: [],
    status: 'Active'
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        partner_id: initialData.partner_id || (partners[0]?.id || ''),
        campaign_type: initialData.campaign_type || 'Product Promotion',
        start_date: initialData.start_date || new Date().toISOString().split('T')[0],
        end_date: initialData.end_date || '',
        description: initialData.description || '',
        discount: initialData.discount !== undefined ? initialData.discount : 10,
        promo_code: initialData.promo_code || '',
        target_sales: initialData.target_sales || 100000,
        budget: initialData.budget || 20000,
        salon_contribution: initialData.salon_contribution || 8000,
        partner_contribution: initialData.partner_contribution || 12000,
        marketing_channels: Array.isArray(initialData.marketing_channels) ? initialData.marketing_channels : ['Website', 'Salon', 'Instagram'],
        product_ids: Array.isArray(initialData.product_ids) ? initialData.product_ids : [],
        status: initialData.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        partner_id: partners[0]?.id || '',
        campaign_type: 'Product Promotion',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        description: '',
        discount: 10,
        promo_code: '',
        target_sales: 100000,
        budget: 20000,
        salon_contribution: 8000,
        partner_contribution: 12000,
        marketing_channels: ['Website', 'Salon', 'Instagram'],
        product_ids: [],
        status: 'Active'
      });
    }
  }, [initialData, isOpen, partners]);

  if (!isOpen) return null;

  const toggleChannel = (channel) => {
    const current = [...(formData.marketing_channels || [])];
    const index = current.indexOf(channel);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(channel);
    }
    setFormData({ ...formData, marketing_channels: current });
  };

  const handleSubmit = async (targetStatus = null) => {
    if (!formData.name.trim()) {
      alert('Campaign Name is required');
      return;
    }
    if (!formData.partner_id) {
      alert('Please select a partner');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        target_sales: Number(formData.target_sales || 0),
        budget: Number(formData.budget || 0),
        discount: Number(formData.discount || 0),
        salon_contribution: Number(formData.salon_contribution || 0),
        partner_contribution: Number(formData.partner_contribution || 0),
        status: targetStatus || formData.status
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error saving campaign');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = partnerProducts.filter(pp => pp.partner_id === formData.partner_id);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content luxe-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 720,
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              {isEditing ? `Edit Campaign: ${formData.name}` : 'Create Partnership Campaign'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Configure collaborative marketing, promotional discounts, budgets, and sales targets.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Campaign Name *</label>
              <input
                type="text"
                placeholder="e.g. L'Oréal Autumn Gloss & Glow Festival"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div>
              <label className="form-label">Brand Partner *</label>
              <select
                value={formData.partner_id}
                onChange={(e) => setFormData({ ...formData, partner_id: e.target.value })}
                className="form-control"
                required
              >
                <option value="">-- Choose Partner --</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.brand_name} ({p.partner_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Campaign Type</label>
              <select
                value={formData.campaign_type}
                onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                className="form-control"
              >
                {CAMPAIGN_TYPES.map((ct, i) => (
                  <option key={i} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div>
              <label className="form-label">End Date *</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="form-control"
                required
              />
            </div>

            <div>
              <label className="form-label">Promo / Coupon Code</label>
              <input
                type="text"
                placeholder="e.g. LOREALGLOW"
                value={formData.promo_code}
                onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Target Sales ({currency})</label>
              <input
                type="number"
                value={formData.target_sales}
                onChange={(e) => setFormData({ ...formData, target_sales: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Total Campaign Budget ({currency})</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Salon Contribution ({currency})</label>
              <input
                type="number"
                value={formData.salon_contribution}
                onChange={(e) => setFormData({ ...formData, salon_contribution: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Partner Contribution ({currency})</label>
              <input
                type="number"
                value={formData.partner_contribution}
                onChange={(e) => setFormData({ ...formData, partner_contribution: e.target.value })}
                className="form-control"
              />
            </div>

            <div>
              <label className="form-label">Campaign Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-control"
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Marketing Channels Multi-Check */}
          <div style={{ marginBottom: 18 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
              Marketing & Promotional Channels
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {MARKETING_CHANNELS_LIST.map((channel) => {
                const checked = formData.marketing_channels?.includes(channel);
                return (
                  <div
                    key={channel}
                    onClick={() => toggleChannel(channel)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      background: checked ? 'var(--gold-subtle)' : 'var(--bg-input)',
                      border: checked ? '1px solid var(--border-gold)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: checked ? 'var(--gold-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    {checked ? <CheckSquare size={15} color="var(--gold-primary)" /> : <Square size={15} color="var(--text-muted)" />}
                    {channel}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Campaign Description & Deliverables</label>
            <textarea
              rows={3}
              placeholder="Outline promotional mechanics, client perks, and co-branded marketing assets..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-control"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSubmit('Draft')}
              disabled={submitting}
            >
              Save Draft
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleSubmit('Scheduled')}
              disabled={submitting}
            >
              Schedule Campaign
            </button>
            <button
              type="submit"
              className="btn btn-gold"
              disabled={submitting}
              style={{ minWidth: 130 }}
            >
              {submitting ? 'Saving...' : 'Activate Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
