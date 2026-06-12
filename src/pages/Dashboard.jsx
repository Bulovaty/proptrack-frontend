import { useState, useEffect } from "react";
import { apiGetTenants, apiGetPayments, apiGetListings } from "../api";
import "./Dashboard.css";

export default function Dashboard() {
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiGetTenants(), apiGetPayments(), apiGetListings()])
      .then(([t, p, l]) => { setTenants(t); setPayments(p); setListings(l); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalTenants = tenants.length;
  const paidTenants = tenants.filter(t => t.status === "paid").length;
  const arrearsCount = tenants.filter(t => t.status === "arrears").length;
  const totalArrears = tenants.reduce((sum, t) => sum + Number(t.arrears || 0), 0);
  const availableUnits = listings.filter(l => l.status === "available").length;
  const monthlyRent = tenants.reduce((sum, t) => sum + Number(t.rent_amount || 0), 0);
  const recentPayments = payments.slice(0, 4);
  const arrearsTenants = tenants.filter(t => t.status === "arrears");

  if (loading) return <div style={{ padding: 40, color: "var(--text-secondary)" }}>Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's your property overview</p>
        </div>
        <div className="date-badge">{new Date().toLocaleDateString("en-KE", { month: "long", year: "numeric" })}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Tenants</div>
          <div className="stat-value">{totalTenants}</div>
          <div className="stat-sub">{paidTenants} paid this month</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Monthly Rent Expected</div>
          <div className="stat-value">Ksh {monthlyRent.toLocaleString()}</div>
          <div className="stat-sub">Across all units</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Total Arrears</div>
          <div className="stat-value">Ksh {totalArrears.toLocaleString()}</div>
          <div className="stat-sub">{arrearsCount} tenants defaulting</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Vacant Units</div>
          <div className="stat-value">{availableUnits}</div>
          <div className="stat-sub">Listed and available</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="section-header">
            <h2 className="section-title">Recent Payments</h2>
          </div>
          <div className="payment-list">
            {recentPayments.length === 0 && (
              <div className="empty-state">No payments recorded yet</div>
            )}
            {recentPayments.map(p => (
              <div key={p.id} className="payment-row">
                <div className="payment-left">
                  <div className="payment-avatar">{(p.tenant || "?")[0]}</div>
                  <div>
                    <div className="payment-name">{p.tenant}</div>
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
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <h2 className="section-title">⚠️ Arrears Alert</h2>
          </div>
          <div className="arrears-list">
            {arrearsTenants.length === 0 && (
              <div className="empty-state">🎉 All tenants are up to date</div>
            )}
            {arrearsTenants.map(t => (
              <div key={t.id} className="arrears-row">
                <div>
                  <div className="arrears-name">{t.name}</div>
                  <div className="arrears-unit">Unit {t.unit_number} · {t.phone}</div>
                </div>
                <div className="arrears-amount">Ksh {Number(t.arrears).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}