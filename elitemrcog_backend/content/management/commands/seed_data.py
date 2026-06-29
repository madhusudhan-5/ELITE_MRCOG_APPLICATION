"""
Management command: seed_data
Creates initial test content for development.
"""

from django.core.management.base import BaseCommand
from content.models import Part, Module
from subscriptions.models import Plan


class Command(BaseCommand):
    help = 'Seed initial data for development'

    def handle(self, *args, **kwargs):
        # Create Parts
        parts_data = [
            {'name': 'Part 1', 'order': 1, 'description': 'MRCOG Part 1 — SBAs, Basic Sciences'},
            {'name': 'Part 2', 'order': 2, 'description': 'MRCOG Part 2 — EMQs, Clinical Practice'},
            {'name': 'Part 3', 'order': 3, 'description': 'MRCOG Part 3 — OSCEs, Clinical Skills'},
        ]
        for data in parts_data:
            part, created = Part.objects.get_or_create(name=data['name'], defaults=data)
            self.stdout.write(f"{'Created' if created else 'Existing'} Part: {part.name}")

        # Create sample Modules for Part 3
        part3 = Part.objects.get(name='Part 3')
        modules_data = [
            {
                'title': 'Core Surgical Skills',
                'short_text': 'A must-know topic for MRCOG candidates. Core Surgical Skills are frequently assessed across written and clinical components of the examination.',
                'long_text': '<p>This course simplifies key surgical concepts relevant to obstetrics and gynaecology, with emphasis on exam-relevant principles, common pitfalls, and safe clinical practice.</p>',
                'tags': 'MRCOG High Yield,Exam relevant',
                'order': 1,
            },
            {
                'title': 'Ovarian Neoplasm & Atypia',
                'short_text': 'Comprehensive coverage of ovarian neoplasm classification, risk factors and MRCOG exam-relevant management.',
                'long_text': '<p>Deep dive into ovarian pathology with clinical correlations and exam scenarios.</p>',
                'tags': 'MRCOG High Yield',
                'order': 2,
            },
        ]
        for data in modules_data:
            module, created = Module.objects.get_or_create(
                part=part3, title=data['title'], defaults=data
            )
            self.stdout.write(f"{'Created' if created else 'Existing'} Module: {module.title}")

        # Create Subscription Plans
        plans_data = [
            {'name': 'Free', 'plan_type': 'free', 'price': 0, 'duration_days': 36500},
            {'name': 'Part 1 Access', 'plan_type': 'part_1', 'price': 49.99, 'duration_days': 365},
            {'name': 'Part 2 Access', 'plan_type': 'part_2', 'price': 49.99, 'duration_days': 365},
            {'name': 'Part 3 Access', 'plan_type': 'part_3', 'price': 49.99, 'duration_days': 365},
            {'name': 'Full Access', 'plan_type': 'full', 'price': 129.99, 'duration_days': 365},
        ]
        for data in plans_data:
            plan, created = Plan.objects.get_or_create(plan_type=data['plan_type'], defaults=data)
            self.stdout.write(f"{'Created' if created else 'Existing'} Plan: {plan.name}")

        self.stdout.write(self.style.SUCCESS('\n✅ Seed data created successfully!'))
