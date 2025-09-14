import uuid
from django.db import models
from django.utils import timezone


class ReportCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent_category = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='subcategories'
    )
    key = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255)
    sort_order = models.IntegerField(default=0)


class ReportTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(ReportCategory, on_delete=models.CASCADE)
    key = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    definition = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(ReportTemplate, on_delete=models.CASCADE)
    access_key = models.CharField(max_length=255, unique=True)
    data = models.JSONField(default=dict)
    status = models.CharField(max_length=255)
    score = models.IntegerField(default=0)
    important = models.BooleanField(default=True)
    last_access_by_reporter = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)


class Attachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="attachments")
    storage_path = models.CharField(max_length=255)
    original_file_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=255)
    file_size = models.BigIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)


class AIAnalysis(models.Model):
    report = models.OneToOneField(Report, on_delete=models.CASCADE, primary_key=True, related_name="analysis")
    is_spam = models.BooleanField(default=False)
    confidence = models.IntegerField(default=0)  # 0–100
    analyzed_at = models.DateTimeField(default=timezone.now)
    model_version = models.CharField(max_length=50, default="v1")
