import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export const PartnershipFilters = ({
  filters,
  onFilterChange,
  search = '',
  onSearchChange,
  status = 'ALL',
  onStatusChange,
  category = 'ALL',
  onCategoryChange,
  type = 'ALL',
  onTypeChange,
  categories = [
    'Hair Care & Color',
    'Skin Care & Spa',
    'Nail Care & Extensions',
    'Aromatherapy & Wellness',
    'Hair Styling Technology',
    'Organic & Ayurvedic',
    'Makeup & Cosmetics'
  ],
  statuses = ['Active', 'Pending', 'Suspended', 'Expired'],
  types = [
    'Product Supply',
    'Product Promotion',
    'Brand Promotion',
    'Retail Partnership',
    'Exclusive Partnership',
    'Co-Marketing',
    'Affiliate / Commission',
    'Event Collaboration'
  ],
  onReset,
  searchPlaceholder = 'Search partners, brands, contact...'
}) => {
  // Support both filters object {search, status, category, type} and individual props
  const effectiveSearch = filters ? filters.search : search;
  const effectiveStatus = filters ? filters.status : status;
  const effectiveCategory = filters ? filters.category : category;
  const effectiveType = filters ? filters.type : type;

  const handleSearch = (val) => {
    if (onFilterChange) onFilterChange(prev => ({ ...prev, search: val }));
    if (onSearchChange) onSearchChange(val);
  };

  const handleStatus = (val) => {
    if (onFilterChange) onFilterChange(prev => ({ ...prev, status: val }));
    if (onStatusChange) onStatusChange(val);
  };

  const handleCategory = (val) => {
    if (onFilterChange) onFilterChange(prev => ({ ...prev, category: val }));
    if (onCategoryChange) onCategoryChange(val);
  };

  const handleType = (val) => {
    if (onFilterChange) onFilterChange(prev => ({ ...prev, type: val }));
    if (onTypeChange) onTypeChange(val);
  };

  return (
    <div
      className="luxe-card"
      style={{
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Search Input */}
      <div
        style={{
          flex: '1 1 240px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 14px'
        }}
      >
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          value={effectiveSearch || ''}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={searchPlaceholder}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            width: '100%'
          }}
        />
        {effectiveSearch && (
          <button
            onClick={() => handleSearch('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div style={{ minWidth: 150 }}>
          <select
            value={effectiveCategory || 'all'}
            onChange={(e) => handleCategory(e.target.value)}
            className="form-control"
            style={{
              padding: '8px 12px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Partnership Type Filter */}
      {types.length > 0 && (
        <div style={{ minWidth: 160 }}>
          <select
            value={effectiveType || 'all'}
            onChange={(e) => handleType(e.target.value)}
            className="form-control"
            style={{
              padding: '8px 12px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Partnership Types</option>
            {types.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>
      )}

      {/* Status Filter */}
      {statuses.length > 0 && (
        <div style={{ minWidth: 130 }}>
          <select
            value={effectiveStatus || 'all'}
            onChange={(e) => handleStatus(e.target.value)}
            className="form-control"
            style={{
              padding: '8px 12px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Statuses</option>
            {statuses.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Reset Filter Button */}
      {onReset && (
        <button
          className="btn btn-secondary"
          onClick={onReset}
          title="Reset Filters"
          style={{
            padding: '8px 14px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>
      )}
    </div>
  );
};
