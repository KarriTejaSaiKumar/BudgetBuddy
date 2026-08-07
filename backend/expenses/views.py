from django.db import transaction
from django.db.models import Sum, Count
from rest_framework import generics, permissions, serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from notifications.services import create_notification
from .models import Expense
from .serializers import ExpenseSerializer

def notify_expense_event(user, title, message, priority):
    create_notification(
        user=user,
        title=title,
        message=message,
        notification_type="expense",
        priority=priority
    )

def dispatch_expense_created_notification(user, expense):
    notify_expense_event(
        user=user,
        title="Expense Added",
        message=f'Your expense "{expense.title}" of {expense.currency} {expense.amount} has been recorded successfully.',
        priority="success"
    )

def dispatch_expense_updated_notification(user, expense):
    notify_expense_event(
        user=user,
        title="Expense Updated",
        message=f'Your expense "{expense.title}" of {expense.currency} {expense.amount} has been updated.',
        priority="info"
    )

def dispatch_expense_deleted_notification(user, title, currency, amount):
    notify_expense_event(
        user=user,
        title="Expense Deleted",
        message=f'Your expense "{title}" of {currency} {amount} has been deleted.',
        priority="warning"
    )


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an expense to view or edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class ProtectedExpenseSummaryView(APIView):
    """
    GET /api/expenses/summary/
    Returns the total expense amount of the logged-in user using Django ORM aggregate.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_amount = Expense.objects.filter(user=request.user).aggregate(total=Sum('amount'))['total']
        total_expense = float(total_amount) if total_amount is not None else 0
        return Response({"total_expense": total_expense}, status=status.HTTP_200_OK)


SORT_OPTIONS = {
    'latest': ['-expense_date', '-created_at'],
    'oldest': ['expense_date', 'created_at'],
    'highest': ['-amount', '-expense_date', '-created_at'],
    'lowest': ['amount', '-expense_date', '-created_at'],
}

def filter_and_sort_expenses(queryset, query_params):
    category = query_params.get('category', None)
    if category is not None and category.strip():
        category = category.strip().lower()
        valid_keys = [choice[0] for choice in Expense.CATEGORY_CHOICES]
        if category not in valid_keys:
            raise serializers.ValidationError(
                {"category": f"'{category}' is not a valid category. Valid choices are: {', '.join(valid_keys)}."}
            )
        queryset = queryset.filter(category=category)

    currency = query_params.get('currency', None)
    if currency is not None and currency.strip():
        currency = currency.strip().upper()
        valid_keys = [choice[0] for choice in Expense.CURRENCY_CHOICES]
        if currency not in valid_keys:
            raise serializers.ValidationError(
                {"currency": f"'{currency}' is not a valid currency. Valid choices are: {', '.join(valid_keys)}."}
            )
        queryset = queryset.filter(currency=currency)

    payment_method = query_params.get('payment_method', None)
    if payment_method is not None and payment_method.strip():
        payment_method = payment_method.strip().lower().replace(' ', '_')
        valid_keys = [choice[0] for choice in Expense.PAYMENT_METHOD_CHOICES]
        if payment_method not in valid_keys:
            raise serializers.ValidationError(
                {"payment_method": f"'{payment_method}' is not a valid payment method. Valid choices are: {', '.join(valid_keys)}."}
            )
        queryset = queryset.filter(payment_method=payment_method)

    sort = query_params.get('sort', None)
    if sort is not None and sort.strip():
        sort_key = sort.strip().lower()
        if sort_key not in SORT_OPTIONS:
            valid_sort_keys = ", ".join(SORT_OPTIONS.keys())
            raise serializers.ValidationError(
                {"sort": f"'{sort}' is not a valid sort option. Valid choices are: {valid_sort_keys}."}
            )
        queryset = queryset.order_by(*SORT_OPTIONS[sort_key])

    return queryset

class ExpenseListCreateView(generics.ListCreateAPIView):
    """
    GET /api/expenses/ - List expenses for authenticated user (supports ?category=food & ?sort=latest)
    POST /api/expenses/ - Create a new expense for authenticated user
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user).select_related('budget', 'user')
        return filter_and_sort_expenses(queryset, self.request.query_params)

    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        dispatch_expense_created_notification(self.request.user, expense)

class ExpenseCreateView(generics.CreateAPIView):
    """
    POST /api/expenses/create/ - Create a new expense (Dedicated route)
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        expense = serializer.save(user=self.request.user)
        dispatch_expense_created_notification(self.request.user, expense)

class ExpenseListView(generics.ListAPIView):
    """
    GET /api/expenses/ - Dedicated list view (supports ?category=food & ?sort=latest)
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.filter(user=self.request.user).select_related('budget', 'user')
        return filter_and_sort_expenses(queryset, self.request.query_params)


class ExpenseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/expenses/<uuid:pk>/ - Detail view
    PUT/PATCH /api/expenses/<uuid:pk>/ - Update view
    DELETE /api/expenses/<uuid:pk>/ - Delete view
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).select_related('budget', 'user')


    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        expense = serializer.save()
        dispatch_expense_updated_notification(self.request.user, expense)

    def perform_destroy(self, instance):
        user = instance.user
        title = instance.title
        currency = instance.currency
        amount = instance.amount
        instance.delete()
        dispatch_expense_deleted_notification(user, title, currency, amount)

class ExpenseRetrieveView(generics.RetrieveAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

class ExpenseUpdateView(generics.UpdateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        expense = serializer.save()
        dispatch_expense_updated_notification(self.request.user, expense)

class ExpenseDestroyView(generics.DestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        user = instance.user
        title = instance.title
        currency = instance.currency
        amount = instance.amount
        instance.delete()
        dispatch_expense_deleted_notification(user, title, currency, amount)



