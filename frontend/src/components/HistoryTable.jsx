import { useEffect, useState, useCallback } from "react";
import { getHistory } from "../api";

export default function HistoryTable({ refreshKey }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-eyebrow">Log</span>
        <h2>Recent predictions</h2>
      </div>

      {loading && <p className="hint-text">Loading…</p>}

      {!loading && history.length === 0 && (
        <p className="hint-text">No predictions yet. Run one above to see it here.</p>
      )}

      {!loading && history.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Team</th>
                <th>Position</th>
                <th>Rating</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>{h.player_name || "—"}</td>
                  <td>{h.team || "—"}</td>
                  <td>{h.position || "—"}</td>
                  <td className="rating-cell">{h.predicted_rating.toFixed(2)}</td>
                  <td>{new Date(h.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
