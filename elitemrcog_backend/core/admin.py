"""Admin for Core app."""

from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin
from adminsortable2.admin import SortableAdminMixin
from .models import FAQ, LegalDocument

@admin.register(FAQ)
class FAQAdmin(SortableAdminMixin, SummernoteModelAdmin):
    summernote_fields = ['answer']
    list_display = ['question', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['question', 'answer']

@admin.register(LegalDocument)
class LegalDocumentAdmin(SummernoteModelAdmin):
    summernote_fields = ['content']
    list_display = ['get_doc_type_display', 'last_updated']
