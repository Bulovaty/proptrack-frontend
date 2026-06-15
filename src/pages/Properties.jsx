import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";
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

const EMPTY_PROPERTY = { name: "", location: "", total_units: "", description: "" };

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showUnits, setShowUnits] = useState(null);
  const [form, setForm] = useState(EMPTY_PROPERTY);
  const [unitNames, setUnitNames] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/properties")
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleTotalUnitsChange = (val) => {
    const num = parseInt(val) || 0;
    setForm({ ...form, total_units: val });
    const newNames = Array.from({ length: Math.min(num, 100) }, (_, i) =>
      unitNames[i] || `Unit ${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`
    );
    setUnitNames(newNames);
  };

  const addProperty = async () => {
    if (!form.name || !form.location || !form.total_units) return;
    setSaving(true);
    try {
      const newProp = await apiFetch("/properties", {
        method: "POST",
        body: JSON.stringify({ ...form, unit_names: unitNames }),
      });
      setProperties([newProp, ...properties]);
      setForm(EMPTY_PROPERTY);
      setUnitNames([""]);
      setShowAdd(false);
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const deleteProperty = async (id) => {
    if (!window.confirm("Delete this property and all its units?")) return;
    try {
      await apiFetch(`/properties/${id}`, { method: "DELETE" });
      setProperties(properties.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div style={{ padding: 40, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 16, height: 16, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Loading properties...
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Properties</h1>
          <p className="page-subtitle">
            {properties.length} properties &middot; {properties.reduce((s, p) => s + Number(p.total_units || 0), 0)} total units
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Property
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <div className="search-bar">
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>&#128269;</span>
          <input
            placeholder="Search by name or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 28 }}>
        <div className="stat-card blue">
          <div className="stat-glow" />
          <div className="stat-label">Total Properties</div>
          <div className="stat-value">{properties.length}</div>
          <div className="stat-sub">Under management</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-glow" />
          <div className="stat-label">Total Units</div>
          <div className="stat-value">{properties.reduce((s, p) => s + Number(p.total_units || 0), 0)}</div>
          <div className="stat-sub">Across all properties</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Occupied Units</div>
          <div className="stat-value">{properties.reduce((s, p) => s + Number(p.occupied_units || 0), 0)}</div>
          <div className="stat-sub">With active tenants</div>
        </div>
      </div>

      {/* Properties Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#127962;</div>
          <div className="empty-state-title">No properties yet</div>
          <p>Add your first property to start managing units and tenants</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>
            + Add Your First Property
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {filtered.map(p => (
            <div key={p.id} className="card property-card">

              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "linear-gradient(135deg, var(--accent-dim), var(--accent-dim-2))",
                  border: "1px solid var(--border-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0
                }}>&#127962;</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "5px 10px", fontSize: 12 }}
                    onClick={() => setShowUnits(p)}
                  >
                    View Units
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "5px 10px", fontSize: 12 }}
                    onClick={() => deleteProperty(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Property Info */}
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 4 }}>
                {p.name}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                &#128205; {p.location}
              </div>

              {p.description && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.6 }}>
                  {p.description}
                </p>
              )}

              {/* Unit Stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8, padding: "14px 0", borderTop: "1px solid var(--border)"
              }}>
                {[
                  ["Total", p.total_units, "var(--text-primary)"],
                  ["Occupied", p.occupied_units || 0, "var(--accent)"],
                  ["Vacant", Number(p.total_units) - Number(p.occupied_units || 0), "var(--warning)"],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900, color, letterSpacing: "-0.02em" }}>
                      {val}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginTop: 2 }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Unit Names Preview */}
              {p.unit_names && p.unit_names.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>
                    Units
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {p.unit_names.slice(0, 12).map((u, i) => (
                      <span key={i} style={{
                        padding: "3px 8px", borderRadius: 5,
                        background: "var(--bg-secondary)", border: "1px solid var(--border)",
                        fontSize: 11, fontFamily: "monospace", color: "var(--accent)", fontWeight: 700
                      }}>{u}</span>
                    ))}
                    {p.unit_names.length > 12 && (
                      <span style={{ padding: "3px 8px", fontSize: 11, color: "var(--text-muted)" }}>
                        +{p.unit_names.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">&#127962; Add New Property</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label>Property Name</label>
                <input
                  className="input"
                  placeholder="e.g. Sunrise Apartments"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  className="input"
                  placeholder="e.g. Kasarani, Nairobi"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Total Number of Units</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 12"
                  value={form.total_units}
                  onChange={e => handleTotalUnitsChange(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Brief description of the property..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Unit Names */}
              {unitNames.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Name Your Units ({unitNames.length})
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: 8, maxHeight: 200, overflowY: "auto", padding: 4
                  }}>
                    {unitNames.map((name, i) => (
                      <input
                        key={i}
                        className="input"
                        value={name}
                        onChange={e => {
                          const updated = [...unitNames];
                          updated[i] = e.target.value;
                          setUnitNames(updated);
                        }}
                        placeholder={`Unit ${i + 1}`}
                        style={{ fontSize: 12, padding: "8px 10px", textAlign: "center", fontFamily: "monospace" }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addProperty} disabled={saving}>
                {saving ? "Saving..." : "Add Property"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Units Modal */}
      {showUnits && (
        <div className="modal-overlay" onClick={() => setShowUnits(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">&#127962; {showUnits.name}</h2>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
              &#128205; {showUnits.location} &middot; {showUnits.total_units} units total
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 8
            }}>
              {(showUnits.unit_names || []).map((u, i) => (
                <div key={i} style={{
                  padding: "10px 8px", borderRadius: 8, textAlign: "center",
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  fontSize: 12, fontFamily: "monospace", color: "var(--accent)", fontWeight: 700
                }}>{u}</div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowUnits(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .property-card { transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; }
        .property-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.3); border-color: var(--border-accent); }
      `}</style>
    </div>
  );
}
