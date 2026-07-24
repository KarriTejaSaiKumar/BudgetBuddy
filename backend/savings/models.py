import uuid
from django.db import models
from django.contrib.auth.models import User

class SavingsGoal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    goal_name = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['deadline']
        verbose_name = "Savings Goal"
        verbose_name_plural = "Savings Goals"

    def __str__(self):
        return f"{self.user.username} - {self.goal_name}: {self.current_amount}/{self.target_amount}"
