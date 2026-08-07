import uuid
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    CURRENCY_CHOICES = [
        ('INR', 'Indian Rupee (₹)'),
        ('USD', 'US Dollar ($)'),
        ('EUR', 'Euro (€)'),
        ('GBP', 'British Pound (£)'),
        ('AED', 'UAE Dirham (AED)'),
        ('JPY', 'Japanese Yen (¥)'),
    ]

    THEME_CHOICES = [
        ('light', 'Light Mode'),
        ('dark', 'Dark Mode'),
        ('system', 'System Default'),
    ]

    LANGUAGE_CHOICES = [
        ('English', 'English'),
        ('Spanish', 'Spanish'),
        ('French', 'French'),
        ('German', 'German'),
        ('Hindi', 'Hindi'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='INR')
    preferred_currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default='INR')
    theme_preference = models.CharField(max_length=10, choices=THEME_CHOICES, default='system')
    email_notifications = models.BooleanField(default=True)
    budget_notifications = models.BooleanField(default=True)
    savings_notifications = models.BooleanField(default=True)
    report_notifications = models.BooleanField(default=True)
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES, default='English')
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"

    def save(self, *args, **kwargs):
        if self.currency and (not self.preferred_currency or self.preferred_currency == 'INR'):
            if self.currency != 'INR' and self.preferred_currency == 'INR':
                self.preferred_currency = self.currency
        if self.preferred_currency and not self.currency:
            self.currency = self.preferred_currency
        super().save(*args, **kwargs)


    def __str__(self):
        return f"{self.user.username}'s Profile"

