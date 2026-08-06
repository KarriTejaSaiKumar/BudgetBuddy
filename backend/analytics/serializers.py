from rest_framework import serializers


class FinancialSummarySerializer(serializers.Serializer):
    """
    Serializer for key financial summary indicators.
    """
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_savings = serializers.DecimalField(max_digits=12, decimal_places=2)
    remaining_budget = serializers.DecimalField(max_digits=12, decimal_places=2)


class CategoryExpenseAnalysisSerializer(serializers.Serializer):
    """
    Serializer for category-wise expense aggregation.
    """
    category = serializers.CharField(max_length=100)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_count = serializers.IntegerField(min_value=0)
    percentage = serializers.FloatField(min_value=0.0, max_value=100.0)


class MonthlyExpenseTrendSerializer(serializers.Serializer):
    """
    Serializer for monthly spending trend data points.
    """
    month = serializers.CharField(max_length=20)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_count = serializers.IntegerField(min_value=0)


class ExpenseDetailSerializer(serializers.Serializer):
    """
    Serializer for individual expense items featured in extremes.
    """
    id = serializers.CharField(max_length=100, required=False, allow_null=True)
    title = serializers.CharField(max_length=255, required=False, allow_null=True)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    category = serializers.CharField(max_length=100, required=False, allow_null=True)
    date = serializers.CharField(max_length=50, required=False, allow_null=True)
    description = serializers.CharField(max_length=500, required=False, allow_null=True, allow_blank=True)


class ExpenseExtremesSerializer(serializers.Serializer):
    """
    Serializer for highest, lowest, latest, and oldest expense summaries.
    """
    highest_expense = ExpenseDetailSerializer(allow_null=True)
    lowest_expense = ExpenseDetailSerializer(allow_null=True)
    latest_expense = ExpenseDetailSerializer(allow_null=True)
    oldest_expense = ExpenseDetailSerializer(allow_null=True)


class RecentTransactionSerializer(serializers.Serializer):
    """
    Serializer for unified income and expense transaction feed.
    """
    transaction_type = serializers.CharField(max_length=20)
    title = serializers.CharField(max_length=255)
    category = serializers.CharField(max_length=100)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    date = serializers.CharField(max_length=50)


class SavingsGoalSerializer(serializers.Serializer):
    """
    Serializer for active savings goal progress data.
    """
    goal_name = serializers.CharField(max_length=255)
    target_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    saved_amount = serializers.DecimalField(max_digits=12, decimal_places=2, source='current_amount')
    remaining_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    progress_percentage = serializers.FloatField(min_value=0.0)
    deadline = serializers.DateField()
    is_completed = serializers.BooleanField()


class AnalyticsDashboardSerializer(serializers.Serializer):
    """
    Composite serializer aggregating all analytics modules into a single API response payload.
    """
    financial_summary = FinancialSummarySerializer()
    category_analysis = CategoryExpenseAnalysisSerializer(many=True)
    monthly_trends = MonthlyExpenseTrendSerializer(many=True)
    expense_extremes = ExpenseExtremesSerializer()
    recent_transactions = RecentTransactionSerializer(many=True)
    active_savings_goals = SavingsGoalSerializer(many=True)


class DateFilterSerializer(serializers.Serializer):
    """
    Serializer for validating query parameter filters.
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

        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({
                "start_date": "start_date must be less than or equal to end_date."
            })

        return attrs
