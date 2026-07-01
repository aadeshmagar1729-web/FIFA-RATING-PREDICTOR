"""
inference.py - ML model loader
================================
Pehli baar load hone par model train karta hai (CSV se).
Baad mein model memory me cached rehta hai — har request pe
retrain nahi hota.
"""

import os
import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "fifa_world_cup_2026_player_performance.csv")
CACHE_MODEL_PATH = os.path.join(BASE_DIR, "model_cache.pkl")
CACHE_FEATURES_PATH = os.path.join(BASE_DIR, "feature_names_cache.pkl")

CATEGORICAL_COLUMNS = [
    "nationality", "team", "position", "preferred_foot",
    "opponent_team", "tournament_stage", "match_result",
]

NUMERIC_DEFAULTS = {
    "age": 25, "height_cm": 180, "weight_kg": 75,
    "market_value_eur": 5_000_000,
    "goals_team": 1, "goals_opponent": 1, "minutes_played": 90,
}


def _train_and_cache():
    print("[ML] Training model from CSV...")
    df = pd.read_csv(CSV_PATH)
    df = df[df["minutes_played"] > 0].copy()

    drop_cols = [
        "tournament_rating", "performance_score",
        "player_id", "player_name", "match_id", "match_date",
        "stadium", "city", "club_name", "jersey_number", "player_rating"
    ]
    y = df["player_rating"]
    X = df.drop(columns=[c for c in drop_cols if c in df.columns])

    cat_cols = X.select_dtypes(include=["object", "string"]).columns.tolist()
    X_encoded = pd.get_dummies(X, columns=cat_cols, drop_first=True)
    feature_names = X_encoded.columns.tolist()

    model = GradientBoostingRegressor(
        n_estimators=200, max_depth=4,
        learning_rate=0.05, random_state=42
    )
    model.fit(X_encoded, y)

    joblib.dump(model, CACHE_MODEL_PATH)
    joblib.dump(feature_names, CACHE_FEATURES_PATH)
    print("[ML] Model trained and cached.")
    return model, feature_names


def _load_model():
    # Agar cache exist karta hai to seedha load karo
    if os.path.exists(CACHE_MODEL_PATH) and os.path.exists(CACHE_FEATURES_PATH):
        try:
            model = joblib.load(CACHE_MODEL_PATH)
            feature_names = joblib.load(CACHE_FEATURES_PATH)
            print("[ML] Model loaded from cache.")
            return model, feature_names
        except Exception:
            pass  # Cache corrupt ho to retrain karo

    # CSV se train karo
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(
            f"CSV file nahi mili: {CSV_PATH}\n"
            "Please 'fifa_world_cup_2026_player_performance.csv' ko is folder me rakho:\n"
            f"{BASE_DIR}"
        )
    return _train_and_cache()


# Server start hote hi ek baar load hota hai
_model, _feature_names = _load_model()


def _build_feature_row(raw: dict) -> pd.DataFrame:
    row = dict(raw)
    for col, default in NUMERIC_DEFAULTS.items():
        row.setdefault(col, default)

    df = pd.DataFrame([row])
    for col in df.columns:
        if col not in CATEGORICAL_COLUMNS:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    present_cat = [c for c in CATEGORICAL_COLUMNS if c in df.columns]
    df_encoded = pd.get_dummies(df, columns=present_cat, drop_first=False)
    df_aligned = df_encoded.reindex(columns=_feature_names, fill_value=0)
    return df_aligned


def predict_single(raw: dict) -> float:
    X = _build_feature_row(raw)
    return float(max(0, min(10, _model.predict(X)[0])))


def predict_batch(rows: list) -> list:
    df = pd.DataFrame(rows)
    for col in df.columns:
        if col not in CATEGORICAL_COLUMNS:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    present_cat = [c for c in CATEGORICAL_COLUMNS if c in df.columns]
    df_encoded = pd.get_dummies(df, columns=present_cat, drop_first=False)
    df_aligned = df_encoded.reindex(columns=_feature_names, fill_value=0)
    predictions = _model.predict(df_aligned)
    return [float(max(0, min(10, p))) for p in predictions]
