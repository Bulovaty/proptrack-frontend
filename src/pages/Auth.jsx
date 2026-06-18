import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMode } from "../context/ModeContext";
import "./Auth.css";

export default function Auth({ initialTab = "login", onBack }) {
  const { login, register, error, setError } = useAuth();
  const { mode, toggle } = useMode();
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setError("");
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    setLoading(true);
    await login(form.email, form.password);
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) return setError("Please fill in all fields.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (!agreed) return setError("Please agree to the Terms of Service and Privacy Policy.");
    setLoading(true);
    await register(form.name, form.email, form.password);
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">P</div>
          <span className="auth-brand-name">PropTrack</span>
        </div>
        <div className="auth-hero">
          <h1 className="auth-headline">Property management<br />built for Kenya.</h1>
          <p className="auth-sub">Track tenants, verify M-Pesa payments, send automated reminders, and list vacant units.</p>
        </div>
        <div className="auth-features">
          {[
            ["\u{1F4B3}", "M-Pesa Verification", "Block forged receipts instantly"],
            ["\u{1F4E8}", "Automated SMS", "Save Ksh 5,000/month on airtime"],
            ["\u{1F3E0}", "Listings", "Fill vacancies faster"],
            ["\u{1F3E2}", "Property Management", "All properties in one place"],
          ].map(([icon, title, desc]) => (
            <div key={title} className="auth-feature">
              <span className="auth-feature-icon">{icon}</span>
              <div>
                <div className="auth-feature-title">{title}</div>
                <div className="auth-feature-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        {/* Top controls */}
        <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 8 }}>
          <button className="mode-toggle" onClick={toggle} title="Toggle dark/light mode">
            {mode === "dark" ? "\u2600\uFE0F" : "\u{1F319}"}
          </button>
          {onBack && (
            <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: 13, padding: "7px 14px" }}>
              &larr; Back
            </button>
          )}
        </div>

        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign In</button>
            <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Create Account</button>
          </div>

          {tab === "login" ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="auth-welcome">
                <h2>Welcome back</h2>
                <p>Sign in to your PropTrack account</p>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input className="input" type="email" placeholder="Enter your email" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="input" type="password" placeholder="Enter your password" value={form.password} onChange={e => update("password", e.target.value)} />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <div className="auth-switch">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => { setTab("register"); setError(""); }}>Create one free</button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="auth-welcome">
                <h2>Create your account</h2>
                <p>Start managing your properties today</p>
              </div>
              <div className="form-group">
                <label>Full Name / Agency Name</label>
                <input className="input" placeholder="Enter your name or agency name" value={form.name} onChange={e => update("name", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input className="input" type="email" placeholder="Enter your email" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="input" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => update("password", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input className="input" type="password" placeholder="Repeat your password" value={form.confirm} onChange={e => update("confirm", e.target.value)} />
              </div>
              {/* User Agreement */}
              <label className="agreement-label">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setError(""); }}
                  className="agreement-checkbox"
                />
                <span>
                  I agree to PropTrack&apos;s{" "}
                  <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>.
                  I confirm I am a property agent using this platform for legitimate property management purposes.
                </span>
              </label>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
              <div className="auth-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => { setTab("login"); setError(""); }}>Sign in</button>
              </div>
              <div className="auth-terms">
                Free Starter plan &middot; No credit card required &middot; Cancel anytime
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}