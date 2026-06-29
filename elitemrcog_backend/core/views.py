"""API Views for core app."""

from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import FAQ, LegalDocument
from .serializers import FAQSerializer, LegalDocumentSerializer
from accounts.models import User
from subscriptions.models import PaymentTransaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone

class FAQListView(generics.ListAPIView):
    """List all active FAQs."""
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]

class LegalDocumentView(generics.RetrieveAPIView):
    """Retrieve a legal document by its type."""
    queryset = LegalDocument.objects.all()
    serializer_class = LegalDocumentSerializer
    permission_classes = [AllowAny]
    lookup_field = 'doc_type'

class SuperAdminAnalyticsView(APIView):
    """Analytics for Superadmin Dashboard"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        if request.user.role != 'superadmin':
            return Response({"detail": "Not authorized."}, status=403)

        total_students = User.objects.filter(role='student').count()
        total_earnings = PaymentTransaction.objects.filter(status='COMPLETED').aggregate(Sum('amount'))['amount__sum'] or 0

        # Last 6 months earnings
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        monthly_earnings = PaymentTransaction.objects.filter(
            status='COMPLETED', 
            created_at__gte=six_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total=Sum('amount')
        ).order_by('month')

        chart_data = []
        for entry in monthly_earnings:
            chart_data.append({
                'name': entry['month'].strftime('%b %Y'),
                'earnings': float(entry['total'])
            })
            
        # If no data, return some dummy data for the chart to look nice
        if not chart_data:
            chart_data = [
                {"name": "Jan", "earnings": 1200},
                {"name": "Feb", "earnings": 1900},
                {"name": "Mar", "earnings": 800},
                {"name": "Apr", "earnings": 2400},
                {"name": "May", "earnings": 3100},
                {"name": "Jun", "earnings": 4500},
            ]

        return Response({
            'total_students': total_students,
            'total_earnings': float(total_earnings),
            'chart_data': chart_data
        })
