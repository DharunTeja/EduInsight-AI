import { useEffect, useState } from "react";
import Plot from "../components/Plot";
import { getDashboardData } from "../services/api";
import PageHeader from "../components/PageHeader";
import MetricCard from "../components/MetricCard";
import { makeLayout, colors, riskColorMap, palette } from "../utils/chartTheme";
import "./Home.css";

const datasets = [
  { key: "primary", label: "Primary (student-mat.csv)" },
  { key: "performance", label: "Performance Index" },
  { key: "exams", label: "Exam Scores" },
];

export default function Dashboard() {
  const [selected, setSelected] = useState("primary");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDashboardData(selected)
      .then((r) => setData(r.data))
      .catch((err) => {
        setData(null);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <PageHeader icon="📊" title="Analytics Dashboard" subtitle="Explore interactive visualizations of student academic data" />

      {/* Dataset Selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginRight: 12 }}>Select Dataset:</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            background: "#1a1a2e",
            color: "white",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 16px",
            fontFamily: "var(--font-family)",
            fontSize: "0.9rem",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {datasets.map((d) => (
            <option key={d.key} value={d.key}>{d.label}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="loading-container"><div className="spinner" /><p style={{ color: "var(--text-muted)" }}>Loading data...</p></div>
      )}

      {!loading && error && (
        <p style={{ color: "var(--accent-red)", textAlign: "center", padding: 40 }}>⚠️ {error}</p>
      )}

      {!loading && !error && !data && (
        <p style={{ color: "var(--accent-red)", textAlign: "center", padding: 40 }}>⚠️ Could not load the selected dataset.</p>
      )}

      {!loading && data && selected === "primary" && <PrimaryDashboard data={data} />}
      {!loading && data && selected === "performance" && <PerformanceDashboard data={data} />}
      {!loading && data && selected === "exams" && <ExamsDashboard data={data} />}
    </div>
  );
}

/* ==================== PRIMARY DATASET ==================== */
function PrimaryDashboard({ data }) {
  const m = data.metrics || {};
  const gradeDistribution = data.grade_distribution || [];
  const passFail = data.pass_fail_counts || {};
  const riskCounts = data.risk_counts || {};
  const gradeProgression = data.grade_progression || {};
  const absencesVsGrade = data.absences_vs_grade || [];
  const studyAvg = data.study_avg || [];
  const correlation = data.correlation || { columns: [], values: [] };
  const topPositive = data.top_positive_corr || {};
  const topNegative = data.top_negative_corr || {};
  const passThreshold = data.pass_threshold || 10;

  return (
    <>
      <h3 style={{ color: "var(--text-primary)", marginBottom: 18 }}>📈 Dataset Overview</h3>
      <div className="metrics-grid metrics-grid--5">
        <MetricCard label="Total Students" value={(m.total || 0).toLocaleString()} />
        <MetricCard label="Avg Grade (G3)" value={`${m.avg_grade || 0}/20`} />
        <MetricCard label="Pass Rate" value={`${m.pass_rate || 0}%`} />
        <MetricCard label="Avg Absences" value={m.avg_absences || 0} />
        <MetricCard label="Features" value={m.num_features || 0} />
      </div>

      <div className="custom-divider" />

      {/* Row 1: Grade Distribution + Pass/Fail Pie */}
      <div className="grid-2">
        <div className="chart-container">
          <Plot
            data={[
              {
                x: gradeDistribution.filter((d) => d.pass_fail === "Pass").map((d) => d.G3),
                type: "histogram",
                name: "Pass",
                marker: { color: colors.green },
                opacity: 0.8,
                nbinsx: 20,
              },
              {
                x: gradeDistribution.filter((d) => d.pass_fail === "Fail").map((d) => d.G3),
                type: "histogram",
                name: "Fail",
                marker: { color: colors.red },
                opacity: 0.8,
                nbinsx: 20,
              },
            ]}
            layout={{
              ...makeLayout("📊 Final Grade (G3) Distribution", {
                xaxis: { title: "Final Grade (0-20)" },
                yaxis: { title: "Count" },
              }),
              barmode: "overlay",
              shapes: [{
                type: "line", x0: passThreshold, x1: passThreshold,
                y0: 0, y1: 1, yref: "paper",
                line: { color: colors.yellow, width: 2, dash: "dash" },
              }],
              annotations: [{
                x: passThreshold, y: 1, yref: "paper",
                text: "Pass Threshold", showarrow: false,
                font: { color: colors.yellow, size: 11 }, yshift: 10,
              }],
            }}
            useResizeHandler
            style={{ width: "100%", height: 380 }}
            config={{ displayModeBar: false }}
          />
        </div>
        <div className="chart-container">
          <Plot
            data={[{
              values: Object.values(passFail),
              labels: Object.keys(passFail),
              type: "pie",
              hole: 0.4,
              marker: { colors: Object.keys(passFail).map((k) => k === "Pass" ? colors.green : colors.red) },
              textinfo: "label+percent",
              textfont: { size: 14 },
            }]}
            layout={makeLayout("🎯 Pass/Fail Distribution")}
            useResizeHandler
            style={{ width: "100%", height: 380 }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>

      {/* Row 2: Risk Level + Grade Progression */}
      <div className="grid-2">
        <div className="chart-container">
          <Plot
            data={[{
              x: Object.keys(riskCounts),
              y: Object.values(riskCounts),
              type: "bar",
              marker: { color: Object.keys(riskCounts).map((k) => riskColorMap[k] || colors.blue) },
              text: Object.values(riskCounts).map(String),
              textposition: "outside",
              textfont: { size: 14 },
            }]}
            layout={makeLayout("⚠️ Risk Level Distribution")}
            useResizeHandler
            style={{ width: "100%", height: 380 }}
            config={{ displayModeBar: false }}
          />
        </div>
        <div className="chart-container">
          <Plot
            data={["G1", "G2", "G3"].map((p, i) => ({
              y: gradeProgression[p] || [],
              type: "box",
              name: p,
              marker: { color: palette[i] },
            }))}
            layout={makeLayout("📈 Grade Progression (G1 → G2 → G3)")}
            useResizeHandler
            style={{ width: "100%", height: 380 }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>

      <div className="custom-divider" />

      {/* Row 3: Absences vs Grade + Study Time */}
      <div className="grid-2">
        <div className="chart-container">
          <Plot
            data={["Pass", "Fail"].map((pf) => ({
              x: absencesVsGrade.filter((d) => d.pass_fail === pf).map((d) => d.absences),
              y: absencesVsGrade.filter((d) => d.pass_fail === pf).map((d) => d.G3),
              mode: "markers",
              type: "scatter",
              name: pf,
              marker: { color: pf === "Pass" ? colors.green : colors.red, opacity: 0.6 },
            }))}
            layout={makeLayout("📉 Absences vs Final Grade", {
              xaxis: { title: "Number of Absences" },
              yaxis: { title: "Final Grade (G3)" },
            })}
            useResizeHandler
            style={{ width: "100%", height: 380 }}
            config={{ displayModeBar: false }}
          />
        </div>
        <div className="chart-container">
          <Plot
            data={[{
              x: studyAvg.map((d) => d.label || ""),
              y: studyAvg.map((d) => d.G3 || 0),
              type: "bar",
              marker: {
                color: studyAvg.map((d) => d.G3 || 0),
                colorscale: [[0, colors.red], [0.5, colors.yellow], [1, colors.green]],
              },
              text: studyAvg.map((d) => (d.G3 || 0).toFixed(1)),
              textposition: "outside",
              textfont: { size: 13 },
            }]}
            layout={makeLayout("⏰ Average Grade by Study Time", {
              yaxis: { title: "Average Final Grade" },
            })}
            useResizeHandler
            style={{ width: "100%", height: 380 }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>

      <div className="custom-divider" />

      {/* Correlation Heatmap */}
      {correlation.columns.length > 0 && (
        <>
          <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>🔗 Feature Correlation Heatmap</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>
            Shows how strongly each feature is related to the final grade (G3). Positive values (green) help improve grades.
          </p>
          <div className="chart-container">
            <Plot
              data={[{
                z: correlation.values,
                x: correlation.columns,
                y: correlation.columns,
                type: "heatmap",
                colorscale: [[0, colors.red], [0.5, "#1a1a2e"], [1, colors.green]],
                zmin: -1,
                zmax: 1,
              }]}
              layout={makeLayout("Feature Correlation Matrix", {
                height: 600,
                xaxis: { tickangle: -45 },
              })}
              useResizeHandler
              style={{ width: "100%", height: 600 }}
              config={{ displayModeBar: false }}
            />
          </div>

          <h4 style={{ color: "var(--text-primary)", marginTop: 24, marginBottom: 14 }}>🏆 Top Features Correlated with Final Grade (G3)</h4>
          <div className="grid-2">
            <div>
              <p style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>✅ Positive Correlations</p>
              {Object.entries(topPositive).map(([feat, val]) => (
                <CorrelationBar key={feat} feature={feat} value={val} positive />
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>❌ Negative Correlations</p>
              {Object.entries(topNegative).map(([feat, val]) => (
                <CorrelationBar key={feat} feature={feat} value={val} positive={false} />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function CorrelationBar({ feature, value, positive }) {
  const barWidth = Math.min(Math.abs(value) * 200, 200);
  const color = positive ? colors.green : colors.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ color: "#ccc", width: 100, fontSize: "0.85rem", flexShrink: 0 }}>{feature}</span>
      <div style={{ background: color, width: barWidth, height: 12, borderRadius: 6, flexShrink: 0 }} />
      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{value}</span>
    </div>
  );
}

/* ==================== PERFORMANCE INDEX ==================== */
function PerformanceDashboard({ data }) {
  const m = data.metrics || {};
  const rows = data.data || [];

  return (
    <>
      <h3 style={{ color: "var(--text-primary)", marginBottom: 18 }}>📈 Student Performance Index Analysis</h3>
      <div className="metrics-grid metrics-grid--4">
        <MetricCard label="Total Students" value={(m.total || 0).toLocaleString()} />
        <MetricCard label="Avg Performance" value={m.avg_performance || 0} />
        <MetricCard label="Avg Hours Studied" value={m.avg_hours || 0} />
        <MetricCard label="Avg Sleep Hours" value={m.avg_sleep || 0} />
      </div>
      <div className="custom-divider" />
      <div className="grid-2">
        <div className="chart-container">
          <Plot
            data={["Yes", "No"].map((ec) => ({
              x: rows.filter((d) => d["Extracurricular Activities"] === ec).map((d) => d["Hours Studied"]),
              y: rows.filter((d) => d["Extracurricular Activities"] === ec).map((d) => d["Performance Index"]),
              mode: "markers",
              name: `Extracurricular: ${ec}`,
              marker: { color: ec === "Yes" ? colors.green : colors.red, opacity: 0.5 },
              type: "scatter",
            }))}
            layout={makeLayout("📚 Hours Studied vs Performance Index", {
              xaxis: { title: "Hours Studied" },
              yaxis: { title: "Performance Index" },
            })}
            useResizeHandler
            style={{ width: "100%", height: 400 }}
            config={{ displayModeBar: false }}
          />
        </div>
        <div className="chart-container">
          <Plot
            data={[{
              x: rows.map((d) => d["Performance Index"]),
              type: "histogram",
              nbinsx: 30,
              marker: { color: colors.blue },
              opacity: 0.8,
            }]}
            layout={makeLayout("📊 Performance Index Distribution", {
              xaxis: { title: "Performance Index" },
            })}
            useResizeHandler
            style={{ width: "100%", height: 400 }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>
    </>
  );
}

/* ==================== EXAM SCORES ==================== */
function ExamsDashboard({ data }) {
  const m = data.metrics || {};
  const rows = data.data || [];

  return (
    <>
      <h3 style={{ color: "var(--text-primary)", marginBottom: 18 }}>📝 Student Exam Scores Analysis</h3>
      <div className="metrics-grid metrics-grid--4">
        <MetricCard label="Total Students" value={(m.total || 0).toLocaleString()} />
        <MetricCard label="Avg Math" value={m.avg_math || 0} />
        <MetricCard label="Avg Reading" value={m.avg_reading || 0} />
        <MetricCard label="Avg Writing" value={m.avg_writing || 0} />
      </div>
      <div className="custom-divider" />
      <div className="grid-2">
        <div className="chart-container">
          <Plot
            data={["male", "female"].flatMap((g) =>
              ["math score", "reading score", "writing score"].map((sub) => ({
                y: rows.filter((d) => d.gender === g).map((d) => d[sub]),
                type: "box",
                name: `${g} - ${sub}`,
                marker: { color: g === "male" ? colors.blue : colors.red },
              }))
            )}
            layout={{ ...makeLayout("📊 Score Distribution by Gender"), boxmode: "group" }}
            useResizeHandler
            style={{ width: "100%", height: 400 }}
            config={{ displayModeBar: false }}
          />
        </div>
        <div className="chart-container">
          <Plot
            data={[{
              x: rows.map((d) => d["math score"]),
              y: rows.map((d) => d["reading score"]),
              mode: "markers",
              type: "scatter",
              marker: {
                color: rows.map((d) => d["writing score"]),
                colorscale: [[0, colors.red], [0.5, colors.yellow], [1, colors.green]],
                colorbar: { title: "Writing", tickfont: { color: "#a0a0b0" }, titlefont: { color: "#a0a0b0" } },
                opacity: 0.6,
              },
            }]}
            layout={makeLayout("🔗 Math vs Reading (colored by Writing)", {
              xaxis: { title: "Math Score" },
              yaxis: { title: "Reading Score" },
            })}
            useResizeHandler
            style={{ width: "100%", height: 400 }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>
    </>
  );
}
