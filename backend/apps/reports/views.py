from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

from .models import AIAnalysis, Attachment, Report, ReportCategory, ReportRedaction, ReportTemplate
from .serializers import (
    AIAnalysisSerializer,
    AttachmentSerializer,
    ReportCategorySerializer,
    ReportListSerializer,
    ReportRedactionSerializer,
    ReportSerializer,
    ReportTemplateSerializer,
)


# -------------------
# Category viewset
# -------------------
class ReportCategoryViewSet(viewsets.ModelViewSet):
    queryset = ReportCategory.objects.all()
    serializer_class = ReportCategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "key"]


# -------------------
# Template viewset
# -------------------
class ReportTemplateViewSet(viewsets.ModelViewSet):
    queryset = ReportTemplate.objects.all()
    serializer_class = ReportTemplateSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "key"]

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get("category_id")
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


# -------------------
# Report viewset
# -------------------
class ReportViewSet(viewsets.ModelViewSet):
    """Viewset for managing reports."""
    queryset = Report.objects.prefetch_related("assignments__assignee")
    serializer_class = ReportSerializer

    def get_serializer_class(self):
        if self.action == "list":
            return ReportListSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        """Filter reports based on assignments."""
        queryset = super().get_queryset()
        if self.request.user.is_superuser:
            return queryset
        if self.request.user.is_authenticated:
            queryset = queryset.filter(assignments__assignee=self.request.user)
        return queryset.none()

    def get_permissions(self):
        """Customize permissions based on action."""
        self.permission_classes = [AllowAny]
        # Should be edited later for more security
        if self.action == "create":
            self.permission_classes = [AllowAny]
        elif self.action == "list" or self.action == "retrieve" or self.action == "partial_update":
            self.permission_classes = [IsAuthenticated]
        elif self.action == "destroy" or self.action == "update":
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    @method_decorator(cache_page(60 * 10, key_prefix='reports_list'))
    @method_decorator(vary_on_headers("Authorization"))
    # TODO: Add proper invalidating of cache
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


# -------------------
# Attachment viewset
# -------------------
class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [AllowAny]


# -------------------
# AI Analysis viewset
# -------------------
class AIAnalysisViewSet(viewsets.ModelViewSet):
    queryset = AIAnalysis.objects.all()
    serializer_class = AIAnalysisSerializer
    permission_classes = [AllowAny]


# -------------------
# Redaction viewset
# -------------------
class ReportRedactionViewSet(viewsets.ModelViewSet):
    queryset = ReportRedaction.objects.all()
    serializer_class = ReportRedactionSerializer
    permission_classes = [AllowAny]
