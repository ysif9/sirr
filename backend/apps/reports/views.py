from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework import filters, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .filters import ReportFilter
from .models import AIAnalysis, Attachment, Report, ReportAssignment, ReportCategory, ReportRedaction, ReportTemplate
from .serializers import (
    AIAnalysisSerializer,
    AttachmentSerializer,
    EncryptedReportSubmissionSerializer,
    ReportAssignmentSerializer,
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
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    filterset_class = ReportFilter
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ["created_at", "updated_at", "score", "priority"]

    def get_serializer_class(self):
        """Use a different serializer for list view."""
        if self.action == "list":
            return ReportListSerializer
        if self.action == "create":
            return EncryptedReportSubmissionSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        """Filter reports based on assignments."""
        queryset = Report.objects.prefetch_related(
            Prefetch("assignments", queryset=ReportAssignment.objects.select_related("assignee"))
        )
        if self.request.user.is_superuser:
            return queryset

        if self.request.user.is_authenticated:
            queryset = queryset.filter(assignments__assignee=self.request.user)
            return queryset

        return queryset.none()

    def get_permissions(self):
        """Customize permissions based on action."""
        permission_map: dict[str, list] = {
            "create": [AllowAny],
            "list": [IsAuthenticated],
            "retrieve": [IsAuthenticated],
            "partial_update": [IsAuthenticated],
            "update": [IsAdminUser],
            "destroy": [IsAdminUser],
        }
        self.permission_classes = permission_map.get(self.action, [AllowAny])
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        Creates a new encrypted report from an E2EE payload.

        This endpoint accepts the encrypted report body, nonce, key envelope,
        and recipient ID. Upon successful validation and creation, it returns
        only the `access_key` to the reporter to maintain anonymity.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save()

        headers = self.get_success_headers(serializer.data)
        return Response(
            {"access_key": report.access_key},
            status=status.HTTP_201_CREATED,
            headers=headers
        )

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