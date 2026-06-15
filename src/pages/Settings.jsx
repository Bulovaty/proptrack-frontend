import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

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

const CALLBACK_BASE = "https://proptrack-backend-production-a3e9.up.railway.app";

export default function Settings() {
  const { themeId, setThemeId, themes } = useTheme();
  const { agent, setAgent } = useAuth();

  const [paybill, setPaybill] = useState(agent?.paybill_number || "");
  const [paybillName, setPaybillName] = useState(agent?.paybill_name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(null);

  const savePaybill = async () => {
    setMessage(null);
    if (!/^\d{5,7}$/.test(paybill)) {
      setMessage({ type: "error", text: "Paybill number must be 5-7 digits" });
      return;
    }
    setSaving(true);
    try {
      const updated = await apiFetch("/auth/paybill", {
        method: "PUT",
        body: JSON.stringify({ paybill_number: paybill, paybill_name: paybillName }),
      });
      if (setAgent) {
        setAgent(updated);
        localStorage.setItem("proptrack_agent", JSON.stringify(updated));
      }
      setMessage({ type: "success", text: "Paybill saved successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
    setSaving(false);
  };

  const copyUrl = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize PropTrack and connect your M-Pesa Paybill</p>
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

      {/* M-Pesa Paybill Setup */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
          M-Pesa Paybill
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.7 }}>
          Connect the Paybill your tenants already use. PropTrack will automatically detect
          and record payments made to this Paybill &mdash; your tenants don't need to change anything.
        </p>

        <div className="grid-2" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Your Paybill Number</label>
            <input
              className="input"
              placeholder="e.g. 522533"
              value={paybill}
              onChange={e => setPaybill(e.target.value.replace(/\D/g, ""))}
              style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: "0.05em" }}
            />
          </div>
          <div className="form-group">
            <label>Business Name (optional)</label>
            <input
              className="input"
              placeholder="e.g. Jukiwa Property Agents"
              value={paybillName}
              onChange={e => setPaybillName(e.target.value)}
            />
          </div>
        </div>

        {message && (
          <div className={message.type === "error" ? "auth-error" : "badge badge-success"}
            style={{ marginBottom: 16, display: "block", padding: "10px 14px" }}>
            {message.text}
          </div>
        )}

        <button className="btn btn-primary" onClick={savePaybill} disabled={saving}>
          {saving ? "Saving..." : "Save Paybill"}
        </button>

        {/* Setup Instructions */}
        {agent?.paybill_number && (
          <div style={{
            marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)"
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
              Next step &mdash; one-time setup with Safaricom
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.7 }}>
              To make payments to Paybill <strong style={{ color: "var(--accent)", fontFamily: "monospace" }}>{agent.paybill_number}</strong> appear
              automatically in PropTrack, you (or whoever manages your Daraja account) need to register these URLs
              on developer.safaricom.co.ke under your Paybill's C2B settings:
            </p>

            {[
              ["Confirmation URL", `${CALLBACK_BASE}/api/mpesa/confirm`, "confirm"],
              ["Validation URL", `${CALLBACK_BASE}/api/mpesa/validate`, "validate"],
            ].map(([label, url, key]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" value={url} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} />
                  <button className="btn btn-ghost" onClick={() => copyUrl(url, key)} style={{ flexShrink: 0 }}>
                    {copied === key ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            ))}

            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.7 }}>
              Tell your tenants to enter their <strong>unit number</strong> (e.g. A01) as the
              account number when paying &mdash; this is how PropTrack matches the payment to the right tenant.
            </p>
          </div>
        )}
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