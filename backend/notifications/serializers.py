from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'user',
            'title',
            'message',
            'notification_type',
            'notification_type_display',
            'priority',
            'priority_display',
            'is_read',
            'email_sent',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if 'message' in data and isinstance(data['message'], str):
                data['message'] = data['message'].strip()
            if 'title' in data and isinstance(data['title'], str):
                data['title'] = data['title'].strip()
            if 'notification_type' in data and isinstance(data['notification_type'], str):
                data['notification_type'] = data['notification_type'].strip().lower()
            if 'priority' in data and isinstance(data['priority'], str):
                data['priority'] = data['priority'].strip().lower()
        return super().to_internal_value(data)

    def validate_message(self, value):
        if not value:
            raise serializers.ValidationError("Notification message cannot be empty.")
        return value

    def validate_notification_type(self, value):
        valid_keys = [choice[0] for choice in Notification.NOTIFICATION_TYPE_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid notification type. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

    def validate_priority(self, value):
        valid_keys = [choice[0] for choice in Notification.PRIORITY_CHOICES]
        if value not in valid_keys:
            raise serializers.ValidationError(
                f"'{value}' is not a valid priority level. Valid choices are: {', '.join(valid_keys)}."
            )
        return value

