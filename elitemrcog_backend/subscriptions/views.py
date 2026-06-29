"""
Views for subscriptions app.
Handles: Bundle listing, Cart management, Checkout (Stripe / Pakistan),
Webhook confirmation, and My Subscriptions.
"""

import stripe
import json
import logging
from decimal import Decimal
from datetime import timedelta

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bundle, Plan, Cart, CartItem, UserSubscription, Coupon, PaymentTransaction
from .serializers import (
    BundleListSerializer, BundleDetailSerializer,
    CartSerializer, CartItemSerializer,
    PlanSerializer, UserSubscriptionSerializer,
    PaymentTransactionSerializer,
)

logger = logging.getLogger(__name__)

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

TAX_RATE = Decimal('0.00')   # Set to Decimal('0.05') to enable 5% tax


# ─── Helper ───────────────────────────────────────────────────────────────────

def _activate_bundle_subscription(user, bundle, payment_reference='', gateway='stripe'):
    """
    Create one UserSubscription row per library included in the bundle.
    Called after payment is confirmed.
    """
    created_subs = []
    library_map = {
        'reading': bundle.includes_reading,
        'video': bundle.includes_video,
        'mock_exam': bundle.includes_mock_exam,
    }
    for library, included in library_map.items():
        if included:
            sub = UserSubscription.objects.create(
                user=user,
                bundle=bundle,
                library_access=library,
                status=UserSubscription.Status.ACTIVE,
                payment_reference=payment_reference,
            )
            created_subs.append(sub)
    return created_subs


# ─── Bundles ──────────────────────────────────────────────────────────────────

class BundleListView(generics.ListAPIView):
    """List all active bundles for the subscription page."""
    queryset = Bundle.objects.filter(is_active=True)
    serializer_class = BundleListSerializer
    permission_classes = [AllowAny]


class BundleDetailView(generics.RetrieveAPIView):
    """Bundle detail — full description for modal."""
    queryset = Bundle.objects.filter(is_active=True)
    serializer_class = BundleDetailSerializer
    permission_classes = [AllowAny]


# ─── Cart ─────────────────────────────────────────────────────────────────────

class CartView(APIView):
    """GET cart contents for current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class AddToCartView(APIView):
    """POST { bundle_id } → add bundle to cart."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bundle_id = request.data.get('bundle_id')
        if not bundle_id:
            return Response({'error': 'bundle_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        bundle = get_object_or_404(Bundle, id=bundle_id, is_active=True)
        cart, _ = Cart.objects.get_or_create(user=request.user)

        item, created = CartItem.objects.get_or_create(cart=cart, bundle=bundle)
        if not created:
            return Response({'message': 'Already in cart'}, status=status.HTTP_200_OK)

        return Response({
            'message': f'"{bundle.title}" added to cart.',
            'cart': CartSerializer(cart).data,
        }, status=status.HTTP_201_CREATED)


class RemoveFromCartView(APIView):
    """DELETE /cart/remove/<item_id>/ → remove one item from cart."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart = get_object_or_404(Cart, user=request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        bundle_title = item.bundle.title
        item.delete()
        return Response({'message': f'"{bundle_title}" removed from cart.'})


class ClearCartView(APIView):
    """DELETE /cart/clear/ → empty the entire cart."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})


class CartCountView(APIView):
    """GET → returns just the cart item count (for sidebar badge)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        count = cart.item_count if cart else 0
        return Response({'count': count})


# ─── Checkout ─────────────────────────────────────────────────────────────────

class CheckoutInitiateView(APIView):
    """
    POST { country_code, coupon_code? }
    Calculates total for current cart and initiates the correct payment gateway.
    - Pakistan (PK): returns reference code for alternative payment
    - All others: creates Stripe PaymentIntent and returns client_secret
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        country_code = (request.data.get('country_code') or '').upper().strip()
        coupon_code = request.data.get('coupon_code', '').strip()

        cart = Cart.objects.filter(user=request.user).prefetch_related('items__bundle').first()
        if not cart or cart.item_count == 0:
            return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        # Sum cart total
        subtotal = cart.total
        discount = Decimal('0.00')

        # Apply coupon if provided
        coupon = None
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                if coupon.is_valid():
                    discount = (subtotal * coupon.discount_percentage) / 100
                else:
                    coupon = None
            except Coupon.DoesNotExist:
                pass

        after_discount = max(Decimal('0.00'), subtotal - discount)
        tax = round(after_discount * TAX_RATE, 2)
        total = after_discount + tax

        # Create one transaction per bundle in cart (or combine — use first bundle for simplicity)
        # We'll attach all bundles to a single transaction via a comma-separated note
        bundle_ids = list(cart.items.values_list('bundle_id', flat=True))
        first_bundle = cart.items.first().bundle

        # ------ Pakistan Payment ------
        if country_code == 'PK':
            transaction = PaymentTransaction.objects.create(
                user=request.user,
                bundle=first_bundle,
                coupon_applied=coupon,
                amount=after_discount,
                tax_amount=tax,
                total_amount=total,
                gateway=PaymentTransaction.Gateway.PAKISTAN,
                country_code=country_code,
                status=PaymentTransaction.Status.PENDING,
            )
            return Response({
                'gateway': 'pakistan',
                'transaction_id': transaction.id,
                'total': str(total),
                'currency': first_bundle.currency,
                'message': 'Please complete payment via the Pakistan payment gateway.',
                # Pakistan payment details — replace with real API integration
                'payment_instructions': {
                    'bank_name': 'Placeholder Bank',
                    'account_number': 'XXXX-XXXX-XXXX',
                    'reference': f'MRCOG-{transaction.id}',
                    'amount': str(total),
                },
            })

        # ------ Stripe Payment ------
        if not stripe.api_key:
            return Response(
                {'error': 'Payment gateway not configured. Contact support.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            intent = stripe.PaymentIntent.create(
                amount=int(total * 100),  # Stripe expects pence/cents
                currency=first_bundle.currency.lower(),
                metadata={
                    'user_id': str(request.user.id),
                    'bundle_ids': ','.join(str(b) for b in bundle_ids),
                },
            )

            transaction = PaymentTransaction.objects.create(
                user=request.user,
                bundle=first_bundle,
                coupon_applied=coupon,
                amount=after_discount,
                tax_amount=tax,
                total_amount=total,
                gateway=PaymentTransaction.Gateway.STRIPE,
                stripe_payment_intent_id=intent.id,
                country_code=country_code,
                status=PaymentTransaction.Status.PENDING,
            )

            return Response({
                'gateway': 'stripe',
                'client_secret': intent.client_secret,
                'publishable_key': getattr(settings, 'STRIPE_PUBLISHABLE_KEY', ''),
                'transaction_id': transaction.id,
                'total': str(total),
                'currency': first_bundle.currency,
                'discount': str(discount),
                'tax': str(tax),
            })

        except stripe.error.StripeError as e:
            logger.error(f"Stripe error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class StripeWebhookView(APIView):
    """
    Stripe webhook endpoint — called by Stripe after successful payment.
    Activates the subscription and unlocks the appropriate libraries.
    Must be registered in the Stripe dashboard.
    URL: /api/subscriptions/webhooks/stripe/
    """
    permission_classes = [AllowAny]

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

        try:
            if webhook_secret:
                event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            else:
                event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            logger.warning(f"Webhook verification failed: {e}")
            return HttpResponse(status=400)

        if event['type'] == 'payment_intent.succeeded':
            intent = event['data']['object']
            self._handle_payment_success(intent)

        return HttpResponse(status=200)

    def _handle_payment_success(self, intent):
        try:
            transaction = PaymentTransaction.objects.get(stripe_payment_intent_id=intent['id'])
        except PaymentTransaction.DoesNotExist:
            logger.error(f"Transaction not found for PaymentIntent {intent['id']}")
            return

        if transaction.status == PaymentTransaction.Status.SUCCESS:
            return  # Already processed

        transaction.status = PaymentTransaction.Status.SUCCESS
        transaction.transaction_id = intent['id']
        transaction.save()

        # Activate all bundles in the cart
        bundle_ids_str = intent.get('metadata', {}).get('bundle_ids', '')
        bundle_ids = [int(bid) for bid in bundle_ids_str.split(',') if bid.strip().isdigit()]
        bundles = Bundle.objects.filter(id__in=bundle_ids)

        for bundle in bundles:
            _activate_bundle_subscription(
                user=transaction.user,
                bundle=bundle,
                payment_reference=intent['id'],
                gateway='stripe'
            )

        # Clear the cart
        Cart.objects.filter(user=transaction.user).update()
        CartItem.objects.filter(cart__user=transaction.user).delete()


class ConfirmStripePaymentView(APIView):
    """
    POST { payment_intent_id, transaction_id }
    Called from frontend after Stripe.js confirms payment client-side.
    Activates subscriptions and clears cart.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_intent_id = request.data.get('payment_intent_id')
        transaction_id = request.data.get('transaction_id')

        if not payment_intent_id or not transaction_id:
            return Response({'error': 'payment_intent_id and transaction_id are required'}, status=400)

        try:
            transaction = PaymentTransaction.objects.get(id=transaction_id, user=request.user)
        except PaymentTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found.'}, status=404)

        if transaction.status == PaymentTransaction.Status.SUCCESS:
            return Response({'message': 'Already activated.', 'subscriptions': []})

        # Verify with Stripe
        if stripe.api_key:
            try:
                intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                if intent['status'] != 'succeeded':
                    return Response({'error': 'Payment not yet confirmed by Stripe.'}, status=402)
            except stripe.error.StripeError as e:
                return Response({'error': str(e)}, status=502)

        transaction.status = PaymentTransaction.Status.SUCCESS
        transaction.transaction_id = payment_intent_id
        transaction.save()

        # Activate all bundles in the cart
        cart = Cart.objects.filter(user=request.user).first()
        bundles = [item.bundle for item in cart.items.all()] if cart else [transaction.bundle]

        all_subs = []
        for bundle in bundles:
            subs = _activate_bundle_subscription(
                user=request.user,
                bundle=bundle,
                payment_reference=payment_intent_id,
                gateway='stripe'
            )
            all_subs.extend(subs)

        # Clear cart
        if cart:
            cart.items.all().delete()

        return Response({
            'message': 'Payment confirmed! Your libraries are now unlocked.',
            'subscriptions': UserSubscriptionSerializer(all_subs, many=True).data,
            'unlocked_libraries': list({s.library_access for s in all_subs}),
        })


class ConfirmPakistanPaymentView(APIView):
    """
    POST { transaction_id, payment_proof? }
    Pakistan payment confirmation — manual verification flow.
    In production: replace with real payment gateway callback.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        transaction_id = request.data.get('transaction_id')
        if not transaction_id:
            return Response({'error': 'transaction_id is required'}, status=400)

        try:
            transaction = PaymentTransaction.objects.get(id=transaction_id, user=request.user)
        except PaymentTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found.'}, status=404)

        if transaction.status == PaymentTransaction.Status.SUCCESS:
            return Response({'message': 'Already activated.'})

        # TODO: Integrate real Pakistan payment gateway verification here
        # For now: mark as pending manual review (admin will confirm)
        return Response({
            'message': 'Your payment reference has been submitted for verification. '
                       'Libraries will be unlocked within 24 hours after manual confirmation.',
            'reference': f'MRCOG-{transaction.id}',
            'status': 'pending_verification',
        }, status=status.HTTP_202_ACCEPTED)


# ─── My Subscriptions ─────────────────────────────────────────────────────────

class MySubscriptionsView(APIView):
    """GET → user's active subscriptions grouped by library."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subs = UserSubscription.objects.filter(
            user=request.user,
            status=UserSubscription.Status.ACTIVE,
            expires_at__gt=timezone.now()
        ).select_related('bundle', 'plan')

        unlocked = list({s.library_access or (s.plan.plan_category if s.plan else '') for s in subs if s.is_active})

        return Response({
            'subscriptions': UserSubscriptionSerializer(subs, many=True).data,
            'unlocked_libraries': unlocked,
            'has_reading': 'reading' in unlocked,
            'has_video': 'video' in unlocked,
            'has_mock_exam': 'mock_exam' in unlocked,
        })


# ─── Plans (legacy) ───────────────────────────────────────────────────────────

class PlanListView(generics.ListAPIView):
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]


class ApplyCouponView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        bundle_id = request.data.get('bundle_id')

        if not code:
            return Response({'error': 'Coupon code is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code__iexact=code)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code'}, status=status.HTTP_404_NOT_FOUND)

        if not coupon.is_valid():
            return Response({'error': 'This coupon has expired or is inactive'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate discount against cart total
        cart = Cart.objects.filter(user=request.user).first()
        subtotal = cart.total if cart else Decimal('0.00')
        discount = (subtotal * coupon.discount_percentage) / 100
        new_total = max(Decimal('0.00'), subtotal - discount)

        return Response({
            'discount_percentage': coupon.discount_percentage,
            'discount_amount': round(discount, 2),
            'new_total': round(new_total, 2),
            'message': f'{coupon.discount_percentage}% discount applied!',
        })


# ─── Legacy SubscribeView ─────────────────────────────────────────────────────

class SubscribeView(APIView):
    """Direct subscribe (admin/test use only). Use checkout flow for production."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'error': 'plan_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        from subscriptions.models import Plan
        plan = get_object_or_404(Plan, id=plan_id, is_active=True)

        existing = UserSubscription.objects.filter(
            user=request.user, plan=plan, status='active', expires_at__gt=timezone.now()
        ).first()
        if existing:
            return Response({'message': 'Already subscribed to this plan.'})

        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            library_access=plan.plan_category,
            status=UserSubscription.Status.ACTIVE,
        )
        return Response({
            'message': f'Successfully subscribed to {plan.name}.',
            'subscription': UserSubscriptionSerializer(subscription).data,
        }, status=status.HTTP_201_CREATED)


# ─── Admin Viewsets ───────────────────────────────────────────────────────────

from rest_framework import viewsets, serializers, parsers, filters
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action


class AdminBundleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bundle
        fields = '__all__'


class AdminBundleViewSet(viewsets.ModelViewSet):
    """CRUD for Subscription Bundles — staff only."""
    permission_classes = [IsAdminUser]
    queryset = Bundle.objects.all().order_by('order')
    serializer_class = AdminBundleSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]


class AdminUserSubscriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    bundle_title = serializers.CharField(source='bundle.title', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserSubscription
        fields = '__all__'

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email


class AdminSubscriptionViewSet(viewsets.ModelViewSet):
    """View/manage all user subscriptions — staff only."""
    permission_classes = [IsAdminUser]
    queryset = UserSubscription.objects.all().select_related('user', 'bundle', 'plan').order_by('-created_at')
    serializer_class = AdminUserSubscriptionSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__email', 'user__first_name', 'bundle__title', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """POST /admin/subscriptions/<id>/cancel/ — cancel a subscription."""
        sub = self.get_object()
        sub.status = UserSubscription.Status.CANCELLED
        sub.save()
        return Response({'message': f'Subscription #{sub.id} cancelled.'})

    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """POST /admin/subscriptions/<id>/reactivate/ — reactivate a subscription."""
        sub = self.get_object()
        sub.status = UserSubscription.Status.ACTIVE
        sub.save()
        return Response({'message': f'Subscription #{sub.id} reactivated.'})


class AdminPaymentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    bundle_title = serializers.CharField(source='bundle.title', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = '__all__'


class AdminPaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """View all payment transactions — staff only (read-only)."""
    permission_classes = [IsAdminUser]
    queryset = PaymentTransaction.objects.all().select_related('user', 'bundle').order_by('-created_at')
    serializer_class = AdminPaymentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__email', 'transaction_id', 'status', 'gateway']

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        gateway = self.request.query_params.get('gateway')
        if status_filter:
            qs = qs.filter(status=status_filter)
        if gateway:
            qs = qs.filter(gateway=gateway)
        return qs

