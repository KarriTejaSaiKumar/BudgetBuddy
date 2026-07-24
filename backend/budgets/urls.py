from django.urls import path
from .views import (
    ProtectedBudgetSummaryView,
    BudgetListView,
    BudgetCreateView,
    BudgetRetrieveView,
    BudgetUpdateView,
    BudgetDestroyView,
)

urlpatterns = [
    path('', BudgetListView.as_view(), name='budget-list'),
    path('create/', BudgetCreateView.as_view(), name='budget-create'),
    path('<uuid:pk>/summary/', ProtectedBudgetSummaryView.as_view(), name='budget-summary'),
    path('<uuid:pk>/', BudgetRetrieveView.as_view(), name='budget-detail'),
    path('<uuid:pk>/update/', BudgetUpdateView.as_view(), name='budget-update'),
    path('<uuid:pk>/delete/', BudgetDestroyView.as_view(), name='budget-delete'),
]
