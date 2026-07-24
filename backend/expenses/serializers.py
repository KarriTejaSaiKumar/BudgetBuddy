import datetime
from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    expense_date = serializers.DateField(required=False, default=datetime.date.today)


    class Meta:
        model = Expense
        fields = [
            'id',
            'user',
            'title',
            'amount',
            'category',
            'category_display',
            'description',
            'expense_date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict) and 'category' in data and isinstance(data['category'], str):
            data = data.copy()
            data['category'] = data['category'].strip().lower()
        return super().to_internal_value(data)

    def validate_category(self, value):
        valid_keys = [choice[0] for choice in Expense.CATEGORY_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid category. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


