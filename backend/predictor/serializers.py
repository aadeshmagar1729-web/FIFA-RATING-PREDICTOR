from rest_framework import serializers
from .models import PredictionHistory


class PredictionHistorySerializer(serializers.ModelSerializer):
    """Converts PredictionHistory model objects <-> JSON for the API."""

    class Meta:
        model = PredictionHistory
        fields = [
            "id", "player_name", "team", "position",
            "input_data", "predicted_rating", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
