import pandas as pd

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import PredictionHistory
from .serializers import PredictionHistorySerializer
from .ml_model.inference import predict_single, predict_batch


@api_view(["POST"])
def predict_single_view(request):
    """
    POST /api/predict/
    Body: { "player_name": "...", "team": "...", "position": "...",
             "goals": 2, "assists": 1, ... any stat fields ... }

    Predicts a single player's match rating and saves it to history.
    """
    data = request.data

    if not data:
        return Response(
            {"error": "No input data provided."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        rating = predict_single(data)
    except Exception as e:
        return Response(
            {"error": f"Prediction failed: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    history_entry = PredictionHistory.objects.create(
        player_name=data.get("player_name", "Unknown Player"),
        team=data.get("team", ""),
        position=data.get("position", ""),
        input_data=data,
        predicted_rating=rating,
    )

    return Response(
        {
            "predicted_rating": round(rating, 2),
            "history_id": history_entry.id,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def predict_csv_view(request):
    """
    POST /api/predict-csv/
    Body: multipart/form-data with a `file` field containing a CSV.

    Each row in the CSV is treated as one player's stats.
    Returns predictions for every row, and saves each one to history.
    """
    file_obj = request.FILES.get("file")
    if not file_obj:
        return Response(
            {"error": "No file uploaded. Send a CSV file under the 'file' field."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        df = pd.read_csv(file_obj)
    except Exception as e:
        return Response(
            {"error": f"Could not read CSV: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if df.empty:
        return Response({"error": "CSV file is empty."}, status=status.HTTP_400_BAD_REQUEST)

    rows = df.to_dict(orient="records")

    try:
        predictions = predict_batch(rows)
    except Exception as e:
        return Response(
            {"error": f"Prediction failed: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    results = []
    history_objects = []
    for row, rating in zip(rows, predictions):
        results.append({**row, "predicted_rating": round(rating, 2)})
        history_objects.append(
            PredictionHistory(
                player_name=row.get("player_name", "Unknown Player"),
                team=row.get("team", ""),
                position=row.get("position", ""),
                input_data=row,
                predicted_rating=rating,
            )
        )

    # Bulk insert for efficiency instead of saving one-by-one
    PredictionHistory.objects.bulk_create(history_objects)

    return Response({"count": len(results), "predictions": results}, status=status.HTTP_200_OK)


@api_view(["GET"])
def history_view(request):
    return Response({"message": "Backend is working"})
