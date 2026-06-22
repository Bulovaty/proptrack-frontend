import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { SkeletonTable } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { IconBell, IconSend, IconAlertTriangle, IconCheck, IconUsers, IconLock } from "../components/Icons";

const API = "https://proptrack-backend-production-a3e9.up.railway.app/api";
const getToken = () => localStorage.getItem("proptrack_token");
const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.upgradeRequired = data.upgradeRequired;
    throw err;
  }
  return data;
};

// Default message templates — editable by the agent in the bulk modal
const TEMPLATES = {
  dueSoon: (name, amount, paybill) =>
    `Dear ${name}, your rent of Ksh ${Number(amount).toLocaleString()} is due on the 1st. Pay via Paybill ${paybill}. Thank you - PropTrack`,
  arrears: (name, amount) =>
    `Dear ${name}, you have outstanding arrears of Ksh ${Number(amount).toLocaleString()}. Please pay immediately. - PropTrack`,
};

const BULK_DEFAULTS = {
  dueSoon: "Dear tenant, your rent is due on the 1st of this month. Please pay via your agent's M-Pesa Paybill. Thank you - PropTrack",
  arrears:  "Dear tenant, you have outstanding rent arrears. Please make payment immediately to avoid further action. - PropTrack",
};

export default function Reminders({ navigate }) {
  const { agent } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  // Single reminder modal state
  const [showSingle, setShowSingle] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [singleMessage, setSingleMessage] = useState("");
  const [singleSending, setSingleSending] = useState(false);

  // Bulk reminder modal state
  const [showBulk, setShowBulk] = useState(false);
  const [bulkType, setBulkType] = useState("dueSoon");
  const [bulkMessage, setBulkMessage] = useState(BULK_DEFAULTS.dueSoon);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState(null);

  const canBulkSms = agent?.plan === "Growth" || agent?.plan === "Pro";

  useEffect(() => {
    Promise.all([apiFetch("/tenants"), apiFetch("/reminders")])
      .then(([t, r]) => { setTenants(t); setReminders(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const arrearsTenants = tenants.filter(t => t.status === "arrears");
  const pendingTenants = tenants.filter(t => t.status !== "paid");

  // ── Open single reminder modal pre-filled for a specific tenant ──────────
  const openSingle = (tenant) => {
    const defaultMsg = tenant.status === "arrears"
      ? TEMPLATES.arrears(tenant.name, tenant.arrears)
      : TEMPLATES.dueSoon(tenant.name, tenant.rent_amount, agent?.paybill_number || "your Paybill");
    setSelectedTenant(tenant);
    setSingleMessage(defaultMsg);
    setShowSingle(true);
  };

  // ── Send to a single tenant via /reminders/send ──────────────────────────
  const sendSingle = async () => {
    if (!selectedTenant || !singleMessage.trim()) return;
    setSingleSending(true);
    try {
      const newReminder = await apiFetch("/reminders/send", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: selectedTenant.id,
          type: selectedTenant.status === "arrears" ? "arrears" : "dueSoon",
          message: singleMessage,
          phone: selectedTenant.phone,
        }),
      });
      setReminders([newReminder, ...reminders]);
      setShowSingle(false);
      setSelectedTenant(null);
    } catch (err) {
      alert(err.message);
    }
    setSingleSending(false);
  };

  // ── Also called directly from arrears quick-action without opening modal ─
  const sendQuick = async (tenant) => {
    setSending(tenant.id);
    const message = TEMPLATES.arrears(tenant.name, tenant.arrears);
    try {
      const newReminder = await apiFetch("/reminders/send", {
        method: "POST",
        body: JSON.stringify({ tenant_id: tenant.id, type: "arrears", message, phone: tenant.phone }),
      });
      setReminders([newReminder, ...reminders]);
    } catch (err) { alert(err.message); }
    setSending(null);
  };

  // ── Send bulk via /reminders/send-bulk (Growth/Pro only) ─────────────────
  const sendBulk = async () => {
    if (!bulkMessage.trim()) return;
    setBulkSending(true);
    setBulkResult(null);
    setBulkError(null);
    try {
      const result = await apiFetch("/reminders/send-bulk", {
        method: "POST",
        body: JSON.stringify({ type: bulkType, message: bulkMessage }),
      });
      setBulkResult(result);
      setReminders(prev => [...prev]); // trigger a fresh fetch below
      // Refresh reminder history so the new bulk entries appear
      apiFetch("/reminders").then(setReminders).catch(console.error);
    } catch (err) {
      if (err.upgradeRequired) {
        setBulkError("upgrade");
      } else {
        setBulkError(err.message);
      }
    }
    setBulkSending(false);
  };

  // Sync bulk message when type changes
  const handleBulkTypeChange = (type) => {
    setBulkType(type);
    setBulkMessage(BULK_DEFAULTS[type]);
    setBulkResult(null);
    setBulkError(null);
  };

  if (loading) return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Reminders</h1></div></div>
      <SkeletonTable rows={4} cols={5} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reminders</h1>
          <p className="page-subtitle">SMS notifications via Africa&apos;s Talking</p>
        </div>
        {canBulkSms ? (
          <button className="btn btn-primary" onClick={() => { setShowBulk(true); setBulkResult(null); setBulkError(null); }} style={{ gap: 6 }}>
            <IconSend size={15} /> Send Bulk SMS
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={() => navigate && navigate("billing")} style={{ gap: 6 }}>
            <IconLock size={14} /> Unlock Bulk SMS
          </button>
        )}
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card danger">
          <div className="stat-glow" />
          <div className="stat-label">In Arrears</div>
          <div className="stat-value">{arrearsTenants.length}</div>
          <div className="stat-sub">Need urgent reminders</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-glow" />
          <div className="stat-label">Due This Month</div>
          <div className="stat-value">{pendingTenants.length}</div>
          <div className="stat-sub">Pending payment</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-glow" />
          <div className="stat-label">SMS Sent</div>
          <div className="stat-value">{reminders.filter(r => r.status === "sent").length}</div>
          <div className="stat-sub">Total reminders</div>
        </div>
      </div>

      {/* ── Arrears Quick Actions ── */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <IconAlertTriangle size={16} style={{ color: "var(--danger)" }} />
          <h2 className="section-title">Tenants Requiring Immediate Reminder</h2>
        </div>
        {arrearsTenants.length === 0 ? (
          <EmptyState
            icon={<IconCheck size={32} />}
            title="All tenants up to date"
            subtitle="No arrears tenants right now"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {arrearsTenants.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 9, background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.12)", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name} &mdash; Unit {t.unit_number}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                    {t.phone} &middot; Owes Ksh {Number(t.arrears).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12, gap: 5 }}
                    onClick={() => openSingle(t)}>
                    Edit &amp; Send
                  </button>
                  <button className="btn btn-danger" style={{ fontSize: 12, gap: 5 }}
                    onClick={() => sendQuick(t)} disabled={sending === t.id}>
                    <IconSend size={13} /> {sending === t.id ? "Sending..." : "Quick Send"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── All Tenants (single reminder per tenant) ── */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <IconUsers size={15} style={{ color: "var(--accent)" }} />
          <h2 className="section-title">Send Reminder to a Specific Tenant</h2>
        </div>
        {tenants.length === 0 ? (
          <EmptyState icon={<IconUsers size={32} />} title="No tenants yet" subtitle="Add tenants first to send them reminders" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tenants.map(t => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, background: "var(--bg-secondary)", border: "1px solid var(--border)", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                    Unit {t.unit_number} &middot; {t.phone}
                    &nbsp;&middot;&nbsp;
                    <span className={`badge badge-${t.status === "paid" ? "success" : t.status === "arrears" ? "danger" : "warning"}`} style={{ fontSize: 10 }}>
                      {t.status}
                    </span>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 12, gap: 5 }}
                  onClick={() => openSingle(t)}>
                  <IconSend size={13} /> Send Reminder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Reminder History ── */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <IconBell size={15} style={{ color: "var(--accent)" }} />
          <h2 className="section-title">Reminder History</h2>
        </div>
        {reminders.length === 0 ? (
          <EmptyState icon={<IconBell size={32} />} title="No reminders sent yet" subtitle="Send your first reminder above" />
        ) : (
          <div className="table-wrap" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Tenant</th><th>Unit</th><th>Type</th>
                  <th>Message</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.tenant || "\u2014"}</td>
                    <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{r.unit || "\u2014"}</span></td>
                    <td><span className={`badge badge-${r.type === "arrears" ? "danger" : "warning"}`}>{r.type}</span></td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 11, maxWidth: 200 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.message}</span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{new Date(r.sent_at).toLocaleDateString("en-KE")}</td>
                    <td><span className={`badge badge-${r.status === "sent" ? "success" : "warning"}`}>{r.status === "sent" ? "Sent" : "Pending"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Single Reminder Modal ── */}
      {showSingle && selectedTenant && (
        <div className="modal-overlay" onClick={() => setShowSingle(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Send Reminder</h2>
            <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>{selectedTenant.name}</span>
              <span style={{ color: "var(--text-secondary)" }}> &middot; Unit {selectedTenant.unit_number} &middot; {selectedTenant.phone}</span>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Message <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— edit freely before sending</span></label>
              <textarea
                className="input"
                rows={5}
                value={singleMessage}
                onChange={e => setSingleMessage(e.target.value)}
                style={{ resize: "vertical", lineHeight: 1.6, fontSize: 13 }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                {singleMessage.length} characters &middot; SMS messages over 160 characters may be split into two
              </span>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowSingle(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendSingle} disabled={singleSending || !singleMessage.trim()} style={{ gap: 6 }}>
                <IconSend size={14} /> {singleSending ? "Sending..." : "Send SMS"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Reminder Modal (Growth/Pro only) ── */}
      {showBulk && (
        <div className="modal-overlay" onClick={() => { setShowBulk(false); setBulkResult(null); }}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Send Bulk SMS</h2>
            {bulkResult ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ color: "var(--accent)", marginBottom: 10, display: "flex", justifyContent: "center" }}>
                  <IconCheck size={40} />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                  Done!
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  Sent to <strong>{bulkResult.sent}</strong> of <strong>{bulkResult.total}</strong> tenants
                  {bulkResult.failed > 0 && <span style={{ color: "var(--danger)" }}> &middot; {bulkResult.failed} failed</span>}
                </div>
                <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => { setShowBulk(false); setBulkResult(null); }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="form-group">
                    <label>Who to send to</label>
                    <select className="input" value={bulkType} onChange={e => handleBulkTypeChange(e.target.value)}>
                      <option value="dueSoon">All pending tenants ({pendingTenants.length} tenants)</option>
                      <option value="arrears">All arrears tenants ({arrearsTenants.length} tenants)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Message <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— edit freely before sending</span></label>
                    <textarea
                      className="input"
                      rows={5}
                      value={bulkMessage}
                      onChange={e => setBulkMessage(e.target.value)}
                      style={{ resize: "vertical", lineHeight: 1.6, fontSize: 13 }}
                    />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                      {bulkMessage.length} characters &middot; SMS messages over 160 characters may be split into two
                    </span>
                  </div>
                  <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                    This message will be sent to <strong style={{ color: "var(--text-primary)" }}>
                      {bulkType === "arrears" ? arrearsTenants.length : pendingTenants.length} tenants
                    </strong>. Each receives it as an individual SMS.
                  </div>
                  {bulkError && bulkError !== "upgrade" && (
                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--danger-dim)", color: "var(--danger)", fontSize: 13, border: "1px solid rgba(255,77,109,0.2)" }}>
                      {bulkError}
                    </div>
                  )}
                  {bulkError === "upgrade" && (
                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)", fontSize: 13, border: "1px solid var(--border-accent)" }}>
                      Bulk SMS requires a Growth or Pro plan.{" "}
                      <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => { setShowBulk(false); navigate && navigate("billing"); }}>
                        View plans
                      </span>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setShowBulk(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={sendBulk}
                    disabled={bulkSending || !bulkMessage.trim() || (bulkType === "arrears" ? arrearsTenants.length : pendingTenants.length) === 0}
                    style={{ gap: 6 }}>
                    <IconSend size={14} />
                    {bulkSending ? "Sending..." : `Send to ${bulkType === "arrears" ? arrearsTenants.length : pendingTenants.length} Tenants`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
