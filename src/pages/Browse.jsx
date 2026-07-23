import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL + "/api";

const getToken = () => localStorage.getItem("proptrack_tenant_token");

// Icons
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const IconLocation = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconBed = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
  </svg>
);
const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.72a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z"/>
  </svg>
);
const IconWhatsApp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IconHome = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ min_price: "", max_price: "", bedrooms: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showInquiry, setShowInquiry] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [authMode, setAuthMode] = useState(null); // "login" | "register"
  const [authForm, setAuthForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [inquiry, setInquiry] = useState({ message: "", viewing_date: "" });
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Load tenant from localStorage
  useEffect(() => {
    const token = getToken();
    const saved = localStorage.getItem("proptrack_tenant");
    if (token && saved) setTenant(JSON.parse(saved));
  }, []);

  // Fetch listings
  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.min_price) params.append("min_price", filters.min_price);
      if (filters.max_price) params.append("max_price", filters.max_price);
      if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
      const res = await fetch(`${API}/listings/public?${params}`);
      const data = await res.json();
      setListings(Array.isArray(data) ? data : []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = listings.filter(l =>
    !search ||
    l.title?.toLowerCase().includes(search.toLowerCase()) ||
    l.location?.toLowerCase().includes(search.toLowerCase()) ||
    l.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const endpoint = authMode === "register" ? "/tenant/register" : "/tenant/login";
      const body = authMode === "register"
        ? { full_name: authForm.full_name, email: authForm.email, phone: authForm.phone, password: authForm.password }
        : { email: authForm.email, password: authForm.password };
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Something went wrong"); return; }
      localStorage.setItem("proptrack_tenant_token", data.token);
      localStorage.setItem("proptrack_tenant", JSON.stringify(data.tenant));
      setTenant(data.tenant);
      setAuthMode(null);
      if (selected) setShowInquiry(true);
    } catch {
      setAuthError("Connection error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    setInquiryLoading(true);
    try {
      const res = await fetch(`${API}/listings/public/${selected.id}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(inquiry),
      });
      if (res.ok) {
        setInquirySuccess(true);
        setTimeout(() => { setShowInquiry(false); setInquirySuccess(false); setInquiry({ message: "", viewing_date: "" }); }, 2500);
      }
    } catch { } finally {
      setInquiryLoading(false);
    }
  };

  const openListing = (listing) => {
    setSelected(listing);
  };

  const handleBookViewing = () => {
    if (!tenant) { setAuthMode("login"); }
    else { setShowInquiry(true); }
  };

  const logoutTenant = () => {
    localStorage.removeItem("proptrack_tenant_token");
    localStorage.removeItem("proptrack_tenant");
    setTenant(null);
  };

  const formatPrice = (price) =>
    price ? `KES ${Number(price).toLocaleString()}` : "Price on request";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", fontFamily: "var(--font-body)" }}>

      {/* ── Top Nav ── */}
      <nav style={{
        background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: "var(--accent)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 14, color: "#080c14"
          }}>P</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            PropTrack
          </span>
          <span style={{ fontSize: 11, color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--border-accent)", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>
            Browse
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {tenant ? (
            <>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Hi, {tenant.full_name?.split(" ")[0]}</span>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }} onClick={logoutTenant}>Sign out</button>
            </>
          ) : (
            <>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => { setAuthMode("login"); setSelected(null); }}>Sign in</button>
              <button className="btn btn-primary" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => { setAuthMode("register"); setSelected(null); }}>Create account</button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-elevated) 100%)",
        borderBottom: "1px solid var(--border)", padding: "40px 24px 32px", textAlign: "center"
      }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 10 }}>
          Find Your Next <span style={{ color: "var(--accent)" }}>Home</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>
          Browse verified listings from trusted agents across Kenya
        </p>

        {/* Search + Filter Bar */}
        <div style={{ display: "flex", gap: 10, maxWidth: 600, margin: "0 auto", flexWrap: "wrap" }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <IconSearch />
            <input
              placeholder="Search by location, name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
            <IconFilter /> Filters
            {(filters.min_price || filters.max_price || filters.bedrooms) && (
              <span style={{ background: "var(--accent)", color: "#080c14", borderRadius: "50%", width: 16, height: 16, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>!</span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{
            maxWidth: 600, margin: "12px auto 0", background: "var(--bg-card)",
            border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16,
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, textAlign: "left"
          }}>
            <div className="form-group">
              <label>Min Price (KES)</label>
              <input className="input" placeholder="e.g. 5000" type="number"
                value={filters.min_price} onChange={e => setFilters(f => ({ ...f, min_price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Max Price (KES)</label>
              <input className="input" placeholder="e.g. 50000" type="number"
                value={filters.max_price} onChange={e => setFilters(f => ({ ...f, max_price: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Bedrooms</label>
              <select className="input" value={filters.bedrooms} onChange={e => setFilters(f => ({ ...f, bedrooms: e.target.value }))}>
                <option value="">Any</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>
            <button className="btn btn-ghost" style={{ gridColumn: "span 3", fontSize: 12 }}
              onClick={() => setFilters({ min_price: "", max_price: "", bedrooms: "" })}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Listings Grid ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            {loading ? "Loading..." : `${filtered.length} listing${filtered.length !== 1 ? "s" : ""} found`}
          </span>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ height: 280, background: "var(--bg-card)" }}>
                <div style={{ height: 160, background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", marginBottom: 12,
                  backgroundImage: "linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-hover) 50%,var(--bg-elevated) 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ height: 14, background: "var(--bg-elevated)", borderRadius: 6, marginBottom: 8, width: "70%",
                  backgroundImage: "linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-hover) 50%,var(--bg-elevated) 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ height: 10, background: "var(--bg-elevated)", borderRadius: 6, width: "50%",
                  backgroundImage: "linear-gradient(90deg,var(--bg-elevated) 25%,var(--bg-hover) 50%,var(--bg-elevated) 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ color: "var(--text-muted)", marginBottom: 12 }}><IconHome /></div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", marginBottom: 6 }}>No listings found</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
            {filtered.map(listing => (
              <div key={listing.id} className="card" style={{ cursor: "pointer", padding: 0, overflow: "hidden" }}
                onClick={() => openListing(listing)}>
                {/* Image placeholder */}
                <div style={{
                  height: 160, background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-hover))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", position: "relative"
                }}>
                  <IconHome />
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    background: "var(--accent)", color: "#080c14",
                    fontSize: 11, fontWeight: 800, padding: "3px 10px",
                    borderRadius: 20
                  }}>Available</span>
                </div>

                <div style={{ padding: "14px 16px 16px" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.02em" }}>
                    {listing.title || listing.name || "Untitled Listing"}
                  </h3>

                  {listing.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)", fontSize: 12, marginBottom: 8 }}>
                      <IconLocation /> {listing.location}
                    </div>
                  )}

                  {	listing.beds && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)", fontSize: 12, marginBottom: 10 }}>
                      <IconBed /> {	listing.beds} Bedroom{	listing.beds > 1 ? "s" : ""}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 900, color: "var(--accent)" }}>
                      {formatPrice(listing.rent)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>/month</span>
                  </div>

                  {listing.agent_name && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                      <IconUser /> {listing.agent_name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Listing Detail Modal ── */}
      {selected && !showInquiry && !authMode && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>
                {selected.title || selected.name || "Listing Details"}
              </h2>
              <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setSelected(null)}>
                <IconX />
              </button>
            </div>

            {/* Image */}
            <div style={{
              height: 180, background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-hover))",
              borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--text-muted)", marginBottom: 18
            }}>
              <IconHome />
            </div>

            {/* Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Rent</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: "var(--accent)" }}>{formatPrice(	selected.rent)}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>per month</div>
              </div>
              {	selected.beds && (
                <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Bedrooms</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: "var(--text-primary)" }}>{	selected.beds}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>bedroom{	selected.beds > 1 ? "s" : ""}</div>
                </div>
              )}
            </div>

            {selected.location && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: 13, marginBottom: 12 }}>
                <IconLocation /> {selected.location}
              </div>
            )}

            {selected.description && (
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                {selected.description}
              </p>
            )}

            {/* Agent Info */}
            {selected.agent_name && (
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: 18 }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Listed by</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{selected.agent_name}</div>
                {selected.agent_phone && (
                  <a href={`tel:${selected.agent_phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--accent-2)", textDecoration: "none" }}>
                    <IconPhone /> {selected.agent_phone}
                  </a>
                )}
              </div>
            )}

            <div className="modal-actions">
              {selected.agent_phone && (
                <a
                  href={`https://wa.me/254${selected.agent_phone?.replace(/^0/, "")}?text=Hi, I'm interested in your listing: ${selected.title || selected.name}`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{ color: "#25D366", borderColor: "rgba(37,211,102,0.3)", textDecoration: "none" }}
                >
                  <IconWhatsApp /> WhatsApp Agent
                </a>
              )}
              <button className="btn btn-primary" onClick={handleBookViewing}>
                <IconCalendar /> Book a Viewing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Auth Modal ── */}
      {authMode && (
        <div className="modal-overlay" onClick={() => setAuthMode(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>
                {authMode === "register" ? "Create Account" : "Sign In"}
              </h2>
              <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setAuthMode(null)}><IconX /></button>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
              {authMode === "register" ? "Create a free account to book viewings and inquire about listings." : "Sign in to your tenant account."}
            </p>

            <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {authMode === "register" && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input className="input" placeholder="Your full name" required
                      value={authForm.full_name} onChange={e => setAuthForm(f => ({ ...f, full_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input className="input" placeholder="07XX XXX XXX"
                      value={authForm.phone} onChange={e => setAuthForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Email Address</label>
                <input className="input" type="email" placeholder="your@email.com" required
                  value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="input" type="password" placeholder="••••••••" required
                  value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} />
              </div>

              {authError && (
                <div style={{ background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: 12, color: "var(--danger)" }}>
                  {authError}
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={authLoading} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
                {authLoading ? "Please wait..." : authMode === "register" ? "Create Account" : "Sign In"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-secondary)", marginTop: 16 }}>
              {authMode === "register" ? "Already have an account? " : "Don't have an account? "}
              <button onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}
                style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                {authMode === "register" ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ── Inquiry / Book Viewing Modal ── */}
      {showInquiry && selected && (
        <div className="modal-overlay" onClick={() => setShowInquiry(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 className="modal-title" style={{ marginBottom: 0 }}>Book a Viewing</h2>
              <button className="btn btn-ghost" style={{ padding: 8 }} onClick={() => setShowInquiry(false)}><IconX /></button>
            </div>

            {inquirySuccess ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 900, color: "var(--accent)", marginBottom: 6 }}>Request Sent!</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>The agent will contact you shortly.</p>
              </div>
            ) : (
              <>
                <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 18, fontSize: 12, color: "var(--text-secondary)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>{selected.title || selected.name}</strong> — {formatPrice(	selected.rent)}/mo
                </div>
                <form onSubmit={handleInquiry} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="form-group">
                    <label>Preferred Viewing Date</label>
                    <input className="input" type="date" value={inquiry.viewing_date}
                      onChange={e => setInquiry(i => ({ ...i, viewing_date: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="form-group">
                    <label>Message to Agent (optional)</label>
                    <textarea className="input" placeholder="Any questions or special requests..."
                      value={inquiry.message} onChange={e => setInquiry(i => ({ ...i, message: e.target.value }))} />
                  </div>
                  <div className="modal-actions" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
                    <button className="btn btn-ghost" type="button" onClick={() => setShowInquiry(false)}>Cancel</button>
                    <button className="btn btn-primary" type="submit" disabled={inquiryLoading}>
                      {inquiryLoading ? "Sending..." : "Send Request"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}