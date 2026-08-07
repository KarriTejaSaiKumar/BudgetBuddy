from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'preferred_currency', 'theme_preference', 'language', 'timezone', 'email_notifications')
    list_filter = ('theme_preference', 'preferred_currency', 'language', 'email_notifications')
    search_fields = ('user__username', 'user__email')
    raw_id_fields = ('user',)

