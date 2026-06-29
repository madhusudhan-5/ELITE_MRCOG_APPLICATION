"""
Custom User model for Elite MRCOG.
Supports login via email/phone + password, OTP, or Google OAuth.
"""

import random
import string
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from datetime import timedelta


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    name = models.CharField(max_length=255, blank=True)  # Legacy or full name fallback

    country = models.CharField(max_length=100, blank=True)
    exam_batch = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip() or self.name or self.email

    def save(self, *args, **kwargs):
        if self.first_name or self.last_name:
            self.name = f"{self.first_name} {self.last_name}".strip()
        if not self.phone:
            self.phone = None
        super().save(*args, **kwargs)


def generate_otp():
    # Hardcoded OTP for development/testing ease
    return '123456'


class OTPVerification(models.Model):
    class Purpose(models.TextChoices):
        EMAIL_VERIFY = 'email_verify', 'Email Verification'
        LOGIN = 'login', 'Login OTP'
        PASSWORD_RESET = 'password_reset', 'Password Reset'
        REGISTER_VERIFY = 'register_verify', 'Registration Verification'

    email = models.EmailField()
    otp = models.CharField(max_length=6, default=generate_otp)
    purpose = models.CharField(max_length=20, choices=Purpose.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'OTP Verification'
        verbose_name_plural = 'OTP Verifications'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    def __str__(self):
        return f"OTP for {self.email} [{self.purpose}]"
