from django.shortcuts import get_object_or_404
from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from incomes.models import Income
from expenses.models import Expense
from .models import Budget
from .serializers import BudgetSerializer

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a budget record to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class DashboardSummaryView(APIView):
    """
    GET /api/dashboard/
    Aggregates financial metrics (total_income, total_expense, current_balance,
    total_budget, remaining_budget) and retrieves the latest 10 recent transactions
    (Income and Expense records) for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        income_agg = Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total']
        expense_agg = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total']
        budget_agg = Budget.objects.filter(user=request.user).aggregate(total=Sum('budget_amount'))['total']

        total_income = float(income_agg) if income_agg is not None else 0
        total_expense = float(expense_agg) if expense_agg is not None else 0
        current_balance = total_income - total_expense
        total_budget = float(budget_agg) if budget_agg is not None else 0

        remaining_budget = total_budget - total_expense
        if remaining_budget < 0:
            remaining_budget = 0

        transactions = []

        incomes = Income.objects.filter(user=request.user).order_by('-date', '-created_at')[:10]
        for inc in incomes:
            transactions.append({
                "id": str(inc.id),
                "type": "Income",
                "title": inc.description if inc.description else inc.get_source_display(),
                "category": inc.get_source_display(),
                "amount": float(inc.amount),
                "date": str(inc.date),
                "timestamp": inc.created_at,
            })

        expenses = Expense.objects.filter(user=request.user).order_by('-expense_date', '-created_at')[:10]
        for exp in expenses:
            transactions.append({
                "id": str(exp.id),
                "type": "Expense",
                "title": exp.title,
                "category": exp.get_category_display(),
                "amount": float(exp.amount),
                "date": str(exp.expense_date),
                "timestamp": exp.created_at,
            })

        transactions.sort(key=lambda x: (x["date"], x["timestamp"]), reverse=True)

        recent_transactions = transactions[:10]
        for tx in recent_transactions:
            tx.pop("timestamp", None)

        return Response(
            {
                "total_income": total_income,
                "total_expense": total_expense,
                "current_balance": current_balance,
                "total_budget": total_budget,
                "remaining_budget": remaining_budget,
                "recent_transactions": recent_transactions,
            },
            status=status.HTTP_200_OK,
        )


class ProtectedBudgetSummaryView(APIView):
    """
    GET /api/budgets/<uuid:pk>/summary/
    Returns budget summary statistics (budget_amount, total_expense, remaining_budget, overspent_amount)
    for a specific budget belonging to the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        budget = get_object_or_404(Budget, pk=pk, user=request.user)

        expense_aggregate = Expense.objects.filter(
            user=request.user,
            category=budget.category
        ).aggregate(total=Sum('amount'))['total']

        budget_amount = float(budget.budget_amount)
        total_expense = float(expense_aggregate) if expense_aggregate is not None else 0.0

        remaining_budget = budget_amount - total_expense

        if remaining_budget < 0:
            overspent_amount = total_expense - budget_amount
            remaining_budget = 0.0
        else:
            overspent_amount = 0.0

        return Response(
            {
                "category": budget.get_category_display(),
                "budget_amount": budget_amount,
                "total_expense": total_expense,
                "remaining_budget": remaining_budget,
                "overspent_amount": overspent_amount,
            },
            status=status.HTTP_200_OK,
        )


class BudgetCreateView(generics.CreateAPIView):
    """
    POST /api/budgets/create/ - Create a new budget record for the authenticated user.
    """
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetListView(generics.ListAPIView):
    """
    GET /api/budgets/ - List all budget records for the authenticated user.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


class BudgetRetrieveView(generics.RetrieveAPIView):
    """
    GET /api/budgets/<uuid:pk>/ - Retrieve details of a specific budget record.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)


class BudgetUpdateView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/budgets/<uuid:pk>/update/ - Update a specific budget record.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class BudgetDestroyView(generics.DestroyAPIView):
    """
    DELETE /api/budgets/<uuid:pk>/delete/ - Delete a specific budget record.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)
