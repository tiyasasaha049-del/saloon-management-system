import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  CreditCard,
  ShoppingBag,
  Sparkles,
  User,
  Plus,
  Trash2,
  Tag,
  CheckCircle,
  Printer,
  DollarSign,
  Percent,
  Search,
  Receipt,
  Check,
  FileText
} from 'lucide-react';

export const BillingPOSView = () => {
  const {
    customers,
    services,
    products,
    employees,
    settings,
    offers,
    invoices,
    createInvoice,
    setActiveReceipt,
    validateCoupon,
    refreshOffers
  } = useSalon();

  // POS State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Credit Card');
  const [activeCatalogTab, setActiveCatalogTab] = useState('services'); // 'services' | 'products'
  const [catalogSearch, setCatalogSearch] = useState('');
  const [expandedInvoiceIds, setExpandedInvoiceIds] = useState([]);

  const toggleInvoiceItems = (invoiceId) => {
    setExpandedInvoiceIds(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Cart operations (Toggle select/deselect on click)
  const toggleServiceInCart = (srv) => {
    setCartItems(prev => {
      const exists = prev.some(item => item.type === 'service' && item.id === srv.id);
      if (exists) {
        return prev.filter(item => !(item.type === 'service' && item.id === srv.id));
      } else {
        return [
          ...prev,
          {
            type: 'service',
            id: srv.id,
            name: srv.name,
            price: srv.price,
            qty: 1,
            stylistId: employees[0]?.id,
            stylistName: employees[0]?.name
          }
        ];
      }
    });
  };

  const toggleProductInCart = (prod) => {
    const prodPrice = Number(prod.retailPrice || prod.sellingPrice || prod.price || 0);
    setCartItems(prev => {
      const exists = prev.some(item => item.type === 'product' && item.productId === prod.id);
      if (exists) {
        return prev.filter(item => !(item.type === 'product' && item.productId === prod.id));
      } else {
        return [
          ...prev,
          {
            type: 'product',
            productId: prod.id,
            name: prod.name,
            price: prodPrice,
            qty: 1,
            stylistId: employees[4]?.id || employees[0]?.id,
            stylistName: employees[4]?.name || 'Retail Desk'
          }
        ];
      }
    });
  };

  const addServiceToCart = toggleServiceInCart;
  const addProductToCart = toggleProductInCart;

  const updateCartItemQty = (index, delta) => {
    setCartItems(prev => {
      const copy = [...prev];
      const newQty = copy[index].qty + delta;
      if (newQty <= 0) {
        return copy.filter((_, idx) => idx !== index);
      } else {
        copy[index].qty = newQty;
        return copy;
      }
    });
  };

  const removeCartItem = (index) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateCartItemStylist = (index, stylistId) => {
    const emp = employees.find(e => e.id === stylistId);
    setCartItems(prev => {
      const copy = [...prev];
      copy[index].stylistId = stylistId;
      copy[index].stylistName = emp?.name || 'Staff';
      return copy;
    });
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);

  // VIP Membership Tier Discount calculation
  let tierDiscountPct = 0;
  if (selectedCustomer?.tier === 'Platinum VIP') tierDiscountPct = 0.15;
  else if (selectedCustomer?.tier === 'Gold') tierDiscountPct = 0.10;
  else if (selectedCustomer?.tier === 'Silver') tierDiscountPct = 0.05;

  let tierDiscount = subtotal * tierDiscountPct;

  // Coupon discount (validated by backend)
  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount || 0) : 0;

  const totalDiscount = tierDiscount + couponDiscount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const tax = taxableAmount * (settings.taxRate / 100);
  const grandTotal = taxableAmount + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }
    if (cartItems.length === 0) {
      setCouponFeedback({ type: 'error', message: 'Please add services or products to the cart first.' });
      return;
    }

    setIsValidatingCoupon(true);
    setCouponFeedback(null);
    try {
      const res = await validateCoupon({
        code: couponCode.trim().toUpperCase(),
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        subtotal: subtotal,
        items: cartItems.map(i => ({
          type: i.type === 'product' ? 'Product' : (i.type || 'Service'),
          item_type: i.type === 'product' ? 'Product' : (i.type || 'Service'),
          id: i.productId || i.serviceId || i.id,
          name: i.name,
          price: Number(i.price || 0),
          qty: Number(i.qty || 1),
          category: i.category || ''
        }))
      });

      if (res && res.valid) {
        setAppliedCoupon({
          code: res.code || couponCode.trim().toUpperCase(),
          discount: Number(res.discount || 0),
          finalAmount: Number(res.finalAmount || 0),
          message: res.message,
          ...res.coupon
        });
        setCouponFeedback({ type: 'success', message: res.message || `Coupon ${res.code} applied!` });
      } else {
        setAppliedCoupon(null);
        setCouponFeedback({ type: 'error', message: res?.message || 'Invalid or ineligible coupon code.' });
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponFeedback({ type: 'error', message: err.message || 'Error validating coupon code.' });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty.');
      return;
    }

    try {
      const newInvoice = await createInvoice({
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name || 'Walk-in Guest',
        phone: selectedCustomer?.phone,
        items: cartItems.map(i => ({
          type: i.type === 'product' ? 'Product' : (i.type || 'Service'),
          item_type: i.type === 'product' ? 'Product' : (i.type || 'Service'),
          id: i.productId || i.serviceId || i.id,
          productId: i.productId,
          name: i.name,
          price: i.price,
          unit_price: i.price,
          qty: i.qty,
          quantity: i.qty,
          stylist: i.stylistName
        })),
        subtotal,
        discount: totalDiscount,
        couponCode: appliedCoupon?.code,
        tax,
        total: grandTotal,
        paymentMethod: paymentMode
      });

      // Reset cart
      setCartItems([]);
      setAppliedCoupon(null);
      setCouponCode('');

      // Open receipt modal directly
      setActiveReceipt(newInvoice);
    } catch (err) {
      alert(err.message || 'Error processing invoice checkout');
    }
  };


  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Salon Point of Sale <span className="gold-text-gradient">& Billing</span>
          </h2>
          <p>Itemized POS register, VIP privilege discounts, multi-tender settlement & invoices</p>
        </div>
      </div>

      <div className="pos-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Catalog (Services & Retail Products) */}
        <div className="luxe-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`btn ${activeCatalogTab === 'services' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveCatalogTab('services')}
              >
                <Sparkles size={14} /> Services Catalog
              </button>
              <button
                className={`btn ${activeCatalogTab === 'products' ? 'btn-gold' : 'btn-secondary'}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveCatalogTab('products')}
              >
                <ShoppingBag size={14} /> Retail Products
              </button>
            </div>

            <div style={{ position: 'relative', width: 200 }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '6px 12px 6px 28px', fontSize: '0.78rem' }}
                placeholder="Filter catalog..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Catalog Grid (Medium Size Scrollable Container) */}
          <div className="custom-scrollbar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 10, maxHeight: 410, overflowY: 'auto', paddingRight: 6 }}>

            {activeCatalogTab === 'services'
              ? services
                  .filter(s => !catalogSearch || s.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map((srv) => {
                    const cartItem = cartItems.find(item => item.type === 'service' && item.id === srv.id);
                    const isSelected = Boolean(cartItem);
                    const itemQty = cartItem?.qty || 0;

                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleServiceInCart(srv)}
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0.05) 100%)'
                            : 'var(--bg-elevated)',
                          border: isSelected
                            ? '1.5px solid var(--gold-primary)'
                            : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isSelected
                            ? '0 4px 16px rgba(56, 189, 248, 0.22), inset 0 0 10px rgba(56, 189, 248, 0.06)'
                            : 'var(--shadow-sm)',
                          position: 'relative',
                          transform: isSelected ? 'translateY(-2px)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--gold-primary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                            <div style={{ fontSize: '0.65rem', color: isSelected ? 'var(--gold-primary)' : 'var(--text-gold)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
                              {srv.category?.split('&')[0] || srv.category}
                            </div>
                            {isSelected && (
                              <span
                                style={{
                                  background: 'var(--gold-primary)',
                                  color: '#070c18',
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                  fontWeight: 800
                                }}
                                title="Selected in bill"
                              >
                                <Check size={11} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', marginTop: 3, lineHeight: 1.25, color: 'var(--text-primary)' }}>
                            {srv.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: isSelected ? 'var(--gold-primary)' : 'var(--text-muted)', marginTop: 3, fontWeight: isSelected ? 600 : 400 }}>
                            {srv.durationMinutes || srv.duration || 30} mins
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                          <span style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.90rem' }}>
                            {settings.currency}{srv.price}
                          </span>
                          {isSelected ? (
                            <span
                              className="btn btn-gold"
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.68rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.35)',
                                borderRadius: 'var(--radius-xs)'
                              }}
                            >
                              <Check size={11} strokeWidth={2.5} />
                              <span>{itemQty > 1 ? `Added (${itemQty})` : 'Selected'}</span>
                            </span>
                          ) : (
                            <span className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.68rem', borderRadius: 'var(--radius-xs)' }}>
                              + Add
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
              : products
                  .filter(p => !catalogSearch || p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                  .map((prod) => {
                    const cartItem = cartItems.find(item => item.type === 'product' && item.productId === prod.id);
                    const isSelected = Boolean(cartItem);
                    const itemQty = cartItem?.qty || 0;
                    const prodPrice = Number(prod.retailPrice || prod.sellingPrice || prod.price || 0);

                    return (
                      <div
                        key={prod.id}
                        onClick={() => toggleProductInCart(prod)}
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0.05) 100%)'
                            : 'var(--bg-elevated)',
                          border: isSelected
                            ? '1.5px solid var(--gold-primary)'
                            : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: isSelected
                            ? '0 4px 16px rgba(56, 189, 248, 0.22), inset 0 0 10px rgba(56, 189, 248, 0.06)'
                            : 'var(--shadow-sm)',
                          position: 'relative',
                          transform: isSelected ? 'translateY(-2px)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--gold-primary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                            <div style={{ fontSize: '0.65rem', color: isSelected ? 'var(--gold-primary)' : 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 800 }}>
                              {prod.brand || 'Lumina Luxe'}
                            </div>
                            {isSelected && (
                              <span
                                style={{
                                  background: 'var(--gold-primary)',
                                  color: '#070c18',
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                  fontWeight: 800
                                }}
                                title="Selected in bill"
                              >
                                <Check size={11} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', marginTop: 3, lineHeight: 1.25 }}>{prod.name}</div>
                          <div style={{ fontSize: '0.68rem', color: prod.stock <= prod.minStockAlert ? 'var(--ruby-accent)' : 'var(--emerald-accent)', marginTop: 3 }}>
                            {prod.stock} in stock
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                          <span style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.90rem' }}>
                            {settings.currency}{prodPrice}
                          </span>
                          {isSelected ? (
                            <span
                              className="btn btn-gold"
                              style={{
                                padding: '3px 8px',
                                fontSize: '0.68rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontWeight: 700,
                                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.35)',
                                borderRadius: 'var(--radius-xs)'
                              }}
                            >
                              <Check size={12} strokeWidth={2.5} />
                              <span>{itemQty > 1 ? `Added (${itemQty})` : 'Selected'}</span>
                            </span>
                          ) : (
                            <span className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: 'var(--radius-xs)' }}>
                              + Add
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
          </div>
        </div>

        {/* Right Column: Interactive Bill Summary / Cart Register */}
        <div className="luxe-card" style={{ border: '1px solid var(--border-gold)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Receipt size={18} color="var(--gold-primary)" /> Register Checkout
          </h3>

          {/* Customer Selection with Automatic All Customer Details Showcase */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Client Account (Customer ID)</label>
            <select
              className="form-select"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.id}] {c.name} &bull; {c.gender || 'Female'} &bull; {c.phone} &bull; {c.tier} ({c.loyaltyPoints ?? 0} Pts)
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <div
                style={{
                  marginTop: 8,
                  padding: 10,
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-gold)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedCustomer.name}</span>
                    <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{selectedCustomer.tier || 'Member'}</span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{selectedCustomer.gender || 'Female'}</span>
                  </div>
                  <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>ID: {selectedCustomer.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.72rem', flexWrap: 'wrap', gap: 4 }}>
                  <span>📞 {selectedCustomer.phone}</span>
                  {selectedCustomer.email && <span>✉️ {selectedCustomer.email}</span>}
                  <span>📍 {selectedCustomer.address}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 4, marginTop: 2, fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--emerald-accent)', fontWeight: 600 }}>
                    Loyalty Balance: {selectedCustomer.loyaltyPoints ?? 0} Pts (worth {settings.currency || '₹'}{((Number(selectedCustomer.loyaltyPoints) || 0) * (Number(settings.loyaltyRedeemValue) || 0.5)).toFixed(2)})
                  </span>
                  <span>Visits: {selectedCustomer.visitsCount || 1}</span>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '12px 0', minHeight: 180, maxHeight: 260, overflowY: 'auto' }}>
            {cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Cart is empty. Select services or retail products from the catalog.
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    padding: '8px 10px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-xs)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {item.name}
                    </div>
                    {item.type === 'service' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Stylist:</span>
                        <select
                          value={item.stylistId}
                          onChange={(e) => updateCartItemStylist(idx, e.target.value)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--gold-primary)',
                            fontSize: '0.7rem',
                            padding: '2px 4px',
                            borderRadius: 4
                          }}
                        >
                          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', borderRadius: 4, border: '1px solid var(--border-subtle)' }}>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '2px 7px', cursor: 'pointer' }}
                        onClick={() => updateCartItemQty(idx, -1)}
                      >-</button>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0 4px' }}>{item.qty}</span>
                      <button
                        style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '2px 7px', cursor: 'pointer' }}
                        onClick={() => updateCartItemQty(idx, 1)}
                      >+</button>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.88rem', minWidth: 60, textAlign: 'right' }}>
                      {settings.currency}{(Number(item.price) * item.qty).toFixed(2)}
                    </div>

                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--ruby-accent)', cursor: 'pointer', padding: 2 }}
                      onClick={() => removeCartItem(idx)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coupon Input */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <input
              type="text"
              className="form-input"
              style={{ textTransform: 'uppercase', fontSize: '0.8rem', padding: '8px 12px' }}
              placeholder="Promo Code (e.g. WELCOME15)"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                if (couponFeedback) setCouponFeedback(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
            />
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              onClick={handleApplyCoupon}
              disabled={isValidatingCoupon}
            >
              {isValidatingCoupon ? 'Validating...' : 'Apply'}
            </button>
          </div>

          {couponFeedback && (
            <div style={{
              marginTop: 6,
              padding: '6px 10px',
              borderRadius: 4,
              fontSize: '0.74rem',
              background: couponFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: couponFeedback.type === 'success' ? 'var(--emerald-accent)' : '#f87171',
              border: `1px solid ${couponFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {couponFeedback.message}
            </div>
          )}

          {appliedCoupon && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.12)', padding: '6px 10px', borderRadius: 4, margin: '8px 0 12px', fontSize: '0.75rem', color: 'var(--emerald-accent)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span>Coupon <strong>{appliedCoupon.code}</strong> Applied (-{settings.currency}{couponDiscount.toFixed(2)})</span>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--ruby-accent)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => {
                  setAppliedCoupon(null);
                  setCouponCode('');
                  setCouponFeedback(null);
                }}
              >
                Remove
              </button>
            </div>
          )}

          {/* Pricing Totals Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal:</span>
              <span>{settings.currency}{subtotal.toFixed(2)}</span>
            </div>

            {tierDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--emerald-accent)' }}>
                <span>{selectedCustomer?.tier} Discount ({(tierDiscountPct * 100)}%):</span>
                <span>-{settings.currency}{tierDiscount.toFixed(2)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--emerald-accent)' }}>
                <span>Coupon ({appliedCoupon?.code}):</span>
                <span>-{settings.currency}{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>{settings.taxName} ({settings.taxRate}%):</span>
              <span>{settings.currency}{tax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)', borderTop: '1px solid var(--border-gold)', paddingTop: 8, marginTop: 4 }}>
              <span>Grand Total:</span>
              <span>{settings.currency}{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Tender Settlement Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {['Credit Card', 'Cash', 'Apple Pay / UPI', 'Points'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`btn ${paymentMode === mode ? 'btn-gold' : 'btn-secondary'}`}
                  style={{ padding: '6px 4px', fontSize: '0.72rem' }}
                  onClick={() => setPaymentMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Button */}
          <button
            id="btn-complete-pos-checkout"
            className="btn btn-gold"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            onClick={handleCheckout}
          >
            <CheckCircle size={18} /> Complete Sale & Print Tax Invoice
          </button>
        </div>
      </div>

      {/* Recent Invoices Ledger Section */}
      <div style={{ marginTop: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="var(--gold-primary)" />
              Past Issued Invoices Ledger
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3 }}>
              Audited POS tax invoices, payment settlement records & printable luxury receipts
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              {invoices.length} Invoices Recorded
            </span>
          </div>
        </div>

        <div className="luxe-table-container" style={{ overflowX: 'auto', width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', background: 'var(--bg-card)' }}>
          <table className="luxe-table" style={{ width: '100%', minWidth: 980 }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap', width: 180 }}>CLIENT</th>
                <th style={{ whiteSpace: 'nowrap', width: 190 }}>DATE & TIME</th>
                <th style={{ whiteSpace: 'nowrap' }}>ITEMS BILLED</th>
                <th style={{ whiteSpace: 'nowrap', textAlign: 'center', width: 190 }}>PAYMENT MODE</th>
                <th style={{ whiteSpace: 'nowrap', textAlign: 'right', width: 140 }}>TOTAL SETTLED</th>
                <th style={{ whiteSpace: 'nowrap', textAlign: 'center', width: 140 }}>RECEIPT</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px 14px', color: 'var(--text-muted)' }}>
                    No past invoices found. Complete a sale above to issue an invoice.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    {/* Client */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.customerName}</div>
                      {inv.customerPhone && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.customerPhone}</div>
                      )}
                    </td>

                    {/* Date & Time */}
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {inv.date} &bull; {inv.time}
                    </td>

                    {/* Items Billed - Compact with 'More' button to expand */}
                    <td style={{ fontSize: '0.82rem', minWidth: 240, maxWidth: 360 }}>
                      {(() => {
                        const items = inv.items || [];
                        const isExpanded = expandedInvoiceIds.includes(inv.id);
                        const hasMore = items.length > 1;

                        if (items.length === 0) {
                          return <span style={{ color: 'var(--text-muted)' }}>No items</span>;
                        }

                        if (!isExpanded) {
                          // Collapsed: Single clean line with primary item and "+X more" button
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                {items.length} {items.length === 1 ? 'item' : 'items'}
                              </span>
                              <span
                                style={{
                                  color: 'var(--text-primary)',
                                  fontWeight: 500,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: 160
                                }}
                                title={items[0]?.name}
                              >
                                {items[0]?.name}
                              </span>
                              {hasMore && (
                                <button
                                  type="button"
                                  onClick={() => toggleInvoiceItems(inv.id)}
                                  style={{
                                    background: 'var(--gold-subtle)',
                                    border: '1px solid var(--border-gold)',
                                    color: 'var(--gold-primary)',
                                    borderRadius: '12px',
                                    padding: '2px 8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    transition: 'all 0.15s ease'
                                  }}
                                  title="Click to view all items billed"
                                >
                                  +{items.length - 1} more ▼
                                </button>
                              )}
                            </div>
                          );
                        } else {
                          // Expanded: Show full breakdown of items with "Show less" button
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                                <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                                  {items.length} items total
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleInvoiceItems(inv.id)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--gold-primary)',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: '2px 4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3
                                  }}
                                  title="Click to collapse"
                                >
                                  Show less ▲
                                </button>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, background: 'var(--bg-elevated)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                                {items.map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', gap: 8 }}>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                      • {item.name} {item.qty > 1 && <span style={{ color: 'var(--text-muted)' }}>(x{item.qty})</span>}
                                    </div>
                                    {item.price && (
                                      <div style={{ color: 'var(--gold-primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        {settings.currency}{Number(item.price).toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </td>

                    {/* Payment Mode */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', fontSize: '0.72rem' }}>
                        <CreditCard size={11} />
                        {inv.paymentMethod}
                      </span>
                    </td>

                    {/* Total Settled */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--gold-primary)', fontSize: '0.96rem' }}>
                        {settings.currency}{Number(inv.total).toFixed(2)}
                      </strong>
                    </td>

                    {/* Receipt Action */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: '5px 12px',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: 'var(--gold-primary)',
                          borderColor: 'var(--border-gold)',
                          fontWeight: 600
                        }}
                        onClick={() => setActiveReceipt(inv)}
                      >
                        <Printer size={13} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
