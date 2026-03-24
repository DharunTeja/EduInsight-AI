import "./PageHeader.css";

export default function PageHeader({ icon, title, subtitle }) {
  return (
    <div className="page-header">
      <h1 className="page-title">
        {icon} {title}
      </h1>
      <p className="page-subtitle">{subtitle}</p>
      <div className="custom-divider" />
    </div>
  );
}
