from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'priority', 'is_read', 'email_sent', 'created_at')
    list_filter = ('notification_type', 'priority', 'is_read', 'email_sent', 'created_at')
    search_fields = ('title', 'message', 'user__username')
    raw_id_fields = ('user',)

