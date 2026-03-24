import PlotlyChart from "react-plotly.js";
const Plot = (typeof PlotlyChart === "object" && PlotlyChart.default) ? PlotlyChart.default : PlotlyChart;
export default Plot;
