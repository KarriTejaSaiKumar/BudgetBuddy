import uuid
from django.db import models
from django.contrib.auth.models import User

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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(max_length=500, blank=True, null=True)
    expense_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date', '-created_at']
        verbose_name = "Expense"
        verbose_name_plural = "Expenses"

    def __str__(self):
        return f"{self.user.username} - {self.title}: {self.amount}"
