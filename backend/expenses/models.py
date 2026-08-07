import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('housing', 'Housing/Rent'),
        ('food', 'Food'),
        ('groceries', 'Groceries'),
        ('utilities', 'Utilities'),
        ('transport', 'Transport'),
        ('entertainment', 'Entertainment'),
        ('insurance', 'Insurance/Healthcare'),
        ('other', 'Other'),
    ]

    CURRENCY_CHOICES = [
        ('INR', 'Indian Rupee (INR)'),
        ('USD', 'US Dollar (USD)'),
        ('EUR', 'Euro (EUR)'),
        ('GBP', 'British Pound (GBP)'),
        ('JPY', 'Japanese Yen (JPY)'),
        ('CAD', 'Canadian Dollar (CAD)'),
        ('AUD', 'Australian Dollar (AUD)'),
        ('SGD', 'Singapore Dollar (SGD)'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('wallet', 'Wallet'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='INR')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='cash')
    description = models.TextField(max_length=500, blank=True, null=True)
    expense_date = models.DateField()
    transaction_time = models.TimeField(default=timezone.now)
    budget = models.ForeignKey('budgets.Budget', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date', '-created_at']
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"

    def __str__(self):
        return f"{self.user.username} - {self.title}: {self.amount} {self.currency}"

