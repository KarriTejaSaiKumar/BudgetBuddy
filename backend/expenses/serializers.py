import datetime
from django.utils import timezone
from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    expense_date = serializers.DateField(required=False, default=datetime.date.today)
    transaction_time = serializers.TimeField(required=False, default=lambda: timezone.now().time())

    class Meta:
        model = Expense
        fields = [
            'id',
            'user',
            'title',
            'amount',
            'currency',
            'category',
            'category_display',
            'payment_method',
            'payment_method_display',
            'transaction_time',
            'budget',
            'description',
            'expense_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if 'category' in data and isinstance(data['category'], str):
                data['category'] = data['category'].strip().lower()
            if 'currency' in data and isinstance(data['currency'], str):
                data['currency'] = data['currency'].strip().upper()
            if 'payment_method' in data and isinstance(data['payment_method'], str):
                data['payment_method'] = data['payment_method'].strip().lower().replace(' ', '_')
        return super().to_internal_value(data)

    def validate_category(self, value):
        valid_keys = [choice[0] for choice in Expense.CATEGORY_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid category. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

    def validate_currency(self, value):
        valid_keys = [choice[0] for choice in Expense.CURRENCY_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid currency. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

    def validate_payment_method(self, value):
        valid_keys = [choice[0] for choice in Expense.PAYMENT_METHOD_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid payment method. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_budget(self, value):
        if value is not None:
            request = self.context.get('request')
            if request and hasattr(request, 'user') and request.user.is_authenticated:
                if value.user != request.user:
                    raise serializers.ValidationError("You can only assign a budget that belongs to you.")
        return value



