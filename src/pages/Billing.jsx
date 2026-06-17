import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "https://proptrack-backend-production-a3e9.up.railway.app/api";
const getToken = () => localStorage.getItem("proptrack_token");

const PLANS = [
  {
    id: "Starter",
    price: 1500,
    units: "Up to 10 units",
    features: [
      "10 rental units",
      "Tenant management",
      "M-Pesa payment verification",
      "Automated SMS reminders",
      "Property listings",
      "Email support",
    ],
  },
  {
    id: "Growth",
    price: 3500,
    units: "Up to 50 units",
    popular: true,
    features: [
      "50 rental units",
      "Everything in Starter",
      "Bulk SMS reminders",
      "Advanced payment reports",
      "Multiple properties",
      "Priority support",
    ],
  },
  {
    id: "Pro",
    price: 6000,
    units: "Unlimited units",
    features: [
      "Unlimited rental units",
      "Everything in Growth",
      "Custom Paybill integration",
      "Dedicated onboarding",
      "API access",
      "24/7 support",
    ],
  },
];

export default function Billing() {
  const { agent } = useAuth();
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

  const triggerSTKPush = async () => {
    if (!phone || !/^(07|01)\d{8}$/.test(phone)) {
      setStatus({ type: "error", text: "Enter a valid Safaricom number (07XX or 01XX)" });
      return;
    }

    setPaying(selectedPlan.id);
    setStatus(null);

    try {
      const res = await fetch(`${API}/billing/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          plan: selectedPlan.id,
          phone,
          amount: selectedPlan.price,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: "error", text: data.error || "Payment failed. Try again." });
      } else {
        setStatus({
          type: "success",
          text: `M-Pesa prompt sent to ${phone}. Enter your PIN to complete payment.`
        });
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
          <p className="page-subtitle">Choose the plan that fits your portfolio size</p>
        </div>
      </div>

      {/* Current Plan Banner */}
      <div className="sub-banner" style={{ marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800 }}>
            You are on the <span style={{ color: "var(--accent)" }}>{currentPlan} Plan</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
            Upgrade anytime to unlock more units and features
          </div>
        </div>
        <span className="badge badge-success">{currentPlan}</span>
      </div>

      {/* Plans Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 20,
        marginBottom: 40,
      }}>
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} className="card" style={{
              position: "relative",
              border: plan.popular ? "2px solid var(--accent)" : "1px solid var(--border)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "var(--accent)", color: "#080c14",
                  padding: "3px 16px", borderRadius: 20,
                  fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
                  whiteSpace: "nowrap"
                }}>
                  Most Popular
                </div>
              )}

              <div style={{ marginTop: plan.popular ? 8 : 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
                  {plan.id}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  {plan.units}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "var(--accent)" }}>
                    Ksh {plan.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>/month</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 16 }}>&#10003;</span>
                      <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                {isCurrent ? (
                  <button className="btn btn-ghost" disabled style={{ width: "100%", justifyContent: "center", opacity: 0.6 }}>
                    Current Plan
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {paying === plan.id ? "Processing..." : `Upgrade to ${plan.id}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* How Billing Works */}
      <div className="card">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
          How Billing Works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["\u{1F4F1}", "Pay via M-Pesa", "Click upgrade, enter your M-Pesa number. You get an STK Push — just enter your PIN."],
            ["\u{1F504}", "Monthly Renewal", "Your plan renews every 30 days. You get an SMS reminder 3 days before renewal."],
            ["\u{1F512}", "No Contracts", "Cancel anytime. Your data is always yours and stays accessible for 30 days after cancellation."],
            ["\u{1F4C8}", "Upgrade Anytime", "Switch plans instantly. You only pay the difference for the remaining days."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Pay via M-Pesa</h2>

            <div style={{
              background: "var(--bg-secondary)", borderRadius: 10, padding: 16, marginBottom: 20,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <div style={{ fontWeight: 700 }}>{selectedPlan.id} Plan</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedPlan.units}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, color: "var(--accent)" }}>
                Ksh {selectedPlan.price.toLocaleString()}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Your M-Pesa Phone Number</label>
              <input
                className="input"
                placeholder="e.g. 0712345678"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: "0.05em" }}
              />
              <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                You will receive an M-Pesa prompt on this number
              </span>
            </div>

            {status && (
              <div style={{
                padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 13,
                background: status.type === "error" ? "var(--danger-dim)" : "var(--accent-dim)",
                color: status.type === "error" ? "var(--danger)" : "var(--accent)",
                border: `1px solid ${status.type === "error" ? "rgba(255,77,109,0.2)" : "var(--border-accent)"}`,
              }}>
                {status.text}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={triggerSTKPush}
                disabled={!!paying}
              >
                {paying ? "Sending prompt..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}