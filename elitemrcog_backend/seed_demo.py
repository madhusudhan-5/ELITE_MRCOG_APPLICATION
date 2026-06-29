"""
Seed script: Creates a complete demo module with PDF stations, a Plan, and a Bundle.
Usage: python manage.py shell < seed_demo.py

What it creates:
  - Part 3 (if not exists)
  - Module: "Ovarian Neoplasm & Atypia" (Course Material)
  - Reading Article: "Core Surgical Skills"
  - Station 1: "Introduction to Ovarian Neoplasm" — FREE (uses pptdemo1.pdf)
  - Station 2: "Diagnosis & Management" — PAID (uses same PDF as demo)
  - Station 3: "Surgical Considerations" — PAID
  - Plan: "Reading Access" (reading category)
  - Bundle: "Reading Library Bundle" (includes_reading=True)
"""

import os
import shutil
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elitemrcog.settings')
django.setup()

from django.conf import settings
from django.core.files import File
from content.models import Part, Module, ReadingArticle, Station
from subscriptions.models import Plan, Bundle

# ─── Paths ────────────────────────────────────────────────────────────────────
PDF_SOURCE = '/Users/madhusudhanm/Documents/GIT/ELITE_MRCOG_APPLICATION/pptdemo1.pdf'
MEDIA_STATIONS_DIR = os.path.join(settings.MEDIA_ROOT, 'stations', 'pdfs')
os.makedirs(MEDIA_STATIONS_DIR, exist_ok=True)

# ─── 1. Part ──────────────────────────────────────────────────────────────────
part, _ = Part.objects.get_or_create(
    name='Part 3',
    defaults={'order': 1, 'description': 'MRCOG Part 3 Clinical Assessment'}
)
print(f"✅ Part: {part}")

# ─── 2. Module ────────────────────────────────────────────────────────────────
module, _ = Module.objects.get_or_create(
    title='Ovarian Neoplasm & Atypia',
    part=part,
    defaults={
        'category': Module.Category.COURSE_MATERIAL,
        'is_free': False,
        'short_text': 'A must-know topic for MRCOG candidates — frequently assessed in written and clinical components.',
        'long_text': (
            'This course simplifies key surgical concepts relevant to obstetrics and gynaecology, '
            'with emphasis on exam-relevant principles, common pitfalls, and safe clinical practice. '
            'Designed to help candidates approach MRCOG questions with confidence and clarity.'
        ),
        'tags': 'MRCOG High Yield,Exam Relevant,Gynaecology,Oncology',
        'order': 1,
        'is_active': True,
    }
)
print(f"✅ Module: {module}")

# ─── 3. Reading Article ───────────────────────────────────────────────────────
article, _ = ReadingArticle.objects.get_or_create(
    title='Core Surgical Skills',
    module=module,
    defaults={
        'article_type': ReadingArticle.ArticleType.COURSE_MATERIAL,
        'short_description': 'Core Surgical Skills covering ovarian neoplasm and atypia with exam-focused approach.',
        'overview_text': (
            'A must-know topic for MRCOG candidates. Core Surgical Skills are frequently assessed '
            'across written and clinical components of the examination.\n'
            'This course simplifies key surgical concepts relevant to obstetrics and gynaecology, '
            'with emphasis on exam-relevant principles, common pitfalls, and safe clinical practice. '
            'Designed to help candidates approach MRCOG questions with confidence and clarity.'
        ),
        'duration_display': '2h 30m',
        'is_free': False,
        'order': 1,
        'is_active': True,
    }
)
print(f"✅ Reading Article: {article}")

# ─── 4. Stations (with your PDF) ─────────────────────────────────────────────
def create_station(article, title, order, is_free, page_count):
    station, created = Station.objects.get_or_create(
        article=article,
        title=title,
        defaults={
            'order': order,
            'is_free': is_free,
            'page_count': page_count,
            'is_active': True,
        }
    )
    if created and os.path.exists(PDF_SOURCE):
        with open(PDF_SOURCE, 'rb') as f:
            station.pdf_file.save(f'station_{order}_{title[:20].replace(" ", "_")}.pdf', File(f), save=True)
        print(f"  📄 PDF uploaded to Station: {station}")
    else:
        print(f"  {'✅ Already exists' if not created else '⚠️  PDF not found at ' + PDF_SOURCE}: {station}")
    return station

station1 = create_station(article, 'Introduction to Ovarian Neoplasm', order=1, is_free=True,  page_count=12)
station2 = create_station(article, 'Diagnosis & Management',           order=2, is_free=False, page_count=12)
station3 = create_station(article, 'Surgical Considerations',          order=3, is_free=False, page_count=12)

# ─── 5. Plan ──────────────────────────────────────────────────────────────────
plan, created = Plan.objects.get_or_create(
    plan_type='part_3',
    defaults={
        'name': 'Part 3 Reading Access',
        'plan_category': Plan.PlanCategory.READING,
        'description': 'Full access to all Part 3 Reading Library modules and stations.',
        'price': 49.99,
        'currency': 'GBP',
        'duration_days': 365,
        'is_active': True,
    }
)
print(f"{'✅ Created' if created else '✅ Exists'} Plan: {plan}")

# ─── 6. Bundle ────────────────────────────────────────────────────────────────
bundle, created = Bundle.objects.get_or_create(
    slug='reading-library-bundle',
    defaults={
        'title': 'Reading Library Bundle',
        'short_description': 'Unlock all Easy Reads and Course Material modules in the Reading Library for 1 year.',
        'description': (
            'Get complete access to Elite MRCOG Reading Library — including all Easy Read summaries '
            'and in-depth Course Material stations for Part 3.\n\n'
            'Each module contains multiple stations, delivered as protected PDF lessons. '
            'Track your progress, revisit any station, and study at your own pace. '
            'Includes 365 days of access from the date of purchase.'
        ),
        'price': 49.99,
        'currency': 'GBP',
        'duration_days': 365,
        'includes_reading': True,
        'includes_video': False,
        'includes_mock_exam': False,
        'is_featured': True,
        'is_active': True,
        'order': 1,
    }
)
print(f"{'✅ Created' if created else '✅ Exists'} Bundle: {bundle}")

# ─── Summary ──────────────────────────────────────────────────────────────────
print("\n" + "═"*60)
print("🎉 SEED COMPLETE — Summary")
print("═"*60)
print(f"  Part:     {part.name}")
print(f"  Module:   {module.title} [{module.get_category_display()}]")
print(f"  Article:  {article.title} ({article.station_count} stations)")
print(f"  Station 1 (FREE):  {station1.title} — {station1.page_count} pages, PDF: {'✅' if station1.pdf_file else '❌'}")
print(f"  Station 2 (PAID):  {station2.title} — {station2.page_count} pages, PDF: {'✅' if station2.pdf_file else '❌'}")
print(f"  Station 3 (PAID):  {station3.title} — {station3.page_count} pages, PDF: {'✅' if station3.pdf_file else '❌'}")
print(f"  Plan:     {plan.name} @ {plan.currency} {plan.price} / {plan.duration_days} days")
print(f"  Bundle:   {bundle.title} @ {bundle.currency} {bundle.price} | Reading: {'✅' if bundle.includes_reading else '❌'} | Video: {'✅' if bundle.includes_video else '❌'} | Mock: {'✅' if bundle.includes_mock_exam else '❌'}")
print("═"*60)
print("\nNext: Log in as student@example.com and visit /dashboard")
