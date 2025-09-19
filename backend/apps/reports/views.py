import secrets

from rest_framework import filters, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import AIAnalysis, Attachment, Report, ReportAssignment, ReportCategory, ReportRedaction, ReportTemplate
from .serializers import (
    AIAnalysisSerializer,
    AttachmentSerializer,
    ReportAssignmentSerializer,
    ReportCategorySerializer,
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
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [AllowAny]

    # FIX: Override the create method to handle custom submission logic
    def create(self, request, *args, **kwargs):
        # Extract the nested form data from the request payload
        form_data = request.data.get('data', {})
        if not form_data:
            return Response(
                {'error': 'No form data provided in the "data" key.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate a secure, random access key for the user
        access_key = secrets.token_hex(16)

        # Prepare the data for the ReportSerializer
        report_data = {
            'data': form_data,
            'access_key': access_key
            # Note: template is not being set here. You may need to pass
            # the form identifier from the frontend to look up the template.
        }

        serializer = self.get_serializer(data=report_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return only the access key, as expected by the frontend
        headers = self.get_success_headers(serializer.data)
        return Response(
            {'access_key': access_key},
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
# Assignment viewset
# -------------------
class ReportAssignmentViewSet(viewsets.ModelViewSet):
    queryset = ReportAssignment.objects.all()
    serializer_class = ReportAssignmentSerializer
    permission_classes = [AllowAny]


# -------------------
# Redaction viewset
# -------------------
class ReportRedactionViewSet(viewsets.ModelViewSet):
    queryset = ReportRedaction.objects.all()
    serializer_class = ReportRedactionSerializer
    permission_classes = [AllowAny]