import { useEffect, useState } from "react";
import Plot from "../components/Plot";
import { getHistory, clearHistory } from "../services/api";
import PageHeader from "../components/PageHeader";
import MetricCard from "../components/MetricCard";
import { makeLayout, colors, riskColorMap } from "../utils/chartTheme";
import "./Home.css";
import "./BatchUpload.css";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPrediction, setFilterPrediction] = useState(["Pass", "Fail"]);
  const [filterRisk, setFilterRisk] = useState(["High Risk", "Medium Risk", "Low Risk"]);
  const [confirmClear, setConfirmClear] = useState(false);

  const fetchHistory = () => {
    setLoading(true);
    getHistory(100)
      .then((r) => setHistory(r.data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchHistory, []);

  const handleClear = async () => {
    try {
      await clearHistory();
      setHistory([]);
      setConfirmClear(false);
    } catch {
      alert("Failed to clear history");
    }
  };

  const handleDownload = () => {
    if (filtered.length === 0) return;
    const headers = ["timestamp", "prediction", "risk_level", "pass_probability", "recommendations_count"];
    const csv = [
      headers.join(","),
      ...filtered.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prediction_history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFilter = (arr, setArr, val) => {
    setArr((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  };

  if (loading) {
    return (
      <div>
        <PageHeader icon="📜" title="Prediction History" subtitle="View and analyze all past student performance predictions" />
        <div className="loading-container"><div className="spinner" /><p style={{ color: "var(--text-muted)" }}>Loading history...</p></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div>
        <PageHeader icon="📜" title="Prediction History" subtitle="View and analyze all past student performance predictions" />
        <div className="glass-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 15 }}>📭</div>
          <h3 style={{ color: "var(--accent-yellow)" }}>No Predictions Yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Start making predictions to see history here.</p>
        </div>
      </div>
    );
  }

  // Stats
  const total = history.length;
  const passCount = history.filter((h) => h.prediction === "Pass").length;
  const failCount = history.filter((h) => h.prediction === "Fail").length;
  const highRisk = history.filter((h) => h.risk_level === "High Risk").length;
  const medRisk = history.filter((h) => h.risk_level === "Medium Risk").length;
  const lowRisk = history.filter((h) => h.risk_level === "Low Risk").length;

  // Filter
  const filtered = history.filter(
    (h) => filterPrediction.includes(h.prediction) && filterRisk.includes(h.risk_level)
  );

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <PageHeader icon="📜" title="Prediction History" subtitle="View and analyze all past student performance predictions" />

      <h3 style={{ color: "var(--text-primary)", marginBottom: 18 }}>📊 History Summary</h3>
      <div className="metrics-grid metrics-grid--6">
        <MetricCard label="Total" value={total} />
        <MetricCard label="Pass" value={passCount} delta={total > 0 ? `${(passCount / total * 100).toFixed(0)}%` : "0%"} />
        <MetricCard label="Fail" value={failCount} delta={total > 0 ? `${(failCount / total * 100).toFixed(0)}%` : "0%"} />
        <MetricCard label="🔴 High Risk" value={highRisk} />
        <MetricCard label="🟡 Medium Risk" value={medRisk} />
        <MetricCard label="🟢 Low Risk" value={lowRisk} />
      </div>

      <div className="custom-divider" />

      {/* Charts */}
      <div className="grid-2">
        <div className="chart-container">
          <Plot
            data={[{
              values: [passCount, failCount],
              labels: ["Pass", "Fail"],
              type: "pie",
              hole: 0.45,
              marker: { colors: [colors.green, colors.red] },
              textinfo: "label+percent+value",
            }]}
            layout={makeLayout("🎯 Prediction Distribution")}
            useResizeHandler style={{ width: "100%", height: 360 }} config={{ displayModeBar: false }}
          />
        </div>
        <div className="chart-container">
          <Plot
            data={[{
              x: ["High Risk", "Medium Risk", "Low Risk"],
              y: [highRisk, medRisk, lowRisk],
              type: "bar",
              marker: { color: [colors.red, colors.orange, colors.green] },
              text: [highRisk, medRisk, lowRisk].map(String),
              textposition: "outside",
              textfont: { size: 14 },
            }]}
            layout={makeLayout("⚠️ Risk Level Distribution")}
            useResizeHandler style={{ width: "100%", height: 360 }} config={{ displayModeBar: false }}
          />
        </div>
      </div>

      {/* Probability histogram */}
      {history.some((h) => h.pass_probability != null) && (
        <div className="chart-container">
          <Plot
            data={[{
              x: history.map((h) => h.pass_probability).filter(Boolean),
              type: "histogram",
              nbinsx: 20,
              marker: { color: colors.blue },
              opacity: 0.8,
            }]}
            layout={makeLayout("📊 Pass Probability Distribution", {
              xaxis: { title: "Pass Probability" },
              shapes: [
                { type: "line", x0: 0.4, x1: 0.4, y0: 0, y1: 1, yref: "paper", line: { color: colors.red, dash: "dash" } },
                { type: "line", x0: 0.7, x1: 0.7, y0: 0, y1: 1, yref: "paper", line: { color: colors.yellow, dash: "dash" } },
              ],
            })}
            useResizeHandler style={{ width: "100%", height: 340 }} config={{ displayModeBar: false }}
          />
        </div>
      )}

      <div className="custom-divider" />

      {/* Filters */}
      <h3 style={{ color: "var(--text-primary)", marginBottom: 12 }}>📋 Prediction Records</h3>
      <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginRight: 8 }}>Result:</span>
          {["Pass", "Fail"].map((v) => (
            <button
              key={v}
              className={`btn-secondary ${filterPrediction.includes(v) ? "btn-secondary--active" : ""}`}
              onClick={() => toggleFilter(filterPrediction, setFilterPrediction, v)}
              style={{ marginRight: 6, padding: "5px 14px", fontSize: "0.82rem" }}
            >
              {v}
            </button>
          ))}
        </div>
        <div>
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginRight: 8 }}>Risk:</span>
          {["High Risk", "Medium Risk", "Low Risk"].map((v) => (
            <button
              key={v}
              className={`btn-secondary ${filterRisk.includes(v) ? "btn-secondary--active" : ""}`}
              onClick={() => toggleFilter(filterRisk, setFilterRisk, v)}
              style={{ marginRight: 6, padding: "5px 14px", fontSize: "0.82rem" }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 12 }}>
        Showing <strong style={{ color: "var(--accent-green)" }}>{filtered.length}</strong> of{" "}
        <strong style={{ color: "var(--accent-blue)" }}>{total}</strong> records
      </p>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th><th>Prediction</th><th>Risk Level</th><th>Pass Probability</th><th>Recommendations</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i}>
                <td>{r.timestamp || r.created_at || "—"}</td>
                <td style={{ color: r.prediction === "Pass" ? colors.green : colors.red, fontWeight: 600 }}>{r.prediction}</td>
                <td style={{ color: riskColorMap[r.risk_level] || "inherit" }}>{r.risk_level}</td>
                <td>{r.pass_probability != null ? (r.pass_probability * 1).toFixed(3) : "—"}</td>
                <td>{r.recommendations_count ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="custom-divider" />

      {/* Actions */}
      <h3 style={{ color: "var(--text-primary)", marginBottom: 14 }}>⚡ Actions</h3>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={handleDownload}>📥 Download History as CSV</button>
        <button className="btn-danger" onClick={() => setConfirmClear(true)}>🗑️ Clear All History</button>
      </div>

      {confirmClear && (
        <div style={{ marginTop: 16, padding: 16, background: "rgba(255,165,0,0.1)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255,165,0,0.3)" }}>
          <p style={{ color: "var(--accent-yellow)", fontWeight: 600, marginBottom: 12 }}>⚠️ Are you sure you want to clear ALL prediction history?</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-danger" onClick={handleClear}>✅ Yes, Clear</button>
            <button className="btn-secondary" onClick={() => setConfirmClear(false)}>❌ Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
