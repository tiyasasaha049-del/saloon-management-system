import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  Bell,
  MessageSquare,
  Send,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Truck,
  Users,
  Sparkles,
  X
} from 'lucide-react';

export const NotificationsView = () => {
  const {
    notifications,
    addNotification,
    customers,
    logAudit
  } = useSalon();

  const [filterType, setFilterType] = useState('ALL');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Broadcast state
  const [broadcastChannel, setBroadcastChannel] = useState('WhatsApp');
  const [broadcastAudience, setBroadcastAudience] = useState('VIP Clients');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Exclusive privilege: Enjoy 20% off on all autumn hair coloring & balayage this weekend at Lumina Luxe. Use code LUXE20 when booking.'
  );
  const [broadcastSentSuccess, setBroadcastSentSuccess] = useState(false);

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'HIGH') return n.priority === 'high';
    return n.type === filterType;
  });

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    setBroadcastSentSuccess(true);
    addNotification(
      `${broadcastChannel} Broadcast Dispatched`,
      `Sent to ${broadcastAudience} (${customers.length} recipients): "${broadcastMessage.slice(0, 40)}..."`,
      'marketing'
    );
    logAudit(
      'SEND_BROADCAST',
      'Marketing & Notifications',
      `Sent ${broadcastChannel} broadcast campaign to ${broadcastAudience}`
    );

    setTimeout(() => {
      setBroadcastSentSuccess(false);
      setIsBroadcastModalOpen(false);
    }, 1500);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'stock': return <AlertTriangle size={18} color="var(--ruby-accent)" />;
      case 'appointment': return <Calendar size={18} color="var(--cyan-accent)" />;
      case 'homeservice': return <Truck size={18} color="var(--gold-primary)" />;
      case 'staff': return <Users size={18} color="var(--amber-accent)" />;
      default: return <Bell size={18} color="var(--gold-primary)" />;
    }
  };

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            System Notifications & <span className="gold-text-gradient">Guest Communications</span>
          </h2>
          <p>Automated operational alerts, client booking reminders & omnichannel broadcast campaigns</p>
        </div>

        <button className="btn btn-gold" onClick={() => setIsBroadcastModalOpen(true)}>
          <Send size={16} /> Broadcast SMS / WhatsApp
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'HIGH', label: 'High Priority' },
          { id: 'appointment', label: 'Appointments' },
          { id: 'stock', label: 'Inventory' },
          { id: 'homeservice', label: 'Home Dispatch' }
        ].map((f) => (
          <button
            key={f.id}
            className={`btn ${filterType === f.id ? 'btn-gold' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            onClick={() => setFilterType(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredNotifs.length === 0 ? (
          <div className="luxe-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No notifications matching the selected filter.
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className="luxe-card"
              style={{
                padding: '16px 20px',
                borderLeft: n.priority === 'high' ? '4px solid var(--ruby-accent)' : '4px solid var(--gold-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getNotificationIcon(n.type)}
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</div>
                {n.priority === 'high' && (
                  <span className="badge badge-ruby" style={{ fontSize: '0.62rem', marginTop: 4 }}>
                    Urgent
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Campaign Modal */}
      {isBroadcastModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBroadcastModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={18} color="var(--gold-primary)" /> Dispatch Client Broadcast
              </h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsBroadcastModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} style={{ padding: '24px' }}>
              {broadcastSentSuccess ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <CheckCircle size={48} color="var(--emerald-accent)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '1.2rem', marginBottom: 4 }}>Broadcast Dispatched!</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Messages have been queued across {broadcastChannel} gateways.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Delivery Channel</label>
                      <select
                        className="form-select"
                        value={broadcastChannel}
                        onChange={(e) => setBroadcastChannel(e.target.value)}
                      >
                        <option value="WhatsApp">WhatsApp Business API</option>
                        <option value="SMS">Direct SMS Gateway</option>
                        <option value="Email">Luxury HTML Email Newsletter</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Target Audience</label>
                      <select
                        className="form-select"
                        value={broadcastAudience}
                        onChange={(e) => setBroadcastAudience(e.target.value)}
                      >
                        <option value="VIP Clients">Platinum & Gold VIPs ({customers.filter(c => c.tier.includes('VIP') || c.tier === 'Gold').length} Clients)</option>
                        <option value="All Enrolled Clients">All Registered Clients ({customers.length} Clients)</option>
                        <option value="All Staff Members">All Stylists & Salon Staff</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message Template</label>
                    <textarea
                      className="form-textarea"
                      rows={4}
                      required
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Characters: {broadcastMessage.length} / 160 &bull; Estimated segments: 1
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsBroadcastModalOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold">
                      <Send size={15} /> Send Broadcast Now
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
