from rest_framework import viewsets, serializers
from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()

class IsSuperAdminUser(BasePermission):
    """
    Allows access only to superadmin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class UserAdminSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'name', 
            'is_active', 'is_staff', 'is_superuser', 'is_verified',
            'date_joined', 'last_login', 'role'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'superadmin'
        if obj.is_staff:
            return 'admin'
        return 'student'

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Users, strictly restricted to SuperAdmins.
    """
    permission_classes = [IsSuperAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserAdminSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        role_filter = self.request.query_params.get('role')
        if role_filter == 'superadmin':
            qs = qs.filter(is_superuser=True)
        elif role_filter == 'admin':
            qs = qs.filter(is_staff=True, is_superuser=False)
        elif role_filter == 'student':
            qs = qs.filter(is_staff=False, is_superuser=False)
        return qs
