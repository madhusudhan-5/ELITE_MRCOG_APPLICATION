"""URL routing for accounts app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import admin_views

router = DefaultRouter()
router.register(r'manage/users', admin_views.AdminUserViewSet, basename='manage-users')

urlpatterns = [
    path('register/', views.register_view, name='auth-register'),
    path('login/', views.login_view, name='auth-login'),
    path('google/', views.google_auth_view, name='auth-google'),
    path('send-otp/', views.send_otp_view, name='auth-send-otp'),
    path('verify-otp/', views.verify_otp_view, name='auth-verify-otp'),
    path('password-reset/', views.password_reset_view, name='auth-password-reset'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.me_view, name='auth-me'),
    path('logout/', views.logout_view, name='auth-logout'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('', include(router.urls)),
]
