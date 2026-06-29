"""Serializers for subscriptions app."""

from rest_framework import serializers
from .models import Bundle, Plan, Cart, CartItem, UserSubscription, PaymentTransaction


class BundleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the bundle card grid."""
    included_libraries = serializers.ListField(read_only=True)

    class Meta:
        model = Bundle
        fields = [
            'id', 'title', 'slug', 'thumbnail', 'short_description',
            'price', 'currency', 'duration_days',
            'includes_reading', 'includes_video', 'includes_mock_exam',
            'included_libraries', 'is_featured', 'order',
        ]


class BundleDetailSerializer(serializers.ModelSerializer):
    """Full serializer showing complete description for the detail modal."""
    included_libraries = serializers.ListField(read_only=True)

    class Meta:
        model = Bundle
        fields = [
            'id', 'title', 'slug', 'thumbnail', 'short_description', 'description',
            'price', 'currency', 'duration_days',
            'includes_reading', 'includes_video', 'includes_mock_exam',
            'included_libraries', 'is_featured', 'order',
        ]


class CartItemSerializer(serializers.ModelSerializer):
    bundle = BundleListSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'bundle', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'updated_at']


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = ['id', 'name', 'plan_type', 'plan_category', 'description', 'price', 'currency', 'duration_days']


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    bundle = BundleListSerializer(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserSubscription
        fields = [
            'id', 'plan', 'bundle', 'library_access',
            'status', 'started_at', 'expires_at', 'is_active'
        ]


class PaymentTransactionSerializer(serializers.ModelSerializer):
    bundle = BundleListSerializer(read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'bundle', 'amount', 'tax_amount', 'total_amount',
            'gateway', 'status', 'transaction_id', 'created_at'
        ]
