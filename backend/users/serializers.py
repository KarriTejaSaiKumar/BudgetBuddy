from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'phone', 'profile_picture', 'bio', 'currency', 'created_at', 'updated_at')

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
            defaults={'phone': phone, 'currency': currency, 'bio': bio}
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
