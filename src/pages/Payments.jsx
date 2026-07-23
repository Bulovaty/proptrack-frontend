import { useState, useEffect } from "react";
import { SkeletonTable } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { IconCreditCard, IconSearch, IconCheck, IconX, IconPlus, IconShield } from "../components/Icons";

const API = import.meta.env.VITE_API_URL + "/api";
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

export default function Payments({ navigate }) {
  const [payments, setPayments] = useState([]);
  const [historyLimited, setHistoryLimited] = useState(false);
  const [historyMonths, setHistoryMonths] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerify, setShowVerify] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [mpesaCode, setMpesaCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [addForm, setAddForm] = useState({ amount: "", transaction_id: "", phone: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/payments")
      .then(data => {
        // Backend now returns { payments, historyLimited, historyMonths }
        // instead of a plain array, so plan-based history trimming can be signaled.
        setPayments(data.payments || []);
        setHistoryLimited(!!data.historyLimited);
        setHistoryMonths(data.historyMonths);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    (p.tenant || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.transaction_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.unit || "").toLowerCase().includes(search.toLowerCase())
  );

  const verified = payments.filter(p => p.status === "verified").length;
  const totalCollected = payments.filter(p => p.status === "verified").reduce((s, p) => s + Number(p.amount), 0);
  const fraudAttempts = payments.filter(p => p.status === "failed").length;

  const handleVerify = async () => {
    if (!mpesaCode.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await apiFetch("/mpesa/verify", {
        method: "POST",
        body: JSON.stringify({ transactionCode: mpesaCode.trim().toUpperCase() }),
      });
      setVerifyResult(result);
    } catch (err) {
      setVerifyResult({ valid: false, reason: err.message });
    }
    setVerifying(false);
  };

  const recordPayment = async () => {
    if (!addForm.amount || !addForm.transaction_id) return;
    try {
      const newPayment = await apiFetch("/payments", { method: "POST", body: JSON.stringify(addForm) });
      setPayments([newPayment, ...payments]);
      setAddForm({ amount: "", transaction_id: "", phone: "" });
      setShowAdd(false);
    } catch (err) { alert(err.message); }
  };

  if (loading) return (
    <div>
      <div className="page-header"><div><h1 className="page-title">Payments</h1></div></div>
      <SkeletonTable rows={5} cols={6} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track and verify M-Pesa rent payments</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={() => setShowVerify(true)} style={{ gap: 6 }}>
            <IconShield size={15} /> Verify Code
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ gap: 6 }}>
            <IconPlus size={15} /> Record Payment
          </button>
        </div>
      </div>

      {historyLimited && (
        <div className="sub-banner" style={{ marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              Showing the last {historyMonths} months of payments
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>
              Upgrade to Growth or Pro to see your full payment history
            </div>
          </div>
          <button className="btn btn-primary" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => navigate("billing")}>
            Upgrade
          </button>
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card accent">
          <div className="stat-glow" />
          <div className="stat-label">Total Collected</div>
          <div className="stat-value" style={{ fontSize: "clamp(16px, 3vw, 26px)" }}>Ksh {totalCollected.toLocaleString()}</div>
          <div className="stat-sub">{verified} verified payments</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{payments.filter(p => p.status === "pending").length}</div>
          <div className="stat-sub">Awaiting confirmation</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-glow" />
          <div className="stat-label">Fraud Blocked</div>
          <div className="stat-value">{fraudAttempts}</div>
          <div className="stat-sub">Fake receipts rejected</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="search-bar">
          <IconSearch size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input placeholder="Search by tenant, unit or M-Pesa code..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={<IconCreditCard size={40} />}
          title="No payments recorded"
          subtitle="Payments appear here automatically once your Paybill is connected, or you can record them manually"
          action="Record Payment"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tenant</th><th>Unit</th><th>M-Pesa Code</th>
                <th>Amount</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.tenant || "\u2014"}</td>
                  <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{p.unit || "\u2014"}</span></td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: 11, background: "var(--bg-secondary)", padding: "2px 7px", borderRadius: 4, color: p.status === "failed" ? "var(--danger)" : "var(--text-secondary)" }}>
                      {p.transaction_id}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>Ksh {Number(p.amount).toLocaleString()}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{new Date(p.paid_at).toLocaleDateString("en-KE")}</td>
                  <td>
                    <span className={`badge badge-${p.status === "verified" ? "success" : p.status === "failed" ? "danger" : "warning"}`}>
                      {p.status === "verified" ? "Verified" : p.status === "failed" ? "Fake" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && payments.length > 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, color: "var(--text-muted)" }}>No results for &quot;{search}&quot;</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Verify Modal */}
      {showVerify && (
        <div className="modal-overlay" onClick={() => { setShowVerify(false); setVerifyResult(null); setMpesaCode(""); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Verify M-Pesa Transaction</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
              Enter the M-Pesa code from the tenant. PropTrack checks it against verified payment records.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>M-Pesa Transaction Code</label>
              <input className="input" placeholder="e.g. QGH7823KLM" value={mpesaCode}
                onChange={e => setMpesaCode(e.target.value.toUpperCase())}
                style={{ fontFamily: "monospace", fontSize: 15, letterSpacing: "0.08em" }}
                autoComplete="off" spellCheck="false" />
            </div>
            {verifyResult && (
              <div style={{
                padding: 14, borderRadius: 10, marginBottom: 16,
                background: verifyResult.valid ? "var(--accent-dim)" : "var(--danger-dim)",
                border: `1px solid ${verifyResult.valid ? "var(--border-accent)" : "rgba(255,77,109,0.2)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, marginBottom: verifyResult.valid ? 10 : 0, color: verifyResult.valid ? "var(--accent)" : "var(--danger)" }}>
                  {verifyResult.valid ? <IconCheck size={16} /> : <IconX size={16} />}
                  {verifyResult.valid ? "Payment Verified" : "Payment Invalid"}
                </div>
                {verifyResult.valid && (
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>Amount: <strong style={{ color: "var(--text-primary)" }}>Ksh {Number(verifyResult.amount).toLocaleString()}</strong></span>
                    {verifyResult.tenant && <span>Tenant: <strong style={{ color: "var(--text-primary)" }}>{verifyResult.tenant}</strong></span>}
                    {verifyResult.unit && <span>Unit: <strong style={{ color: "var(--text-primary)" }}>{verifyResult.unit}</strong></span>}
                    <span>Date: <strong style={{ color: "var(--text-primary)" }}>{new Date(verifyResult.date).toLocaleDateString("en-KE")}</strong></span>
                  </div>
                )}
                {!verifyResult.valid && <div style={{ fontSize: 13, color: "var(--danger)", marginTop: 4 }}>{verifyResult.reason}</div>}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setShowVerify(false); setVerifyResult(null); setMpesaCode(""); }}>Close</button>
              <button className="btn btn-primary" onClick={handleVerify} disabled={verifying || !mpesaCode}>
                {verifying ? "Checking..." : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Record Payment</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Amount (Ksh)</label>
                  <input className="input" type="number" inputMode="numeric" placeholder="e.g. 12000"
                    value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>M-Pesa Code</label>
                  <input className="input" placeholder="e.g. QGH7823KLM" value={addForm.transaction_id}
                    onChange={e => setAddForm({ ...addForm, transaction_id: e.target.value.toUpperCase() })}
                    style={{ fontFamily: "monospace" }} autoComplete="off" />
                </div>
              </div>
              <div className="form-group">
                <label>Tenant Phone</label>
                <input className="input" placeholder="07XXXXXXXX" type="tel" inputMode="numeric"
                  value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} autoComplete="tel" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={recordPayment}>Save Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}