from django.urls import path
from . import views

urlpatterns = [
    path('faqs/', views.FAQListView.as_view(), name='faq-list'),
    path('legal/<str:doc_type>/', views.LegalDocumentView.as_view(), name='legal-doc'),
    path('admin/analytics/', views.SuperAdminAnalyticsView.as_view(), name='admin-analytics'),
]
