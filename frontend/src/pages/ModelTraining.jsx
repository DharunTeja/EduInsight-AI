import { useState } from "react";
import Plot from "../components/Plot";
import { trainModels } from "../services/api";
import PageHeader from "../components/PageHeader";
import GlassCard from "../components/GlassCard";
import { makeLayout, colors, palette } from "../utils/chartTheme";
import "./Home.css";

export default function ModelTraining() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleTrain = async () => {
    setLoading(true);
    setProgress(10);
    setResult(null);

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 85));
    }, 500);

    try {
      const res = await trainModels();
      setResult(res.data);
      setProgress(100);
    } catch (err) {
      alert("Training failed: " + (err.response?.data?.error || err.message));
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <PageHeader icon="🤖" title="Model Training & Comparison" subtitle="Train ML models, compare performance, and select the best classifier" />

      <GlassCard>
        <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.8 }}>
          Click the button below to start training <strong style={{ color: "var(--accent-green)" }}>3 ML algorithms</strong>:<br />
          <strong style={{ color: "var(--accent-blue)" }}>1. Logistic Regression</strong> — Linear classifier, fast and interpretable<br />
          <strong style={{ color: "var(--accent-blue)" }}>2. Decision Tree</strong> — Rule-based classifier, easy to understand<br />
          <strong style={{ color: "var(--accent-blue)" }}>3. Random Forest</strong> — Ensemble method, usually highest accuracy<br /><br />
          The system will automatically compare all models and save the best one.
        </p>
      </GlassCard>

      <button className="btn-primary btn-primary--full" onClick={handleTrain} disabled={loading} style={{ marginTop: 18, fontSize: "1.05rem" }}>
        {loading ? "🤖 Training in progress..." : "🤖 Start Training"}
      </button>

      {/* Progress Bar */}
      {loading && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      {/* RESULTS */}
      {result && <TrainingResults result={result} />}
    </div>
  );
}

function TrainingResults({ result }) {
  const modelColors = { "Logistic Regression": colors.green, "Decision Tree": colors.blue, "Random Forest": colors.yellow };

  return (
    <div style={{ marginTop: 24 }}>
      <p style={{ color: "var(--accent-green)", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>
        🏆 Training complete! Best model: <span style={{ color: colors.yellow }}>{result.best_model}</span> (Accuracy: {(result.best_accuracy * 100).toFixed(1)}%)
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        Training set: <strong style={{ color: "var(--accent-green)" }}>{result.train_size}</strong> records |
        Testing set: <strong style={{ color: "var(--accent-blue)" }}>{result.test_size}</strong> records |
        Features: <strong style={{ color: colors.yellow }}>{result.num_features}</strong>
      </p>

      <div className="custom-divider" />

      {/* Comparison Table */}
      <h3 style={{ color: "var(--text-primary)", marginBottom: 14 }}>📊 Model Performance Comparison</h3>
      <div className="table-wrapper" style={{ marginBottom: 24 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th><th>F1 Score</th><th></th>
            </tr>
          </thead>
          <tbody>
            {result.comparison.map((m) => (
              <tr key={m.name}>
                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</td>
                <td>{(m.metrics.accuracy * 100).toFixed(1)}%</td>
                <td>{(m.metrics.precision * 100).toFixed(1)}%</td>
                <td>{(m.metrics.recall * 100).toFixed(1)}%</td>
                <td>{(m.metrics.f1_score * 100).toFixed(1)}%</td>
                <td>{m.is_best ? "🏆" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grouped Bar Chart */}
      <h3 style={{ color: "var(--text-primary)", marginBottom: 14 }}>📈 Visual Comparison</h3>
      <div className="chart-container">
        <Plot
          data={result.comparison.map((m, i) => ({
            x: ["Accuracy", "Precision", "Recall", "F1 Score"],
            y: [m.metrics.accuracy, m.metrics.precision, m.metrics.recall, m.metrics.f1_score],
            name: m.name,
            type: "bar",
            marker: { color: palette[i] },
            text: [m.metrics.accuracy, m.metrics.precision, m.metrics.recall, m.metrics.f1_score].map((v) => `${(v * 100).toFixed(1)}%`),
            textposition: "outside",
            textfont: { size: 11 },
          }))}
          layout={makeLayout("📊 Model Performance Metrics", {
            barmode: "group",
            height: 450,
            yaxis: { range: [0, 1.15] },
          })}
          useResizeHandler style={{ width: "100%", height: 450 }} config={{ displayModeBar: false }}
        />
      </div>

      <div className="custom-divider" />

      {/* Confusion Matrices */}
      <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>🔲 Confusion Matrices</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>
        <strong>TP:</strong> Correctly predicted Pass | <strong>TN:</strong> Correctly predicted Fail |
        <strong> FP:</strong> Predicted Pass but Fail | <strong>FN:</strong> Predicted Fail but Pass
      </p>
      <div className="grid-3">
        {result.comparison.map((m) => {
          const cm = m.confusion_matrix;
          return (
            <div className="chart-container" key={m.name}>
              <Plot
                data={[{
                  z: cm,
                  x: ["Fail (0)", "Pass (1)"],
                  y: ["Fail (0)", "Pass (1)"],
                  type: "heatmap",
                  colorscale: [["0", "#1a1a2e"], ["1", modelColors[m.name] || colors.green]],
                  text: cm.map((r) => r.map(String)),
                  texttemplate: "%{text}",
                  textfont: { size: 18 },
                  showscale: false,
                }]}
                layout={makeLayout(m.name, {
                  height: 300,
                  xaxis: { title: "Predicted" },
                  yaxis: { title: "Actual" },
                })}
                useResizeHandler style={{ width: "100%", height: 300 }} config={{ displayModeBar: false }}
              />
            </div>
          );
        })}
      </div>

      <div className="custom-divider" />

      {/* Feature Importance */}
      {result.feature_importance.length > 0 && (
        <>
          <h3 style={{ color: "var(--text-primary)", marginBottom: 8 }}>🎯 Feature Importance (Random Forest)</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>
            Higher values mean the feature is more important for predicting student performance.
          </p>
          <div className="chart-container">
            <Plot
              data={[{
                x: result.feature_importance.slice(0, 15).map((f) => f.importance),
                y: result.feature_importance.slice(0, 15).map((f) => f.feature),
                type: "bar",
                orientation: "h",
                marker: {
                  color: result.feature_importance.slice(0, 15).map((f) => f.importance),
                  colorscale: [["0", "#302B63"], ["1", colors.green]],
                },
                text: result.feature_importance.slice(0, 15).map((f) => f.importance.toFixed(3)),
                textposition: "outside",
              }]}
              layout={makeLayout("Top 15 Most Important Features", {
                height: 500,
                yaxis: { autorange: "reversed" },
              })}
              useResizeHandler style={{ width: "100%", height: 500 }} config={{ displayModeBar: false }}
            />
          </div>
        </>
      )}
    </div>
  );
}
