import { useState, useEffect } from "react";
import { SkeletonStat, SkeletonCard } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { IconUsers, IconTrendingUp, IconAlertTriangle, IconHome, IconArrowRight } from "../components/Icons";

const API = "https://proptrack-backend-production-a3e9.up.railway.app/api";
const getToken = () => localStorage.getItem("proptrack_token");
const apiFetch = async (ep) => {
  const r = await fetch(`${API}${ep}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` }
  });
  if (!r.ok) throw new Error("Failed to fetch");
  return r.json();
};

export default function Dashboard({ navigate }) {
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch("/tenants"), apiFetch("/payments"), apiFetch("/listings")])
      .then(([t, p, l]) => {
        setTenants(t);
        // /api/payments now returns { payments, historyLimited, historyMonths }
        // instead of a plain array, since payment history is trimmed by plan tier.
        setPayments(Array.isArray(p) ? p : (p.payments || []));
        setListings(l);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalTenants = tenants.length;
  const paidTenants = tenants.filter(t => t.status === "paid").length;
  const arrearsCount = tenants.filter(t => t.status === "arrears").length;
  const totalArrears = tenants.reduce((s, t) => s + Number(t.arrears || 0), 0);
  const availableUnits = listings.filter(l => l.status === "available").length;
  const monthlyRent = tenants.reduce((s, t) => s + Number(t.rent_amount || 0), 0);
  const recentPayments = payments.slice(0, 5);
  const arrearsTenants = tenants.filter(t => t.status === "arrears");

  if (loading) return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Loading your overview...</p>
        </div>
      </div>
      <div className="stats-grid">
        {[1,2,3,4].map(i => <SkeletonStat key={i} />)}
      </div>
      <div className="dashboard-grid">
        <SkeletonCard rows={5} />
        <SkeletonCard rows={4} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("en-KE", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent" onClick={() => navigate("tenants")} style={{ cursor: "pointer" }}>
          <div className="stat-glow" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="stat-label">Total Tenants</div>
            <IconUsers size={16} style={{ color: "var(--accent)", opacity: 0.6 }} />
          </div>
          <div className="stat-value">{totalTenants}</div>
          <div className="stat-sub">{paidTenants} paid this month</div>
        </div>
        <div className="stat-card blue" onClick={() => navigate("payments")} style={{ cursor: "pointer" }}>
          <div className="stat-glow" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="stat-label">Monthly Rent</div>
            <IconTrendingUp size={16} style={{ color: "var(--accent-2)", opacity: 0.6 }} />
          </div>
          <div className="stat-value" style={{ fontSize: "clamp(18px, 3vw, 26px)" }}>Ksh {monthlyRent.toLocaleString()}</div>
          <div className="stat-sub">Across all units</div>
        </div>
        <div className="stat-card danger" onClick={() => navigate("reminders")} style={{ cursor: "pointer" }}>
          <div className="stat-glow" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="stat-label">Total Arrears</div>
            <IconAlertTriangle size={16} style={{ color: "var(--danger)", opacity: 0.6 }} />
          </div>
          <div className="stat-value">Ksh {totalArrears.toLocaleString()}</div>
          <div className="stat-sub">{arrearsCount} tenants defaulting</div>
        </div>
        <div className="stat-card warning" onClick={() => navigate("listings")} style={{ cursor: "pointer" }}>
          <div className="stat-glow" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="stat-label">Vacant Units</div>
            <IconHome size={16} style={{ color: "var(--warning)", opacity: 0.6 }} />
          </div>
          <div className="stat-value">{availableUnits}</div>
          <div className="stat-sub">Listed and available</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Payments */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="section-title">Recent Payments</h2>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 10px", gap: 4 }} onClick={() => navigate("payments")}>
              View All <IconArrowRight size={12} />
            </button>
          </div>
          {recentPayments.length === 0 ? (
            <EmptyState
              icon={<IconTrendingUp size={36} />}
              title="No payments yet"
              subtitle="Payments appear here once tenants pay via your Paybill"
            />
          ) : (
            recentPayments.map(p => (
              <div key={p.id} className="payment-row">
                <div className="payment-left">
                  <div className="payment-avatar">{(p.tenant || "?")[0].toUpperCase()}</div>
                  <div style={{ minWidth: 0 }}>
                    <div className="payment-name">{p.tenant || "Unknown"}</div>
                    <div className="payment-code">#{p.transaction_id}</div>
                  </div>
                </div>
                <div className="payment-right">
                  <div className="payment-amount">Ksh {Number(p.amount).toLocaleString()}</div>
                  <span className={`badge badge-${p.status === "verified" ? "success" : p.status === "failed" ? "danger" : "warning"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Arrears */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 className="section-title">Arrears Alert</h2>
            {arrearsTenants.length > 0 && (
              <button className="btn btn-danger" style={{ fontSize: 12, padding: "5px 10px", gap: 4 }} onClick={() => navigate("reminders")}>
                Send Reminders <IconArrowRight size={12} />
              </button>
            )}
          </div>
          {arrearsTenants.length === 0 ? (
            <EmptyState
              icon={<IconUsers size={36} />}
              title="All tenants up to date"
              subtitle="No arrears right now"
            />
          ) : (
            arrearsTenants.map(t => (
              <div key={t.id} className="arrears-row">
                <div style={{ minWidth: 0 }}>
                  <div className="arrears-name">{t.name}</div>
                  <div className="arrears-unit">Unit {t.unit_number} &middot; {t.phone}</div>
                </div>
                <div className="arrears-amount">Ksh {Number(t.arrears).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}