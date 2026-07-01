# Pitch Rating Engine — FIFA World Cup 2026 Player Rating Predictor

A full-stack app: **React** frontend + **Django REST Framework** backend,
serving predictions from a trained ML model (Gradient Boosting Regressor)
that predicts a player's match `player_rating` from in-match stats.

```
fifa-rating-predictor/
├── backend/        Django + DRF API + ML model
└── frontend/        React (Vite) UI
```

## What it does

- **Single prediction form** — fill in a player's match stats, get a predicted rating instantly.
- **CSV bulk upload** — upload a CSV of multiple player-match rows, get predictions for all of them.
- **History log** — every prediction (single or bulk) is saved to a SQLite database and shown in a table.

## Opening in VS Code

1. Unzip the folder, then open it in VS Code: `File → Open Folder...` and select the `fifa-rating-predictor` folder (or run `code .` inside it from a terminal).
2. VS Code will prompt **"Install recommended extensions?"** — click **Install** (Python + Prettier/ESLint helpers).
3. Open a terminal in VS Code: `Terminal → New Terminal` (or `` Ctrl+` ``).
4. Use **Terminal → Run Task...** and pick:
   - `Backend: Install deps`
   - `Backend: Migrate DB`
   - `Frontend: Install deps`
   then run **`Run Full Stack (Backend + Frontend)`** to start both servers at once.
   (Or just follow the manual steps below in two separate terminals — same result.)
5. Backend will be at `http://localhost:8000`, frontend at `http://localhost:5173`.

If VS Code shows Python import errors (e.g. "Could not resolve `django`"), select the correct interpreter: `Ctrl+Shift+P` → **Python: Select Interpreter** → pick the one inside `backend/venv` (create it first with the steps below if it doesn't exist yet).

## 1. Backend setup (Django)

```bash
cd backend

# (recommended) create a virtual environment
python3 -m venv venv
source venv/bin/activate        # on Windows: venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# set up the database
python manage.py migrate

# (optional) create an admin user to view history at /admin
python manage.py createsuperuser

# run the server
python manage.py runserver
```

Backend will run at **http://localhost:8000**

API endpoints:
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/predict/` | Predict rating for one player (JSON body) |
| POST | `/api/predict-csv/` | Predict ratings for a CSV file (multipart upload, field name `file`) |
| GET | `/api/history/` | Get the most recent 50 predictions |

## 2. Frontend setup (React)

Open a **new terminal** (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at **http://localhost:5173** — open this in your browser.

## How the ML model is wired in

- The trained model (`best_model.pkl`) and the exact list of training
  feature columns (`feature_names.pkl`) live in `backend/predictor/ml_model/`.
- `backend/predictor/ml_model/inference.py` loads them once when Django
  starts, and exposes `predict_single()` / `predict_batch()` functions.
- These functions one-hot encode categorical fields (team, position, etc.)
  exactly the way the model was trained, then align columns so the model
  always receives the same shape of input it was trained on — any column
  the model expects that wasn't provided gets filled with 0.
- `views.py` calls these functions inside the API endpoints and saves
  each result to the `PredictionHistory` database table.

## Retraining / swapping the model

If you retrain the model (e.g. using `train_models.py` from earlier),
just replace these two files and restart the Django server:
```
backend/predictor/ml_model/best_model.pkl
backend/predictor/ml_model/feature_names.pkl
```
No other code changes needed, as long as the target column and general
feature set stay the same.

## CSV format for bulk upload

The CSV should have one row per player-match performance, with columns
matching the original training data (the same columns as
`fifa_world_cup_2026_player_performance.csv`, minus `player_rating`,
`tournament_rating`, and `performance_score`). Any columns you don't
include will default to 0.

## Notes

- This is a development setup (Django's `runserver`, Vite's dev server).
  For production you'd want a proper WSGI server (e.g. gunicorn) behind
  nginx, and a production build of the React app (`npm run build`).
- CORS is currently configured to allow `localhost:5173` and
  `localhost:3000` only — update `CORS_ALLOWED_ORIGINS` in
  `backend/backend/settings.py` if you deploy elsewhere.
