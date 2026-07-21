"""
Admin API ViewSets for content management.
All endpoints require is_staff == True (Django admin / staff flag).
Accessible via: /api/content/manage/...
"""

from rest_framework import viewsets, serializers, parsers
from rest_framework.permissions import IsAdminUser
from .models import Part, Module, ReadingArticle, Station, Video
import sys
import traceback
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status

class PM2ErrorLoggingMixin:
    """
    Mixin to log all view exceptions to sys.stderr (PM2 error log on server)
    and return a generic error message to the client.
    """
    def handle_exception(self, exc):
        tb = traceback.format_exc()
        timestamp = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        user_info = f"User: {self.request.user.email}" if self.request.user and self.request.user.is_authenticated else "AnonymousUser"
        
        # Write directly to stderr so it goes to PM2's error log
        sys.stderr.write(
            f"\n--- PM2 ERROR LOG [{timestamp}] ---\n"
            f"Path: {self.request.path} | Method: {self.request.method}\n"
            f"{user_info}\n"
            f"{tb}"
            f"------------------------------------\n"
        )
        sys.stderr.flush()
        
        return Response(
            {"error": "An unexpected error occurred. Please refresh and try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ─── Parts ────────────────────────────────────────────────────────────────────

class PartAdminSerializer(serializers.ModelSerializer):
    module_count = serializers.IntegerField(source='modules.count', read_only=True)

    class Meta:
        model = Part
        fields = '__all__'


class AdminPartViewSet(PM2ErrorLoggingMixin, viewsets.ModelViewSet):
    """CRUD for Parts — staff only."""
    permission_classes = [IsAdminUser]
    pagination_class = None
    queryset = Part.objects.all().order_by('order')
    serializer_class = PartAdminSerializer


# ─── Modules ──────────────────────────────────────────────────────────────────

class ModuleAdminSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source='part.name', read_only=True)
    article_count = serializers.IntegerField(source='articles.count', read_only=True)
    video_count = serializers.IntegerField(source='videos.count', read_only=True)

    class Meta:
        model = Module
        fields = '__all__'


class AdminModuleViewSet(PM2ErrorLoggingMixin, viewsets.ModelViewSet):
    """CRUD for Modules — staff only."""
    permission_classes = [IsAdminUser]
    pagination_class = None
    queryset = Module.objects.all().select_related('part')
    serializer_class = ModuleAdminSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        part_id = self.request.query_params.get('part')
        part_name = self.request.query_params.get('part_name')
        if part_id:
            qs = qs.filter(part_id=part_id)
        if part_name:
            qs = qs.filter(part__name=part_name)
        return qs


# ─── Reading Articles ──────────────────────────────────────────────────────────

class ReadingArticleAdminSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)
    station_count = serializers.IntegerField(source='stations.count', read_only=True)

    class Meta:
        model = ReadingArticle
        fields = '__all__'


class AdminReadingArticleViewSet(PM2ErrorLoggingMixin, viewsets.ModelViewSet):
    """CRUD for ReadingArticles — staff only."""
    permission_classes = [IsAdminUser]
    pagination_class = None
    queryset = ReadingArticle.objects.all().select_related('module', 'module__part')
    serializer_class = ReadingArticleAdminSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        module_id = self.request.query_params.get('module')
        part_id = self.request.query_params.get('part')
        article_type = self.request.query_params.get('type')
        if module_id:
            qs = qs.filter(module_id=module_id)
        if part_id:
            qs = qs.filter(module__part_id=part_id)
        if article_type:
            qs = qs.filter(article_type=article_type)
        return qs


# ─── Stations ─────────────────────────────────────────────────────────────────

class StationAdminSerializer(serializers.ModelSerializer):
    article_title = serializers.CharField(source='article.title', read_only=True)
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Station
        fields = '__all__'

    def get_pdf_url(self, obj):
        request = self.context.get('request')
        if obj.pdf_file and request:
            return request.build_absolute_uri(f'/api/content/stations/{obj.pk}/pdf/')
        return None


class AdminStationViewSet(PM2ErrorLoggingMixin, viewsets.ModelViewSet):
    """CRUD for Stations — staff only. Handles PDF upload."""
    permission_classes = [IsAdminUser]
    pagination_class = None
    queryset = Station.objects.all().select_related('article', 'article__module')
    serializer_class = StationAdminSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        article_id = self.request.query_params.get('article')
        if article_id:
            qs = qs.filter(article_id=article_id)
        return qs


# ─── Videos ───────────────────────────────────────────────────────────────────

class VideoAdminSerializer(serializers.ModelSerializer):
    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = Video
        fields = '__all__'


class AdminVideoViewSet(PM2ErrorLoggingMixin, viewsets.ModelViewSet):
    """CRUD for Videos — staff only."""
    permission_classes = [IsAdminUser]
    pagination_class = None
    queryset = Video.objects.all().select_related('module', 'module__part')
    serializer_class = VideoAdminSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        module_id = self.request.query_params.get('module')
        part_id = self.request.query_params.get('part')
        if module_id:
            qs = qs.filter(module_id=module_id)
        if part_id:
            qs = qs.filter(module__part_id=part_id)
        return qs
