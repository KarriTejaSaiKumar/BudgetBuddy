import datetime
from rest_framework import serializers
from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    remaining_amount = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            'id',
            'user',
            'goal_name',
            'target_amount',
            'current_amount',
            'deadline',
            'notes',
            'is_completed',
            'remaining_amount',
            'progress_percentage',
            'days_remaining',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'is_completed', 'created_at', 'updated_at']

    def get_remaining_amount(self, obj):
        target = float(obj.target_amount)
        current = float(obj.current_amount)
        rem = target - current
        return rem if rem > 0 else 0.0

    def get_progress_percentage(self, obj):
        target = float(obj.target_amount)
        if target <= 0:
            return 0.0
        current = float(obj.current_amount)
        pct = round((current / target) * 100, 2)
        return pct if pct <= 100.0 else 100.0

    def get_days_remaining(self, obj):
        if not obj.deadline:
            return 0
        today = datetime.date.today()
        return (obj.deadline - today).days

    def get_status(self, obj):
        target = float(obj.target_amount)
        current = float(obj.current_amount)
        if obj.is_completed or current >= target:
            return "Completed"
        today = datetime.date.today()
        if obj.deadline and obj.deadline < today:
            return "Overdue"
        if current <= 0:
            return "Not Started"
        return "In Progress"

    def to_internal_value(self, data):
        if isinstance(data, dict) and 'goal_name' in data and isinstance(data['goal_name'], str):
            data = data.copy()
            data['goal_name'] = data['goal_name'].strip()
        return super().to_internal_value(data)

    def validate_goal_name(self, value):
        if not value:
            raise serializers.ValidationError("Goal name cannot be empty.")
        return value

    def validate_target_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target amount must be greater than zero.")
        return value

    def validate_current_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Current amount cannot be negative.")
        return value

    def validate_deadline(self, value):
        if not self.instance and value < datetime.date.today():
            raise serializers.ValidationError("Deadline cannot be in the past.")
        return value

    def validate(self, attrs):
        target = attrs.get('target_amount', getattr(self.instance, 'target_amount', None))
        current = attrs.get('current_amount', getattr(self.instance, 'current_amount', None))
        allow_over = self.context.get('allow_over_target', False)
        if target is not None and current is not None and current > target and not allow_over:
            raise serializers.ValidationError({"current_amount": "Current amount cannot exceed target amount."})
        return attrs

