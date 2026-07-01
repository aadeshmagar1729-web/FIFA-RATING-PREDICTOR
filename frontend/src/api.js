import axios from "axios";

const API_BASE = "http://localhost:8000/api";

// Predict rating for a single player's stats
export const predictSingle = (data) =>
  axios.post(`${API_BASE}/predict/`, data).then((res) => res.data);

// Predict ratings for a CSV file (bulk upload)
export const predictCsv = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios
    .post(`${API_BASE}/predict-csv/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

// Fetch recent prediction history
export const getHistory = () =>
  axios.get(`${API_BASE}/history/`).then((res) => res.data);
