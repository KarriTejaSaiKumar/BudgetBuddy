import uuid
from django.db import models
from django.contrib.auth.models import User

class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=10, choices=REPORT_TYPE_CHOICES, default='monthly')
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    data = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ['-generated_at']
        verbose_name = "Report"
        verbose_name_plural = "Reports"

    def __str__(self):
        return f"{self.user.username} - {self.get_report_type_display()} Report ({self.generated_at.strftime('%Y-%m-%d')})"
