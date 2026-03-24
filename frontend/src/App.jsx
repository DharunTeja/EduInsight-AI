import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import BatchUpload from "./pages/BatchUpload";
import ModelTraining from "./pages/ModelTraining";
import History from "./pages/History";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/batch" element={<BatchUpload />} />
            <Route path="/training" element={<ModelTraining />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
