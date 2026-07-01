from django.db import models


class PredictionHistory(models.Model):
    """
    Stores every prediction made through the app, so the frontend
    can show a history table of past predictions.
    """
    player_name = models.CharField(max_length=100, blank=True, default="Unknown Player")
    team = models.CharField(max_length=100, blank=True, default="")
    position = models.CharField(max_length=50, blank=True, default="")

    # We store the raw input the user submitted as JSON, so we always
    # know exactly what was fed into the model for this prediction.
    input_data = models.JSONField()

    predicted_rating = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]  # newest predictions first

    def __str__(self):
        return f"{self.player_name} ({self.team}) -> {self.predicted_rating:.2f}"
