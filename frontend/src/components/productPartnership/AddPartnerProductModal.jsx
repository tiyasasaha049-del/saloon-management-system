import React, { useState } from 'react';
import { X, Package, Check, AlertCircle } from 'lucide-react';

export const AddPartnerProductModal = ({
  isOpen,
  onClose,
  onSave,
  partners = [],
  existingProducts = [],
  currency = '₹'
}) => {
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '');
  const [selectedExistingProductId, setSelectedExistingProductId] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Hair Care');
  const [brand, setBrand] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [commissionRate, setCommissionRate] = useState(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectExistingProduct = (prodId) => {
    setSelectedExistingProductId(prodId);
    if (!prodId) {
      setCustomProductName('');
      setSku('');
      setPurchasePrice(0);
      setSellingPrice(0);
      return;
    }
    const found = existingProducts.find(p => p.id === prodId);
    if (found) {
      setCustomProductName(found.name);
      setSku(found.sku || '');
      setCategory(found.category || 'Hair Care');
      setBrand(found.brand || '');
      setPurchasePrice(found.purchasePrice || found.costPrice || 0);
      setSellingPrice(found.sellingPrice || found.retailPrice || 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partnerId) {
      alert('Please select a partner company.');
      return;
    }
    const productName = selectedExistingProductId
      ? existingProducts.find(p => p.id === selectedExistingProductId)?.name
      : customProductName;

    if (!productName?.trim()) {
      alert('Product Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        partner_id: partnerId,
        product_id: selectedExistingProductId || `prod-${Date.now()}`,
        product_name: productName.trim(),
        sku: sku.trim(),
        category,
        brand: brand.trim() || partners.find(p => p.id === partnerId)?.brand_name || '',
        purchase_price: Number(purchasePrice || 0),
        selling_price: Number(sellingPrice || 0),
        commission_rate: Number(commissionRate || 10),
        start_date: startDate,
        end_date: endDate,
        status
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error linking partner product');
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
          maxWidth: 620,
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              Link Partner Product
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Connect existing catalog inventory to a brand partner with designated commission terms.
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
          {/* Partner Selector */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Brand Partner *</label>
            <select
              value={partnerId}
              onChange={(e) => {
                setPartnerId(e.target.value);
                const p = partners.find(part => part.id === e.target.value);
                if (p) setCommissionRate(p.commission_rate || 10);
              }}
              className="form-control"
              required
            >
              <option value="">-- Choose Brand Partner --</option>
              {partners.map(p => (
                <option key={p.id} value={p.id}>
                  {p.brand_name} ({p.partner_code}) — {p.category}
                </option>
              ))}
            </select>
          </div>

          {/* Existing Product Link vs New Product */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label">
              Select Existing Product (From Product Management)
            </label>
            <select
              value={selectedExistingProductId}
              onChange={(e) => handleSelectExistingProduct(e.target.value)}
              className="form-control"
            >
              <option value="">-- Choose Existing Product (Prevents Duplication) --</option>
              {existingProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.sku || p.id}] — Stock: {p.stock || 0}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Tip: Reusing existing products keeps stock ledger and billing receipts synchronized.
            </div>
          </div>

          {/* Product Details Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Professional Hair Serum"
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div>
              <label className="form-label">Product SKU</label>
              <input
                type="text"
                placeholder="e.g. LOR-HS-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Brand</label>
              <input
                type="text"
                placeholder="e.g. L'Oréal"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Purchase Price ({currency})</label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Selling Price ({currency})</label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Partner Commission Rate (%) *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div>
              <label className="form-label">Relationship Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-control"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
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
              {submitting ? 'Linking...' : 'Link Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
