export function SkeletonLine({ width = "100%", height = 14, style = {} }) {
  return (
    <div style={{
      width, height,
      background: "linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      borderRadius: 6,
      ...style
    }} />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SkeletonLine width="60%" height={18} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonLine key={i} width={i === rows - 1 ? "40%" : "100%"} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="table-wrap">
      <table style={{ width: "100%" }}>
        <thead>
          <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} style={{ padding: "12px 16px" }}>
                <SkeletonLine width="70%" height={10} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} style={{ borderBottom: "1px solid var(--border)" }}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} style={{ padding: "14px 16px" }}>
                  <SkeletonLine width={c === 0 ? "80%" : c === cols - 1 ? "50%" : "70%"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="stat-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SkeletonLine width="50%" height={10} />
      <SkeletonLine width="40%" height={34} />
      <SkeletonLine width="60%" height={10} />
    </div>
  );
}