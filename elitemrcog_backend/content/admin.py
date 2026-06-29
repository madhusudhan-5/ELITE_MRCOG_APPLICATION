"""
Admin configuration for content app.
Rich inline editing with Summernote for all long-text fields.
"""

from django.contrib import admin
from django.utils.html import format_html
from django_summernote.admin import SummernoteModelAdmin
from adminsortable2.admin import SortableAdminMixin, SortableTabularInline
from .models import Part, Module, ReadingArticle, Station, Video, UserProgress, Testimonial


class StationInline(SortableTabularInline):
    model = Station
    extra = 1
    fields = ['order', 'title', 'is_free', 'is_active']
    ordering = ['order']


class ArticleInline(SortableTabularInline):
    model = ReadingArticle
    extra = 1
    fields = ['order', 'title', 'article_type', 'thumbnail', 'is_free', 'is_active']
    ordering = ['order']


class VideoInline(SortableTabularInline):
    model = Video
    extra = 1
    fields = ['order', 'title', 'thumbnail', 'embed_url', 'duration_display', 'is_free', 'is_active']
    ordering = ['order']


class ModuleInline(SortableTabularInline):
    model = Module
    extra = 1
    fields = ['order', 'title', 'short_text', 'thumbnail', 'is_active']
    ordering = ['order']


@admin.register(Part)
class PartAdmin(SortableAdminMixin, admin.ModelAdmin):
    list_display = ['name', 'order', 'module_count', 'is_active']
    list_filter = ['is_active']
    inlines = [ModuleInline]

    def module_count(self, obj):
        return obj.modules.count()
    module_count.short_description = 'Modules'


@admin.register(Module)
class ModuleAdmin(SortableAdminMixin, SummernoteModelAdmin):
    summernote_fields = ['long_text']
    list_display = ['title', 'part', 'order', 'article_count', 'video_count', 'is_active']
    list_filter = ['part', 'is_active']
    search_fields = ['title', 'tags']
    inlines = [ArticleInline, VideoInline]

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="height:60px;border-radius:4px"/>', obj.thumbnail.url)
        return '—'
    thumbnail_preview.short_description = 'Preview'

    def article_count(self, obj):
        return obj.articles.count()
    article_count.short_description = 'Articles'

    def video_count(self, obj):
        return obj.videos.count()
    video_count.short_description = 'Videos'


@admin.register(ReadingArticle)
class ReadingArticleAdmin(SortableAdminMixin, SummernoteModelAdmin):
    summernote_fields = ['overview_text']
    list_display = ['title', 'module', 'article_type', 'station_count', 'is_free', 'is_active', 'thumbnail_preview']
    list_filter = ['article_type', 'is_free', 'is_active', 'module__part']
    search_fields = ['title', 'short_description']
    inlines = [StationInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('module', 'title', 'article_type', 'is_free', 'is_active', 'order')
        }),
        ('Media', {
            'fields': ('thumbnail', 'duration_display')
        }),
        ('Content', {
            'fields': ('short_description', 'overview_text'),
            'description': 'Content is rendered in-browser only. No files or downloads.'
        }),
    )

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="height:50px;border-radius:4px"/>', obj.thumbnail.url)
        return '—'
    thumbnail_preview.short_description = 'Thumbnail'

    def station_count(self, obj):
        count = obj.stations.count()
        return format_html('<b>{}</b> stations', count)
    station_count.short_description = 'Stations'


@admin.register(Station)
class StationAdmin(SortableAdminMixin, admin.ModelAdmin):
    list_display = ['title', 'article', 'order', 'is_free', 'is_active', 'page_count']
    list_filter = ['is_free', 'is_active', 'article__module__part']
    search_fields = ['title', 'article__title']
    fieldsets = (
        ('Station Info', {
            'fields': ('article', 'title', 'order', 'is_free', 'is_active')
        }),
        ('PDF Content', {
            'fields': ('pdf_file', 'page_count'),
            'description': '⚠️ Upload the PDF for this station. It will be served securely inline.'
        }),
    )


@admin.register(Video)
class VideoAdmin(SortableAdminMixin, SummernoteModelAdmin):
    summernote_fields = ['long_description']
    list_display = ['title', 'module', 'duration_display', 'is_free', 'is_active', 'thumbnail_preview']
    list_filter = ['is_free', 'is_active', 'module__part']
    search_fields = ['title', 'short_description']
    fieldsets = (
        ('Basic Info', {
            'fields': ('module', 'title', 'is_free', 'is_active', 'order')
        }),
        ('Media', {
            'fields': ('thumbnail', 'embed_url', 'duration_display'),
            'description': '🎬 Use YouTube/Vimeo EMBED URLs only (e.g. https://www.youtube.com/embed/VIDEO_ID). No direct file URLs.'
        }),
        ('Descriptions', {
            'fields': ('short_description', 'long_description')
        }),
    )

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="height:50px;border-radius:4px"/>', obj.thumbnail.url)
        return '—'
    thumbnail_preview.short_description = 'Thumbnail'


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'station', 'progress_percent', 'is_complete', 'last_accessed']
    list_filter = ['station__article__module__part']
    search_fields = ['user__email', 'user__name', 'station__title']
    readonly_fields = ['last_accessed']


@admin.register(Testimonial)
class TestimonialAdmin(SortableAdminMixin, admin.ModelAdmin):
    list_display = ['student_name', 'exam_passed', 'rating', 'is_active', 'order', 'thumbnail_preview']
    list_filter = ['is_active', 'rating']
    search_fields = ['student_name', 'quote', 'exam_passed']

    def thumbnail_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:50px;border-radius:50%;width:50px;object-fit:cover;"/>', obj.photo.url)
        return '—'
    thumbnail_preview.short_description = 'Photo'
