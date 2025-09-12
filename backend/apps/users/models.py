from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


# Create your models here.
class User(AbstractUser):
    """
    Represents a user in the system with customizable roles.

    This class defines a user model that extends the functionality of AbstractUser
    by introducing user roles and related properties to determine the role-based
    status of the user. It supports assigning roles with default settings and
    provides mechanisms to check the user's role for administrative or investigator
    privileges.
    """
    class Role(models.TextChoices):
        """User roles."""
        ADMIN = "admin", "Administrator"
        INVESTIGATOR = "investigator", "Investigator"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.INVESTIGATOR,
        help_text=_("User's role in the system."),
    )

    @property
    def is_admin(self) -> bool:
        """Check if user is an administrator"""
        return self.role == self.Role.ADMIN

    @property
    def is_investigator(self) -> bool:
        """Check if user is an investigator"""
        return self.role == self.Role.INVESTIGATOR

