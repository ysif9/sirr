import uuid

from django.db import models
from django.utils.translation import gettext_lazy as _


class TimestampedModel(models.Model):
    """
    Abstract base class with created and updated timestamps.

    This model provides automatic tracking of when records are created
    and last updated, with database indexing for performance.
    """

    created_at = models.DateTimeField(
        _("Created At"),
        auto_now_add=True,
        db_index=True,
        help_text=_("When this record was created"),
    )
    updated_at = models.DateTimeField(
        _("Updated At"),
        auto_now=True,
        help_text=_("When this record was last updated"),
    )

    class Meta:
        """Metadata options for the TimestampedModel."""

        abstract = True
        ordering = ["-created_at"]


class UUIDModel(models.Model):
    """
    Abstract base class that uses UUID as the primary key.

    This provides better security and distributed system compatibility
    compared to sequential integer IDs.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for this record"),
    )

    class Meta:
        """Metadata options for the UUIDModel."""

        abstract = True

class BaseModel(TimestampedModel, UUIDModel):
    """
    Complete base model with all common functionality.

    Combines timestamps, UUID primary key
    """

    class Meta:
        """Metadata options for the BaseModel."""

        abstract = True
