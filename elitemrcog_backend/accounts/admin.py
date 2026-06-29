"""Admin configuration for accounts app."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTPVerification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['email']
    list_display = ['email', 'first_name', 'last_name', 'phone', 'is_verified', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_verified', 'is_active', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name', 'name', 'phone']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'name', 'phone', 'country', 'exam_batch', 'avatar', 'google_id')}),
        ('Permissions', {'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('date_joined', 'last_login')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'phone', 'password1', 'password2', 'is_verified'),
        }),
    )
    readonly_fields = ['date_joined', 'last_login']


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['email', 'purpose', 'otp', 'is_used', 'created_at', 'expires_at']
    list_filter = ['purpose', 'is_used']
    search_fields = ['email']
    readonly_fields = ['otp', 'created_at', 'expires_at']
    ordering = ['-created_at']
