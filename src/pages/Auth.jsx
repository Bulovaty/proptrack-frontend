import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMode } from "../context/ModeContext";
import { LogoFull } from "../components/Logo";
import { IconSun, IconMoon, IconEye, IconEyeOff, IconArrowLeft, IconLock, IconMail, IconUsers, IconShield } from "../components/Icons";
import "./Auth.css";

function PasswordInput({ placeholder, value, onChange, autoComplete, name }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        className="input"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        name={name}
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", display: "flex", alignItems: "center",
          padding: 0, transition: "color 0.15s"
        }}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  );
}

export default function Auth({ initialTab = "login", onBack }) {
  const { login, register, error, setError } = useAuth();
  const { mode, toggle } = useMode();
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPolicy, setShowPolicy] = useState(null);

  const update = (field, value) => { setError(""); setForm(f => ({ ...f, [field]: value })); };

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
    if (!agreed) return setError("Please agree to the Terms of Service and Privacy Policy to continue.");
    setLoading(true);
    await register(form.name, form.email, form.password);
    setLoading(false);
  };

  return (
    <div className="auth-shell">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <LogoFull height={32} />
        </div>
        <div className="auth-hero">
          <h1 className="auth-headline">Property management built for Kenya.</h1>
          <p className="auth-sub">Track tenants, verify M-Pesa payments, send automated reminders, and list vacant units.</p>
        </div>
        <div className="auth-features">
          {[
            [IconLock, "M-Pesa Fraud Prevention", "Block fake receipts instantly"],
            [IconUsers, "Tenant Management", "Full history for every tenant"],
            [IconShield, "Secure & Private", "Your data stays yours, always"],
            [IconMail, "Automated SMS", "Save Ksh 5,000/month on airtime"],
          ].map(([Ic, title, desc]) => (
            <div key={title} className="auth-feature">
              <span className="auth-feature-icon"><Ic size={16} /></span>
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
        <div className="auth-top-controls">
          <button className="mode-toggle" onClick={toggle} title={mode === "dark" ? "Light mode" : "Dark mode"}>
            {mode === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
          {onBack && (
            <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: 13, padding: "7px 14px", gap: 6 }}>
              <IconArrowLeft size={14} /> Back
            </button>
          )}
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign In</button>
            <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Create Account</button>
          </div>

          {tab === "login" ? (
            <form className="auth-form" onSubmit={handleLogin} autoComplete="on">
              <div className="auth-welcome">
                <h2>Welcome back</h2>
                <p>Sign in to your PropTrack account</p>
              </div>
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input id="login-email" className="input" type="email" name="email" autoComplete="email"
                  placeholder="Enter your email" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <PasswordInput placeholder="Enter your password" value={form.password}
                  onChange={e => update("password", e.target.value)} autoComplete="current-password" name="current-password" />
              </div>
              {error && <div className="auth-error" role="alert">{error}</div>}
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <div className="auth-switch">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => { setTab("register"); setError(""); }}>Create one free</button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister} autoComplete="on">
              <div className="auth-welcome">
                <h2>Create your account</h2>
                <p>Start managing your properties today</p>
              </div>
              <div className="form-group">
                <label htmlFor="reg-name">Full Name / Agency Name</label>
                <input id="reg-name" className="input" name="name" autoComplete="name"
                  placeholder="Enter your name or agency name" value={form.name} onChange={e => update("name", e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input id="reg-email" className="input" type="email" name="email" autoComplete="email"
                  placeholder="Enter your email" value={form.email} onChange={e => update("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <PasswordInput placeholder="Minimum 6 characters" value={form.password}
                  onChange={e => update("password", e.target.value)} autoComplete="new-password" name="new-password" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <PasswordInput placeholder="Repeat your password" value={form.confirm}
                  onChange={e => update("confirm", e.target.value)} autoComplete="new-password" name="confirm-password" />
              </div>

              {/* Agreement */}
              <label className="agreement-label">
                <input type="checkbox" className="agreement-checkbox" checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setError(""); }} />
                <span>
                  I agree to PropTrack&apos;s{" "}
                  <button type="button" className="policy-link" onClick={() => setShowPolicy("terms")}>Terms of Service</button>
                  {" "}and{" "}
                  <button type="button" className="policy-link" onClick={() => setShowPolicy("privacy")}>Privacy Policy</button>.
                  I confirm I am using PropTrack for legitimate property management.
                </span>
              </label>

              {error && <div className="auth-error" role="alert">{error}</div>}
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

      {/* Policy Modal */}
      {showPolicy && (
        <div className="modal-overlay" onClick={() => setShowPolicy(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPolicy(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex" }}>
              <IconX size={18} />
            </button>
            {showPolicy === "terms" ? <TermsContent /> : <PrivacyContent />}
          </div>
        </div>
      )}
    </div>
  );
}

// Long-form Terms of Service
function TermsContent() {
  const date = new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
  return (
    <>
      <h2 className="modal-title">Terms of Service</h2>
      <div className="policy-body">
        <p><strong>Effective Date:</strong> {date} &nbsp;|&nbsp; <strong>Last Updated:</strong> {date}</p>
        <p>Welcome to PropTrack. These Terms of Service govern your use of the PropTrack platform and services. By creating an account, you confirm that you have read, understood, and agree to be bound by these terms in full.</p>

        <h3>1. Definitions</h3>
        <p>"PropTrack", "we", "us", or "our" refers to the PropTrack platform and its operators. "User", "you", or "your" refers to any individual or entity accessing or using PropTrack. "Service" refers to all features, tools, and functionalities provided through PropTrack. "Tenant Data" refers to personal information about tenants that you enter into the platform.</p>

        <h3>2. Eligibility and Account Registration</h3>
        <p>You must be at least 18 years of age to use PropTrack. By registering, you confirm that all information provided is accurate, current, and complete. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must notify us immediately at support@proptrack.co.ke if you suspect unauthorized access.</p>

        <h3>3. Permitted Use</h3>
        <p>PropTrack is designed exclusively for legitimate property management activities in Kenya, including: managing residential and commercial rental properties, tracking tenant rent payments, sending SMS rent reminders to tenants, posting property listings for vacant units, and generating payment reports. Use of PropTrack for any purpose other than property management is prohibited.</p>

        <h3>4. Subscription and Payment</h3>
        <p>PropTrack operates on a monthly subscription basis paid via M-Pesa. Subscriptions are billed on the date of first payment and renew automatically every 30 days. You may upgrade, downgrade, or cancel your plan at any time through the Billing section. Downgrading takes effect at the end of the current billing period. We reserve the right to modify pricing with 30 days' notice to existing subscribers.</p>

        <h3>5. M-Pesa Integration and Payments</h3>
        <p>PropTrack integrates with Safaricom's Daraja API to verify and record M-Pesa payments made to your registered Paybill. You are solely responsible for: registering your Paybill with Safaricom's Daraja platform, ensuring your Safaricom credentials are valid and up to date, and complying with all Safaricom terms and conditions. PropTrack does not hold, process, or transmit tenant funds at any time. All financial transactions remain directly between your tenants and your registered M-Pesa Paybill.</p>

        <h3>6. Data Ownership and Responsibility</h3>
        <p>You retain full ownership of all data you enter into PropTrack. You are the data controller for all tenant personal information, and you are responsible for: obtaining lawful basis for processing tenant data under Kenya's Data Protection Act 2019, ensuring tenants are informed about how their data is used, and responding to tenant data subject requests. PropTrack acts as a data processor on your behalf.</p>

        <h3>7. Prohibited Activities</h3>
        <p>You may not use PropTrack to: process or facilitate fraudulent financial transactions; store or process tenant data without a lawful basis; send unsolicited messages unrelated to tenancy; violate any applicable Kenyan law, including the Kenya Information and Communications Act; attempt to reverse engineer, hack, or compromise the PropTrack platform; impersonate another person or entity; or use PropTrack in connection with any illegal activity.</p>

        <h3>8. Intellectual Property</h3>
        <p>All software, designs, trademarks, and content comprising the PropTrack platform are the intellectual property of PropTrack. You are granted a limited, non-exclusive, non-transferable license to use the platform for its intended purpose only. You may not copy, modify, distribute, or create derivative works from PropTrack's intellectual property.</p>

        <h3>9. Limitation of Liability</h3>
        <p>PropTrack is provided "as is" and "as available". To the maximum extent permitted by Kenyan law, PropTrack and its operators shall not be liable for: disputes between you and your tenants; payment disputes or failed M-Pesa transactions; loss of data due to circumstances beyond our reasonable control; Safaricom API downtime or service interruptions; or indirect, consequential, or incidental damages arising from your use of PropTrack.</p>

        <h3>10. Indemnification</h3>
        <p>You agree to indemnify and hold harmless PropTrack and its operators from any claims, losses, liabilities, damages, costs, or expenses (including legal fees) arising from your violation of these Terms, your use of the Service, your breach of any applicable law, or your violation of any third party rights.</p>

        <h3>11. Termination</h3>
        <p>We may suspend or terminate your account immediately and without notice if we determine that you have violated these Terms. You may terminate your account at any time. Upon termination, your data will remain accessible for 30 days for export, after which it will be permanently deleted.</p>

        <h3>12. Modifications to Terms</h3>
        <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email and in-app notification at least 14 days before taking effect. Continued use of PropTrack after the effective date constitutes acceptance of the revised Terms.</p>

        <h3>13. Governing Law and Dispute Resolution</h3>
        <p>These Terms are governed by the laws of Kenya. Any disputes arising from these Terms or your use of PropTrack shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration in Nairobi, Kenya, or the courts of Nairobi at our election.</p>

        <h3>14. Contact</h3>
        <p>For questions about these Terms: <strong>support@proptrack.co.ke</strong> &nbsp;|&nbsp; Nairobi, Kenya</p>
      </div>
    </>
  );
}

function PrivacyContent() {
  const date = new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
  return (
    <>
      <h2 className="modal-title">Privacy Policy</h2>
      <div className="policy-body">
        <p><strong>Effective Date:</strong> {date} &nbsp;|&nbsp; <strong>Last Updated:</strong> {date}</p>
        <p>PropTrack is committed to protecting the privacy of all users and their tenants in accordance with Kenya's Data Protection Act 2019 and internationally recognized data protection principles. This Privacy Policy explains how we collect, use, store, and protect personal information.</p>

        <h3>1. Information We Collect</h3>
        <p><strong>Account Information:</strong> When you register, we collect your name, email address, and password (stored in hashed form). <strong>Business Information:</strong> Your agency name, Paybill number, and business contact details. <strong>Property Data:</strong> Property names, locations, unit numbers, and descriptions you enter. <strong>Tenant Data:</strong> Names, phone numbers, email addresses, move-in dates, and rent amounts that you enter for your tenants. <strong>Payment Records:</strong> M-Pesa transaction codes, amounts, dates, and associated tenant and unit information received via Safaricom's API. <strong>SMS Logs:</strong> Records of automated reminders sent through Africa's Talking. <strong>Usage Data:</strong> Login timestamps, pages visited, and feature usage for service improvement purposes.</p>

        <h3>2. Legal Basis for Processing</h3>
        <p>We process personal data under the following lawful bases: <strong>Contract Performance</strong> — to provide the PropTrack service you have subscribed to; <strong>Legitimate Interests</strong> — to improve our platform, prevent fraud, and ensure security; <strong>Consent</strong> — where you have provided explicit consent for specific processing activities; <strong>Legal Obligation</strong> — where required by Kenyan law.</p>

        <h3>3. How We Use Your Information</h3>
        <p>We use collected information to: provide and maintain the PropTrack service; process and verify M-Pesa payments for your Paybill; send automated SMS rent reminders to your tenants on your behalf; generate payment reports and analytics for your use; send you service notifications, billing alerts, and product updates; detect and prevent fraud and unauthorized access; and comply with applicable Kenyan laws and regulations.</p>

        <h3>4. Sharing of Information</h3>
        <p>We do not sell, rent, or trade your personal data or your tenant's data to any third party. We share data only in the following limited circumstances: <strong>Safaricom</strong> — payment transaction data is processed through Safaricom's Daraja API for verification purposes; <strong>Africa's Talking</strong> — tenant phone numbers are shared only to deliver SMS reminders you authorize; <strong>Infrastructure Providers</strong> — Railway (hosting) and Vercel (frontend) process data as sub-processors under data processing agreements; <strong>Legal Requirements</strong> — we will disclose data when required by a valid court order or Kenyan law enforcement authority.</p>

        <h3>5. Your Responsibilities as Data Controller</h3>
        <p>When you enter tenant personal data into PropTrack, you become the data controller for that data under Kenya's Data Protection Act 2019. You are responsible for: informing your tenants that their data is processed using PropTrack; ensuring you have a lawful basis to collect and process their information; responding to any tenant requests to access, correct, or delete their data; and ensuring the data you enter is accurate and up to date.</p>

        <h3>6. Data Security</h3>
        <p>We implement industry-standard security measures including: TLS/HTTPS encryption for all data in transit; bcrypt hashing for all passwords (never stored in plain text); JWT tokens with 7-day expiry for session management; rate limiting on authentication endpoints to prevent brute force attacks; input validation and SQL injection prevention; and regular security reviews. No method of electronic storage or transmission is 100% secure. We will notify you promptly in the event of a data breach affecting your account.</p>

        <h3>7. Your Rights Under Kenya's Data Protection Act 2019</h3>
        <p>As a data subject, you have the right to: <strong>Access</strong> — request a copy of all personal data we hold about you; <strong>Rectification</strong> — request correction of inaccurate data; <strong>Erasure</strong> — request deletion of your account and all associated data; <strong>Portability</strong> — receive your data in a portable, machine-readable format; <strong>Objection</strong> — object to certain types of data processing; <strong>Restriction</strong> — request that we limit processing of your data in certain circumstances. To exercise any of these rights, contact us at <strong>support@proptrack.co.ke</strong>. We will respond within 21 days.</p>

        <h3>8. Data Retention</h3>
        <p>Active accounts: data is retained for as long as your account is active. Cancelled accounts: all data is permanently deleted 30 days after cancellation. You may export all your data at any time from the Settings page before cancellation. Backup copies may persist for up to 7 additional days before complete deletion.</p>

        <h3>9. Cookies and Local Storage</h3>
        <p>PropTrack does not use advertising cookies or third-party tracking. We store only: an authentication token in your browser's local storage (required for login); your theme and display preferences; your onboarding completion status. No data collected by PropTrack is shared with advertising networks.</p>

        <h3>10. Children's Privacy</h3>
        <p>PropTrack is a business tool intended for adults aged 18 and over. We do not knowingly collect personal information from anyone under 18. If you believe a minor has created an account, contact us immediately.</p>

        <h3>11. International Data Transfers</h3>
        <p>PropTrack's infrastructure is hosted on servers in the United States (Railway) and globally distributed CDN (Vercel). By using PropTrack, you consent to the transfer of your data to these locations. We ensure that all sub-processors maintain data protection standards equivalent to or exceeding Kenya's Data Protection Act 2019.</p>

        <h3>12. Changes to This Policy</h3>
        <p>We may update this Privacy Policy periodically. Material changes will be communicated via email at least 14 days before taking effect. The "Last Updated" date at the top of this policy reflects the most recent revision.</p>

        <h3>13. Contact and Data Protection Officer</h3>
        <p>For privacy concerns, data subject requests, or to report a data breach: <strong>support@proptrack.co.ke</strong> &nbsp;|&nbsp; Nairobi, Kenya. We aim to respond to all privacy inquiries within 5 business days.</p>
      </div>
    </>
  );
}
