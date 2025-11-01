import base64
import json
import secrets
from binascii import Error as BinasciiError
from typing import Any
from rest_framework.exceptions import NotFound
from django.conf import settings
from django.db import transaction
from django.db.models import Count, Max, Prefetch
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from nacl.exceptions import CryptoError
from nacl.public import Box, PrivateKey, PublicKey
from rest_framework import filters, status, viewsets, mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .filters import ReportFilter
from .models import (
    AIAnalysis,
    Attachment,
    InvestigatorNote,
    Report,
    ReportAssignment,
    ReportCategory,
    ReportRedaction,
    ReportStatus,
    ReportTemplate,
)
from .serializers import (
    AIAnalysisSerializer,
    AttachmentSerializer,
    CaseworkerReportSerializer,
    EncryptedReportCreationSerializer,
    InvestigatorNoteSerializer,
    ReportAssignmentSerializer,
    ReportCategorySerializer,
    ReportCreationResponseSerializer,
    ReportListSerializer,
    ReportRedactionSerializer,
    ReportSerializer,
    ReportTemplateSerializer, ReportStatusSerializer,
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
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ["created_at", "updated_at", "priority", "last_access_date"]
    search_fields = ["id", "label"]

    def get_serializer_class(self):
        """
        Dynamically determine the serializer class based on the action and user type.
        - Caseworkers get a special serializer with their re-encrypted key envelope.
        - Admins get different serializers for list vs. other actions.
        - The 'create' and 'assign' actions have their own specific serializers.
        """
        user = self.request.user
        is_caseworker_only = user.is_authenticated and user.is_caseworker and not user.is_superuser

        if is_caseworker_only:
            if self.action == "list":
                return ReportListSerializer
            return CaseworkerReportSerializer

        # Default behavior for admins and other user types
        if self.action == "list":
            return ReportListSerializer
        if self.action == "create":
            return EncryptedReportCreationSerializer
        if self.action == "assign":
            return ReportAssignmentSerializer

        return super().get_serializer_class()

    def get_queryset(self):
        """
        Annotates the queryset with required fields for the list view and filters
        reports based on the user's role and assignments.
        """
        user = self.request.user

        # Base queryset with annotations for all users
        base_qs = Report.objects.select_related("analysis").annotate(
            last_access_date=Max('assignments__last_access'),
            attachment_count=Count('attachments', distinct=True)
        )

        if not user.is_authenticated:
            return base_qs.none()

        prefetch_assignments = Prefetch(
            "assignments", queryset=ReportAssignment.objects.select_related("assignee")
        )
        prefetch_notes = Prefetch(
            "investigator_notes", queryset=InvestigatorNote.objects.select_related("author")
        )

        if user.is_superuser:
            return base_qs.prefetch_related(prefetch_assignments, prefetch_notes)

        if user.is_caseworker:
            return base_qs.filter(assignments__assignee=user).prefetch_related(prefetch_assignments, prefetch_notes)

        return base_qs.none()

    def get_permissions(self):
        """Customize permissions based on action."""
        permission_map: dict[str, list] = {
            "create": [AllowAny],
            "list": [IsAuthenticated],
            "retrieve": [IsAuthenticated],
            "partial_update": [IsAuthenticated],
            "update": [IsAdminUser],
            "destroy": [IsAdminUser],
            "assign": [IsAdminUser],
        }
        self.permission_classes = permission_map.get(self.action, [AllowAny])
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        Creates a new, end-to-end encrypted report from a multipart/form-data request.
        """
        payload_str = request.data.get("payload")
        if not payload_str:
            raise ParseError("The 'payload' field containing cryptographic metadata is required.")

        try:
            payload_data = json.loads(payload_str)
        except json.JSONDecodeError:
            raise ParseError("Invalid JSON format for 'payload'.")

        serializer = self.get_serializer(data=payload_data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        attachments_metadata = validated_data.pop("attachments", [])

        with transaction.atomic():
            report = Report.objects.create(
                access_key=secrets.token_hex(16),
                **validated_data,
            )

            for meta in attachments_metadata:
                attachment_id = meta.pop("id")
                uploaded_file = request.FILES.get(attachment_id)
                if not uploaded_file:
                    raise ParseError(f"Attachment with ID '{attachment_id}' not found in the uploaded files.")

                Attachment.objects.create(
                    report=report,
                    file=uploaded_file,
                    **meta,
                )

        response_serializer = ReportCreationResponseSerializer(report)
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieves a report and updates its status and access time if it's the first access.
        Also sets the opened_at timestamp when status changes from NEW to OPENED.
        """
        report = self.get_object()
        user = request.user

        if user.is_authenticated and (user.is_caseworker or user.is_superuser):
            with transaction.atomic():
                if user.is_caseworker:
                    assignment = ReportAssignment.objects.filter(report=report, assignee=user).first()
                    if assignment:
                        assignment.last_access = timezone.now()
                        assignment.save(update_fields=['last_access'])

                if report.status == ReportStatus.NEW:
                    report.status = ReportStatus.OPENED
                    report.opened_at = timezone.now()
                    report.save(update_fields=['status', 'opened_at'])

        serializer = self.get_serializer(report)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """
        Handles partial updates to a report, including setting timeline timestamps
        when status changes to CLOSED.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Check if status is being changed to CLOSED
        new_status = serializer.validated_data.get('status')
        if new_status == ReportStatus.CLOSED and instance.status != ReportStatus.CLOSED:
            # Set closed_at timestamp when status changes to CLOSED
            serializer.validated_data['closed_at'] = timezone.now()

        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="assign")
    def assign(self, request, pk=None):
        """
        Assigns a report to a caseworker, re-encrypting the report and attachment keys for them.
        """
        report = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assignee = serializer.validated_data["assignee"]

        if not assignee.is_caseworker:
            raise ValidationError({"assignee_id": "Target user must be a caseworker."})
        if not assignee.public_key_bundle or "identity_key_x25519" not in assignee.public_key_bundle:
            raise ValidationError({"assignee_id": "Target caseworker does not have a valid public key bundle."})

        try:
            admin_b64_key = getattr(settings, "ADMIN_PRIVATE_KEY", None)
            if not admin_b64_key:
                raise ValueError("ADMIN_PRIVATE_KEY is not set.")
            admin_pk_bytes = base64.b64decode(admin_b64_key)
            admin_private_key = PrivateKey(admin_pk_bytes)
        except (BinasciiError, ValueError):
            raise ValidationError("Server configuration error: Could not load the admin private key.")

        with transaction.atomic():
            try:
                report_envelope = report.key_envelope
                reporter_ephem_pk_b64 = report_envelope["reporter_ephemeral_public_key"]
                wrapped_report_key_b64 = report_envelope["wrapped_key"]
                reporter_ephem_pk = PublicKey(base64.b64decode(reporter_ephem_pk_b64))
                reporter_to_admin_box = Box(admin_private_key, reporter_ephem_pk)
                k_report = reporter_to_admin_box.decrypt(base64.b64decode(wrapped_report_key_b64))

                key_bundle: dict[str, Any] = {
                    "report_key": base64.b64encode(k_report).decode("utf-8"),
                    "attachment_keys": {},
                }

                for attachment in report.attachments.all():
                    if not attachment.key_envelope:
                        continue
                    wrapped_attach_key_b64 = attachment.key_envelope["wrapped_key"]
                    k_attach = reporter_to_admin_box.decrypt(base64.b64decode(wrapped_attach_key_b64))
                    key_bundle["attachment_keys"][str(attachment.id)] = base64.b64encode(k_attach).decode("utf-8")

                if not key_bundle["attachment_keys"]:
                    del key_bundle["attachment_keys"]
            except KeyError as e:
                raise ValidationError(f"The key envelope is missing a required field: {e}")
            except (BinasciiError, CryptoError):
                raise ValidationError("Failed to decrypt original report keys. The key envelope may be corrupt.")

            try:
                caseworker_pk_b64 = assignee.public_key_bundle["identity_key_x25519"]
                caseworker_pk = PublicKey(base64.b64decode(caseworker_pk_b64))
                admin_ephemeral_private_key = PrivateKey.generate()
                admin_to_caseworker_box = Box(admin_ephemeral_private_key, caseworker_pk)
                key_bundle_json = json.dumps(key_bundle).encode("utf-8")
                encrypted_bundle = admin_to_caseworker_box.encrypt(key_bundle_json)

                new_key_envelope = {
                    "sender_ephemeral_public_key": base64.b64encode(bytes(admin_ephemeral_private_key.public_key)).decode("utf-8"),
                    "wrapped_key_bundle": base64.b64encode(encrypted_bundle).decode("utf-8"),
                    "scheme": "x25519-xchacha20poly1305",
                }
            except (KeyError, BinasciiError, CryptoError):
                raise ValidationError("Failed to re-encrypt keys for caseworker. Their public key may be invalid.")

            assignment, created = ReportAssignment.objects.update_or_create(
                report=report,
                assignee=assignee,
                defaults={"key_envelope": new_key_envelope},
            )

            # Set assigned_at timestamp on the report if this is the first assignment
            if report.assigned_at is None:
                report.assigned_at = timezone.now()
                report.save(update_fields=['assigned_at'])

        return Response(
            {"status": "Report assigned successfully", "assignment_id": assignment.pk},
            status=status.HTTP_201_CREATED,
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



# -------------------
# Follow up viewset
# -------------------
class FollowUpViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    A viewset for anonymous users to retrieve the status of a report
    using the unique 'access_key' (reference key) instead of the primary key (ID).

    It uses the ReportStatusSerializer to return only essential, anonymous status data.
    """
    # Pre-fetch 'analysis' and 'investigator_notes' relationships for efficiency
    queryset = Report.objects.select_related('analysis').prefetch_related('investigator_notes__author').all()
    serializer_class = ReportStatusSerializer
    permission_classes = [AllowAny]  # Must be publicly accessible
    lookup_field = 'access_key'      # Instructs DRF to look for 'access_key' in the URL

    def get_object(self):
        """
        Overrides the default get_object behavior to retrieve the report
        based on the 'access_key' provided in the URL.
        """
        # The lookup value is retrieved from the URL kwargs using the lookup_field name
        lookup_value = self.kwargs.get(self.lookup_field)

        if not lookup_value:
            raise NotFound(detail="Access key missing.")

        try:
            # Perform the lookup against the access_key field
            obj = self.get_queryset().get(**{self.lookup_field: lookup_value})
        except Report.DoesNotExist:
            # Crucially, raise a generic NotFound exception to prevent attackers
            # from enumerating valid access keys.
            raise NotFound(detail="Report not found.")

        return obj


# -------------------
# Investigator Note viewset
# -------------------
class InvestigatorNoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing investigator notes on reports.
    Only authenticated caseworkers can create, view, update, and delete notes.
    """
    queryset = InvestigatorNote.objects.all()
    serializer_class = InvestigatorNoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["report", "author", "is_internal"]
    ordering_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """
        Filter notes based on user permissions:
        - Caseworkers can only see notes for reports assigned to them
        - Admins can see all notes
        """
        user = self.request.user
        base_qs = InvestigatorNote.objects.select_related("report", "author")

        if user.is_superuser:
            return base_qs

        if user.is_caseworker:
            # Only show notes for reports assigned to this caseworker
            return base_qs.filter(report__assignments__assignee=user)

        return base_qs.none()

    def perform_create(self, serializer):
        """
        Automatically set the author to the current user when creating a note.
        Also validate that the user has access to the report.
        """
        user = self.request.user
        report = serializer.validated_data.get("report")

        # Verify the user has access to this report
        if not user.is_superuser:
            if user.is_caseworker:
                if not ReportAssignment.objects.filter(report=report, assignee=user).exists():
                    raise ValidationError({"report": "You do not have access to this report."})
            else:
                raise ValidationError({"report": "You do not have permission to add notes."})

        serializer.save(author=user)
