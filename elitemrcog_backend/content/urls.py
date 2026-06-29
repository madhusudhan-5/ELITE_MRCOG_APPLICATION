"""URL routing for content app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import admin_views

router = DefaultRouter()
router.register(r'manage/parts', admin_views.AdminPartViewSet, basename='admin-parts')
router.register(r'manage/modules', admin_views.AdminModuleViewSet, basename='admin-modules')
router.register(r'manage/articles', admin_views.AdminReadingArticleViewSet, basename='admin-articles')
router.register(r'manage/stations', admin_views.AdminStationViewSet, basename='admin-stations')
router.register(r'manage/videos', admin_views.AdminVideoViewSet, basename='admin-videos')

urlpatterns = [
    # Dashboard home summary
    path('dashboard/', views.dashboard_summary_view, name='dashboard-summary'),

    # Parts & Modules
    path('parts/', views.PartListView.as_view(), name='part-list'),
    path('modules/', views.ModuleListView.as_view(), name='module-list'),
    path('modules/<int:pk>/', views.ModuleDetailView.as_view(), name='module-detail'),

    # Reading Library
    path('reading/', views.ReadingArticleListView.as_view(), name='reading-list'),
    path('reading/<int:pk>/', views.ReadingArticleDetailView.as_view(), name='reading-detail'),

    # Station PDF — served inline, protected endpoint (no direct media URL)
    path('stations/<int:pk>/pdf/', views.StationPdfView.as_view(), name='station-pdf'),

    # Video Library
    path('videos/', views.VideoListView.as_view(), name='video-list'),
    path('videos/<int:pk>/', views.VideoDetailView.as_view(), name='video-detail'),
    path('videos/<int:pk>/stream/', views.VideoFileView.as_view(), name='video-stream'),

    # User Progress
    path('progress/', views.user_progress_view, name='user-progress'),
    path('progress/update/', views.update_progress_view, name='progress-update'),
    path('video-progress/', views.video_progress_view, name='video-progress'),
    path('video-progress/update/', views.update_video_progress_view, name='video-progress-update'),

    # Testimonials
    path('testimonials/', views.TestimonialListView.as_view(), name='testimonial-list'),

    # Admin Management Endpoints
    path('', include(router.urls)),
]
