import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "elitemrcog.settings")
django.setup()

from accounts.models import User

print("Creating/updating users...")

# SuperAdmin
superadmin, _ = User.objects.get_or_create(
    email="superadmin@elitemrcog.com", 
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
print("Superadmin created/updated: superadmin@elitemrcog.com / Password123!")

# 6 Admins
for i in range(1, 7):
    email = f"admin{i}@elitemrcog.com"
    admin, _ = User.objects.get_or_create(
        email=email, 
        defaults={
            "first_name": f"Admin", 
            "last_name": f"{i}", 
            "is_staff": True, 
            "is_verified": True
        }
    )
    admin.is_staff = True
    admin.is_superuser = False
    admin.is_verified = True
    admin.set_password("Password123!")
    admin.save()
    print(f"Admin {i} created/updated: {email} / Password123!")

print("All credentials are fully configured and ready!")
