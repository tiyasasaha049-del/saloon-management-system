import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Users,
  Search,
  Plus,
  Star,
  Award,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Heart,
  Calendar,
  DollarSign,
  User,
  Clock,
  CreditCard,
  ShoppingBag,
  MessageSquare,
  AlertTriangle,
  Gift,
  Crown,
  FileText,
  Activity,
  CheckCircle2,
  LayoutGrid,
  List
} from 'lucide-react';

export const CustomersView = () => {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    appointments,
    invoices,
    reviews,
    complaints,
    settings,
    globalSearch
  } = useSalon();

  const [selectedTier, setSelectedTier] = useState('ALL');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [activeProfileModal, setActiveProfileModal] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState('profile'); // 'profile' | 'appointments' | 'services' | 'products' | 'invoices' | 'reviews' | 'complaints' | 'loyalty' | 'membership'

  // New Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Female',
    dob: '1995-01-01',
    phone: '',
    email: '',
    address: 'Beverly Hills, CA',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    registrationDate: new Date().toISOString().split('T')[0],
    membership: 'Standard Guest',
    tier: 'Bronze',
    status: 'Active',
    hairType: 'Normal / Healthy',
    skinType: 'Combination',
    allergies: 'None',
    preferences: 'Complimentary tea',
    notes: ''
  });

  const filteredCustomers = customers.filter((c) => {
    const matchesTier = selectedTier === 'ALL' || c.tier === selectedTier;
    const matchesSearch =
      !globalSearch ||
      c.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.phone?.includes(globalSearch) ||
      (c.email && c.email.toLowerCase().includes(globalSearch.toLowerCase())) ||
      (c.id && c.id.toLowerCase().includes(globalSearch.toLowerCase()));
    return matchesTier && matchesSearch;
  });

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Platinum VIP':
        return <span className="badge badge-gold"><Star size={10} /> Platinum VIP</span>;
      case 'Gold':
        return <span className="badge badge-amber"><Award size={10} /> Gold</span>;
      case 'Silver':
        return <span className="badge badge-cyan"><Award size={10} /> Silver</span>;
      case 'Bronze':
        return <span className="badge badge-gray">Bronze</span>;
      default:
        return <span className="badge badge-gray">{tier}</span>;
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addCustomer(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      gender: 'Female',
      dob: '1995-01-01',
      phone: '',
      email: '',
      address: 'Beverly Hills, CA',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      registrationDate: new Date().toISOString().split('T')[0],
      membership: 'Standard Guest',
      tier: 'Bronze',
      status: 'Active',
      hairType: 'Normal / Healthy',
      skinType: 'Combination',
      allergies: 'None',
      preferences: 'Complimentary tea',
      notes: ''
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove client ${name}?`)) {
      deleteCustomer(id);
      if (activeProfileModal?.id === id) setActiveProfileModal(null);
    }
  };

  // History filtering for active profile
  const custAppointments = activeProfileModal
    ? appointments.filter(a => a.customerId === activeProfileModal.id || a.customerName === activeProfileModal.name)
    : [];

  const custInvoices = activeProfileModal
    ? invoices.filter(inv => inv.customerId === activeProfileModal.id || inv.customerName === activeProfileModal.name)
    : [];

  const custReviews = activeProfileModal
    ? reviews.filter(r => r.customerName === activeProfileModal.name)
    : [];

  const custComplaints = activeProfileModal
    ? complaints.filter(cmp => cmp.customerName === activeProfileModal.name)
    : [];

  // Extract products purchased across invoices
  const custProducts = custInvoices.flatMap(inv => (inv.items || []).filter(item => item.type === 'product' || item.type === 'Product'));

  // Extract all services received across invoices/appointments
  const custServices = custInvoices.flatMap(inv => (inv.items || []).filter(item => item.type === 'service' || item.type === 'Service'));

  const totalCustomers = customers.length;
  const vipMembersCount = customers.filter(c => c.tier === 'Platinum VIP' || c.tier === 'Gold').length;
  const totalRevenueGenerated = customers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0);
  const totalVisitsLogged = customers.reduce((sum, c) => sum + (Number(c.visitsCount) || 0), 0);

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Client & VIP <span className="gold-text-gradient">Management</span>
          </h2>
          <p>Customer dossiers, bio-profiles, visit histories, billing ledger, reviews & loyalty tracking</p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View Switcher: List View / Cards Grid */}
          <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 4, border: '1px solid var(--border-subtle)' }}>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setViewMode('list')}
            >
              <List size={14} /> List View
            </button>
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-gold' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={14} /> Cards Grid
            </button>
          </div>

          <button className="btn btn-gold" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Register New Client
          </button>
        </div>
      </div>

      {/* Client Overview KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Client Base</span>
            <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-primary)' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="stat-value">{totalCustomers} Clients</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--emerald-accent)', marginTop: 4 }}>
            {customers.filter(c => c.status === 'Active').length} Active registered guests
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">VIP & Elite Members</span>
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber-accent)' }}>
              <Crown size={18} />
            </div>
          </div>
          <div className="stat-value">{vipMembersCount} VIPs</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--amber-accent)', marginTop: 4 }}>
            Platinum & Gold Tier patrons
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Client Spend</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-accent)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="stat-value">{settings.currency}{totalRevenueGenerated.toLocaleString()}</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Lifetime salon transaction value
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Total Visits Logged</span>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-accent)' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div className="stat-value">{totalVisitsLogged} Visits</div>
          <div style={{ fontSize: '0.74rem', color: 'var(--cyan-accent)', marginTop: 4 }}>
            Across all branch locations
          </div>
        </div>
      </div>

      {/* Filter Tabs & Badge Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['ALL', 'Platinum VIP', 'Gold', 'Silver', 'Bronze'].map((tier) => (
            <button
              key={tier}
              className={`btn ${selectedTier === tier ? 'btn-gold' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              onClick={() => setSelectedTier(tier)}
            >
              {tier === 'ALL' ? 'All Clients' : tier}
            </button>
          ))}
        </div>

        <span className="badge badge-gold" style={{ fontSize: '0.75rem', padding: '5px 12px', fontWeight: 600 }}>
          Total: {filteredCustomers.length} of {totalCustomers} Clients
        </span>
      </div>

      {/* Clients View: List Type or Cards Grid */}
      {viewMode === 'list' ? (
        <div className="luxe-table-container" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="luxe-table" style={{ minWidth: 1080, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ minWidth: 200, whiteSpace: 'nowrap' }}>Client Profile</th>
                <th style={{ minWidth: 140, whiteSpace: 'nowrap' }}>Tier & Membership</th>
                <th style={{ minWidth: 180, whiteSpace: 'nowrap' }}>Phone & Email</th>
                <th style={{ minWidth: 160, whiteSpace: 'nowrap' }}>Residential Address</th>
                <th style={{ minWidth: 130, whiteSpace: 'nowrap' }}>Total Spent</th>
                <th style={{ minWidth: 90, whiteSpace: 'nowrap', textAlign: 'center' }}>Visits</th>
                <th style={{ minWidth: 100, whiteSpace: 'nowrap', textAlign: 'center' }}>Loyalty</th>
                <th style={{ minWidth: 95, whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                <th style={{ minWidth: 150, whiteSpace: 'nowrap', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No clients match the selected tier or search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    {/* 1. Client Profile: Photo, Name, ID, Gender */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 'var(--radius-sm)',
                            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.25) 100%)',
                            border: '1.5px solid var(--border-gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--gold-primary)',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}
                        >
                          {(c.name || 'VIP').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ID: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{c.id}</span>
                            {c.gender && ` • ${c.gender}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Tier & Membership */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div>{getTierBadge(c.tier)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', marginTop: 3, fontWeight: 500 }}>
                        {c.membership || 'Standard Guest'}
                      </div>
                    </td>

                    {/* 3. Phone & Email (Together) */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <a
                          href={`tel:${c.phone}`}
                          style={{
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            textDecoration: 'none'
                          }}
                        >
                          <Phone size={12} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
                          <span>{c.phone}</span>
                        </a>
                        <a
                          href={`mailto:${c.email}`}
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            textDecoration: 'none'
                          }}
                        >
                          <Mail size={12} color="var(--cyan-accent)" style={{ flexShrink: 0 }} />
                          <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.email || 'no-email@registered.com'}
                          </span>
                        </a>
                      </div>
                    </td>

                    {/* 4. Address */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={12} color="var(--gold-primary)" style={{ flexShrink: 0 }} />
                        <span>{c.address || 'Beverly Hills, CA'}</span>
                      </div>
                    </td>

                    {/* 5. Total Spent */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--gold-primary)' }}>
                        {settings.currency}{c.totalSpent || 0}
                      </div>
                    </td>

                    {/* 6. Visits */}
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span className="badge badge-gray" style={{ fontSize: '0.74rem', fontWeight: 600 }}>
                        {c.visitsCount || 0} visits
                      </span>
                    </td>

                    {/* 7. Loyalty Points */}
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span className="badge badge-gold" style={{ fontSize: '0.74rem', fontWeight: 700 }}>
                        {c.loyaltyPoints || 0} pts
                      </span>
                    </td>

                    {/* 8. Status */}
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span className={`badge ${c.status === 'Active' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.68rem' }}>
                        {c.status || 'Active'}
                      </span>
                    </td>

                    {/* 9. Actions */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          className="btn btn-gold"
                          style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => {
                            setActiveProfileModal(c);
                            setHistoryTab('profile');
                          }}
                        >
                          Profile
                        </button>
                        <a
                          href={`tel:${c.phone}`}
                          className="btn btn-secondary btn-icon"
                          style={{ width: 28, height: 28 }}
                          title="Call Client"
                        >
                          <Phone size={12} />
                        </a>
                        <button
                          className="btn btn-secondary btn-icon"
                          style={{ width: 28, height: 28, color: 'var(--ruby-accent)' }}
                          title="Delete Client"
                          onClick={() => handleDelete(c.id, c.name)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Total Footer Summary */}
            <tfoot>
              <tr style={{ background: 'var(--bg-elevated)', borderTop: '2px solid var(--border-subtle)', fontWeight: 600 }}>
                <td style={{ whiteSpace: 'nowrap', color: 'var(--gold-primary)', fontWeight: 700 }}>
                  TOTAL: {filteredCustomers.length} Clients
                </td>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {filteredCustomers.filter(c => c.tier === 'Platinum VIP' || c.tier === 'Gold').length} VIP Members
                </td>
                <td colSpan={2} style={{ whiteSpace: 'nowrap', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Client Dossier Ledger
                </td>
                <td style={{ whiteSpace: 'nowrap', fontWeight: 800, color: 'var(--gold-primary)', fontSize: '0.92rem' }}>
                  {settings.currency}{filteredCustomers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0).toLocaleString()}
                </td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  {filteredCustomers.reduce((sum, c) => sum + (Number(c.visitsCount) || 0), 0)}
                </td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--cyan-accent)' }}>
                  {filteredCustomers.reduce((sum, c) => sum + (Number(c.loyaltyPoints) || 0), 0)} pts
                </td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                    {filteredCustomers.filter(c => c.status === 'Active').length} Active
                  </span>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {filteredCustomers.length} Records
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* Clients Cards Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filteredCustomers.map((c) => (
            <div key={c.id} className="luxe-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.25) 100%)',
                        border: '1.5px solid var(--border-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold-primary)',
                        fontWeight: 800,
                        fontSize: '1rem',
                        flexShrink: 0
                      }}
                    >
                      {(c.name || 'VIP').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: 2 }}>{c.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {c.id} &bull; {c.gender || 'Female'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', fontWeight: 600 }}>{c.phone}</div>
                    </div>
                  </div>
                  <div>{getTierBadge(c.tier)}</div>
                </div>

                {/* Bio Profile Preview */}
                <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Address: </span>
                    <strong>{c.address}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Membership: </span>
                    <strong style={{ color: 'var(--gold-primary)' }}>{c.membership || 'Standard Guest'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                    <span className={`badge ${c.status === 'Active' ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                      {c.status || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderTop: '1px solid var(--border-subtle)', paddingTop: 10, color: 'var(--text-secondary)' }}>
                  <div>
                    Total Spent: <strong style={{ color: 'var(--gold-primary)' }}>{settings.currency}{c.totalSpent || 0}</strong>
                  </div>
                  <div>
                    Visits: <strong>{c.visitsCount || 0}</strong>
                  </div>
                  <div>
                    Loyalty: <strong style={{ color: 'var(--cyan-accent)' }}>{c.loyaltyPoints || 0} pts</strong>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  className="btn btn-gold"
                  style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                  onClick={() => {
                    setActiveProfileModal(c);
                    setHistoryTab('profile');
                  }}
                >
                  Profile & Full History
                </button>

                <div style={{ display: 'flex', gap: 6 }}>
                  <a
                    href={`tel:${c.phone}`}
                    className="btn btn-secondary btn-icon"
                    style={{ width: 32, height: 32 }}
                    title="Call Client"
                  >
                    <Phone size={13} />
                  </a>
                  <button
                    className="btn btn-secondary btn-icon"
                    style={{ width: 32, height: 32, color: 'var(--ruby-accent)' }}
                    title="Delete Client"
                    onClick={() => handleDelete(c.id, c.name)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 13.1 & 13.2: COMPLETE CUSTOMER PROFILE & HISTORY DOSSIER MODAL */}
      {activeProfileModal && (
        <div className="modal-overlay" onClick={() => setActiveProfileModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 840, maxHeight: '92vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 'var(--radius-sm)',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.25) 100%)',
                    border: '2px solid var(--border-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold-primary)',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}
                >
                  {(activeProfileModal.name || 'VIP').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.35rem' }}>{activeProfileModal.name}</h3>
                    {getTierBadge(activeProfileModal.tier)}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 3, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span>ID: <strong style={{ color: 'var(--gold-primary)' }}>{activeProfileModal.id}</strong></span>
                    &bull; <span>Status: <strong style={{ color: '#10b981' }}>{activeProfileModal.status || 'Active'}</strong></span>
                    &bull; <span>Registered: {activeProfileModal.registrationDate || '2024-03-15'}</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setActiveProfileModal(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs (13.1 Profile vs 13.2 Histories) */}
            <div style={{ display: 'flex', gap: 6, padding: '12px 24px 0', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
              {[
                { id: 'profile', label: '13.1 Customer Profile', icon: <User size={13} /> },
                { id: 'appointments', label: `Appointments (${custAppointments.length})`, icon: <Calendar size={13} /> },
                { id: 'services', label: `Services (${custServices.length})`, icon: <Sparkles size={13} /> },
                { id: 'products', label: `Products (${custProducts.length})`, icon: <ShoppingBag size={13} /> },
                { id: 'invoices', label: `Invoices & Payments (${custInvoices.length})`, icon: <CreditCard size={13} /> },
                { id: 'loyalty', label: 'Loyalty Points', icon: <Gift size={13} /> },
                { id: 'membership', label: 'Membership Plan', icon: <Crown size={13} /> },
                { id: 'reviews', label: `Reviews (${custReviews.length})`, icon: <MessageSquare size={13} /> },
                { id: 'complaints', label: `Complaints (${custComplaints.length})`, icon: <AlertTriangle size={13} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`btn ${historyTab === tab.id ? 'btn-gold' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.74rem', whiteSpace: 'nowrap', borderRadius: '6px 6px 0 0' }}
                  onClick={() => setHistoryTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* TAB BODY */}
            <div style={{ padding: '24px' }}>
              {/* TAB 1: 13.1 CUSTOMER PROFILE */}
              {historyTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Spending & Visit Summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, background: 'var(--bg-elevated)', padding: 16, borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>TOTAL SPENDING</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: 2 }}>
                        {settings.currency}{activeProfileModal.totalSpent || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>TOTAL VISITS</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 2 }}>{activeProfileModal.visitsCount || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>LOYALTY BALANCE</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cyan-accent)', marginTop: 2 }}>
                        {activeProfileModal.loyaltyPoints || 0} pts
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>LAST VISIT</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 4 }}>{activeProfileModal.lastVisit || 'None'}</div>
                    </div>
                  </div>

                  {/* Personal Demographics & Contact */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Demographics & Contact Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                      <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Customer ID & Status</div>
                        <strong>{activeProfileModal.id} &bull; {activeProfileModal.status || 'Active'}</strong>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Gender & Date of Birth</div>
                        <strong>{activeProfileModal.gender || 'Female'} &bull; {activeProfileModal.dob || '1992-06-14'}</strong>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Phone & Email</div>
                        <strong>{activeProfileModal.phone} &bull; {activeProfileModal.email}</strong>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Residential Address</div>
                        <strong>{activeProfileModal.address}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Biometrics & Formulations */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-gold)', textTransform: 'uppercase', marginBottom: 10 }}>
                      Biometrics & Styling Formulations
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.85rem' }}>
                      <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Hair Condition & Texture:</div>
                        <strong>{activeProfileModal.hairType}</strong>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Skin Biometric Profile:</div>
                        <strong>{activeProfileModal.skinType}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Sensitivities & Notes */}
                  <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 6, fontSize: '0.84rem' }}>
                    <div style={{ marginBottom: 6 }}><strong>Hospitality Preferences:</strong> {activeProfileModal.preferences}</div>
                    <div style={{ marginBottom: 6 }}><strong>Allergies / Chemical Sensitivities:</strong> <span style={{ color: 'var(--ruby-accent)', fontWeight: 600 }}>{activeProfileModal.allergies}</span></div>
                    <div><strong>Stylist Notes:</strong> {activeProfileModal.notes}</div>
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENTS HISTORY */}
              {historyTab === 'appointments' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Booking & Appointment Ledger</h4>
                  {custAppointments.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No appointment records found for this client.</div>
                  ) : (
                    <table className="luxe-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Date & Time</th>
                          <th>Services</th>
                          <th>Stylist</th>
                          <th>Status</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {custAppointments.map(a => (
                          <tr key={a.id}>
                            <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>{a.code}</td>
                            <td>{a.date} at {a.time}</td>
                            <td>{a.serviceNames?.join(', ')}</td>
                            <td>{a.stylistName}</td>
                            <td><span className="badge badge-gold">{a.status}</span></td>
                            <td style={{ fontWeight: 700 }}>{settings.currency}{Number(a.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* TAB 3: SERVICES HISTORY */}
              {historyTab === 'services' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Treatment & Service History</h4>
                  {custServices.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No service transaction items recorded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {custServices.map((srv, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{srv.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stylist: {srv.stylist || 'Julian Vance'}</div>
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--gold-primary)' }}>
                            {settings.currency}{Number(srv.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PRODUCTS PURCHASED */}
              {historyTab === 'products' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Retail & Take-Home Products Purchased</h4>
                  {custProducts.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No retail product purchases logged yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {custProducts.map((p, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qty: {p.qty || 1} item(s)</div>
                          </div>
                          <div style={{ fontWeight: 800, color: 'var(--gold-primary)' }}>
                            {settings.currency}{Number(p.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: PAYMENTS & INVOICES */}
              {historyTab === 'invoices' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Invoices & Payment Receipts</h4>
                  {custInvoices.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No invoices generated yet for this client.</div>
                  ) : (
                    <table className="luxe-table">
                      <thead>
                        <tr>
                          <th>Invoice #</th>
                          <th>Date</th>
                          <th>Payment Method</th>
                          <th>Subtotal</th>
                          <th>Total Paid</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {custInvoices.map(inv => (
                          <tr key={inv.id}>
                            <td style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>{inv.invoiceNo}</td>
                            <td>{inv.date} {inv.time}</td>
                            <td>{inv.paymentMethod || 'Credit Card'}</td>
                            <td>{settings.currency}{Number(inv.subtotal).toFixed(2)}</td>
                            <td style={{ fontWeight: 800, color: 'var(--gold-primary)' }}>{settings.currency}{Number(inv.total).toFixed(2)}</td>
                            <td><span className="badge badge-emerald">{inv.status || 'Paid'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* TAB 6: LOYALTY TRANSACTIONS */}
              {historyTab === 'loyalty' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h4 style={{ fontSize: '0.9rem' }}>Loyalty Points & Rewards Statement</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--cyan-accent)', fontWeight: 700 }}>
                      Current Balance: {activeProfileModal.loyaltyPoints || 0} Points
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Service Purchase Points Earned</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Earned on last treatment visit</div>
                      </div>
                      <div style={{ color: 'var(--emerald-accent)', fontWeight: 800 }}>+{Math.floor((activeProfileModal.totalSpent || 0) * 0.1)} pts</div>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>VIP Welcome Enrollment Bonus</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Registration gift</div>
                      </div>
                      <div style={{ color: 'var(--emerald-accent)', fontWeight: 800 }}>+50 pts</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: MEMBERSHIP HISTORY */}
              {historyTab === 'membership' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Membership Plan & Tier Status</h4>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', padding: 16, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--gold-primary)' }}>
                        {activeProfileModal.membership || 'Standard Guest'}
                      </span>
                      {getTierBadge(activeProfileModal.tier)}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      Enrolled on {activeProfileModal.registrationDate || '2024-03-15'}. Entitled to complimentary salon beverages, birthday voucher, and {activeProfileModal.tier === 'Platinum VIP' ? '15%' : activeProfileModal.tier === 'Gold' ? '10%' : '5%'} service discount.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                      Status: Active &bull; Auto-renewal verified
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: REVIEWS */}
              {historyTab === 'reviews' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Feedback & Reviews Left ({custReviews.length})</h4>
                  {custReviews.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No written reviews logged yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {custReviews.map(r => (
                        <div key={r.id} style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.serviceName} with {r.stylistName}</span>
                            <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>{'★'.repeat(r.rating)}</span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>&ldquo;{r.comment}&rdquo;</p>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Date: {r.date}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 9: COMPLAINTS */}
              {historyTab === 'complaints' && (
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: 12 }}>Service Complaints & Incident Resolutions ({custComplaints.length})</h4>
                  {custComplaints.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#10b981' }}>
                      <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                      Clean record! No complaints logged for this client.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {custComplaints.map(cmp => (
                        <div key={cmp.id} style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 6, borderLeft: '3px solid var(--ruby-accent)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{cmp.category}</span>
                            <span className="badge badge-emerald">{cmp.status}</span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{cmp.description}</p>
                          <div style={{ fontSize: '0.78rem', color: 'var(--gold-primary)', background: 'rgba(212, 175, 55, 0.08)', padding: 8, borderRadius: 4 }}>
                            <strong>Resolution:</strong> {cmp.resolutionNotes}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal with 13.1 Profile fields */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 className="serif-heading" style={{ fontSize: '1.3rem' }}>Register New Client Profile</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Full demographic, membership & biometrics profile setup</p>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Vivienne Westwood"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    placeholder="e.g. +1 (555) 000-1122"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="client@luxury.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 450 Rodeo Drive, Beverly Hills"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Membership Program</label>
                  <select
                    className="form-select"
                    value={formData.membership}
                    onChange={(e) => setFormData({ ...formData, membership: e.target.value })}
                  >
                    <option value="Standard Guest">Standard Guest</option>
                    <option value="Luxe Gold Elite Pass">Luxe Gold Elite Pass</option>
                    <option value="Haute Obsidian Privilege Club">Haute Obsidian Privilege Club</option>
                    <option value="Gentlemen Royal Grooming Pass">Gentlemen Royal Grooming Pass</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Loyalty Tier</label>
                  <select
                    className="form-select"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  >
                    <option value="Bronze">Bronze (Standard)</option>
                    <option value="Silver">Silver (5% Privilege)</option>
                    <option value="Gold">Gold (10% Privilege)</option>
                    <option value="Platinum VIP">Platinum VIP (15% Privilege)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Hair Type / Color</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Fine, Blonde Highlights"
                    value={formData.hairType}
                    onChange={(e) => setFormData({ ...formData, hairType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Skin Biometrics</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sensitive / Combination"
                    value={formData.skinType}
                    onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Allergies / Chemical Sensitivity</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ammonia sensitivity, latex, organic only"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hospitality Preferences & Formula Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Enjoys silent service, iced matcha latte, ammonia-free toner"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  Enroll Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
