import "./StatusBadge.css";

export default function StatusBadge({ label, active = true }) {
  return (
    <span className={`status-badge ${active ? "status-active" : "status-inactive"}`}>
      {active ? "✅" : "❌"} {label}
    </span>
  );
}
