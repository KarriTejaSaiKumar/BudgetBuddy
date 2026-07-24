from django.urls import path
from .views import (
    ProtectedIncomeSummaryView,
    IncomeListView,
    IncomeCreateView,
    IncomeRetrieveView,
    IncomeUpdateView,
    IncomeDestroyView,
)

urlpatterns = [
    path('', IncomeListView.as_view(), name='income-list'),
    path('create/', IncomeCreateView.as_view(), name='income-create'),
    path('summary/', ProtectedIncomeSummaryView.as_view(), name='income-summary'),
    path('<uuid:pk>/', IncomeRetrieveView.as_view(), name='income-detail'),
    path('<uuid:pk>/update/', IncomeUpdateView.as_view(), name='income-update'),
    path('<uuid:pk>/delete/', IncomeDestroyView.as_view(), name='income-delete'),
]

