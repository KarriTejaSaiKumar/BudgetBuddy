from django.contrib import admin
from .models import SavingsGoal

@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = ('goal_name', 'user', 'target_amount', 'current_amount', 'deadline', 'is_completed')
    list_filter = ('is_completed', 'deadline')
    search_fields = ('goal_name', 'notes', 'user__username')
    raw_id_fields = ('user',)

