"""Users models."""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.models import UUIDModel


# Create your models here.
class User(UUIDModel, AbstractUser):
    """Custom user model using UUID as primary key"""
    is_caseworker = models.BooleanField(
        default=False
    )
    public_key_bundle = models.JSONField(
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")