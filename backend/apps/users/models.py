"""Users models."""

from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from apps.common.models import UUIDModel


# Create your models here.
class User(UUIDModel, AbstractUser):
    """Custom user model using UUID as primary key"""

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")



import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone


class Role(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)


class Permission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)


class UserRole(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_roles"
    )
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_users")

    class Meta:
        unique_together = ("user", "role")


class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_permissions")
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name="permission_roles")

    class Meta:
        unique_together = ("role", "permission")


class ReportAssignment(models.Model):
    report = models.ForeignKey("reports.Report", on_delete=models.CASCADE, related_name="assignments")
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assigned_reports"
    )
    assigned_at = models.DateTimeField(default=timezone.now)
    last_access = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("report", "assignee")


class ReportRedaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report = models.ForeignKey("reports.Report", on_delete=models.CASCADE, related_name="redactions")
    redactor_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="redactions"
    )
    reference_id = models.CharField(max_length=255)
    redaction_reason = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
