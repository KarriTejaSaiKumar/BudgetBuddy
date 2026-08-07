import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

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

    CURRENCY_CHOICES = [
        ('INR', 'Indian Rupee (INR)'),
        ('USD', 'US Dollar (USD)'),
        ('EUR', 'Euro (EUR)'),
        ('GBP', 'British Pound (GBP)'),
        ('AED', 'UAE Dirham (AED)'),
        ('JPY', 'Japanese Yen (JPY)'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="budgets")
    budget_name = models.CharField(max_length=150, blank=True, default='')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='miscellaneous')
    budget_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='INR')
    notes = models.TextField(blank=True, default='')
    start_date = models.DateField(default=timezone.now)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    month = models.PositiveSmallIntegerField(default=1)
    year = models.PositiveIntegerField(default=2026)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Budget"
        verbose_name_plural = "Budgets"

    def save(self, *args, **kwargs):
        if self.start_date:
            if isinstance(self.start_date, str):
                try:
                    parsed_date = timezone.datetime.strptime(self.start_date, '%Y-%m-%d').date()
                    self.month = parsed_date.month
                    self.year = parsed_date.year
                except (ValueError, TypeError):
                    pass
            elif hasattr(self.start_date, 'month'):
                self.month = self.start_date.month
                self.year = self.start_date.year
        if not self.budget_name:
            self.budget_name = f"{self.get_category_display()} Budget"
        super().save(*args, **kwargs)


    def __str__(self):
        name = self.budget_name if self.budget_name else self.get_category_display()
        return f"{name} - {self.budget_amount} {self.currency}"

