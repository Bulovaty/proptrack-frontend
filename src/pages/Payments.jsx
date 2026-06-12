import { useState, useEffect } from "react";
import { apiGetPayments, apiAddPayment, apiVerifyMpesa } from "../api";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVerify, setShowVerify] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [mpesaCode, setMpesaCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [addForm, setAddForm] = useState({ tenant_id: "", unit_id: "", amount: "", transaction_id: "", phone: "" });

  useEffect(() => {
    apiGetPayments()
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const verified = payments.filter(p => p.status === "verified").length;
  const totalCollected = payments.filter(p => p.status === "verified").reduce((s, p) => s + Number(p.amount), 0);
  const fraudAttempts = payments.filter(p => p.status === "failed").length;

  const handleVerify = async () => {
    if (!mpesaCode.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await apiVerifyMpesa(mpesaCode.trim());
      setVerifyResult(result);
    } catch (err) {
      setVerifyResult({ valid: false, reason: err.message });
    }
    setVerifying(false);
  };

  const recordPayment = async () => {
    if (!addForm.amount || !addForm.transaction_id) return;
    try {
      const newPayment = await apiAddPayment(addForm);
      setPayments([newPayment, ...payments]);
      setAddForm({ tenant_id: "", unit_id: "", amount: "", transaction_id: "", phone: "" });
      setShowAdd(false);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40, color: "var(--text-secondary)" }}>Loading payments...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track and verify M-Pesa rent payments</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-ghost" onClick={() => setShowVerify(true)}>
            🔍 Verify M-Pesa Code
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat-card accent">
          <div className="stat-label">Total Collected</div>
          <div className="stat-value" style={{ fontSize: 26 }}>Ksh {totalCollected.toLocaleString()}</div>
          <div className="stat-sub">{verified} verified payments</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Verification</div>
          <div className="stat-value">{payments.filter(p => p.status === "pending").length}</div>
          <div className="stat-sub">Awaiting confirmation</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Fraud Attempts</div>
          <div className="stat-value">{fraudAttempts}</div>
          <div className="stat-sub" style={{ color: "var(--danger)" }}>Fake receipts blocked</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Unit</th>
              <th>M-Pesa Code</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>
                No payments recorded yet
              </td></tr>
            )}
            {payments.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.tenant || "—"}</td>
                <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{p.unit || "—"}</span></td>
                <td>
                  <span style={{
                    fontFamily: "monospace", fontSize: 12,
                    background: "var(--bg-secondary)", padding: "3px 8px",
                    borderRadius: 4, color: p.status === "failed" ? "var(--danger)" : "var(--text-secondary)"
                  }}>
                    {p.transaction_id}
                  </span>
                  {p.status === "failed" && <span style={{ marginLeft: 6, fontSize: 11, color: "var(--danger)" }}>⚠️ Forged</span>}
                </td>
                <td style={{ fontWeight: 700 }}>Ksh {Number(p.amount).toLocaleString()}</td>
                <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  {new Date(p.paid_at).toLocaleDateString("en-KE")}
                </td>
                <td>
                  <span className={`badge badge-${p.status === "verified" ? "success" : p.status === "failed" ? "danger" : "warning"}`}>
                    {p.status === "verified" ? "✓ Verified" : p.status === "failed" ? "✗ Fake" : "⏳ Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verify Modal */}
      {showVerify && (
        <div className="modal-overlay" onClick={() => { setShowVerify(false); setVerifyResult(null); setMpesaCode(""); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">🔍 Verify M-Pesa Transaction</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Enter the M-Pesa transaction code from the tenant's message. PropTrack verifies it against your payment records — no more fake screenshots.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>M-Pesa Transaction Code</label>
              <input
                className="input"
                placeholder="e.g. QGH7823KLM"
                value={mpesaCode}
                onChange={e => setMpesaCode(e.target.value.toUpperCase())}
                style={{ fontFamily: "monospace", fontSize: 16, letterSpacing: "0.1em" }}
              />
            </div>
            {verifyResult && (
              <div style={{
                padding: 16, borderRadius: 10, marginBottom: 16,
                background: verifyResult.valid ? "var(--accent-dim)" : "var(--danger-dim)",
                border: `1px solid ${verifyResult.valid ? "var(--border-accent)" : "rgba(255,77,109,0.3)"}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: verifyResult.valid ? "var(--accent)" : "var(--danger)" }}>
                  {verifyResult.valid ? "✅ PAYMENT VERIFIED" : "❌ PAYMENT INVALID"}
                </div>
                {verifyResult.valid ? (
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span>Amount: <strong style={{ color: "var(--text-primary)" }}>Ksh {Number(verifyResult.amount).toLocaleString()}</strong></span>
                    <span>Phone: <strong style={{ color: "var(--text-primary)" }}>{verifyResult.phone}</strong></span>
                    <span>Date: <strong style={{ color: "var(--text-primary)" }}>{new Date(verifyResult.date).toLocaleDateString("en-KE")}</strong></span>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--danger)" }}>{verifyResult.reason}</div>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setShowVerify(false); setVerifyResult(null); setMpesaCode(""); }}>Close</button>
              <button className="btn btn-primary" onClick={handleVerify} disabled={verifying || !mpesaCode}>
                {verifying ? "Verifying..." : "Verify Now"}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Amount (Ksh)</label>
                  <input className="input" type="number" placeholder="e.g. 12000"
                    value={addForm.amount}
                    onChange={e => setAddForm({ ...addForm, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>M-Pesa Code</label>
                  <input className="input" placeholder="e.g. QGH7823KLM"
                    value={addForm.transaction_id}
                    onChange={e => setAddForm({ ...addForm, transaction_id: e.target.value.toUpperCase() })}
                    style={{ fontFamily: "monospace" }} />
                </div>
              </div>
              <div className="form-group">
                <label>Tenant Phone</label>
                <input className="input" placeholder="07XXXXXXXX"
                  value={addForm.phone}
                  onChange={e => setAddForm({ ...addForm, phone: e.target.value })} />
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