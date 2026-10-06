import React, { useState } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';

export default function RecordPaymentModal({ isOpen, onClose, onSave, partners = [], pendingCommissions = [] }) {
  const [formData, setFormData] = useState({
    partner_id: partners[0]?.id || '',
    commission_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    reference_number: '',
    status: 'Paid',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.partner_id || !formData.amount) {
      alert('Please select a partner and enter a valid payment amount.');
      return;
    }

    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      partner_id: parseInt(formData.partner_id),
      commission_id: formData.commission_id ? parseInt(formData.commission_id) : null
    });
    onClose();
  };

  const handlePartnerChange = (e) => {
    const partnerId = e.target.value;
    setFormData(prev => ({ ...prev, partner_id: partnerId }));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="luxe-card" style={{ width: '100%', maxWidth: '520px', padding: '1.75rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '8px', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <CreditCard size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Record Partner Payout
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Document commission payout, bank transfer, or settlement
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Select Partner Brand *
            </label>
            <select
              className="luxe-input"
              value={formData.partner_id}
              onChange={handlePartnerChange}
              required
              style={{ width: '100%' }}
            >
              <option value="">-- Select Brand Partner --</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.brand_name || p.company_name} ({p.partner_id})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Disbursement Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 15000"
                className="luxe-input"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Payment Date *
              </label>
              <input
                type="date"
                className="luxe-input"
                value={formData.payment_date}
                onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Payment Method
              </label>
              <select
                className="luxe-input"
                value={formData.payment_method}
                onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                <option value="UPI">UPI / QR Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Reference / UTR / Cheque #
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-98234123"
                className="luxe-input"
                value={formData.reference_number}
                onChange={e => setFormData({ ...formData, reference_number: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Notes / Settlement Memo
            </label>
            <textarea
              className="luxe-input"
              rows={2}
              placeholder="e.g. Cleared Q3 quarterly commission settlement"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-gold"
            >
              <DollarSign size={16} />
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
