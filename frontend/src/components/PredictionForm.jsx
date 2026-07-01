import { useState } from "react";
import { predictSingle } from "../api";
import {
  TEAMS,
  NATIONALITIES,
  POSITIONS,
  TOURNAMENT_STAGES,
  MATCH_RESULTS,
} from "../constants";

const initialForm = {
  player_name: "",
  team: "Brazil",
  nationality: "Brazilian",
  position: "Forward",
  preferred_foot: "Right",
  opponent_team: "Argentina",
  tournament_stage: "Group Stage",
  match_result: "W",
  minutes_played: 90,
  goals: 0,
  assists: 0,
  shots: 0,
  shots_on_target: 0,
  pass_accuracy: 0.8,
  tackles: 0,
  interceptions: 0,
  saves: 0,
};

const advancedFields = [
  { key: "key_passes", label: "Key passes" },
  { key: "successful_dribbles", label: "Successful dribbles" },
  { key: "crosses", label: "Crosses" },
  { key: "clearances", label: "Clearances" },
  { key: "aerial_duels_won", label: "Aerial duels won" },
  { key: "fouls_committed", label: "Fouls committed" },
  { key: "fouls_suffered", label: "Fouls suffered" },
  { key: "yellow_cards", label: "Yellow cards" },
  { key: "red_cards", label: "Red cards" },
  { key: "distance_covered_km", label: "Distance covered (km)" },
  { key: "market_value_eur", label: "Market value (EUR)" },
  { key: "age", label: "Age" },
];

export default function PredictionForm({ onPredicted }) {
  const [form, setForm] = useState(initialForm);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await predictSingle(form);
      setResult(res.predicted_rating);
      onPredicted?.();
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="panel-header">
        <span className="panel-eyebrow">Match Sheet</span>
        <h2>Rate a performance</h2>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Player name</span>
          <input
            type="text"
            placeholder="e.g. R. Silva"
            value={form.player_name}
            onChange={(e) => update("player_name", e.target.value)}
          />
        </label>

        <label className="field">
          <span>Team</span>
          <select value={form.team} onChange={(e) => update("team", e.target.value)}>
            {TEAMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Nationality</span>
          <select value={form.nationality} onChange={(e) => update("nationality", e.target.value)}>
            {NATIONALITIES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Opponent</span>
          <select value={form.opponent_team} onChange={(e) => update("opponent_team", e.target.value)}>
            {TEAMS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Position</span>
          <select value={form.position} onChange={(e) => update("position", e.target.value)}>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Preferred foot</span>
          <select value={form.preferred_foot} onChange={(e) => update("preferred_foot", e.target.value)}>
            <option value="Left">Left</option>
            <option value="Right">Right</option>
          </select>
        </label>

        <label className="field">
          <span>Stage</span>
          <select value={form.tournament_stage} onChange={(e) => update("tournament_stage", e.target.value)}>
            {TOURNAMENT_STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Result</span>
          <select value={form.match_result} onChange={(e) => update("match_result", e.target.value)}>
            {MATCH_RESULTS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Minutes played</span>
          <input type="number" min="0" max="120" value={form.minutes_played}
            onChange={(e) => update("minutes_played", e.target.value)} />
        </label>

        <label className="field">
          <span>Goals</span>
          <input type="number" min="0" value={form.goals}
            onChange={(e) => update("goals", e.target.value)} />
        </label>

        <label className="field">
          <span>Assists</span>
          <input type="number" min="0" value={form.assists}
            onChange={(e) => update("assists", e.target.value)} />
        </label>

        <label className="field">
          <span>Shots</span>
          <input type="number" min="0" value={form.shots}
            onChange={(e) => update("shots", e.target.value)} />
        </label>

        <label className="field">
          <span>Shots on target</span>
          <input type="number" min="0" value={form.shots_on_target}
            onChange={(e) => update("shots_on_target", e.target.value)} />
        </label>

        <label className="field">
          <span>Pass accuracy (0-1)</span>
          <input type="number" min="0" max="1" step="0.01" value={form.pass_accuracy}
            onChange={(e) => update("pass_accuracy", e.target.value)} />
        </label>

        <label className="field">
          <span>Tackles</span>
          <input type="number" min="0" value={form.tackles}
            onChange={(e) => update("tackles", e.target.value)} />
        </label>

        <label className="field">
          <span>Interceptions</span>
          <input type="number" min="0" value={form.interceptions}
            onChange={(e) => update("interceptions", e.target.value)} />
        </label>
      </div>

      <button
        type="button"
        className="advanced-toggle"
        onClick={() => setShowAdvanced((v) => !v)}
      >
        {showAdvanced ? "− Hide advanced stats" : "+ Add advanced stats"}
      </button>

      {showAdvanced && (
        <div className="field-grid">
          {advancedFields.map((f) => (
            <label className="field" key={f.key}>
              <span>{f.label}</span>
              <input
                type="number"
                value={form[f.key] ?? ""}
                onChange={(e) => update(f.key, e.target.value)}
              />
            </label>
          ))}
        </div>
      )}

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? "Calculating…" : "Predict rating"}
      </button>

      {error && <p className="error-text">{error}</p>}

      {result !== null && (
        <div className="result-card">
          <span className="result-label">Predicted rating</span>
          <span className="result-value">{result.toFixed(2)}</span>
          <span className="result-scale">/ 10</span>
        </div>
      )}
    </form>
  );
}
