import { useEffect, useState } from "react";
import Plot from "../components/Plot";
import { predictStudent, getFeatureDescriptions, getStatus } from "../services/api";
import PageHeader from "../components/PageHeader";
import GlassCard from "../components/GlassCard";
import { makeLayout, colors } from "../utils/chartTheme";
import "./Home.css";
import "./Predict.css";

export default function Predict() {
  const [featureDesc, setFeatureDesc] = useState({});
  const [modelReady, setModelReady] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    school: "GP", sex: "M", age: 17, address: "U",
    famsize: "GT3", Pstatus: "T", Medu: 2, Fedu: 2,
    Mjob: "other", Fjob: "other", reason: "course", guardian: "mother",
    traveltime: 1, studytime: 2, failures: 0,
    schoolsup: "no", famsup: "yes", paid: "no", activities: "yes",
    nursery: "yes", higher: "yes", internet: "yes", romantic: "no",
    famrel: 4, freetime: 3, goout: 3, Dalc: 1, Walc: 1,
    health: 3, absences: 5, G1: 10, G2: 10,
  });

  useEffect(() => {
    getFeatureDescriptions().then((r) => setFeatureDesc(r.data)).catch(() => {});
    getStatus().then((r) => setModelReady(r.data.model_trained)).catch(() => {});
  }, []);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await predictStudent(form);
      setResult(res.data);
    } catch (err) {
      alert("Prediction failed: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (modelReady === false) {
    return (
      <div>
        <PageHeader icon="🔮" title="Predict Student Performance" subtitle="" />
        <GlassCard className="text-center">
          <div style={{ fontSize: "3rem", marginBottom: 15 }}>⚠️</div>
          <h3 style={{ color: "var(--accent-yellow)" }}>Model Not Trained Yet</h3>
          <p style={{ color: "var(--text-muted)" }}>
            Please go to the <strong style={{ color: "var(--accent-green)" }}>Model Training</strong> page first to train the ML model.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      <PageHeader icon="🔮" title="Predict Student Performance" subtitle="Enter student details to get AI-powered performance prediction & risk assessment" />

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <h4 className="form-section-title">👤 Personal Information</h4>
        <div className="form-grid-4">
          <SelectField label="School" value={form.school} options={["GP", "MS"]} onChange={(v) => handleChange("school", v)} tip={featureDesc.school} />
          <SelectField label="Sex" value={form.sex} options={["M", "F"]} onChange={(v) => handleChange("sex", v)} tip={featureDesc.sex} />
          <SliderField label="Age" value={form.age} min={15} max={22} onChange={(v) => handleChange("age", v)} tip={featureDesc.age} />
          <SelectField label="Address Type" value={form.address} options={["U", "R"]} onChange={(v) => handleChange("address", v)} tip={featureDesc.address} />
        </div>

        {/* Family Information */}
        <h4 className="form-section-title">👨‍👩‍👧 Family Information</h4>
        <div className="form-grid-4">
          <SelectField label="Family Size" value={form.famsize} options={["LE3", "GT3"]} onChange={(v) => handleChange("famsize", v)} tip={featureDesc.famsize} />
          <SelectField label="Parents' Status" value={form.Pstatus} options={["T", "A"]} onChange={(v) => handleChange("Pstatus", v)} tip={featureDesc.Pstatus} />
          <SliderField label="Mother's Education" value={form.Medu} min={0} max={4} onChange={(v) => handleChange("Medu", v)} tip={featureDesc.Medu} />
          <SliderField label="Father's Education" value={form.Fedu} min={0} max={4} onChange={(v) => handleChange("Fedu", v)} tip={featureDesc.Fedu} />
        </div>
        <div className="form-grid-4">
          <SelectField label="Mother's Job" value={form.Mjob} options={["teacher", "health", "services", "at_home", "other"]} onChange={(v) => handleChange("Mjob", v)} />
          <SelectField label="Father's Job" value={form.Fjob} options={["teacher", "health", "services", "at_home", "other"]} onChange={(v) => handleChange("Fjob", v)} />
          <SelectField label="Guardian" value={form.guardian} options={["mother", "father", "other"]} onChange={(v) => handleChange("guardian", v)} />
          <SliderField label="Family Relationship" value={form.famrel} min={1} max={5} onChange={(v) => handleChange("famrel", v)} />
        </div>

        {/* Academic Information */}
        <h4 className="form-section-title">📚 Academic Information</h4>
        <div className="form-grid-4">
          <SelectField label="School Choice Reason" value={form.reason} options={["home", "reputation", "course", "other"]} onChange={(v) => handleChange("reason", v)} />
          <SliderField label="Travel Time" value={form.traveltime} min={1} max={4} onChange={(v) => handleChange("traveltime", v)} />
          <SliderField label="Weekly Study Time" value={form.studytime} min={1} max={4} onChange={(v) => handleChange("studytime", v)} />
          <SliderField label="Past Failures" value={form.failures} min={0} max={4} onChange={(v) => handleChange("failures", v)} />
        </div>
        <div className="form-grid-4">
          <SelectField label="School Support" value={form.schoolsup} options={["yes", "no"]} onChange={(v) => handleChange("schoolsup", v)} />
          <SelectField label="Family Support" value={form.famsup} options={["yes", "no"]} onChange={(v) => handleChange("famsup", v)} />
          <SelectField label="Paid Classes" value={form.paid} options={["yes", "no"]} onChange={(v) => handleChange("paid", v)} />
          <SelectField label="Extracurricular" value={form.activities} options={["yes", "no"]} onChange={(v) => handleChange("activities", v)} />
        </div>

        {/* Grades & Attendance */}
        <h4 className="form-section-title">📊 Grades & Attendance</h4>
        <div className="form-grid-4">
          <SliderField label="First Period Grade (G1)" value={form.G1} min={0} max={20} onChange={(v) => handleChange("G1", v)} />
          <SliderField label="Second Period Grade (G2)" value={form.G2} min={0} max={20} onChange={(v) => handleChange("G2", v)} />
          <SliderField label="Number of Absences" value={form.absences} min={0} max={93} onChange={(v) => handleChange("absences", v)} />
          <SliderField label="Health Status" value={form.health} min={1} max={5} onChange={(v) => handleChange("health", v)} />
        </div>

        {/* Lifestyle */}
        <h4 className="form-section-title">🎯 Lifestyle</h4>
        <div className="form-grid-4">
          <SelectField label="Nursery" value={form.nursery} options={["yes", "no"]} onChange={(v) => handleChange("nursery", v)} />
          <SelectField label="Higher Education" value={form.higher} options={["yes", "no"]} onChange={(v) => handleChange("higher", v)} />
          <SelectField label="Internet" value={form.internet} options={["yes", "no"]} onChange={(v) => handleChange("internet", v)} />
          <SelectField label="Romantic" value={form.romantic} options={["no", "yes"]} onChange={(v) => handleChange("romantic", v)} />
        </div>
        <div className="form-grid-4">
          <SliderField label="Free Time" value={form.freetime} min={1} max={5} onChange={(v) => handleChange("freetime", v)} />
          <SliderField label="Going Out" value={form.goout} min={1} max={5} onChange={(v) => handleChange("goout", v)} />
          <SliderField label="Workday Alcohol" value={form.Dalc} min={1} max={5} onChange={(v) => handleChange("Dalc", v)} />
          <SliderField label="Weekend Alcohol" value={form.Walc} min={1} max={5} onChange={(v) => handleChange("Walc", v)} />
        </div>

        <button type="submit" className="btn-primary btn-primary--full" disabled={loading} style={{ marginTop: 24, fontSize: "1.05rem" }}>
          {loading ? "🤖 Analyzing..." : "🔮 Predict Performance"}
        </button>
      </form>

      {/* RESULTS */}
      {result && <PredictionResults result={result} />}
    </div>
  );
}

/* ---- RESULTS SECTION ---- */
function PredictionResults({ result }) {
  const prob = result.pass_probability;
  const riskClasses = {
    "High Risk": "risk-high",
    "Medium Risk": "risk-medium",
    "Low Risk": "risk-low",
  };
  const riskIcons = { "High Risk": "🔴", "Medium Risk": "🟡", "Low Risk": "🟢" };

  return (
    <div style={{ marginTop: 32 }}>
      <div className="custom-divider" />
      <h3 style={{ color: "var(--text-primary)", marginBottom: 20 }}>📋 Prediction Results</h3>

      <div className="grid-3">
        <GlassCard className="text-center">
          <div style={{ fontSize: "2.5rem" }}>{result.prediction === 1 ? "✅" : "❌"}</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: result.prediction === 1 ? colors.green : colors.red, margin: "10px 0" }}>
            {result.prediction_label}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Predicted Result</div>
        </GlassCard>

        <div className={`risk-card ${riskClasses[result.risk_level]}`}>
          <div style={{ fontSize: "2.5rem" }}>{riskIcons[result.risk_level]}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", margin: "10px 0" }}>{result.risk_level}</div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Academic Risk Level</div>
        </div>

        <div className="chart-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plot
            data={[{
              type: "indicator",
              mode: "gauge+number",
              value: prob * 100,
              number: { suffix: "%", font: { color: "white", size: 40 } },
              title: { text: "Pass Probability", font: { color: "#a0a0b0", size: 14 } },
              gauge: {
                axis: { range: [0, 100], tickcolor: "#555" },
                bar: { color: prob >= 0.7 ? colors.green : prob >= 0.4 ? colors.yellow : colors.red },
                bgcolor: "rgba(255,255,255,0.05)",
                borderwidth: 0,
                steps: [
                  { range: [0, 40], color: "rgba(255,75,75,0.1)" },
                  { range: [40, 70], color: "rgba(255,200,87,0.1)" },
                  { range: [70, 100], color: "rgba(0,200,150,0.1)" },
                ],
              },
            }]}
            layout={makeLayout("", { height: 220, margin: { t: 60, b: 20, l: 30, r: 30 } })}
            useResizeHandler
            style={{ width: "100%", height: 220 }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>

      <div className="custom-divider" />

      {/* Recommendations */}
      <h3 style={{ color: "var(--text-primary)", marginBottom: 16 }}>🧠 AI Risk Advisor Recommendations</h3>
      <div className="rec-badges">
        <span className="rec-badge rec-badge--critical">🚨 {result.risk_summary.critical} Critical</span>
        <span className="rec-badge rec-badge--important">⚠️ {result.risk_summary.important} Important</span>
        <span className="rec-badge rec-badge--suggested">💡 {result.risk_summary.suggested} Suggested</span>
      </div>
      {result.recommendations.map((rec, i) => (
        <RecommendationCard key={i} rec={rec} />
      ))}
      <p style={{ color: "var(--accent-green)", marginTop: 16, fontWeight: 600 }}>✅ Prediction saved to history!</p>
    </div>
  );
}

function RecommendationCard({ rec }) {
  const colorMap = {
    Critical: { border: "rgba(255,75,75,0.3)", bg: "rgba(255,75,75,0.15)", color: colors.red },
    Important: { border: "rgba(255,165,0,0.3)", bg: "rgba(255,165,0,0.15)", color: colors.orange },
    Suggested: { border: "rgba(0,200,150,0.3)", bg: "rgba(0,200,150,0.15)", color: colors.green },
  };
  const c = colorMap[rec.priority] || colorMap.Suggested;
  return (
    <div className="recommendation-card" style={{ borderColor: c.border }}>
      <div className="rec-header">
        <span style={{ fontWeight: 600, color: "#ccc" }}>{rec.icon} {rec.category}</span>
        <span className="rec-priority-badge" style={{ background: c.bg, color: c.color }}>{rec.priority}</span>
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{rec.recommendation}</p>
    </div>
  );
}

/* ---- FORM FIELDS ---- */
function SelectField({ label, value, options, onChange, tip }) {
  return (
    <div className="form-field">
      <label className="form-label" title={tip}>{label}</label>
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SliderField({ label, value, min, max, onChange, tip }) {
  return (
    <div className="form-field">
      <label className="form-label" title={tip}>{label}: <strong style={{ color: "var(--accent-green)" }}>{value}</strong></label>
      <input type="range" className="form-slider" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
