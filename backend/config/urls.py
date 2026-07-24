from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from expenses.views import ProtectedExpenseSummaryView
from budgets.views import DashboardSummaryView

def home(request):
    return HttpResponse("BudgetBuddy Backend is Running!")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    
    # User authentication endpoints (Registration, etc.)
    path('api/auth/', include('users.urls')),

    # Dashboard API endpoint
    path('api/dashboard/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    
    # Expenses API endpoints
    path('api/expenses/', include('expenses.urls')),

    # Income API endpoints
    path('api/incomes/', include('incomes.urls')),
    
    # Budgets API endpoints
    path('api/budgets/', include('budgets.urls')),
    
    # SimpleJWT Authentication endpoints (Login, Refresh)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Protected API Endpoint Example
    path('api/protected-example/', ProtectedExpenseSummaryView.as_view(), name='protected_example'),
]
