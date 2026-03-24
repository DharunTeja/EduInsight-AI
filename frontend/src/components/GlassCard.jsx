import "./GlassCard.css";

export default function GlassCard({ children, className = "", hover = true, style }) {
  return (
    <div
      className={`glass-card ${hover ? "glass-card--hover" : ""} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
