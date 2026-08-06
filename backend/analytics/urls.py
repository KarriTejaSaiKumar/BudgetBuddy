from django.urls import path
from .views import (
    FinancialSummaryView,
    CategoryExpenseAnalysisView,
    MonthlyExpenseTrendView,
    ExpenseExtremesView,
    RecentTransactionsView,
    ActiveSavingsGoalsView,
    AnalyticsDashboardView,
)

urlpatterns = [
    path('financial-summary/', FinancialSummaryView.as_view(), name='analytics-financial-summary'),
    path('category-analysis/', CategoryExpenseAnalysisView.as_view(), name='analytics-category-analysis'),
    path('monthly-trend/', MonthlyExpenseTrendView.as_view(), name='analytics-monthly-trend'),
    path('expense-extremes/', ExpenseExtremesView.as_view(), name='analytics-expense-extremes'),
    path('recent-transactions/', RecentTransactionsView.as_view(), name='analytics-recent-transactions'),
    path('active-savings-goals/', ActiveSavingsGoalsView.as_view(), name='analytics-active-savings-goals'),
    path('dashboard/', AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
]
