from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .services import (
    get_financial_summary,
    get_category_expense_analysis,
    get_monthly_expense_trend,
    get_expense_extremes,
    get_recent_transactions,
    get_active_savings_goals,
)
from .serializers import (
    FinancialSummarySerializer,
    CategoryExpenseAnalysisSerializer,
    MonthlyExpenseTrendSerializer,
    ExpenseExtremesSerializer,
    RecentTransactionSerializer,
    SavingsGoalSerializer,
    AnalyticsDashboardSerializer,
    DateFilterSerializer,
)


class FinancialSummaryView(APIView):
    """
    GET /api/analytics/financial-summary/
    Returns high-level financial summary KPIs (Total Income, Total Expense, Balance, Savings, Remaining Budget).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            summary_data = get_financial_summary(request.user)
            serializer = FinancialSummarySerializer(summary_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to compute financial summary.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CategoryExpenseAnalysisView(APIView):
    """
    GET /api/analytics/category-analysis/
    Returns category-wise expense breakdown with transaction counts and percentage share.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            category_data = get_category_expense_analysis(request.user)
            serializer = CategoryExpenseAnalysisSerializer(category_data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to compute category expense analysis.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MonthlyExpenseTrendView(APIView):
    """
    GET /api/analytics/monthly-trend/
    Returns monthly expense trends, optionally filtered by date range or timeframe.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            trend_data = get_monthly_expense_trend(request.user)
            serializer = MonthlyExpenseTrendSerializer(trend_data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to compute monthly expense trends.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExpenseExtremesView(APIView):
    """
    GET /api/analytics/expense-extremes/
    Returns highest, lowest, latest, and oldest expenses for the user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            extremes_data = get_expense_extremes(request.user)
            serializer = ExpenseExtremesSerializer(extremes_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to retrieve expense extremes.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RecentTransactionsView(APIView):
    """
    GET /api/analytics/recent-transactions/?limit=10
    Returns unified chronological feed of recent Income and Expense records.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        raw_limit = request.query_params.get('limit', 10)
        try:
            limit = int(raw_limit)
            if limit <= 0:
                return Response(
                    {"error": "Query parameter 'limit' must be a positive integer."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {"error": "Query parameter 'limit' must be a valid integer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            recent_data = get_recent_transactions(request.user, limit=limit)
            serializer = RecentTransactionSerializer(recent_data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to retrieve recent transactions.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ActiveSavingsGoalsView(APIView):
    """
    GET /api/analytics/active-savings-goals/
    Returns active savings goals and goal progress metrics.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            goals_data = get_active_savings_goals(request.user)
            serializer = SavingsGoalSerializer(goals_data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to retrieve active savings goals.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AnalyticsDashboardView(APIView):
    """
    GET /api/analytics/dashboard/
    Master dashboard endpoint aggregating all analytics components in a single payload.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        filter_serializer = DateFilterSerializer(data=request.query_params)
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = request.user
            dashboard_data = {
                "financial_summary": get_financial_summary(user),
                "category_analysis": get_category_expense_analysis(user),
                "monthly_trends": get_monthly_expense_trend(user),
                "expense_extremes": get_expense_extremes(user),
                "recent_transactions": get_recent_transactions(user, limit=10),
                "active_savings_goals": get_active_savings_goals(user),
            }
            serializer = AnalyticsDashboardSerializer(dashboard_data)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to generate analytics dashboard.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
