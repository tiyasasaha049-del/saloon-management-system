import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Truck,
  FileText,
  CheckCircle,
  Clock,
  SlidersHorizontal,
  Package,
  Layers,
  X,
  Edit2,
  Trash2,
  Settings,
  Phone,
  Mail,
  MapPin,
  Building2,
  Search
} from 'lucide-react';

export const InventoryView = () => {
  const {
    products,
    addProduct,
    adjustStock,
    inventoryLogs,
    purchaseOrders,
    createPurchaseOrder,
    receivePurchaseOrder,
    quickRestock,
    settings,
    distributors = [],
    addDistributor,
    updateDistributor,
    deleteDistributor
  } = useSalon();

  const [activeTab, setActiveTab] = useState('LOGS'); // 'LOGS' | 'PURCHASE_ORDERS' | 'CURRENT_INVENTORY' | 'DISTRIBUTORS'
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Distributor Form & Management states
  const [isDistributorModalOpen, setIsDistributorModalOpen] = useState(false);
  const [editingDistributor, setEditingDistributor] = useState(null);
  const [distName, setDistName] = useState('');
  const [distContact, setDistContact] = useState('');
  const [distPhone, setDistPhone] = useState('');
  const [distEmail, setDistEmail] = useState('');
  const [distCategory, setDistCategory] = useState('Hair Care & Color');
  const [distLeadTime, setDistLeadTime] = useState(5);
  const [distAddress, setDistAddress] = useState('');
  const [distNotes, setDistNotes] = useState('');
  const [distSearchQuery, setDistSearchQuery] = useState('');

  // PO form states
  const [poSupplier, setPoSupplier] = useState(() => (distributors[0]?.name || "L'Oréal Luxury Pro Division"));
  const [poItemsCount, setPoItemsCount] = useState(30);
  const [poTotalCost, setPoTotalCost] = useState(850.0);
  const [poDeliveryDate, setPoDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  });
  const [poTargetProduct, setPoTargetProduct] = useState('');

  // Add Product form states
  const [newProductName, setNewProductName] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Hair Care');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('Bottle');
  const [newProductOpeningStock, setNewProductOpeningStock] = useState(0);
  const [newProductMinStock, setNewProductMinStock] = useState(5);
  const [newProductPurchasePrice, setNewProductPurchasePrice] = useState(0);
  const [newProductSellingPrice, setNewProductSellingPrice] = useState(0);
  const [newProductSupplier, setNewProductSupplier] = useState("L'Oréal Luxury Pro Division");
  const [newProductExpiry, setNewProductExpiry] = useState('');
  const [newProductLocation, setNewProductLocation] = useState('Backbar Shelf A');
  const [newProductDescription, setNewProductDescription] = useState('');

  // Stock Adjustment form states
  const [adjProductId, setAdjProductId] = useState(products[0]?.id || '');
  const [adjType, setAdjType] = useState('ADJUSTMENT_OUT'); // 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'
  const [adjQuantity, setAdjQuantity] = useState(1);
  const [adjReason, setAdjReason] = useState('Physical stock count');
  const [adjNotes, setAdjNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const lowStockProducts = products.filter(p => (p.stock || 0) <= (p.minStockAlert || p.minimumStock || 5));

  // Distributor Action Handlers
  const openAddDistributorModal = () => {
    setEditingDistributor(null);
    setDistName('');
    setDistContact('');
    setDistPhone('');
    setDistEmail('');
    setDistCategory('Hair Care & Color');
    setDistLeadTime(5);
    setDistAddress('');
    setDistNotes('');
    setIsDistributorModalOpen(true);
  };

  const openEditDistributorModal = (dist) => {
    if (!dist) return;
    setEditingDistributor(dist);
    setDistName(dist.name || '');
    setDistContact(dist.contactPerson || '');
    setDistPhone(dist.phone || '');
    setDistEmail(dist.email || '');
    setDistCategory(dist.category || 'Hair Care & Color');
    setDistLeadTime(dist.leadTimeDays || 5);
    setDistAddress(dist.address || '');
    setDistNotes(dist.notes || '');
    setIsDistributorModalOpen(true);
  };

  const handleDistributorSubmit = async (e) => {
    e.preventDefault();
    if (!distName.trim()) {
      alert('Distributor / Company Name is required');
      return;
    }
    setActionLoading(true);
    try {
      if (editingDistributor) {
        await updateDistributor(editingDistributor.id, {
          name: distName.trim(),
          contactPerson: distContact.trim(),
          phone: distPhone.trim(),
          email: distEmail.trim(),
          category: distCategory,
          leadTimeDays: Number(distLeadTime || 5),
          address: distAddress.trim(),
          notes: distNotes.trim()
        });
        if (poSupplier === editingDistributor.name) {
          setPoSupplier(distName.trim());
        }
        if (newProductSupplier === editingDistributor.name) {
          setNewProductSupplier(distName.trim());
        }
      } else {
        const created = await addDistributor({
          name: distName.trim(),
          contactPerson: distContact.trim(),
          phone: distPhone.trim(),
          email: distEmail.trim(),
          category: distCategory,
          leadTimeDays: Number(distLeadTime || 5),
          address: distAddress.trim(),
          notes: distNotes.trim()
        });
        if (created?.name) {
          setPoSupplier(created.name);
          setNewProductSupplier(created.name);
        }
      }
      setIsDistributorModalOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving distributor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDistributor = async (distIdentifier) => {
    const target = distributors.find(d => d.id === distIdentifier || d.name === distIdentifier);
    const targetName = target ? target.name : distIdentifier;
    if (!window.confirm(`Are you sure you want to delete authorized distributor "${targetName}"?`)) {
      return;
    }
    try {
      await deleteDistributor(target ? target.id : distIdentifier);
      if (poSupplier === targetName) {
        const remaining = distributors.filter(d => d.name !== targetName);
        setPoSupplier(remaining[0]?.name || '');
      }
      if (newProductSupplier === targetName) {
        const remaining = distributors.filter(d => d.name !== targetName);
        setNewProductSupplier(remaining[0]?.name || '');
      }
    } catch (err) {
      alert(err.message || 'Error deleting distributor');
    }
  };

  const handlePoSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await createPurchaseOrder({
        supplier: poSupplier,
        expectedDelivery: poDeliveryDate,
        itemsCount: Number(poItemsCount),
        totalCost: Number(poTotalCost),
        productId: poTargetProduct || undefined,
        productName: products.find(p => p.id === poTargetProduct)?.name || undefined
      });
      setIsPoModalOpen(false);
      setActiveTab('PURCHASE_ORDERS');
    } catch (err) {
      alert(err.message || 'Error creating purchase order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductSku.trim()) {
      alert('Product Name and SKU are required.');
      return;
    }
    setActionLoading(true);
    try {
      await addProduct({
        name: newProductName.trim(),
        sku: newProductSku.trim(),
        category: newProductCategory,
        brand: newProductBrand.trim(),
        unit: newProductUnit,
        stock: Number(newProductOpeningStock || 0),
        opening_stock: Number(newProductOpeningStock || 0),
        minimumStock: Number(newProductMinStock || 5),
        minStockAlert: Number(newProductMinStock || 5),
        purchasePrice: Number(newProductPurchasePrice || 0),
        costPrice: Number(newProductPurchasePrice || 0),
        sellingPrice: Number(newProductSellingPrice || 0),
        retailPrice: Number(newProductSellingPrice || 0),
        supplier: newProductSupplier,
        expiry: newProductExpiry,
        location: newProductLocation,
        description: newProductDescription
      });
      setIsAddProductModalOpen(false);
      // Reset fields
      setNewProductName('');
      setNewProductSku('');
      setNewProductBrand('');
      setNewProductOpeningStock(0);
      setNewProductPurchasePrice(0);
      setNewProductSellingPrice(0);
      setNewProductDescription('');
      setActiveTab('LOGS');
    } catch (err) {
      alert(err.message || 'Error creating product');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!adjProductId) {
      alert('Please select a product to adjust.');
      return;
    }
    if (Number(adjQuantity) <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }
    setActionLoading(true);
    try {
      await adjustStock({
        product_id: adjProductId,
        adjustment_type: adjType,
        quantity: Number(adjQuantity),
        reason: adjReason,
        notes: adjNotes
      });
      setIsAdjustmentModalOpen(false);
      setAdjQuantity(1);
      setAdjNotes('');
      setActiveTab('LOGS');
    } catch (err) {
      alert(err.message || 'Error adjusting stock');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceivePo = async (poId) => {
    if (!window.confirm('Confirm receiving this purchase order? Product inventory will be increased immediately.')) return;
    try {
      await receivePurchaseOrder(poId);
    } catch (err) {
      alert(err.message || 'Error receiving purchase order');
    }
  };

  const handleRestockClick = (p) => {
    setPoSupplier(p.supplier || "L'Oréal Luxury Pro Division");
    setPoTargetProduct(p.id);
    setPoItemsCount(12);
    setPoTotalCost(Number((p.purchasePrice || p.costPrice || 20) * 12));
    setIsPoModalOpen(true);
  };

  const selectedAdjProduct = products.find(p => p.id === adjProductId) || products[0];

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Inventory & <span className="gold-text-gradient">Supplies Control</span>
          </h2>
          <p>Real-time backbar stock deductions, salon consumption audit & supplier purchase orders</p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={openAddDistributorModal}>
            <Plus size={16} /> Add Distributor
          </button>
          <button className="btn btn-secondary" onClick={() => setIsAdjustmentModalOpen(true)}>
            <SlidersHorizontal size={16} /> Stock Adjustment
          </button>
          <button className="btn btn-gold" onClick={() => setIsPoModalOpen(true)}>
            <Plus size={16} /> Create Purchase Order (PO)
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={24} color="var(--ruby-accent)" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--ruby-accent)' }}>
                Low Inventory Threshold Alert ({lowStockProducts.length} Items Critical)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {lowStockProducts.map(p => `${p.name} (${p.stock} left)`).join(' • ')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {lowStockProducts.map(p => (
              <button
                key={p.id}
                className="btn btn-secondary"
                style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                onClick={() => handleRestockClick(p)}
              >
                Restock {p.name.split(' ')[0]} +12
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'LOGS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('LOGS')}
        >
          <Boxes size={14} /> Stock Movements & Consumption Log
        </button>
        <button
          className={`btn ${activeTab === 'PURCHASE_ORDERS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('PURCHASE_ORDERS')}
        >
          <Truck size={14} /> Supplier Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          className={`btn ${activeTab === 'CURRENT_INVENTORY' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('CURRENT_INVENTORY')}
        >
          <Package size={14} /> Current Inventory ({products.length})
        </button>
        <button
          className={`btn ${activeTab === 'DISTRIBUTORS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('DISTRIBUTORS')}
        >
          <Building2 size={14} /> Authorized Distributors ({distributors.length})
        </button>
      </div>

      {activeTab === 'LOGS' && (
        /* Stock Movements Ledger */
        <div className="luxe-table-container">
          <table className="luxe-table">
            <thead>
              <tr>
                <th>Date & Timestamp</th>
                <th>Product Formulation</th>
                <th>Movement Type</th>
                <th>Quantity Delta</th>
                <th>Reference / Invoice</th>
                <th>Authorized User</th>
              </tr>
            </thead>
            <tbody>
              {inventoryLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                inventoryLogs.map((log) => {
                  const isDeduction = Number(log.quantity) < 0;
                  const qtyVal = Number(log.quantity);
                  const isPositive = qtyVal > 0;
                  return (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.date}</td>
                      <td><strong>{log.productName}</strong></td>
                      <td>
                        <span className={`badge ${isDeduction ? 'badge-amber' : 'badge-emerald'}`}>
                          {log.type}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: isDeduction ? 'var(--ruby-accent)' : 'var(--emerald-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {isDeduction ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                          {isPositive ? `+${qtyVal}` : qtyVal} units
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.reference}</td>
                      <td>{log.loggedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'PURCHASE_ORDERS' && (
        /* Supplier Purchase Orders */
        <div className="luxe-table-container">
          <table className="luxe-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Distributor / Supplier</th>
                <th>Issued Date</th>
                <th>Estimated Delivery</th>
                <th>Units Ordered</th>
                <th>Total PO Cost</th>
                <th>Fulfillment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No purchase orders placed yet.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => {
                  const isDelivered = po.status === 'RECEIVED' || po.status === 'Delivered';
                  return (
                    <tr key={po.id}>
                      <td><strong>{po.code}</strong></td>
                      <td>{po.supplier}</td>
                      <td>{po.orderDate}</td>
                      <td>{po.expectedDelivery}</td>
                      <td>{po.itemsCount} units</td>
                      <td style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>
                        {settings.currency}{Number(po.totalCost || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${isDelivered ? 'badge-emerald' : 'badge-cyan'}`}>
                          {po.status}
                        </span>
                      </td>
                      <td>
                        {!isDelivered ? (
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '4px 10px', color: 'var(--emerald-accent)' }}
                            onClick={() => handleReceivePo(po.id)}
                          >
                            <CheckCircle size={13} /> Receive Delivery
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock Added</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'CURRENT_INVENTORY' && (
        /* Current Inventory View */
        <div className="luxe-table-container">
          <table className="luxe-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Minimum Stock</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => {
                const stock = Number(prod.stock || 0);
                const minStock = Number(prod.minStockAlert || prod.minimumStock || 5);
                let statusLabel = 'IN STOCK';
                let statusBadgeClass = 'badge-emerald';

                if (stock === 0) {
                  statusLabel = 'OUT OF STOCK';
                  statusBadgeClass = 'badge-ruby';
                } else if (stock <= minStock) {
                  statusLabel = 'LOW STOCK';
                  statusBadgeClass = 'badge-amber';
                }

                return (
                  <tr key={prod.id}>
                    <td>
                      <div>
                        <strong>{prod.name}</strong>
                        {prod.brand && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.brand} • SKU: {prod.sku}</div>}
                      </div>
                    </td>
                    <td>{prod.category}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: stock <= minStock ? 'var(--ruby-accent)' : 'var(--text-primary)' }}>
                        {stock} units
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{minStock} units</td>
                    <td>{settings.currency}{Number(prod.purchasePrice || prod.costPrice || 0).toFixed(2)}</td>
                    <td style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>
                      {settings.currency}{Number(prod.sellingPrice || prod.retailPrice || 0).toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Distributors Management Tab */}
      {activeTab === 'DISTRIBUTORS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36, height: 38 }}
                placeholder="Search distributors or brand..."
                value={distSearchQuery}
                onChange={(e) => setDistSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-gold" onClick={openAddDistributorModal} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={16} /> Add New Distributor
            </button>
          </div>

          <div className="luxe-table-container">
            <table className="luxe-table">
              <thead>
                <tr>
                  <th>Distributor / Supplier</th>
                  <th>Product Category</th>
                  <th>Contact Person</th>
                  <th>Contact Info</th>
                  <th>Lead Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {distributors
                  .filter(d => {
                    if (!distSearchQuery.trim()) return true;
                    const q = distSearchQuery.toLowerCase();
                    return (
                      d.name?.toLowerCase().includes(q) ||
                      d.category?.toLowerCase().includes(q) ||
                      d.contactPerson?.toLowerCase().includes(q) ||
                      d.notes?.toLowerCase().includes(q)
                    );
                  })
                  .map(d => {
                    const poCount = purchaseOrders.filter(po => po.supplier === d.name).length;
                    return (
                      <tr key={d.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36,
                              height: 36,
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(212, 175, 55, 0.12)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--gold-accent)',
                              flexShrink: 0
                            }}>
                              <Building2 size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</div>
                              {d.address && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                  <MapPin size={11} /> {d.address}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                            {d.category || 'Hair & Beauty'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{d.contactPerson || '—'}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {d.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                                <Phone size={12} color="var(--gold-accent)" /> {d.phone}
                              </div>
                            )}
                            {d.email && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                                <Mail size={12} /> {d.email}
                              </div>
                            )}
                            {!d.phone && !d.email && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            ~{d.leadTimeDays || 5} days
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-success">
                            {d.status || 'Active'}
                          </span>
                          {poCount > 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                              {poCount} order{poCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                              onClick={() => {
                                setPoSupplier(d.name);
                                setIsPoModalOpen(true);
                              }}
                              title="Create PO with this distributor"
                            >
                              <Plus size={13} /> Order
                            </button>
                            <button
                              className="btn btn-secondary btn-icon"
                              style={{ padding: '6px' }}
                              onClick={() => openEditDistributorModal(d)}
                              title="Edit Distributor"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-secondary btn-icon"
                              style={{ padding: '6px', color: 'var(--ruby-accent)' }}
                              onClick={() => handleDeleteDistributor(d.id)}
                              title="Delete Distributor"
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
        </div>
      )}

      {/* Create Purchase Order Modal */}
      {isPoModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPoModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Create Supplier Purchase Order</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsPoModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePoSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Authorized Supplier / Distributor *</label>
                  <button
                    type="button"
                    className="btn btn-gold"
                    style={{ fontSize: '0.72rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 6 }}
                    onClick={openAddDistributorModal}
                    title="Register a new authorized distributor"
                  >
                    <Plus size={13} /> Add New Distributor
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    className="form-select"
                    style={{ flex: 1 }}
                    value={poSupplier}
                    onChange={(e) => setPoSupplier(e.target.value)}
                    required
                  >
                    {distributors.length === 0 ? (
                      <option value="">No distributors registered yet</option>
                    ) : (
                      distributors.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))
                    )}
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    title="Edit selected distributor"
                    onClick={() => {
                      const cur = distributors.find(d => d.name === poSupplier);
                      if (cur) openEditDistributorModal(cur);
                      else alert('Please select a valid distributor to edit.');
                    }}
                    style={{ padding: '8px 10px', height: 'auto' }}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    title="Delete selected distributor"
                    onClick={() => handleDeleteDistributor(poSupplier)}
                    style={{ padding: '8px 10px', height: 'auto', color: 'var(--ruby-accent)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Active distributor contact info badge */}
                {(() => {
                  const sel = distributors.find(d => d.name === poSupplier);
                  if (!sel) return null;
                  return (
                    <div style={{
                      marginTop: 8,
                      padding: '8px 12px',
                      background: 'rgba(212, 175, 55, 0.08)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                        {sel.contactPerson && (
                          <span><strong>Contact:</strong> {sel.contactPerson}</span>
                        )}
                        {sel.phone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Phone size={11} /> {sel.phone}
                          </span>
                        )}
                        {sel.leadTimeDays && (
                          <span><strong>Lead Time:</strong> ~{sel.leadTimeDays}d</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '2px 8px', height: 'auto' }}
                          onClick={() => openEditDistributorModal(sel)}
                        >
                          <Edit2 size={11} style={{ marginRight: 3 }} /> Edit Details
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.7rem', padding: '2px 8px', height: 'auto', color: 'var(--ruby-accent)' }}
                          onClick={() => handleDeleteDistributor(sel.id)}
                        >
                          <Trash2 size={11} style={{ marginRight: 3 }} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="form-group">
                <label className="form-label">Target Product (Optional)</label>
                <select
                  className="form-select"
                  value={poTargetProduct}
                  onChange={(e) => setPoTargetProduct(e.target.value)}
                >
                  <option value="">General Supplier Shipment</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Total Units</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={poItemsCount}
                    onChange={(e) => setPoItemsCount(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Cost ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={poTotalCost}
                    onChange={(e) => setPoTotalCost(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expected Delivery Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={poDeliveryDate}
                  onChange={(e) => setPoDeliveryDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPoModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={actionLoading}>
                  {actionLoading ? 'Dispatching...' : 'Dispatch Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddProductModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Add New Inventory Product</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddProductModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kerastase Nutritive Mask"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. KER-NUT-200"
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                  >
                    <option value="Hair Care">Hair Care</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Nails">Nails</option>
                    <option value="Spa & Body">Spa & Body</option>
                    <option value="Salon Backbar">Salon Backbar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kérastase"
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Bottle / Tube / Box"
                    value={newProductUnit}
                    onChange={(e) => setNewProductUnit(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Opening Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={newProductOpeningStock}
                    onChange={(e) => setNewProductOpeningStock(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Stock Level</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={newProductMinStock}
                    onChange={(e) => setNewProductMinStock(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Purchase Price ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={newProductPurchasePrice}
                    onChange={(e) => setNewProductPurchasePrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-input"
                    value={newProductSellingPrice}
                    onChange={(e) => setNewProductSellingPrice(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Supplier / Distributor</label>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.7rem', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                      onClick={openAddDistributorModal}
                    >
                      <Plus size={11} /> New
                    </button>
                  </div>
                  <select
                    className="form-select"
                    value={newProductSupplier}
                    onChange={(e) => setNewProductSupplier(e.target.value)}
                  >
                    {distributors.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newProductExpiry}
                    onChange={(e) => setNewProductExpiry(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Storage Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Backbar Shelf A, Cabinet #3"
                  value={newProductLocation}
                  onChange={(e) => setNewProductLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Product formulation notes, usage guidelines..."
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddProductModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAdjustmentModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Stock Adjustment</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAdjustmentModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Product</label>
                <select
                  className="form-select"
                  value={adjProductId}
                  onChange={(e) => setAdjProductId(e.target.value)}
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Current Stock</label>
                  <input
                    type="text"
                    className="form-input"
                    value={`${selectedAdjProduct?.stock ?? 0} units`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Adjustment Type</label>
                  <select
                    className="form-select"
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value)}
                  >
                    <option value="ADJUSTMENT_IN">ADJUSTMENT_IN (+ Increase)</option>
                    <option value="ADJUSTMENT_OUT">ADJUSTMENT_OUT (- Deduction)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={adjQuantity}
                  onChange={(e) => setAdjQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <select
                  className="form-select"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                >
                  <option value="Physical stock count">Physical stock count</option>
                  <option value="Damaged goods">Damaged goods</option>
                  <option value="Expired product">Expired product</option>
                  <option value="Stock audit correction">Stock audit correction</option>
                  <option value="Internal salon transfer">Internal salon transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Additional context about this adjustment..."
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdjustmentModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Apply Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Distributor Modal */}
      {isDistributorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDistributorModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={20} color="var(--gold-accent)" />
                {editingDistributor ? 'Edit Authorized Distributor' : 'Add New Authorized Distributor'}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsDistributorModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDistributorSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Distributor / Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kérastase Official Distribution"
                  value={distName}
                  onChange={(e) => setDistName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Marc Laurent"
                    value={distContact}
                    onChange={(e) => setDistContact(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Supply Category</label>
                  <select
                    className="form-select"
                    value={distCategory}
                    onChange={(e) => setDistCategory(e.target.value)}
                  >
                    <option value="Hair Care & Color">Hair Care & Color</option>
                    <option value="Bond Building & Repair">Bond Building & Repair</option>
                    <option value="Skin Care & Peels">Skin Care & Peels</option>
                    <option value="Nails & Lacquers">Nails & Lacquers</option>
                    <option value="Spa & Backbar Equipment">Spa & Backbar Equipment</option>
                    <option value="General Supplies">General Supplies</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +1 (555) 349-2041"
                    value={distPhone}
                    onChange={(e) => setDistPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. orders@supplier.com"
                    value={distEmail}
                    onChange={(e) => setDistEmail(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Warehouse / Office Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City, State / Full address"
                    value={distAddress}
                    onChange={(e) => setDistAddress(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Average Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={distLeadTime}
                    onChange={(e) => setDistLeadTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Account Terms</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Payment terms, contract ID, account rep notes..."
                  value={distNotes}
                  onChange={(e) => setDistNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsDistributorModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : (editingDistributor ? 'Update Distributor' : 'Save Distributor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

