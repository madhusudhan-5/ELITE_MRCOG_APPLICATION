"""Admin configuration for accounts app."""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils import timezone
from .models import User, OTPVerification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['email']
    list_display = ['email', 'first_name', 'last_name', 'phone', 'is_verified', 'is_premium', 'last_login', 'is_active', 'is_staff']
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
    actions = ['grant_manual_premium']

    @admin.display(boolean=True, description='Premium')
    def is_premium(self, obj):
        return obj.subscriptions.filter(status='active', expires_at__gt=timezone.now()).exists()

    @admin.action(description='Grant Manual Premium Access (1 Year Full Access)')
    def grant_manual_premium(self, request, queryset):
        from subscriptions.models import UserSubscription, Plan
        
        # Get or create a "Manual Full Access" plan
        plan, _ = Plan.objects.get_or_create(
            plan_type='full',
            defaults={
                'name': 'Manual Full Access',
                'plan_category': 'full',
                'description': 'Manually granted full access.',
                'price': 0,
                'duration_days': 365,
                'is_active': True
            }
        )
        
        count = 0
        for user in queryset:
            # Grant full access
            UserSubscription.objects.create(
                user=user,
                plan=plan,
                library_access='full',
                status='active',
                started_at=timezone.now()
            )
            count += 1
            
        self.message_user(request, f'Successfully granted 365-day premium access to {count} users.')

@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ['email', 'purpose', 'otp', 'is_used', 'created_at', 'expires_at']
    list_filter = ['purpose', 'is_used']
    search_fields = ['email']
    readonly_fields = ['otp', 'created_at', 'expires_at']
    ordering = ['-created_at']
