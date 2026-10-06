import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import {
  MessageSquare,
  Star,
  AlertCircle,
  CheckCircle,
  Plus,
  ShieldCheck,
  User,
  Heart,
  X
} from 'lucide-react';

export const ReviewsView = () => {
  const {
    reviews,
    addReview,
    complaints,
    addComplaint,
    resolveComplaint,
    employees,
    services
  } = useSalon();

  const [activeTab, setActiveTab] = useState('REVIEWS'); // 'REVIEWS' | 'COMPLAINTS'
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Review Form
  const [revClient, setRevClient] = useState('');
  const [revStylist, setRevStylist] = useState(employees[0]?.name || '');
  const [revService, setRevService] = useState(services[0]?.name || '');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  // Complaint Form
  const [cmpClient, setCmpClient] = useState('');
  const [cmpStylist, setCmpStylist] = useState(employees[0]?.name || '');
  const [cmpCategory, setCmpCategory] = useState('Service Quality & Tone');
  const [cmpSeverity, setCmpSeverity] = useState('Medium');
  const [cmpDesc, setCmpDesc] = useState('');

  // Resolution modal
  const [activeResolveCmp, setActiveResolveCmp] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    addReview({
      customerName: revClient,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      stylistName: revStylist,
      serviceName: revService,
      rating: Number(revRating),
      comment: revComment
    });
    setIsReviewModalOpen(false);
    setRevClient('');
    setRevComment('');
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    addComplaint({
      customerName: cmpClient,
      stylistName: cmpStylist,
      category: cmpCategory,
      severity: cmpSeverity,
      description: cmpDesc
    });
    setIsComplaintModalOpen(false);
    setCmpClient('');
    setCmpDesc('');
  };

  const handleConfirmResolve = (e) => {
    e.preventDefault();
    if (activeResolveCmp) {
      resolveComplaint(activeResolveCmp.id, resolutionNotes);
      setActiveResolveCmp(null);
      setResolutionNotes('');
    }
  };

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2);

  return (
    <div className="view-wrapper">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <h2>
            Guest Reviews & <span className="gold-text-gradient">Quality Assurance</span>
          </h2>
          <p>Verified client testimonials, star ratings and guest grievance resolution workflows</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setIsComplaintModalOpen(true)}>
            <AlertCircle size={15} color="var(--ruby-accent)" /> File Grievance Ticket
          </button>
          <button className="btn btn-gold" onClick={() => setIsReviewModalOpen(true)}>
            <Plus size={16} /> Add Guest Review
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Guest Satisfaction Score</span>
            <div className="stat-icon" style={{ background: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-primary)' }}>
              <Star size={20} />
            </div>
          </div>
          <div className="stat-value">{avgRating} / 5.0</div>
          <div style={{ color: 'var(--gold-primary)', fontSize: '0.8rem', marginTop: 8 }}>
            ★★★★★ Based on {reviews.length * 48} verified salon treatments
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Open Quality Tickets</span>
            <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--ruby-accent)' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{complaints.filter(c => c.status !== 'Resolved').length} Active</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            Average resolution turnaround: 3.2 hours
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">Resolved Grievances</span>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-accent)' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{complaints.filter(c => c.status === 'Resolved').length} Settled</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--emerald-accent)', marginTop: 8 }}>
            100% guest retention following resolution
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          className={`btn ${activeTab === 'REVIEWS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('REVIEWS')}
        >
          <Star size={14} /> Verified Reviews ({reviews.length})
        </button>
        <button
          className={`btn ${activeTab === 'COMPLAINTS' ? 'btn-gold' : 'btn-secondary'}`}
          style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          onClick={() => setActiveTab('COMPLAINTS')}
        >
          <AlertCircle size={14} /> Complaints & Grievance Tickets ({complaints.length})
        </button>
      </div>

      {activeTab === 'REVIEWS' ? (
        /* Reviews Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {reviews.map((rev) => (
            <div key={rev.id} className="luxe-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.25) 100%)',
                        border: '1.5px solid var(--border-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold-primary)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}
                    >
                      {(rev.customerName || 'VIP').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>{rev.customerName}</h4>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rev.date}</div>
                    </div>
                  </div>
                  <div style={{ color: 'var(--gold-primary)', fontSize: '0.95rem' }}>
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 14 }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>Stylist: {rev.stylistName}</span>
                <span style={{ color: 'var(--text-muted)' }}>{rev.serviceName}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Complaints Hub */
        <div className="luxe-table-container">
          <table className="luxe-table">
            <thead>
              <tr>
                <th>Ticket ID & Date</th>
                <th>Client</th>
                <th>Staff Involved</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Resolution</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((cmp) => (
                <tr key={cmp.id}>
                  <td>
                    <strong>{cmp.id.toUpperCase()}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cmp.date}</div>
                  </td>
                  <td><strong>{cmp.customerName}</strong></td>
                  <td>{cmp.stylistName}</td>
                  <td>{cmp.category}</td>
                  <td>
                    <span className={`badge ${cmp.severity === 'High' ? 'badge-ruby' : 'badge-amber'}`}>
                      {cmp.severity}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', maxWidth: 260 }}>
                    <div>{cmp.description}</div>
                    {cmp.resolutionNotes && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--emerald-accent)', marginTop: 4 }}>
                        Resolved: {cmp.resolutionNotes}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${cmp.status === 'Resolved' ? 'badge-emerald' : cmp.status === 'In Progress' ? 'badge-amber' : 'badge-ruby'}`}>
                      {cmp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {cmp.status !== 'Resolved' ? (
                      <button
                        className="btn btn-gold"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => setActiveResolveCmp(cmp)}
                      >
                        Resolve Ticket
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--emerald-accent)' }}>Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Review Modal */}
      {isReviewModalOpen && (
        <div className="modal-overlay" onClick={() => setIsReviewModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Add Guest Testimonial</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsReviewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Lady Vivienne Westwood"
                  value={revClient}
                  onChange={(e) => setRevClient(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Stylist</label>
                  <select className="form-select" value={revStylist} onChange={(e) => setRevStylist(e.target.value)}>
                    {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (Stars)</label>
                  <select className="form-select" value={revRating} onChange={(e) => setRevRating(e.target.value)}>
                    <option value="5">★★★★★ 5 Stars (Exceptional)</option>
                    <option value="4">★★★★☆ 4 Stars (Very Good)</option>
                    <option value="3">★★★☆☆ 3 Stars (Average)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Rendered</label>
                <input
                  type="text"
                  className="form-input"
                  value={revService}
                  onChange={(e) => setRevService(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Client Review Quote</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="Express client feedback..."
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsReviewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Complaint Modal */}
      {isComplaintModalOpen && (
        <div className="modal-overlay" onClick={() => setIsComplaintModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Open Grievance Ticket</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setIsComplaintModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleComplaintSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={cmpClient}
                  onChange={(e) => setCmpClient(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Stylist / Station</label>
                  <select className="form-select" value={cmpStylist} onChange={(e) => setCmpStylist(e.target.value)}>
                    {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity Level</label>
                  <select className="form-select" value={cmpSeverity} onChange={(e) => setCmpSeverity(e.target.value)}>
                    <option value="Low">Low (Minor Delay)</option>
                    <option value="Medium">Medium (Discrepancy)</option>
                    <option value="High">High (Immediate Concierge Attention)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={cmpCategory}
                  onChange={(e) => setCmpCategory(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Issue Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="Detail the issue reported by the client..."
                  value={cmpDesc}
                  onChange={(e) => setCmpDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsComplaintModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Ticket Modal */}
      {activeResolveCmp && (
        <div className="modal-overlay" onClick={() => setActiveResolveCmp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Resolve Grievance: {activeResolveCmp.id.toUpperCase()}</h3>
              <button className="btn btn-secondary btn-icon" onClick={() => setActiveResolveCmp(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} style={{ padding: '24px' }}>
              <div style={{ background: 'var(--bg-elevated)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 14, fontSize: '0.82rem' }}>
                <div><strong>Client:</strong> {activeResolveCmp.customerName}</div>
                <div><strong>Issue:</strong> {activeResolveCmp.description}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Resolution Actions & Compensation</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="e.g. Offered complimentary toner touchup + ₹500 boutique gift card. Client thoroughly satisfied."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 14 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveResolveCmp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold">
                  Close & Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
