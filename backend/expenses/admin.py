from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'amount', 'currency', 'category', 'payment_method', 'expense_date', 'transaction_time', 'budget')
    list_filter = ('currency', 'payment_method', 'category', 'expense_date')
    search_fields = ('title', 'description', 'user__username')
    raw_id_fields = ('user', 'budget')

