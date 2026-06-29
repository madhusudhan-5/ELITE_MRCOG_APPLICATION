"""URL routing for subscriptions app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Admin router — all require is_staff
admin_router = DefaultRouter()
admin_router.register(r'manage/bundles', views.AdminBundleViewSet, basename='admin-bundles')
admin_router.register(r'manage/subscriptions', views.AdminSubscriptionViewSet, basename='admin-subscriptions')
admin_router.register(r'manage/payments', views.AdminPaymentViewSet, basename='admin-payments')

urlpatterns = [
    # ── Bundles ──────────────────────────────────────────────
    path('bundles/', views.BundleListView.as_view(), name='bundle-list'),
    path('bundles/<int:pk>/', views.BundleDetailView.as_view(), name='bundle-detail'),

    # ── Cart ─────────────────────────────────────────────────
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/count/', views.CartCountView.as_view(), name='cart-count'),
    path('cart/add/', views.AddToCartView.as_view(), name='cart-add'),
    path('cart/remove/<int:item_id>/', views.RemoveFromCartView.as_view(), name='cart-remove'),
    path('cart/clear/', views.ClearCartView.as_view(), name='cart-clear'),

    # ── Checkout ─────────────────────────────────────────────
    path('checkout/initiate/', views.CheckoutInitiateView.as_view(), name='checkout-initiate'),
    path('checkout/stripe/confirm/', views.ConfirmStripePaymentView.as_view(), name='stripe-confirm'),
    path('checkout/pakistan/confirm/', views.ConfirmPakistanPaymentView.as_view(), name='pakistan-confirm'),

    # ── Stripe Webhook ────────────────────────────────────────
    path('webhooks/stripe/', views.StripeWebhookView.as_view(), name='stripe-webhook'),

    # ── My Subscriptions ──────────────────────────────────────
    path('my/', views.MySubscriptionsView.as_view(), name='my-subscriptions'),
    path('my-subscriptions/', views.MySubscriptionsView.as_view(), name='my-subscriptions-alt'),

    # ── Coupons ───────────────────────────────────────────────
    path('coupon/apply/', views.ApplyCouponView.as_view(), name='apply-coupon'),

    # ── Legacy ────────────────────────────────────────────────
    path('plans/', views.PlanListView.as_view(), name='plan-list'),
    path('subscribe/', views.SubscribeView.as_view(), name='subscribe'),

    # ── Admin Management ──────────────────────────────────────
    path('', include(admin_router.urls)),
]
