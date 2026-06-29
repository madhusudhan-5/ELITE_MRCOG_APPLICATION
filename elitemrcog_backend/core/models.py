"""
Core app models for Elite MRCOG.
Contains FAQs and Legal Documents (Terms, Privacy, Refund policies).
"""

from django.db import models


class FAQ(models.Model):
    question = models.CharField(max_length=500)
    answer = models.TextField(help_text="Rich text answer")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'

    def __str__(self):
        return self.question


class LegalDocument(models.Model):
    class DocType(models.TextChoices):
        TERMS = 'terms', 'Terms & Conditions'
        PRIVACY = 'privacy', 'Privacy Policy'
        REFUND = 'refund', 'Refund Policy'

    doc_type = models.CharField(max_length=20, choices=DocType.choices, unique=True)
    content = models.TextField(help_text="Rich text content")
    last_updated = models.DateField(auto_now=True)

    class Meta:
        verbose_name = 'Legal Document'
        verbose_name_plural = 'Legal Documents'

    def __str__(self):
        return self.get_doc_type_display()
