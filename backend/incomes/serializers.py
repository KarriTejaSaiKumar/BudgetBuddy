import datetime
from rest_framework import serializers
from .models import Income

class IncomeSerializer(serializers.ModelSerializer):
    source_display = serializers.CharField(source='get_source_display', read_only=True)
    date = serializers.DateField(required=False, default=datetime.date.today)

    class Meta:
        model = Income
        fields = [
            'id',
            'user',
            'source',
            'source_display',
            'amount',
            'description',
            'date',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict) and 'source' in data and isinstance(data['source'], str):
            data = data.copy()
            data['source'] = data['source'].strip().lower()
        return super().to_internal_value(data)

    def validate_source(self, value):
        valid_keys = [choice[0] for choice in Income.SOURCE_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid source. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
