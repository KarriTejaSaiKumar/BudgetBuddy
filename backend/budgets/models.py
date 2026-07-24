import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Budget(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('shopping', 'Shopping'),
        ('education', 'Education'),
        ('entertainment', 'Entertainment'),
        ('healthcare', 'Healthcare'),
        ('bills', 'Bills'),
        ('miscellaneous', 'Miscellaneous'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="budgets")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='miscellaneous')
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    month = models.PositiveSmallIntegerField(default=1)
    year = models.PositiveIntegerField(default=2026)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Budget"
        verbose_name_plural = "Budgets"

    def __str__(self):
        return f"{self.get_category_display()} - {self.month}/{self.year}"
