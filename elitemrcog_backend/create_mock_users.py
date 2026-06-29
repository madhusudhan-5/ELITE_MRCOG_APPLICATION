import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elitemrcog.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

users_to_create = []

# Generate 2 Super Admins
for i in range(1, 3):
    users_to_create.append({
        'email': f'superadmin{i}@elitemrcog.com',
        'first_name': 'Super',
        'last_name': f'Admin {i}',
        'is_staff': True,
        'is_superuser': True,
        'is_verified': True,
    })

# Generate 6 Normal Admins
for i in range(1, 7):
    users_to_create.append({
        'email': f'admin{i}@elitemrcog.com',
        'first_name': 'Normal',
        'last_name': f'Admin {i}',
        'is_staff': True,
        'is_superuser': False,
        'is_verified': True,
    })

# Generate 10 Students
for i in range(1, 11):
    users_to_create.append({
        'email': f'student{i}@elitemrcog.com',
        'first_name': 'Student',
        'last_name': str(i),
        'is_staff': False,
        'is_superuser': False,
        'is_verified': True,
    })

created_count = 0
for u_data in users_to_create:
    email = u_data['email']
    if not User.objects.filter(email=email).exists():
        user = User.objects.create(
            email=email,
            first_name=u_data['first_name'],
            last_name=u_data['last_name'],
            is_staff=u_data['is_staff'],
            is_superuser=u_data['is_superuser'],
            is_verified=u_data['is_verified'],
        )
        user.set_password('Password123!')
        user.save()
        print(f"✅ Created user: {email} (Password: Password123!)")
        created_count += 1
    else:
        print(f"⚠️ User {email} already exists!")

print(f"\nSuccessfully created {created_count} new users!")
