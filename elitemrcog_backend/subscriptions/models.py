"""Subscription models for Elite MRCOG."""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify


class Bundle(models.Model):
    """
    A purchasable subscription bundle that can unlock any combination of
    Reading, Video, and Mock Exam libraries.
    Configurable via Django admin — no code changes needed to add new bundles.
    """
    title = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, blank=True)
    thumbnail = models.ImageField(upload_to='bundles/thumbnails/', blank=True, null=True)
    short_description = models.CharField(
        max_length=300,
        help_text="Shown on the bundle card"
    )
    description = models.TextField(
        help_text="Full description shown in the detail modal"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    duration_days = models.PositiveIntegerField(
        default=365,
        help_text="How many days this bundle is valid after purchase"
    )

    # Library access flags — any combination is supported
    includes_reading = models.BooleanField(default=False, help_text="Unlocks Reading Library")
    includes_video = models.BooleanField(default=False, help_text="Unlocks Video Library")
    includes_mock_exam = models.BooleanField(default=False, help_text="Unlocks Mock Exam")

    is_featured = models.BooleanField(default=False, help_text="Show 'Best Value' badge")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0, help_text="Display order on the page")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'Bundle'
        verbose_name_plural = 'Bundles'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        libraries = []
        if self.includes_reading: libraries.append('Reading')
        if self.includes_video: libraries.append('Video')
        if self.includes_mock_exam: libraries.append('Mock Exam')
        return f"{self.title} ({' + '.join(libraries) or 'No libraries'}) — {self.currency} {self.price}"

    @property
    def included_libraries(self):
        libs = []
        if self.includes_reading: libs.append('reading')
        if self.includes_video: libs.append('video')
        if self.includes_mock_exam: libs.append('mock_exam')
        return libs


class Plan(models.Model):
    class PlanType(models.TextChoices):
        FREE = 'free', 'Free'
        PART_1 = 'part_1', 'Part 1 Only'
        PART_2 = 'part_2', 'Part 2 Only'
        PART_3 = 'part_3', 'Part 3 Only'
        FULL = 'full', 'Full Access'

    class PlanCategory(models.TextChoices):
        READING = 'reading', 'Reading Modules'
        VIDEO = 'video', 'Video Modules'
        MOCK_EXAM = 'mock_exam', 'Mock Exam'
        FULL = 'full', 'Full Access (Reading + Video + Mock Exam)'

    name = models.CharField(max_length=100)
    plan_type = models.CharField(max_length=20, choices=PlanType.choices, unique=True)
    plan_category = models.CharField(
        max_length=20,
        choices=PlanCategory.choices,
        default=PlanCategory.FULL,
        help_text="What type of content this plan unlocks"
    )
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='INR')
    duration_days = models.PositiveIntegerField(default=365, help_text="Number of days this plan is valid for")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Plan'
        verbose_name_plural = 'Plans'

    def __str__(self):
        return f"{self.name} ({self.currency} {self.price})"


class Cart(models.Model):
    """One cart per user — persisted in DB so items survive across sessions."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'

    def __str__(self):
        return f"Cart — {self.user.email} ({self.items.count()} items)"

    @property
    def total(self):
        return sum(item.bundle.price for item in self.items.all())

    @property
    def item_count(self):
        return self.items.count()


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    bundle = models.ForeignKey(Bundle, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'bundle')  # Prevent duplicate bundles in cart
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'

    def __str__(self):
        return f"{self.cart.user.email} — {self.bundle.title}"


class UserSubscription(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        EXPIRED = 'expired', 'Expired'
        CANCELLED = 'cancelled', 'Cancelled'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    # Either plan or bundle — one of them will be set
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, null=True, blank=True)
    bundle = models.ForeignKey(Bundle, on_delete=models.PROTECT, null=True, blank=True)
    # Which library this subscription unlocks (reading / video / mock_exam)
    library_access = models.CharField(
        max_length=20,
        blank=True,
        help_text="The library this subscription row unlocks (reading/video/mock_exam)"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    started_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    payment_reference = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'User Subscription'
        verbose_name_plural = 'User Subscriptions'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.expires_at:
            from datetime import timedelta
            duration = self.bundle.duration_days if self.bundle else (self.plan.duration_days if self.plan else 365)
            self.expires_at = self.started_at + timedelta(days=duration)
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        return self.status == self.Status.ACTIVE and timezone.now() < self.expires_at

    def __str__(self):
        source = self.bundle.title if self.bundle else (self.plan.name if self.plan else 'Unknown')
        return f"{self.user} — {source} [{self.library_access}] ({'Active' if self.is_active else 'Inactive'})"


class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percentage = models.PositiveIntegerField(help_text="0 to 100")
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Coupon'
        verbose_name_plural = 'Coupons'

    def is_valid(self):
        if not self.is_active:
            return False
        if self.valid_until and timezone.now() > self.valid_until:
            return False
        return True

    def __str__(self):
        return f"{self.code} ({self.discount_percentage}% OFF)"


class PaymentTransaction(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUCCESS = 'success', 'Success'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    class Gateway(models.TextChoices):
        STRIPE = 'stripe', 'Stripe'
        PAKISTAN = 'pakistan', 'Pakistan Payment'
        FREE = 'free', 'Free / Manual'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    # Either plan or bundle
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, null=True, blank=True)
    bundle = models.ForeignKey(Bundle, on_delete=models.PROTECT, null=True, blank=True)
    coupon_applied = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    gateway = models.CharField(max_length=20, choices=Gateway.choices, default=Gateway.STRIPE)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=255, blank=True, unique=True, null=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    country_code = models.CharField(max_length=5, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Payment Transaction'
        verbose_name_plural = 'Payment Transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_id or 'Pending'} - {self.user.email} - {self.total_amount} [{self.gateway}]"
