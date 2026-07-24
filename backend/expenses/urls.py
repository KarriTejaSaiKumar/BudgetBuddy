from django.urls import path
from .views import (
    ProtectedExpenseSummaryView,
    ExpenseListCreateView,
    ExpenseCreateView,
    ExpenseListView,
    ExpenseRetrieveUpdateDestroyView,
    ExpenseRetrieveView,
    ExpenseUpdateView,
    ExpenseDestroyView,
)

urlpatterns = [
    path('', ExpenseListCreateView.as_view(), name='expense-list-create'),
    path('create/', ExpenseCreateView.as_view(), name='expense-create'),
    path('summary/', ProtectedExpenseSummaryView.as_view(), name='expense-summary'),
    path('<uuid:pk>/', ExpenseRetrieveUpdateDestroyView.as_view(), name='expense-detail'),
    path('<uuid:pk>/update/', ExpenseUpdateView.as_view(), name='expense-update'),
    path('<uuid:pk>/delete/', ExpenseDestroyView.as_view(), name='expense-delete'),
]

