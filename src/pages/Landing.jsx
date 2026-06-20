import { useState } from "react";
import { useMode } from "../context/ModeContext";
import { LogoFull } from "../components/Logo";
import {
  IconSun, IconMoon, IconMenu, IconX, IconCheck,
  IconCreditCard, IconBuilding, IconUsers, IconBell,
  IconHome, IconSearch, IconShield, IconArrowRight,
  IconChevronDown, IconMpesa, IconTrendingUp, IconLock
} from "../components/Icons";
import "./Landing.css";

const FEATURES = [
  { Icon: IconCreditCard, title: "M-Pesa Verification", desc: "Every payment auto-verified against Safaricom records in real time. No more fake screenshots ever." },
  { Icon: IconBuilding, title: "Property Management", desc: "Manage multiple properties and all their units from one clean dashboard." },
  { Icon: IconUsers, title: "Tenant Tracking", desc: "Full tenant profiles, payment history, and arrears tracking. Search any tenant in seconds." },
  { Icon: IconBell, title: "Automated SMS", desc: "Send rent reminders to all tenants in one click. Save up to Ksh 5,000 a month in airtime." },
  { Icon: IconHome, title: "Vacancy Listings", desc: "Post vacant units with photos and share links on WhatsApp instantly to fill them faster." },
  { Icon: IconSearch, title: "Smart Search", desc: "Find any tenant, unit, or past M-Pesa payment instantly. Your entire history, one search away." },
];

const PLANS = [
  { name: "Starter", price: "1,500", properties: "1 property", units: "20 units" },
  { name: "Growth", price: "3,500", properties: "5 properties", units: "100 units", popular: true },
  { name: "Pro", price: "6,000", properties: "Unlimited", units: "Unlimited" },
];

const STEPS = [
  { num: "01", title: "Create your account", desc: "Sign up free. No credit card needed." },
  { num: "02", title: "Add your properties", desc: "Enter your properties and name each unit." },
  { num: "03", title: "Add your tenants", desc: "Link each tenant to their unit with one click." },
  { num: "04", title: "Connect your Paybill", desc: "One-time setup with Safaricom. Takes 10 minutes." },
  { num: "05", title: "Payments auto-record", desc: "Every tenant payment appears instantly, verified." },
];

const FAQS = [
  { q: "Do my tenants need to change how they pay?", a: "No. Tenants keep paying your existing Paybill exactly as before. PropTrack listens to your Paybill and records payments automatically." },
  { q: "How does M-Pesa fraud prevention work?", a: "Every payment is verified against Safaricom's actual records in real time. Fake M-Pesa screenshots are detected and flagged immediately." },
  { q: "How long does M-Pesa integration take to set up?", a: "About 10 minutes of setup, then 2-5 business days for Safaricom's Go-Live approval. After that, payments appear automatically forever." },
  { q: "Can I manage multiple properties?", a: "Yes. Add as many properties as your plan allows, each with their own units and tenants. Everything stays organized and separate." },
  { q: "What happens to my data if I cancel?", a: "Your data remains accessible for 30 days after cancellation. You can export everything before your account closes." },
];

export default function Landing({ onGetStarted, onLogin }) {
  const { mode, toggle } = useMode();
  const [openFaq, setOpenFaq] = useState(null);
  const [showPolicy, setShowPolicy] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <LogoFull height={28} />
          </div>

          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <button className="btn btn-ghost nav-login" onClick={() => { setMenuOpen(false); onLogin(); }}>Sign In</button>
            <button className="btn btn-primary" onClick={() => { setMenuOpen(false); onGetStarted(); }}>Get Started Free</button>
          </div>

          <div className="nav-actions">
            <button className="mode-toggle" onClick={toggle} title="Toggle mode" aria-label="Toggle dark/light mode">
              {mode === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
            <button className="hamburger-landing" onClick={() => setMenuOpen(m => !m)} aria-label="Toggle menu">
              {menuOpen ? <IconX size={18} /> : <IconMenu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
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
            Start Free <IconArrowRight size={16} />
          </button>
          <button className="btn btn-ghost hero-btn" onClick={onLogin}>
            Sign In
          </button>
        </div>
        <p className="hero-note">Free to start &middot; No credit card &middot; Cancel anytime</p>

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

      {/* Features */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-badge">Features</div>
          <h2 className="section-title-lg">Everything agents need.<br />Nothing they don&apos;t.</h2>
          <p className="section-sub">Built specifically for small and mid-size property agents in Kenya.</p>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon-wrap"><f.Icon size={22} /></div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="section-badge">How It Works</div>
          <h2 className="section-title-lg">Up and running in minutes</h2>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
                {i < STEPS.length - 1 && <div className="step-arrow"><IconArrowRight size={14} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Trust Bar */}
      <section className="trust-bar">
        <div className="section-inner">
          <div className="trust-items">
            {[
              [IconShield, "Bank-level encryption"],
              [IconLock, "JWT secured sessions"],
              [IconMpesa, "Safaricom verified"],
              [IconTrendingUp, "99.9% uptime"],
            ].map(([Ic, label]) => (
              <div key={label} className="trust-item">
                <Ic size={16} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
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
                <div className="pricing-limits">
                  <span>{p.properties}</span>
                  <span className="pricing-divider">&middot;</span>
                  <span>{p.units}</span>
                </div>
                <div className="pricing-amount">
                  Ksh {p.price}<span className="pricing-period">/month</span>
                </div>
                <button className="btn btn-primary pricing-btn" onClick={onGetStarted}>
                  Get Started <IconArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt" id="faq">
        <div className="section-inner">
          <div className="section-badge">FAQ</div>
          <h2 className="section-title-lg">Common questions</h2>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? "open" : ""}`} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q">
                  <span>{f.q}</span>
                  <span className="faq-icon"><IconChevronDown size={16} /></span>
                </div>
                {openFaq === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="section-inner cta-inner">
          <h2 className="cta-title">Ready to modernize your property management?</h2>
          <p className="cta-sub">Join agents already saving time and money with PropTrack.</p>
          <button className="btn btn-primary hero-btn" onClick={onGetStarted}>
            Create Free Account <IconArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: 8 }}>
              <LogoFull height={22} />
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
              <button onClick={() => setShowPolicy("acceptable")}>Acceptable Use</button>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Contact</div>
              <a href="mailto:support@proptrack.co.ke">support@proptrack.co.ke</a>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Nairobi, Kenya</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} PropTrack. All rights reserved.</span>
          <span>Made in Kenya &middot; Powered by M-Pesa</span>
        </div>
      </footer>

      {/* Policy Modals */}
      {showPolicy && (
        <div className="modal-overlay" onClick={() => setShowPolicy(null)}>
          <div className="modal policy-modal" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPolicy(null)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", padding: 4 }}>
              <IconX size={18} />
            </button>
            {showPolicy === "terms" && <TermsContent />}
            {showPolicy === "privacy" && <PrivacyContent />}
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
        <p>By creating a PropTrack account you agree to these Terms in full.</p>
        <h3>1. Eligibility</h3>
        <p>You must be 18 or older. All information provided must be accurate and current.</p>
        <h3>2. Permitted Use</h3>
        <p>PropTrack is for legitimate property management — managing rental properties, tracking payments, sending tenant reminders, and listing vacant units.</p>
        <h3>3. Subscription and Billing</h3>
        <p>Subscriptions are billed monthly via M-Pesa and renew automatically every 30 days. You may cancel at any time. We may modify pricing with 30 days notice.</p>
        <h3>4. M-Pesa Integration</h3>
        <p>You are responsible for registering your Paybill with Safaricom Daraja. PropTrack does not hold or process tenant funds at any point.</p>
        <h3>5. Data Ownership</h3>
        <p>You own all data you enter. You are the data controller for tenant information and must comply with Kenya's Data Protection Act 2019.</p>
        <h3>6. Prohibited Activities</h3>
        <p>You may not use PropTrack to process fraudulent transactions, store unauthorized data, violate Kenyan law, or attempt to hack or reverse-engineer the platform.</p>
        <h3>7. Limitation of Liability</h3>
        <p>PropTrack is not liable for payment disputes between agents and tenants, Safaricom outages, or data loss beyond our reasonable control.</p>
        <h3>8. Termination</h3>
        <p>We may terminate accounts that violate these Terms. Data remains accessible for 30 days after termination.</p>
        <h3>9. Governing Law</h3>
        <p>These Terms are governed by the laws of Kenya. Disputes shall be resolved in Nairobi, Kenya.</p>
        <h3>10. Contact</h3>
        <p>support@proptrack.co.ke</p>
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
        <p>PropTrack complies with Kenya's Data Protection Act 2019.</p>
        <h3>1. Data We Collect</h3>
        <p>Account info (name, email), property and tenant data you enter, M-Pesa transaction records, SMS logs, and usage analytics.</p>
        <h3>2. How We Use It</h3>
        <p>To provide PropTrack services, verify M-Pesa payments, send SMS reminders, generate reports, and improve the platform.</p>
        <h3>3. Data Sharing</h3>
        <p>We never sell your data. We share only with Safaricom (payment verification), Africa's Talking (SMS delivery), and hosting providers as sub-processors.</p>
        <h3>4. Security</h3>
        <p>HTTPS encryption, bcrypt password hashing, JWT session tokens, rate limiting, and input validation protect your data.</p>
        <h3>5. Your Rights</h3>
        <p>You have the right to access, correct, export, or delete your data at any time. Contact support@proptrack.co.ke.</p>
        <h3>6. Data Retention</h3>
        <p>Active accounts retain data indefinitely. Cancelled accounts are deleted 30 days after cancellation.</p>
        <h3>7. Contact</h3>
        <p>support@proptrack.co.ke &mdash; Nairobi, Kenya</p>
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
        <p>PropTrack is for legitimate property management — managing residential or commercial rentals, tracking payments, and communicating with tenants about their tenancy.</p>
        <h3>2. Prohibited Activities</h3>
        <p>You must not: process fraudulent M-Pesa transactions, store tenant data without consent, send unsolicited messages, violate Kenyan law, harass tenants, or attempt to compromise the platform.</p>
        <h3>3. SMS Usage</h3>
        <p>Automated SMS must only be sent to tenants with active tenancy relationships. Bulk messaging for non-rent purposes is prohibited.</p>
        <h3>4. Enforcement</h3>
        <p>Violations may result in immediate account suspension. We cooperate with Kenyan law enforcement when legally required.</p>
        <h3>5. Reporting</h3>
        <p>Report abuse to support@proptrack.co.ke</p>
      </div>
    </>
  );
}
