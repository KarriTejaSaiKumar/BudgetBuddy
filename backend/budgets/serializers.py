from rest_framework import serializers
from .models import Budget

class BudgetSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id',
            'user',
            'category',
            'category_display',
            'budget_amount',
            'month',
            'year',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict) and 'category' in data and isinstance(data['category'], str):
            data = data.copy()
            data['category'] = data['category'].strip().lower()
        return super().to_internal_value(data)

    def validate_category(self, value):
        valid_keys = [choice[0] for choice in Budget.CATEGORY_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid category. Valid choices are: {', '.join(valid_keys)}."
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
