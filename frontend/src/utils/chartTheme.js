/**
 * Shared Plotly chart theme — matches the dark glassmorphism aesthetic.
 */
export const darkLayout = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#a0a0b0", family: "Inter, sans-serif" },
  xaxis: {
    gridcolor: "rgba(255,255,255,0.05)",
    zerolinecolor: "rgba(255,255,255,0.1)",
  },
  yaxis: {
    gridcolor: "rgba(255,255,255,0.05)",
    zerolinecolor: "rgba(255,255,255,0.1)",
  },
  margin: { t: 50, b: 50, l: 50, r: 30 },
  legend: { font: { color: "#a0a0b0" } },
};

const titleFont = { color: "#ffffff", size: 16 };

/**
 * Build a Plotly layout by merging the base dark theme with overrides.
 */
export function makeLayout(titleText, overrides = {}) {
  const { xaxis, yaxis, ...rest } = overrides;
  return {
    ...darkLayout,
    title: { text: titleText, font: titleFont },
    xaxis: { ...darkLayout.xaxis, ...xaxis },
    yaxis: { ...darkLayout.yaxis, ...yaxis },
    ...rest,
  };
}


export const colors = {
  green: "#00C896",
  blue: "#00B4D8",
  red: "#FF4B4B",
  yellow: "#FFC857",
  orange: "#FFA500",
  purple: "#845EC2",
  pink: "#D65DB1",
  peach: "#FF9671",
  cyan: "#90E0EF",
};

export const palette = [
  colors.green,
  colors.blue,
  colors.red,
  colors.yellow,
  colors.purple,
  colors.peach,
  colors.pink,
];

export const riskColorMap = {
  "High Risk": colors.red,
  "Medium Risk": colors.orange,
  "Low Risk": colors.green,
};
