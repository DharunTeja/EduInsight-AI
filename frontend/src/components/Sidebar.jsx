import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HiHome,
  HiChartBar,
  HiSparkles,
  HiFolder,
  HiCpuChip,
  HiClock,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import "./Sidebar.css";

const links = [
  { to: "/", icon: HiHome, label: "Home" },
  { to: "/dashboard", icon: HiChartBar, label: "Dashboard" },
  { to: "/predict", icon: HiSparkles, label: "Predict" },
  { to: "/batch", icon: HiFolder, label: "Batch Upload" },
  { to: "/training", icon: HiCpuChip, label: "Model Training" },
  { to: "/history", icon: HiClock, label: "History" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">🎓</span>
        {!collapsed && (
          <span className="sidebar-brand-text">EduInsight AI</span>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`sidebar-link ${isActive ? "active" : ""}`}
              title={collapsed ? link.label : ""}
            >
              <Icon className="sidebar-link-icon" />
              {!collapsed && (
                <span className="sidebar-link-label">{link.label}</span>
              )}
              {isActive && <div className="sidebar-link-indicator" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-info">
            <p>📌 Mini Project – 3rd Year</p>
            <p>📌 AI & Educational Analytics</p>
            <p>📌 React + Flask + Scikit-Learn</p>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <HiChevronRight /> : <HiChevronLeft />}
        </button>
      </div>
    </aside>
  );
}
