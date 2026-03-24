import "./MetricCard.css";

export default function MetricCard({ label, value, delta, icon }) {
  return (
    <div className="metric-card">
      {icon && <span className="metric-icon">{icon}</span>}
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {delta && <div className="metric-delta">{delta}</div>}
    </div>
  );
}
