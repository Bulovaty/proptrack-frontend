import { useState, useEffect } from "react";
import { SkeletonTable } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { IconBell, IconSend, IconAlertTriangle, IconCheck } from "../components/Icons";

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

const TEMPLATES = {
  dueSoon: (name, amount, paybill) =>
    `Dear ${name}, your rent of Ksh ${Number(amount).toLocaleString()} is due on the 1st. Pay via Paybill ${paybill}. Thank you - PropTrack`,
  arrears: (name, amount) =>
    `Dear ${name}, you have outstanding arrears of Ksh ${Number(amount).toLocaleString()}. Please pay immediately. - PropTrack`,
};

export default function Reminders() {
  const [tenants, setTenants] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkType, setBulkType] = useState("dueSoon");
  const [paybill, setPaybill] = useState("123456");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);

  useEffect(() => {
    Promise.all([apiFetch("/tenants"), apiFetch("/reminders")])
      .then(([t, r]) => { setTenants(t); setReminders(r); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const arrearsTenants = tenants.filter(t => t.status === "arrears");
  const pendingTenants = tenants.filter(t => t.status !== "paid");

  const sendSingle = async (tenant, type) => {
    setSending(tenant.id);
    const message = type === "arrears"
      ? TEMPLATES.arrears(tenant.name, tenant.arrears)
      : TEMPLATES.dueSoon(tenant.name, tenant.rent_amount, paybill);
    try {
      const newReminder = await apiFetch("/reminders/send", {
        method: "POST",
        body: JSON.stringify({ tenant_id: tenant.id, type, message, phone: tenant.phone }),
      });
      setReminders([newReminder, ...reminders]);
    } catch (err) { alert(err.message); }
    setSending(null);
  };

  const sendBulk = async () => {
    setBulkSending(true);
    const targets = bulkType === "arrears" ? arrearsTenants : pendingTenants;
    for (const tenant of targets) {
      await sendSingle(tenant, bulkType);
    }
    setBulkSending(false);
    setBulkDone(true);
    setTimeout(() => { setBulkDone(false); setShowBulk(false); }, 2000);
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
          <p className="page-subtitle">Automated SMS notifications via Africa&apos;s Talking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBulk(true)} style={{ gap: 6 }}>
          <IconSend size={15} /> Send Bulk SMS
        </button>
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

      {/* Arrears Quick Actions */}
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
                <button className="btn btn-danger" style={{ fontSize: 12, gap: 5 }}
                  onClick={() => sendSingle(t, "arrears")} disabled={sending === t.id}>
                  <IconSend size={13} /> {sending === t.id ? "Sending..." : "Send SMS"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminder History */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <IconBell size={15} style={{ color: "var(--accent)" }} />
          <h2 className="section-title">Reminder History</h2>
        </div>
        {reminders.length === 0 ? (
          <EmptyState
            icon={<IconBell size={32} />}
            title="No reminders sent yet"
            subtitle="Send your first bulk SMS reminder to all pending tenants"
          />
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

      {/* Bulk Modal */}
      {showBulk && (
        <div className="modal-overlay" onClick={() => setShowBulk(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Send Bulk SMS</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label>Reminder Type</label>
                <select className="input" value={bulkType} onChange={e => setBulkType(e.target.value)}>
                  <option value="dueSoon">Rent Due Soon &mdash; all pending tenants</option>
                  <option value="arrears">Arrears Alert &mdash; all defaulters</option>
                </select>
              </div>
              {bulkType === "dueSoon" && (
                <div className="form-group">
                  <label>Your M-Pesa Paybill</label>
                  <input className="input" value={paybill} onChange={e => setPaybill(e.target.value)} placeholder="e.g. 522533" inputMode="numeric" />
                </div>
              )}
              <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 14, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, fontSize: 13 }}>Message Preview</div>
                {bulkType === "dueSoon"
                  ? TEMPLATES.dueSoon("[Tenant Name]", 10000, paybill)
                  : TEMPLATES.arrears("[Tenant Name]", 16000)}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Will send to <strong style={{ color: "var(--text-primary)" }}>
                  {bulkType === "arrears" ? arrearsTenants.length : pendingTenants.length} tenants
                </strong>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowBulk(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendBulk} disabled={bulkSending} style={{ gap: 6 }}>
                {bulkDone ? <><IconCheck size={14} /> All Sent</> : bulkSending ? "Sending..." : <><IconSend size={14} /> Send All</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
