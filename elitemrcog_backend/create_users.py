import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "elitemrcog.settings")
django.setup()

from accounts.models import User

print("Creating/updating users...")

# SuperAdmin
superadmin, _ = User.objects.get_or_create(
    email="superadmin@example.com", 
    defaults={
        "first_name": "Super", 
        "last_name": "Admin",
        "is_superuser": True, 
        "is_staff": True, 
        "is_verified": True
    }
)
superadmin.is_superuser = True
superadmin.is_staff = True
superadmin.is_verified = True
superadmin.set_password("Password123!")
superadmin.save()
print("Superadmin created/updated.")

# Admin
admin, _ = User.objects.get_or_create(
    email="admin2@example.com", 
    defaults={
        "first_name": "Admin", 
        "last_name": "User", 
        "is_staff": True, 
        "is_verified": True
    }
)
admin.is_staff = True
admin.is_superuser = False
admin.is_verified = True
admin.set_password("Password123!")
admin.save()
print("Admin created/updated.")

# Student
student, _ = User.objects.get_or_create(
    email="student@example.com", 
    defaults={
        "first_name": "Student", 
        "last_name": "User", 
        "is_verified": True
    }
)
student.is_staff = False
student.is_superuser = False
student.is_verified = True
student.set_password("Password123!")
student.save()
print("Student created/updated.")

print("All credentials are fully configured and ready!")
