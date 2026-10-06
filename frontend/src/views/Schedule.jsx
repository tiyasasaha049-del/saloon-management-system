import React, { useState, useMemo, useRef } from "react";
import { useSalon } from "../context/SalonContext";
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Plus, X,
  CheckCircle2, AlertCircle, UserRound, Truck, Sparkles, Navigation,
  Edit2, XCircle, RotateCcw, Save
} from "lucide-react";

const today = new Date();
const toKey = (d) => { const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),dd=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${dd}`; };
const todayKey = toKey(today);
const dateFromKey = (k) => new Date(`${k}T00:00:00`);
const fmtDate = (k, opts={ day:"numeric",month:"short",year:"numeric" }) => { try{ return dateFromKey(k).toLocaleDateString("en-IN",opts); }catch{ return k; } };
const WDS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const bookingToEntry = (item) => {
  let rawDate = item.date || item.scheduledDate || "";
  if (!rawDate && item.scheduledTime) {
    const parts = item.scheduledTime.split("\u2022");
    const candidate = (parts[0] || "").trim();
    const match = candidate.match(/\d{4}-\d{2}-\d{2}/);
    rawDate = match ? match[0] : "";
  }
  if (!rawDate) rawDate = todayKey;
  let rawTime = item.time || item.scheduledTime || "10:00 AM";
  if (rawTime.includes("\u2022")) rawTime = (rawTime.split("\u2022")[1] || "").trim() || "10:00 AM";
  return {
    schedule_id: `hs-${item.id || Math.random()}`,
    entry_type: "Home Service",
    date: rawDate, start_time: rawTime,
    staff_name: item.assignedStaffName || item.stylistName || "Unassigned",
    customer_name: item.customerName || "VIP Client",
    services: item.services || item.serviceName || (item.serviceNames||[]).join(", ") || "Home Service",
    address: item.address || item.customerAddress || "",
    phone: item.phone || item.customerPhone || "",
    distance_km: Number(item.distanceKm||0),
    price: Number(item.price || item.totalPrice || 0),
    status: item.status || "Requested",
    notes: item.notes || "",
    raw_id: item.id,
  };
};

const appointmentToEntry = (apt) => {
  const rawDate = apt.date || apt.bookingDate || todayKey;
  const rawTime = apt.time || apt.bookingTime || "10:00 AM";
  const srvNames = apt.serviceNames?.join(", ") || apt.serviceName || apt.service || "Salon Service";
  const staffName = apt.stylistName || apt.staffName || apt.assignedStaffName || "Unassigned";
  return {
    schedule_id: `apt-${apt.id || Math.random()}`,
    entry_type: apt.type === "Home Service" ? "Home Service" : "Salon",
    date: rawDate,
    start_time: rawTime,
    staff_name: staffName,
    customer_name: apt.customerName || "Client",
    services: srvNames,
    address: apt.address || apt.station || apt.branch || "",
    phone: apt.customerPhone || apt.phone || "",
    distance_km: 0,
    price: Number(apt.price || apt.totalPrice || 0),
    status: apt.status || "Confirmed",
    notes: apt.notes || "",
    raw_id: apt.id,
  };
};

const getByDate = (entries, key) => entries.filter(e => e.date === key);

const SC = {
  Requested:    { bg:"rgba(99,102,241,0.15)",  color:"#818cf8" },
  Assigned:     { bg:"rgba(14,165,233,0.15)",  color:"#38bdf8" },
  "En Route":   { bg:"rgba(245,158,11,0.15)",  color:"#fbbf24" },
  Arrived:      { bg:"rgba(245,158,11,0.2)",   color:"#f59e0b" },
  "In Service": { bg:"rgba(212,163,115,0.2)",  color:"#d4a373" },
  Completed:    { bg:"rgba(16,185,129,0.15)",  color:"#34d399" },
  Cancelled:    { bg:"rgba(239,68,68,0.15)",   color:"#f87171" },
  Rejected:     { bg:"rgba(239,68,68,0.15)",   color:"#f87171" },
};
const StatusBadge = ({ status }) => {
  const s = SC[status] || { bg:"rgba(212,163,115,0.15)", color:"#d4a373" };
  return <span style={{ background:s.bg, color:s.color, padding:"3px 10px", borderRadius:20, fontSize:"0.7rem", fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>{status}</span>;
};

const Stat = ({ icon:Icon, label, value, accent }) => (
  <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-md)", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10, boxShadow:"var(--shadow-sm)" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div style={{ width:36, height:36, borderRadius:10, background:accent||"rgba(212,163,115,0.12)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gold-primary)" }}><Icon size={18}/></div>
      <span style={{ fontSize:"1.6rem", fontWeight:800, color:"var(--text-primary)", lineHeight:1 }}>{value}</span>
    </div>
    <p style={{ fontSize:"0.72rem", fontWeight:600, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
  </div>
);

const EditScheduleModal = ({ booking, employees, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: booking.date || todayKey,
    start_time: booking.start_time || "10:00 AM",
    status: booking.status || "Confirmed",
    staff_name: booking.staff_name || "",
    services: booking.services || "",
    address: booking.address || "",
    price: booking.price || 0,
    notes: booking.notes || "",
    entry_type: booking.entry_type || "Salon",
    raw_id: booking.raw_id
  });

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div className="luxe-card" style={{ width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto", borderRadius:"var(--radius-lg)", boxShadow:"0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--border-gold)", padding:0, background:"var(--bg-card)" }}>
        
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", borderRadius:"var(--radius-lg) var(--radius-lg) 0 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"rgba(212,163,115,0.15)", border:"1px solid var(--border-gold)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--gold-primary)" }}>
              <Edit2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize:"1.05rem", fontWeight:800, color:"var(--text-primary)", margin:0 }}>Edit Schedule Booking</h3>
              <p style={{ fontSize:"0.75rem", color:"var(--text-secondary)", margin:0, marginTop:2 }}>
                {booking.customer_name} • <span style={{ color:"var(--gold-primary)", fontWeight:600 }}>{booking.entry_type}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:"1px solid var(--border-subtle)", background:"transparent", color:"var(--text-secondary)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={16}/>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-secondary)", marginBottom:6 }}>Date</label>
              <input type="date" value={formData.date} onChange={e=>handleChange("date", e.target.value)} required
                style={{ width:"100%", height:40, borderRadius:8, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--text-primary)", padding:"0 12px", fontSize:"0.85rem", outline:"none" }}
              />
            </div>
            <div>
              <label style={{ display:"block", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-secondary)", marginBottom:6 }}>Time</label>
              <input type="text" value={formData.start_time} onChange={e=>handleChange("start_time", e.target.value)} placeholder="10:00 AM" required
                style={{ width:"100%", height:40, borderRadius:8, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--text-primary)", padding:"0 12px", fontSize:"0.85rem", outline:"none" }}
              />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-secondary)", marginBottom:6 }}>Assigned Staff</label>
              <select value={formData.staff_name} onChange={e=>handleChange("staff_name", e.target.value)}
                style={{ width:"100%", height:40, borderRadius:8, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--text-primary)", padding:"0 12px", fontSize:"0.85rem", outline:"none", cursor:"pointer" }}
              >
                <option value="Unassigned">Unassigned</option>
                {(employees || []).map(emp => (
                  <option key={emp.id} value={emp.name}>{emp.name} ({emp.specialties?.[0] || emp.role || "Staff"})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-secondary)", marginBottom:6 }}>Status</label>
              <select value={formData.status} onChange={e=>handleChange("status", e.target.value)}
                style={{ width:"100%", height:40, borderRadius:8, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--text-primary)", padding:"0 12px", fontSize:"0.85rem", outline:"none", cursor:"pointer" }}
              >
                {["Confirmed", "Assigned", "En Route", "Arrived", "In Service", "Completed", "Rescheduled", "Cancelled"].map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display:"block", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-secondary)", marginBottom:6 }}>Services / Treatment</label>
            <input type="text" value={formData.services} onChange={e=>handleChange("services", e.target.value)} required
              style={{ width:"100%", height:40, borderRadius:8, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--text-primary)", padding:"0 12px", fontSize:"0.85rem", outline:"none" }}
            />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14 }}>
            <div>
              <label style={{ display:"block", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-secondary)", marginBottom:6 }}>Location / Address / Station</label>
              <input type="text" value={formData.address} onChange={e=>handleChange("address", e.target.value)} placeholder="e.g. Chair #1 or Customer Residence"
                style={{ width:"100%", height:40, borderRadius:8, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--text-primary)", padding:"0 12px", fontSize:"0.85rem", outline:"none" }}
              />
            </div>
            <div>
              <label style={{ display:"block", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-secondary)", marginBottom:6 }}>Price (₹)</label>
              <input type="number" min="0" value={formData.price} onChange={e=>handleChange("price", e.target.value)}
                style={{ width:"100%", height:40, borderRadius:8, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--text-primary)", padding:"0 12px", fontSize:"0.85rem", outline:"none" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display:"block", fontSize:"0.7rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-secondary)", marginBottom:6 }}>Notes</label>
            <textarea rows={2} value={formData.notes} onChange={e=>handleChange("notes", e.target.value)} placeholder="Special requests or instructions"
              style={{ width:"100%", borderRadius:8, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--text-primary)", padding:"10px 12px", fontSize:"0.85rem", outline:"none", resize:"vertical" }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:10, marginTop:10, paddingTop:12, borderTop:"1px solid var(--border-subtle)" }}>
            <button type="button" onClick={onClose} className="btn" style={{ padding:"8px 18px", fontSize:"0.82rem", background:"var(--bg-elevated)", border:"1px solid var(--border-subtle)", color:"var(--text-secondary)", borderRadius:8, cursor:"pointer" }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold" style={{ padding:"8px 24px", fontSize:"0.82rem", fontWeight:700, display:"inline-flex", alignItems:"center", gap:6 }}>
              <Save size={14}/> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ScheduleCard = ({ entry, onEdit, onCancel }) => {
  const isHome = entry.entry_type === "Home Service";
  const isCancelled = entry.status === "Cancelled";
  return (
    <div
      style={{
        background: isCancelled ? "rgba(239,68,68,0.03)" : "var(--bg-elevated)",
        border: isCancelled ? "1px solid rgba(239,68,68,0.2)" : "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "10px 16px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        transition: "all 0.2s ease",
        opacity: isCancelled ? 0.75 : 1
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = isCancelled ? "rgba(239,68,68,0.4)" : "var(--border-gold)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = isCancelled ? "rgba(239,68,68,0.2)" : "var(--border-subtle)"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1, overflow: "hidden" }}>
        {/* Time */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(212,163,115,0.08)",
          border: "1px solid rgba(212,163,115,0.2)",
          padding: "4px 10px",
          borderRadius: 8,
          fontSize: "0.76rem",
          fontWeight: 700,
          color: "var(--gold-primary)",
          whiteSpace: "nowrap",
          flexShrink: 0
        }}>
          <Clock3 size={13} />
          {entry.start_time}
        </div>

        {/* Type Badge */}
        <span style={{
          background: isHome ? "rgba(212,163,115,0.18)" : "rgba(99,102,241,0.18)",
          color: isHome ? "var(--gold-primary)" : "#818cf8",
          fontSize: "0.65rem",
          fontWeight: 800,
          padding: "3px 8px",
          borderRadius: 6,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          flexShrink: 0
        }}>
          {isHome ? "HOME SERVICE" : "IN-SALON"}
        </span>

        {/* Customer Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: isCancelled ? "var(--text-muted)" : "var(--text-primary)",
            textDecoration: isCancelled ? "line-through" : "none",
            whiteSpace: "nowrap"
          }}>
            {entry.customer_name}
          </span>
          {entry.phone && (
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              ({entry.phone})
            </span>
          )}
        </div>

        <span style={{ color: "var(--border-subtle)", flexShrink: 0 }}>•</span>

        {/* Services */}
        <span style={{
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          minWidth: 100
        }}>
          {entry.services}
        </span>

        {/* Staff Specialist */}
        {entry.staff_name && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, fontSize: "0.76rem", color: "var(--text-secondary)" }}>
            <UserRound size={12} color="var(--gold-primary)" />
            <span>Staff: <strong style={{ color: "var(--text-primary)" }}>{entry.staff_name}</strong></span>
          </div>
        )}

        {/* Address / Location */}
        {entry.address && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, fontSize: "0.74rem", color: "var(--text-muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <MapPin size={12} color="var(--gold-primary)" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{entry.address}</span>
          </div>
        )}
      </div>

      {/* Right side: Price, Status, & Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {entry.price > 0 && (
          <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--gold-primary)", whiteSpace: "nowrap" }}>
            ₹{entry.price.toLocaleString("en-IN")}
          </span>
        )}
        <StatusBadge status={entry.status} />

        {/* Edit and Cancel Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
            title="Edit Booking"
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-card)",
              color: "var(--gold-primary)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold-primary)"; e.currentTarget.style.background = "rgba(212,163,115,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.background = "var(--bg-card)"; }}
          >
            <Edit2 size={13} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onCancel(entry); }}
            title={isCancelled ? "Reopen / Restore Booking" : "Cancel Booking"}
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              border: isCancelled ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(239,68,68,0.25)",
              background: isCancelled ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
              color: isCancelled ? "#34d399" : "#f87171",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = isCancelled ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = isCancelled ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)"; }}
          >
            {isCancelled ? <RotateCcw size={13} /> : <XCircle size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const NBStyle = { width:36, height:36, borderRadius:8, border:"none", background:"var(--bg-elevated)", color:"var(--text-secondary)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 };

const DateNavigation = ({ weekStart, selectedDate, countByDate, onPrevious, onNext, onSelect }) => {
  const scrollerRef = useRef(null);
  const dragRef = useRef({ active:false, startX:0, startScroll:0 });
  const dates = Array.from({length:14},(_,i) => new Date(weekStart.getFullYear(),weekStart.getMonth(),weekStart.getDate()+i));
  const beginDrag = e => { dragRef.current={active:true,startX:e.pageX,startScroll:scrollerRef.current?.scrollLeft||0}; };
  const drag = e => { if(!dragRef.current.active||!scrollerRef.current)return; scrollerRef.current.scrollLeft=dragRef.current.startScroll-(e.pageX-dragRef.current.startX); };
  const stopDrag = () => { dragRef.current.active=false; };
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-md)", padding:8, marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <button onClick={onPrevious} style={NBStyle}><ChevronLeft size={20}/></button>
        <div ref={scrollerRef} onMouseDown={beginDrag} onMouseMove={drag} onMouseUp={stopDrag} onMouseLeave={stopDrag}
          style={{ display:"flex", flex:1, gap:4, overflowX:"auto", scrollbarWidth:"none", cursor:"grab", userSelect:"none" }}>
          {dates.map(date => {
            const key=toKey(date); const sel=key===selectedDate; const isTd=key===todayKey; const count=countByDate[key]||0;
            return (
              <button key={key} onClick={()=>onSelect(key)}
                style={{ minWidth:80, flexShrink:0, borderRadius:10, padding:"8px 10px", textAlign:"center", cursor:"pointer",
                  border:isTd&&!sel?"1px solid var(--gold-primary)":"1px solid transparent",
                  background:sel?"var(--gold-gradient)":"transparent" }}>
                <p style={{ fontSize:"0.65rem", fontWeight:700, textTransform:"uppercase", color:sel?"#0b0c10":"var(--text-secondary)", marginBottom:2 }}>{date.toLocaleDateString("en-IN",{weekday:"short"})}</p>
                <p style={{ fontSize:"1.1rem", fontWeight:800, color:sel?"#0b0c10":isTd?"var(--gold-primary)":"var(--text-primary)" }}>{date.getDate()}</p>
                {count > 0 && <p style={{ fontSize:"0.65rem", fontWeight:600, color:sel?"rgba(0,0,0,0.6)":"var(--gold-primary)" }}>{count} bkg</p>}
              </button>
            );
          })}
        </div>
        <button onClick={onNext} style={NBStyle}><ChevronRight size={20}/></button>
      </div>
    </div>
  );
};

const MonthCalendar = ({ month, selectedDate, bookingActiveDates, onPrevMonth, onNextMonth, onSelect }) => {
  const firstDay = month.getDay();
  const daysInMonth = new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(new Date(month.getFullYear(),month.getMonth(),d));
  const monthLabel = month.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  return (
    <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-md)", marginBottom:16, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid var(--border-subtle)", padding:"12px 16px" }}>
        <h3 style={{ fontSize:"0.9rem", fontWeight:700, color:"var(--text-primary)" }}>{monthLabel}</h3>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={onPrevMonth} style={NBStyle}><ChevronLeft size={16}/></button>
          <button onClick={onNextMonth} style={NBStyle}><ChevronRight size={16}/></button>
        </div>
      </div>
      <div style={{ padding:"12px 14px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
          {WDS.map(d=><div key={d} style={{ textAlign:"center", fontSize:"0.62rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-muted)", padding:"4px 0" }}>{d}</div>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
          {cells.map((date,idx) => {
            if(!date) return <div key={`e-${idx}`}/>;
            const key=toKey(date); const isSel=key===selectedDate; const isTd=key===todayKey; const hasBk=bookingActiveDates.has(key);
            return (
              <button key={key} onClick={()=>onSelect(key)}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  padding:"6px 2px", borderRadius:8, cursor:"pointer", border:"none",
                  background:isSel?"var(--gold-gradient)":isTd?"rgba(212,163,115,0.1)":"transparent",
                  color:isSel?"#0b0c10":isTd?"var(--gold-primary)":"var(--text-primary)",
                  fontWeight:isSel||isTd?700:500, fontSize:"0.82rem",
                  outline:isTd&&!isSel?"1px solid var(--gold-primary)":"none" }}>
                {date.getDate()}
                {hasBk && <span style={{ width:4, height:4, borderRadius:"50%", marginTop:2, background:isSel?"rgba(0,0,0,0.5)":"var(--gold-primary)", display:"block" }}/>}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", gap:16, fontSize:"0.68rem", color:"var(--text-muted)" }}>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:8, height:8, borderRadius:"50%", background:"var(--gold-primary)", display:"inline-block" }}/> Has bookings</span>
          <span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:8, height:8, borderRadius:"50%", border:"1.5px solid var(--gold-primary)", display:"inline-block" }}/> Today</span>
        </div>
      </div>
    </div>
  );
};

export const HomeServicesView = () => {
  const {
    homeServices,
    appointments,
    employees,
    updateAppointment,
    updateAppointmentStatus,
    updateHomeService,
    updateHomeServiceStatus,
    setIsQuickBookingOpen,
    setQuickBookingDate
  } = useSalon();
  const [calendarMonth,setCalendarMonth] = useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [selectedDate,setSelectedDate] = useState(todayKey);
  const [weekStart,setWeekStart] = useState(() => { const s=new Date(today); s.setDate(s.getDate()-s.getDay()); return s; });
  const [editingBooking, setEditingBooking] = useState(null);
  const [toast,setToast] = useState(null);
  const showToast = (msg,type="success") => { setToast({message:msg,type}); setTimeout(()=>setToast(null),3000); };

  /* Merge home services + all appointments into one unified list */
  const allEntries = useMemo(() => {
    const hsEntries  = (homeServices||[]).map(bookingToEntry);
    const aptEntries = (appointments||[]).map(appointmentToEntry);
    const seenIds = new Set(hsEntries.map(e=>String(e.raw_id)).filter(Boolean));
    const uniqueApts = aptEntries.filter(e=>!seenIds.has(String(e.raw_id)));
    return [...hsEntries, ...uniqueApts];
  }, [homeServices, appointments]);
  const countByDate = useMemo(() => { const m={}; allEntries.forEach(e=>{ if(e.date) m[e.date]=(m[e.date]||0)+1; }); return m; }, [allEntries]);
  const bookingActiveDates = useMemo(() => new Set(Object.keys(countByDate)), [countByDate]);

  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL"); // "ALL" | "Home Service" | "Salon"

  const selectedEntries = useMemo(() => {
    const list = getByDate(allEntries, selectedDate);
    list.sort((a,b) => {
      const parse = t => { const m=t.match(/(\d+):(\d+)\s*(AM|PM)?/i); if(!m) return 0; let h=parseInt(m[1]),min=parseInt(m[2]),p=(m[3]||"AM").toUpperCase(); if(p==="PM"&&h<12)h+=12; if(p==="AM"&&h===12)h=0; return h*60+min; };
      return parse(a.start_time)-parse(b.start_time);
    });
    return list;
  }, [allEntries, selectedDate]);

  const selectedHomeCount = useMemo(() => selectedEntries.filter(e => e.entry_type === "Home Service").length, [selectedEntries]);
  const selectedSalonCount = useMemo(() => selectedEntries.filter(e => e.entry_type === "Salon").length, [selectedEntries]);

  const displayedEntries = useMemo(() => {
    if (selectedTypeFilter === "Home Service") {
      return selectedEntries.filter(e => e.entry_type === "Home Service");
    }
    if (selectedTypeFilter === "Salon") {
      return selectedEntries.filter(e => e.entry_type === "Salon");
    }
    return selectedEntries;
  }, [selectedEntries, selectedTypeFilter]);

  const todayCount  = countByDate[todayKey]||0;
  const completed   = allEntries.filter(e=>e.status==="Completed").length;
  const homeCount   = allEntries.filter(e=>e.entry_type==="Home Service").length;
  const salonCount  = allEntries.filter(e=>e.entry_type==="Salon").length;

  const selectDate = key => {
    setSelectedDate(key);
    const d=dateFromKey(key);
    setWeekStart(new Date(d.getFullYear(),d.getMonth(),d.getDate()-d.getDay()));
  };

  const handleOpenBooking = () => {
    if (setQuickBookingDate) setQuickBookingDate(selectedDate);
    setIsQuickBookingOpen(true);
  };

  const handleCancelBooking = (entry) => {
    const isCancelled = entry.status === "Cancelled";
    const nextStatus = isCancelled ? "Confirmed" : "Cancelled";
    const rawId = entry.raw_id;

    if (entry.entry_type === "Home Service" && typeof updateHomeServiceStatus === "function") {
      updateHomeServiceStatus(rawId, nextStatus);
    }
    if (typeof updateAppointmentStatus === "function") {
      updateAppointmentStatus(rawId, nextStatus);
    }

    showToast(isCancelled ? "Booking restored to Confirmed!" : "Booking cancelled successfully!");
  };

  const handleSaveEdit = (formData) => {
    try {
      const rawId = formData.raw_id;
      const isHome = formData.entry_type === "Home Service";

      if (isHome && typeof updateHomeService === "function") {
        updateHomeService(rawId, {
          date: formData.date,
          time: formData.start_time,
          status: formData.status,
          assignedStaffName: formData.staff_name,
          services: formData.services,
          address: formData.address,
          price: Number(formData.price) || 0,
          notes: formData.notes
        });
      }

      if (typeof updateAppointment === "function") {
        updateAppointment(rawId, {
          date: formData.date,
          time: formData.start_time,
          status: formData.status,
          stylistName: formData.staff_name,
          serviceNames: [formData.services],
          serviceName: formData.services,
          address: formData.address,
          station: formData.address,
          price: Number(formData.price) || 0,
          totalPrice: Number(formData.price) || 0,
          notes: formData.notes
        });
      }

      setEditingBooking(null);
      showToast("Schedule updated successfully!");
    } catch {
      showToast("Failed to update schedule.", "error");
    }
  };

  return (
    <div className="view-wrapper">
      <div className="view-header" style={{ marginBottom:20 }}>
        <div className="view-title-group">
          <h2>Schedule <span className="gold-text-gradient">Management</span></h2>
          <p>All customer schedules — salon appointments &amp; home dispatches — in one unified calendar.</p>
        </div>
        <button onClick={handleOpenBooking} className="btn btn-gold" style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Plus size={16}/> Add Booking
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:12, marginBottom:20 }}>
        <Stat icon={CalendarDays} label="All Schedules"   value={allEntries.length}/>
        <Stat icon={Sparkles}     label="Salon Appts"     value={salonCount}  accent="rgba(99,102,241,0.12)"/>
        <Stat icon={Truck}        label="Home Services"   value={homeCount}   accent="rgba(212,163,115,0.12)"/>
        <Stat icon={CheckCircle2} label="Today's Total"   value={todayCount}  accent="rgba(16,185,129,0.12)"/>
        <Stat icon={Navigation}   label="Completed"       value={completed}   accent="rgba(245,158,11,0.12)"/>
      </div>

      <DateNavigation weekStart={weekStart} selectedDate={selectedDate} countByDate={countByDate}
        onPrevious={()=>setWeekStart(d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()-7))}
        onNext={()=>setWeekStart(d=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+7))}
        onSelect={selectDate}/>

      <MonthCalendar month={calendarMonth} selectedDate={selectedDate} bookingActiveDates={bookingActiveDates}
        onPrevMonth={()=>setCalendarMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1))}
        onNextMonth={()=>setCalendarMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1))}
        onSelect={selectDate}/>

      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-md)", marginBottom:20 }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <h3 style={{ fontSize:"0.95rem", fontWeight:700, color:"var(--text-primary)" }}>{fmtDate(selectedDate,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</h3>
            <p style={{ fontSize:"0.75rem", color:"var(--text-secondary)", marginTop:3 }}>
              {displayedEntries.length} booking{displayedEntries.length===1?"":"s"} · sorted by time
            </p>
          </div>

          {/* Filter Buttons: All, Home Service, In-Salon Service */}
          <div style={{ display:"flex", alignItems:"center", gap:4, background:"var(--bg-elevated)", padding:"3px 4px", borderRadius:10, border:"1px solid var(--border-subtle)" }}>
            <button
              type="button"
              onClick={() => setSelectedTypeFilter("ALL")}
              style={{
                padding:"5px 12px",
                borderRadius:7,
                border:"none",
                background: selectedTypeFilter === "ALL" ? "var(--gold-gradient)" : "transparent",
                color: selectedTypeFilter === "ALL" ? "#0b0c10" : "var(--text-secondary)",
                fontSize:"0.75rem",
                fontWeight: 700,
                cursor:"pointer",
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                transition:"all 0.2s"
              }}
            >
              <span>All</span>
              <span style={{
                fontSize:"0.65rem",
                padding:"1px 6px",
                borderRadius:10,
                background: selectedTypeFilter === "ALL" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.06)",
                color: selectedTypeFilter === "ALL" ? "#0b0c10" : "var(--text-muted)"
              }}>
                {selectedEntries.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTypeFilter("Home Service")}
              style={{
                padding:"5px 12px",
                borderRadius:7,
                border:"none",
                background: selectedTypeFilter === "Home Service" ? "var(--gold-gradient)" : "transparent",
                color: selectedTypeFilter === "Home Service" ? "#0b0c10" : "var(--text-secondary)",
                fontSize:"0.75rem",
                fontWeight: 700,
                cursor:"pointer",
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                transition:"all 0.2s"
              }}
            >
              <Truck size={13} />
              <span>Home Service</span>
              <span style={{
                fontSize:"0.65rem",
                padding:"1px 6px",
                borderRadius:10,
                background: selectedTypeFilter === "Home Service" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.06)",
                color: selectedTypeFilter === "Home Service" ? "#0b0c10" : "var(--text-muted)"
              }}>
                {selectedHomeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTypeFilter("Salon")}
              style={{
                padding:"5px 12px",
                borderRadius:7,
                border:"none",
                background: selectedTypeFilter === "Salon" ? "var(--gold-gradient)" : "transparent",
                color: selectedTypeFilter === "Salon" ? "#0b0c10" : "var(--text-secondary)",
                fontSize:"0.75rem",
                fontWeight: 700,
                cursor:"pointer",
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                transition:"all 0.2s"
              }}
            >
              <Sparkles size={13} />
              <span>In Salon Service</span>
              <span style={{
                fontSize:"0.65rem",
                padding:"1px 6px",
                borderRadius:10,
                background: selectedTypeFilter === "Salon" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.06)",
                color: selectedTypeFilter === "Salon" ? "#0b0c10" : "var(--text-muted)"
              }}>
                {selectedSalonCount}
              </span>
            </button>
          </div>

          <div style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--gold-primary)", background:"rgba(212,163,115,0.12)", padding:"4px 12px", borderRadius:20 }}>
            {displayedEntries.length} slot{displayedEntries.length!==1?"s":""}
          </div>
        </div>

        <div style={{ maxHeight:520, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:8 }}>
          {displayedEntries.length>0
            ? displayedEntries.map(e=><ScheduleCard key={e.schedule_id} entry={e} onEdit={setEditingBooking} onCancel={handleCancelBooking}/>)
            : <div style={{ textAlign:"center", padding:"48px 20px" }}>
                <CalendarDays size={36} color="var(--border-subtle)" style={{ margin:"0 auto 12px" }}/>
                <p style={{ color:"var(--text-muted)", fontSize:"0.85rem", marginBottom:12 }}>
                  {selectedEntries.length > 0
                    ? `No ${selectedTypeFilter === "Home Service" ? "home service" : "in-salon"} bookings found for this date.`
                    : "No bookings for this date."
                  }
                  <br/>
                  <span style={{ color:"var(--text-secondary)" }}>
                    {selectedEntries.length > 0 ? "Try switching filters or add a new booking." : "Select another date or create a new booking."}
                  </span>
                </p>
                <div style={{ display:"inline-flex", gap:8 }}>
                  {selectedTypeFilter !== "ALL" && (
                    <button onClick={()=>setSelectedTypeFilter("ALL")} className="btn btn-secondary" style={{ fontSize:"0.78rem", padding:"6px 14px" }}>
                      Show All ({selectedEntries.length})
                    </button>
                  )}
                  <button onClick={handleOpenBooking} className="btn btn-gold" style={{ fontSize:"0.78rem", padding:"6px 16px", display:"inline-flex", alignItems:"center", gap:6 }}>
                    <Plus size={14}/> Book Appointment
                  </button>
                </div>
              </div>
          }
        </div>
      </div>

      <div style={{ background:"var(--bg-card)", border:"1px solid var(--border-subtle)", borderRadius:"var(--radius-md)" }}>
        <div style={{ padding:"14px 18px 12px", borderBottom:"1px solid var(--border-subtle)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div><h3 style={{ fontSize:"0.95rem", fontWeight:700, color:"var(--text-primary)" }}>All Customer Schedules</h3><p style={{ fontSize:"0.73rem", color:"var(--text-secondary)", marginTop:2 }}>{allEntries.length} total · {salonCount} salon · {homeCount} home</p></div>
          <Sparkles size={18} color="var(--gold-primary)"/>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.82rem" }}>
            <thead>
              <tr>{["Type","Date & Time","Customer","Services","Staff","Status","Price","Actions"].map(h=>(
                <th key={h} style={{ padding:"10px 14px", textAlign:h==="Actions"?"right":"left", fontSize:"0.68rem", fontWeight:700, textTransform:"uppercase", color:"var(--text-muted)", background:"var(--bg-elevated)", borderBottom:"1px solid var(--border-subtle)" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {allEntries.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(entry=>(
                <tr key={entry.schedule_id} onClick={()=>selectDate(entry.date)} style={{ cursor:"pointer", borderBottom:"1px solid var(--border-subtle)", opacity:entry.status==="Cancelled"?0.7:1 }}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg-elevated)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"10px 14px" }}>
                    <span style={{ background:entry.entry_type==="Home Service"?"rgba(212,163,115,0.15)":"rgba(99,102,241,0.15)", color:entry.entry_type==="Home Service"?"var(--gold-primary)":"#818cf8", padding:"3px 9px", borderRadius:20, fontSize:"0.68rem", fontWeight:700, whiteSpace:"nowrap" }}>
                      {entry.entry_type==="Home Service"?"Home":"Salon"}
                    </span>
                  </td>
                  <td style={{ padding:"10px 14px" }}><p style={{ fontWeight:600, color:"var(--text-primary)" }}>{fmtDate(entry.date)}</p><p style={{ fontSize:"0.72rem", color:"var(--text-secondary)", marginTop:2 }}>{entry.start_time}</p></td>
                  <td style={{ padding:"10px 14px" }}><p style={{ fontWeight:600, color:"var(--text-primary)", textDecoration:entry.status==="Cancelled"?"line-through":"none" }}>{entry.customer_name}</p><p style={{ fontSize:"0.72rem", color:"var(--text-secondary)" }}>{entry.phone}</p></td>
                  <td style={{ padding:"10px 14px", color:"var(--text-secondary)", maxWidth:160 }}>{entry.services}</td>
                  <td style={{ padding:"10px 14px", color:"var(--text-primary)" }}>{entry.staff_name}</td>
                  <td style={{ padding:"10px 14px" }}><StatusBadge status={entry.status}/></td>
                  <td style={{ padding:"10px 14px", fontWeight:700, color:"var(--gold-primary)" }}>{entry.price>0?`₹${entry.price.toLocaleString("en-IN")}`:"--"}</td>
                  <td style={{ padding:"10px 14px", textAlign:"right" }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                      <button
                        onClick={(e)=>{ e.stopPropagation(); setEditingBooking(entry); }}
                        title="Edit Booking"
                        style={{ width:28, height:28, borderRadius:6, border:"1px solid var(--border-subtle)", background:"var(--bg-elevated)", color:"var(--gold-primary)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                      >
                        <Edit2 size={12}/>
                      </button>
                      <button
                        onClick={(e)=>{ e.stopPropagation(); handleCancelBooking(entry); }}
                        title={entry.status==="Cancelled"?"Reopen Booking":"Cancel Booking"}
                        style={{ width:28, height:28, borderRadius:6, border:entry.status==="Cancelled"?"1px solid rgba(16,185,129,0.3)":"1px solid rgba(239,68,68,0.25)", background:entry.status==="Cancelled"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", color:entry.status==="Cancelled"?"#34d399":"#f87171", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
                      >
                        {entry.status==="Cancelled"?<RotateCcw size={12}/>:<XCircle size={12}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!allEntries.length&&<p style={{ textAlign:"center", padding:"32px 0", color:"var(--text-muted)", fontSize:"0.85rem" }}>No customer schedules yet.</p>}
        </div>
      </div>

      {editingBooking && (
        <EditScheduleModal
          booking={editingBooking}
          employees={employees}
          onClose={()=>setEditingBooking(null)}
          onSave={handleSaveEdit}
        />
      )}


      {toast&&(
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", alignItems:"center", gap:10, background:toast.type==="error"?"#dc2626":"var(--gold-gradient)", color:toast.type==="error"?"#fff":"#0b0c10", borderRadius:14, padding:"12px 18px", fontSize:"0.82rem", fontWeight:700, boxShadow:"0 8px 30px rgba(0,0,0,0.4)" }}>
          {toast.type==="error"?<AlertCircle size={18}/>:<CheckCircle2 size={18}/>}{toast.message}
        </div>
      )}
    </div>
  );
};

export default HomeServicesView;