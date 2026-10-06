import React, { useState, useRef, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Package,
  Plus,
  Search,
  DollarSign,
  AlertTriangle,
  Barcode,
  ShoppingBag,
  Trash2,
  X,
  Edit2,
  Sparkles,
  Layers,
  Calendar,
  Truck,
  CheckCircle2,
  Filter,
  Upload,
  Camera,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Check
} from 'lucide-react';

const DEFAULT_5_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1608248597359-54859a850125?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80'
];

// Live Camera Capture Modal for Direct Photo Snapping
const CameraCaptureModal = ({ slotIndex, onCapture, onClose }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const startCamera = async (mode = facingMode) => {
    setIsLoading(true);
    setCameraError(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsLoading(false);
    } catch (err) {
      console.warn('[CAMERA] Error accessing camera:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.play().catch(() => {});
        }
        setIsLoading(false);
      } catch (fallbackErr) {
        setCameraError('Unable to access device camera. Please check permissions or use device file upload.');
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(slotIndex, capturedImage);
      onClose();
    }
  };

  const toggleCameraFacing = () => {
    setCapturedImage(null);
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} color="var(--gold-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Direct Camera Capture &bull; Slot {slotIndex + 1}
            </h3>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose} style={{ padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Viewfinder area */}
        <div style={{ position: 'relative', width: '100%', height: 340, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {capturedImage ? (
            <img src={capturedImage} alt="Captured product" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {isLoading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--gold-primary)' }}>
                  <Camera size={32} />
                  <span style={{ fontSize: '0.85rem' }}>Opening camera...</span>
                </div>
              )}
              {cameraError && (
                <div style={{ position: 'absolute', inset: 0, padding: 24, background: 'rgba(20,23,34,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12 }}>
                  <AlertTriangle size={36} color="var(--ruby-accent)" />
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{cameraError}</p>
                  <label className="btn btn-gold" style={{ fontSize: '0.8rem', padding: '8px 18px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Upload size={14} /> Upload from Device
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            onCapture(slotIndex, ev.target.result);
                            onClose();
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
              {/* Gold Viewfinder Overlay */}
              {!cameraError && !isLoading && (
                <div style={{ position: 'absolute', inset: 24, pointerEvents: 'none', border: '1.5px dashed rgba(212,175,55,0.4)', borderRadius: 12 }}>
                  <div style={{ position: 'absolute', top: 8, left: 8, color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: 4 }}>
                    Align product in viewfinder
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Switch Camera (Front / Back)"
              >
                <RefreshCw size={13} /> Switch
              </button>

              <button
                type="button"
                onClick={handleSnap}
                disabled={isLoading || !!cameraError}
                className="btn btn-gold"
                style={{ fontSize: '0.85rem', padding: '8px 24px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Camera size={16} /> Snap Photo
              </button>

              <label className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Upload size={13} /> File
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        onCapture(slotIndex, ev.target.result);
                        onClose();
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={14} /> Retake
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="btn btn-gold"
                style={{ fontSize: '0.85rem', padding: '8px 26px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={16} /> Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductsView = () => {
  const {
    products,
    addProduct,
    updateProduct,
    quickRestock,
    settings,
    globalSearch
  } = useSalon();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeCameraSlot, setActiveCameraSlot] = useState(null);

  // Preview Lightbox Modal for 5 Product Images
  const [previewProduct, setPreviewProduct] = useState(null);
  const [activePreviewImgIdx, setActivePreviewImgIdx] = useState(0);

  // Form State with 5 Product Images
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Hair Products',
    subcategory: 'Hair Care',
    sku: '',
    barcode: '',
    purchasePrice: 20.0,
    costPrice: 20.0,
    sellingPrice: 45.0,
    retailPrice: 45.0,
    tax: 18,
    quantity: 20,
    stock: 20,
    minimumStock: 8,
    minStockAlert: 8,
    batch: 'BAT-2026-01',
    expiry: '2028-12-31',
    supplier: "L'Oréal Luxury Pro Division",
    image: DEFAULT_5_SAMPLE_IMAGES[0],
    images: [...DEFAULT_5_SAMPLE_IMAGES],
    type: 'Retail',
    status: 'Active'
  });

  const categories = ['ALL', 'Hair Products', 'Skin Products', 'Nail Products'];

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch =
      !globalSearch ||
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (p.barcode && p.barcode.includes(globalSearch)) ||
      (p.category && p.category.toLowerCase().includes(globalSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleImageSlotChange = (index, url) => {
    const updatedImages = [...(formData.images || ['', '', '', '', ''])];
    updatedImages[index] = url;
    const firstValidImg = updatedImages.find(img => img && typeof img === 'string' && img.trim() !== '') || '';
    setFormData({
      ...formData,
      images: updatedImages,
      image: firstValidImg
    });
  };

  const handleFileUploadSlot = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      handleImageSlotChange(index, e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImageSlot = (index) => {
    handleImageSlotChange(index, '');
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      category: activeCategory !== 'ALL' ? activeCategory : 'Hair Products',
      subcategory: 'Hair Care',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      purchasePrice: 20.0,
      costPrice: 20.0,
      sellingPrice: 45.0,
      retailPrice: 45.0,
      tax: 18,
      quantity: 20,
      stock: 20,
      minimumStock: 8,
      minStockAlert: 8,
      batch: `BAT-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      expiry: '2028-12-31',
      supplier: "L'Oréal Luxury Pro Division",
      image: DEFAULT_5_SAMPLE_IMAGES[0],
      images: [...DEFAULT_5_SAMPLE_IMAGES],
      type: 'Retail',
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    let existingImgs = [];
    if (Array.isArray(p.images) && p.images.length > 0) {
      existingImgs = [...p.images];
    } else if (p.image) {
      existingImgs = [p.image];
    }
    while (existingImgs.length < 5) {
      existingImgs.push('');
    }

    setFormData({
      name: p.name,
      brand: p.brand || '',
      category: p.category || 'Hair Products',
      subcategory: p.subcategory || '',
      sku: p.sku || '',
      barcode: p.barcode || '',
      purchasePrice: p.purchasePrice || p.costPrice || 20,
      costPrice: p.costPrice || p.purchasePrice || 20,
      sellingPrice: p.sellingPrice || p.retailPrice || 45,
      retailPrice: p.retailPrice || p.sellingPrice || 45,
      tax: p.tax || 18,
      quantity: p.quantity !== undefined ? p.quantity : p.stock,
      stock: p.stock !== undefined ? p.stock : p.quantity,
      minimumStock: p.minimumStock || p.minStockAlert || 8,
      minStockAlert: p.minStockAlert || p.minimumStock || 8,
      batch: p.batch || 'BAT-2026-01',
      expiry: p.expiry || '2028-12-31',
      supplier: p.supplier || "L'Oréal Luxury Pro Division",
      image: existingImgs.find(img => img !== '') || p.image || '',
      images: existingImgs,
      type: p.type || 'Retail',
      status: p.status || 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validImages = (formData.images || []).filter(img => img && img.trim() !== '');
    const mainImg = validImages[0] || formData.image || DEFAULT_5_SAMPLE_IMAGES[0];

    const payload = {
      ...formData,
      image: mainImg,
      images: formData.images,
      purchasePrice: Number(formData.purchasePrice),
      costPrice: Number(formData.purchasePrice),
      sellingPrice: Number(formData.sellingPrice),
      retailPrice: Number(formData.sellingPrice),
      tax: Number(formData.tax),
      quantity: Number(formData.quantity),
      stock: Number(formData.quantity),
      minimumStock: Number(formData.minimumStock),
      minStockAlert: Number(formData.minimumStock)
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Product Catalog & <span className="gold-text-gradient">Retail Boutique</span>
          </h2>
          <p>19.1 Categories (Hair, Skin, Nail Products) & 19.2 Master Product Data with Barcodes, Tax & Batch Tracking</p>
        </div>

        <button className="btn btn-gold" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Category Pills (19.1 Product Categories) */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map((cat) => {
          const count = cat === 'ALL' ? products.length : products.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              className={`btn ${activeCategory === cat ? 'btn-gold' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '8px 16px' }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'ALL' ? 'All Products' : cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Grid (19.2 Data Schema Display & 5 Product Images Gallery) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filtered.map((prod) => (
          <ProductItemCard
            key={prod.id}
            prod={prod}
            settings={settings}
            quickRestock={quickRestock}
            handleOpenEdit={handleOpenEdit}
            onOpenGallery={(p, initialIdx) => {
              setPreviewProduct(p);
              setActivePreviewImgIdx(initialIdx || 0);
            }}
          />
        ))}
      </div>

      {/* 5-IMAGE FULLSCREEN LIGHTBOX GALLERY MODAL */}
      {previewProduct && (
        <div className="modal-overlay" onClick={() => setPreviewProduct(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 720, padding: 20, textAlign: 'center' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', textAlign: 'left' }}>{previewProduct.name}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', textAlign: 'left', fontWeight: 600 }}>
                  {previewProduct.brand} &bull; {previewProduct.category}
                </p>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setPreviewProduct(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Main Preview Image */}
            {(() => {
              const pImgs = (Array.isArray(previewProduct.images) && previewProduct.images.filter(i => i && i.trim() !== '').length > 0)
                ? previewProduct.images.filter(i => i && i.trim() !== '')
                : [previewProduct.image || DEFAULT_5_SAMPLE_IMAGES[0]];
              const currentImg = pImgs[activePreviewImgIdx] || pImgs[0];

              return (
                <div>
                  <div style={{ position: 'relative', height: 380, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={currentImg}
                      alt={`Product Image ${activePreviewImgIdx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />

                    {pImgs.length > 1 && (
                      <>
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => setActivePreviewImgIdx(prev => (prev === 0 ? pImgs.length - 1 : prev - 1))}
                          style={{ position: 'absolute', left: 12, background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => setActivePreviewImgIdx(prev => (prev === pImgs.length - 1 ? 0 : prev + 1))}
                          style={{ position: 'absolute', right: 12, background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(0,0,0,0.75)', color: 'white', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700 }}>
                      Photo {activePreviewImgIdx + 1} of {pImgs.length}
                    </div>
                  </div>

                  {/* 5 Thumbnails selector */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
                    {pImgs.map((imgUrl, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePreviewImgIdx(i)}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: activePreviewImgIdx === i ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                          opacity: activePreviewImgIdx === i ? 1 : 0.6,
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <img src={imgUrl} alt={`Thumb ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 19.2 PRODUCT DATA ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product (19.2 Schema)'}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Moroccanoil Treatment Argan Oil (100ml)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Moroccanoil"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="Hair Products">Hair Products (Shampoo, Mask, Serum, Oil, Cream)</option>
                    <option value="Skin Products">Skin Products (Cleanser, Toner, Sunscreen, Serum)</option>
                    <option value="Nail Products">Nail Products (Polish, Remover, Treatment)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subcategory / Tag</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Hair Oil / Heat Protection"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">SKU Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Barcode (EAN / UPC) *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Purchase Price ({settings.currency}) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Price ({settings.currency}) *</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Current Stock *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Batch No.</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Supplier Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* 5 PRODUCT IMAGES SECTION */}
              <div style={{ background: 'var(--bg-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gold)', marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gold-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Camera size={16} /> PRODUCT GALLERY (UP TO 5 IMAGES)
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Upload local image files or enter image URLs for up to 5 product photos
                    </p>
                  </div>
                  <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                    {(formData.images || []).filter(img => img && img.trim() !== '').length} / 5 Set
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const currentImg = (formData.images && formData.images[idx]) || '';
                    const isMain = idx === 0;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-card)',
                          border: isMain ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontWeight: 700 }}>
                          <span style={{ color: isMain ? 'var(--gold-primary)' : 'var(--text-secondary)' }}>
                            {isMain ? '★ Slot 1 (Main)' : `Slot ${idx + 1}`}
                          </span>
                          {currentImg && (
                            <button
                              type="button"
                              onClick={() => handleClearImageSlot(idx)}
                              style={{ background: 'none', border: 'none', color: 'var(--ruby-accent)', cursor: 'pointer', padding: 2 }}
                              title="Clear Image"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>

                        {/* Image Preview Box */}
                        <div
                          style={{
                            height: 80,
                            borderRadius: 6,
                            background: 'var(--bg-input)',
                            border: '1px dashed var(--border-subtle)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}
                        >
                          {currentImg ? (
                            <img src={currentImg} alt={`Product Slot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                              <ImageIcon size={20} style={{ opacity: 0.5, marginBottom: 2 }} />
                              <div>Empty</div>
                            </div>
                          )}
                        </div>

                        {/* Dual Actions: Upload File & Direct Camera Photo */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                          <label
                            className="btn btn-secondary"
                            style={{
                              fontSize: '0.64rem',
                              padding: '4px 3px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              justifyContent: 'center',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap'
                            }}
                            title="Upload image from computer / device"
                          >
                            <Upload size={11} /> File
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUploadSlot(idx, e.target.files[0])}
                              style={{ display: 'none' }}
                            />
                          </label>

                          <button
                            type="button"
                            className="btn btn-gold"
                            onClick={() => setActiveCameraSlot(idx)}
                            style={{
                              fontSize: '0.64rem',
                              padding: '4px 3px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              justifyContent: 'center',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              whiteSpace: 'nowrap'
                            }}
                            title="Take live photo with camera"
                          >
                            <Camera size={11} /> Camera
                          </button>
                        </div>

                        {/* Direct URL Input */}
                        <input
                          type="text"
                          className="form-input"
                          placeholder="or URL..."
                          value={currentImg}
                          onChange={(e) => handleImageSlotChange(idx, e.target.value)}
                          style={{ fontSize: '0.68rem', padding: '4px 6px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  {editingProduct ? 'Save Changes' : 'Add to Inventory Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Live Camera Modal */}
      {activeCameraSlot !== null && (
        <CameraCaptureModal
          slotIndex={activeCameraSlot}
          onCapture={handleImageSlotChange}
          onClose={() => setActiveCameraSlot(null)}
        />
      )}
    </div>
  );
};

// Sub-component for individual Product Cards with 5-Image thumbnail gallery
const ProductItemCard = ({ prod, settings, quickRestock, handleOpenEdit, onOpenGallery }) => {
  const productImages = (Array.isArray(prod.images) && prod.images.filter(img => img && img.trim() !== '').length > 0)
    ? prod.images.filter(img => img && img.trim() !== '')
    : [prod.image || DEFAULT_5_SAMPLE_IMAGES[0]];

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const currentDisplayImg = productImages[activeImgIdx] || productImages[0] || prod.image;
  const isLow = (prod.quantity !== undefined ? prod.quantity : prod.stock) <= (prod.minimumStock || prod.minStockAlert || 5);

  return (
    <div
      className="luxe-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderTop: isLow ? '3px solid var(--ruby-accent)' : '1px solid var(--border-subtle)'
      }}
    >
      <div>
        {/* Product Image Box & 5-Image Gallery Overlay */}
        <div style={{ position: 'relative', height: 180, borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 10, background: 'var(--bg-input)' }}>
          <img
            src={currentDisplayImg}
            alt={prod.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
          />

          {/* Badges Overlay */}
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6, zIndex: 2 }}>
            <span className={`badge ${prod.status === 'Active' ? 'badge-emerald' : 'badge-ruby'}`} style={{ fontSize: '0.62rem' }}>
              {prod.status || 'Active'}
            </span>
            {isLow && (
              <span className="badge badge-ruby" style={{ fontSize: '0.62rem' }}>
                Low Stock
              </span>
            )}
          </div>

          {/* 5-Photos Badge & Full Gallery Trigger */}
          <button
            type="button"
            onClick={() => onOpenGallery(prod, activeImgIdx)}
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              background: 'rgba(9, 10, 15, 0.75)',
              backdropFilter: 'blur(4px)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--gold-primary)',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '3px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              zIndex: 2
            }}
          >
            <Camera size={12} /> {productImages.length} {productImages.length === 1 ? 'Photo' : 'Photos'}
          </button>

          {/* 5-Image Thumbnail Switcher Bar */}
          {productImages.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 5,
                padding: '4px 8px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                zIndex: 2
              }}
            >
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImgIdx(idx)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: activeImgIdx === idx ? '2px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.4)',
                    padding: 0,
                    cursor: 'pointer',
                    opacity: activeImgIdx === idx ? 1 : 0.65,
                    transform: activeImgIdx === idx ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.15s ease'
                  }}
                  title={`View Image ${idx + 1}`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand & Name */}
        <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
          {prod.brand} &bull; {prod.category}
        </div>
        <h3 style={{ fontSize: '1.05rem', marginTop: 2, marginBottom: 6, lineHeight: 1.3 }}>{prod.name}</h3>

        {/* SKU, Barcode, Batch, Expiry */}
        <div style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: 6, fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>SKU: <strong>{prod.sku}</strong></span>
            <span>Barcode: <strong>{prod.barcode}</strong></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Batch: <strong>{prod.batch || 'BAT-2026-X'}</strong></span>
            <span>Expiry: <strong style={{ color: 'var(--amber-accent)' }}>{prod.expiry || '2028-12-31'}</strong></span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Supplier: {prod.supplier || "L'Oréal Luxury Pro Division"}
          </div>
        </div>

        {/* Pricing & Quantity Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, background: 'var(--bg-elevated)', padding: '8px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>BUY PRICE</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {settings.currency}{Number(prod.purchasePrice || prod.costPrice).toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SELL PRICE</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
              {settings.currency}{Number(prod.sellingPrice || prod.retailPrice).toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TAX</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyan-accent)' }}>
              {prod.tax || 18}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>STOCK</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: isLow ? 'var(--ruby-accent)' : 'var(--emerald-accent)' }}>
              {prod.quantity !== undefined ? prod.quantity : prod.stock}
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.72rem', padding: '4px 10px' }}
          onClick={() => quickRestock(prod.id, 10)}
        >
          Quick Restock +10
        </button>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-secondary btn-icon"
            style={{ width: 30, height: 30 }}
            title="View 5 Images Gallery"
            onClick={() => onOpenGallery(prod, activeImgIdx)}
          >
            <Eye size={13} color="var(--gold-primary)" />
          </button>
          <button
            className="btn btn-secondary btn-icon"
            style={{ width: 30, height: 30 }}
            title="Edit Product"
            onClick={() => handleOpenEdit(prod)}
          >
            <Edit2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
