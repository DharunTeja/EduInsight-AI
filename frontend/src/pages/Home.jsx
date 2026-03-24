import { useEffect, useState } from "react";
import { getStatus, getStats } from "../services/api";
import MetricCard from "../components/MetricCard";
import StatusBadge from "../components/StatusBadge";
import GlassCard from "../components/GlassCard";
import "./Home.css";

const features = [
  { icon: "🤖", title: "ML Prediction", desc: "3 algorithms compared: Logistic Regression, Decision Tree, Random Forest" },
  { icon: "📊", title: "Analytics Dashboard", desc: "Interactive charts and visualizations for deep academic insights" },
  { icon: "⚠️", title: "Risk Classification", desc: "Automatically categorize students into High, Medium, or Low risk levels" },
  { icon: "🧠", title: "AI Risk Advisor", desc: "Intelligent agent generates personalized academic recommendations" },
  { icon: "📁", title: "Batch Upload", desc: "Upload CSV files to predict performance for entire classes at once" },
  { icon: "📜", title: "Prediction History", desc: "Track all past predictions with timestamps and risk assessments" },
];

export default function Home() {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStatus().then((r) => setStatus(r.data)).catch(() => {});
    getStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-emoji">🎓</div>
        <h1 className="hero-title">EduInsight AI</h1>
        <p className="hero-subtitle">
          Intelligent Academic Analytics Platform — Predict Performance • Identify Risk • Generate Recommendations
        </p>
      </div>

      <div className="custom-divider" />

      {/* Status Badges */}
      {status && (
        <div className="status-row">
          <StatusBadge label="Dataset Loaded" active={status.dataset_loaded} />
          <StatusBadge label="Model Trained" active={status.model_trained} />
          <StatusBadge label="Risk Advisor Active" active={status.risk_advisor_active} />
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="metrics-grid metrics-grid--4">
          <MetricCard label="Total Students" value={stats.total_students.toLocaleString()} delta="Primary Dataset" />
          <MetricCard label="Passing Students" value={stats.pass_count} delta={`${stats.pass_percentage}%`} />
          <MetricCard label="Failing Students" value={stats.fail_count} delta={`${stats.fail_percentage}%`} />
          <MetricCard label="Avg Grade" value={`${stats.avg_grade}/20`} delta={`Median: ${stats.median_grade}`} />
        </div>
      )}

      {/* Feature Cards */}
      <div className="features-grid">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="custom-divider" />

      {/* Getting Started */}
      <GlassCard>
        <h3 className="getting-started-title">🚀 Getting Started</h3>
        <div className="getting-started-steps">
          <p><span className="step-num">Step 1:</span> Navigate to <strong>Model Training</strong> page to train the ML model on the student dataset.</p>
          <p><span className="step-num">Step 2:</span> Visit the <strong>Dashboard</strong> to explore data visualizations and analytics.</p>
          <p><span className="step-num">Step 3:</span> Go to <strong>Predict</strong> page to predict performance for individual students.</p>
          <p><span className="step-num">Step 4:</span> Use <strong>Batch Upload</strong> to process entire class CSV files at once.</p>
          <p><span className="step-num">Step 5:</span> Check <strong>History</strong> to review all past predictions and trends.</p>
        </div>
      </GlassCard>

      {/* Footer */}
      <footer className="page-footer">
        AI-Based Student Performance Prediction & Academic Risk Analysis System<br />
        Built with React, Flask, Scikit-Learn & Python
      </footer>
    </div>
  );
}
