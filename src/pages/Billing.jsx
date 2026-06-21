import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { IconCheck, IconX, IconBuilding, IconShield, IconTrendingUp, IconRefresh, IconLock } from "../components/Icons";

const API = "https://proptrack-backend-production-a3e9.up.railway.app/api";
const getToken = () => localStorage.getItem("proptrack_token");

// Mirrors proptrack-backend/config/plans.js — keep these in sync if pricing changes.
const PLANS = [
  {
    id: "Starter",
    price: 1200,
    properties: "1 property",
    desc: "Perfect for agents managing a single building",
    features: [
      { label: "1 property", included: true },
      { label: "Tenant management", included: true },
      { label: "M-Pesa payment verification", included: true },
      { label: "Vacancy listings with photos", included: true },
      { label: "Search", included: true },
      { label: "SMS reminders (one at a time)", included: true },
      { label: "Bulk SMS to all tenants", included: false },
      { label: "Payment history", included: true, note: "Last 3 months" },
      { label: "Reports & analytics", included: false },
      { label: "Support", included: true, note: "Standard email" },
    ],
  },
  {
    id: "Growth",
    price: 2800,
    properties: "Up to 5 properties",
    popular: true,
    desc: "For growing agents managing multiple properties",
    features: [
      { label: "Up to 5 properties", included: true },
      { label: "Tenant management", included: true },
      { label: "M-Pesa payment verification", included: true },
      { label: "Vacancy listings with photos", included: true },
      { label: "Search", included: true },
      { label: "Bulk SMS to all tenants", included: true },
      { label: "Payment history", included: true, note: "Full history" },
      { label: "Reports & analytics", included: true, note: "Basic" },
      { label: "Support", included: true, note: "Priority email" },
    ],
  },
  {
    id: "Pro",
    price: 5500,
    properties: "Unlimited properties",
    desc: "For large agencies with extensive portfolios",
    features: [
      { label: "Unlimited properties", included: true },
      { label: "Tenant management", included: true },
      { label: "M-Pesa payment verification", included: true },
      { label: "Vacancy listings with photos", included: true },
      { label: "Search", included: true },
      { label: "Bulk SMS to all tenants", included: true },
      { label: "Payment history", included: true, note: "Full history" },
      { label: "Reports & analytics", included: true, note: "Full analytics" },
      { label: "Support", included: true, note: "Priority, direct line" },
    ],
  },
];

export default function Billing() {
  const { agent, setAgent } = useAuth();
  const [paying, setPaying] = useState(null);
  const [phone, setPhone] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [status, setStatus] = useState(null);

  const currentPlan = agent?.plan || "Starter";

  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setPhone("");
    setStatus(null);
    setShowModal(true);
  };

  // After the STK push is sent, the agent enters their PIN on their phone —
  // we don't get a live push back, so we poll /auth/me a few times to pick up
  // the plan change once Safaricom's callback updates it server-side.
  const pollForPlanUpdate = (expectedPlan, attempts = 10) => {
    if (attempts <= 0) return;
    setTimeout(async () => {
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const updated = await res.json();
        if (updated.plan === expectedPlan) {
          setAgent(updated);
          setStatus({ type: "success", text: `You're now on the ${expectedPlan} plan!` });
        } else {
          pollForPlanUpdate(expectedPlan, attempts - 1);
        }
      } catch {
        pollForPlanUpdate(expectedPlan, attempts - 1);
      }
    }, 4000); // check every 4 seconds, up to ~40 seconds total
  };

  const triggerSTKPush = async () => {
    if (!phone || !/^(07|01)\d{8}$/.test(phone)) {
      setStatus({ type: "error", text: "Enter a valid Safaricom number (e.g. 0712345678)" });
      return;
    }
    setPaying(selectedPlan.id);
    setStatus(null);
    try {
      const res = await fetch(`${API}/billing/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ plan: selectedPlan.id, phone, amount: selectedPlan.price }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", text: data.error || "Payment failed. Try again." });
      } else {
        setStatus({ type: "success", text: `M-Pesa prompt sent to ${phone}. Enter your PIN to complete.` });
        pollForPlanUpdate(selectedPlan.id);
      }
    } catch {
      setStatus({ type: "error", text: "Connection error. Check your internet and try again." });
    }
    setPaying(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing</h1>
          <p className="page-subtitle">Choose the plan that fits your portfolio</p>
        </div>
      </div>

      <div className="sub-banner">
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800 }}>
            Current plan: <span style={{ color: "var(--accent)" }}>{currentPlan}</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            Upgrade anytime to unlock more properties and features
          </div>
        </div>
        <span className="badge badge-success">{currentPlan} Plan</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 36, paddingTop: 14 }}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} style={{ position: "relative" }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "var(--accent)", color: "#080c14",
                  padding: "3px 16px", borderRadius: 20,
                  fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                  whiteSpace: "nowrap", zIndex: 2
                }}>Most Popular</div>
              )}

              <div className="card" style={{
                border: plan.popular ? "2px solid var(--accent)" : "1px solid var(--border)",
                height: "100%",
              }}>

              <div style={{ marginTop: plan.popular ? 8 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                    <IconBuilding size={18} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 900 }}>{plan.id}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{plan.desc}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 700, color: "var(--accent-2)" }}>
                  {plan.properties}
                </div>

                <div style={{ marginBottom: 20, fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 900, color: "var(--accent)" }}>
                  Ksh {plan.price.toLocaleString()}
                  <span style={{ fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" }}>/mo</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
                  {plan.features.map(f => (
                    <div key={f.label} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13 }}>
                      <span style={{
                        color: f.included ? "var(--accent)" : "var(--text-muted)",
                        marginTop: 1, flexShrink: 0
                      }}>
                        {f.included ? <IconCheck size={14} /> : <IconX size={14} />}
                      </span>
                      <span style={{ color: f.included ? "var(--text-secondary)" : "var(--text-muted)" }}>
                        {f.label}
                        {f.note && <span style={{ color: "var(--text-muted)" }}> &middot; {f.note}</span>}
                      </span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <button className="btn btn-ghost" disabled style={{ width: "100%", justifyContent: "center", opacity: 0.6 }}>
                    Current Plan
                  </button>
                ) : (
                  <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => handleSubscribe(plan)}>
                    {paying === plan.id ? "Processing..." : `Upgrade to ${plan.id}`}
                  </button>
                )}
              </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, marginBottom: 16 }}>How Billing Works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            [IconLock, "Pay via M-Pesa", "Click upgrade, enter your number. M-Pesa prompts you for your PIN. Done."],
            [IconRefresh, "Monthly Renewal", "Renews every 30 days. SMS reminder sent 3 days before renewal."],
            [IconShield, "No Contracts", "Cancel anytime. Your data stays accessible for 30 days after cancellation."],
            [IconTrendingUp, "Upgrade Anytime", "Switch plans instantly from this page — feature access updates immediately."],
          ].map(([Ic, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                <Ic size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Pay via M-Pesa</h2>
            <div style={{ background: "var(--bg-secondary)", borderRadius: 10, padding: 16, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{selectedPlan.id} Plan</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedPlan.properties}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 900, color: "var(--accent)" }}>
                Ksh {selectedPlan.price.toLocaleString()}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Your M-Pesa Phone Number</label>
              <input className="input" placeholder="e.g. 0712345678" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: "0.05em" }}
                autoComplete="tel" inputMode="numeric" />
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>You will receive an M-Pesa prompt on this number</span>
            </div>
            {status && (
              <div style={{ padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13, background: status.type === "error" ? "var(--danger-dim)" : "var(--accent-dim)", color: status.type === "error" ? "var(--danger)" : "var(--accent)", border: `1px solid ${status.type === "error" ? "rgba(255,77,109,0.2)" : "var(--border-accent)"}` }}>
                {status.text}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={triggerSTKPush} disabled={!!paying}>
                {paying ? "Sending prompt..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}