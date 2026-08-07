from django.db.models import Sum
from rest_framework import serializers
from .models import Budget
from expenses.models import Expense

class BudgetSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    amount_spent = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    utilization_percentage = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = [
            'id',
            'user',
            'budget_name',
            'category',
            'category_display',
            'budget_amount',
            'currency',
            'notes',
            'start_date',
            'end_date',
            'is_active',
            'month',
            'year',
            'amount_spent',
            'remaining_amount',
            'utilization_percentage',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'month', 'year']

    def get_amount_spent(self, obj):
        expense_aggregate = Expense.objects.filter(
            user=obj.user,
            category=obj.category
        ).aggregate(total=Sum('amount'))['total']
        return float(expense_aggregate) if expense_aggregate is not None else 0.0

    def get_remaining_amount(self, obj):
        spent = self.get_amount_spent(obj)
        rem = float(obj.budget_amount) - spent
        return rem if rem > 0 else 0.0

    def get_utilization_percentage(self, obj):
        budget_amt = float(obj.budget_amount)
        if budget_amt <= 0:
            return 0.0
        spent = self.get_amount_spent(obj)
        return round((spent / budget_amt) * 100, 2)

    def get_status(self, obj):
        pct = self.get_utilization_percentage(obj)
        if pct >= 100:
            return "Over Budget"
        elif pct >= 80:
            return "Near Limit"
        return "On Track"


    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if 'category' in data and isinstance(data['category'], str):
                data['category'] = data['category'].strip().lower()
            if 'currency' in data and isinstance(data['currency'], str):
                data['currency'] = data['currency'].strip().upper()
        return super().to_internal_value(data)

    def validate_category(self, value):
        valid_keys = [choice[0] for choice in Budget.CATEGORY_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid category. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

    def validate_currency(self, value):
        valid_keys = [choice[0] for choice in Budget.CURRENCY_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid currency. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

    def validate_budget_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget amount must be greater than zero.")
        return value

    def validate_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError("Month must be between 1 and 12.")
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(self.instance, 'user', None)
        if not user and request and hasattr(request, 'user'):
            user = request.user

        start_date = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end_date = attrs.get('end_date', getattr(self.instance, 'end_date', None))

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be earlier than start date."})

        if start_date:
            attrs['month'] = start_date.month
            attrs['year'] = start_date.year

        category = attrs.get('category', getattr(self.instance, 'category', None))
        month = attrs.get('month', getattr(self.instance, 'month', None))
        year = attrs.get('year', getattr(self.instance, 'year', None))

        if user and getattr(user, 'is_authenticated', False) and category and month and year:
            queryset = Budget.objects.filter(
                user=user,
                category=category,
                month=month,
                year=year
            )
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError({
                    "error": "Budget already exists for this category, month, and year."
                })

        return attrs

