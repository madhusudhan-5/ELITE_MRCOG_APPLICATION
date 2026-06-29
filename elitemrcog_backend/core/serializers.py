"""DRF Serializers for Core app."""

from rest_framework import serializers
from .models import FAQ, LegalDocument

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'order']

class LegalDocumentSerializer(serializers.ModelSerializer):
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)
    
    class Meta:
        model = LegalDocument
        fields = ['doc_type', 'doc_type_display', 'content', 'last_updated']
