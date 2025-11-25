import base64
from binascii import Error as BinasciiError

from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.users.models import User

from .models import (
    AIAnalysis,
    Attachment,
    InvestigatorNote,
    Report,
    ReportCategory,
    ReportRedaction,
    ReportTemplate,
    ReporterNote,
)

#Unused import ig
#, ReportPriority
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
    Supports attachments for both reports and reporter notes.
    """
    nonce = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ["id", "report", "reporter_note", "file", "key_envelope", "nonce", "description", "checksum", "mime_type",
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
            "last_access_by_reporter", "expires_at", "created_at", "updated_at",
            "important", "label",
            # Timeline tracking fields
            "assigned_at", "opened_at", "closed_at",
        ]
        read_only_fields = [
            "id", "access_key", "score", "last_access_by_reporter",
            "expires_at", "created_at", "updated_at",
            "assigned_at", "opened_at", "closed_at",
        ]


# -------------------
# AI Analysis serializers
# -------------------
class AIAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAnalysis
        fields = [
            "is_spam",
            "confidence",
            "analyzed_at",
            "model_version",
            "spam_reasoning",
            "urgency",
            "urgency_reasoning",
        ]


class CaseworkerReportSerializer(ReportSerializer):
    """
    A specialized serializer for caseworkers that provides the re-encrypted
    key envelope from their specific report assignment and includes attachment metadata.
    """
    key_envelope = serializers.SerializerMethodField()
    attachments = AttachmentSerializer(many=True, read_only=True)
    analysis = AIAnalysisSerializer(read_only=True, allow_null=True)
    investigator_notes = serializers.SerializerMethodField()
    reporter_notes = serializers.SerializerMethodField()

    class Meta(ReportSerializer.Meta):
        # Explicitly inherit fields and add 'attachments', 'analysis', 'investigator_notes', and 'reporter_notes' for the detail view.
        fields = ReportSerializer.Meta.fields + ["attachments", "analysis", "investigator_notes", "reporter_notes"]
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

    def get_investigator_notes(self, obj: Report) -> list:
        """
        Returns all investigator notes for this report.
        """
        # Use prefetch_related if available, otherwise query
        if hasattr(obj, '_prefetched_objects_cache') and 'investigator_notes' in obj._prefetched_objects_cache:
            notes = obj.investigator_notes.all()
        else:
            notes = obj.investigator_notes.select_related('author').all()
        return InvestigatorNoteSerializer(notes, many=True, context=self.context).data

    def get_reporter_notes(self, obj: Report) -> list:
        """
        Returns all reporter notes for this report.
        """
        # Use prefetch_related if available, otherwise query
        if hasattr(obj, '_prefetched_objects_cache') and 'reporter_notes' in obj._prefetched_objects_cache:
            notes = obj.reporter_notes.all()
        else:
            notes = obj.reporter_notes.all()
        return InvestigatorViewReporterNoteSerializer(notes, many=True, context=self.context).data


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
            # Timeline tracking fields
            "assigned_at",
            "opened_at",
            "closed_at",
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
# Redaction serializers
# -------------------
class ReportRedactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportRedaction
        fields = ["report", "redactor_user", "reference_id", "redaction_reason"]
        read_only_fields = ["reference_id", "created_at", "updated_at", "redactor_user"]


# -------------------
# Investigator Note serializers
# -------------------
class InvestigatorNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for investigator notes on reports.
    Includes author information and timestamps for audit trail.
    """
    author_name = serializers.CharField(source="author.email", read_only=True)

    class Meta:
        model = InvestigatorNote
        fields = [
            "id", "report", "author", "author_name", "content", "is_internal",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "author", "author_name", "created_at", "updated_at"]

    def create(self, validated_data):
        """Automatically set the author to the current user."""
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["author"] = request.user
        return super().create(validated_data)


# -------------------
# Reporter Note serializers
# -------------------
class ReporterNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for reporter notes on reports.
    Allows reporters to add follow-up information to their reports.
    Now supports encrypted attachments via the Attachment model.
    """
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ReporterNote
        fields = [
            "id", "report", "content", "attachments",
            "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class InvestigatorViewReporterNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for reporter notes visible to investigators.
    Read-only view for investigators to see reporter's follow-up notes with encrypted attachments.
    """
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ReporterNote
        fields = (
            'id',
            'content',
            'attachments',
            'created_at',
        )
        read_only_fields = fields


# -------------------
# Followup serializers
# -------------------

class AIAnalysisStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for exposing key AI analysis findings for the reporter dashboard.
    (Used internally by ReportStatusSerializer's priority logic, though
    nested fields are excluded from the final output for anonymity.)
    """
    # Translate internal urgency choice to a readable string
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)

    class Meta:
        model = AIAnalysis
        fields = (
            'urgency',
            'urgency_display',
            'confidence',
            'analyzed_at'
        )
        read_only_fields = fields


class ExternalInvestigatorNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for investigator notes visible to reporters.
    Only includes external notes (is_internal=False).
    """
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = InvestigatorNote
        fields = (
            'id',
            'content',
            'author_name',
            'created_at',
        )
        read_only_fields = fields

    def get_author_name(self, obj: InvestigatorNote) -> str:
        """Return the author's full name or email."""
        if obj.author.first_name and obj.author.last_name:
            return f"{obj.author.first_name} {obj.author.last_name}"
        return obj.author.email


class ExternalReporterNoteSerializer(serializers.ModelSerializer):
    """
    Serializer for reporter notes visible to reporters on the follow-up page.
    Includes encrypted attachments with decryption metadata.
    """
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ReporterNote
        fields = (
            'id',
            'content',
            'attachments',
            'created_at',
        )
        read_only_fields = fields


class ReportStatusSerializer(serializers.ModelSerializer):
    """
    Main serializer for the anonymous report follow-up page.
    Returns only essential status information concerning the reporter
    (status, priority, timeline details, external notes, and reporter notes).
    """
    # 1. Status: Translate internal status (e.g., 'new') to display value (e.g., 'New')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    # 2. Priority: Use a method field to determine the displayed priority,
    # overriding the manual priority with the AI urgency for a clearer message.
    priority_display = serializers.SerializerMethodField()

    # 3. Include raw status and priority for frontend logic
    status = serializers.CharField(read_only=True)
    priority = serializers.CharField(read_only=True)

    # 4. External investigator notes (only non-internal notes)
    investigator_notes = serializers.SerializerMethodField()

    # 5. Reporter notes
    reporter_notes = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = (
            'id',
            'access_key',
            'status',
            'status_display',
            'priority',
            'priority_display',
            'created_at',
            'last_access_by_reporter',
            'assigned_at',
            'opened_at',
            'closed_at',
            'investigator_notes',
            'reporter_notes',
        )
        read_only_fields = fields

    def get_priority_display(self, obj: Report) -> str:
        """
        Determines the priority string shown to the reporter.
        Prioritizes the AI urgency if available, otherwise uses the manual priority.
        """
        try:
            # Check if AI analysis exists and if it flagged the report as high urgency
            # Assumes ReportPriority is available (HIGH, CRITICAL)
            # You must ensure the Report instance is fetched with its related analysis
            if obj.analysis.urgency in ['high', 'critical']:
                # Provide a clear, actionable message for the reporter
                return "High Urgency Tip - Active Follow-up Recommended"

            # Otherwise, use the manually set priority's display value
            return obj.get_priority_display()

        except AttributeError:
            # Handle cases where the 'analysis' relation is missing (e.g., no AI run yet)
            return obj.get_priority_display()
        except Exception:
            # Fallback for any other error
            return obj.get_priority_display()

    def get_investigator_notes(self, obj: Report) -> list:
        """
        Returns only external investigator notes (is_internal=False).
        Notes are ordered by creation date (newest first).
        """
        external_notes = obj.investigator_notes.filter(is_internal=False).order_by('-created_at')
        return ExternalInvestigatorNoteSerializer(external_notes, many=True).data

    def get_reporter_notes(self, obj: Report) -> list:
        """
        Returns all reporter notes for this report.
        Notes are ordered by creation date (newest first).
        """
        reporter_notes = obj.reporter_notes.all().order_by('-created_at')
        return ExternalReporterNoteSerializer(reporter_notes, many=True, context=self.context).data


