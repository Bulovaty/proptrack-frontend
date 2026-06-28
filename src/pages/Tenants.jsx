import { useState, useEffect, useRef } from "react";
import { SkeletonTable } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { IconSearch, IconUsers, IconDownload, IconCheck, IconX } from "../components/Icons";

const API = "https://proptrack-backend-production-a3e9.up.railway.app/api";
const getToken = () => localStorage.getItem("proptrack_token");
const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

const EMPTY_FORM = { name: "", phone: "", email: "", property_id: "", unit_id: "", rent_amount: "", move_in_date: "" };

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

  // CSV import state
  const [showImport, setShowImport] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([apiFetch("/tenants"), apiFetch("/properties")])
      .then(([t, p]) => { setTenants(t); setProperties(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePropertyChange = async (propertyId) => {
    setForm(f => ({ ...f, property_id: propertyId, unit_id: "" }));
    if (!propertyId) return setVacantUnits([]);
    try {
      const units = await apiFetch(`/units/vacant/${propertyId}`);
      setVacantUnits(units);
    } catch (err) { console.error(err); }
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
      const newTenant = await apiFetch("/tenants", { method: "POST", body: JSON.stringify(form) });
      setTenants([newTenant, ...tenants]);
      setForm(EMPTY_FORM);
      setVacantUnits([]);
      setShowModal(false);
    } catch (err) { alert(err.message); }
    setSaving(false);
  };

  // ── Download a blank CSV template the agent fills in ─────────────────────
  const downloadTemplate = () => {
    const headers = ["name", "phone", "email", "property_name", "unit_number", "rent_amount", "move_in_date"];
    const example = ["Jane Muthoni", "0712345678", "jane@example.com", "Sunview Apartments", "A01", "12000", "2024-01-01"];
    const csv = [headers, example].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "proptrack_tenants_template.csv";
    a.click(); URL.revokeObjectURL(url);
  };

  // ── Parse uploaded CSV file client-side ───────────────────────────────────
  const handleCSVFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const required = ["name", "phone", "unit_number", "rent_amount"];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length) {
        setCsvErrors([`Missing required columns: ${missing.join(", ")}`]);
        setCsvRows([]);
        return;
      }
      const rows = lines.slice(1).map((line, i) => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const row = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
        const errors = [];
        if (!row.name) errors.push("Name missing");
        if (!row.phone) errors.push("Phone missing");
        if (!row.unit_number) errors.push("Unit number missing");
        if (!row.rent_amount || isNaN(Number(row.rent_amount))) errors.push("Rent amount invalid");
        return { ...row, _row: i + 2, _errors: errors };
      }).filter(r => r.name || r.phone); // skip blank rows
      setCsvRows(rows);
      setCsvErrors([]);
      setImportDone(null);
    };
    reader.readAsText(file);
    e.target.value = ""; // reset so same file can be re-uploaded
  };

  // ── Send parsed rows to backend for bulk insert ───────────────────────────
  const runImport = async () => {
    const valid = csvRows.filter(r => r._errors.length === 0);
    if (!valid.length) return;
    setImporting(true);
    try {
      const result = await apiFetch("/tenants/import", {
        method: "POST",
        body: JSON.stringify({ tenants: valid }),
      });
      setImportDone(result);
      // Refresh tenant list
      apiFetch("/tenants").then(setTenants).catch(console.error);
    } catch (err) {
      alert("Import failed: " + err.message);
    }
    setImporting(false);
  };

  if (loading) return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Tenants</h1></div>
      </div>
      <SkeletonTable rows={5} cols={6} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">{tenants.length} tenants across all units</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => { setShowImport(true); setCsvRows([]); setImportDone(null); }} style={{ gap: 6 }}>
            <IconDownload size={14} /> Import CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Tenant</button>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="search-bar">
          <span style={{ color: "var(--text-muted)", display: "flex" }}><IconSearch size={15} /></span>
          <input placeholder="Search by name, unit or phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {tenants.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={36} />}
          title="No tenants yet"
          subtitle="Add your first tenant by selecting a property and unit"
          action="+ Add Tenant"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tenant</th><th>Unit</th><th>Phone</th>
                <th>Monthly Rent</th><th>Arrears</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{t.name[0]}</div>
                      <span style={{ fontWeight: 600 }}>{t.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--accent)" }}>{t.unit_number}</span></td>
                  <td style={{ color: "var(--text-secondary)" }}>{t.phone}</td>
                  <td style={{ fontWeight: 600 }}>Ksh {Number(t.rent_amount).toLocaleString()}</td>
                  <td style={{ color: t.arrears > 0 ? "var(--danger)" : "var(--text-muted)", fontWeight: t.arrears > 0 ? 700 : 400 }}>
                    {t.arrears > 0 ? `Ksh ${Number(t.arrears).toLocaleString()}` : "\u2014"}
                  </td>
                  <td>
                    <span className={`badge badge-${t.status === "paid" ? "success" : t.status === "arrears" ? "danger" : "warning"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setSelected(t)}>View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && tenants.length > 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No tenants match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add New Tenant</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="input" placeholder="e.g. James Mwangi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input className="input" placeholder="07XXXXXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email (optional)</label>
                  <input className="input" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Select Property</label>
                <select className="input" value={form.property_id} onChange={e => handlePropertyChange(e.target.value)}>
                  <option value="">-- Select a property --</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name} &mdash; {p.location}</option>)}
                </select>
              </div>
              {form.property_id && (
                <div className="form-group">
                  <label>Select Unit</label>
                  <select className="input" value={form.unit_id} onChange={e => setForm({ ...form, unit_id: e.target.value })}>
                    <option value="">-- Select a vacant unit --</option>
                    {vacantUnits.map(u => <option key={u.id} value={u.id}>{u.unit_number}</option>)}
                  </select>
                  {vacantUnits.length === 0 && <span style={{ fontSize: 12, color: "var(--danger)" }}>No vacant units in this property</span>}
                </div>
              )}
              <div className="grid-2">
                <div className="form-group">
                  <label>Monthly Rent (Ksh)</label>
                  <input className="input" type="number" placeholder="e.g. 12000" value={form.rent_amount} onChange={e => setForm({ ...form, rent_amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Move-in Date</label>
                  <input className="input" type="date" value={form.move_in_date} onChange={e => setForm({ ...form, move_in_date: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addTenant} disabled={saving}>{saving ? "Adding..." : "Add Tenant"}</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Tenant Profile</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Full Name", selected.name],
                ["Unit", selected.unit_number],
                ["Phone", selected.phone],
                ["Email", selected.email || "\u2014"],
                ["Monthly Rent", `Ksh ${Number(selected.rent_amount).toLocaleString()}`],
                ["Arrears", selected.arrears > 0 ? `Ksh ${Number(selected.arrears).toLocaleString()}` : "None"],
                ["Move-in Date", selected.move_in_date?.split("T")[0] || "\u2014"],
                ["Status", selected.status?.toUpperCase()],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
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

      {/* Hidden file input for CSV upload */}
      <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCSVFile} />

      {/* ── CSV Import Modal ── */}
      {showImport && (
        <div className="modal-overlay" onClick={() => setShowImport(false)}>
          <div className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Import Tenants from CSV</h2>

            {importDone ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ color: "var(--accent)", display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <IconCheck size={44} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Import Complete</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  <strong>{importDone.imported}</strong> tenants added
                  {importDone.skipped > 0 && <span style={{ color: "var(--warning)" }}> &middot; {importDone.skipped} skipped</span>}
                </div>
                <button className="btn btn-ghost" style={{ marginTop: 20 }}
                  onClick={() => { setShowImport(false); setCsvRows([]); setImportDone(null); }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Step 1 — Download template */}
                <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Step 1 — Download the template</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
                    Fill it in with your tenant data in Excel or Google Sheets, then upload it below.
                    Required columns: <code>name</code>, <code>phone</code>, <code>unit_number</code>, <code>rent_amount</code>.
                    Optional: <code>email</code>, <code>property_name</code>, <code>move_in_date</code>.
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: 12, gap: 6 }} onClick={downloadTemplate}>
                    <IconDownload size={13} /> Download Template (CSV)
                  </button>
                </div>

                {/* Step 2 — Upload */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Step 2 — Upload your filled CSV</div>
                  <button className="btn btn-ghost" style={{ fontSize: 13, gap: 6 }} onClick={() => fileRef.current?.click()}>
                    <IconDownload size={14} style={{ transform: "rotate(180deg)" }} /> Choose CSV File
                  </button>
                </div>

                {/* CSV errors */}
                {csvErrors.length > 0 && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--danger-dim)", color: "var(--danger)", fontSize: 13, border: "1px solid rgba(255,77,109,0.2)", marginBottom: 16 }}>
                    {csvErrors.map((e, i) => <div key={i}>{e}</div>)}
                  </div>
                )}

                {/* Preview table */}
                {csvRows.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        Preview — {csvRows.filter(r => r._errors.length === 0).length} valid / {csvRows.filter(r => r._errors.length > 0).length} with errors
                      </div>
                    </div>
                    <div style={{ maxHeight: 240, overflowY: "auto", borderRadius: 8, border: "1px solid var(--border)" }}>
                      <table style={{ width: "100%", fontSize: 12 }}>
                        <thead>
                          <tr>
                            <th style={{ padding: "8px 10px", textAlign: "left", background: "var(--bg-secondary)", fontWeight: 700, fontSize: 11 }}>Name</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", background: "var(--bg-secondary)", fontWeight: 700, fontSize: 11 }}>Phone</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", background: "var(--bg-secondary)", fontWeight: 700, fontSize: 11 }}>Unit</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", background: "var(--bg-secondary)", fontWeight: 700, fontSize: 11 }}>Rent</th>
                            <th style={{ padding: "8px 10px", textAlign: "left", background: "var(--bg-secondary)", fontWeight: 700, fontSize: 11 }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvRows.map((r, i) => (
                            <tr key={i} style={{ background: r._errors.length ? "var(--danger-dim)" : "transparent" }}>
                              <td style={{ padding: "7px 10px" }}>{r.name}</td>
                              <td style={{ padding: "7px 10px" }}>{r.phone}</td>
                              <td style={{ padding: "7px 10px", fontFamily: "monospace", color: "var(--accent)" }}>{r.unit_number}</td>
                              <td style={{ padding: "7px 10px" }}>Ksh {Number(r.rent_amount || 0).toLocaleString()}</td>
                              <td style={{ padding: "7px 10px" }}>
                                {r._errors.length ? (
                                  <span style={{ color: "var(--danger)", fontSize: 11 }}><IconX size={11} /> {r._errors.join(", ")}</span>
                                ) : (
                                  <span style={{ color: "var(--accent)" }}><IconCheck size={11} /> Ready</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setShowImport(false)}>Cancel</button>
                  {csvRows.length > 0 && (
                    <button className="btn btn-primary" onClick={runImport}
                      disabled={importing || csvRows.filter(r => r._errors.length === 0).length === 0}
                      style={{ gap: 6 }}>
                      {importing
                        ? "Importing..."
                        : `Import ${csvRows.filter(r => r._errors.length === 0).length} Tenants`}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}