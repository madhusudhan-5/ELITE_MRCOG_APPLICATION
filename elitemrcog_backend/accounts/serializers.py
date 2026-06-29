"""
DRF serializers for accounts app.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, OTPVerification


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'first_name', 'last_name', 'name', 'country', 'exam_batch', 'avatar', 'is_verified', 'date_joined', 'role']
        read_only_fields = ['id', 'is_verified', 'date_joined', 'role']

    def get_role(self, obj):
        if hasattr(obj, 'is_superuser') and obj.is_superuser:
            return 'superadmin'
        if hasattr(obj, 'is_staff') and obj.is_staff:
            return 'admin'
        return 'student'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label='Confirm Password')
    otp = serializers.CharField(write_only=True, max_length=6, required=True)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'phone', 'password', 'password2', 'otp']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data.pop('otp', None)
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')
        data['user'] = user
        return data


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=OTPVerification.Purpose.choices)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    purpose = serializers.ChoiceField(choices=OTPVerification.Purpose.choices)


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(help_text="Google ID token from frontend OAuth flow")
