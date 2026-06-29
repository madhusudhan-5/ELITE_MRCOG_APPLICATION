"""
API views for content app.
Enforces subscription gating: locked content returns 403 if user
doesn't have the right subscription.

PDFs are served inline only — never as downloadable files.
"""

import mimetypes
from django.http import FileResponse, Http404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from .models import Part, Module, ReadingArticle, Station, Video, UserProgress, UserVideoProgress, Testimonial
from .serializers import (
    PartSerializer, ModuleListSerializer, ModuleDetailSerializer,
    ReadingArticleListSerializer, ReadingArticleDetailSerializer,
    StationListSerializer, StationDetailSerializer,
    VideoListSerializer, VideoDetailSerializer,
    UserProgressSerializer, UserVideoProgressSerializer,
    TestimonialSerializer
)


def user_has_access(user, obj):
    """
    Check if user can access a piece of content.
    Free content: always accessible.
    Paid content: user needs an active subscription matching the content category.
    """
    if getattr(obj, 'is_free', False):
        return True
    if not user.is_authenticated:
        return False

    from subscriptions.models import UserSubscription

    # Determine content type for category-based gating
    content_type = None
    if hasattr(obj, 'embed_url'):
        content_type = 'video'
    elif hasattr(obj, 'pdf_file') or hasattr(obj, 'article'):
        content_type = 'reading'

    subs = user.subscriptions.filter(status='active', expires_at__gt=timezone.now())

    # Full access subscription unlocks everything
    if subs.filter(plan__plan_category='full').exists():
        return True

    # Category-matched subscription
    if content_type and subs.filter(plan__plan_category=content_type).exists():
        return True

    return False


# ─── Parts ────────────────────────────────────────────────────────────────────

class PartListView(generics.ListAPIView):
    """List all active MRCOG parts (Part 1, Part 2, Part 3)."""
    queryset = Part.objects.filter(is_active=True)
    serializer_class = PartSerializer
    permission_classes = [AllowAny]


# ─── Modules ──────────────────────────────────────────────────────────────────

class ModuleListView(generics.ListAPIView):
    """
    List modules.
    Filter: ?part=<part_id>  ?category=easy_read|course_material
    """
    serializer_class = ModuleListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Module.objects.filter(is_active=True).select_related('part')
        part_id = self.request.query_params.get('part')
        category = self.request.query_params.get('category')
        if part_id:
            qs = qs.filter(part_id=part_id)
        if category:
            qs = qs.filter(category=category)
        return qs


class ModuleDetailView(generics.RetrieveAPIView):
    """Get full module detail including long_text (extended description)."""
    queryset = Module.objects.filter(is_active=True)
    serializer_class = ModuleDetailSerializer
    permission_classes = [AllowAny]


# ─── Reading Library ──────────────────────────────────────────────────────────

class ReadingArticleListView(generics.ListAPIView):
    """
    List reading articles.
    Filter: ?type=easy_read|course_material  ?module=<id>  ?part=<id>
    """
    serializer_class = ReadingArticleListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = ReadingArticle.objects.filter(is_active=True).select_related('module', 'module__part')
        article_type = self.request.query_params.get('type')
        module_id = self.request.query_params.get('module')
        part_id = self.request.query_params.get('part')

        if article_type:
            qs = qs.filter(article_type=article_type)
        if module_id:
            qs = qs.filter(module_id=module_id)
        if part_id:
            qs = qs.filter(module__part_id=part_id)
        return qs


class ReadingArticleDetailView(generics.RetrieveAPIView):
    """Get article detail with stations list (with lock status per station)."""
    queryset = ReadingArticle.objects.filter(is_active=True)
    serializer_class = ReadingArticleDetailSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


# ─── Station PDF View (Protected) ─────────────────────────────────────────────

class StationPdfView(APIView):
    """
    Serve a station's PDF inline in the browser.
    - Free stations: accessible to all authenticated users.
    - Paid stations: require an active subscription.
    - PDF is streamed inline — Content-Disposition: inline (not attachment, so not downloadable via browser prompt).
    - The actual media URL is NEVER exposed to the frontend.
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            station = Station.objects.get(pk=pk, is_active=True)
        except Station.DoesNotExist:
            raise Http404

        if not user_has_access(request.user, station):
            return Response(
                {'error': 'Subscription required to access this content.', 'locked': True},
                status=status.HTTP_403_FORBIDDEN
            )

        if not station.pdf_file:
            return Response({'error': 'No PDF available for this station.'}, status=status.HTTP_404_NOT_FOUND)

        # Update/create progress record on open
        if request.user.is_authenticated:
            UserProgress.objects.get_or_create(
                user=request.user,
                station=station,
                defaults={'progress_percent': 0, 'current_page': 1}
            )

        # Stream the PDF inline — browser will render it, not prompt download
        response = FileResponse(
            station.pdf_file.open('rb'),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'inline; filename="station_{station.id}.pdf"'
        # Prevent caching of protected content
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        response['X-Content-Type-Options'] = 'nosniff'
        return response


# ─── Video File View (Protected Stream) ───────────────────────────────────────

class VideoFileView(APIView):
    """
    Serve a video file securely.
    - Free videos: accessible to all authenticated users.
    - Paid videos: require an active subscription.
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        try:
            video = Video.objects.get(pk=pk, is_active=True)
        except Video.DoesNotExist:
            raise Http404

        if not user_has_access(request.user, video):
            return Response(
                {'error': 'Subscription required to access this content.', 'locked': True},
                status=status.HTTP_403_FORBIDDEN
            )

        if not video.video_file:
            return Response({'error': 'No file available for this video.'}, status=status.HTTP_404_NOT_FOUND)

        # Update/create progress record on open
        if request.user.is_authenticated:
            UserVideoProgress.objects.get_or_create(
                user=request.user,
                video=video,
                defaults={'progress_percent': 0, 'current_time': 0}
            )

        # Stream the video inline
        response = FileResponse(
            video.video_file.open('rb'),
            content_type='video/mp4'
        )
        response['Content-Disposition'] = f'inline; filename="video_{video.id}.mp4"'
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate'
        # FileResponse in newer Django natively supports range requests
        return response


# ─── Video Library ────────────────────────────────────────────────────────────

class VideoListView(generics.ListAPIView):
    """
    List videos. Filter: ?module=<id>  ?part=<id>  ?category=<category>
    embed_url is NOT included in list view.
    """
    serializer_class = VideoListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Video.objects.filter(is_active=True).select_related('module', 'module__part')
        module_id = self.request.query_params.get('module')
        part_id = self.request.query_params.get('part')
        category = self.request.query_params.get('category')
        if module_id:
            qs = qs.filter(module_id=module_id)
        if part_id:
            qs = qs.filter(module__part_id=part_id)
        if category:
            qs = qs.filter(module__category=category)
        return qs


class VideoDetailView(generics.RetrieveAPIView):
    """
    Get video detail with embed_url.
    Gated: free videos accessible, paid require subscription.
    embed_url is a YouTube/Vimeo iframe URL — NOT a downloadable file.
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Video.objects.filter(is_active=True)

    def retrieve(self, request, *args, **kwargs):
        video = self.get_object()
        if not user_has_access(request.user, video):
            return Response(
                {'error': 'Subscription required to watch this video.', 'locked': True},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = VideoDetailSerializer(video)
        return Response(serializer.data)


# ─── User Progress ────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_progress_view(request):
    """Get all progress records for the current user."""
    progress = UserProgress.objects.filter(user=request.user).select_related('station')
    serializer = UserProgressSerializer(progress, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_progress_view(request):
    """
    Update reading progress for a station.
    Accepts: { station: <id>, current_page: <int> }
    Auto-calculates progress_percent from current_page / page_count.
    """
    station_id = request.data.get('station')
    current_page = request.data.get('current_page', 1)

    try:
        station = Station.objects.get(pk=station_id, is_active=True)
    except Station.DoesNotExist:
        return Response({'error': 'Station not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Verify access
    if not user_has_access(request.user, station):
        return Response({'error': 'Subscription required.'}, status=status.HTTP_403_FORBIDDEN)

    # Calculate percentage
    page_count = station.page_count or 1
    current_page = max(1, min(int(current_page), page_count))
    percent = round((current_page / page_count) * 100)

    progress, created = UserProgress.objects.get_or_create(
        user=request.user, station=station,
        defaults={'current_page': current_page, 'progress_percent': percent}
    )
    if not created:
        progress.current_page = current_page
        progress.progress_percent = percent
        if percent >= 100 and not progress.completed_at:
            progress.completed_at = timezone.now()
        progress.save()

    serializer = UserProgressSerializer(progress)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def video_progress_view(request):
    """Get all video progress records for the current user."""
    progress = UserVideoProgress.objects.filter(user=request.user).select_related('video')
    serializer = UserVideoProgressSerializer(progress, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_video_progress_view(request):
    """
    Update video progress for a video.
    Accepts: { video: <id>, current_time: <float>, progress_percent: <int> }
    """
    video_id = request.data.get('video')
    current_time = request.data.get('current_time', 0.0)
    percent = request.data.get('progress_percent', 0)

    try:
        video = Video.objects.get(pk=video_id, is_active=True)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Verify access
    if not user_has_access(request.user, video):
        return Response({'error': 'Subscription required.'}, status=status.HTTP_403_FORBIDDEN)

    percent = max(0, min(int(percent), 100))
    current_time = float(current_time)

    progress, created = UserVideoProgress.objects.get_or_create(
        user=request.user, video=video,
        defaults={'current_time': current_time, 'progress_percent': percent}
    )
    if not created:
        progress.current_time = current_time
        # Only update percent if it's strictly greater (so we don't lose completion status)
        if percent > progress.progress_percent:
            progress.progress_percent = percent
        if progress.progress_percent >= 100 and not progress.completed_at:
            progress.completed_at = timezone.now()
        progress.save()

    serializer = UserVideoProgressSerializer(progress)
    return Response(serializer.data)


# ─── Dashboard Summary (used by Home page) ────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_summary_view(request):
    """
    Returns a featured slice of Modules for the Home dashboard.
    Filter by ?part=<part_id>  ?category=<category>
    """
    part_id = request.query_params.get('part')
    category = request.query_params.get('category')

    qs = Module.objects.filter(is_active=True).select_related('part')
    if part_id:
        qs = qs.filter(part_id=part_id)

    reading_qs = qs.filter(articles__isnull=False).distinct()
    video_qs = qs.filter(videos__isnull=False).distinct()

    if category:
        reading_qs = reading_qs.filter(category=category)
        video_qs = video_qs.filter(category=category)

    return Response({
        'reading_modules': ModuleListSerializer(reading_qs[:8], many=True, context={'request': request}).data,
        'video_modules': ModuleListSerializer(video_qs[:8], many=True, context={'request': request}).data,
    })


# ─── Testimonials ─────────────────────────────────────────────────────────────

class TestimonialListView(generics.ListAPIView):
    """List all active testimonials."""
    queryset = Testimonial.objects.filter(is_active=True)
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
