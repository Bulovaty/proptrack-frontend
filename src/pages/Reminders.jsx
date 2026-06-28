import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { SkeletonTable } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import {
  IconBell, IconSend, IconAlertTriangle, IconCheck,
  IconUsers, IconLock, IconWhatsapp
} from "../components/Icons";

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
  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.upgradeRequired = data.upgradeRequired;
    err.smsCapReached = data.smsCapReached;
    throw err;
  }
  return data;
};

// Format a Kenyan phone number to international WhatsApp format
// 0712345678 → 254712345678
const toWhatsAppNumber = (phone) => {
  if (!phone) return "";
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("254")) return clean;
  if (clean.startsWith("0")) return "254" + clean.slice(1);
  return "254" + clean;
};

// Opens WhatsApp on the agent's own phone with the message pre-filled.
// The agent taps send themselves — no API needed, works immediately.
const openWhatsApp = (phone, message) => {
  const number = toWhatsAppNumber(phone);
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${number}?text=${encoded}`, "_blank");
};

const TEMPLATES = {
  dueSoon: (name, amount, paybill) =>
    `Dear ${name}, your rent of Ksh ${Number(amount).toLocaleString()} is due on the 1st. Please pay via Paybill ${paybill}. Thank you - PropTrack`,
  arrears: (name, amount) =>
    `Dear ${name}, you have outstanding arrears of Ksh ${Number(amount).toLocaleString()}. Please make payment immediately to avoid further action. - PropTrack`,
};

const BULK_DEFAULTS = {
  dueSoon: "Dear tenant, your rent is due on the 1st of this month. Please pay via your agent's M-Pesa Paybill. Thank you - PropTrack",
  arrears: "Dear tenant, you have outstanding rent arrears. Please make payment immediately to avoid further action. - PropTrack",
};

// ── Channel selector component ─────────────────────────────────────────────
function ChannelPicker({ value, onChange, canWhatsApp = true }) {
  const opts = [
    { id: "sms", label: "SMS", icon: <IconSend size={13} />, color: "var(--accent)", locked: false },
    { id: "whatsapp", label: "WhatsApp", icon: <IconWhatsapp size={13} />, color: "#25D366", locked: !canWhatsApp },
    { id: "both", label: "SMS + WhatsApp", icon: null, color: "var(--accent-2)", locked: !canWhatsApp },
  ];
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Send via
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {opts.map(o => (
          <button key={o.id}
            onClick={() => !o.locked && onChange(o.id)}
            disabled={o.locked}
            title={o.locked ? "Available on Growth and Pro plans" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: o.locked ? "not-allowed" : "pointer",
              transition: "all 0.15s", opacity: o.locked ? 0.45 : 1,
              border: value === o.id ? `2px solid ${o.color}` : "2px solid var(--border)",
              background: value === o.id ? `${o.color}18` : "var(--bg-secondary)",
              color: value === o.id ? o.color : "var(--text-secondary)",
            }}>
            {o.icon}
            {o.label}
            {o.locked && <IconLock size={11} style={{ marginLeft: 2 }} />}
          </button>
        ))}
      </div>
      {!canWhatsApp && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
          WhatsApp reminders available on Growth and Pro plans
        </div>
      )}
    </div>
  );
}

export default function Reminders({ navigate }) {
  const { agent } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  // Single modal state
  const [showSingle, setShowSingle] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [singleMessage, setSingleMessage] = useState("");
  const [singleChannel, setSingleChannel] = useState("sms");
  const [singleSending, setSingleSending] = useState(false);
  const [singleDone, setSingleDone] = useState(false);

  // Bulk modal state
  const [showBulk, setShowBulk] = useState(false);
  const [bulkType, setBulkType] = useState("dueSoon");
  const [bulkMessage, setBulkMessage] = useState(BULK_DEFAULTS.dueSoon);
  const [bulkChannel, setBulkChannel] = useState("sms");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState(null);

  const canBulkSms = agent?.plan === "Growth" || agent?.plan === "Pro";
  const canWhatsApp = agent?.plan === "Growth" || agent?.plan === "Pro";
  const paybill = agent?.paybill_number || "your Paybill";

  // SMS usage for Starter cap display
  const [smsUsage, setSmsUsage] = useState(null);

  useEffect(() => {
    Promise.all([apiFetch("/tenants"), apiFetch("/reminders")])
      .then(([t, r]) => { setTenants(t); setReminders(r); })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch SMS usage for Starter cap display
    if (agent?.plan === "Starter" || !agent?.plan) {
      apiFetch("/reminders/usage")
        .then(setSmsUsage)
        .catch(console.error);
    }
  }, []);

  const arrearsTenants = tenants.filter(t => t.status === "arrears");
  const pendingTenants = tenants.filter(t => t.status !== "paid");

  // ── Open single reminder modal ────────────────────────────────────────────
  const openSingle = (tenant) => {
    const defaultMsg = tenant.status === "arrears"
      ? TEMPLATES.arrears(tenant.name, tenant.arrears)
      : TEMPLATES.dueSoon(tenant.name, tenant.rent_amount, paybill);
    setSelectedTenant(tenant);
    setSingleMessage(defaultMsg);
    setSingleChannel("sms");
    setSingleDone(false);
    setShowSingle(true);
  };

  // ── Send / open WhatsApp for single tenant ────────────────────────────────
  const sendSingle = async () => {
    if (!selectedTenant || !singleMessage.trim()) return;
    setSingleSending(true);

    if (singleChannel === "whatsapp" || singleChannel === "both") {
      openWhatsApp(selectedTenant.phone, singleMessage);
    }

    if (singleChannel === "sms" || singleChannel === "both") {
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
        setReminders(prev => [newReminder, ...prev]);
        // Refresh SMS usage count after sending
        if (agent?.plan === "Starter" || !agent?.plan) {
          apiFetch("/reminders/usage").then(setSmsUsage).catch(console.error);
        }
      } catch (err) {
        if (err.smsCapReached) {
          setShowSingle(false);
          // Refresh usage so banner updates
          apiFetch("/reminders/usage").then(setSmsUsage).catch(console.error);
          alert(`Monthly SMS limit reached. Upgrade to Growth for unlimited SMS.`);
        } else {
          alert("SMS failed: " + err.message);
        }
        setSingleSending(false);
        return;
      }
    }

    setSingleSending(false);
    setSingleDone(true);
    setTimeout(() => { setShowSingle(false); setSingleDone(false); }, 1500);
  };

  // ── Quick send arrears without opening modal ──────────────────────────────
  const sendQuick = async (tenant, channel = "sms") => {
    setSending(tenant.id + channel);
    const message = TEMPLATES.arrears(tenant.name, tenant.arrears);

    if (channel === "whatsapp" || channel === "both") {
      openWhatsApp(tenant.phone, message);
    }
    if (channel === "sms" || channel === "both") {
      try {
        const newReminder = await apiFetch("/reminders/send", {
          method: "POST",
          body: JSON.stringify({ tenant_id: tenant.id, type: "arrears", message, phone: tenant.phone }),
        });
        setReminders(prev => [newReminder, ...prev]);
      } catch (err) { alert(err.message); }
    }
    setSending(null);
  };

  // ── Send bulk via backend endpoint (SMS) + open WhatsApp links ────────────
  const sendBulk = async () => {
    if (!bulkMessage.trim()) return;
    setBulkSending(true);
    setBulkResult(null);
    setBulkError(null);

    const targets = bulkType === "arrears" ? arrearsTenants : pendingTenants;

    // WhatsApp: open each tenant's WhatsApp link (agent sends manually)
    // We open them sequentially with a small delay so the browser doesn't block pop-ups
    if (bulkChannel === "whatsapp" || bulkChannel === "both") {
      for (let i = 0; i < targets.length; i++) {
        setTimeout(() => openWhatsApp(targets[i].phone, bulkMessage), i * 600);
      }
    }

    // SMS: hit the backend bulk endpoint (plan-gated)
    if (bulkChannel === "sms" || bulkChannel === "both") {
      try {
        const result = await apiFetch("/reminders/send-bulk", {
          method: "POST",
          body: JSON.stringify({ type: bulkType, message: bulkMessage }),
        });
        setBulkResult(result);
        apiFetch("/reminders").then(setReminders).catch(console.error);
      } catch (err) {
        setBulkError(err.upgradeRequired ? "upgrade" : err.message);
        setBulkSending(false);
        return;
      }
    } else {
      // WhatsApp-only path — no backend call needed, just show a success state
      setBulkResult({ sent: targets.length, failed: 0, total: targets.length });
    }

    setBulkSending(false);
  };

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
          <p className="page-subtitle">SMS &amp; WhatsApp notifications for your tenants</p>
        </div>
        {canBulkSms ? (
          <button className="btn btn-primary"
            onClick={() => { setShowBulk(true); setBulkResult(null); setBulkError(null); setBulkChannel("sms"); }}
            style={{ gap: 6 }}>
            <IconSend size={15} /> Send Bulk Reminder
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={() => navigate && navigate("billing")} style={{ gap: 6 }}>
            <IconLock size={14} /> Unlock Bulk SMS
          </button>
        )}
      </div>

      {/* SMS cap banner for Starter */}
      {smsUsage?.limited && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", borderRadius: 10, marginBottom: 20,
          background: smsUsage.remaining === 0 ? "var(--danger-dim)" : "var(--accent-dim)",
          border: `1px solid ${smsUsage.remaining === 0 ? "rgba(255,77,109,0.2)" : "var(--border-accent)"}`,
          flexWrap: "wrap", gap: 10,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: smsUsage.remaining === 0 ? "var(--danger)" : "var(--accent)" }}>
              {smsUsage.remaining === 0
                ? "Monthly SMS limit reached"
                : `${smsUsage.remaining} of ${smsUsage.limit} SMS remaining this month`}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              {smsUsage.remaining === 0
                ? "Upgrade to Growth for unlimited SMS and WhatsApp reminders"
                : "Starter plan includes 30 SMS per month. Upgrade for unlimited SMS + WhatsApp."}
            </div>
          </div>
          <button className="btn btn-primary" style={{ fontSize: 12, padding: "7px 14px" }}
            onClick={() => navigate && navigate("billing")}>
            Upgrade
          </button>
        </div>
      )}
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

      {/* Arrears quick actions */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <IconAlertTriangle size={16} style={{ color: "var(--danger)" }} />
          <h2 className="section-title">Tenants Requiring Immediate Reminder</h2>
        </div>
        {arrearsTenants.length === 0 ? (
          <EmptyState icon={<IconCheck size={32} />} title="All tenants up to date" subtitle="No arrears right now" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {arrearsTenants.map(t => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "11px 14px", borderRadius: 9,
                background: "var(--danger-dim)", border: "1px solid rgba(255,77,109,0.12)",
                gap: 12, flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name} &mdash; Unit {t.unit_number}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                    {t.phone} &middot; Owes Ksh {Number(t.arrears).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button className="btn btn-ghost" style={{ fontSize: 12, gap: 5 }} onClick={() => openSingle(t)}>
                    Edit &amp; Send
                  </button>
                  {canWhatsApp && (
                    <button className="btn btn-ghost" style={{ fontSize: 12, gap: 5, color: "#25D366", borderColor: "#25D366" }}
                      onClick={() => sendQuick(t, "whatsapp")} disabled={!!sending}>
                      <IconWhatsapp size={13} /> WhatsApp
                    </button>
                  )}
                  <button className="btn btn-danger" style={{ fontSize: 12, gap: 5 }}
                    onClick={() => sendQuick(t, "sms")} disabled={sending === t.id + "sms"}>
                    <IconSend size={13} /> {sending === t.id + "sms" ? "Sending..." : "SMS"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All tenants */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <IconUsers size={15} style={{ color: "var(--accent)" }} />
          <h2 className="section-title">Send Reminder to a Specific Tenant</h2>
        </div>
        {tenants.length === 0 ? (
          <EmptyState icon={<IconUsers size={32} />} title="No tenants yet" subtitle="Add tenants first to send reminders" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {tenants.map(t => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 8,
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                gap: 12, flexWrap: "wrap",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                    Unit {t.unit_number} &middot; {t.phone}&nbsp;
                    <span className={`badge badge-${t.status === "paid" ? "success" : t.status === "arrears" ? "danger" : "warning"}`} style={{ fontSize: 10 }}>
                      {t.status}
                    </span>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ fontSize: 12, gap: 5 }} onClick={() => openSingle(t)}>
                  <IconSend size={13} /> Send Reminder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminder history */}
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

            {singleDone ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ color: "var(--accent)", display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <IconCheck size={40} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Sent!</div>
              </div>
            ) : (
              <>
                <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
                  <span style={{ fontWeight: 700 }}>{selectedTenant.name}</span>
                  <span style={{ color: "var(--text-secondary)" }}> &middot; Unit {selectedTenant.unit_number} &middot; {selectedTenant.phone}</span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <ChannelPicker value={singleChannel} onChange={setSingleChannel} canWhatsApp={canWhatsApp} />
                </div>

                {singleChannel === "whatsapp" && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "#25D36618", border: "1px solid #25D36640", fontSize: 12, color: "#25D366", marginBottom: 12 }}>
                    This will open WhatsApp on your phone with the message pre-filled. You tap Send.
                  </div>
                )}
                {singleChannel === "both" && (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--border-accent)", fontSize: 12, color: "var(--accent)", marginBottom: 12 }}>
                    WhatsApp will open on your phone, and an SMS will also be sent automatically.
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Message <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— edit freely before sending</span></label>
                  <textarea className="input" rows={5} value={singleMessage}
                    onChange={e => setSingleMessage(e.target.value)}
                    style={{ resize: "vertical", lineHeight: 1.6, fontSize: 13 }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                    {singleMessage.length} characters &middot; SMS messages over 160 characters may be split
                  </span>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setShowSingle(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={sendSingle}
                    disabled={singleSending || !singleMessage.trim()} style={{ gap: 6 }}>
                    {singleChannel === "whatsapp"
                      ? <><IconWhatsapp size={14} /> Open WhatsApp</>
                      : singleChannel === "both"
                      ? <><IconSend size={14} /> Send Both</>
                      : <><IconSend size={14} /> {singleSending ? "Sending..." : "Send SMS"}</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Bulk Reminder Modal ── */}
      {showBulk && (
        <div className="modal-overlay" onClick={() => { setShowBulk(false); setBulkResult(null); }}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Send Bulk Reminder</h2>

            {bulkResult ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ color: "var(--accent)", display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <IconCheck size={40} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Done!</div>
                <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  {bulkChannel === "whatsapp"
                    ? `WhatsApp opened for ${bulkResult.total} tenants`
                    : <>Sent to <strong>{bulkResult.sent}</strong> of <strong>{bulkResult.total}</strong> tenants
                      {bulkResult.failed > 0 && <span style={{ color: "var(--danger)" }}> &middot; {bulkResult.failed} failed</span>}
                    </>}
                </div>
                <button className="btn btn-ghost" style={{ marginTop: 20 }}
                  onClick={() => { setShowBulk(false); setBulkResult(null); }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="form-group">
                    <label>Who to send to</label>
                    <select className="input" value={bulkType} onChange={e => handleBulkTypeChange(e.target.value)}>
                      <option value="dueSoon">All pending tenants ({pendingTenants.length} tenants)</option>
                      <option value="arrears">All arrears tenants ({arrearsTenants.length} tenants)</option>
                    </select>
                  </div>

                  <ChannelPicker value={bulkChannel} onChange={setBulkChannel} canWhatsApp={canWhatsApp} />

                  {bulkChannel === "whatsapp" && (
                    <div style={{ padding: "8px 12px", borderRadius: 8, background: "#25D36618", border: "1px solid #25D36640", fontSize: 12, color: "#25D366" }}>
                      WhatsApp will open separately for each tenant. Your browser may ask permission to open multiple tabs — allow it.
                    </div>
                  )}
                  {bulkChannel === "both" && (
                    <div style={{ padding: "8px 12px", borderRadius: 8, background: "var(--accent-dim)", border: "1px solid var(--border-accent)", fontSize: 12, color: "var(--accent)" }}>
                      SMS will be sent automatically to all tenants, and WhatsApp will open for each one.
                    </div>
                  )}

                  <div className="form-group">
                    <label>Message <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— edit freely before sending</span></label>
                    <textarea className="input" rows={5} value={bulkMessage}
                      onChange={e => setBulkMessage(e.target.value)}
                      style={{ resize: "vertical", lineHeight: 1.6, fontSize: 13 }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                      {bulkMessage.length} characters &middot; SMS messages over 160 characters may be split
                    </span>
                  </div>

                  <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                    Sending to <strong style={{ color: "var(--text-primary)" }}>
                      {bulkType === "arrears" ? arrearsTenants.length : pendingTenants.length} tenants
                    </strong> &middot; Each receives it individually
                  </div>

                  {bulkError && bulkError !== "upgrade" && (
                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--danger-dim)", color: "var(--danger)", fontSize: 13, border: "1px solid rgba(255,77,109,0.2)" }}>
                      {bulkError}
                    </div>
                  )}
                  {bulkError === "upgrade" && (
                    <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)", fontSize: 13, border: "1px solid var(--border-accent)" }}>
                      Bulk SMS requires a Growth or Pro plan.{" "}
                      <span style={{ textDecoration: "underline", cursor: "pointer" }}
                        onClick={() => { setShowBulk(false); navigate && navigate("billing"); }}>
                        View plans
                      </span>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button className="btn btn-ghost" onClick={() => setShowBulk(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={sendBulk}
                    disabled={bulkSending || !bulkMessage.trim() ||
                      (bulkType === "arrears" ? arrearsTenants.length : pendingTenants.length) === 0}
                    style={{ gap: 6 }}>
                    {bulkChannel === "whatsapp"
                      ? <><IconWhatsapp size={14} /> Open WhatsApp for All</>
                      : <><IconSend size={14} /> {bulkSending ? "Sending..." : `Send to ${bulkType === "arrears" ? arrearsTenants.length : pendingTenants.length} Tenants`}</>}
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