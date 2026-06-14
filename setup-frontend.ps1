# Run this from inside C:\Users\popze\Desktop\PropTrack
# It creates/overwrites all the new files for Search, Settings, Theme, and Listings with images

New-Item -ItemType Directory -Force -Path "src\context" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "src\components" | Out-Null

Write-Host "Writing src\context\ThemeContext.jsx..."
@'
import { createContext, useContext, useState, useEffect } from "react";

// 10 hand-picked "married" color combos — accent + secondary accent
export const THEMES = [
  {
    id: "emerald-sky",
    name: "Emerald & Sky",
    accent: "0, 229, 160",
    accent2: "14, 165, 233",
  },
  {
    id: "violet-amber",
    name: "Violet & Amber",
    accent: "139, 92, 246",
    accent2: "245, 158, 11",
  },
  {
    id: "rose-teal",
    name: "Rose & Teal",
    accent: "244, 63, 94",
    accent2: "20, 184, 166",
  },
  {
    id: "orange-indigo",
    name: "Orange & Indigo",
    accent: "251, 146, 60",
    accent2: "99, 102, 241",
  },
  {
    id: "cyan-pink",
    name: "Cyan & Pink",
    accent: "34, 211, 238",
    accent2: "236, 72, 153",
  },
  {
    id: "lime-purple",
    name: "Lime & Purple",
    accent: "163, 230, 53",
    accent2: "168, 85, 247",
  },
  {
    id: "crimson-gold",
    name: "Crimson & Gold",
    accent: "239, 68, 68",
    accent2: "234, 179, 8",
  },
  {
    id: "blue-coral",
    name: "Blue & Coral",
    accent: "59, 130, 246",
    accent2: "251, 113, 133",
  },
  {
    id: "mint-plum",
    name: "Mint & Plum",
    accent: "52, 211, 153",
    accent2: "192, 132, 252",
  },
  {
    id: "gold-periwinkle",
    name: "Gold & Periwinkle",
    accent: "250, 204, 21",
    accent2: "129, 140, 248",
  },
];

const ThemeContext = createContext(null);

const rgb = (v) => `rgb(${v})`;
const rgba = (v, a) => `rgba(${v}, ${a})`;

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.style.setProperty("--accent", rgb(theme.accent));
  root.style.setProperty("--accent-2", rgb(theme.accent2));
  root.style.setProperty("--accent-dim", rgba(theme.accent, 0.08));
  root.style.setProperty("--accent-dim-2", rgba(theme.accent2, 0.08));
  root.style.setProperty("--accent-glow", rgba(theme.accent, 0.25));
  root.style.setProperty("--accent-glow-2", rgba(theme.accent2, 0.25));
  root.style.setProperty("--border-accent", rgba(theme.accent, 0.2));
};

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem("proptrack_theme") || "emerald-sky";
  });

  useEffect(() => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    applyTheme(theme);
    localStorage.setItem("proptrack_theme", themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

'@ | Set-Content -Path "src\context\ThemeContext.jsx" -Encoding UTF8

Write-Host "Writing src\pages\Settings.jsx..."
@'
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { themeId, setThemeId, themes } = useTheme();
  const { agent } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize PropTrack to match your style</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
          Account
        </h2>
        <div className="grid-2">
          <div className="form-group">
            <label>Name</label>
            <input className="input" value={agent?.name || ""} disabled />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" value={agent?.email || ""} disabled />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <span className="badge badge-success">{agent?.plan} Plan</span>
        </div>
      </div>

      {/* Theme Picker */}
      <div className="card">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
          Color Theme
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
          Choose an accent color pairing. Changes apply instantly across the whole app.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14
        }}>
          {themes.map(t => {
            const isActive = themeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 16,
                  borderRadius: 12,
                  border: isActive ? `2px solid rgb(${t.accent})` : "1px solid var(--border)",
                  background: isActive ? `rgba(${t.accent}, 0.06)` : "var(--bg-secondary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                {isActive && (
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    fontSize: 11, fontWeight: 800, color: `rgb(${t.accent})`
                  }}>
                    &#10003;
                  </span>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `rgb(${t.accent})`,
                    boxShadow: `0 0 16px rgba(${t.accent}, 0.4)`
                  }} />
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `rgb(${t.accent2})`,
                    boxShadow: `0 0 16px rgba(${t.accent2}, 0.4)`
                  }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {t.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

'@ | Set-Content -Path "src\pages\Settings.jsx" -Encoding UTF8

Write-Host "Writing src\pages\Search.jsx..."
@'
import { useState } from "react";

const API = "https://proptrack-backend-production-a3e9.up.railway.app/api";
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

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("tenants");

  const runSearch = async (q) => {
    setQuery(q);
    if (!q || q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch(`/search?q=${encodeURIComponent(q.trim())}`);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Search</h1>
          <p className="page-subtitle">Find tenants, units, and past payments instantly</p>
        </div>
      </div>

      <div className="search-bar" style={{ width: "100%", maxWidth: 480, marginBottom: 28 }}>
        <span style={{ color: "var(--text-muted)" }}>&#128269;</span>
        <input
          autoFocus
          placeholder="Search by tenant name, phone, unit, or M-Pesa code..."
          value={query}
          onChange={e => runSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Searching...</div>
      )}

      {!loading && query.length >= 2 && results && (
        <>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              className={tab === "tenants" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("tenants")}
            >
              Tenants ({results.tenants.length})
            </button>
            <button
              className={tab === "payments" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("payments")}
            >
              Payments ({results.payments.length})
            </button>
          </div>

          {/* Tenants Results */}
          {tab === "tenants" && (
            results.tenants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">&#128269;</div>
                <div className="empty-state-title">No tenants found</div>
                <p>Try a different name, phone number, or unit</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Property</th>
                      <th>Unit</th>
                      <th>Phone</th>
                      <th>Rent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.tenants.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.name}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{t.property_name || "—"}</td>
                        <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{t.unit_number}</span></td>
                        <td style={{ color: "var(--text-secondary)" }}>{t.phone}</td>
                        <td style={{ fontWeight: 600 }}>Ksh {Number(t.rent_amount || 0).toLocaleString()}</td>
                        <td>
                          <span className={`badge badge-${t.status === "paid" ? "success" : t.status === "arrears" ? "danger" : "warning"}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Payments Results */}
          {tab === "payments" && (
            results.payments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">&#128179;</div>
                <div className="empty-state-title">No payments found</div>
                <p>Try searching by M-Pesa transaction code, tenant name, or phone</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Unit</th>
                      <th>M-Pesa Code</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.payments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.tenant || "—"}</td>
                        <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{p.unit || "—"}</span></td>
                        <td>
                          <span style={{
                            fontFamily: "monospace", fontSize: 12,
                            background: "var(--bg-secondary)", padding: "3px 8px",
                            borderRadius: 4, color: "var(--text-secondary)"
                          }}>{p.transaction_id}</span>
                        </td>
                        <td style={{ fontWeight: 700 }}>Ksh {Number(p.amount).toLocaleString()}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                          {new Date(p.paid_at).toLocaleDateString("en-KE")}
                        </td>
                        <td>
                          <span className={`badge badge-${p.status === "verified" ? "success" : p.status === "failed" ? "danger" : "warning"}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {!loading && query.length > 0 && query.length < 2 && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Type at least 2 characters to search</div>
      )}

      {query.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">&#128269;</div>
          <div className="empty-state-title">Search PropTrack</div>
          <p>Find any tenant, unit, or payment by typing above</p>
        </div>
      )}
    </div>
  );
}

'@ | Set-Content -Path "src\pages\Search.jsx" -Encoding UTF8

Write-Host "Writing src\pages\Listings.jsx..."
@'
import { useState, useEffect, useRef } from "react";

const API = "https://proptrack-backend-production-a3e9.up.railway.app/api";
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

const EMPTY = { title: "", location: "", rent: "", type: "Apartment", beds: 1, baths: 1, description: "", contact: "", image_url: "" };

// Resize + compress image client-side before converting to base64
const fileToCompressedBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [copied, setCopied] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    apiFetch("/listings")
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const available = listings.filter(l => l.status === "available").length;

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToCompressedBase64(file);
      setForm(f => ({ ...f, image_url: base64 }));
    } catch (err) {
      alert("Failed to process image");
    }
    setUploading(false);
  };

  const addListing = async () => {
    if (!form.title || !form.location || !form.rent) return;
    try {
      const newListing = await apiFetch("/listings", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setListings([newListing, ...listings]);
      setForm(EMPTY);
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (listing) => {
    const newStatus = listing.status === "available" ? "taken" : "available";
    try {
      const updated = await apiFetch(`/listings/${listing.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      setListings(listings.map(l => l.id === listing.id ? updated : l));
    } catch (err) {
      alert(err.message);
    }
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`https://proptrack.co.ke/listings/${id}`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div style={{ padding: 40, color: "var(--text-secondary)" }}>Loading listings...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Listings</h1>
          <p className="page-subtitle">{available} units available for rent</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Post Listing
        </button>
      </div>

      {listings.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">&#127968;</div>
          <div className="empty-state-title">No listings yet</div>
          <p>Post your first vacant unit to start attracting tenants</p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {listings.map(l => (
          <div key={l.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            {/* Image */}
            <div style={{
              width: "100%", height: 160,
              background: l.image_url
                ? `url(${l.image_url}) center/cover no-repeat`
                : "linear-gradient(135deg, var(--accent-dim), var(--bg-secondary))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, position: "relative"
            }}>
              {!l.image_url && "&#127968;".replace("&#127968;", "🏠")}
              <div style={{ position: "absolute", top: 12, right: 12 }}>
                <span className={`badge badge-${l.status === "available" ? "success" : "neutral"}`}>
                  {l.status === "available" ? "Available" : "Taken"}
                </span>
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                {l.title}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 12 }}>
                📍 {l.location}
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>🛏 {l.beds} Bed</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>🚿 {l.baths} Bath</span>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>🏗 {l.type}</span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--font-display)", marginBottom: 8 }}>
                Ksh {Number(l.rent).toLocaleString()}
                <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" }}>/mo</span>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, lineHeight: 1.5 }}>
                {l.description}
              </p>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: "center" }}
                  onClick={() => copyLink(l.id)}>
                  {copied === l.id ? "✓ Copied!" : "🔗 Share Link"}
                </button>
                <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12, justifyContent: "center" }}
                  onClick={() => toggleStatus(l)}>
                  {l.status === "available" ? "Mark Taken" : "Mark Available"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Listing Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Post New Listing</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Image Upload */}
              <div className="form-group">
                <label>Property Photo</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%", height: 140, borderRadius: 10,
                    border: "1px dashed var(--border)",
                    background: form.image_url
                      ? `url(${form.image_url}) center/cover no-repeat`
                      : "var(--bg-secondary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", position: "relative", overflow: "hidden"
                  }}
                >
                  {!form.image_url && (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                      {uploading ? "Processing image..." : "Click to upload a photo"}
                    </div>
                  )}
                  {form.image_url && (
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      background: "rgba(0,0,0,0.6)", borderRadius: 6,
                      padding: "4px 8px", fontSize: 11, color: "#fff"
                    }}>
                      Change photo
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />
              </div>

              <div className="form-group">
                <label>Property Title</label>
                <input className="input" placeholder="e.g. 2 Bedroom Apartment" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Location</label>
                  <input className="input" placeholder="e.g. Kasarani, Nairobi" value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Monthly Rent (Ksh)</label>
                  <input className="input" type="number" placeholder="e.g. 15000" value={form.rent}
                    onChange={e => setForm({ ...form, rent: e.target.value })} />
                </div>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label>Type</label>
                  <select className="input" value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option>Apartment</option>
                    <option>Bedsitter</option>
                    <option>Studio</option>
                    <option>Maisonette</option>
                    <option>Bungalow</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input className="input" type="number" min="1" value={form.beds}
                    onChange={e => setForm({ ...form, beds: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Bathrooms</label>
                  <input className="input" type="number" min="1" value={form.baths}
                    onChange={e => setForm({ ...form, baths: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input" rows={3} placeholder="Describe the property..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ resize: "vertical" }} />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input className="input" placeholder="07XXXXXXXX" value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addListing} disabled={uploading}>
                Post Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'@ | Set-Content -Path "src\pages\Listings.jsx" -Encoding UTF8

Write-Host "Writing src\App.jsx..."
@'
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Payments from "./pages/Payments";
import Listings from "./pages/Listings";
import Reminders from "./pages/Reminders";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import "./App.css";

function AppContent() {
  const { agent, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");

  if (!agent) return <Auth />;

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":   return <Dashboard />;
      case "properties":  return <Properties />;
      case "tenants":     return <Tenants />;
      case "payments":    return <Payments />;
      case "listings":    return <Listings />;
      case "reminders":   return <Reminders />;
      case "search":      return <Search />;
      case "settings":    return <Settings />;
      default:            return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} agent={agent} logout={logout} />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

'@ | Set-Content -Path "src\App.jsx" -Encoding UTF8

Write-Host "Writing src\components\Sidebar.jsx..."
@'
import "./Sidebar.css";

const NAV = [
  { id: "dashboard", icon: "⊞", label: "Dashboard" },
  { id: "search", icon: "🔍", label: "Search" },
  { id: "properties", icon: "🏢", label: "Properties" },
  { id: "tenants", icon: "👥", label: "Tenants" },
  { id: "payments", icon: "💳", label: "Payments" },
  { id: "listings", icon: "🏠", label: "Listings" },
  { id: "reminders", icon: "🔔", label: "Reminders" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar({ activePage, setActivePage, agent, logout }) {
  const initials = agent?.name
    ? agent.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "AG";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">P</span>
        <div>
          <div className="logo-name">PropTrack</div>
          <div className="logo-tag">Property Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {NAV.map((item, i) => (
          <div key={item.id}>
            {i === 4 && <div className="nav-divider" />}
            {i === 7 && <div className="nav-divider" />}
            <button
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activePage === item.id && <span className="nav-dot" />}
            </button>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="agent-card">
          <div className="agent-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="agent-name">{agent?.name}</div>
            <div className="agent-plan">{agent?.plan} Plan</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">⏏</button>
        </div>
      </div>
    </aside>
  );
}

'@ | Set-Content -Path "src\components\Sidebar.jsx" -Encoding UTF8

Write-Host "Done! All frontend files updated." -ForegroundColor Green
