import base64
import json
import secrets
from binascii import Error as BinasciiError
from typing import Any

from django.conf import settings
from django.db import transaction
from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from nacl.exceptions import CryptoError
from nacl.public import Box, PrivateKey, PublicKey
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ParseError, ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .filters import ReportFilter
from .models import AIAnalysis, Attachment, Report, ReportAssignment, ReportCategory, ReportRedaction, ReportTemplate
from .serializers import (
    AIAnalysisSerializer,
    AttachmentSerializer,
    CaseworkerReportSerializer,
    EncryptedReportCreationSerializer,
    ReportAssignmentSerializer,
    ReportCategorySerializer,
    ReportCreationResponseSerializer,
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
        """
        Dynamically determine the serializer class based on the action and user type.
        - Caseworkers get a special serializer with their re-encrypted key envelope.
        - Admins get different serializers for list vs. other actions.
        - The 'create' and 'assign' actions have their own specific serializers.
        """
        user = self.request.user
        is_caseworker_only = user.is_authenticated and user.is_caseworker and not user.is_superuser

        # If the user is a caseworker (but not an admin), always use the serializer
        # that provides the correct key envelope for them.
        if is_caseworker_only:
            return CaseworkerReportSerializer

        # Default behavior for admins and other user types
        if self.action == "list":
            return ReportListSerializer
        if self.action == "create":
            return EncryptedReportCreationSerializer
        if self.action == "assign":
            return ReportAssignmentSerializer

        # For 'retrieve', 'update', etc., for an admin
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
            "assign": [IsAdminUser],
        }
        self.permission_classes = permission_map.get(self.action, [AllowAny])
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        Creates a new, end-to-end encrypted report from a multipart/form-data request.

        This endpoint expects:
        - `payload`: A JSON string with cryptographic metadata for the report and its attachments.
        - File uploads: Encrypted file blobs, with form field names matching the `id`
          specified in the attachment metadata within the payload.
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
            # Create the main Report record with its encrypted body
            report = Report.objects.create(
                access_key=secrets.token_hex(16),
                **validated_data,
            )

            # Create Attachment records for each uploaded file
            for meta in attachments_metadata:
                attachment_id = meta.pop("id")
                uploaded_file = request.FILES.get(attachment_id)
                if not uploaded_file:
                    raise ParseError(f"Attachment with ID '{attachment_id}' not found in the uploaded files.")

                Attachment.objects.create(
                    report=report,
                    file=uploaded_file,
                    **meta,  # Unpack nonce, key_envelope, checksum
                )

        response_serializer = ReportCreationResponseSerializer(report)
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=True, methods=["post"], url_path="assign")
    def assign(self, request, pk=None):
        """
        Assigns a report to a caseworker, re-encrypting the report and attachment keys for them.
        """
        report = self.get_object()

        # --- Step A (Validation) ---
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
            # --- Step B (Decryption of All Keys) ---
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

            # --- Step C (Key Bundling & Re-Encryption) ---
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

            # --- Step D (Database Transaction) ---
            assignment, _ = ReportAssignment.objects.update_or_create(
                report=report,
                assignee=assignee,
                defaults={"key_envelope": new_key_envelope},
            )

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
