from django.contrib import admin
from .models import Budget

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('budget_name', 'category', 'budget_amount', 'currency', 'start_date', 'end_date', 'is_active', 'user')
    list_filter = ('category', 'currency', 'is_active')
    search_fields = ('budget_name', 'notes', 'user__username')
    raw_id_fields = ('user',)

