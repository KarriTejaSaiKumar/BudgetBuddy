import uuid
from django.db import models
from django.contrib.auth.models import User

class Income(models.Model):
    SOURCE_CHOICES = [
        ('salary', 'Salary'),
        ('freelance', 'Freelance/Side Hustle'),
        ('investments', 'Investments'),
        ('gifts', 'Gifts'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='other')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.TextField(max_length=500, blank=True, null=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = "Income"
        verbose_name_plural = "Incomes"

    def __str__(self):
        return f"{self.user.username} - {self.get_source_display()}: {self.amount}"
