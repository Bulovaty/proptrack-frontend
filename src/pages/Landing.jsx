import { useState } from "react";
import { useMode } from "../context/ModeContext";
import "./Landing.css";

const FEATURES = [
  {
    icon: "\u{1F4B3}",
    title: "M-Pesa Verification",
    desc: "Every payment auto-verified against Safaricom records in real time. No more fake screenshots ever."
  },
  {
    icon: "\u{1F3E2}",
    title: "Property Management",
    desc: "Manage multiple properties and all their units from one clean dashboard. Add, track, and assign instantly."
  },
  {
    icon: "\u{1F465}",
    title: "Tenant Tracking",
    desc: "Full tenant profiles, move-in dates, payment history, arrears tracking. Search any tenant in seconds."
  },
  {
    icon: "\u{1F4F1}",
    title: "Automated SMS",
    desc: "Send rent reminders to all tenants in one click. Save up to Ksh 5,000 a month in airtime."
  },
  {
    icon: "\u{1F3E0}",
    title: "Vacancy Listings",
    desc: "Post vacant units with photos and share links on WhatsApp instantly to fill them faster."
  },
  {
    icon: "\u{1F50D}",
    title: "Smart Search",
    desc: "Find any tenant, unit, or past M-Pesa payment instantly. Your entire history, one search away."
  },
];

const PLANS = [
  { name: "Starter", price: "1,500", units: "10 units", color: "var(--accent)" },
  { name: "Growth", price: "3,500", units: "50 units", color: "var(--accent-2)", popular: true },
  { name: "Pro", price: "6,000", units: "Unlimited", color: "var(--purple)" },
];

const FAQS = [
  {
    q: "Do my tenants need to change how they pay?",
    a: "No. Tenants keep paying your existing Paybill exactly as before. PropTrack listens to your Paybill and records payments automatically."
  },
  {
    q: "How does M-Pesa fraud prevention work?",
    a: "Every payment is verified against Safaricom's actual records in real time. Fake M-Pesa screenshots are detected and flagged immediately."
  },
  {
    q: "How long does M-Pesa integration take to set up?",
    a: "About 10 minutes of setup, then 2-5 business days for Safaricom's approval. After that, payments appear automatically forever."
  },
  {
    q: "Can I manage multiple properties?",
    a: "Yes. Add as many properties as your plan allows, each with their own units and tenants. Everything stays organized and separate."
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your data remains accessible for 30 days after cancellation. You can export everything before your account closes."
  },
];

export default function Landing({ onGetStarted, onLogin }) {
  const { mode, toggle } = useMode();
  const [openFaq, setOpenFaq] = useState(null);
  const [showPolicy, setShowPolicy] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="nav-logo-icon">P</span>
            <span className="nav-logo-text">PropTrack</span>
          </div>

          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <button className="btn btn-ghost nav-login" onClick={onLogin}>Sign In</button>
            <button className="btn btn-primary" onClick={onGetStarted}>Get Started Free</button>
          </div>

          <div className="nav-actions">
            <button className="mode-toggle" onClick={toggle} title="Toggle dark/light mode">
              {mode === "dark" ? "\u2600\uFE0F" : "\u{1F319}"}
            </button>
            <button className="hamburger" onClick={() => setMenuOpen(m => !m)}>
              {menuOpen ? "\u2715" : "\u2630"}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Built for Kenyan Property Agents
        </div>
        <h1 className="hero-title">
          Property management<br />
          <span className="hero-accent">that actually works</span><br />
          in Kenya.
        </h1>
        <p className="hero-sub">
          Track tenants, verify M-Pesa payments automatically, send SMS reminders,
          and list vacant units &mdash; all in one place. No more logbooks. No more fake receipts.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary hero-btn" onClick={onGetStarted}>
            Start Free &rarr;
          </button>
          <button className="btn btn-ghost hero-btn" onClick={onLogin}>
            Sign In
          </button>
        </div>
        <p className="hero-note">Free to start &middot; No credit card &middot; Cancel anytime</p>

        {/* Floating stats */}
        <div className="hero-stats">
          {[
            ["Ksh 5,000", "Saved monthly on airtime"],
            ["0", "Fake payments accepted"],
            ["Seconds", "To verify any payment"],
          ].map(([val, label]) => (
            <div key={label} className="hero-stat">
              <div className="hero-stat-val">{val}</div>
              <div className="hero-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────────── */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-badge">Features</div>
          <h2 className="section-title-lg">
            Everything agents need.<br />Nothing they don't.
          </h2>
          <p className="section-sub">
            Built specifically for small and mid-size property agents in Kenya.
            No complicated software. No hidden fees.
          </p>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-badge">How It Works</div>
          <h2 className="section-title-lg">Up and running in minutes</h2>
          <div className="steps-grid">
            {[
              ["\u0031\uFE0F\u20E3", "Create your account", "Sign up free. No credit card needed."],
              ["\u0032\uFE0F\u20E3", "Add your properties", "Enter your properties and name each unit."],
              ["\u0033\uFE0F\u20E3", "Add your tenants", "Link each tenant to their unit with one click."],
              ["\u0034\uFE0F\u20E3", "Connect your Paybill", "One-time setup with Safaricom. Takes 10 minutes."],
              ["\u0035\uFE0F\u20E3", "Payments auto-record", "Every tenant payment appears instantly, verified."],
            ].map(([num, title, desc]) => (
              <div key={title} className="step-card">
                <div className="step-num">{num}</div>
                <div className="step-title">{title}</div>
                <div className="step-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────────────────────────── */}
      <section className="section" id="pricing">
        <div className="section-inner">
          <div className="section-badge">Pricing</div>
          <h2 className="section-title-lg">Simple, honest pricing</h2>
          <p className="section-sub">Pay via M-Pesa. No contracts. Cancel anytime.</p>
          <div className="pricing-grid">
            {PLANS.map(p => (
              <div key={p.name} className={`pricing-card ${p.popular ? "popular" : ""}`}>
                {p.popular && <div className="popular-badge">Most Popular</div>}
                <div className="pricing-name">{p.name}</div>
                <div className="pricing-units">{p.units}</div>
                <div className="pricing-amount" style={{ color: p.color }}>
                  Ksh {p.price}
                  <span className="pricing-period">/month</span>
                </div>
                <button className="btn btn-primary pricing-btn" onClick={onGetStarted}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="section section-alt" id="faq">
        <div className="section-inner">
          <div className="section-badge">FAQ</div>
          <h2 className="section-title-lg">Common questions</h2>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q">
                  {f.q}
                  <span className="faq-icon">{openFaq === i ? "\u2212" : "\u002B"}</span>
                </div>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="section cta-section">
        <div className="section-inner cta-inner">
          <h2 className="cta-title">Ready to modernize your property management?</h2>
          <p className="cta-sub">Join agents already saving time and money with PropTrack.</p>
          <button className="btn btn-primary hero-btn" onClick={onGetStarted}>
            Create Free Account &rarr;
          </button>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: 8 }}>
              <span className="nav-logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>P</span>
              <span className="nav-logo-text" style={{ fontSize: 16 }}>PropTrack</span>
            </div>
            <p className="footer-tagline">Property management built for Kenya.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <div className="footer-col-title">Product</div>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Legal</div>
              <button onClick={() => setShowPolicy("terms")}>Terms of Service</button>
              <button onClick={() => setShowPolicy("privacy")}>Privacy Policy</button>
              <button onClick={() => setShowPolicy("refund")}>Refund Policy</button>
              <button onClick={() => setShowPolicy("acceptable")}>Acceptable Use</button>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Contact</div>
              <a href="mailto:support@proptrack.co.ke">support@proptrack.co.ke</a>
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Nairobi, Kenya</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} PropTrack. All rights reserved.</span>
          <span>Made in Kenya &middot; Powered by M-Pesa</span>
        </div>
      </footer>

      {/* ─── Policy Modals ──────────────────────────────────────────────────── */}
      {showPolicy && (
        <div className="modal-overlay" onClick={() => setShowPolicy(null)}>
          <div className="modal policy-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPolicy(null)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 20 }}>&times;</button>
            {showPolicy === "terms" && <TermsContent />}
            {showPolicy === "privacy" && <PrivacyContent />}
            {showPolicy === "refund" && <RefundContent />}
            {showPolicy === "acceptable" && <AcceptableUseContent />}
          </div>
        </div>
      )}
    </div>
  );
}

function TermsContent() {
  return (
    <>
      <h2 className="modal-title">Terms of Service</h2>
      <div className="policy-body">
        <p><strong>Effective Date:</strong> {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>
        <h3>1. Acceptance of Terms</h3>
        <p>By creating an account on PropTrack, you agree to these Terms of Service. If you do not agree, do not use the platform.</p>
        <h3>2. Description of Service</h3>
        <p>PropTrack is a property management SaaS platform for Kenyan property agents. It provides tools for tenant management, M-Pesa payment verification, SMS reminders, and property listings.</p>
        <h3>3. Account Responsibility</h3>
        <p>You are responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
        <h3>4. Subscription and Billing</h3>
        <p>Subscriptions are billed monthly via M-Pesa. Plans renew automatically every 30 days. You may cancel at any time, and your access continues until the end of the paid period.</p>
        <h3>5. Data Ownership</h3>
        <p>You retain full ownership of all data you enter into PropTrack, including tenant information, payment records, and property details. We do not sell your data to third parties.</p>
        <h3>6. M-Pesa Integration</h3>
        <p>PropTrack integrates with Safaricom's Daraja API. Users are responsible for ensuring their Paybill is properly registered with Safaricom. PropTrack does not handle or hold tenant funds at any point.</p>
        <h3>7. Prohibited Uses</h3>
        <p>You may not use PropTrack to process fraudulent transactions, store unauthorized personal data, or violate any applicable Kenyan laws including the Data Protection Act 2019.</p>
        <h3>8. Limitation of Liability</h3>
        <p>PropTrack is not liable for payment disputes between agents and tenants, Safaricom service interruptions, or data loss due to circumstances beyond our control.</p>
        <h3>9. Termination</h3>
        <p>We may terminate accounts that violate these terms. Upon termination, your data remains accessible for 30 days for export purposes.</p>
        <h3>10. Governing Law</h3>
        <p>These terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.</p>
        <h3>11. Contact</h3>
        <p>Questions about these terms: <strong>support@proptrack.co.ke</strong></p>
      </div>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <h2 className="modal-title">Privacy Policy</h2>
      <div className="policy-body">
        <p><strong>Effective Date:</strong> {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>
        <p>PropTrack is committed to protecting your privacy in compliance with Kenya's Data Protection Act 2019.</p>
        <h3>1. Information We Collect</h3>
        <p>We collect: account information (name, email), property and tenant data you enter, M-Pesa transaction records, SMS logs, and usage analytics.</p>
        <h3>2. How We Use Your Information</h3>
        <p>To provide the PropTrack service, send transactional SMS notifications, verify M-Pesa payments, generate reports, and improve our platform.</p>
        <h3>3. Data Storage</h3>
        <p>Your data is stored on secure servers hosted by Railway (USA). We use industry-standard encryption in transit (HTTPS/TLS) and at rest.</p>
        <h3>4. Data Sharing</h3>
        <p>We do not sell your data. We share data only with: Safaricom (payment verification), Africa's Talking (SMS delivery), and as required by Kenyan law.</p>
        <h3>5. Tenant Data</h3>
        <p>You are the data controller for tenant information entered into PropTrack. You are responsible for obtaining appropriate consent from your tenants as required by Kenyan law.</p>
        <h3>6. Your Rights</h3>
        <p>Under Kenya's Data Protection Act, you have the right to access, correct, or delete your data. Contact support@proptrack.co.ke to exercise these rights.</p>
        <h3>7. Data Retention</h3>
        <p>Active accounts: data retained indefinitely. Cancelled accounts: data retained for 30 days then permanently deleted.</p>
        <h3>8. Cookies</h3>
        <p>We use only essential authentication tokens stored in your browser's local storage. No third-party tracking cookies.</p>
        <h3>9. Contact</h3>
        <p>Privacy concerns: <strong>support@proptrack.co.ke</strong></p>
      </div>
    </>
  );
}

function RefundContent() {
  return (
    <>
      <h2 className="modal-title">Refund Policy</h2>
      <div className="policy-body">
        <p><strong>Effective Date:</strong> {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>
        <h3>1. Monthly Subscriptions</h3>
        <p>All subscription payments are non-refundable once processed. We encourage you to use the free trial period to evaluate PropTrack before subscribing.</p>
        <h3>2. Failed Payments</h3>
        <p>If your M-Pesa payment is deducted but your plan is not upgraded within 24 hours, contact support@proptrack.co.ke with your M-Pesa transaction code for immediate resolution.</p>
        <h3>3. Service Outages</h3>
        <p>In the event of an extended service outage (more than 48 consecutive hours) caused by PropTrack, affected users may be eligible for a prorated credit on their next billing cycle.</p>
        <h3>4. Cancellations</h3>
        <p>You may cancel at any time. Access continues until the end of your paid period. No partial refunds for unused days.</p>
        <h3>5. Disputes</h3>
        <p>For any billing disputes, contact support@proptrack.co.ke within 7 days of the charge. We will review and respond within 3 business days.</p>
      </div>
    </>
  );
}

function AcceptableUseContent() {
  return (
    <>
      <h2 className="modal-title">Acceptable Use Policy</h2>
      <div className="policy-body">
        <p><strong>Effective Date:</strong> {new Date().toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</p>
        <h3>1. Permitted Uses</h3>
        <p>PropTrack is for legitimate property management activities: managing residential or commercial rental properties, tracking tenant payments, and communicating with tenants about their tenancy.</p>
        <h3>2. Prohibited Activities</h3>
        <p>You must not use PropTrack to: process fraudulent M-Pesa transactions, store tenant data without their knowledge, send unsolicited commercial messages unrelated to tenancy, circumvent Safaricom's payment systems, violate any Kenyan law, or harass tenants.</p>
        <h3>3. Tenant Data</h3>
        <p>Tenant personal data (names, phone numbers) must only be used for legitimate property management purposes. You may not share tenant data with third parties without explicit consent.</p>
        <h3>4. SMS Usage</h3>
        <p>Automated SMS reminders must only be sent to tenants with whom you have an active tenancy relationship. Bulk messaging for purposes unrelated to rent reminders is prohibited.</p>
        <h3>5. Enforcement</h3>
        <p>Violation of this policy may result in immediate account suspension without refund. We will cooperate with Kenyan law enforcement when legally required.</p>
        <h3>6. Reporting Violations</h3>
        <p>Report abuse to <strong>support@proptrack.co.ke</strong></p>
      </div>
    </>
  );
}