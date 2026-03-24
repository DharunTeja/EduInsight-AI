import { useState, useEffect } from "react";
import Plot from "../components/Plot";
import { useDropzone } from "react-dropzone";
import { predictBatch, getStatus } from "../services/api";
import PageHeader from "../components/PageHeader";
import MetricCard from "../components/MetricCard";
import GlassCard from "../components/GlassCard";
import { makeLayout, colors, riskColorMap } from "../utils/chartTheme";
import "./Home.css";
import "./BatchUpload.css";

export default function BatchUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modelReady, setModelReady] = useState(null);

  useEffect(() => {
    getStatus().then((r) => setModelReady(r.data.model_trained)).catch(() => {});
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        setFile(accepted[0]);
        setResult(null);
      }
    },
  });

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await predictBatch(file);
      setResult(res.data);
    } catch (err) {
      alert("Batch prediction failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const headers = Object.keys(result.results[0]);
    const csv = [
      headers.join(","),
      ...result.results.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prediction_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (modelReady === false) {
    return (
      <div>
        <PageHeader icon="📁" title="Batch Upload & Predict" subtitle="" />
        <GlassCard className="text-center">
          <div style={{ fontSize: "3rem", marginBottom: 15 }}>⚠️</div>
          <h3 style={{ color: "var(--accent-yellow)" }}>Model Not Trained Yet</h3>
          <p style={{ color: "var(--text-muted)" }}>Please train the model first.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <PageHeader icon="📁" title="Batch Upload & Predict" subtitle="Upload a CSV file with multiple student records for batch prediction" />

      <GlassCard>
        <h4 style={{ color: "var(--accent-green)", marginBottom: 10 }}>📤 Upload Student Data</h4>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
          Upload a CSV file with the same format as the training dataset (student-mat.csv).
          The file should contain columns like: school, sex, age, studytime, G1, G2, absences, etc.
          <br /><strong style={{ color: "var(--accent-blue)" }}>Note:</strong> The CSV file can use semicolon (;) or comma (,) as separator.
        </p>
      </GlassCard>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "dropzone--active" : ""} ${file ? "dropzone--hasFile" : ""}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>📄</div>
            <p style={{ color: "var(--accent-green)", fontWeight: 600 }}>{file.name}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{(file.size / 1024).toFixed(1)} KB — Click or drop to replace</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>📂</div>
            <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Drag & drop a CSV file here, or click to select</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Supports .csv files</p>
          </div>
        )}
      </div>

      {file && (
        <button className="btn-primary btn-primary--full" onClick={handlePredict} disabled={loading} style={{ marginTop: 16, fontSize: "1.05rem" }}>
          {loading ? "🤖 Processing..." : "🔮 Run Batch Prediction"}
        </button>
      )}

      {/* RESULTS */}
      {result && (
        <div style={{ marginTop: 24 }}>
          <div className="custom-divider" />
          <h3 style={{ color: "var(--text-primary)", marginBottom: 16 }}>📊 Batch Prediction Results</h3>

          <div className="metrics-grid metrics-grid--4">
            <MetricCard label="Total Students" value={result.total} />
            <MetricCard label="Predicted Pass" value={result.pass_count} delta={`${(result.pass_count / result.total * 100).toFixed(1)}%`} />
            <MetricCard label="Predicted Fail" value={result.fail_count} delta={`${(result.fail_count / result.total * 100).toFixed(1)}%`} />
            <MetricCard label="High Risk" value={result.high_risk} delta={`${(result.high_risk / result.total * 100).toFixed(1)}%`} />
          </div>

          <div className="custom-divider" />

          <div className="grid-2">
            <div className="chart-container">
              <Plot
                data={[{
                  values: Object.values(result.predictions),
                  labels: Object.keys(result.predictions),
                  type: "pie",
                  hole: 0.4,
                  marker: { colors: Object.keys(result.predictions).map((k) => k === "Pass" ? colors.green : colors.red) },
                  textinfo: "label+percent+value",
                }]}
                layout={makeLayout("🎯 Prediction Distribution")}
                useResizeHandler style={{ width: "100%", height: 380 }} config={{ displayModeBar: false }}
              />
            </div>
            <div className="chart-container">
              <Plot
                data={[{
                  x: Object.keys(result.risk_levels),
                  y: Object.values(result.risk_levels),
                  type: "bar",
                  marker: { color: Object.keys(result.risk_levels).map((k) => riskColorMap[k] || colors.blue) },
                  text: Object.values(result.risk_levels).map(String),
                  textposition: "outside",
                }]}
                layout={makeLayout("⚠️ Risk Level Distribution")}
                useResizeHandler style={{ width: "100%", height: 380 }} config={{ displayModeBar: false }}
              />
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="chart-container">
            <Plot
              data={[{
                x: result.probabilities,
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

          <div className="custom-divider" />

          {/* Results Table */}
          <h3 style={{ color: "var(--text-primary)", marginBottom: 12 }}>📋 Detailed Results</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {result.results.length > 0 && Object.keys(result.results[0]).map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.results.slice(0, 50).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => <td key={j}>{typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(3)) : String(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button className="btn-primary" onClick={handleDownload}>📥 Download Results as CSV</button>
          </div>

          <p style={{ color: "var(--accent-green)", marginTop: 16, fontWeight: 600 }}>✅ {result.saved_count} predictions saved to history!</p>
        </div>
      )}
    </div>
  );
}
