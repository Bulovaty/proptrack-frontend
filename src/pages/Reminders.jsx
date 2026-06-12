import { useState, useEffect } from "react";
import { apiGetTenants, apiGetReminders, apiSendReminder } from "../api";

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
    Promise.all([apiGetTenants(), apiGetReminders()])
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
      const newReminder = await apiSendReminder({
        tenant_id: tenant.id,
        type,
        message,
        phone: tenant.phone,
      });
      setReminders([newReminder, ...reminders]);
    } catch (err) {
      alert(err.message);
    }
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

  if (loading) return <div style={{ padding: 40, color: "var(--text-secondary)" }}>Loading reminders...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reminders</h1>
          <p className="page-subtitle">Automated SMS notifications via Africa's Talking</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBulk(true)}>
          📨 Send Bulk Reminder
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Tenants in Arrears</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>{arrearsTenants.length}</div>
          <div className="stat-sub">Need urgent reminders</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Due This Month</div>
          <div className="stat-value" style={{ color: "var(--warning)" }}>{pendingTenants.length}</div>
          <div className="stat-sub">Pending payment</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Reminders Sent</div>
          <div className="stat-value">{reminders.filter(r => r.status === "sent").length}</div>
          <div className="stat-sub">This month</div>
        </div>
      </div>

      {/* Arrears Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          ⚠️ Tenants Requiring Immediate Reminder
        </h2>
        {arrearsTenants.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "16px 0" }}>
            No arrears tenants 🎉
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {arrearsTenants.map(t => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderRadius: 8,
                background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.15)"
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name} — Unit {t.unit_number}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                    {t.phone} · Owes Ksh {Number(t.arrears).toLocaleString()}
                  </div>
                </div>
                <button className="btn btn-danger" style={{ fontSize: 12 }}
                  onClick={() => sendSingle(t, "arrears")}
                  disabled={sending === t.id}>
                  {sending === t.id ? "Sending..." : "Send SMS"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminder History */}
      <div className="card">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Reminder History
        </h2>
        {reminders.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontSize: 14, padding: "16px 0" }}>
            No reminders sent yet
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none" }}>
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.tenant || "—"}</td>
                    <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{r.unit || "—"}</span></td>
                    <td>
                      <span className={`badge ${r.type === "arrears" ? "badge-danger" : "badge-warning"}`}>
                        {r.type}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12, maxWidth: 240 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.message}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                      {new Date(r.sent_at).toLocaleDateString("en-KE")}
                    </td>
                    <td>
                      <span className={`badge ${r.status === "sent" ? "badge-success" : "badge-warning"}`}>
                        {r.status === "sent" ? "✓ Sent" : "⏳ Pending"}
                      </span>
                    </td>
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
            <h2 className="modal-title">📨 Send Bulk Reminder</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label>Reminder Type</label>
                <select className="input" value={bulkType} onChange={e => setBulkType(e.target.value)}>
                  <option value="dueSoon">Rent Due Soon — all pending tenants</option>
                  <option value="arrears">Arrears Alert — all defaulters</option>
                </select>
              </div>
              {bulkType === "dueSoon" && (
                <div className="form-group">
                  <label>Your M-Pesa Paybill</label>
                  <input className="input" value={paybill}
                    onChange={e => setPaybill(e.target.value)} placeholder="e.g. 123456" />
                </div>
              )}
              <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 14, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>Message Preview:</div>
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
              <button className="btn btn-primary" onClick={sendBulk} disabled={bulkSending}>
                {bulkDone ? "✓ All Sent!" : bulkSending ? "Sending..." : "Send All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}