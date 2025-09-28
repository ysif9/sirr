import base64
from binascii import Error as BinasciiError

from django.db.models import Max
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.users.models import User

from .models import AIAnalysis, Attachment, Report, ReportCategory, ReportRedaction, ReportTemplate


# -------------------
# Helper Functions
# -------------------
def b64decode_field(value: str, expected_length: int | None = None) -> bytes:
    """Decodes a Base64 string and validates its length."""
    try:
        decoded = base64.b64decode(value, validate=True)
    except BinasciiError:
        raise ValidationError(_("Invalid Base64 encoding."))

    if expected_length and len(decoded) != expected_length:
        raise ValidationError(
            _("Decoded value must be %(expected_length)s bytes long, but received %(received_length)s.")
            % {'expected_length': expected_length, 'received_length': len(decoded)}
        )
    return decoded


# -------------------
# Category serializers
# -------------------
class ReportCategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = ReportCategory
        fields = ["id", "key", "title", "subtitle", "sort_order", "parent_category", "subcategories", "created_at",
                  "updated_at"]
        read_only_fields = ["id", "key", "sort_order", "created_at", "updated_at"]

    def get_subcategories(self, obj):
        return ReportCategorySerializer(obj.subcategories.all(), many=True).data


# -------------------
# Template serializers
# -------------------
class ReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTemplate
        fields = ["id", "category", "key", "title", "definition", "created_at", "updated_at"]
        read_only_fields = ["id", "key", "created_at", "updated_at"]


# -------------------
# Attachment serializers
# -------------------
class AttachmentSerializer(serializers.ModelSerializer):
    """
    Serializer for attachments. Includes a method to correctly
    Base64-encode the binary nonce for client-side decryption.
    """
    nonce = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ["id", "report", "file", "key_envelope", "nonce", "description", "checksum", "mime_type",
                  "file_extension"]
        read_only_fields = ["id", "mime_type", "file_extension"]

    def get_nonce(self, obj: Attachment) -> str | None:
        """Base64-encode the binary nonce for JSON serialization."""
        if obj.nonce:
            return base64.b64encode(obj.nonce).decode('utf-8')
        return None

# -------------------
# Report serializers
# -------------------
class EncryptedAttachmentMetadataSerializer(serializers.Serializer):
    """
    Serializer for the metadata of a single encrypted attachment.
    This is nested within the main encrypted report payload.
    """
    id = serializers.CharField(write_only=True, help_text="Client-side temporary ID to match with file blob.")
    nonce = serializers.CharField(write_only=True, help_text="Base64-encoded 24-byte XChaCha20 nonce.")
    key_envelope = serializers.JSONField(help_text="The encrypted attachment key (K_attach_i).")
    checksum = serializers.CharField(
        max_length=64,
        required=False,
        allow_blank=True,
        help_text="The SHA-256 hash of the encrypted file content."
    )

    def validate_nonce(self, value: str) -> bytes:
        return b64decode_field(value, expected_length=24)


class EncryptedReportCreationSerializer(serializers.Serializer):
    """
    Validates the main JSON payload of an encrypted report submission.
    This payload contains cryptographic metadata for the report body and all attachments.
    It's designed to be used with a multipart/form-data request.
    """
    encrypted_body = serializers.CharField(write_only=True)
    body_nonce = serializers.CharField(write_only=True)
    key_envelope = serializers.JSONField()
    associated_data = serializers.JSONField(required=False, default=dict)
    attachments = EncryptedAttachmentMetadataSerializer(many=True, required=False, default=[])

    def validate_encrypted_body(self, value: str) -> bytes:
        return b64decode_field(value)

    def validate_body_nonce(self, value: str) -> bytes:
        return b64decode_field(value, expected_length=24)


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id", "template", "access_key", "encrypted_body", "key_envelope",
            "body_nonce", "associated_data", "status", "score", "priority",
            "last_access_by_reporter", "expires_at", "created_at",
            "important", "label",
        ]
        read_only_fields = [
            "id", "access_key", "score", "last_access_by_reporter",
            "expires_at", "created_at", "updated_at",
        ]


class CaseworkerReportSerializer(ReportSerializer):
    """
    A specialized serializer for caseworkers that provides the re-encrypted
    key envelope from their specific report assignment and includes attachment metadata.
    """
    key_envelope = serializers.SerializerMethodField()
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta(ReportSerializer.Meta):
        # Explicitly inherit fields and add 'attachments' for the detail view.
        fields = ReportSerializer.Meta.fields + ["attachments"]
        read_only_fields = ReportSerializer.Meta.read_only_fields

    def get_key_envelope(self, obj: Report) -> dict | None:
        """
        Retrieves the correct key envelope from the ReportAssignment record
        for the currently authenticated caseworker.
        """
        request = self.context.get("request")
        if not request or not hasattr(request, "user"):
            return None
        # The view's queryset should prefetch 'assignments' for efficiency.
        for assignment in obj.assignments.all():
            if assignment.assignee_id == request.user.id:
                return assignment.key_envelope
        return None


class ReportListSerializer(serializers.ModelSerializer):
    """
    Serializer for the list view of reports, providing the fields
    required by the investigator portal's main table.
    """
    # These fields are added via annotations in the viewset's get_queryset
    last_access_date = serializers.DateTimeField(read_only=True)
    attachment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Report
        fields = [
            "id",
            "important",
            "label",
            "status",
            "created_at",  # Submission Date
            "last_access_date",
            "attachment_count",
        ]


class ReportCreationResponseSerializer(serializers.ModelSerializer):
    """Serializer to return just the access_key after a report is created."""
    class Meta:
        model = Report
        fields = ["access_key"]


class ReportAssignmentSerializer(serializers.Serializer):
    """Serializer for validating the report assignment request."""
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_caseworker=True, is_active=True),
        source="assignee",
        write_only=True,
        help_text="The UUID of the caseworker to assign the report to."
    )

    class Meta:
        fields = ["assignee_id"]

    def create(self, validated_data):
        raise NotImplementedError()

    def update(self, instance, validated_data):
        raise NotImplementedError()


# -------------------
# AI Analysis serializers
# -------------------
class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = ["report", "is_spam", "confidence", "analyzed_at", "model_version", "analysis_data"]


# -------------------
# Redaction serializers
# -------------------
class ReportRedactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportRedaction
        fields = ["report", "redactor_user", "reference_id", "redaction_reason"]
        read_only_fields = ["reference_id", "created_at", "updated_at", "redactor_user"]