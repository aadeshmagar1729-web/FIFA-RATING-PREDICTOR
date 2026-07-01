from django.urls import path
from .views import predict_single_view, predict_csv_view, history_view

urlpatterns = [
    path("predict/", predict_single_view, name="predict-single"),
    path("predict-csv/", predict_csv_view, name="predict-csv"),
    path("history/", history_view, name="history"),
]
