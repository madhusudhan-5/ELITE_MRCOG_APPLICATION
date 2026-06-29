"""
DRF serializers for content app.
"""

from rest_framework import serializers
from .models import Part, Module, ReadingArticle, Station, Video, UserProgress, UserVideoProgress, Testimonial


class PartSerializer(serializers.ModelSerializer):
    module_count = serializers.IntegerField(source='modules.count', read_only=True)

    class Meta:
        model = Part
        fields = ['id', 'name', 'order', 'description', 'module_count']


class ModuleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list/card views."""
    tags_list = serializers.SerializerMethodField()
    article_count = serializers.IntegerField(source='articles.count', read_only=True)
    video_count = serializers.IntegerField(source='videos.count', read_only=True)
    part_name = serializers.CharField(source='part.name', read_only=True)
    part_id = serializers.IntegerField(source='part.id', read_only=True)

    class Meta:
        model = Module
        fields = [
            'id', 'title', 'category', 'is_free', 'short_text', 'thumbnail',
            'order', 'tags_list', 'article_count', 'video_count', 'part_name', 'part_id'
        ]

    def get_tags_list(self, obj):
        return obj.get_tags_list()


class ModuleDetailSerializer(ModuleListSerializer):
    """Full serializer including long_text (extended description)."""
    class Meta(ModuleListSerializer.Meta):
        fields = ModuleListSerializer.Meta.fields + ['long_text']


class StationListSerializer(serializers.ModelSerializer):
    """Lightweight station info for sidebar list — no PDF URL exposed."""
    user_progress = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()

    class Meta:
        model = Station
        fields = ['id', 'title', 'order', 'is_free', 'page_count', 'user_progress', 'is_locked']

    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = obj.user_progress.filter(user=request.user).first()
            if progress:
                return {
                    'percent': progress.progress_percent,
                    'current_page': progress.current_page,
                    'completed': progress.is_complete,
                }
        return None

    def get_is_locked(self, obj):
        request = self.context.get('request')
        if obj.is_free:
            return False
        if not request or not request.user.is_authenticated:
            return True
        from content.views import user_has_access
        return not user_has_access(request.user, obj)


class StationDetailSerializer(serializers.ModelSerializer):
    """Station metadata only — PDF is served via a separate protected endpoint."""

    class Meta:
        model = Station
        fields = ['id', 'title', 'order', 'is_free', 'page_count']


class ReadingArticleListSerializer(serializers.ModelSerializer):
    """Card-view serializer with short info only."""
    station_count = serializers.IntegerField(source='stations.count', read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    module_category = serializers.CharField(source='module.category', read_only=True)

    class Meta:
        model = ReadingArticle
        fields = [
            'id', 'title', 'article_type', 'thumbnail', 'short_description',
            'duration_display', 'is_free', 'station_count', 'module_title',
            'module_category', 'order'
        ]


class ReadingArticleDetailSerializer(serializers.ModelSerializer):
    """Full article view with stations list."""
    stations = StationListSerializer(many=True, read_only=True)
    module_title = serializers.CharField(source='module.title', read_only=True)
    module_long_text = serializers.CharField(source='module.long_text', read_only=True)
    station_count = serializers.IntegerField(source='stations.count', read_only=True)

    class Meta:
        model = ReadingArticle
        fields = [
            'id', 'title', 'article_type', 'thumbnail', 'short_description',
            'overview_text', 'duration_display', 'is_free', 'stations',
            'station_count', 'module_title', 'module_long_text'
        ]


class VideoListSerializer(serializers.ModelSerializer):
    """Video card serializer — no embed URL exposed in list view."""
    module_title = serializers.CharField(source='module.title', read_only=True)
    module_category = serializers.CharField(source='module.category', read_only=True)

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'thumbnail', 'duration_display',
            'short_description', 'is_free', 'module_title', 'module_category', 'order'
        ]


class VideoDetailSerializer(serializers.ModelSerializer):
    """Full video — embed_url only exposed if user has subscription."""
    module_title = serializers.CharField(source='module.title', read_only=True)
    has_video_file = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            'id', 'title', 'thumbnail', 'embed_url', 'has_video_file', 'duration_display',
            'short_description', 'long_description', 'is_free', 'module_title'
        ]

    def get_has_video_file(self, obj):
        return bool(obj.video_file)


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = ['id', 'station', 'current_page', 'progress_percent', 'completed_at', 'last_accessed']
        read_only_fields = ['id', 'completed_at', 'last_accessed', 'progress_percent']


class UserVideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserVideoProgress
        fields = ['id', 'video', 'current_time', 'progress_percent', 'completed_at', 'last_accessed']
        read_only_fields = ['id', 'completed_at', 'last_accessed', 'progress_percent']


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'student_name', 'exam_passed', 'quote', 'rating', 'photo']
