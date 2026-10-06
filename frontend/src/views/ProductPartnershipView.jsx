import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { PartnershipStats } from '../components/productPartnership/PartnershipStats';
import { PartnershipFilters } from '../components/productPartnership/PartnershipFilters';
import { PartnerTable } from '../components/productPartnership/PartnerTable';
import { PartnerForm } from '../components/productPartnership/PartnerForm';
import { PartnerDetails } from '../components/productPartnership/PartnerDetails';
import { PartnerProductTable } from '../components/productPartnership/PartnerProductTable';
import { AddPartnerProductModal } from '../components/productPartnership/AddPartnerProductModal';
import { CampaignTable } from '../components/productPartnership/CampaignTable';
import { CampaignForm } from '../components/productPartnership/CampaignForm';
import { CommissionTable } from '../components/productPartnership/CommissionTable';
import PartnershipPaymentTable from '../components/productPartnership/PartnershipPaymentTable';
import RecordPaymentModal from '../components/productPartnership/RecordPaymentModal';
import PartnershipRequestsTable from '../components/productPartnership/PartnershipRequestsTable';
import PartnershipReports from '../components/productPartnership/PartnershipReports';

import { 
  Handshake, 
  Building2, 
  Inbox, 
  Package, 
  Megaphone, 
  DollarSign, 
  CreditCard, 
  BarChart3, 
  Plus, 
  Link as LinkIcon 
} from 'lucide-react';

export default function ProductPartnershipView() {
  const {
    productPartners = [],
    partnershipRequests = [],
    partnerProducts = [],
    partnershipCampaigns = [],
    partnershipCommissions = [],
    partnershipPayments = [],
    partnershipOverview = {},
    products = [],
    activeView = 'product-partnership',
    createProductPartner,
    updateProductPartner,
    deleteProductPartner,
    approvePartnershipRequest,
    rejectPartnershipRequest,
    createPartnerProduct,
    deletePartnerProduct,
    createPartnershipCampaign,
    deletePartnershipCampaign,
    approvePartnershipCommission,
    payPartnershipCommission,
    createPartnershipPayment
  } = useSalon();

  // Navigation tab state - mapped to activeView if opened from sidebar subitems
  const getInitialTab = () => {
    switch (activeView) {
      case 'product-partnership-brands': return 'partners';
      case 'product-partnership-requests': return 'requests';
      case 'product-partnership-products': return 'products';
      case 'product-partnership-campaigns': return 'campaigns';
      case 'product-partnership-commission': return 'commission';
      case 'product-partnership-payments': return 'payments';
      case 'product-partnership-reports': return 'reports';
      default: return 'overview';
    }
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  React.useEffect(() => {
    setActiveTab(getInitialTab());
  }, [activeView]);

  // Search & Filter state
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: 'all',
    status: 'all'
  });

  // Modals state
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState(null);
  const [selectedPartnerDetails, setSelectedPartnerDetails] = useState(null);

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Filtered partners logic
  const filteredPartners = productPartners.filter(p => {
    const q = filters.search.toLowerCase();
    const matchesSearch = !q || 
      (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
      (p.company_name && p.company_name.toLowerCase().includes(q)) ||
      (p.partner_id && p.partner_id.toLowerCase().includes(q)) ||
      (p.contact_person && p.contact_person.toLowerCase().includes(q));

    const matchesCategory = filters.category === 'all' || p.product_category === filters.category;
    const matchesType = filters.type === 'all' || p.partnership_type === filters.type;
    const matchesStatus = filters.status === 'all' || p.status === filters.status;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Filtered partner products logic
  const filteredPartnerProducts = partnerProducts.filter(pp => {
    const q = filters.search.toLowerCase();
    const prodName = pp.product?.name || '';
    const brandName = pp.brand_name || '';
    const sku = pp.product?.sku || '';

    const matchesSearch = !q || 
      prodName.toLowerCase().includes(q) || 
      brandName.toLowerCase().includes(q) ||
      sku.toLowerCase().includes(q);

    const matchesStatus = filters.status === 'all' || pp.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  // Filtered campaigns logic
  const filteredCampaigns = partnershipCampaigns.filter(c => {
    const q = filters.search.toLowerCase();
    const matchesSearch = !q || 
      (c.campaign_name && c.campaign_name.toLowerCase().includes(q)) ||
      (c.partner_name && c.partner_name.toLowerCase().includes(q)) ||
      (c.campaign_id && c.campaign_id.toLowerCase().includes(q));

    const matchesStatus = filters.status === 'all' || c.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  // Handlers for Partner CRUD
  const handleSavePartner = async (partnerData) => {
    if (partnerToEdit) {
      await updateProductPartner(partnerToEdit.id, partnerData);
    } else {
      await createProductPartner(partnerData);
    }
    setIsPartnerFormOpen(false);
    setPartnerToEdit(null);
  };

  const handleEditPartner = (partner) => {
    setPartnerToEdit(partner);
    setIsPartnerFormOpen(true);
  };

  const handleTogglePartnerStatus = async (partner) => {
    const nextStatus = partner.status === 'Active' ? 'Suspended' : 'Active';
    await updateProductPartner(partner.id, { ...partner, status: nextStatus });
  };

  const handleSaveProduct = async (itemData) => {
    await createPartnerProduct(itemData);
  };

  const handleSaveCampaign = async (campaignData) => {
    await createPartnershipCampaign(campaignData);
    setIsCampaignModalOpen(false);
  };

  const handleRecordPayment = async (paymentData) => {
    await createPartnershipPayment(paymentData);
    setIsPaymentModalOpen(false);
  };

  // Tab definitions
  const TABS = [
    { id: 'overview', label: 'Dashboard Overview', icon: Handshake },
    { id: 'partners', label: 'Brand Collaboration', count: productPartners.length, icon: Building2 },
    { id: 'requests', label: 'Partnership Requests', count: partnershipRequests.filter(r => r.status === 'Pending').length, icon: Inbox },
    { id: 'products', label: 'Partner Products', count: partnerProducts.length, icon: Package },
    { id: 'campaigns', label: 'Campaigns', count: partnershipCampaigns.filter(c => c.status === 'Active').length, icon: Megaphone },
    { id: 'commission', label: 'Commission', icon: DollarSign },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Partnership Reports', icon: BarChart3 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Top Banner / Hero Title */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              backgroundColor: 'rgba(212, 175, 55, 0.15)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--gold-primary)'
            }}>
              <Handshake size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                Product Partnership & Brand Collaboration
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Enterprise Brand Relationship Management, Co-marketing Campaigns, and Sales Commission Tracking
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => {
              setPartnerToEdit(null);
              setIsPartnerFormOpen(true);
            }}
          >
            <Plus size={16} /> Add Partner Brand
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsAddProductModalOpen(true)}
          >
            <LinkIcon size={16} /> Link Product
          </button>
        </div>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.4rem', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '0.2rem',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.15rem',
                borderRadius: '10px 18px 18px 10px',
                border: isActive ? '1.5px solid rgba(56, 189, 248, 0.55)' : '1px solid transparent',
                borderLeft: isActive ? '3px solid #38bdf8' : '1px solid transparent',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(14, 52, 92, 0.85) 0%, rgba(10, 36, 68, 0.6) 100%)' 
                  : 'transparent',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.25), inset 0 0 10px rgba(56, 189, 248, 0.10)' : 'none'
              }}
            >
              <Icon size={16} style={{ color: isActive ? '#38bdf8' : 'currentColor', filter: isActive ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.6))' : 'none' }} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  color: isActive ? '#38bdf8' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : 'none'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DASHBOARD OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 3: 8 Dashboard KPI Cards */}
          <PartnershipStats stats={partnershipOverview} />

          {/* Quick Shortcuts & Workflows Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Top Performing Brand Partners */}
            <div className="luxe-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Active Brand Collaborations
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('partners')}
                  style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  View All &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {productPartners.slice(0, 4).map(p => (
                  <div key={p.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{p.brand_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.product_category} • {p.partnership_type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.92rem' }}>
                        ₹{Number(p.total_sales || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#10b981' }}>
                        Earned: ₹{Number(p.commission_earned || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Marketing Campaigns */}
            <div className="luxe-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                  Active Campaigns & Promotions
                </h4>
                <button
                  type="button"
                  onClick={() => setActiveTab('campaigns')}
                  style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  View All &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {partnershipCampaigns.slice(0, 4).map(c => (
                  <div key={c.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{c.campaign_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold-muted)' }}>{c.partner_name} • {c.campaign_type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        ₹{Number(c.actual_sales || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Target: ₹{Number(c.target_sales || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BRAND COLLABORATION TAB */}
      {activeTab === 'partners' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <PartnershipFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ search: '', category: 'all', type: 'all', status: 'all' })}
          />
          <PartnerTable
            partners={filteredPartners}
            onAddPartner={() => {
              setPartnerToEdit(null);
              setIsPartnerFormOpen(true);
            }}
            onEditPartner={handleEditPartner}
            onViewDetails={(partner) => setSelectedPartnerDetails(partner)}
            onToggleStatus={handleTogglePartnerStatus}
          />
        </div>
      )}

      {/* PARTNERSHIP REQUESTS TAB */}
      {activeTab === 'requests' && (
        <PartnershipRequestsTable
          requests={partnershipRequests}
          onApprove={approvePartnershipRequest}
          onReject={rejectPartnershipRequest}
        />
      )}

      {/* PARTNER PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <PartnershipFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ search: '', category: 'all', type: 'all', status: 'all' })}
          />
          <PartnerProductTable
            partnerProducts={filteredPartnerProducts}
            onLinkProduct={() => setIsAddProductModalOpen(true)}
            onRemovePartnerProduct={deletePartnerProduct}
          />
        </div>
      )}

      {/* CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <PartnershipFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters({ search: '', category: 'all', type: 'all', status: 'all' })}
          />
          <CampaignTable
            campaigns={filteredCampaigns}
            onCreateCampaign={() => setIsCampaignModalOpen(true)}
          />
        </div>
      )}

      {/* COMMISSION MANAGEMENT TAB */}
      {activeTab === 'commission' && (
        <CommissionTable
          commissions={partnershipCommissions}
          onApproveCommission={approvePartnershipCommission}
          onPayCommission={payPartnershipCommission}
        />
      )}

      {/* PARTNERSHIP PAYMENTS TAB */}
      {activeTab === 'payments' && (
        <PartnershipPaymentTable
          payments={partnershipPayments}
          onRecordPayment={() => setIsPaymentModalOpen(true)}
        />
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <PartnershipReports
          partners={productPartners}
          partnerProducts={partnerProducts}
          campaigns={partnershipCampaigns}
          commissions={partnershipCommissions}
          payments={partnershipPayments}
        />
      )}

      {/* ================= MODALS ================= */}

      {/* Partner Add/Edit Modal */}
      <PartnerForm
        isOpen={isPartnerFormOpen}
        onClose={() => {
          setIsPartnerFormOpen(false);
          setPartnerToEdit(null);
        }}
        onSave={handleSavePartner}
        initialData={partnerToEdit}
      />

      {/* Partner Details Deep-dive 7-tab Modal */}
      <PartnerDetails
        partner={selectedPartnerDetails}
        onClose={() => setSelectedPartnerDetails(null)}
        partnerProducts={partnerProducts.filter(pp => pp.partner_id === selectedPartnerDetails?.id)}
        campaigns={partnershipCampaigns.filter(c => c.partner_id === selectedPartnerDetails?.id)}
        commissions={partnershipCommissions.filter(c => c.partner_id === selectedPartnerDetails?.id)}
        payments={partnershipPayments.filter(p => p.partner_id === selectedPartnerDetails?.id)}
      />

      {/* Add Partner Product Link Modal */}
      <AddPartnerProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleSaveProduct}
        partners={productPartners}
        existingProducts={products}
      />

      {/* Create Campaign Modal */}
      <CampaignForm
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onSave={handleSaveCampaign}
        partners={productPartners}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleRecordPayment}
        partners={productPartners}
        pendingCommissions={partnershipCommissions.filter(c => c.status === 'Approved' && c.payment_status !== 'Paid')}
      />
    </div>
  );
}
