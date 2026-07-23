import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL + "/api";
const getToken = () => localStorage.getItem("proptrack_token");

const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const IconInbox = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.72a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
  </svg>
);

const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const IconWhatsApp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const IconLocation = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const STATUS_COLORS = {
  pending:  { bg: "var(--warning-dim)",  color: "var(--warning)",  border: "rgba(245,158,11,0.15)"  },
  confirmed:{ bg: "var(--accent-dim)",   color: "var(--accent)",   border: "var(--border-accent)"   },
  rejected: { bg: "var(--danger-dim)",   color: "var(--danger)",   border: "rgba(255,77,109,0.15)"  },
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—";
const formatPrice = (p) => p ? `KES ${Number(p).toLocaleString()}` : "—";

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/inquiries");
      setInquiries(Array.isArray(data) ? data : []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await apiFetch(`/inquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch {
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? inquiries : inquiries.filter(i => i.status === filter);

  const counts = {
    all: inquiries.length,
    pending: inquiries.filter(i => i.status === "pending").length,
    confirmed: inquiries.filter(i => i.status === "confirmed").length,
    rejected: inquiries.filter(i => i.status === "rejected").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Inquiries</h1>
          <p className="page-subtitle">Viewing requests from prospective tenants</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: "Total", value: counts.all, cls: "blue" },
          { label: "Pending", value: counts.pending, cls: "warning" },
          { label: "Confirmed", value: counts.confirmed, cls: "accent" },
          { label: "Rejected", value: counts.rejected, cls: "danger" },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-glow" />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {["all", "pending", "confirmed", "rejected"].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={filter === tab ? "btn btn-primary" : "btn btn-ghost"}
            style={{ fontSize: 12, padding: "7px 16px", textTransform: "capitalize" }}
          >
            {tab} {counts[tab] > 0 && <span style={{
              background: filter === tab ? "rgba(0,0,0,0.2)" : "var(--bg-elevated)",
              borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 800, marginLeft: 4
            }}>{counts[tab]}</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card" style={{ height: 100,
              backgroundImage: "linear-gradient(90deg,var(--bg-card) 25%,var(--bg-elevated) 50%,var(--bg-card) 75%)",
              backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ color: "var(--text-muted)", display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <IconInbox />
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 900, color: "var(--text-primary)", marginBottom: 6 }}>
            No {filter !== "all" ? filter : ""} inquiries yet
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            When tenants request viewings from your listings, they'll appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(inquiry => {
            const s = STATUS_COLORS[inquiry.status] || STATUS_COLORS.pending;
            return (
              <div key={inquiry.id} className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>

                  {/* Left — Tenant + Listing Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      {/* Avatar */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "var(--accent-dim)", color: "var(--accent)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 15, flexShrink: 0
                      }}>
                        {inquiry.tenant_name?.[0]?.toUpperCase() || "T"}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                          {inquiry.tenant_name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Submitted {formatDate(inquiry.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Listing */}
                    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 12px", marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                        {inquiry.listing_title || "Listing"}
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        {inquiry.listing_location && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-secondary)" }}>
                            <IconLocation /> {inquiry.listing_location}
                          </span>
                        )}
                        {inquiry.listing_price && (
                          <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>
                            {formatPrice(inquiry.listing_price)}/mo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact + Viewing Date */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: inquiry.message ? 10 : 0 }}>
                      {inquiry.tenant_email && (
                        <a href={`mailto:${inquiry.tenant_email}`} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-secondary)", textDecoration: "none" }}>
                          <IconMail /> {inquiry.tenant_email}
                        </a>
                      )}
                      {inquiry.tenant_phone && (
                        <a href={`tel:${inquiry.tenant_phone}`} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-secondary)", textDecoration: "none" }}>
                          <IconPhone /> {inquiry.tenant_phone}
                        </a>
                      )}
                      {inquiry.viewing_date && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--accent-2)" }}>
                          <IconCalendar /> Viewing: {formatDate(inquiry.viewing_date)}
                        </span>
                      )}
                    </div>

                    {inquiry.message && (
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic", padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", borderLeft: "3px solid var(--border-accent)" }}>
                        "{inquiry.message}"
                      </div>
                    )}
                  </div>

                  {/* Right — Status + Actions */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                    <span style={{
                      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 800, textTransform: "capitalize"
                    }}>
                      {inquiry.status}
                    </span>

                    {/* WhatsApp */}
                    {inquiry.tenant_phone && (
                      <a
                        href={`https://wa.me/254${inquiry.tenant_phone?.replace(/^0/, "")}?text=Hi ${inquiry.tenant_name?.split(" ")[0]}, regarding your viewing request for ${inquiry.listing_title}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: "6px 12px", color: "#25D366", borderColor: "rgba(37,211,102,0.3)", textDecoration: "none" }}
                      >
                        <IconWhatsApp /> WhatsApp
                      </a>
                    )}

                    {/* Status Actions */}
                    {inquiry.status === "pending" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: 11, padding: "6px 12px", color: "var(--danger)", borderColor: "rgba(255,77,109,0.3)" }}
                          disabled={updating === inquiry.id}
                          onClick={() => updateStatus(inquiry.id, "rejected")}
                        >
                          Decline
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: 11, padding: "6px 12px" }}
                          disabled={updating === inquiry.id}
                          onClick={() => updateStatus(inquiry.id, "confirmed")}
                        >
                          {updating === inquiry.id ? "..." : "Confirm"}
                        </button>
                      </div>
                    )}

                    {inquiry.status !== "pending" && (
                      <button
                        className="btn btn-ghost"
                        style={{ fontSize: 11, padding: "6px 12px" }}
                        disabled={updating === inquiry.id}
                        onClick={() => updateStatus(inquiry.id, "pending")}
                      >
                        Reset to Pending
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}