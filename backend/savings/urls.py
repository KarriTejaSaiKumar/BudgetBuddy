from django.urls import path
from .views import (
    SavingsListView,
    SavingsCreateView,
    SavingsRetrieveView,
    SavingsUpdateView,
    SavingsDestroyView,
    ProtectedSavingsSummaryView,
)

urlpatterns = [
    path('', SavingsListView.as_view(), name='savings-list'),
    path('create/', SavingsCreateView.as_view(), name='savings-create'),
    path('summary/', ProtectedSavingsSummaryView.as_view(), name='savings-summary'),
    path('<uuid:pk>/', SavingsRetrieveView.as_view(), name='savings-detail'),
    path('<uuid:pk>/update/', SavingsUpdateView.as_view(), name='savings-update'),
    path('<uuid:pk>/delete/', SavingsDestroyView.as_view(), name='savings-delete'),
]
