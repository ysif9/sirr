"""
Django models for the reporting system.

This module contains all database models related to report management, including:
- Report categories and templates for organizing report types
- Reports with attachments, AI analysis, and workflow management
- User assignments and content redaction capabilities
"""
import mimetypes
import os

from django.conf import settings
from django.core.validators import (
    FileExtensionValidator,
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.models import BaseModel


class ReportStatus(models.TextChoices):
    """Report status choices."""
    SUBMITTED = "submitted", _("Submitted")
    UNDER_REVIEW = "under review", _("Under Review")
    APPROVED = "approved", _("Approved")
    REJECTED = "rejected", _("Rejected")
    CLOSED = "closed", _("Closed")


class ReportPriority(models.TextChoices):
    """Report priority choices."""
    LOW = "low", _("Low")
    MEDIUM = "medium", _("Medium")
    HIGH = "high", _("High")
    URGENT = "urgent", _("Urgent")


def attachment_upload_path(instance: "Attachment", filename: str) -> str:
    """Generate upload path: attachments/reports/{report_id}/{filename}"""
    return f"attachments/reports/{instance.report.id}/{filename}"


class ReportCategory(BaseModel):
    """Hierarchical categorization system for organizing report types."""
    parent_category = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="subcategories"
    )
    key = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255)
    sort_order = models.IntegerField(default=0)

    def __str__(self) -> str:
        return self.title

    class Meta:
        verbose_name = _("Report Category")
        verbose_name_plural = _("Report Categories")


class ReportTemplate(BaseModel):
    """Template definitions for different types of reports."""
    category = models.ForeignKey(ReportCategory, on_delete=models.CASCADE)
    key = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    definition = models.JSONField(default=dict)

    def __str__(self) -> str:
        return self.title

    class Meta:
        verbose_name = _("Report Template")
        verbose_name_plural = _("Report Templates")


class Report(BaseModel):
    """
    Main report entity containing submitted data and workflow state.

    Represents individual reports submitted using templates, with full
    lifecycle management including status tracking, expiration, scoring,
    and priority assignment. The report body is stored as end-to-end
    encrypted ciphertext.
    """
    template = models.ForeignKey(ReportTemplate, on_delete=models.SET_NULL, related_name="reports", null=True,
                                 blank=True)
    access_key = models.CharField(max_length=255, unique=True)

    encrypted_body = models.BinaryField(help_text=_("The raw ciphertext of the report."), null=True, blank=True)
    key_envelope = models.JSONField(
        help_text=_("The encrypted report key (K_report) and the reporter's ephemeral public key."),
        null=True, blank=True
    )
    body_nonce = models.BinaryField(help_text=_("The 24-byte XChaCha20 nonce used for encrypting the report body."), null=True, blank=True)
    associated_data = models.JSONField(
        default=dict,
        help_text=_("Non-secret, integrity-protected metadata (e.g., report type, coarse timestamp).")
    )

    status = models.CharField(max_length=50, choices=ReportStatus.choices, default=ReportStatus.SUBMITTED)
    score = models.IntegerField(default=0)
    priority = models.CharField(max_length=50, choices=ReportPriority.choices, default=ReportPriority.MEDIUM)
    last_access_by_reporter = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    @property
    def is_expired(self) -> bool:
        """Check if the report has expired."""
        if self.expires_at is None:
            return False
        return timezone.now() > self.expires_at

    def __str__(self) -> str:
        return f"Report {self.id}"

    class Meta:
        verbose_name = _("Report")
        verbose_name_plural = _("Reports")


class Attachment(BaseModel):
    """
    File attachments associated with reports.

    Manages uploaded files linked to reports with metadata tracking,
    file validation, and automatic cleanup. The file content is stored
    as end-to-end encrypted ciphertext.
    """
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(
        upload_to=attachment_upload_path,
        help_text=_("The encrypted file content (ciphertext)."),
        validators=[
            FileExtensionValidator(
                allowed_extensions=[
                    "pdf",
                    "doc",
                    "docx",
                    "txt",
                    "jpg",
                    "jpeg",
                    "png",
                    "gif",
                    "mp4",
                    "mov",
                ]
            )
        ],
    )
    key_envelope = models.JSONField(
        help_text=_("The encrypted attachment key (K_attach_i)."),
        null=True, blank=True
    )
    nonce = models.BinaryField(
        help_text=_("The unique nonce for the attachment's encryption."),
        null=True, blank=True
    )
    description = models.TextField(blank=True)
    checksum = models.CharField(
        max_length=64,
        blank=True,
        help_text=_("The SHA-256 hash of the encrypted file content (ciphertext)."),
        null=True
    )

    @property
    def mime_type(self) -> str | None:
        """Get MIME type based on file extension"""
        if self.file:
            mime_type, _ = mimetypes.guess_type(self.file.name)
            return mime_type or "application/octet-stream"
        return None

    @property
    def file_extension(self) -> str:
        """Get file extension"""
        if self.file:
            return os.path.splitext(self.file.name)[1].lower()
        return ""

    def __str__(self) -> str:
        return f"Attachment {self.id}"

    class Meta:
        verbose_name = _("Attachment")
        verbose_name_plural = _("Attachments")


class AIAnalysis(models.Model):
    """
    AI-powered analysis results for reports, primarily for spam detection.

    Stores results from automated AI analysis of reports, including spam
    detection confidence scores, model versioning, and detailed analysis
    data for audit and improvement purposes.
    """
    report = models.OneToOneField(Report, on_delete=models.CASCADE, primary_key=True, related_name="analysis")
    is_spam = models.BooleanField(default=False, help_text=_("Whether the report is spam."))
    confidence = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    analyzed_at = models.DateTimeField(auto_now_add=True)
    spam_reasoning = models.TextField(blank=True, help_text=_("The reasoning behind the spam prediction."))
    urgency = models.CharField(max_length=50, choices=ReportPriority.choices, default=ReportPriority.MEDIUM, help_text=_("The urgency of the report for criminal investigation."))
    urgency_reasoning = models.TextField(blank=True, help_text=_("The reasoning behind the urgency prediction."))
    model_version = models.CharField(max_length=10, default="v1")

    def __str__(self) -> str:
        return f"AI Analysis for Report {self.report.id}"

    class Meta:
        verbose_name = _("AI Analysis")
        verbose_name_plural = _("AI Analyses")


class ReportAssignment(models.Model):
    """
    User assignment tracking for reports in the workflow system.

    Manages assignment of reports to users for review and processing,
    with tracking of assignment history, access patterns, and active
    status. Supports multiple assignments per report over time.
    """
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="assignments")
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assigned_reports")
    assigned_at = models.DateTimeField(auto_now_add=True)
    last_access = models.DateTimeField(null=True, blank=True)
    key_envelope = models.JSONField(
        null=True,
        blank=True,
        help_text=_("The re-encrypted report key (K_report) for the assigned investigator.")
    )

    class Meta:
        verbose_name = _("Report Assignment")
        verbose_name_plural = _("Report Assignments")
        unique_together = ("report", "assignee")
        indexes = [
            models.Index(fields=["assignee"]),
        ]


class ReportRedaction(BaseModel):
    """
    Content redaction records for privacy and legal compliance.

    Tracks redaction of sensitive information from reports, maintaining
    audit trails of what was redacted, when, by whom, and why. Supports
    field-level redaction with original value preservation for authorized
    users.
    """
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="redactions")
    redactor_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="redactions")
    reference_id = models.CharField(max_length=255)
    redaction_reason = models.TextField()

    class Meta:
        verbose_name = _("Report Redaction")
        verbose_name_plural = _("Report Redactions")
