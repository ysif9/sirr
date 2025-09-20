import base64
import secrets
from binascii import Error as BinasciiError
from uuid import UUID

from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.users.models import User
from .models import AIAnalysis, Attachment, Report, ReportAssignment, ReportCategory, ReportRedaction, ReportTemplate


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
# Report serializers
# -------------------

class EncryptedReportSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for submitting a new, end-to-end encrypted report.

    Validates the cryptographic components of the payload, including Base64-encoded
    ciphertext and nonce, and ensures the recipient exists. It is responsible for
    creating the Report record and generating the reporter's `access_key`.
    """
    encrypted_body = serializers.CharField(
        write_only=True,
        help_text="Base64-encoded encrypted report body."
    )
    body_nonce = serializers.CharField(
        write_only=True,
        help_text="Base64-encoded 24-byte XChaCha20 nonce."
    )
    recipient_id = serializers.UUIDField(
        write_only=True,
        help_text="The UUID of the caseworker recipient."
    )

    key_envelope = serializers.JSONField()
    associated_data = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = Report
        fields = [
            "encrypted_body",
            "body_nonce",
            "key_envelope",
            "recipient_id",
            "associated_data",
        ]

    def validate_encrypted_body(self, value: str):
        try:
            return base64.b64decode(value, validate=True)
        except BinasciiError:
            raise ValidationError(_("Invalid Base64 encoding for `encrypted_body`."))

    def validate_body_nonce(self, value: str):
        try:
            decoded_nonce = base64.b64decode(value, validate=True)
        except BinasciiError:
            raise ValidationError(_("Invalid Base64 encoding for `body_nonce`."))

        expected_length = 24  # XChaCha20 nonce length
        if len(decoded_nonce) != expected_length:
            raise ValidationError(
                _("Decoded nonce must be %(expected_length)s bytes long, but received %(received_length)s.")
                % {'expected_length': expected_length, 'received_length': len(decoded_nonce)}
            )
        return decoded_nonce

    def validate_recipient_id(self, value: UUID):
        """Ensure the recipient is a valid, active caseworker."""
        if not User.objects.filter(id=value, is_caseworker=True, is_active=True).exists():
            raise ValidationError(_("A valid recipient (caseworker) with this ID does not exist."))
        return value

    def create(self, validated_data):
        # The `recipient_id` is used for validation only and is not a field on the Report model.
        validated_data.pop("recipient_id", None)

        # Generate a secure, random access key for the user to retrieve their report later.
        validated_data["access_key"] = secrets.token_hex(16)

        return Report.objects.create(**validated_data)


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id",
            "template",
            "access_key",
            "encrypted_body",
            "key_envelope",
            "body_nonce",
            "associated_data",
            "status",
            "score",
            "priority",
            "last_access_by_reporter",
            "expires_at",
        ]
        read_only_fields = ["id", "access_key", "score", "last_access_by_reporter", "expires_at", "created_at",
                            "updated_at"]


# -------------------
# Attachment serializers
# -------------------
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id", "report", "file", "key_envelope", "nonce", "description", "checksum", "mime_type", "file_extension"]
        read_only_fields = ["id", "mime_type", "file_extension"]


# -------------------
# AI Analysis serializers
# -------------------
class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = ["report", "is_spam", "confidence", "analyzed_at", "model_version", "analysis_data"]


# -------------------
# Assignment serializers
# -------------------
class ReportAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportAssignment
        fields = ["report", "assignee", "assigned_at", "last_access"]
        read_only_fields = ["assigned_at", "last_access"]


# -------------------
# Redaction serializers
# -------------------
class ReportRedactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportRedaction
        fields = ["report", "redactor_user", "reference_id", "redaction_reason"]
        read_only_fields = ["reference_id", "created_at", "updated_at", "redactor_user"]