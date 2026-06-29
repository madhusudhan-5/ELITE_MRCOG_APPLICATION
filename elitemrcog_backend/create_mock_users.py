import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elitemrcog.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

users_to_create = [
    {
        'email': 'superadmin@elitemrcog.com',
        'first_name': 'Super',
        'last_name': 'Admin',
        'is_staff': True,
        'is_superuser': True,
        'is_verified': True,
    },
    {
        'email': 'admin@elitemrcog.com',
        'first_name': 'Normal',
        'last_name': 'Admin',
        'is_staff': True,
        'is_superuser': False,
        'is_verified': True,
    },
    {
        'email': 'student1@elitemrcog.com',
        'first_name': 'Student',
        'last_name': 'One',
        'is_staff': False,
        'is_superuser': False,
        'is_verified': True,
    },
    {
        'email': 'student2@elitemrcog.com',
        'first_name': 'Student',
        'last_name': 'Two',
        'is_staff': False,
        'is_superuser': False,
        'is_verified': True,
    },
    {
        'email': 'student3@elitemrcog.com',
        'first_name': 'Student',
        'last_name': 'Three',
        'is_staff': False,
        'is_superuser': False,
        'is_verified': True,
    },
    {
        'email': 'student4@elitemrcog.com',
        'first_name': 'Student',
        'last_name': 'Four',
        'is_staff': False,
        'is_superuser': False,
        'is_verified': True,
    },
]

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
