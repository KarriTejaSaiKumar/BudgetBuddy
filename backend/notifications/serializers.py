from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'message',
            'is_read',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict) and 'message' in data and isinstance(data['message'], str):
            data = data.copy()
            data['message'] = data['message'].strip()
        return super().to_internal_value(data)

    def validate_message(self, value):
        if not value:
            raise serializers.ValidationError("Notification message cannot be empty.")
        return value
