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
    Returns budget summary statistics (budget_name, currency, budget_amount, amount_spent, remaining_amount, utilization_percentage, status)
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
        amount_spent = float(expense_aggregate) if expense_aggregate is not None else 0.0

        remaining_amount = budget_amount - amount_spent

        if remaining_amount < 0:
            overspent_amount = amount_spent - budget_amount
            remaining_amount = 0.0
        else:
            overspent_amount = 0.0

        if budget_amount > 0:
            utilization_percentage = round((amount_spent / budget_amount) * 100, 2)
        else:
            utilization_percentage = 0.0

        if utilization_percentage >= 100:
            budget_status = "Over Budget"
        elif utilization_percentage >= 80:
            budget_status = "Near Limit"
        else:
            budget_status = "On Track"

        return Response(
            {
                "id": str(budget.id),
                "budget_name": budget.budget_name if budget.budget_name else budget.get_category_display(),
                "category": budget.get_category_display(),
                "currency": budget.currency,
                "budget_amount": budget_amount,
                "amount_spent": amount_spent,
                "total_expense": amount_spent,
                "remaining_amount": remaining_amount,
                "remaining_budget": remaining_amount,
                "overspent_amount": overspent_amount,
                "utilization_percentage": utilization_percentage,
                "status": budget_status,
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


SORT_OPTIONS = {
    'start_date': ['start_date', '-created_at'],
    '-start_date': ['-start_date', '-created_at'],
    'end_date': ['end_date', '-created_at'],
    '-end_date': ['-end_date', '-created_at'],
    'budget_amount': ['budget_amount', '-created_at'],
    '-budget_amount': ['-budget_amount', '-created_at'],
    'highest': ['-budget_amount', '-created_at'],
    'lowest': ['budget_amount', '-created_at'],
    'latest': ['-start_date', '-created_at'],
    'oldest': ['start_date', 'created_at'],
}

def filter_and_sort_budgets(queryset, query_params):
    category = query_params.get('category', None)
    if category is not None and category.strip():
        category = category.strip().lower()
        valid_keys = [choice[0] for choice in Budget.CATEGORY_CHOICES]
        if category not in valid_keys:
            raise serializers.ValidationError(
                {"category": f"'{category}' is not a valid category. Valid choices are: {', '.join(valid_keys)}."}
            )
        queryset = queryset.filter(category=category)

    currency = query_params.get('currency', None)
    if currency is not None and currency.strip():
        currency = currency.strip().upper()
        valid_keys = [choice[0] for choice in Budget.CURRENCY_CHOICES]
        if currency not in valid_keys:
            raise serializers.ValidationError(
                {"currency": f"'{currency}' is not a valid currency. Valid choices are: {', '.join(valid_keys)}."}
            )
        queryset = queryset.filter(currency=currency)

    is_active = query_params.get('is_active', None)
    if is_active is not None and is_active.strip():
        val = is_active.strip().lower()
        if val in ['true', '1']:
            queryset = queryset.filter(is_active=True)
        elif val in ['false', '0']:
            queryset = queryset.filter(is_active=False)

    sort = query_params.get('sort', None)
    if sort is not None and sort.strip():
        sort_key = sort.strip()
        sort_key_lower = sort_key.lower()
        if sort_key_lower in SORT_OPTIONS:
            queryset = queryset.order_by(*SORT_OPTIONS[sort_key_lower])
        elif sort_key in ['start_date', '-start_date', 'end_date', '-end_date', 'budget_amount', '-budget_amount']:
            queryset = queryset.order_by(sort_key)
        else:
            raise serializers.ValidationError(
                {"sort": f"'{sort}' is not a valid sort option."}
            )

    return queryset


class BudgetListView(generics.ListAPIView):
    """
    GET /api/budgets/ - List all budget records for the authenticated user.
    """
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)
        return filter_and_sort_budgets(queryset, self.request.query_params)



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
