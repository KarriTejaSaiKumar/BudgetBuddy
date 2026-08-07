from rest_framework import serializers


class MonthlyFinancialReportSerializer(serializers.Serializer):
    """
    Serializer for Monthly Financial Report summary numbers.
    """
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_savings = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_budget = serializers.DecimalField(max_digits=12, decimal_places=2)


class ExpenseReportItemSerializer(serializers.Serializer):
    """
    Serializer for itemized expense report records.
    """
    title = serializers.CharField(max_length=255)
    category = serializers.CharField(max_length=100)
    category_display = serializers.CharField(max_length=100, required=False)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=10, default='INR', required=False)
    payment_method = serializers.CharField(max_length=50, default='cash', required=False)
    date = serializers.CharField(max_length=50)
    time = serializers.CharField(max_length=50, required=False, default='00:00:00')
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True)


class ExpenseReportSerializer(serializers.Serializer):
    """
    Serializer for full expense report response.
    """
    period = serializers.DictField(required=False)
    summary = serializers.DictField()
    categories = serializers.ListField()
    expenses = ExpenseReportItemSerializer(many=True)


class IncomeReportItemSerializer(serializers.Serializer):
    """
    Serializer for itemized income report records.
    """
    source = serializers.CharField(max_length=100)
    source_display = serializers.CharField(max_length=100, required=False)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=10, default='INR', required=False)
    date = serializers.CharField(max_length=50)
    time = serializers.CharField(max_length=50, required=False, default='00:00:00')
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True)


class IncomeReportSerializer(serializers.Serializer):
    """
    Serializer for full income report response.
    """
    period = serializers.DictField(required=False)
    summary = serializers.DictField()
    incomes = IncomeReportItemSerializer(many=True)


class SavingsReportItemSerializer(serializers.Serializer):
    """
    Serializer for individual savings report goal records.
    """
    goal_name = serializers.CharField(max_length=255)
    target_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    saved_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    progress_percentage = serializers.FloatField(min_value=0.0)
    deadline = serializers.CharField(max_length=50)
    status = serializers.CharField(max_length=50)


class SavingsReportSerializer(serializers.Serializer):
    """
    Serializer for full savings report response.
    """
    summary = serializers.DictField()
    savings_goals = SavingsReportItemSerializer(many=True)


class FinancialSummaryReportSerializer(serializers.Serializer):
    """
    Serializer combining overall financial performance, expense, income, budget, savings, and notification summaries.
    """
    financial_summary = MonthlyFinancialReportSerializer()
    expense_summary = serializers.DictField()
    income_summary = serializers.DictField()
    budget_summary = serializers.DictField()
    savings_summary = serializers.DictField()
    latest_notifications = serializers.ListField()


class DateFilterSerializer(serializers.Serializer):
    """
    Serializer for validating report filter parameters.
    """
    TIMEFRAME_CHOICES = [
        ('current_month', 'Current Month'),
        ('previous_month', 'Previous Month'),
        ('current_year', 'Current Year'),
        ('custom', 'Custom Range'),
    ]

    start_date = serializers.DateField(required=False, allow_null=True, default=None)
    end_date = serializers.DateField(required=False, allow_null=True, default=None)
    timeframe = serializers.ChoiceField(
        choices=TIMEFRAME_CHOICES,
        default='current_month',
        required=False
    )

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        timeframe = attrs.get('timeframe', 'current_month')

        if timeframe == 'custom':
            if not start_date or not end_date:
                raise serializers.ValidationError({
                    "non_field_errors": "Custom timeframe requires both start_date and end_date parameters."
                })

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                "start_date": "start_date must be less than or equal to end_date."
            })

        return attrs

