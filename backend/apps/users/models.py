"""Users models."""

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.models import UUIDModel


# Create your models here.
class User(UUIDModel, AbstractUser):
    """Custom user model using UUID as primary key"""
    email = models.EmailField(
        _("email address"),
        unique=True,
    )
    is_caseworker = models.BooleanField(
        default=False
    )
    public_key_bundle = models.JSONField(
        null=True,
        blank=True
    )
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return self.username
