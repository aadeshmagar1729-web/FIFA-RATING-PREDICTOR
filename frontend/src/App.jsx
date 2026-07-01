import { useState } from "react";
import PredictionForm from "./components/PredictionForm";
import CsvUpload from "./components/CsvUpload";
import HistoryTable from "./components/HistoryTable";
import "./App.css";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-mark">⚽</div>
        <div>
          <h1>Pitch Rating Engine</h1>
          <p>FIFA World Cup 2026 · match performance → predicted player rating</p>
        </div>
      </header>

      <main className="layout">
        <section className="layout-col">
          <PredictionForm onPredicted={bumpRefresh} />
        </section>
        <section className="layout-col">
          <CsvUpload onPredicted={bumpRefresh} />
          <HistoryTable refreshKey={refreshKey} />
        </section>
      </main>

      <footer className="footer-note">
        Model: Gradient Boosting Regressor · trained on 54,600 match-level
        records · cross-validated R² ≈ 0.30
      </footer>
    </div>
  );
}
