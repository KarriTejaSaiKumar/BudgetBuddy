from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            'id', 'phone', 'profile_picture', 'bio', 'currency', 'preferred_currency',
            'theme_preference', 'email_notifications', 'budget_notifications',
            'savings_notifications', 'report_notifications', 'language', 'timezone',
            'created_at', 'updated_at'
        )

class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            'preferred_currency',
            'theme_preference',
            'email_notifications',
            'budget_notifications',
            'savings_notifications',
            'report_notifications',
            'language',
            'timezone',
        )

    def validate_preferred_currency(self, value):
        if value:
            value = value.strip().upper()
            valid_currencies = [choice[0] for choice in Profile.CURRENCY_CHOICES]
            if value not in valid_currencies:
                raise serializers.ValidationError(f"'{value}' is not a valid currency. Allowed choices: {', '.join(valid_currencies)}.")
        return value

    def validate_theme_preference(self, value):
        if value:
            value = value.strip().lower()
            valid_themes = [choice[0] for choice in Profile.THEME_CHOICES]
            if value not in valid_themes:
                raise serializers.ValidationError(f"'{value}' is not a valid theme preference. Allowed choices: {', '.join(valid_themes)}.")
        return value

    def validate_language(self, value):
        if value:
            value = value.strip()
            valid_languages = [choice[0] for choice in Profile.LANGUAGE_CHOICES]
            if value not in valid_languages:
                raise serializers.ValidationError(f"'{value}' is not a valid language preference. Allowed choices: {', '.join(valid_languages)}.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    phone = serializers.CharField(required=False, write_only=True, allow_blank=True)
    currency = serializers.CharField(required=False, write_only=True, default='USD')
    bio = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'phone', 'currency', 'bio')
        extra_kwargs = {
            'email': {'required': True, 'allow_blank': False}
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        currency = validated_data.pop('currency', 'USD')
        bio = validated_data.pop('bio', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        Profile.objects.update_or_create(
            user=user,
            defaults={'phone': phone, 'currency': currency, 'preferred_currency': currency, 'bio': bio}
        )

        return user

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        if username_or_email and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                attrs[self.username_field] = user_obj.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
