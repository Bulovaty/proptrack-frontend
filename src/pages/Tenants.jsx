import { useState, useEffect } from "react";
import { apiGetTenants, apiAddTenant } from "../api";

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

const EMPTY_FORM = {
  name: "", phone: "", email: "",
  property_id: "", unit_id: "",
  rent_amount: "", move_in_date: ""
};

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [vacantUnits, setVacantUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch("/tenants"),
      apiFetch("/properties")
    ])
      .then(([t, p]) => { setTenants(t); setProperties(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // When agent selects a property, load its vacant units
  const handlePropertyChange = async (propertyId) => {
    setForm(f => ({ ...f, property_id: propertyId, unit_id: "" }));
    if (!propertyId) return setVacantUnits([]);
    try {
      const units = await apiFetch(`/units/vacant/${propertyId}`);
      setVacantUnits(units);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.unit_number || "").toLowerCase().includes(search.toLowerCase()) ||
    t.phone.includes(search)
  );

  const addTenant = async () => {
    if (!form.name || !form.phone || !form.unit_id || !form.rent_amount) return;
    setSaving(true);
    try {
      const newTenant = await apiFetch("/tenants", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setTenants([newTenant, ...tenants]);
      setForm(EMPTY_FORM);
      setVacantUnits([]);
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ padding: 40, color: "var(--text-secondary)" }}>
      Loading tenants...
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">{tenants.length} tenants across all units</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Tenant
        </button>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div className="search-bar">
          <span style={{ color: "var(--text-muted)" }}>&#128269;</span>
          <input
            placeholder="Search by name, unit or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Unit</th>
              <th>Phone</th>
              <th>Monthly Rent</th>
              <th>Arrears</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: "var(--accent-dim)", color: "var(--accent)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 800, fontSize: 13, flexShrink: 0
                    }}>{t.name[0]}</div>
                    <span style={{ fontWeight: 600 }}>{t.name}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent)" }}>
                    {t.unit_number}
                  </span>
                </td>
                <td style={{ color: "var(--text-secondary)" }}>{t.phone}</td>
                <td style={{ fontWeight: 600 }}>Ksh {Number(t.rent_amount).toLocaleString()}</td>
                <td style={{ color: t.arrears > 0 ? "var(--danger)" : "var(--text-muted)", fontWeight: t.arrears > 0 ? 700 : 400 }}>
                  {t.arrears > 0 ? `Ksh ${Number(t.arrears).toLocaleString()}` : "—"}
                </td>
                <td>
                  <span className={`badge badge-${t.status === "paid" ? "success" : t.status === "arrears" ? "danger" : "warning"}`}>
                    {t.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                    onClick={() => setSelected(t)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                  {tenants.length === 0 ? "No tenants yet — add your first tenant" : "No tenants found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Tenant Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add New Tenant</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div className="form-group">
                <label>Full Name</label>
                <input className="input" placeholder="e.g. James Mwangi"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input className="input" placeholder="07XXXXXXXX"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input className="input" placeholder="email@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>

              {/* Property Dropdown */}
              <div className="form-group">
                <label>Select Property</label>
                <select className="input" value={form.property_id}
                  onChange={e => handlePropertyChange(e.target.value)}>
                  <option value="">-- Select a property --</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.location}</option>
                  ))}
                </select>
              </div>

              {/* Unit Dropdown — only shows after property selected */}
              {form.property_id && (
                <div className="form-group">
                  <label>Select Unit</label>
                  <select className="input" value={form.unit_id}
                    onChange={e => setForm({ ...form, unit_id: e.target.value })}>
                    <option value="">-- Select a vacant unit --</option>
                    {vacantUnits.map(u => (
                      <option key={u.id} value={u.id}>{u.unit_number}</option>
                    ))}
                  </select>
                  {vacantUnits.length === 0 && (
                    <span style={{ fontSize: 12, color: "var(--danger)" }}>
                      No vacant units in this property
                    </span>
                  )}
                </div>
              )}

              <div className="grid-2">
                <div className="form-group">
                  <label>Monthly Rent (Ksh)</label>
                  <input className="input" type="number" placeholder="e.g. 12000"
                    value={form.rent_amount}
                    onChange={e => setForm({ ...form, rent_amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Move-in Date</label>
                  <input className="input" type="date"
                    value={form.move_in_date}
                    onChange={e => setForm({ ...form, move_in_date: e.target.value })} />
                </div>
              </div>

            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addTenant} disabled={saving}>
                {saving ? "Adding..." : "Add Tenant"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenant Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Tenant Profile</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Full Name", selected.name],
                ["Unit", selected.unit_number],
                ["Phone", selected.phone],
                ["Email", selected.email || "—"],
                ["Monthly Rent", `Ksh ${Number(selected.rent_amount).toLocaleString()}`],
                ["Arrears", selected.arrears > 0 ? `Ksh ${Number(selected.arrears).toLocaleString()}` : "None"],
                ["Move-in Date", selected.move_in_date?.split("T")[0] || "—"],
                ["Status", selected.status?.toUpperCase()],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: "1px solid var(--border)"
                }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}