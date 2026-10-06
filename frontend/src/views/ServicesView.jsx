import React, { useState, useEffect, useRef } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Sparkles,
  Plus,
  Clock,
  DollarSign,
  Scissors,
  Crown,
  Eye,
  Gem,
  Smile,
  Trash2,
  Edit2,
  X,
  Heart,
  Droplets,
  Package,
  Layers,
  CheckCircle2,
  Filter,
  Home,
  Check,
  Percent,
  Search,
  ChevronDown,
  Tag,
  Sliders,
  Shield,
  Truck,
  RotateCcw,
  Building2,
  MapPin,
  Phone,
  Upload,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

const PRESET_SERVICE_IMAGES = [
  { label: 'Hair Balayage', url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80' },
  { label: 'HydraFacial', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80' },
  { label: 'Keratin Infusion', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Luxury Spa', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' },
  { label: 'Couture Cut', url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80' },
  { label: 'Nail Couture', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80' }
];

export const ServicesView = () => {
  const {
    services,
    serviceCategories,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    serviceTypes = [
      'In-Salon Suite Only',
      'Available for Home Service',
      'VIP Private Suite',
      'Express On-Demand',
      'Bridal & Event On-Site'
    ],
    addServiceType,
    updateServiceType,
    deleteServiceType,
    addService,
    updateService,
    deleteService,
    branches = [],
    addBranch,
    updateBranch,
    deleteBranch,
    employees,
    settings,
    globalSearch
  } = useSalon();

  // Filter States
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeServiceType, setActiveServiceType] = useState('ALL');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);
  const serviceFileInputRef = useRef(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Branch Manager Modal state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [newBranchData, setNewBranchData] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [editingBranch, setEditingBranch] = useState(null);

  // Category Manager Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState({ oldName: '', newName: '' });

  // Service Type Manager Modal state
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState({ oldName: '', newName: '' });

  // Close type dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State for 12.8 Service Data Schema
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    serviceType: 'In-Salon Suite Only',
    durationMinutes: 60,
    price: 150,
    tax: 18,
    commissionPct: 20,
    requiredSkills: 'Hair Styling',
    homeServiceEligible: false,
    status: 'Active',
    description: '',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=300&q=80',
    popular: false,
    eligibleStylists: []
  });

  const categories = ['ALL', ...(serviceCategories || [
    'Hair Care',
    'Skin Care',
    'Makeup',
    'Nails',
    'Grooming',
    'Spa',
    'Bridal',
    'Packages'
  ])];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Hair Care':
        return <Scissors size={14} color="var(--gold-primary)" />;
      case 'Skin Care':
        return <Droplets size={14} color="var(--cyan-accent)" />;
      case 'Makeup':
        return <Eye size={14} color="#a855f7" />;
      case 'Nails':
        return <Gem size={14} color="var(--rose-accent)" />;
      case 'Grooming':
        return <Smile size={14} color="var(--amber-accent)" />;
      case 'Spa':
        return <Heart size={14} color="#ec4899" />;
      case 'Bridal':
        return <Crown size={14} color="var(--gold-light)" />;
      case 'Packages':
        return <Package size={14} color="var(--emerald-accent)" />;
      default:
        return <Sparkles size={14} color="var(--gold-primary)" />;
    }
  };

  const getServiceTypeIcon = (typeName) => {
    const lower = (typeName || '').toLowerCase();
    if (lower.includes('home')) {
      return <Home size={13} color="var(--cyan-accent)" />;
    }
    if (lower.includes('vip') || lower.includes('suite')) {
      return <Crown size={13} color="var(--gold-primary)" />;
    }
    if (lower.includes('express') || lower.includes('on-demand')) {
      return <Truck size={13} color="var(--emerald-accent)" />;
    }
    return <Scissors size={13} color="var(--gold-primary)" />;
  };

  const getServiceEffectiveType = (srv) => {
    if (srv.serviceType) return srv.serviceType;
    return srv.homeServiceEligible ? 'Available for Home Service' : 'In-Salon Suite Only';
  };

  // Filtered Services List
  const filteredServices = services.filter((srv) => {
    const matchesCat = activeCategory === 'ALL' || srv.category === activeCategory;
    const srvType = getServiceEffectiveType(srv);
    const matchesType = activeServiceType === 'ALL' || srvType === activeServiceType;

    const searchTerm = (catalogSearch || globalSearch || '').trim().toLowerCase();
    const matchesSearch =
      !searchTerm ||
      srv.name?.toLowerCase().includes(searchTerm) ||
      srv.id?.toLowerCase().includes(searchTerm) ||
      srv.description?.toLowerCase().includes(searchTerm) ||
      srv.category?.toLowerCase().includes(searchTerm) ||
      srvType.toLowerCase().includes(searchTerm) ||
      String(srv.price).includes(searchTerm) ||
      (Array.isArray(srv.requiredSkills)
        ? srv.requiredSkills.some(sk => sk.toLowerCase().includes(searchTerm))
        : srv.requiredSkills?.toLowerCase().includes(searchTerm));

    return matchesCat && matchesType && matchesSearch;
  });

  const toggleStylistEligibility = (empId) => {
    setFormData(prev => {
      const current = prev.eligibleStylists || [];
      const exists = current.includes(empId);
      return {
        ...prev,
        eligibleStylists: exists ? current.filter(id => id !== empId) : [...current, empId]
      };
    });
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size exceeds 5MB limit. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setFormData(prev => ({
        ...prev,
        image: uploadEvent.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    const defaultCat = activeCategory !== 'ALL' ? activeCategory : (serviceCategories[0] || 'Hair Care');
    const defaultType = activeServiceType !== 'ALL' ? activeServiceType : (serviceTypes[0] || 'In-Salon Suite Only');
    setFormData({
      name: '',
      category: defaultCat,
      serviceType: defaultType,
      durationMinutes: 60,
      price: 150,
      tax: 18,
      commissionPct: 20,
      requiredSkills: 'Hair Styling',
      homeServiceEligible: defaultType.toLowerCase().includes('home'),
      status: 'Active',
      description: '',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=300&q=80',
      popular: false,
      eligibleStylists: [employees[0]?.id || 'emp-1']
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    const srvType = getServiceEffectiveType(srv);
    setFormData({
      name: srv.name,
      category: srv.category || serviceCategories[0] || 'Hair Care',
      serviceType: srvType,
      durationMinutes: srv.durationMinutes || 60,
      price: srv.price || 150,
      tax: srv.tax || 18,
      commissionPct: srv.commissionPct || 20,
      requiredSkills: Array.isArray(srv.requiredSkills) ? srv.requiredSkills.join(', ') : (srv.requiredSkills || 'Hair Styling'),
      homeServiceEligible: srv.homeServiceEligible ?? srvType.toLowerCase().includes('home'),
      status: srv.status || 'Active',
      description: srv.description || '',
      image: srv.image || '',
      popular: srv.popular || false,
      eligibleStylists: srv.eligibleStylists || []
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedSkills = typeof formData.requiredSkills === 'string'
      ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      : formData.requiredSkills;

    const isHomeEligible = formData.serviceType.toLowerCase().includes('home') || formData.homeServiceEligible;

    const payload = {
      ...formData,
      requiredSkills: formattedSkills,
      durationMinutes: Number(formData.durationMinutes),
      price: Number(formData.price),
      tax: Number(formData.tax),
      commissionPct: Number(formData.commissionPct),
      homeServiceEligible: isHomeEligible,
      eligibleStylists: formData.eligibleStylists.length > 0 ? formData.eligibleStylists : [employees[0]?.id]
    };

    if (editingService) {
      updateService(editingService.id, payload);
    } else {
      addService(payload);
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the catalog?`)) {
      deleteService(id);
    }
  };

  // Category Actions
  const handleCreateCategory = (e) => {
    e?.preventDefault();
    if (newCategoryName.trim()) {
      addServiceCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleSaveEditCategory = (oldName) => {
    if (editingCategory.newName.trim()) {
      updateServiceCategory(oldName, editingCategory.newName.trim());
      if (activeCategory === oldName) {
        setActiveCategory(editingCategory.newName.trim());
      }
      setEditingCategory({ oldName: '', newName: '' });
    }
  };

  const handleDeleteCategory = (catName) => {
    deleteServiceCategory(catName);
    if (activeCategory === catName) {
      setActiveCategory('ALL');
    }
  };

  // Service Type Actions
  const handleCreateType = (e) => {
    e?.preventDefault();
    if (newTypeName.trim()) {
      addServiceType(newTypeName.trim());
      setNewTypeName('');
    }
  };

  const handleSaveEditType = (oldName) => {
    if (editingType.newName.trim()) {
      updateServiceType(oldName, editingType.newName.trim());
      if (activeServiceType === oldName) {
        setActiveServiceType(editingType.newName.trim());
      }
      setEditingType({ oldName: '', newName: '' });
    }
  };

  const handleDeleteType = (typeName) => {
    deleteServiceType(typeName);
    if (activeServiceType === typeName) {
      setActiveServiceType('ALL');
    }
  };

  // Branch Actions
  const handleCreateBranch = (e) => {
    e?.preventDefault();
    if (!newBranchData.name.trim()) return;

    if (branches && branches.some(b => b.name.toLowerCase() === newBranchData.name.trim().toLowerCase())) {
      alert(`A branch named "${newBranchData.name.trim()}" already exists.`);
      return;
    }

    addBranch({
      name: newBranchData.name.trim(),
      address: newBranchData.address.trim() || 'Beverly Hills Luxury District',
      phone: newBranchData.phone.trim() || '+1 (800) 586-4621'
    });

    setNewBranchData({ name: '', address: '', phone: '' });
  };

  const handleSaveEditBranch = () => {
    if (!editingBranch || !editingBranch.name.trim()) return;

    const duplicate = branches && branches.some(b => b.id !== editingBranch.id && b.name.toLowerCase() === editingBranch.name.trim().toLowerCase());
    if (duplicate) {
      alert(`Another branch with name "${editingBranch.name.trim()}" already exists.`);
      return;
    }

    updateBranch(editingBranch.id, {
      name: editingBranch.name.trim(),
      address: editingBranch.address?.trim() || '',
      phone: editingBranch.phone?.trim() || ''
    });

    setEditingBranch(null);
  };

  const handleDeleteBranch = (branch) => {
    if (branches && branches.length <= 1) {
      alert('Cannot delete the last remaining branch. The salon system requires at least one active branch location.');
      return;
    }
    deleteBranch(branch.id, branch.name);
  };

  const renderServiceBadge = (srv) => {
    const type = getServiceEffectiveType(srv);
    const lower = type.toLowerCase();

    if (lower.includes('home')) {
      return (
        <span className="badge badge-cyan" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Home size={11} /> {type.toUpperCase()}
        </span>
      );
    }
    if (lower.includes('vip') || (lower.includes('suite') && !lower.includes('in-salon'))) {
      return (
        <span className="badge badge-gold" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Crown size={11} /> {type.toUpperCase()}
        </span>
      );
    }
    if (lower.includes('in-salon')) {
      return (
        <span className="badge badge-gray" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Scissors size={10} /> {type.toUpperCase()}
        </span>
      );
    }
    return (
      <span className="badge badge-emerald" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Tag size={10} /> {type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Service Management & <span className="gold-text-gradient">Treatment Menu</span>
          </h2>
          <p>
            Modular service categories & delivery modes with live category management, inline edit, delete & custom additions
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setIsBranchModalOpen(true)}>
            <Building2 size={15} color="var(--gold-primary)" /> Manage Branches
          </button>
          <button className="btn btn-secondary" onClick={() => setIsCategoryModalOpen(true)}>
            <Layers size={15} color="var(--gold-primary)" /> Manage Categories
          </button>
          <button className="btn btn-secondary" onClick={() => setIsTypeModalOpen(true)}>
            <Tag size={15} color="var(--gold-primary)" /> Manage Service Types
          </button>
          <button className="btn btn-gold" onClick={handleOpenAdd}>
            <Plus size={16} /> Add New Service
          </button>
        </div>
      </div>

      {/* Filter Row: Category Pills & Service Delivery Type Dropdown (Matching Screenshot) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap'
        }}
      >
        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            alignItems: 'center',
            flex: '1 1 auto',
            minWidth: 280
          }}
        >
          {categories.map((cat) => {
            const count = cat === 'ALL'
              ? services.length
              : services.filter((s) => s.category === cat).length;
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`btn ${isSelected ? 'btn-gold' : 'btn-secondary'}`}
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 16px',
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
                onClick={() => setActiveCategory(cat)}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: isSelected ? 'rgba(0,0,0,0.3)' : 'var(--bg-elevated)',
                    color: isSelected ? '#fff' : 'var(--gold-primary)',
                    fontWeight: 700
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Add New Category Quick Button */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.76rem',
              borderRadius: 'var(--radius-full)',
              borderColor: 'var(--gold-primary)',
              color: 'var(--gold-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap'
            }}
            onClick={() => {
              const newCat = window.prompt('Enter new category name:');
              if (newCat && newCat.trim()) {
                addServiceCategory(newCat.trim());
                setActiveCategory(newCat.trim());
              }
            }}
          >
            <Plus size={13} /> Add Category
          </button>
        </div>

        {/* Right side controls: Search input & Service Type Dropdown */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Service Search Bar & Search Button */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gold-primary)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{
                  paddingLeft: 34,
                  paddingRight: catalogSearch ? 28 : 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  fontSize: '0.84rem',
                  minWidth: 200,
                  borderRadius: 'var(--radius-md)'
                }}
                placeholder="Search treatments..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
              {catalogSearch && (
                <button
                  type="button"
                  onClick={() => setCatalogSearch('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="button"
              className="btn btn-gold"
              style={{
                padding: '9px 16px',
                fontSize: '0.84rem',
                gap: 6,
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Search size={14} />
              <span>Search</span>
            </button>
          </div>

          {/* Service Type Dropdown Selector (Matching Image 2 Design) */}
          <div ref={typeDropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                minWidth: 220,
                padding: '9px 18px',
                fontSize: '0.86rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-gold)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {activeServiceType === 'ALL' ? (
                  <Sliders size={14} color="var(--gold-primary)" />
                ) : (
                  getServiceTypeIcon(activeServiceType)
                )}
                <span>{activeServiceType === 'ALL' ? 'All Service Types' : activeServiceType}</span>
              </div>
              <ChevronDown
                size={15}
                style={{
                  transform: isTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: 'var(--gold-primary)'
                }}
              />
            </button>

          {/* Dropdown Options Popup */}
          {isTypeDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: 250,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-gold)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease'
              }}
            >
              {/* All Service Types Option */}
              <div
                onClick={() => {
                  setActiveServiceType('ALL');
                  setIsTypeDropdownOpen(false);
                }}
                style={{
                  padding: '11px 16px',
                  fontSize: '0.85rem',
                  fontWeight: activeServiceType === 'ALL' ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: activeServiceType === 'ALL' ? 'var(--bg-elevated)' : 'transparent',
                  color: activeServiceType === 'ALL' ? 'var(--gold-primary)' : 'var(--text-primary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (activeServiceType !== 'ALL') e.currentTarget.style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  if (activeServiceType !== 'ALL') e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sliders size={13} color="var(--gold-primary)" />
                  <span>All Service Types</span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {services.length}
                </span>
              </div>

              {/* Dynamic Service Types Options */}
              {serviceTypes.map((type) => {
                const count = services.filter((s) => getServiceEffectiveType(s) === type).length;
                const isSelected = activeServiceType === type;

                return (
                  <div
                    key={type}
                    onClick={() => {
                      setActiveServiceType(type);
                      setIsTypeDropdownOpen(false);
                    }}
                    style={{
                      padding: '11px 16px',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isSelected ? '#555555' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getServiceTypeIcon(type)}
                      <span>{type}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: isSelected ? 'rgba(0,0,0,0.4)' : 'var(--bg-elevated)',
                        color: isSelected ? '#ffffff' : 'var(--gold-primary)',
                        fontWeight: 700
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}

              {/* Footer action to Manage Types */}
              <div
                onClick={() => {
                  setIsTypeDropdownOpen(false);
                  setIsTypeModalOpen(true);
                }}
                style={{
                  padding: '9px 16px',
                  fontSize: '0.76rem',
                  color: 'var(--gold-primary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  background: 'var(--bg-elevated)'
                }}
              >
                <Tag size={12} />
                <span>Manage Types (Add / Edit / Delete)...</span>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Services Grid (12.8 Complete Data Display) */}
      {filteredServices.length === 0 ? (
        <div
          className="luxe-card"
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            color: 'var(--text-muted)'
          }}
        >
          <Sparkles size={36} color="var(--gold-primary)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 6 }}>
            No Services Found
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>
            No treatments match the selected category &ldquo;{activeCategory}&rdquo; and service type &ldquo;{activeServiceType}&rdquo;.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setActiveCategory('ALL');
                setActiveServiceType('ALL');
              }}
            >
              <RotateCcw size={14} /> Clear Filter
            </button>
            <button className="btn btn-gold" onClick={handleOpenAdd}>
              <Plus size={14} /> Add Service
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="luxe-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: srv.popular ? '3px solid var(--gold-primary)' : '1px solid var(--border-subtle)'
              }}
            >
              <div>
                {/* Image & Header Tags */}
                {srv.image && (
                  <div style={{ position: 'relative', height: 140, borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 12 }}>
                    <img
                      src={srv.image}
                      alt={srv.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      {srv.popular && (
                        <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>
                          <Crown size={10} /> Signature VIP
                        </span>
                      )}
                      <span className={`badge ${srv.status === 'Active' ? 'badge-emerald' : 'badge-ruby'}`} style={{ fontSize: '0.62rem' }}>
                        {srv.status || 'Active'}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {getCategoryIcon(srv.category)} {srv.category} &bull; ID: {srv.id}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 2, marginBottom: 6, lineHeight: 1.3 }}>{srv.name}</h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 14, minHeight: 38, lineHeight: 1.4 }}>
                  {srv.description}
                </p>

                {/* Skills & Delivery Mode Badge */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {renderServiceBadge(srv)}

                  {srv.requiredSkills && (Array.isArray(srv.requiredSkills) ? srv.requiredSkills : [srv.requiredSkills]).map((sk, idx) => (
                    <span key={idx} className="badge badge-gray" style={{ fontSize: '0.65rem' }}>
                      Skill: {sk}
                    </span>
                  ))}
                </div>

                {/* Price, Duration, Tax, Commission Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, background: 'var(--bg-elevated)', padding: '10px 8px', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PRICE</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold-primary)' }}>
                      {settings.currency}{srv.price}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TIME</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                      {srv.durationMinutes}m
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TAX</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyan-accent)', marginTop: 2 }}>
                      {srv.tax || 18}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>COMM.</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--emerald-accent)', marginTop: 2 }}>
                      {srv.commissionPct}%
                    </div>
                  </div>
                </div>

                {/* Eligible Employees Avatars */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <span>Eligible Artisans:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {srv.eligibleStylists?.map(empId => {
                      const emp = employees.find(e => e.id === empId);
                      return emp ? (
                        <img
                          key={emp.id}
                          src={emp.avatar}
                          alt={emp.name}
                          title={emp.name}
                          style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid var(--gold-primary)', objectFit: 'cover' }}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ width: 32, height: 32 }}
                  title="Edit Service"
                  onClick={() => handleOpenEdit(srv)}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ width: 32, height: 32, color: 'var(--ruby-accent)' }}
                  title="Delete Service"
                  onClick={() => handleDelete(srv.id, srv.name)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 12.8 SERVICE DATA ADD / EDIT MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingService ? `Edit Service: ${editingService.name}` : 'Create Catalog Service (12.8 Schema)'}
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Service Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. 24K Imperial Gold Facial"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Delivery Type & Status Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Service Delivery Mode / Type *</label>
                  <select
                    className="form-select"
                    required
                    value={formData.serviceType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        serviceType: val,
                        homeServiceEligible: val.toLowerCase().includes('home')
                      });
                    }}
                  >
                    {serviceTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Catalog Status</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Price ({settings.currency}) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Mins) *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
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
                <div className="form-group">
                  <label className="form-label">Commission (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.commissionPct}
                    onChange={(e) => setFormData({ ...formData, commissionPct: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills (Comma-separated for artisan matching)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Balayage, Precision Cut, Keratin"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Detail treatment procedures, benefits and formulations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* SERVICE IMAGE UPLOAD & PRESET SELECTOR */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0, fontSize: '0.84rem', color: 'var(--gold-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Camera size={14} /> Service Cover Image / Photo
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Upload file, select preset, or paste image URL
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={serviceFileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageFileUpload}
                />

                {/* Live Banner Preview OR Upload Dropzone */}
                {formData.image ? (
                  <div
                    style={{
                      position: 'relative',
                      height: 140,
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-gold)',
                      background: '#000',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                    }}
                  >
                    <img
                      src={formData.image}
                      alt="Service Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'var(--gold-primary)',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <ImageIcon size={11} /> Live Preview
                    </div>
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          background: 'rgba(20, 23, 34, 0.85)',
                          backdropFilter: 'blur(8px)',
                          borderColor: 'var(--gold-primary)',
                          color: 'var(--gold-primary)'
                        }}
                        onClick={() => serviceFileInputRef.current?.click()}
                      >
                        <Upload size={12} /> Change Photo
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon"
                        style={{
                          width: 28,
                          height: 28,
                          background: 'rgba(20, 23, 34, 0.85)',
                          backdropFilter: 'blur(8px)',
                          color: 'var(--ruby-accent)'
                        }}
                        title="Remove Image"
                        onClick={() => setFormData({ ...formData, image: '' })}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => serviceFileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--gold-primary)'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-gold)'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = 'var(--border-gold)';
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setFormData(prev => ({ ...prev, image: ev.target.result }));
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{
                      border: '2px dashed var(--border-gold)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '24px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'rgba(212, 175, 55, 0.04)',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'rgba(212, 175, 55, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold-primary)'
                      }}
                    >
                      <Upload size={20} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--gold-primary)' }}>
                        Click to browse photo
                      </span>{' '}
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        or drag and drop here
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Supports PNG, JPG, WEBP, GIF up to 5MB
                    </span>
                  </div>
                )}

                {/* Upload Button & Direct URL Input Row */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      padding: '7px 14px',
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      borderColor: 'var(--gold-primary)',
                      color: 'var(--gold-primary)'
                    }}
                    onClick={() => serviceFileInputRef.current?.click()}
                  >
                    <Upload size={13} />
                    <span>Upload from Device</span>
                  </button>

                  <input
                    type="url"
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '6px 12px', flex: 1 }}
                    placeholder="Or paste image URL (https://...)"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                {/* Quick Presets Carousel / Row */}
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={11} color="var(--gold-primary)" />
                    <span>Or choose from curated salon photo presets:</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                    {PRESET_SERVICE_IMAGES.map((preset, idx) => {
                      const isChosen = formData.image === preset.url;
                      return (
                        <div
                          key={idx}
                          onClick={() => setFormData({ ...formData, image: preset.url })}
                          style={{
                            position: 'relative',
                            height: 48,
                            borderRadius: 'var(--radius-xs)',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: isChosen ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                            boxShadow: isChosen ? '0 0 8px var(--gold-primary)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                          title={preset.label}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background: 'rgba(0,0,0,0.65)',
                              color: isChosen ? 'var(--gold-primary)' : '#fff',
                              fontSize: '0.58rem',
                              fontWeight: isChosen ? 700 : 500,
                              textAlign: 'center',
                              padding: '1px 2px',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden'
                            }}
                          >
                            {preset.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Employee Eligibility Select */}
              <div className="form-group">
                <label className="form-label">Assigned Eligible Artisans / Stylists</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {employees.map(emp => {
                    const isSelected = formData.eligibleStylists.includes(emp.id);
                    return (
                      <button
                        type="button"
                        key={emp.id}
                        className={`btn ${isSelected ? 'btn-gold' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => toggleStylistEligibility(emp.id)}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{emp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  {editingService ? 'Save Changes' : 'Publish Service to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={18} color="var(--gold-primary)" />
                <h3 style={{ fontSize: '1.2rem' }}>Manage Service Categories</h3>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsCategoryModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Organize treatment menu categories. You can add new service categories, rename them, or delete them.
              </p>

              {/* Add New Category Input */}
              <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter new category name (e.g. Bridal Hair, Ayurvedic Spa)..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button type="submit" className="btn btn-gold" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={14} /> Add Category
                </button>
              </form>

              {/* Categories Table / List with Edit & Delete */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {serviceCategories.map((cat) => {
                  const isEditing = editingCategory.oldName === cat;
                  const catServiceCount = services.filter(s => s.category === cat).length;

                  return (
                    <div
                      key={cat}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px'
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                            value={editingCategory.newName}
                            onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn btn-gold"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => handleSaveEditCategory(cat)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => setEditingCategory({ oldName: '', newName: '' })}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {getCategoryIcon(cat)}
                            <div>
                              <strong style={{ fontSize: '0.9rem' }}>{cat}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {catServiceCount} active service{catServiceCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              style={{ width: 28, height: 28 }}
                              title="Edit Category Name"
                              onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                            >
                              <Edit2 size={12} color="var(--gold-primary)" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              style={{ width: 28, height: 28, color: 'var(--ruby-accent)' }}
                              title="Delete Category"
                              onClick={() => handleDeleteCategory(cat)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE DELIVERY TYPES MANAGEMENT MODAL */}
      {isTypeModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTypeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={18} color="var(--gold-primary)" />
                <h3 style={{ fontSize: '1.2rem' }}>Manage Service Delivery Types</h3>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsTypeModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Configure delivery modes (e.g. <strong>In-Salon Suite Only</strong>, <strong>Available for Home Service</strong>, <strong>VIP Private Suite</strong>). You can add, edit, or delete types.
              </p>

              {/* Add New Type Input */}
              <form onSubmit={handleCreateType} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter new service type (e.g. Destination Glam, Express Chair)..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                />
                <button type="submit" className="btn btn-gold" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={14} /> Add Type
                </button>
              </form>

              {/* Service Types Table / List with Edit & Delete */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {serviceTypes.map((type) => {
                  const isEditing = editingType.oldName === type;
                  const typeServiceCount = services.filter(s => getServiceEffectiveType(s) === type).length;

                  return (
                    <div
                      key={type}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '10px 14px'
                      }}
                    >
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                            value={editingType.newName}
                            onChange={(e) => setEditingType({ ...editingType, newName: e.target.value })}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="btn btn-gold"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => handleSaveEditType(type)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => setEditingType({ oldName: '', newName: '' })}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {getServiceTypeIcon(type)}
                            <div>
                              <strong style={{ fontSize: '0.9rem' }}>{type}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {typeServiceCount} active service{typeServiceCount !== 1 ? 's' : ''} assigned
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              style={{ width: 28, height: 28 }}
                              title="Edit Type Name"
                              onClick={() => setEditingType({ oldName: type, newName: type })}
                            >
                              <Edit2 size={12} color="var(--gold-primary)" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              style={{ width: 28, height: 28, color: 'var(--ruby-accent)' }}
                              title="Delete Type"
                              onClick={() => handleDeleteType(type)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SALON BRANCHES MANAGEMENT MODAL (Manage Branches)
         ======================================================== */}
      {isBranchModalOpen && (
        <div className="modal-overlay" onClick={() => { setIsBranchModalOpen(false); setEditingBranch(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(15, 17, 26, 0.4) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color="var(--gold-primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--gold-primary)' }}>Manage Salon Branches</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Add, edit & delete salon locations across booking and operations
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => { setIsBranchModalOpen(false); setEditingBranch(null); }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card 1: Add New Branch */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 'var(--radius-sm)', padding: '16px 18px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={14} /> Add New Salon Branch
                </h4>
                <form onSubmit={handleCreateBranch} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>BRANCH NAME *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Paris Haute Sanctuary"
                        value={newBranchData.name}
                        onChange={(e) => setNewBranchData({ ...newBranchData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>PHONE NUMBER</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. +1 (800) 586-4624"
                        value={newBranchData.phone}
                        onChange={(e) => setNewBranchData({ ...newBranchData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>STREET ADDRESS</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 124 Avenue Montaigne, 75008 Paris, France"
                      value={newBranchData.address}
                      onChange={(e) => setNewBranchData({ ...newBranchData, address: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button type="submit" className="btn btn-gold" style={{ fontSize: '0.82rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Plus size={14} /> Add Branch Location
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Existing Salon Locations List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Active Salon Locations ({branches?.length || 0})
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Synced across booking modal & filters
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(branches || []).map((branch) => {
                    const isEditing = editingBranch?.id === branch.id;

                    return (
                      <div
                        key={branch.id || branch.name}
                        style={{
                          background: 'var(--bg-elevated)',
                          border: isEditing ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 16px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>BRANCH NAME</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                                  value={editingBranch.name}
                                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>PHONE NUMBER</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                                  value={editingBranch.phone}
                                  onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>STREET ADDRESS</label>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                                value={editingBranch.address}
                                onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                              <button
                                type="button"
                                className="btn btn-gold"
                                style={{ padding: '4px 14px', fontSize: '0.78rem' }}
                                onClick={handleSaveEditBranch}
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                                onClick={() => setEditingBranch(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '6px',
                                  background: 'rgba(212, 175, 55, 0.1)',
                                  border: '1px solid var(--border-subtle)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  marginTop: 2
                                }}
                              >
                                <Building2 size={16} color="var(--gold-primary)" />
                              </div>

                              <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                    {branch.name}
                                  </strong>
                                  <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                                    Active Branch
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={11} color="var(--cyan-accent)" />
                                    <span>{branch.address || 'Beverly Hills Luxury District'}</span>
                                  </span>
                                  {branch.phone && (
                                    <>
                                      <span style={{ opacity: 0.4 }}>&bull;</span>
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <Phone size={11} color="var(--gold-primary)" />
                                        <span>{branch.phone}</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-icon"
                                style={{ width: 30, height: 30 }}
                                title="Edit Branch Information"
                                onClick={() => setEditingBranch({
                                  id: branch.id,
                                  name: branch.name,
                                  address: branch.address || '',
                                  phone: branch.phone || ''
                                })}
                              >
                                <Edit2 size={13} color="var(--gold-primary)" />
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary btn-icon"
                                style={{
                                  width: 30,
                                  height: 30,
                                  color: branches.length <= 1 ? 'var(--text-muted)' : 'var(--ruby-accent)',
                                  opacity: branches.length <= 1 ? 0.4 : 1,
                                  cursor: branches.length <= 1 ? 'not-allowed' : 'pointer'
                                }}
                                title={branches.length <= 1 ? "Cannot delete the only branch" : "Delete Branch"}
                                disabled={branches.length <= 1}
                                onClick={() => handleDeleteBranch(branch)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
