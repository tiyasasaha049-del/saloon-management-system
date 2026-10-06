import React from 'react';
import { Package, Trash2, ExternalLink, Boxes, ShoppingBag, Eye } from 'lucide-react';
import { PartnershipStatusBadge } from './PartnershipStatusBadge';

export const PartnerProductTable = ({
  partnerProducts = [],
  onUnlink,
  onViewProduct,
  onNavigateToInventory,
  currency = '₹',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="luxe-table-container" style={{ padding: '60px', textAlign: 'center' }}>
        <div className="loader-spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-secondary)' }}>Loading partner products...</div>
      </div>
    );
  }

  if (partnerProducts.length === 0) {
    return (
      <div
        className="luxe-card"
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>No Partner Products Linked</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 460, margin: '0 auto' }}>
          Connect your existing salon products or brand inventory with brand partners to automate retail sales commission tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="luxe-table-container" style={{ overflowX: 'auto' }}>
      <table className="luxe-table">
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product Name</th>
            <th>Brand</th>
            <th>Partner</th>
            <th>Category</th>
            <th>SKU</th>
            <th>Purchase Price</th>
            <th>Selling Price</th>
            <th>Live Stock</th>
            <th>Total Sales</th>
            <th>Commission %</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partnerProducts.map((p) => {
            const isLowStock = Number(p.stock || 0) <= 5;
            return (
              <tr key={p.id}>
                <td>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: 'var(--gold-primary)',
                      fontSize: '0.82rem'
                    }}
                  >
                    {p.product_id || p.id}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    {p.product_name}
                  </div>
                </td>
                <td>{p.brand}</td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>
                    {p.partner_name || 'Brand Partner'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {p.category}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.sku || '—'}
                  </span>
                </td>
                <td>{currency}{Number(p.purchase_price || 0).toLocaleString('en-IN')}</td>
                <td>
                  <strong>{currency}{Number(p.selling_price || 0).toLocaleString('en-IN')}</strong>
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: 700,
                      color: isLowStock ? 'var(--ruby-accent)' : 'var(--emerald-accent)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {p.stock !== undefined ? p.stock : '—'} units
                    {isLowStock && <span style={{ fontSize: '0.68rem', color: 'var(--ruby-accent)' }}> (Low)</span>}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--emerald-accent)' }}>
                    {currency}{Number(p.sales || 0).toLocaleString('en-IN')}
                  </span>
                </td>
                <td>
                  <span
                    style={{
                      fontWeight: 700,
                      color: 'var(--gold-primary)',
                      background: 'var(--gold-subtle)',
                      padding: '2px 8px',
                      borderRadius: 10,
                      fontSize: '0.8rem'
                    }}
                  >
                    {p.commission_rate}%
                  </span>
                </td>
                <td>
                  <PartnershipStatusBadge status={p.status} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {onNavigateToInventory && (
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                        onClick={() => onNavigateToInventory(p)}
                        title="View Inventory & Stock Movements"
                      >
                        <Boxes size={14} />
                      </button>
                    )}
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '5px 8px', fontSize: '0.75rem', color: 'var(--ruby-accent)' }}
                      onClick={() => onUnlink(p.id)}
                      title="Unlink Product from Partner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
