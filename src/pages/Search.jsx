import { useState } from "react";

const API = import.meta.env.VITE_API_URL + "/api";
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

const DASH = "\u2014";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("tenants");

  const runSearch = async (q) => {
    setQuery(q);
    if (!q || q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch(`/search?q=${encodeURIComponent(q.trim())}`);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Search</h1>
          <p className="page-subtitle">Find tenants, units, and past payments instantly</p>
        </div>
      </div>

      <div className="search-bar" style={{ width: "100%", maxWidth: 480, marginBottom: 28 }}>
        <span style={{ color: "var(--text-muted)" }}>&#128269;</span>
        <input
          autoFocus
          placeholder="Search by tenant name, phone, unit, or M-Pesa code..."
          value={query}
          onChange={e => runSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>Searching...</div>
      )}

      {!loading && query.length >= 2 && results && (
        <>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button
              className={tab === "tenants" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("tenants")}
            >
              Tenants ({results.tenants.length})
            </button>
            <button
              className={tab === "payments" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setTab("payments")}
            >
              Payments ({results.payments.length})
            </button>
          </div>

          {/* Tenants Results */}
          {tab === "tenants" && (
            results.tenants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">&#128269;</div>
                <div className="empty-state-title">No tenants found</div>
                <p>Try a different name, phone number, or unit</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Property</th>
                      <th>Unit</th>
                      <th>Phone</th>
                      <th>Rent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.tenants.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.name}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{t.property_name || DASH}</td>
                        <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{t.unit_number}</span></td>
                        <td style={{ color: "var(--text-secondary)" }}>{t.phone}</td>
                        <td style={{ fontWeight: 600 }}>Ksh {Number(t.rent_amount || 0).toLocaleString()}</td>
                        <td>
                          <span className={`badge badge-${t.status === "paid" ? "success" : t.status === "arrears" ? "danger" : "warning"}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Payments Results */}
          {tab === "payments" && (
            results.payments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">&#128179;</div>
                <div className="empty-state-title">No payments found</div>
                <p>Try searching by M-Pesa transaction code, tenant name, or phone</p>
              </div>
            ) : (
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
                    {results.payments.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.tenant || DASH}</td>
                        <td><span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{p.unit || DASH}</span></td>
                        <td>
                          <span style={{
                            fontFamily: "monospace", fontSize: 12,
                            background: "var(--bg-secondary)", padding: "3px 8px",
                            borderRadius: 4, color: "var(--text-secondary)"
                          }}>{p.transaction_id}</span>
                        </td>
                        <td style={{ fontWeight: 700 }}>Ksh {Number(p.amount).toLocaleString()}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                          {new Date(p.paid_at).toLocaleDateString("en-KE")}
                        </td>
                        <td>
                          <span className={`badge badge-${p.status === "verified" ? "success" : p.status === "failed" ? "danger" : "warning"}`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {!loading && query.length > 0 && query.length < 2 && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Type at least 2 characters to search</div>
      )}

      {query.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">&#128269;</div>
          <div className="empty-state-title">Search PropTrack</div>
          <p>Find any tenant, unit, or payment by typing above</p>
        </div>
      )}
    </div>
  );
}
