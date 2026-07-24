from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Income
from expenses.models import Expense
from .serializers import IncomeSerializer

class ProtectedIncomeSummaryView(APIView):
    """
    GET /api/incomes/summary/
    Returns the total_income, total_expense, and current_balance for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        income_aggregate = Income.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total']
        expense_aggregate = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total']

        total_income = float(income_aggregate) if income_aggregate is not None else 0.0
        total_expense = float(expense_aggregate) if expense_aggregate is not None else 0.0
        current_balance = total_income - total_expense

        return Response(
            {
                "total_income": total_income,
                "total_expense": total_expense,
                "current_balance": current_balance,
            },
            status=status.HTTP_200_OK,
        )


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an income record to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IncomeCreateView(generics.CreateAPIView):
    """
    POST /api/incomes/create/ - Create a new income record for the authenticated user.
    """
    queryset = Income.objects.all()
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IncomeListView(generics.ListAPIView):
    """
    GET /api/incomes/ - List all income records for the authenticated user.
    """
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)


class IncomeRetrieveView(generics.RetrieveAPIView):
    """
    GET /api/incomes/<uuid:pk>/ - Retrieve details of a specific income record.
    """
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)


class IncomeUpdateView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/incomes/<uuid:pk>/update/ - Update a specific income record.
    """
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


class IncomeDestroyView(generics.DestroyAPIView):
    """
    DELETE /api/incomes/<uuid:pk>/delete/ - Delete a specific income record.
    """
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)
