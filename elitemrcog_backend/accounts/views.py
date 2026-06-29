"""
API views for accounts app.
Handles: register, login (email/password), send OTP, verify OTP, password reset, Google OAuth, logout.
"""

from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
import requests

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import User, OTPVerification
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    SendOTPSerializer, VerifyOTPSerializer, PasswordResetSerializer,
    GoogleAuthSerializer
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user after OTP verification."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp_code = request.data.get('otp')

        # Verify that an active verified OTP exists for this email
        otp_obj = OTPVerification.objects.filter(
            email=email, otp=otp_code, purpose=OTPVerification.Purpose.REGISTER_VERIFY, is_used=True
        ).first()

        if not otp_obj:
            return Response({'error': 'Please verify your email with OTP first.'}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        user.is_verified = True
        user.save(update_fields=['is_verified'])

        # Log the user in directly
        tokens = get_tokens_for_user(user)
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        return Response({
            'message': 'Account created successfully.',
            'user': UserSerializer(user).data,
            **tokens,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login with email + password. Returns JWT tokens."""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        return Response({
            'user': UserSerializer(user).data,
            **tokens,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp_view(request):
    """Send OTP to email for login or email verification."""
    serializer = SendOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']

        # Invalidate previous OTPs
        OTPVerification.objects.filter(email=email, purpose=purpose, is_used=False).update(is_used=True)

        otp = OTPVerification.objects.create(email=email, purpose=purpose)

        send_mail(
            subject='Your Elite MRCOG OTP',
            message=f'Your OTP is: {otp.otp}\nValid for 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
        return Response({'message': f'OTP sent to {email}'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    """Verify OTP. If email_verify → marks user verified and returns tokens."""
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']
        purpose = serializer.validated_data['purpose']

        otp_obj = OTPVerification.objects.filter(
            email=email, otp=otp_code, purpose=purpose, is_used=False
        ).first()

        if not otp_obj or not otp_obj.is_valid:
            return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_obj.is_used = True
        otp_obj.save()

        if purpose == OTPVerification.Purpose.REGISTER_VERIFY:
            return Response({'message': 'Email verified successfully. Proceed to registration.'})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if purpose == OTPVerification.Purpose.EMAIL_VERIFY:
            user.is_verified = True
            user.save(update_fields=['is_verified'])

        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'OTP verified successfully.',
            'user': UserSerializer(user).data,
            **tokens,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_view(request):
    """Reset password using email + OTP."""
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        otp_obj = OTPVerification.objects.filter(
            email=email, otp=otp_code,
            purpose=OTPVerification.Purpose.PASSWORD_RESET,
            is_used=False
        ).first()

        if not otp_obj or not otp_obj.is_valid:
            return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save(update_fields=['password'])
        otp_obj.is_used = True
        otp_obj.save()

        return Response({'message': 'Password reset successful. Please log in.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Get current logged-in user profile."""
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Blacklist the refresh token to log out."""
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully.'})
    except Exception:
        return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth_view(request):
    """Login or register using Google OAuth id_token."""
    serializer = GoogleAuthSerializer(data=request.data)
    if serializer.is_valid():
        id_token = serializer.validated_data['id_token']
        # verify token
        response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}")
        if not response.ok:
            return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = response.json()
        email = data.get('email')
        first_name = data.get('given_name', '')
        last_name = data.get('family_name', '')
        google_id = data.get('sub')

        if not email:
            return Response({'error': 'No email provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

        user, created = User.objects.get_or_create(email=email, defaults={
            'first_name': first_name,
            'last_name': last_name,
            'google_id': google_id,
            'is_verified': True,
        })
        if created:
            user.set_unusable_password()
            user.save()
        elif not user.google_id:
            user.google_id = google_id
            user.save(update_fields=['google_id'])

        tokens = get_tokens_for_user(user)
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        return Response({
            'user': UserSerializer(user).data,
            **tokens,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

