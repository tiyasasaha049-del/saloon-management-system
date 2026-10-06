import React from 'react';
import { useSalon } from '../context/SalonContext';
import { Printer, X, CheckCircle, Sparkles, Scissors } from 'lucide-react';

export const ReceiptModal = () => {
  const { activeReceipt, setActiveReceipt, settings } = useSalon();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveReceipt(null)}>
      <div
        className="modal-content"
        style={{ maxWidth: 460, background: '#ffffff', color: '#171923', padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            background: '#141722',
            color: '#f8fafc',
            borderTopLeftRadius: 'var(--radius-lg)',
            borderTopRightRadius: 'var(--radius-lg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
            <CheckCircle size={18} color="#10b981" />
            <span>Tax Invoice & Receipt</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-gold" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={handlePrint}>
              <Printer size={14} /> Print
            </button>
            <button
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              onClick={() => setActiveReceipt(null)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Thermal/Luxury Invoice Paper */}
        <div className="printable-receipt" style={{ padding: '32px 28px', fontFamily: "'Plus Jakarta Sans', monospace, sans-serif" }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: 18, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Scissors size={20} color="#b3881f" />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: '700', letterSpacing: '0.05em', color: '#0f172a' }}>
                {settings.salonName}
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{settings.tagline}</p>
            <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 4 }}>{settings.address}</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Tel: {settings.phone} | GSTIN/VAT: LUXE-US-928174</p>
          </div>

          {/* Meta Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#334155', marginBottom: 16 }}>
            <div>
              <div><strong>Invoice:</strong> {activeReceipt.invoiceNo || 'INV-2026-LIVE'}</div>
              <div><strong>Client:</strong> {activeReceipt.customerName}</div>
              <div><strong>Phone:</strong> {activeReceipt.phone || 'N/A'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div><strong>Date:</strong> {activeReceipt.date}</div>
              <div><strong>Time:</strong> {activeReceipt.time || '12:00 PM'}</div>
              <div><span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>PAID IN FULL</span></div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: 18 }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #cbd5e1', textAlign: 'left', color: '#64748b', fontSize: '0.7rem' }}>
                <th style={{ padding: '6px 0' }}>ITEM / SERVICE</th>
                <th style={{ textAlign: 'center', padding: '6px 0' }}>QTY</th>
                <th style={{ textAlign: 'right', padding: '6px 0' }}>PRICE</th>
                <th style={{ textAlign: 'right', padding: '6px 0' }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {activeReceipt.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                    {item.stylist && <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Stylist: {item.stylist}</div>}
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px 0', color: '#475569' }}>{item.qty || 1}</td>
                  <td style={{ textAlign: 'right', padding: '8px 0', color: '#475569' }}>
                    {settings.currency}{Number(item.price).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: '#0f172a' }}>
                    {settings.currency}{(Number(item.price) * (item.qty || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation Breakdown */}
          <div style={{ borderTop: '1.5px dashed #cbd5e1', paddingTop: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5, color: '#475569' }}>
              <span>Subtotal:</span>
              <span>{settings.currency}{Number(activeReceipt.subtotal || 0).toFixed(2)}</span>
            </div>
            {Number(activeReceipt.discount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5, color: '#16a34a' }}>
                <span>Discount / Privilege:</span>
                <span>-{settings.currency}{Number(activeReceipt.discount).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 8, color: '#475569' }}>
              <span>{settings.taxName} ({settings.taxRate}%):</span>
              <span>{settings.currency}{Number(activeReceipt.tax || 0).toFixed(2)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: 800,
                color: '#0f172a',
                borderTop: '2px solid #0f172a',
                paddingTop: 10,
                marginTop: 6
              }}
            >
              <span>GRAND TOTAL:</span>
              <span>{settings.currency}{Number(activeReceipt.total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method & Barcode */}
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: '0.78rem', color: '#475569' }}>
              Payment Method: <strong>{activeReceipt.paymentMethod || 'Credit Card'}</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 2, fontWeight: 600 }}>
              Authorized & Settled electronically
            </div>
          </div>

          {/* Barcode & Footer note */}
          <div style={{ textAlign: 'center' }}>

            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Thank you for trusting Lumina Luxe. We celebrate your elegance.
            </p>
            <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
              Appointments cancellable up to 24h prior. Products returnable unopened within 14 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
