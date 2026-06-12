import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Auth() {
  const { login, register, error, setError } = useAuth();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const update = (field, value) => {
    setError("");
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate API call
    login(form.email, form.password);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.confirm)
      return setError("Please fill in all fields.");
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    register(form.name, form.email, form.password);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") tab === "login" ? handleLogin() : handleRegister();
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
          <p className="auth-sub">Track tenants, verify M-Pesa payments, send automated reminders, and list vacant units — all in one place.</p>
        </div>
        <div className="auth-features">
          {[
            ["🔍", "M-Pesa Verification", "Block forged receipts instantly"],
            ["📨", "Automated SMS", "Save Ksh 5,000/month on airtime"],
            ["🏠", "Listings", "Fill vacancies faster"],
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
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
            >Sign In</button>
            <button
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
              onClick={() => { setTab("register"); setError(""); }}
            >Create Account</button>
          </div>

          {tab === "login" ? (
            <div className="auth-form">
              <div className="auth-welcome">
                <h2>Welcome back</h2>
                <p>Sign in to your PropTrack account</p>
              </div>

              {/* Demo hint */}
              <div className="demo-hint">
                <strong>Demo:</strong> john@jukiwa.co.ke / agent123
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <button
                className="btn btn-primary auth-submit"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>

              <div className="auth-switch">
                Don't have an account?{" "}
                <button onClick={() => { setTab("register"); setError(""); }}>Create one free</button>
              </div>
            </div>
          ) : (
            <div className="auth-form">
              <div className="auth-welcome">
                <h2>Create your account</h2>
                <p>Start managing your properties today</p>
              </div>

              <div className="form-group">
                <label>Full Name / Agency Name</label>
                <input
                  className="input"
                  placeholder="e.g. Jukiwa Property Agents"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update("email", e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={e => update("confirm", e.target.value)}
                  onKeyDown={handleKey}
                />
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <button
                className="btn btn-primary auth-submit"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account →"}
              </button>

              <div className="auth-switch">
                Already have an account?{" "}
                <button onClick={() => { setTab("login"); setError(""); }}>Sign in</button>
              </div>

              <div className="auth-terms">
                By creating an account you agree to our Terms of Service. Free Starter plan — no credit card required.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
