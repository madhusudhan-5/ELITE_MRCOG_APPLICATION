"""Admin configuration for subscriptions app."""

from django.contrib import admin
from .models import Plan, UserSubscription, Coupon, PaymentTransaction


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'price', 'currency', 'duration_days', 'is_active']
    list_filter = ['plan_type', 'is_active']
    search_fields = ['name']


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'status', 'started_at', 'expires_at', 'is_active']
    list_filter = ['status', 'plan']
    search_fields = ['user__email', 'user__name', 'payment_reference']
    readonly_fields = ['created_at']

    def is_active(self, obj):
        return obj.is_active
    is_active.boolean = True
    is_active.short_description = 'Active?'


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_percentage', 'valid_from', 'valid_until', 'is_active']
    list_filter = ['is_active']
    search_fields = ['code']


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'user', 'plan', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['transaction_id', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
