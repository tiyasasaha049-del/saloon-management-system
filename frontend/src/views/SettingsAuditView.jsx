import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Sliders,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  Lock,
  Search,
  Sun,
  Moon
} from 'lucide-react';

export const SettingsAuditView = () => {
  const {
    settings,
    setSettings,
    auditLogs,
    logAudit,
    resetDemoData,
    roles,
    currentUser
  } = useSalon();

  const [activeTab, setActiveTab] = useState('SETTINGS'); // 'SETTINGS' | 'AUDIT' | 'PERMISSIONS'
  const [auditSearch, setAuditSearch] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Settings form state
  const [formSettings, setFormSettings] = useState(settings);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettings(formSettings);
    logAudit('SETTINGS_UPDATE', 'System Settings', 'Updated salon business parameters & tax structure');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredLogs = auditLogs.filter(log => {
    return (
      !auditSearch ||
      log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.module.toLowerCase().includes(auditSearch.toLowerCase())
    );
  });

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Salon Configuration & <span className="gold-text-gradient">Audit Trail</span>
          </h2>
          <p>Enterprise tax formulas, appointment policies, role permissions & tamper-evident audit logs</p>
        </div>

        <button className="btn btn-secondary" onClick={() => {
          if (window.confirm('Restore all showroom dummy records to factory default?')) {
            resetDemoData();
            alert('Restored showroom database!');
          }
        }}>
          <RotateCcw size={15} /> Restore Showroom Data
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button
          className={`btn ${activeTab === 'SETTINGS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('SETTINGS')}
        >
          <Sliders size={14} /> Salon Business Settings
        </button>
        <button
          className={`btn ${activeTab === 'AUDIT' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('AUDIT')}
        >
          <FileText size={14} /> Tamper-Evident Audit Trail ({auditLogs.length})
        </button>
        <button
          className={`btn ${activeTab === 'PERMISSIONS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('PERMISSIONS')}
        >
          <ShieldCheck size={14} /> Role-Based Access Control (RBAC)
        </button>
      </div>

      {activeTab === 'SETTINGS' ? (
        /* Settings Form */
        <div className="luxe-card" style={{ maxWidth: 840 }}>
          <form onSubmit={handleSaveSettings}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 18, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
              Salon Identity & Location
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Salon Enterprise Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formSettings.salonName}
                  onChange={(e) => setFormSettings({ ...formSettings, salonName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  value={formSettings.tagline}
                  onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Flagship Physical Address</label>
              <input
                type="text"
                className="form-input"
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Concierge Telephone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formSettings.phone}
                  onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Concierge Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formSettings.email}
                  onChange={(e) => setFormSettings({ ...formSettings, email: e.target.value })}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginTop: 24, marginBottom: 18, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
              Billing, Currency & Travel Policies
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Currency Symbol</label>
                <input
                  type="text"
                  className="form-input"
                  value={formSettings.currency}
                  onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={formSettings.taxRate}
                  onChange={(e) => setFormSettings({ ...formSettings, taxRate: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tax Name / Label</label>
                <input
                  type="text"
                  className="form-input"
                  value={formSettings.taxName}
                  onChange={(e) => setFormSettings({ ...formSettings, taxName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Travel Surcharge/km</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={formSettings.travelChargePerKm}
                  onChange={(e) => setFormSettings({ ...formSettings, travelChargePerKm: Number(e.target.value) })}
                />
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginTop: 24, marginBottom: 18, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
              System Theme &amp; Visual Appearance
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div
                onClick={() => {
                  setFormSettings({ ...formSettings, theme: 'light' });
                  setSettings(prev => ({ ...prev, theme: 'light' }));
                }}
                style={{
                  border: (formSettings.theme || 'light') === 'light' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  background: (formSettings.theme || 'light') === 'light' ? 'var(--gold-subtle)' : 'var(--bg-elevated)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b8860b' }}>
                  <Sun size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Bright Theme (Default)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Luxe Ivory, Pearl &amp; Warm Gold appearance</div>
                </div>
              </div>

              <div
                onClick={() => {
                  setFormSettings({ ...formSettings, theme: 'dark' });
                  setSettings(prev => ({ ...prev, theme: 'dark' }));
                }}
                style={{
                  border: formSettings.theme === 'dark' ? '2px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  background: formSettings.theme === 'dark' ? 'var(--gold-subtle)' : 'var(--bg-elevated)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0b1224', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <Moon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Dark Mode</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Royal Sapphire &amp; Obsidian Glow theme</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
              {saveSuccess ? (
                <span style={{ color: 'var(--emerald-accent)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
                  <CheckCircle size={16} /> Configuration saved & applied across all POS terminals!
                </span>
              ) : <span />}

              <button type="submit" className="btn btn-gold">
                Save & Update Salon Settings
              </button>
            </div>
          </form>
        </div>
      ) : activeTab === 'AUDIT' ? (
        /* Tamper-Evident Audit Trail */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', width: 340 }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '8px 14px 8px 34px', fontSize: '0.85rem' }}
                placeholder="Search audit trail by user, action, IP..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing {filteredLogs.length} verified operations
            </div>
          </div>

          <div className="luxe-table-container">
            <table className="luxe-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Authorized User</th>
                  <th>Role</th>
                  <th>Action Code</th>
                  <th>Module</th>
                  <th>Details</th>
                  <th>IP Node</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                    <td><strong>{log.user}</strong></td>
                    <td><span className="badge badge-gray">{log.role}</span></td>
                    <td>
                      <span className="badge badge-gold" style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.module}</td>
                    <td style={{ fontSize: '0.82rem', maxWidth: 320 }}>{log.details}</td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RBAC Roles Matrix */
        <div className="luxe-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: 16 }}>Role-Based Access Control Matrix (RBAC)</h3>
          <div className="luxe-table-container">
            <table className="luxe-table">
              <thead>
                <tr>
                  <th>System Role</th>
                  <th>Functional Module Access</th>
                  <th>Financial Settings</th>
                  <th>Commission Edit</th>
                  <th>Audit Logs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: 'var(--gold-primary)' }}>Super Admin / Owner</strong></td>
                  <td>Unrestricted (All 17 Modules)</td>
                  <td><span className="badge badge-emerald">Full Control</span></td>
                  <td><span className="badge badge-emerald">Allowed</span></td>
                  <td><span className="badge badge-emerald">Full View</span></td>
                </tr>
                <tr>
                  <td><strong>Branch Manager</strong></td>
                  <td>Appointments, POS, Staff, Inventory, Reports</td>
                  <td><span className="badge badge-amber">Read Only</span></td>
                  <td><span className="badge badge-amber">Restricted</span></td>
                  <td><span className="badge badge-emerald">Full View</span></td>
                </tr>
                <tr>
                  <td><strong>Front Desk Receptionist</strong></td>
                  <td>Appointments, Walk-in POS, Clients, Attendance</td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                </tr>
                <tr>
                  <td><strong>Senior Stylist</strong></td>
                  <td>Assigned Appointments, Clock In/Out, Profile</td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                </tr>
                <tr>
                  <td><strong>VIP Customer</strong></td>
                  <td>Booking Requests, Loyalty Points, Invoices, Reviews</td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                  <td><span className="badge badge-ruby">No Access</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
