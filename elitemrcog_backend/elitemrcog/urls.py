"""
Root URL Configuration for Elite MRCOG backend.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "Elite MRCOG Admin"
admin.site.site_title = "Elite MRCOG"
admin.site.index_title = "Content Management"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('summernote/', include('django_summernote.urls')),

    # API routes
    path('api/auth/', include('accounts.urls')),
    path('api/content/', include('content.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/core/', include('core.urls')),

    # Social auth (Google OAuth)
    path('social-auth/', include('social_django.urls', namespace='social')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
