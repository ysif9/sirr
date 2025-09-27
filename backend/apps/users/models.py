"""Users models."""

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.common.models import BaseModel, UUIDModel


# Create your models here.
class User(UUIDModel, AbstractUser):
    """Custom user model using UUID as primary key"""
    email = models.EmailField(
        _("email address"),
        unique=True,
    )

    is_caseworker = models.BooleanField(default=False)
    public_key_bundle = models.JSONField(null=True, blank=True)
    totp_secret = models.CharField(
        _("TOTP Secret"),
        max_length=255,
        blank=True,
        help_text=_("Encrypted TOTP secret key."),
    )
    onboarding_complete = models.BooleanField(
        _("Onboarding Complete"),
        default=False,
        help_text=_("Indicates if the user has completed the initial onboarding and TOTP setup."),
    )
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def __str__(self):
        return self.username


class OnboardingInvitation(BaseModel):
    """
    Manages single-use, time-bound invitation links for new users to complete
    their onboarding and TOTP setup.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="onboarding_invitation",
        help_text=_("The inactive user this invitation is for."),
    )
    token = models.CharField(
        _("Invitation Token"),
        max_length=64,
        editable=False,
        unique=True,
        help_text=_("The single-use, URL-safe token for the onboarding link."),
    )
    expires_at = models.DateTimeField(
        _("Expires At"), help_text=_("The timestamp when this invitation link expires.")
    )
    used_at = models.DateTimeField(
        _("Used At"),
        null=True,
        blank=True,
        help_text=_("The timestamp when the token was successfully used."),
    )

    def is_expired(self) -> bool:
        """Checks if the invitation has expired."""
        return timezone.now() > self.expires_at

    def __str__(self) -> str:
        return f"Invitation for {self.user.username}"

    class Meta:
        verbose_name = _("Onboarding Invitation")
        verbose_name_plural = _("Onboarding Invitations")
        ordering = ["-created_at"]
