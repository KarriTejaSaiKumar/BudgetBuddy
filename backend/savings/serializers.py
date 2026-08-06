import datetime
from rest_framework import serializers
from .models import SavingsGoal

class SavingsGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsGoal
        fields = [
            'id',
            'user',
            'goal_name',
            'target_amount',
            'current_amount',
            'deadline',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

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
        if value < datetime.date.today():
            raise serializers.ValidationError("Deadline must be today or in the future.")
        return value
