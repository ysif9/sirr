import base64
import secrets
from binascii import Error as BinasciiError

from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import AIAnalysis, Attachment, Report, ReportCategory, ReportRedaction, ReportTemplate


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

    This serializer handles the submission of a report encrypted for the system's
    main administrative inbox. It requires the encrypted body, a nonce, and
    a key envelope containing the report key wrapped with the admin public key.

    It validates cryptographic components and is responsible for creating the Report record
    and generating the reporter's `access_key`.
    """
    encrypted_body = serializers.CharField(
        write_only=True,
        help_text="Base64-encoded encrypted report body."
    )
    body_nonce = serializers.CharField(
        write_only=True,
        help_text="Base64-encoded 24-byte XChaCha20 nonce."
    )
    key_envelope = serializers.JSONField(
        help_text="The encrypted report key (K_report) wrapped for the admin public key."
    )
    associated_data = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = Report
        fields = [
            "encrypted_body",
            "body_nonce",
            "key_envelope",
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

    def create(self, validated_data):
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


class ReportListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["id", "status", "priority", "last_access_by_reporter",
                  "expires_at"]


# -------------------
# Attachment serializers
# -------------------
class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id", "report", "file", "key_envelope", "nonce", "description", "checksum", "mime_type",
                  "file_extension"]
        read_only_fields = ["id", "mime_type", "file_extension"]


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
