import { useState, useRef } from "react";
import { predictCsv } from "../api";

export default function CsvUpload({ onPredicted }) {
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await predictCsv(file);
      setResults(res.predictions);
      onPredicted?.();
    } catch (err) {
      setError(
        err.response?.data?.error || "Could not process this file. Check the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-eyebrow">Squad Sheet</span>
        <h2>Bulk upload</h2>
      </div>

      <p className="hint-text">
        Upload a CSV with one row per player performance. Columns should match
        the training data (player_name, team, goals, assists, etc.) — any
        missing columns default to 0.
      </p>

      <div
        className="dropzone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <span className="dropzone-icon">⬆</span>
        <span>{fileName || "Click or drop a .csv file here"}</span>
      </div>

      {loading && <p className="hint-text">Processing file…</p>}
      {error && <p className="error-text">{error}</p>}

      {results && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Team</th>
                <th>Predicted rating</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.player_name || "—"}</td>
                  <td>{r.team || "—"}</td>
                  <td className="rating-cell">{r.predicted_rating.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
